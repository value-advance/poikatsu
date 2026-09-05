// Reusable audit: compares real article files under pages/articles/*.html
// against the master "all articles" hub grid in pages/articles/index.html.
// Run manually: node scripts/audit_articles.js
const fs = require("fs");
const path = require("path");
const {
  root,
  articlesDir,
  ARTICLE_HUB_FILES: EXCLUDE_FILES,
  SHINCHAKU_EXCLUDED_SLUGS,
  CATEGORY_LABELS,
  listArticleFiles,
  readArticle,
  extractCardOrder,
} = require("./lib/site-data");

const files = listArticleFiles();
const articles = files.map(readArticle);
const createdBySlug = {};
articles.forEach(a => { createdBySlug[a.slug] = a.created; });
const updatedBySlug = {};
articles.forEach(a => { updatedBySlug[a.slug] = a.updated; });

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

// findOrderViolations の更新日(updatedAt)版。/pages/articles/updated.html や
// トップページの「更新記事」セクションが更新日降順になっているかの検証に使う。
function findUpdatedOrderViolations(order) {
  const violations = [];
  let prevSlug = null, prevUpdated = null;
  for (const slug of order) {
    const updated = updatedBySlug[slug];
    if (!updated) continue;
    if (prevUpdated && updated > prevUpdated) {
      violations.push({ afterSlug: prevSlug, afterUpdated: prevUpdated, slug, updated });
    }
    prevSlug = slug;
    prevUpdated = updated;
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
const noindexed = articles.filter(a => a.noindex);

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

// --- トップページ更新同期(ルート index.html #updatedArticleList) -------------
// トップページの「更新記事」は、/pages/articles/updated.html の掲載順(更新日降順)の
// 先頭N件と一致していなければならない。N は現在ホームページに表示されているカード
// 枚数をそのまま使う。updated.html 自体への追加・並び替えはこの監査の対象外で、
// 「実質更新した記事をupdated.htmlへ登録する」既存運用に従っていることが前提となる。
const updatedHtmlPath = path.join(articlesDir, "updated.html");
const updatedHtml = fs.readFileSync(updatedHtmlPath, "utf8");
const updatedListStart = updatedHtml.indexOf('<div class="article-list">');
const updatedListEnd = updatedHtml.indexOf('<nav class="article-footer-nav">');
const updatedOrder = extractCardOrder(updatedHtml, updatedListStart, updatedListEnd);
// updated.html 自体が更新日降順になっているかは参考情報として表示するのみで、
// トップページ同期のPASS/FAIL判定には使わない(updated.html の並び替え・再登録は
// このチェックの対象外で、既存運用に従っているという前提を尊重するため)。
const updatedOrderViolations = findUpdatedOrderViolations(updatedOrder);

const homeUpdatedGridStart = homeHtml.indexOf('id="updatedArticleList"');
const homeUpdatedGridEnd = homeHtml.indexOf('<a class="show-more-btn"', homeUpdatedGridStart);
const homeUpdatedOrder = extractCardOrder(homeHtml, homeUpdatedGridStart, homeUpdatedGridEnd);
const expectedUpdatedTopN = updatedOrder.slice(0, homeUpdatedOrder.length);
const homeUpdatedSyncOk =
  homeUpdatedOrder.length === expectedUpdatedTopN.length &&
  homeUpdatedOrder.every((slug, i) => slug === expectedUpdatedTopN[i]);

console.log("");
console.log("=== トップページ更新同期(index.html #updatedArticleList) ===");
console.log("トップページ表示件数:", homeUpdatedOrder.length);
console.log("updated.htmlの並び順で更新日降順に反する箇所(参考情報、PASS/FAILには影響しません):", updatedOrderViolations.length);
updatedOrderViolations.forEach(v => console.log(`  ${v.slug}(更新日${v.updated}) が ${v.afterSlug}(更新日${v.afterUpdated}) より後ろに表示されている`));
if (!homeUpdatedSyncOk) {
  console.error("ERROR:");
  console.error("トップページの更新記事が最新状態と一致していません。");
  console.error("");
  console.error("期待(updated.html先頭" + expectedUpdatedTopN.length + "件):");
  expectedUpdatedTopN.forEach((slug, i) => console.error(`  ${i + 1}. ${slug}(更新日${updatedBySlug[slug] || "不明"})`));
  console.error("");
  console.error("現在のトップページ:");
  homeUpdatedOrder.forEach((slug, i) => console.error(`  ${i + 1}. ${slug}(更新日${updatedBySlug[slug] || "不明"})`));
}
console.log("トップ更新同期:", homeUpdatedSyncOk ? "PASS" : "FAIL");

fs.writeFileSync(path.join(__dirname, "_audit_all_articles.json"), JSON.stringify(articles, null, 2), "utf8");
fs.writeFileSync(path.join(__dirname, "_audit_missing.json"), JSON.stringify(missing, null, 2), "utf8");
console.log("\nWrote _audit_all_articles.json (" + articles.length + ") and _audit_missing.json (" + missing.length + ")");

// サイトマップ監査もこのスクリプトの中から必ず実行する。既存のGitHub Actions
// (audit-articles.yml)は "node scripts/audit_articles.js" だけを実行しているため、
// 別workflowを増やさずにpush/PR時のサイトマップ監査を確実に効かせるための連携。
console.log("\n");
const { runSitemapAudit } = require("./audit_sitemap");
const sitemapOk = runSitemapAudit();

console.log("\n");
const { runHtmlSitemapAudit } = require("./audit_html_sitemap");
const htmlSitemapOk = runHtmlSitemapAudit();

// Fail the process (and therefore CI) only on the things that are actually broken:
// an article page that exists but isn't reachable from the all-articles hub, a
// duplicate slug, new.html falling out of sync with the hub, either of the
// homepage's "新着記事"/"更新記事" sections falling out of sync with their source
// lists, or either sitemap audit failing. Missing data-category/data-thumb-type on
// the article's own tag is informational (see above) and must not fail the build.
if (missing.length > 0 || dupes.length > 0 || !newSyncOk || !homeSyncOk || !homeUpdatedSyncOk || !sitemapOk || !htmlSitemapOk) {
  console.error(`\nFAIL: ${missing.length} article(s) missing from the hub, ${dupes.length} duplicate slug(s), 新着一覧同期=${newSyncOk ? "PASS" : "FAIL"}, トップ新着同期=${homeSyncOk ? "PASS" : "FAIL"}, トップ更新同期=${homeUpdatedSyncOk ? "PASS" : "FAIL"}, audit_sitemap=${sitemapOk ? "PASS" : "FAIL"}, audit_html_sitemap=${htmlSitemapOk ? "PASS" : "FAIL"}.`);
  process.exit(1);
}
console.log("\nOK: every article file is registered in the hub grid, no duplicate slugs, new.html and both homepage sections are in sync with their source lists, and both sitemap audits passed.");
