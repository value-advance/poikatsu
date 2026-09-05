// sitemap.xml(サイトマップインデックス)と、そこから参照される
// sitemap-articles.xml / sitemap-categories.xml / sitemap-pages.xml を、
// 実際の記事・カテゴリ・固定ページのHTMLファイルから生成して書き出す。
//
// 手書きのURL配列は持たない。記事を追加・更新したら、このスクリプトを
// 実行するだけでサイトマップ全体が最新化される。
//
// 実行方法: node scripts/generate_sitemap.js
const fs = require("fs");
const path = require("path");
const { root, MAX_URLS_PER_SITEMAP, isWellFormedXml, buildSitemaps } = require("./lib/sitemap");

const { files, counts } = buildSitemaps();

for (const [fileName, xml] of Object.entries(files)) {
  if (!isWellFormedXml(xml)) {
    console.error(`ERROR: ${fileName} の生成結果が不正なXMLです。書き込みを中止しました。`);
    process.exit(1);
  }
  const urlCount = (xml.match(/<loc>/g) || []).length;
  if (urlCount > MAX_URLS_PER_SITEMAP) {
    console.error(`ERROR: ${fileName} のURL数(${urlCount})がSitemaps protocolの上限(${MAX_URLS_PER_SITEMAP})を超えています。`);
    process.exit(1);
  }
  fs.writeFileSync(path.join(root, fileName), xml, "utf8");
}

console.log("サイトマップを生成しました。");
console.log("  sitemap.xml          : サイトマップインデックス");
console.log(`  sitemap-articles.xml  : 記事 ${counts.articles}件`);
console.log(`  sitemap-categories.xml: カテゴリ ${counts.categories}件`);
console.log(`  sitemap-pages.xml     : その他ページ ${counts.pages}件`);
