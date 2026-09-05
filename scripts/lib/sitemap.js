// サイトマップ(sitemap.xml + 3分割ファイル)を「実際のHTMLファイル」から生成する
// ロジック本体。generate_sitemap.js(書き込み)と audit_sitemap.js(生成せず比較のみ)
// の両方がここを共有することで、「生成されるべき内容」と「監査が期待する内容」が
// 常に同一の実装になるようにしている。
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
} = require("./site-data");

const SITEMAP_FILES = {
  index: "sitemap.xml",
  articles: "sitemap-articles.xml",
  categories: "sitemap-categories.xml",
  pages: "sitemap-pages.xml",
};

// Sitemaps protocolの上限(1ファイルあたり)。件数チェックのみに使う。
const MAX_URLS_PER_SITEMAP = 50000;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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

function buildSitemapIndex(childFileNames) {
  const body = childFileNames
    .map(name => `  <sitemap>\n    <loc>${escapeXml(`${SITE_ORIGIN}/${name}`)}</loc>\n  </sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

// indexableかどうか(canonicalがあり、noindexでない)の共通判定。
function isIndexable(entry) {
  return !!(entry.canonical && !entry.noindex);
}

function buildArticleEntries() {
  const articles = listArticles();
  const entries = articles
    .filter(isIndexable)
    .map(a => ({ loc: a.canonical, lastmod: a.lastmod, slug: a.slug }));
  entries.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
  return { entries, articles };
}

function buildCategoryEntries() {
  // カテゴリページ自体には信頼できる更新日情報が無いため、lastmodは付けない
  // (不正確な日付を入れるより省略を優先する、という明示方針にもとづく)。
  const categories = listCategories();
  const entries = categories
    .filter(isIndexable)
    .map(c => ({ loc: c.canonical, lastmod: null, slug: c.slug }));
  entries.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
  return entries;
}

function buildPagesEntries(articles) {
  const entries = [];

  // pages/*.html 直下の固定ページ(about, privacy, contact, sitemap 等)。
  // search.html・company.html のような noindex ページは isIndexable() で自動的に除外される。
  for (const p of listTopLevelPages()) {
    if (isIndexable(p)) entries.push({ loc: p.canonical, lastmod: null });
  }

  // pages/beginner/*.html
  for (const p of listBeginnerPages()) {
    if (isIndexable(p)) entries.push({ loc: p.canonical, lastmod: null });
  }

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

  if (isIndexable(hubPage)) entries.push({ loc: hubPage.canonical, lastmod: dotDateToDash(hubLastmodDot) });
  if (isIndexable(newPage)) entries.push({ loc: newPage.canonical, lastmod: dotDateToDash(newLastmodDot) });
  if (isIndexable(updatedPage)) entries.push({ loc: updatedPage.canonical, lastmod: dotDateToDash(updatedLastmodDot) });

  // トップページ「/」。新着記事・更新記事セクションが変われば内容が変わるページなので、
  // その2つの一覧page(new.html/updated.html)と同じ実質更新日のうち新しい方を採用する。
  // サイトマップ生成日をそのまま入れることはしない。
  const home = readHomePage();
  if (isIndexable(home)) {
    const rootLastmodDot = maxDotDate([newLastmodDot, updatedLastmodDot]);
    entries.push({ loc: home.canonical, lastmod: dotDateToDash(rootLastmodDot) });
  }

  entries.sort((a, b) => (a.loc < b.loc ? -1 : a.loc > b.loc ? 1 : 0));
  return entries;
}

// サイトマップ4ファイル分の中身を { ファイル名: XML文字列 } で返す。
// ファイルへの書き込みは行わない(generate_sitemap.js / audit_sitemap.js 側の責務)。
function buildSitemaps() {
  const { entries: articleEntries, articles } = buildArticleEntries();
  const categoryEntries = buildCategoryEntries();
  const pageEntries = buildPagesEntries(articles);

  const files = {
    [SITEMAP_FILES.articles]: buildUrlset(articleEntries),
    [SITEMAP_FILES.categories]: buildUrlset(categoryEntries),
    [SITEMAP_FILES.pages]: buildUrlset(pageEntries),
  };
  files[SITEMAP_FILES.index] = buildSitemapIndex([
    SITEMAP_FILES.articles,
    SITEMAP_FILES.categories,
    SITEMAP_FILES.pages,
  ]);

  return {
    files,
    counts: {
      articles: articleEntries.length,
      categories: categoryEntries.length,
      pages: pageEntries.length,
    },
  };
}

// 生成された各XML文字列が、最低限「壊れたXMLになっていないか」を
// 依存ライブラリなしで検査する(タグの対応が取れているか、宣言があるか)。
// フルスペックのXMLバリデータではないが、この生成ロジックが作る単純な
// フラット構造(urlset/url/loc/lastmod または sitemapindex/sitemap/loc)を
// チェックするには十分な、意図的にシンプルな実装。
function isWellFormedXml(xml) {
  if (!/^<\?xml version="1\.0" encoding="UTF-8"\?>/.test(xml)) return false;
  const tagRe = /<\/?([a-zA-Z0-9]+)(?:\s[^>]*)?>/g;
  const stack = [];
  let m;
  while ((m = tagRe.exec(xml))) {
    const isClosing = m[0][1] === "/";
    const name = m[1];
    if (isClosing) {
      if (stack.pop() !== name) return false;
    } else {
      stack.push(name);
    }
  }
  return stack.length === 0;
}

module.exports = {
  root,
  SITE_ORIGIN,
  SITEMAP_FILES,
  MAX_URLS_PER_SITEMAP,
  escapeXml,
  maxDotDate,
  isIndexable,
  buildArticleEntries,
  buildCategoryEntries,
  buildPagesEntries,
  buildSitemaps,
  isWellFormedXml,
};
