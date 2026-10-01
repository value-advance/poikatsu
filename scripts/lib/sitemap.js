// サイトマップ(sitemap.xml = サイトマップインデックス + 子サイトマップ)を「実際のHTMLファイル」から
// 生成するロジック本体。generate_sitemap.js(書き込み)と audit_sitemap.js(生成せず比較のみ)の
// 両方がここを共有することで、「生成されるべき内容」と「監査が期待する内容」が常に同一の実装になる。
//
// 掲載の判定(手書きのURL配列は持たない):
//   ・HTMLファイルが実在する(削除・統合した記事はファイルが無くなるので自動的に消える)
//   ・canonical が自分自身のURLを指している
//   ・<meta name="robots"> が noindex ではない
//   ・scripts/redirects.json に載っているリダイレクト元URLではない
// lastmod は「ページに表示している更新日(無ければ作成日)」を使い、生成した日付は使わない。
const fs = require("fs");
const path = require("path");
const {
  root,
  SITE_ORIGIN,
  dotDateToDash,
  listArticles,
  readArticleHubPage,
  listCategories,
  listTopLevelPages,
  listBeginnerPages,
  readHomePage,
  extractCardOrder,
  normalizePathKey,
  loadRedirects,
} = require("./site-data");

const SITEMAP_FILES = {
  index: "sitemap.xml",
  articles: "sitemap-articles.xml",
  categories: "sitemap-categories.xml",
  pages: "sitemap-pages.xml",
};
// サイトマップインデックスに並べる順(子サイトマップの種類)。
const BUCKETS = ["articles", "categories", "pages"];

// Sitemaps protocolの上限(1ファイルあたり)。超える場合は sitemap-articles-1.xml, -2.xml … に自動分割する。
const MAX_URLS_PER_SITEMAP = 50000;
const MAX_BYTES_PER_SITEMAP = 50 * 1024 * 1024; // 非圧縮50MB

// ルート直下にある「このスクリプトが管理するサイトマップファイル」の名前パターン(分割ファイルを含む)。
const MANAGED_SITEMAP_FILE_RE = /^sitemap(?:-(?:articles|categories|pages)(?:-\d+)?)?\.xml$/;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function unescapeXml(value) {
  return String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// 改行コードの違い(CRLF/LF)だけで「内容が変わった」と判定しないための正規化。
function normalizeEol(text) {
  return text == null ? text : String(text).replace(/\r\n?/g, "\n");
}

// "2026.09.03" と "2026.09.05" のようなドット区切り日付(固定桁のためそのまま
// 文字列比較で新旧判定できる)の中から最新のものを返す。
function maxDotDate(dates) {
  let max = null;
  for (const d of dates) {
    if (!d) continue;
    if (!max || d > max) max = d;
  }
  return max;
}

// "YYYY-MM-DD" どうしの最新(nullは無視)。
function maxDashDate(dates) {
  return maxDotDate(dates);
}

// 日本時間の今日(YYYY-MM-DD)。子サイトマップの中身が実際に変わったときだけ、
// サイトマップインデックスのlastmodに使う(テスト用に SITEMAP_TODAY で上書き可能)。
function todayJst() {
  if (process.env.SITEMAP_TODAY) return process.env.SITEMAP_TODAY;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function buildUrlEntry({ loc, lastmod }) {
  const lines = ["  <url>", `    <loc>${escapeXml(loc)}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
  lines.push("  </url>");
  return lines.join("\n");
}

function buildUrlset(entries) {
  const body = entries.map(buildUrlEntry).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function buildSitemapIndex(children) {
  const body = children
    .map(c => {
      const lines = ["  <sitemap>", `    <loc>${escapeXml(c.loc)}</loc>`];
      if (c.lastmod) lines.push(`    <lastmod>${escapeXml(c.lastmod)}</lastmod>`);
      lines.push("  </sitemap>");
      return lines.join("\n");
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

// サイトマップに載せない理由(載せてよいページは null)。
function exclusionReason(page, redirectKeys) {
  if (page.noindex) return "noindex";
  if (!page.canonical) return "canonicalなし";
  if (page.canonical !== page.expectedCanonical) return "canonicalが別URL";
  if (redirectKeys.has(normalizePathKey(page.expectedCanonical))) return "リダイレクト元";
  return null;
}

// 互換用: indexableかどうか(canonicalが自己参照で、noindexでなく、リダイレクト元でない)。
function isIndexable(page, redirectKeys = new Set(loadRedirects().map(r => r.sourceKey))) {
  return exclusionReason(page, redirectKeys) === null;
}

function bySlug(a, b) {
  return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
}

function byLoc(a, b) {
  return a.loc < b.loc ? -1 : a.loc > b.loc ? 1 : 0;
}

// 各ページを「掲載するもの」と「除外したもの(理由つき)」に振り分ける。
function partition(bucket, pages, redirectKeys, toEntry) {
  const entries = [];
  const excluded = [];
  for (const p of pages) {
    const reason = exclusionReason(p, redirectKeys);
    if (reason) excluded.push({ bucket, file: p.file, url: p.expectedCanonical, canonical: p.canonical, reason });
    else entries.push(toEntry(p));
  }
  return { entries, excluded };
}

function buildArticleEntries(redirectKeys = new Set(loadRedirects().map(r => r.sourceKey))) {
  const articles = listArticles();
  const { entries, excluded } = partition("articles", articles, redirectKeys, a => ({ loc: a.canonical, lastmod: a.lastmod, slug: a.slug }));
  entries.sort(bySlug);
  return { entries, excluded, articles };
}

// カテゴリページ: 見出しに更新日(作成日)が表示されているページだけlastmodを付ける。
function buildCategoryEntries(redirectKeys = new Set(loadRedirects().map(r => r.sourceKey))) {
  const { entries, excluded } = partition("categories", listCategories(), redirectKeys, c => ({ loc: c.canonical, lastmod: c.lastmod, slug: c.slug }));
  entries.sort(bySlug);
  return { entries, excluded };
}

function buildPagesEntries(articles, redirectKeys = new Set(loadRedirects().map(r => r.sourceKey))) {
  const entries = [];
  const excluded = [];
  const add = (page, lastmod) => {
    const reason = exclusionReason(page, redirectKeys);
    if (reason) excluded.push({ bucket: "pages", file: page.file, url: page.expectedCanonical, canonical: page.canonical, reason });
    else entries.push({ loc: page.canonical, lastmod });
  };

  // pages/*.html 直下の固定ページ(about, privacy, contact, sitemap 等)と pages/beginner/*.html。
  // search.html・company.html のような noindex ページは、除外リストではなく実際の <meta name="robots"> で自動的に除外される。
  // lastmod は見出しに表示されている更新日・作成日(プライバシーポリシーは制定日・改定日)。無いページは省略する。
  for (const p of listTopLevelPages()) add(p, p.lastmod);
  for (const p of listBeginnerPages()) add(p, p.lastmod);

  // 記事一覧系ページ(pages/articles/ 配下だが個別記事ではないもの)。
  // lastmodは「そのページに実際に表示されている内容が最後に変わった日」から計算する。
  const createdBySlug = {};
  const updatedBySlug = {};
  articles.forEach(a => {
    createdBySlug[a.slug] = a.created;
    updatedBySlug[a.slug] = a.updated;
  });

  const newPage = readArticleHubPage("new.html");
  const newOrder = extractCardOrder(
    newPage.content,
    newPage.content.indexOf('id="articleListFull"'),
    newPage.content.indexOf('</div>\n\n      <nav class="pagination"')
  );
  const newLastmodDot = maxDotDate(newOrder.map(s => createdBySlug[s]));

  const updatedPage = readArticleHubPage("updated.html");
  const updatedOrder = extractCardOrder(
    updatedPage.content,
    updatedPage.content.indexOf('<div class="article-list">'),
    updatedPage.content.indexOf('<nav class="article-footer-nav">')
  );
  const updatedLastmodDot = maxDotDate(updatedOrder.map(s => updatedBySlug[s]));

  const hubPage = readArticleHubPage("index.html");
  const hubLastmodDot = maxDotDate(articles.map(a => a.updated || a.created));

  add(hubPage, dotDateToDash(hubLastmodDot));
  add(newPage, dotDateToDash(newLastmodDot));
  add(updatedPage, dotDateToDash(updatedLastmodDot));

  // トップページ「/」。新着記事・更新記事セクションが変われば内容が変わるページなので、
  // その2つの一覧page(new.html/updated.html)と同じ実質更新日のうち新しい方を採用する。
  // サイトマップ生成日をそのまま入れることはしない。
  add(readHomePage(), dotDateToDash(maxDotDate([newLastmodDot, updatedLastmodDot])));

  entries.sort(byLoc);
  return { entries, excluded };
}

// 1つの種類のURL群を、上限(件数・バイト数)を超えないファイルに分ける。
// 1ファイルに収まる場合は従来どおりのファイル名(sitemap-articles.xml)のまま。
function chunkBucket(fileName, entries, maxUrls = MAX_URLS_PER_SITEMAP) {
  let groups = [];
  for (let i = 0; i < entries.length; i += maxUrls) groups.push(entries.slice(i, i + maxUrls));
  if (!groups.length) groups = [[]];
  // バイト数の上限を超えるグループは半分に割っていく(現状の規模では発生しない)。
  for (let i = 0; i < groups.length; i++) {
    if (groups[i].length > 1 && Buffer.byteLength(buildUrlset(groups[i]), "utf8") > MAX_BYTES_PER_SITEMAP) {
      const g = groups[i];
      groups.splice(i, 1, g.slice(0, Math.ceil(g.length / 2)), g.slice(Math.ceil(g.length / 2)));
      i--;
    }
  }
  const names = groups.length === 1 ? [fileName] : groups.map((_, i) => fileName.replace(/\.xml$/, `-${i + 1}.xml`));
  return groups.map((g, i) => ({ fileName: names[i], entries: g, xml: buildUrlset(g) }));
}

function parseSitemapIndexXml(xml) {
  const children = [];
  const re = /<sitemap>\s*<loc>([^<]*)<\/loc>\s*(?:<lastmod>([^<]*)<\/lastmod>\s*)?<\/sitemap>/g;
  let m;
  while ((m = re.exec(xml || ""))) children.push({ loc: unescapeXml(m[1]), lastmod: m[2] || null });
  return children;
}

function parseUrlsetXml(xml) {
  const entries = [];
  const re = /<url>\s*<loc>([^<]*)<\/loc>\s*(?:<lastmod>([^<]*)<\/lastmod>\s*)?<\/url>/g;
  let m;
  while ((m = re.exec(xml || ""))) entries.push({ loc: unescapeXml(m[1]), lastmod: m[2] || null });
  return entries;
}

function readRootFile(fileName) {
  const p = path.join(root, fileName);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

// ルート直下に存在する、このスクリプトが管理するサイトマップファイル名の一覧。
function listManagedSitemapFilesOnDisk() {
  return fs.readdirSync(root).filter(f => MANAGED_SITEMAP_FILE_RE.test(f)).sort();
}

// サイトマップ一式の中身を { ファイル名: XML文字列 } で返す(書き込みは行わない)。
//
// サイトマップインデックス(sitemap.xml)の各子サイトマップのlastmodは「その子サイトマップの中身が
// 最後に実際に変わった日」:
//   ・子サイトマップの中身が保存済みのものと同じ(改行コードの違いは無視) → 前回のlastmodを引き継ぐ
//   ・中身が変わった(URLの追加・削除・lastmod変更) → 掲載URLの最新lastmodと日本時間の今日の新しい方
// 再生成しただけ・改行コードが変わっただけでは日付は動かない。
function buildSitemaps() {
  const redirects = loadRedirects();
  const redirectKeys = new Set(redirects.map(r => r.sourceKey));

  const { entries: articleEntries, excluded: articleExcluded, articles } = buildArticleEntries(redirectKeys);
  const { entries: categoryEntries, excluded: categoryExcluded } = buildCategoryEntries(redirectKeys);
  const { entries: pageEntries, excluded: pageExcluded } = buildPagesEntries(articles, redirectKeys);
  const byBucket = { articles: articleEntries, categories: categoryEntries, pages: pageEntries };

  const previousIndex = parseSitemapIndexXml(normalizeEol(readRootFile(SITEMAP_FILES.index)));
  const previousLastmodByLoc = {};
  previousIndex.forEach(c => { previousLastmodByLoc[c.loc] = c.lastmod; });

  const files = {};
  const children = [];
  const chunksByBucket = {};
  for (const bucket of BUCKETS) {
    const chunks = chunkBucket(SITEMAP_FILES[bucket], byBucket[bucket]);
    chunksByBucket[bucket] = chunks.map(c => c.fileName);
    for (const chunk of chunks) {
      files[chunk.fileName] = chunk.xml;
      const loc = `${SITE_ORIGIN}/${chunk.fileName}`;
      const contentLastmod = maxDashDate(chunk.entries.map(e => e.lastmod));
      const previousXml = normalizeEol(readRootFile(chunk.fileName));
      let lastmod;
      if (previousXml === chunk.xml) lastmod = maxDashDate([previousLastmodByLoc[loc], contentLastmod]);
      else lastmod = maxDashDate([contentLastmod, todayJst()]);
      children.push({ loc, lastmod, fileName: chunk.fileName, bucket });
    }
  }
  files[SITEMAP_FILES.index] = buildSitemapIndex(children);

  return {
    files,
    children,
    chunksByBucket,
    redirects,
    excluded: [...articleExcluded, ...categoryExcluded, ...pageExcluded],
    counts: {
      articles: articleEntries.length,
      categories: categoryEntries.length,
      pages: pageEntries.length,
    },
  };
}

// 生成・保存されたサイトマップXMLの検証(依存ライブラリなし)。このスクリプトが作るフラットな構造
// (urlset/url/loc/lastmod、sitemapindex/sitemap/loc/lastmod)に対して、以下を厳密に確認する:
//   XML宣言・ルート要素と名前空間・許可された要素だけで正しく入れ子になっているか・
//   要素間に余計な文字が無いか・&や<が正しくエスケープされているか・locが絶対https URLか・
//   lastmodがYYYY-MM-DDの実在日付か・件数とファイルサイズが上限内か。
// 問題の一覧(配列)を返し、空なら正常。
function validateSitemapXml(xml) {
  const errors = [];
  const DECL = '<?xml version="1.0" encoding="UTF-8"?>';
  if (typeof xml !== "string") return ["ファイルが読めない"];
  if (!xml.startsWith(DECL)) errors.push("XML宣言が無いか不正");
  if (Buffer.byteLength(xml, "utf8") > MAX_BYTES_PER_SITEMAP) errors.push("ファイルサイズが50MBを超えている");
  const body = xml.slice(DECL.length);
  const NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
  const CHILD = { urlset: "url", sitemapindex: "sitemap" };
  const LEAVES = new Set(["loc", "lastmod"]);

  const tokenRe = /<(\/?)([A-Za-z][\w:.-]*)((?:\s+[\w:.-]+="[^"]*")*)\s*(\/?)>|([^<]+)|(<)/g;
  const stack = [];
  let rootName = null;
  let itemCount = 0;
  let current = null; // 子要素(url/sitemap)の中身
  let leaf = null; // 葉要素(loc/lastmod)の名前
  let leafText = "";
  let m;
  while ((m = tokenRe.exec(body))) {
    const [, closing, name, attrs, selfClosing, text, strayLt] = m;
    if (strayLt) { errors.push("エスケープされていない < がある"); break; }
    if (text !== undefined) {
      if (leaf) leafText += text;
      else if (text.trim()) errors.push(`要素の外に文字がある: ${text.trim().slice(0, 40)}`);
      continue;
    }
    if (selfClosing) { errors.push(`想定外の空要素 <${name}/>`); continue; }
    if (!closing) {
      if (!rootName) {
        if (!CHILD[name]) { errors.push(`ルート要素が不正: ${name}`); break; }
        if (!new RegExp(`\\sxmlns="${NS.replace(/[.]/g, "\\.")}"`).test(attrs)) errors.push("名前空間(xmlns)が不正");
        rootName = name;
      } else {
        const parent = stack[stack.length - 1];
        if (parent === rootName && name === CHILD[rootName]) { current = { loc: 0, lastmod: 0 }; itemCount++; }
        else if (parent === CHILD[rootName] && LEAVES.has(name)) { leaf = name; leafText = ""; }
        else { errors.push(`<${parent}> の中に想定外の要素 <${name}>`); }
        if (attrs && attrs.trim()) errors.push(`<${name}> に想定外の属性`);
      }
      stack.push(name);
    } else {
      if (stack.pop() !== name) { errors.push(`閉じタグの対応が不正: </${name}>`); break; }
      if (LEAVES.has(name) && leaf === name) {
        const value = leafText;
        if (/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/.test(value)) errors.push(`エスケープされていない & がある: ${value.slice(0, 60)}`);
        const decoded = unescapeXml(value);
        if (name === "loc") {
          current.loc++;
          if (!/^https:\/\/[^\s]+$/.test(decoded)) errors.push(`locが絶対https URLではない: ${decoded}`);
          if (decoded.length > 2048) errors.push(`locが長すぎる: ${decoded.slice(0, 60)}…`);
        } else {
          current.lastmod++;
          const d = decoded.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          const valid = d && !Number.isNaN(Date.UTC(+d[1], +d[2] - 1, +d[3])) && new Date(Date.UTC(+d[1], +d[2] - 1, +d[3])).toISOString().slice(0, 10) === decoded;
          if (!valid) errors.push(`lastmodがYYYY-MM-DDの実在日付ではない: ${decoded}`);
        }
        leaf = null;
      }
      if (rootName && name === CHILD[rootName] && current) {
        if (current.loc !== 1) errors.push(`<${name}> の loc が ${current.loc} 個`);
        if (current.lastmod > 1) errors.push(`<${name}> の lastmod が ${current.lastmod} 個`);
        current = null;
      }
    }
  }
  if (!rootName) errors.push("ルート要素が無い");
  if (stack.length) errors.push(`閉じられていない要素: ${stack.join(" > ")}`);
  if (itemCount > MAX_URLS_PER_SITEMAP) errors.push(`件数が上限(${MAX_URLS_PER_SITEMAP})を超えている: ${itemCount}`);
  return errors;
}

function isWellFormedXml(xml) {
  return validateSitemapXml(xml).length === 0;
}

module.exports = {
  root,
  SITE_ORIGIN,
  SITEMAP_FILES,
  BUCKETS,
  MAX_URLS_PER_SITEMAP,
  MAX_BYTES_PER_SITEMAP,
  MANAGED_SITEMAP_FILE_RE,
  escapeXml,
  unescapeXml,
  normalizeEol,
  maxDotDate,
  todayJst,
  exclusionReason,
  isIndexable,
  buildArticleEntries,
  buildCategoryEntries,
  buildPagesEntries,
  buildSitemaps,
  chunkBucket,
  parseSitemapIndexXml,
  parseUrlsetXml,
  listManagedSitemapFilesOnDisk,
  validateSitemapXml,
  isWellFormedXml,
};
