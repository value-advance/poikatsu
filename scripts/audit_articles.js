// Reusable audit: compares real article files under pages/articles/*.html
// against the master "all articles" hub grid in pages/articles/index.html.
// Run manually: node scripts/audit_articles.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const articlesDir = path.join(root, "pages", "articles");

const EXCLUDE_FILES = new Set(["index.html", "new.html", "updated.html"]);

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

  const robotsM = content.match(/<meta name="robots" content="([^"]*)"/);
  const robots = robotsM ? robotsM[1] : null;

  return {
    slug,
    href: `/pages/articles/${slug}`,
    categoryCode,
    categoryLabel: categoryCode ? (CATEGORY_LABELS[categoryCode] || null) : null,
    thumbType,
    title,
    h1,
    description,
    created: createdM ? createdM[1] : null,
    updated: updatedM ? updatedM[1] : null,
    robots,
  };
}

const files = fs.readdirSync(articlesDir).filter(f => f.endsWith(".html") && !EXCLUDE_FILES.has(f));
const articles = files.map(readArticle);

const indexHtml = fs.readFileSync(path.join(articlesDir, "index.html"), "utf8");
const gridStart = indexHtml.indexOf('id="articleListFull"');
const gridEnd = indexHtml.indexOf('</div>\n\n      <nav class="pagination"');
const gridHtml = indexHtml.slice(gridStart, gridEnd);
const hubSlugs = new Set();
const cardRe = /<a class="article-card" href="\/?pages\/articles\/([a-zA-Z0-9_-]+)\/?"/g;
let m;
while ((m = cardRe.exec(gridHtml))) hubSlugs.add(m[1]);

const missing = articles.filter(a => !hubSlugs.has(a.slug));
const noCategoryCode = articles.filter(a => !a.categoryCode);
const noThumbType = articles.filter(a => !a.thumbType);
const noDescription = articles.filter(a => !a.description);
const noCreated = articles.filter(a => !a.created);
const unmappedCategory = articles.filter(a => a.categoryCode && !CATEGORY_LABELS[a.categoryCode]);
const noindexed = articles.filter(a => a.robots && /noindex/i.test(a.robots));

// duplicate slug check (shouldn't happen given filesystem, but keep for future use)
const slugCounts = {};
articles.forEach(a => { slugCounts[a.slug] = (slugCounts[a.slug] || 0) + 1; });
const dupes = Object.entries(slugCounts).filter(([, c]) => c > 1);

console.log("=== ARTICLE AUDIT ===");
console.log("Total real article files:", articles.length);
console.log("Registered in hub grid (pages/articles/index.html):", hubSlugs.size);
console.log("Missing from hub grid:", missing.length);
console.log("");
console.log("Missing slugs:");
missing.forEach(a => console.log(" ", a.slug));
console.log("");
console.log("Articles whose OWN <article> tag lacks data-category/data-thumb-type");
console.log("(this is separate from hub registration above -- these attributes only feed the");
console.log("'related offers' tag-matching on the article page itself; the hub grid card's own");
console.log("data-category/data-thumb-type, used for the /pages/articles/ category filter, is");
console.log("unaffected and already correct for these articles. Informational only.):");
console.log("  no data-category:", noCategoryCode.length, noCategoryCode.map(a => a.slug));
console.log("  no data-thumb-type:", noThumbType.length, noThumbType.map(a => a.slug));
console.log("  no meta description:", noDescription.length, noDescription.map(a => a.slug));
console.log("  no 作成日:", noCreated.length, noCreated.map(a => a.slug));
console.log("  unmapped category code:", unmappedCategory.length, unmappedCategory.map(a => `${a.slug}(${a.categoryCode})`));
console.log("  duplicate slugs:", dupes.length, dupes);
console.log("  noindex articles:", noindexed.length, noindexed.map(a => a.slug));

fs.writeFileSync(path.join(__dirname, "_audit_all_articles.json"), JSON.stringify(articles, null, 2), "utf8");
fs.writeFileSync(path.join(__dirname, "_audit_missing.json"), JSON.stringify(missing, null, 2), "utf8");
console.log("\nWrote _audit_all_articles.json (" + articles.length + ") and _audit_missing.json (" + missing.length + ")");

// Fail the process (and therefore CI) only on the things that are actually broken:
// an article page that exists but isn't reachable from the all-articles hub, or a
// duplicate slug. Missing data-category/data-thumb-type on the article's own tag is
// informational (see above) and must not fail the build.
if (missing.length > 0 || dupes.length > 0) {
  console.error(`\nFAIL: ${missing.length} article(s) missing from the hub, ${dupes.length} duplicate slug(s).`);
  process.exit(1);
}
console.log("\nOK: every article file is registered in the hub grid, no duplicate slugs.");
