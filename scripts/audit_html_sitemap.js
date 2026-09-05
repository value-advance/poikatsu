// ユーザー向けHTMLサイトマップ(/pages/sitemap)の監査。
// 検索エンジン向けXMLサイトマップ(sitemap.xml, audit_sitemap.js)とは別物。
//
// 目的:
//   1. /pages/sitemap 内の内部リンクがすべて実在し、canonicalと一致し、
//      リダイレクト/.html旧URL/noindexを含んでいないかを確認する。
//   2. header.html(全ページ共通ナビ)が持つ「主要カテゴリ」の2リストが、
//      /pages/sitemap にも掲載されているか(掲載漏れが無いか)を確認する。
//      → トップページに新カテゴリを追加したのにサイトマップだけ更新し忘れる、
//        という事故をここで検出する。
//   3. pages/category/*.html の実ファイルが、すべて /pages/sitemap から
//      たどれる状態になっているかを確認する(カテゴリページ追加漏れ防止)。
//
// /pages/sitemap 自体は手動管理のHTMLのまま(無理な自動生成はしない)で、
// このスクリプトは「生成」ではなく「突き合わせ」だけを行う。
//
// 単体実行: node scripts/audit_html_sitemap.js
// audit_articles.js からは runHtmlSitemapAudit() として呼び出される。
const fs = require("fs");
const path = require("path");
const {
  root,
  pagesDir,
  SITE_ORIGIN,
  extractCanonical,
  extractRobotsNoindex,
  listCategoryFiles,
} = require("./lib/site-data");

const SITEMAP_PAGE_PATH = path.join(pagesDir, "sitemap.html");
const HEADER_PATH = path.join(root, "includes", "header.html");

// サイト情報(about/company/privacy/contact)は、noindexのページ(例:会社概要)を
// 意図的に含む場合がある。これはXMLサイトマップには載せないが、人間向けの
// ナビゲーションとしては正しい状態のため、このセクションのみnoindexチェックの対象外とする。
const NOINDEX_EXEMPT_SECTIONS = new Set(["サイト情報"]);

// company(会社概要)・search(サイト内検索)は、既存実装で意図的に
// noindex,nofollow かつ canonicalタグ自体を持たないページ(検索結果ページは
// クエリごとに内容が変わるため、会社概要は方針としてnoindexにされている)。
// この2ページは監査対象外の既知の例外として扱う。canonical/noindexルールを
// 今回変更する対象ではないため、ここで新たに書き換えることはしない。
const CANONICAL_AND_NOINDEX_EXEMPT_HREFS = new Set(["search", "company"]);

function readFile(p) {
  return fs.readFileSync(p, "utf8");
}

// メインコンテンツを <h2 class="section-title"> ごとのセクションに分割する。
function splitIntoSections(mainHtml) {
  const sections = [];
  const re = /<h2 class="section-title">([^<]*)<\/h2>/g;
  const marks = [];
  let m;
  while ((m = re.exec(mainHtml))) marks.push({ title: m[1], index: m.index, end: re.lastIndex });
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].end;
    const end = i + 1 < marks.length ? marks[i + 1].index : mainHtml.length;
    sections.push({ title: marks[i].title, body: mainHtml.slice(start, end) });
  }
  return sections;
}

function extractLinks(html) {
  const links = [];
  const re = /<a (?:class="[^"]*" )?href="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) links.push(m[1]);
  return links;
}

// pages/sitemap.html からの相対href("category/foo", "articles/", "../", "../#feature" 等)を
// 実ファイルパスと「あるべきcanonical URL」に解決する。ホームページのアンカーリンク(../#...)は
// 個別ページではないため null を返す。
function resolveHref(href) {
  if (href === "../") {
    return { filePath: path.join(root, "index.html"), expectedCanonical: `${SITE_ORIGIN}/` };
  }
  if (href.startsWith("../#")) {
    return null; // ホームページ内のアンカー。個別ページとしては扱わない。
  }
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return { external: true, href };
  }
  let rel = href;
  let urlSuffix = href;
  if (rel.endsWith("/")) {
    rel += "index";
  }
  const filePath = path.join(pagesDir, `${rel}.html`);
  const expectedCanonical = `${SITE_ORIGIN}/pages/${urlSuffix}`;
  return { filePath, expectedCanonical };
}

function auditLinks(sections) {
  const problems = {
    notFound: [],
    canonicalMismatch: [],
    htmlSuffix: [],
    noindex: [],
    external: [],
  };
  const seen = new Map(); // href -> [sectionTitle]

  for (const section of sections) {
    const links = extractLinks(section.body);
    for (const href of links) {
      if (!seen.has(href)) seen.set(href, []);
      seen.get(href).push(section.title);

      if (href.endsWith(".html")) problems.htmlSuffix.push({ href, section: section.title });

      const resolved = resolveHref(href);
      if (!resolved) continue; // アンカーリンクはスキップ
      if (resolved.external) {
        problems.external.push({ href, section: section.title });
        continue;
      }
      if (!fs.existsSync(resolved.filePath)) {
        problems.notFound.push({ href, section: section.title, filePath: resolved.filePath });
        continue;
      }
      if (CANONICAL_AND_NOINDEX_EXEMPT_HREFS.has(href)) continue;
      const content = readFile(resolved.filePath);
      const canonical = extractCanonical(content);
      if (canonical !== resolved.expectedCanonical) {
        problems.canonicalMismatch.push({ href, section: section.title, canonical, expected: resolved.expectedCanonical });
      }
      const noindex = extractRobotsNoindex(content);
      if (noindex && !NOINDEX_EXEMPT_SECTIONS.has(section.title)) {
        problems.noindex.push({ href, section: section.title });
      }
    }
  }

  // 重複リンクの検出。パンくず(breadcrumb)の「ホーム」は独立した要素であり意図的な重複なので、
  // 本文中(セクション)側だけを対象にする。1つのhrefが複数セクションにまたがって出現した場合、
  // または同一セクション内で2回以上出現した場合を対象とする。
  const duplicates = [];
  for (const [href, sectionTitles] of seen.entries()) {
    if (sectionTitles.length > 1) duplicates.push({ href, sections: sectionTitles });
  }

  return { problems, duplicates };
}

// header.html(全ページ共通ナビ)の「各サービスを徹底比較!」「ポイントが貯まるサービスを探す」
// の2リストを、開発者が手を入れるたびに更新する“主要カテゴリの正”として読み取る。
function readHeaderCategoryLists() {
  const html = readFile(HEADER_PATH);
  const sectionRe = /<p class="site-nav__section-title">([^<]*)<\/p>\s*<ul class="site-nav__category-list">([\s\S]*?)<\/ul>/g;
  const lists = {};
  let m;
  while ((m = sectionRe.exec(html))) {
    const title = m[1];
    const hrefs = [];
    const hrefRe = /<a href="([^"]+)"/g;
    let hm;
    while ((hm = hrefRe.exec(m[2]))) hrefs.push(hm[1]);
    lists[title] = hrefs;
  }
  return lists;
}

// header.htmlの絶対パス形式("/pages/category/foo")を、pages/sitemap.html内で
// 使われている相対href形式("category/foo")に変換して比較できるようにする。
function toRelativeFromPages(absoluteHref) {
  return absoluteHref.replace(/^\/pages\//, "");
}

function runHtmlSitemapAudit() {
  console.log("=== HTML SITEMAP AUDIT (/pages/sitemap) ===");

  if (!fs.existsSync(SITEMAP_PAGE_PATH)) {
    console.error("FAIL: pages/sitemap.html が見つかりません。");
    return false;
  }

  const html = readFile(SITEMAP_PAGE_PATH);
  const mainStart = html.indexOf("<main>");
  const mainEnd = html.indexOf("</main>");
  const mainHtml = html.slice(mainStart, mainEnd);
  const sections = splitIntoSections(mainHtml);

  console.log("検出セクション:", sections.map(s => s.title).join(" / "));

  const { problems, duplicates } = auditLinks(sections);

  const report = (label, list, formatter) => {
    console.log(`${label}: ${list.length}`);
    list.forEach(item => console.log("  ", formatter(item)));
    return list.length === 0;
  };

  console.log("");
  let ok = true;
  ok = report("404リンク(実体なし)", problems.notFound, x => `${x.href} (section: ${x.section})`) && ok;
  ok = report("旧.html URL", problems.htmlSuffix, x => `${x.href} (section: ${x.section})`) && ok;
  ok = report("canonical不一致", problems.canonicalMismatch, x => `${x.href} => canonical=${x.canonical} expected=${x.expected} (section: ${x.section})`) && ok;
  ok = report("noindexリンク混入", problems.noindex, x => `${x.href} (section: ${x.section})`) && ok;
  ok = report("外部/絶対URL(想定外)", problems.external, x => `${x.href} (section: ${x.section})`) && ok;

  // 重複: セクションをまたぐ重複、または同一セクション内の重複のみを問題として報告する。
  console.log("");
  console.log("意図しない重複リンク:", duplicates.length);
  duplicates.forEach(d => console.log("  ", d.href, "in", d.sections.join(", ")));
  ok = duplicates.length === 0 && ok;

  // --- トップページ(header.html)の主要カテゴリ2リストとの同期監査 -------------
  const headerLists = readHeaderCategoryLists();
  const compareSection = sections.find(s => s.title === "比較・カテゴリから探す");
  const compareLinks = new Set(compareSection ? extractLinks(compareSection.body) : []);
  const servicesSection = sections.find(s => s.title === "ポイントが貯まるサービスを探す");
  const servicesLinks = new Set(servicesSection ? extractLinks(servicesSection.body) : []);

  const headerCompareHrefs = (headerLists["各サービスを徹底比較!"] || []).map(toRelativeFromPages);
  const headerServiceHrefs = (headerLists["ポイントが貯まるサービスを探す"] || []).map(toRelativeFromPages);

  const missingCompare = headerCompareHrefs.filter(h => !compareLinks.has(h));
  const missingServices = headerServiceHrefs.filter(h => !servicesLinks.has(h));

  console.log("");
  console.log("ヘッダー「各サービスを徹底比較!」カテゴリ数:", headerCompareHrefs.length);
  console.log("サイトマップ「比較・カテゴリから探す」掲載漏れ:", missingCompare.length, missingCompare);
  console.log("ヘッダー「ポイントが貯まるサービスを探す」カテゴリ数:", headerServiceHrefs.length);
  console.log("サイトマップ「ポイントが貯まるサービスを探す」掲載漏れ:", missingServices.length, missingServices);
  const topCategorySyncOk = missingCompare.length === 0 && missingServices.length === 0;
  console.log("トップ主要カテゴリ同期:", topCategorySyncOk ? "PASS" : "FAIL");
  ok = topCategorySyncOk && ok;

  // --- pages/category/*.html 実体との同期監査 ---------------------------------
  // 「サイトマップからたどれるカテゴリURL」の集合を、ページ全体(比較セクション+
  // サービスセクション)から作り、実際に存在するカテゴリファイルと突き合わせる。
  const allSitemapCategoryHrefs = new Set(
    [...compareLinks, ...servicesLinks].filter(h => h.startsWith("category/"))
  );
  const categoryFiles = listCategoryFiles();
  const missingCategoryFiles = categoryFiles.filter(f => {
    const slug = f.replace(/\.html$/, "");
    return !allSitemapCategoryHrefs.has(`category/${slug}`);
  });
  console.log("");
  console.log("実在するカテゴリページ数:", categoryFiles.length);
  console.log("サイトマップに掲載漏れのカテゴリページ:", missingCategoryFiles.length, missingCategoryFiles);
  const categorySyncOk = missingCategoryFiles.length === 0;
  console.log("カテゴリ実体同期:", categorySyncOk ? "PASS" : "FAIL");
  ok = categorySyncOk && ok;

  console.log("");
  console.log(ok ? "OK: HTMLサイトマップ監査はすべてPASSしました。" : "FAIL: HTMLサイトマップ監査で問題が見つかりました。上記を確認してください。");
  return ok;
}

if (require.main === module) {
  const ok = runHtmlSitemapAudit();
  process.exit(ok ? 0 : 1);
}

module.exports = { runHtmlSitemapAudit };
