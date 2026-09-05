// サイトマップの監査。generate_sitemap.js を実行して repo に書き込む代わりに、
// 「今 repo に保存されているサイトマップ4ファイル」を、実データから生成した
// 「あるべき内容」と突き合わせて検証する。ズレがあれば、CIを含めFAILさせる
// (このスクリプト自身はファイルを一切書き換えない)。
//
// 単体実行: node scripts/audit_sitemap.js
// audit_articles.js からは runSitemapAudit() として呼び出される。
const fs = require("fs");
const path = require("path");
const {
  root,
  SITE_ORIGIN,
  listArticles,
  listCategories,
} = require("./lib/site-data");
const { SITEMAP_FILES, isWellFormedXml, buildSitemaps } = require("./lib/sitemap");

function readFileIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
}

// <url><loc>...</loc>(<lastmod>...</lastmod>)?</url> を抽出する、この
// 生成ロジック専用の単純なパーサ(依存ライブラリなしで十分な範囲)。
function parseUrlset(xml) {
  const entries = [];
  const re = /<url>\s*<loc>([^<]*)<\/loc>\s*(?:<lastmod>([^<]*)<\/lastmod>\s*)?<\/url>/g;
  let m;
  while ((m = re.exec(xml))) entries.push({ loc: m[1], lastmod: m[2] || null });
  return entries;
}

function parseSitemapIndex(xml) {
  const locs = [];
  const re = /<sitemap>\s*<loc>([^<]*)<\/loc>\s*<\/sitemap>/g;
  let m;
  while ((m = re.exec(xml))) locs.push(m[1]);
  return locs;
}

function runSitemapAudit() {
  const problems = [];
  const note = (label, count, extra) => {
    console.log(`${label}: ${count}${extra ? "  " + extra : ""}`);
    return count === 0;
  };

  console.log("=== SITEMAP AUDIT ===");

  // --- 1. 「生成忘れ」検出: 実データから今生成した内容と、repoに保存されている
  //         内容が一致しているか。ここが不一致なら generate_sitemap.js の実行漏れ。
  const expected = buildSitemaps();
  const onDisk = {};
  let allFilesExist = true;
  for (const fileName of Object.values(SITEMAP_FILES)) {
    const content = readFileIfExists(path.join(root, fileName));
    onDisk[fileName] = content;
    if (content === null) {
      allFilesExist = false;
      console.log(`MISSING FILE: ${fileName}`);
    }
  }

  let staleFiles = [];
  if (allFilesExist) {
    for (const fileName of Object.values(SITEMAP_FILES)) {
      if (onDisk[fileName] !== expected.files[fileName]) staleFiles.push(fileName);
    }
  }

  let generationOk = allFilesExist && staleFiles.length === 0;
  console.log("");
  console.log("生成内容とrepo保存内容の一致:", generationOk ? "PASS" : "FAIL");
  if (!generationOk) {
    console.error("ERROR:");
    console.error("サイトマップが最新状態ではありません。");
    console.error("");
    console.error("実行してください:");
    console.error("  node scripts/generate_sitemap.js");
    if (staleFiles.length) console.error("差分があるファイル:", staleFiles.join(", "));
  }
  problems.push(!generationOk);

  // --- 2. XML妥当性(repoに実際に保存されている中身を検証する) ---------------
  console.log("");
  let xmlOk = true;
  for (const fileName of Object.values(SITEMAP_FILES)) {
    const content = onDisk[fileName];
    if (content === null) { xmlOk = false; continue; }
    if (!isWellFormedXml(content)) {
      xmlOk = false;
      console.log(`XML不正: ${fileName}`);
    }
  }
  console.log("サイトマップXML:", xmlOk ? "PASS" : "FAIL");
  problems.push(!xmlOk);

  if (!allFilesExist || !xmlOk) {
    // 以降の詳細チェックはパース前提のため、壊れている場合はここで打ち切る。
    console.log("\nFAIL: サイトマップファイルが存在しないか、XMLとして不正です。");
    return false;
  }

  const indexLocs = parseSitemapIndex(onDisk[SITEMAP_FILES.index]);
  const articleEntries = parseUrlset(onDisk[SITEMAP_FILES.articles]);
  const categoryEntries = parseUrlset(onDisk[SITEMAP_FILES.categories]);
  const pageEntries = parseUrlset(onDisk[SITEMAP_FILES.pages]);
  const allEntries = [...articleEntries, ...categoryEntries, ...pageEntries];

  // --- 3. sitemap.xml が3ファイルを正しく参照しているか -----------------------
  const expectedIndexLocs = [SITEMAP_FILES.articles, SITEMAP_FILES.categories, SITEMAP_FILES.pages].map(
    f => `${SITE_ORIGIN}/${f}`
  );
  const indexOk = expectedIndexLocs.every(l => indexLocs.includes(l)) && indexLocs.length === expectedIndexLocs.length;
  console.log("");
  console.log("サイトマップ掲載URL総数:", allEntries.length);
  console.log("  記事URL数:", articleEntries.length);
  console.log("  カテゴリURL数:", categoryEntries.length);
  console.log("  その他URL数:", pageEntries.length);
  console.log("sitemap.xml(インデックス)の参照先:", indexOk ? "PASS" : "FAIL");
  problems.push(!indexOk);

  // --- 4. URL重複 -------------------------------------------------------------
  const locCounts = {};
  allEntries.forEach(e => { locCounts[e.loc] = (locCounts[e.loc] || 0) + 1; });
  const dupeLocs = Object.entries(locCounts).filter(([, c]) => c > 1).map(([loc]) => loc);
  problems.push(!note("URL重複", dupeLocs.length, dupeLocs.length ? JSON.stringify(dupeLocs) : ""));

  // --- 5. 非HTTPS / 別ドメイン --------------------------------------------------
  const nonHttps = allEntries.filter(e => !e.loc.startsWith("https://"));
  problems.push(!note("非HTTPS URL", nonHttps.length, nonHttps.length ? JSON.stringify(nonHttps.map(e => e.loc)) : ""));
  const otherDomain = allEntries.filter(e => e.loc.startsWith("https://") && !e.loc.startsWith(SITE_ORIGIN + "/"));
  problems.push(!note("別ドメインURL", otherDomain.length, otherDomain.length ? JSON.stringify(otherDomain.map(e => e.loc)) : ""));

  // --- 6. .html重複URL(canonicalは拡張子なしが正であるこのサイトの規約) -------
  const htmlSuffixed = allEntries.filter(e => e.loc.endsWith(".html"));
  problems.push(!note(".html重複URL", htmlSuffixed.length, htmlSuffixed.length ? JSON.stringify(htmlSuffixed.map(e => e.loc)) : ""));

  // --- 7. クエリ文字列・フラグメント付きURL ------------------------------------
  const withQueryOrFragment = allEntries.filter(e => e.loc.includes("?") || e.loc.includes("#"));
  problems.push(!note("クエリ/フラグメント付きURL", withQueryOrFragment.length, withQueryOrFragment.length ? JSON.stringify(withQueryOrFragment.map(e => e.loc)) : ""));

  // --- 8. canonical不一致・noindex混入・記事/カテゴリの未登録・lastmod不一致 ---
  const articles = listArticles();
  const articleBySlug = {};
  articles.forEach(a => { articleBySlug[a.slug] = a; });
  const sitemapArticleLocs = new Set(articleEntries.map(e => e.loc));
  const sitemapArticleLastmodByLoc = {};
  articleEntries.forEach(e => { sitemapArticleLastmodByLoc[e.loc] = e.lastmod; });

  const canonicalMismatches = [];
  const noindexIncluded = [];
  const missingArticles = [];
  const lastmodMismatches = [];
  for (const a of articles) {
    const expectedCanonical = `${SITE_ORIGIN}${a.href}`;
    if (a.canonical !== expectedCanonical) canonicalMismatches.push({ slug: a.slug, canonical: a.canonical, expected: expectedCanonical });
    if (a.noindex && sitemapArticleLocs.has(a.canonical)) noindexIncluded.push(a.slug);
    if (!a.noindex && a.canonical === expectedCanonical) {
      if (!sitemapArticleLocs.has(a.canonical)) {
        missingArticles.push(a.slug);
      } else if (sitemapArticleLastmodByLoc[a.canonical] !== a.lastmod) {
        lastmodMismatches.push({ slug: a.slug, expected: a.lastmod, actual: sitemapArticleLastmodByLoc[a.canonical] });
      }
    }
  }

  const categories = listCategories();
  const sitemapCategoryLocs = new Set(categoryEntries.map(e => e.loc));
  const missingCategories = [];
  for (const c of categories) {
    const expectedCanonical = `${SITE_ORIGIN}${c.href}`;
    if (c.canonical !== expectedCanonical) canonicalMismatches.push({ slug: c.slug, canonical: c.canonical, expected: expectedCanonical });
    if (!c.noindex && c.canonical === expectedCanonical && !sitemapCategoryLocs.has(c.canonical)) {
      missingCategories.push(c.slug);
    }
    if (c.noindex && sitemapCategoryLocs.has(c.canonical)) noindexIncluded.push(c.slug);
  }

  console.log("");
  problems.push(!note("canonical不一致", canonicalMismatches.length, canonicalMismatches.length ? JSON.stringify(canonicalMismatches) : ""));
  problems.push(!note("noindex URL混入", noindexIncluded.length, noindexIncluded.length ? JSON.stringify(noindexIncluded) : ""));
  problems.push(!note("記事のサイトマップ未登録", missingArticles.length, missingArticles.length ? JSON.stringify(missingArticles) : ""));
  problems.push(!note("カテゴリのサイトマップ未登録", missingCategories.length, missingCategories.length ? JSON.stringify(missingCategories) : ""));
  problems.push(!note("lastmod不一致", lastmodMismatches.length, lastmodMismatches.length ? JSON.stringify(lastmodMismatches) : ""));

  // --- 9. サイトマップにあるが実体が無い(削除済み・リダイレクト元の残存) -------
  const articleSlugSet = new Set(articles.map(a => a.href));
  const staleArticleUrls = articleEntries
    .map(e => e.loc)
    .filter(loc => loc.startsWith(SITE_ORIGIN + "/pages/articles/"))
    .filter(loc => {
      const hrefPart = loc.slice(SITE_ORIGIN.length);
      return !articleSlugSet.has(hrefPart);
    });
  problems.push(!note("存在しない記事URL(削除済み・リダイレクト元残存の疑い)", staleArticleUrls.length, staleArticleUrls.length ? JSON.stringify(staleArticleUrls) : ""));

  const categoryHrefSet = new Set(categories.map(c => c.href));
  const staleCategoryUrls = categoryEntries
    .map(e => e.loc)
    .filter(loc => loc.startsWith(SITE_ORIGIN + "/pages/category/"))
    .filter(loc => {
      const hrefPart = loc.slice(SITE_ORIGIN.length);
      return !categoryHrefSet.has(hrefPart);
    });
  problems.push(!note("存在しないカテゴリURL", staleCategoryUrls.length, staleCategoryUrls.length ? JSON.stringify(staleCategoryUrls) : ""));

  // --- 10. robots.txt --------------------------------------------------------
  const robotsPath = path.join(root, "robots.txt");
  const robotsTxt = readFileIfExists(robotsPath) || "";
  const sitemapDirectives = (robotsTxt.match(/^Sitemap:\s*(.+)$/gim) || []);
  const hasRootSitemapDirective = sitemapDirectives.some(l => l.replace(/^Sitemap:\s*/i, "").trim() === `${SITE_ORIGIN}/sitemap.xml`);
  const disallowRules = (robotsTxt.match(/^Disallow:\s*(.*)$/gim) || []).map(l => l.replace(/^Disallow:\s*/i, "").trim()).filter(Boolean);
  const blockedSitemapFiles = Object.values(SITEMAP_FILES).filter(f => disallowRules.some(rule => `/${f}`.startsWith(rule)));
  const robotsOk = hasRootSitemapDirective && sitemapDirectives.length <= 1 && blockedSitemapFiles.length === 0;
  console.log("");
  console.log("robots.txtにSitemap指定あり(1件):", hasRootSitemapDirective && sitemapDirectives.length <= 1 ? "PASS" : "FAIL", `(検出${sitemapDirectives.length}件)`);
  console.log("robots.txtでサイトマップがブロックされていない:", blockedSitemapFiles.length === 0 ? "PASS" : "FAIL", blockedSitemapFiles.length ? JSON.stringify(blockedSitemapFiles) : "");
  problems.push(!robotsOk);

  const ok = !problems.some(Boolean);
  console.log("");
  console.log(ok ? "OK: サイトマップ監査はすべてPASSしました。" : "FAIL: サイトマップ監査で問題が見つかりました。上記を確認してください。");
  return ok;
}

if (require.main === module) {
  const ok = runSitemapAudit();
  process.exit(ok ? 0 : 1);
}

module.exports = { runSitemapAudit };
