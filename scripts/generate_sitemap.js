// sitemap.xml(サイトマップインデックス)と、そこから参照される子サイトマップ
// (sitemap-articles.xml / sitemap-categories.xml / sitemap-pages.xml)を、
// 実際の記事・カテゴリ・固定ページのHTMLファイルから生成して書き出す。
//
// 手書きのURL配列は持たない。記事を追加・更新・削除・統合したら、このスクリプトを
// 実行するだけでサイトマップ全体が最新化される(掲載・除外のルールは scripts/lib/sitemap.js)。
//   ・中身が変わっていないファイルは書き換えない(改行コードの違いだけでは書き換えない)
//   ・URL数が上限を超えたら sitemap-articles-1.xml … に自動分割し、不要になった分割ファイルは削除する
//
// 実行方法: node scripts/generate_sitemap.js
// 確認方法: node scripts/audit_sitemap.js(本番の確認も行う場合は --live)
const fs = require("fs");
const path = require("path");
const {
  root,
  validateSitemapXml,
  normalizeEol,
  buildSitemaps,
  listManagedSitemapFilesOnDisk,
} = require("./lib/sitemap");

const { files, children, counts, excluded } = buildSitemaps();

let hasError = false;
for (const [fileName, xml] of Object.entries(files)) {
  const errors = validateSitemapXml(xml);
  if (errors.length) {
    hasError = true;
    console.error(`ERROR: ${fileName} の生成結果が不正です。書き込みを中止しました。`);
    errors.slice(0, 10).forEach(e => console.error("  - " + e));
  }
}
if (hasError) process.exit(1);

const written = [];
const unchanged = [];
for (const [fileName, xml] of Object.entries(files)) {
  const filePath = path.join(root, fileName);
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
  if (normalizeEol(current) === xml) {
    unchanged.push(fileName);
    continue;
  }
  fs.writeFileSync(filePath, xml, "utf8");
  written.push(fileName);
}

// 分割数が減った場合などに残る、どこからも参照されない古いサイトマップファイルを削除する。
const removed = [];
for (const fileName of listManagedSitemapFilesOnDisk()) {
  if (!(fileName in files)) {
    fs.unlinkSync(path.join(root, fileName));
    removed.push(fileName);
  }
}

console.log("サイトマップを生成しました。");
console.log(`  記事        : ${counts.articles}件`);
console.log(`  カテゴリ    : ${counts.categories}件`);
console.log(`  その他ページ: ${counts.pages}件`);
console.log(`  合計        : ${counts.articles + counts.categories + counts.pages}件`);
console.log("  sitemap.xml(インデックス)の子サイトマップ:");
children.forEach(c => console.log(`    ${c.fileName}  lastmod=${c.lastmod || "(なし)"}`));
console.log(`  書き込み: ${written.length ? written.join(", ") : "なし(変更なし)"}`);
if (removed.length) console.log(`  削除した古い分割ファイル: ${removed.join(", ")}`);
if (excluded.length) {
  console.log(`  サイトマップから除外したページ: ${excluded.length}件`);
  excluded.forEach(x => console.log(`    [${x.reason}] ${x.file}${x.canonical && x.canonical !== x.url ? `(canonical: ${x.canonical})` : ""}`));
}
