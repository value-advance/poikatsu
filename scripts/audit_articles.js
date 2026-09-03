// Reusable audit: compares real article files under pages/articles/*.html
// against the master "all articles" hub grid in pages/articles/index.html.
// Run manually: node scripts/audit_articles.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const articlesDir = path.join(root, "pages", "articles");

const EXCLUDE_FILES = new Set(["index.html", "new.html", "updated.html"]);

// 記事は作成する(hubには必ず登録する)が、依頼者の明示指示により
// トップページ「新着記事」および /pages/articles/new.html には
// 意図的に掲載しない記事のslug一覧。「新着一覧同期」「トップ新着同期」
// チェックの対象から個別に除外するためのallowlist。
// 追加する場合は、必ずユーザーの明示的な指示があった場合のみ。
const SHINCHAKU_EXCLUDED_SLUGS = new Set([
  "dmmbooks-toha", // 案件記事(生活カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "monex-shouken-toha", // 案件記事(口座開設カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
  "rakuten-shouken-toha", // 案件記事(口座開設カテゴリ)にのみ掲載、新着記事には含めないよう明示指示(2026-09-03)
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
const createdBySlug = {};
articles.forEach(a => { createdBySlug[a.slug] = a.created; });

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

// 与えられたslug配列(出現順)が、作成日(publishedAt)の降順(新しい→古い)になっているかを検証する。
// 作成日不明のslugはスキップ(比較対象からは除外するが、順序自体は崩さない)。
function findOrderViolations(order) {
  const violations = [];
  let prevSlug = null, prevCreated = null;
  for (const slug of order) {
    const created = createdBySlug[slug];
    if (!created) continue;
    if (prevCreated && created > prevCreated) {
      violations.push({ afterSlug: prevSlug, afterCreated: prevCreated, slug, created });
    }
    prevSlug = slug;
    prevCreated = created;
  }
  return violations;
}

const indexHtml = fs.readFileSync(path.join(articlesDir, "index.html"), "utf8");
const gridStart = indexHtml.indexOf('id="articleListFull"');
const gridEnd = indexHtml.indexOf('</div>\n\n      <nav class="pagination"');
const hubOrder = extractCardOrder(indexHtml, gridStart, gridEnd);
const hubSlugs = new Set(hubOrder);

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

// --- 新着一覧同期(pages/articles/new.html) ---------------------------------
// new.html は「公開済み全記事を作成日(publishedAt)降順で掲載する」一覧である前提。
// 1) hub(index.html)に載っている記事が new.html に無ければ検出する
// 2) new.html 自体の並び順が作成日降順になっているか検証する
// ※ 更新日(updatedAt)だけが新しい記事(リライト記事)は、この判定には一切使わない。
const newHtml = fs.readFileSync(path.join(articlesDir, "new.html"), "utf8");
const newGridStart = newHtml.indexOf('id="articleListFull"');
const newGridEnd = newHtml.indexOf('</div>\n\n      <nav class="pagination"');
const newOrder = extractCardOrder(newHtml, newGridStart, newGridEnd);
const newSlugs = new Set(newOrder);
const missingFromNew = hubOrder.filter(slug => !newSlugs.has(slug) && !SHINCHAKU_EXCLUDED_SLUGS.has(slug));
const hubOrderViolations = findOrderViolations(hubOrder);
const newOrderViolations = findOrderViolations(newOrder);
const newSyncOk = missingFromNew.length === 0 && hubOrderViolations.length === 0 && newOrderViolations.length === 0;

console.log("");
console.log("=== 新着一覧同期(pages/articles/new.html) ===");
console.log("hub(index.html)登録件数:", hubOrder.length, " / new.html掲載件数:", newOrder.length);
console.log("hubに登録済みだがnew.htmlに無い記事:", missingFromNew.length, missingFromNew);
console.log("index.htmlの並び順で作成日降順に反する箇所:", hubOrderViolations.length);
hubOrderViolations.forEach(v => console.log(`  ${v.slug}(作成日${v.created}) が ${v.afterSlug}(作成日${v.afterCreated}) より後ろに表示されている`));
console.log("new.htmlの並び順で作成日降順に反する箇所:", newOrderViolations.length);
newOrderViolations.forEach(v => console.log(`  ${v.slug}(作成日${v.created}) が ${v.afterSlug}(作成日${v.afterCreated}) より後ろに表示されている`));
console.log("新着一覧同期:", newSyncOk ? "PASS" : "FAIL");

// --- トップページ新着同期(ルート index.html #articleList) -------------------
// トップページの「新着記事」は、公開済み全記事(作成日降順=hubOrder)の先頭N件と
// 一致していなければならない。N は現在ホームページに表示されているカード枚数を
// そのまま使う(枚数を勝手に増減させない)。
const homeHtmlPath = path.join(root, "index.html");
const homeHtml = fs.readFileSync(homeHtmlPath, "utf8");
const homeGridStart = homeHtml.indexOf('id="articleList"');
const homeGridEnd = homeHtml.indexOf('<a class="show-more-btn"');
const homeOrder = extractCardOrder(homeHtml, homeGridStart, homeGridEnd);
const homeEligibleOrder = hubOrder.filter(slug => !SHINCHAKU_EXCLUDED_SLUGS.has(slug));
const expectedTopN = homeEligibleOrder.slice(0, homeOrder.length);
const homeSyncOk = hubOrderViolations.length === 0 &&
  homeOrder.length === expectedTopN.length &&
  homeOrder.every((slug, i) => slug === expectedTopN[i]);

console.log("");
console.log("=== トップページ新着同期(index.html #articleList) ===");
console.log("トップページ表示件数:", homeOrder.length);
if (!homeSyncOk) {
  console.error("ERROR:");
  console.error("トップページの新着記事が最新公開記事と一致していません。");
  console.error("");
  console.error("期待(作成日降順の最新" + expectedTopN.length + "件):");
  expectedTopN.forEach((slug, i) => console.error(`  ${i + 1}. ${slug}(作成日${createdBySlug[slug]})`));
  console.error("");
  console.error("現在のトップページ:");
  homeOrder.forEach((slug, i) => console.error(`  ${i + 1}. ${slug}(作成日${createdBySlug[slug] || "不明"})`));
}
console.log("トップ新着同期:", homeSyncOk ? "PASS" : "FAIL");

fs.writeFileSync(path.join(__dirname, "_audit_all_articles.json"), JSON.stringify(articles, null, 2), "utf8");
fs.writeFileSync(path.join(__dirname, "_audit_missing.json"), JSON.stringify(missing, null, 2), "utf8");
console.log("\nWrote _audit_all_articles.json (" + articles.length + ") and _audit_missing.json (" + missing.length + ")");

// Fail the process (and therefore CI) only on the things that are actually broken:
// an article page that exists but isn't reachable from the all-articles hub, a
// duplicate slug, new.html falling out of sync with the hub, or the homepage's
// "新着記事" section falling out of sync with the latest published articles.
// Missing data-category/data-thumb-type on the article's own tag is informational
// (see above) and must not fail the build.
if (missing.length > 0 || dupes.length > 0 || !newSyncOk || !homeSyncOk) {
  console.error(`\nFAIL: ${missing.length} article(s) missing from the hub, ${dupes.length} duplicate slug(s), 新着一覧同期=${newSyncOk ? "PASS" : "FAIL"}, トップ新着同期=${homeSyncOk ? "PASS" : "FAIL"}.`);
  process.exit(1);
}
console.log("\nOK: every article file is registered in the hub grid, no duplicate slugs, new.html and the homepage are in sync with the latest published articles.");
