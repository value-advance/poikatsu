// サイト内検索用インデックス(js/main.js の ARTICLE_SEARCH_INDEX)を、公開済みのページから
// 生成して AUTO-GENERATED:ARTICLE_SEARCH_INDEX マーカー間へ書き込むためのモジュール。
//
// 以前は記事を追加するたびに手で1行ずつ追記する運用で、追記漏れの記事が検索に出なかった。
// scripts/generate_related_articles.js から呼ばれ、次の内容を毎回すべて作り直す。
//
//   対象   : pages/articles/*.html の全記事 + pages/beginner/*.html
//   title  : 各ページの <title>(「 | ポイントの殿堂」を除く)
//   excerpt: 各ページの meta description
//   date   : 見出しに表示している更新日(無ければ作成日)
//   category / thumbType: 全記事一覧(pages/articles/index.html)のカードの
//            data-category / data-thumb-type(一覧の絞り込みと同じ表記にそろえるため)。
//            初心者向けページは「初心者向け」/ beginner 固定。
//   並び順 : 更新日の新しい順 → 作成日の新しい順 → 全記事一覧の掲載順
//
// 生成結果は手で編集しない(次回の生成で上書きされる)。
const fs = require("fs");
const path = require("path");
const siteData = require("./site-data");

const MAIN_JS_PATH = path.join(siteData.root, "js", "main.js");
const START_MARKER = "  /* AUTO-GENERATED:ARTICLE_SEARCH_INDEX:START */";
const END_MARKER = "  /* AUTO-GENERATED:ARTICLE_SEARCH_INDEX:END */";
const BEGINNER_CATEGORY_LABEL = "初心者向け";
const BEGINNER_THUMB_TYPE = "beginner";
const TITLE_SUFFIX_RE = /\s*\|\s*ポイントの殿堂\s*$/;

// 全記事一覧のカードから、slug → { category, thumbType, order } を読む。
function readHubCards() {
  const html = fs.readFileSync(path.join(siteData.articlesDir, "index.html"), "utf8");
  const cards = new Map();
  const re = /<a class="article-card" href="\/pages\/articles\/([a-zA-Z0-9_-]+)"([^>]*)>/g;
  let m;
  let order = 0;
  while ((m = re.exec(html))) {
    if (cards.has(m[1])) continue;
    cards.set(m[1], {
      category: (m[2].match(/data-category="([^"]*)"/) || [])[1] || null,
      thumbType: (m[2].match(/data-thumb-type="([^"]*)"/) || [])[1] || null,
      order: order++,
    });
  }
  return cards;
}

function buildSearchIndexEntries() {
  const hubCards = readHubCards();
  const entries = [];

  siteData.listArticles().forEach((a) => {
    const card = hubCards.get(a.slug);
    entries.push({
      title: a.title || a.h1 || a.slug,
      url: a.href,
      category: (card && card.category) || a.categoryLabel || "",
      date: a.updated || a.created || "",
      thumbType: (card && card.thumbType) || a.thumbType || "summary",
      excerpt: a.description || "",
      _created: a.created || "",
      _order: card ? card.order : Number.MAX_SAFE_INTEGER,
    });
  });

  siteData.listBeginnerPages().forEach((p) => {
    if (p.noindex) return;
    const rawTitle = (p.content.match(/<title>([^<]*)<\/title>/) || [])[1] || p.slug;
    entries.push({
      title: rawTitle.replace(TITLE_SUFFIX_RE, ""),
      url: p.href,
      category: BEGINNER_CATEGORY_LABEL,
      date: p.updated || p.created || "",
      thumbType: BEGINNER_THUMB_TYPE,
      excerpt: (p.content.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "",
      _created: p.created || "",
      _order: Number.MAX_SAFE_INTEGER,
    });
  });

  entries.sort((x, y) => {
    if (x.date !== y.date) return x.date < y.date ? 1 : -1;
    if (x._created !== y._created) return x._created < y._created ? 1 : -1;
    if (x._order !== y._order) return x._order - y._order;
    return x.url < y.url ? -1 : x.url > y.url ? 1 : 0;
  });
  return entries;
}

function jsStringLiteral(s) {
  return JSON.stringify(s == null ? "" : s);
}

function buildSearchIndexBlock() {
  const lines = buildSearchIndexEntries().map((e) => {
    return `    { title: ${jsStringLiteral(e.title)}, url: ${jsStringLiteral(e.url)}, category: ${jsStringLiteral(e.category)}, date: ${jsStringLiteral(e.date)}, thumbType: ${jsStringLiteral(e.thumbType)}, excerpt: ${jsStringLiteral(e.excerpt)} },`;
  });
  return [START_MARKER, "  const ARTICLE_SEARCH_INDEX = [", ...lines, "  ];", END_MARKER].join("\n");
}

function findBlock(mainJs) {
  const startIdx = mainJs.indexOf(START_MARKER);
  const endIdx = mainJs.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return null;
  return { startIdx, endIdx: endIdx + END_MARKER.length };
}

// js/main.js のマーカー間だけを置き換える。戻り値は登録件数。
function writeSearchIndex() {
  const mainJs = fs.readFileSync(MAIN_JS_PATH, "utf8");
  const pos = findBlock(mainJs);
  if (!pos) {
    throw new Error("js/main.js に AUTO-GENERATED:ARTICLE_SEARCH_INDEX マーカーが見つかりません。");
  }
  const block = buildSearchIndexBlock();
  fs.writeFileSync(MAIN_JS_PATH, mainJs.slice(0, pos.startIdx) + block + mainJs.slice(pos.endIdx));
  return block.split("\n").length - 4;
}

// js/main.js の内容が、いま生成した場合の内容と一致しているか(監査用)。
function checkSearchIndex() {
  const mainJs = fs.readFileSync(MAIN_JS_PATH, "utf8");
  const pos = findBlock(mainJs);
  if (!pos) return { ok: false, reason: "マーカーが見つかりません", count: 0 };
  const expected = buildSearchIndexBlock();
  const current = mainJs.slice(pos.startIdx, pos.endIdx).replace(/\r\n/g, "\n");
  return {
    ok: current === expected,
    reason: current === expected ? "" : "js/main.js の内容が最新の記事と一致していません(node scripts/generate_related_articles.js を実行してください)",
    count: expected.split("\n").length - 4,
  };
}

module.exports = {
  START_MARKER,
  END_MARKER,
  buildSearchIndexEntries,
  buildSearchIndexBlock,
  writeSearchIndex,
  checkSearchIndex,
};
