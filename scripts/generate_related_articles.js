// 「よくみられている記事」(js/main.js の initPopularArticles)向けに、
// 各記事の関連記事候補を静的データとして事前生成し、js/main.js の
// AUTO-GENERATED:RELATED_ARTICLES_DATA マーカー間へ書き込むスクリプト。
//
// 目的: カテゴリ単位の固定プール+初心者向け4記事への一律フォールバックという
// 旧方式(関連性が低い)を廃止し、以下の優先順位で「今読んでいる記事の次に
// 読みたい記事」に近いものを、AI/外部APIを使わず既存の静的データだけで決定的に算出する。
//
//   1. この記事が本文中で実際にリンクしている記事(著者が関連づけた最も強いシグナル)
//   2. この記事へ本文中からリンクしている記事(1の逆方向。比較記事⇄個別記事や
//      基礎記事⇄比較記事のような双方向関係を、articleType等を新設せずに再現する)
//   3. 同じカテゴリ+ブランド/トピックタグ(rakuten/dpoint/paypay/ponta/vpoint等。
//      「beginner」は対象が広すぎるため除外)が一致する記事
//   4. 同じカテゴリ+同じthumbType(表示形式が近い記事。トピックの近さを厳密には
//      保証しないが、band1〜3だけでは候補が少なすぎる記事(主に被リンクの少ない
//      ロングテール記事)を軽度に補完する役割を持つ。band1〜3より弱いシグナルの
//      ため後段に配置し、より強いシグナルを優先させている)
//   5. 同じカテゴリの「ハブ記事」(カテゴリ内で最も他記事から本文リンクされている
//      1〜2記事。比較・まとめ記事であることが多く、個別記事から比較記事へ、
//      情報記事から比較記事へ戻れる導線を補う)
//   6. 同じカテゴリの記事(被リンク数が多い=サイト内で重要度が高い記事を優先)
//   7. (最終手段、main.js側のSITE_DEFAULT_FALLBACKで処理)
//
// 実行: node scripts/generate_related_articles.js
const fs = require("fs");
const path = require("path");
const siteData = require("./lib/site-data");

const MAIN_JS_PATH = path.join(siteData.root, "js", "main.js");
const START_MARKER = "  /* AUTO-GENERATED:RELATED_ARTICLES_DATA:START */";
const END_MARKER = "  /* AUTO-GENERATED:RELATED_ARTICLES_DATA:END */";

// タグによるトピック一致の判定から除外する、対象が広すぎるタグ
const GENERIC_TAGS = new Set(["beginner"]);

const articles = siteData.listArticles();
const bySlug = {};
articles.forEach((a) => (bySlug[a.slug] = a));

// ---- 本文内部リンクグラフの構築(scripts/lib/site-dataでは未提供のため、ここで抽出) ----
function extractBodyOutboundSlugs(slug) {
  const content = fs.readFileSync(path.join(siteData.articlesDir, `${slug}.html`), "utf8");
  const bodyStart = content.indexOf('<div class="article-body">');
  if (bodyStart === -1) return [];
  const endMarkers = ['<section class="related-offers"', '<section class="popular-articles"', '<nav class="article-footer-nav"', "</main>"];
  let bodyEnd = content.length;
  endMarkers.forEach((m) => {
    const idx = content.indexOf(m, bodyStart);
    if (idx !== -1 && idx < bodyEnd) bodyEnd = idx;
  });
  const body = content.slice(bodyStart, bodyEnd);

  const targets = [];
  const anchorRe = /<a\s+[^>]*href="([^"]*)"[^>]*>/g;
  let m;
  while ((m = anchorRe.exec(body))) {
    const href = m[0];
    const hrefValue = m[1];
    if (/^(https?:)?\/\//.test(hrefValue)) continue; // 外部/アフィリエイトリンクは対象外
    if (/class="cta-simple/.test(href)) continue; // 直接公式リンクのCTAボタンも対象外
    let clean = hrefValue.split("#")[0].split("?")[0];
    let targetSlug = null;
    if (clean.startsWith("../articles/")) {
      targetSlug = clean.replace("../articles/", "").replace(/\.html$/, "");
    } else if (/^[a-zA-Z0-9_-]+(\.html)?$/.test(clean)) {
      targetSlug = clean.replace(/\.html$/, "");
    }
    if (targetSlug && targetSlug !== slug && bySlug[targetSlug]) {
      targets.push(targetSlug);
    }
  }
  return Array.from(new Set(targets));
}

const outbound = {};
articles.forEach((a) => {
  outbound[a.slug] = extractBodyOutboundSlugs(a.slug);
});

const inbound = {};
articles.forEach((a) => (inbound[a.slug] = []));
Object.entries(outbound).forEach(([slug, targets]) => {
  targets.forEach((t) => {
    if (inbound[t]) inbound[t].push(slug);
  });
});

// ---- カテゴリ別ハブ記事(被リンク数が多い上位2件) ----
const byCategory = {};
articles.forEach((a) => {
  const cat = a.categoryCode || "__none__";
  byCategory[cat] = byCategory[cat] || [];
  byCategory[cat].push(a);
});
const categoryHubs = {};
Object.entries(byCategory).forEach(([cat, list]) => {
  const sorted = [...list].sort((a, b) => (inbound[b.slug].length - inbound[a.slug].length));
  categoryHubs[cat] = sorted.slice(0, 2).map((a) => a.slug);
});

// ---- カテゴリ内、被リンク数が多い順(band6の並び替え用) ----
const categoryByInboundDesc = {};
Object.entries(byCategory).forEach(([cat, list]) => {
  categoryByInboundDesc[cat] = [...list]
    .sort((a, b) => inbound[b.slug].length - inbound[a.slug].length)
    .map((a) => a.slug);
});

const MAX_CANDIDATES = 15;

const bandLog = {}; // 監査レポート用: slug -> { candidateSlug: bandLabel }

function buildCandidates(article) {
  const slug = article.slug;
  const cat = article.categoryCode;
  const tags = (article.tags || []).filter((t) => !GENERIC_TAGS.has(t));
  const picked = [];
  const pickedSet = new Set([slug]);
  bandLog[slug] = {};

  function addAll(slugs, band) {
    slugs.forEach((s) => {
      if (picked.length >= MAX_CANDIDATES) return;
      if (pickedSet.has(s)) return;
      pickedSet.add(s);
      picked.push(s);
      bandLog[slug][s] = band;
    });
  }

  // 1. 本文の出リンク先
  addAll(outbound[slug], "1_own_outbound_link");
  // 2. 本文から自分へリンクしている記事
  addAll(inbound[slug], "2_inbound_link");

  if (cat) {
    // 3. 同カテゴリ + ブランド/トピックタグ一致
    if (tags.length > 0) {
      const tagMatches = byCategory[cat]
        .filter((a) => a.slug !== slug && (a.tags || []).some((t) => tags.includes(t)))
        .map((a) => a.slug);
      addAll(tagMatches, "3_tag_match");
    }

    // 4. 同カテゴリ + 同thumbType
    if (article.thumbType) {
      const sameThumb = byCategory[cat]
        .filter((a) => a.slug !== slug && a.thumbType === article.thumbType)
        .map((a) => a.slug);
      addAll(sameThumb, "4_same_thumb_type");
    }

    // 5. 同カテゴリのハブ記事
    addAll((categoryHubs[cat] || []).filter((s) => s !== slug), "5_category_hub");

    // 6. 同カテゴリ(被リンク数が多い順)
    addAll(categoryByInboundDesc[cat], "6_same_category");
  }

  return picked.slice(0, MAX_CANDIDATES);
}

const relatedMap = {};
const metaMap = {};
articles.forEach((a) => {
  relatedMap[a.slug] = buildCandidates(a);
  metaMap[a.slug] = {
    title: a.title,
    excerpt: a.description,
    thumbType: a.thumbType || "summary",
    url: a.href,
    category: a.categoryCode,
  };
});

// ---- js/main.js への書き込み(マーカー間のみ置換) ----
function jsStringLiteral(s) {
  return JSON.stringify(s == null ? "" : s);
}

function serializeMeta(meta) {
  const lines = Object.entries(meta).map(([slug, m]) => {
    return `    ${jsStringLiteral(slug)}: { title: ${jsStringLiteral(m.title)}, excerpt: ${jsStringLiteral(m.excerpt)}, thumbType: ${jsStringLiteral(m.thumbType)}, url: ${jsStringLiteral(m.url)}, category: ${jsStringLiteral(m.category)} },`;
  });
  return lines.join("\n");
}

function serializeRelated(map) {
  const lines = Object.entries(map).map(([slug, list]) => {
    return `    ${jsStringLiteral(slug)}: [${list.map(jsStringLiteral).join(", ")}],`;
  });
  return lines.join("\n");
}

const generatedBlock = [
  START_MARKER,
  "  const RELATED_ARTICLES_META = {",
  serializeMeta(metaMap),
  "  };",
  "  const RELATED_ARTICLES_MAP = {",
  serializeRelated(relatedMap),
  "  };",
  END_MARKER,
].join("\n");

const mainJs = fs.readFileSync(MAIN_JS_PATH, "utf8");
const startIdx = mainJs.indexOf(START_MARKER);
const endIdx = mainJs.indexOf(END_MARKER);
if (startIdx === -1 || endIdx === -1) {
  console.error("マーカーが見つかりません。js/main.js の AUTO-GENERATED:RELATED_ARTICLES_DATA マーカーを確認してください。");
  process.exit(1);
}
const newMainJs = mainJs.slice(0, startIdx) + generatedBlock + mainJs.slice(endIdx + END_MARKER.length);
fs.writeFileSync(MAIN_JS_PATH, newMainJs);

// 監査レポート用の内部データ(サイトには含めない、reports/ 生成時のみ使用)
fs.writeFileSync(
  path.join(siteData.root, "scripts", "_related_articles_bands.json"),
  JSON.stringify({ bandLog, relatedMap, metaMap }, null, 1)
);

// ---- サマリー表示 ----
const noCandidates = articles.filter((a) => relatedMap[a.slug].length === 0);
const fewCandidates = articles.filter((a) => relatedMap[a.slug].length > 0 && relatedMap[a.slug].length < 4);
console.log(`関連記事データを生成しました: ${articles.length}記事`);
console.log(`候補0件(最終フォールバックのみ表示される記事): ${noCandidates.length}件`);
if (noCandidates.length > 0) console.log("  " + noCandidates.map((a) => a.slug).join(", "));
console.log(`候補1〜3件(フォールバックで一部補完される記事): ${fewCandidates.length}件`);
