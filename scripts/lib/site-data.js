// 記事・カテゴリ・固定ページのHTMLファイルから、監査(audit_articles.js)と
// サイトマップ生成(sitemap.js)の両方が必要とする情報を読み取る共通ライブラリ。
// 「実際のHTMLファイルをsource of truthにする」という方針にもとづき、
// slugの手書き配列やURLの手書き配列は一切持たない。
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const SITE_ORIGIN = "https://value-advance.com";

const articlesDir = path.join(root, "pages", "articles");
const categoryDir = path.join(root, "pages", "category");
const beginnerDir = path.join(root, "pages", "beginner");
const pagesDir = path.join(root, "pages");

// pages/articles/ 配下にあるが「個別記事」ではなく「記事一覧系ページ」のファイル。
// サイトマップ上は articles ではなく pages バケットに属する。
const ARTICLE_HUB_FILES = new Set(["index.html", "new.html", "updated.html"]);

// 記事は作成する(hubには必ず登録する)が、依頼者の明示指示により
// トップページ「新着記事」および /pages/articles/new.html には
// 意図的に掲載しない記事のslug一覧。「新着一覧同期」「トップ新着同期」
// チェックの対象から個別に除外するためのallowlist。
// 追加する場合は、必ずユーザーの明示的な指示があった場合のみ。
const SHINCHAKU_EXCLUDED_SLUGS = new Set([
  "dmmbooks-toha", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "monex-shouken-toha", // 案件記事(口座開設カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "rakuten-shouken-toha", // 案件記事(口座開設カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "sbisec-shouken-toha", // 案件記事(口座開設カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "paypaysec-shouken-toha", // 案件記事(口座開設カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "nexus-card-poikatsu", // 案件記事(クレジットカードカテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "epos-card-poikatsu", // 案件記事(クレジットカードカテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "cosmo-opus-card-poikatsu", // 案件記事(クレジットカードカテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "rimawarikun-toha", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "hikaritv-toha", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "dcarshare-toha", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "dmagazine-toha", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "anshin-security-toha", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "dhealthcare-toha", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "dphoto-toha", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "dhits-toha", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "ahamo-toha", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "docomo-select-toha", // 案件記事(ショッピングカテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "lemino-premium-toha", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "gendama-poikatsu", // 案件記事(ポイントサイトカテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-04)
  "busnoru-poikatsu", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-04)
  "odakyu-point-card-poikatsu", // 案件記事(クレジットカードカテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-04)
  "satofull-poikatsu", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-04)
  "rakuten-kakeibo-poikatsu", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-04)
  "rakuten-carwash-poikatsu", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-04)
  "ec-current-poikatsu", // 案件記事(ショッピングカテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-04)
]);

const CATEGORY_LABELS = {
  creditcard: "クレジットカード",
  kouza: "口座開設",
  shopping: "ショッピング",
  app: "アプリ案件",
  survey: "アンケート",
  campaign: "キャンペーン",
  furima: "フリマ・オークション",
  sidejob: "副業",
  pointsite: "ポイントサイト",
  // "生活" はREADMEに明記された9分類には無いが、記事カードのdata-categoryとして
  // 既に site 全体で使われている10番目の値(通信/回線・生活サービス系の記事向け)。
  seikatsu: "生活",
};

// "2026.09.05" -> "2026-09-05"。lastmodはW3C(YYYY-MM-DD)形式で扱う。
// Dateオブジェクトを経由するとタイムゾーンでずれる恐れがあるため、常に文字列操作のみで変換する。
function dotDateToDash(dotDate) {
  return dotDate ? dotDate.replace(/\./g, "-") : null;
}

function extractCanonical(content) {
  const m = content.match(/<link rel="canonical" href="([^"]*)"/);
  return m ? m[1] : null;
}

function extractRobotsNoindex(content) {
  const m = content.match(/<meta name="robots" content="([^"]*)"/);
  return !!(m && /noindex/i.test(m[1]));
}

function readArticle(file) {
  const slug = file.replace(/\.html$/, "");
  const content = fs.readFileSync(path.join(articlesDir, file), "utf8");

  const articleTagM = content.match(/<article class="section container article-page"([^>]*)>/);
  const attrs = articleTagM ? articleTagM[1] : "";
  const categoryCode = (attrs.match(/data-category="([^"]*)"/) || [])[1] || null;
  const thumbType = (attrs.match(/data-thumb-type="([^"]*)"/) || [])[1] || null;

  const titleTagM = content.match(/<title>([^<]*)<\/title>/);
  const rawTitle = titleTagM ? titleTagM[1] : null;
  const title = rawTitle ? rawTitle.replace(/\s*\|\s*ポイントの殿堂\s*$/, "") : null;

  const descM = content.match(/<meta name="description" content="([^"]*)"/);
  const description = descM ? descM[1] : null;

  const h1M = content.match(/<h1>([^<]*)<\/h1>/);
  const h1 = h1M ? h1M[1] : null;

  const createdM = content.match(/作成日:(\d{4}\.\d{2}\.\d{2})/);
  const updatedM = content.match(/更新日:(\d{4}\.\d{2}\.\d{2})/);
  const created = createdM ? createdM[1] : null;
  const updated = updatedM ? updatedM[1] : null;

  return {
    slug,
    href: `/pages/articles/${slug}`,
    categoryCode,
    categoryLabel: categoryCode ? (CATEGORY_LABELS[categoryCode] || null) : null,
    thumbType,
    title,
    h1,
    description,
    created,
    updated,
    // サイトマップのlastmodルール: updatedAtがあればupdatedAt、無ければpublishedAt。
    lastmod: dotDateToDash(updated || created),
    canonical: extractCanonical(content),
    noindex: extractRobotsNoindex(content),
  };
}

function listArticleFiles() {
  return fs.readdirSync(articlesDir).filter(f => f.endsWith(".html") && !ARTICLE_HUB_FILES.has(f));
}

function listArticles() {
  return listArticleFiles().map(readArticle);
}

// pages/articles/index.html(全記事一覧) / new.html(新着一覧) / updated.html(更新一覧)。
// 個別記事ではなく一覧ページなので、記事canonicalの一覧とは別に扱う。
function readArticleHubPage(file) {
  const content = fs.readFileSync(path.join(articlesDir, file), "utf8");
  return {
    file,
    canonical: extractCanonical(content),
    noindex: extractRobotsNoindex(content),
    content,
  };
}

// pages/category/*.html。カテゴリページ自体に信頼できる更新日情報が無いため、
// lastmodは持たない(生成側で省略する)。
function readCategoryPage(file) {
  const slug = file.replace(/\.html$/, "");
  const content = fs.readFileSync(path.join(categoryDir, file), "utf8");
  return {
    slug,
    href: `/pages/category/${slug}`,
    canonical: extractCanonical(content),
    noindex: extractRobotsNoindex(content),
  };
}

function listCategoryFiles() {
  return fs.readdirSync(categoryDir).filter(f => f.endsWith(".html"));
}

function listCategories() {
  return listCategoryFiles().map(readCategoryPage);
}

// pages/*.html 直下の固定ページ(about, privacy, contact, sitemap 等)。
// search.html・company.html のような noindex ページは、ハードコードの除外リストではなく
// 実際の <meta name="robots"> を読んで自動的に除外する。
function listTopLevelPages() {
  return fs
    .readdirSync(pagesDir)
    .filter(f => f.endsWith(".html"))
    .map(file => {
      const slug = file.replace(/\.html$/, "");
      const content = fs.readFileSync(path.join(pagesDir, file), "utf8");
      return {
        slug,
        href: `/pages/${slug}`,
        canonical: extractCanonical(content),
        noindex: extractRobotsNoindex(content),
      };
    });
}

// pages/beginner/*.html。
function listBeginnerPages() {
  if (!fs.existsSync(beginnerDir)) return [];
  return fs
    .readdirSync(beginnerDir)
    .filter(f => f.endsWith(".html"))
    .map(file => {
      const slug = file.replace(/\.html$/, "");
      const content = fs.readFileSync(path.join(beginnerDir, file), "utf8");
      return {
        slug,
        href: `/pages/beginner/${slug}`,
        canonical: extractCanonical(content),
        noindex: extractRobotsNoindex(content),
      };
    });
}

function readHomePage() {
  const content = fs.readFileSync(path.join(root, "index.html"), "utf8");
  return {
    canonical: extractCanonical(content),
    noindex: extractRobotsNoindex(content),
    content,
  };
}

// 記事カードの並び(articleListFull的なコンテナ)から、出現順のslug配列を抽出する共通ヘルパー。
// href は "pages/articles/x" "/pages/articles/x" のどちらの表記にも対応する。
function extractCardOrder(html, sectionStart, sectionEnd) {
  const section = html.slice(sectionStart, sectionEnd);
  const order = [];
  const re = /<a class="article-card" href="\/?pages\/articles\/([a-zA-Z0-9_-]+)\/?"/g;
  let mm;
  while ((mm = re.exec(section))) order.push(mm[1]);
  return order;
}

module.exports = {
  root,
  SITE_ORIGIN,
  articlesDir,
  categoryDir,
  beginnerDir,
  pagesDir,
  ARTICLE_HUB_FILES,
  SHINCHAKU_EXCLUDED_SLUGS,
  CATEGORY_LABELS,
  dotDateToDash,
  extractCanonical,
  extractRobotsNoindex,
  readArticle,
  listArticleFiles,
  listArticles,
  readArticleHubPage,
  readCategoryPage,
  listCategoryFiles,
  listCategories,
  listTopLevelPages,
  listBeginnerPages,
  readHomePage,
  extractCardOrder,
};
