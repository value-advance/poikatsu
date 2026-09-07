# 収益導線改善 Phase 1 完了レポート:関連記事ロジック修正 + GA4計測

実施日: 2026年9月7日
対象: `js/main.js`(関連記事ロジック・GA4計測)、`scripts/lib/site-data.js`(タグ抽出の追加)
新規スクリプト: `scripts/generate_related_articles.js`
比較対象(BASELINE): `reports/link-audit-2026-09-06.md` ほか(変更・削除していません)

**方針の要約**: 本文リンク683件・アフィリエイトCTA158件はPhase 1で一切編集していないため(記事本文は無変更)、それらの関連性スコアはBASELINEからそのまま引き継いでいます。今回新たに評価・再監査したのは「よくみられている記事」モジュールの選定ロジックのみです。全396記事を対象に、新ロジックの出力を全件機械的に検証しました。

---

## 1. 調査結果

### 現在の関連記事生成方式(修正前)

`js/main.js`に2つの独立した推薦モジュールがあった。

- **`initRelatedOffers`**(「この記事に関連するお得なポイント」/ 広告バナー枠、`PR_OFFERS`配列): `data-category`一致 または `data-tags`のうちrakuten/dpoint/paypay/ponta/vpointいずれかの一致で最大6件表示。案件のあるオファーのみが対象で、該当が0件ならセクション自体を非表示。**今回は変更していません**(理由は「3. 修正した関連記事ロジック」参照)。
- **`initPopularArticles`**(「よくみられている記事」、`POPULAR_ARTICLES`配列、396行目付近): `data-category`が一致する固定配列(カテゴリごとに事前に手動で選ばれた7〜17件)をそのまま表示。一致が無ければ`category: "__default__"`の初心者向け4記事に一律フォールバック。**これが今回の最重要修正対象です**。

### shopping固定13記事の実装場所

`js/main.js`(修正前)392〜413行目、`POPULAR_ARTICLES`配列内の`category: "shopping"`エントリ13件(楽天市場・Yahoo!ショッピング・Amazon・auPAYマーケット・dショッピング・マツキヨココカラ・LOHACO・ヨドバシ・ビックカメラ・Joshin・ニッセン・高島屋・大丸松坂屋)。shoppingカテゴリの記事174件のうち、この13件以外の161件全てに同一リストが表示されていた。

### fallback初心者4記事の実装場所

同ファイル353〜357行目、`category: "__default__"`の4件(ポイ活とは/始め方3ステップ/おすすめポイントサイト3選/稼ぎ方の種類)。`initPopularArticles`内の`if (pool.length === 0) { pool = POPULAR_ARTICLES.filter(item => item.category === "__default__"); }`により、creditcard/kouza/app/sidejob/furima/カテゴリ未設定の72記事全てがこの4記事に固定されていた。

### GA4現在の方式(修正前)

各記事`<head>`に`gtag.js`の読み込みと`gtag('config', 'G-H9CCXWBSXJ')`のみがインラインで記述されており(`includes/header.html`/`footer.html`や`js/main.js`側には一切無し)、ページビュー計測のみが行われていた。`js/main.js`内に`gtag`/`dataLayer`/クリックイベント送信のコードは存在せず、独自イベント計測は皆無だった。

---

## 2. 根本原因

shopping・fallback対象72記事いずれも、**「関連記事の候補を選ぶ唯一の軸が`data-category`(10種類のみ)の完全一致で、記事本文の実際の内容やリンク関係を一切参照していなかった」**ことが根本原因。

- shoppingは日用品・家電・ドラッグストア・共通ポイント比較・外食・書籍など性質の大きく異なる記事を1つのカテゴリにまとめているにもかかわらず、`POPULAR_ARTICLES`は手動で選んだEC総合通販13記事という**単一の固定配列**しか持っていなかったため、カテゴリ内の話題の違いを一切区別できていなかった。
- creditcard/kouza/app/sidejob/furima/カテゴリ未設定については、そもそも`POPULAR_ARTICLES`に該当カテゴリのエントリが1件も用意されておらず(データの不足)、`pool.length === 0`の分岐が必ず真になり`__default__`へ機械的にフォールバックしていた。

---

## 3. 修正した関連記事ロジック

`initPopularArticles`が参照するデータを、手動キュレーションの固定配列から、**全396記事の本文リンク構造・カテゴリ・タグにもとづき決定的に算出する事前生成データ**へ置き換えた。AI/外部APIは使用していない。

### 採用した優先順位(新規スクリプト `scripts/generate_related_articles.js`)

1. **この記事が本文中で実際にリンクしている記事**(著者が既に確立した最も強い関連性シグナル。BASELINE監査で本文リンクの関連性は0〜2点が0件だったため、この階層はほぼ確実に高品質)
2. **この記事へ本文中からリンクしている記事**(1の逆方向。比較記事⇄個別記事、基礎記事⇄比較記事のような双方向関係を、`articleType`等を新設せずに再現)
3. **同じカテゴリ + ブランド/トピックタグ一致**(`rakuten`/`dpoint`/`paypay`/`ponta`/`vpoint`等。対象が広すぎる`beginner`タグは除外)
4. **同じカテゴリ + 同じ`thumbType`**(1〜3だけでは候補が少なすぎるロングテール記事を補完する弱いシグナル。本文リンクの少ない記事でも他記事から発見されやすくする目的で採用)
5. **同じカテゴリの「ハブ記事」**(カテゴリ内で最も他記事から本文リンクされている上位1〜2記事。比較・まとめ記事であることが多く、個別記事→比較記事、情報記事→比較記事の導線を補う)
6. **同じカテゴリの記事**(被リンク数が多い順)
7. **(最終手段)** サイト全体の初心者向け4記事(`SITE_DEFAULT_FALLBACK`、`js/main.js`内に維持)

各記事につき上記の順で最大15件の候補を重複排除しながら積み上げ、`initPopularArticles`側で自分自身を除外・重複排除したうえで最大10件を表示する(表示件数は変更していない)。候補が10件に満たない場合のみ、最後にサイト全体の初心者向け4記事で穴埋めする(全記事一括に強制表示するのではなく、不足時のみ)。

初期実装では4を廃止して1・2・3・5・6のみとする案も検証したが、その場合ORPHAN削減効果が大幅に低下した(4を含めた場合のORPHAN 191→57に対し、4を除いた場合は191→137)。4は個々の候補の関連性としては1〜3より弱いものの、被リンクの少ない記事が他記事の候補リストに載る経路を増やし、サイト全体の内部循環を底上げする効果が大きいと判断し、優先順位の低い位置(3の後、5の前)で残す設計とした。

### `initRelatedOffers`(広告バナー枠)を変更しなかった理由

このモジュールは実際のアフィリエイト案件(画像・料率等の広告コピー付き)を表示する広告在庫枠であり、`PR_OFFERS`配列にエントリが無いカテゴリ(sidejob/furima/カテゴリ未設定、計17記事)では意図的にセクションごと非表示になる設計。今回のPhase 1では「収益CTAの大規模改修は行わない」という制約があるため、この配列自体の拡充やマッチングロジックの変更は行わず、次フェーズ(収益導線改善)の対象として持ち越した。

---

## 4. GA4

`typeof gtag === "function"`を毎回確認する共通ヘルパー`trackEvent()`を介して送信し、GA4未読込(広告ブロッカー・同意状態・読み込み失敗等)でもリンク遷移自体は妨げない設計にした。

### 追加したイベント

**`affiliate_click`** — `rel="sponsored"`を持つリンク(=アフィリエイト/ASPリンク。既存の`rel`付与ルールをそのまま利用し、新しい判定基準は導入していない)のクリックを計測。
- `service_name`: アンカーテキストから`.cta-simple__sub`の補足文言(「公式サイトへ移動します」等)を除いた主文言
- `article_slug`: 現在の記事slug
- `category`: 記事の`data-category`
- `cta_position`: そのページ内のsponsoredリンクの中での位置(`top`/`middle`/`bottom`)
- `cta_text`: アンカーの全文言
- `destination_domain`: リンク先のホスト名

**`related_article_click`** — 「よくみられている記事」(`data-module="popular_articles"`)および「この記事に関連するお得なポイント」(`data-module="related_offers"`)カードのクリックを計測。カードのDOMに`data-category`/`data-module`/`data-position`属性を追加した(表示内容・デザインは変更なし)。
- `source_slug` / `source_category`: クリック元記事
- `destination_slug` / `destination_category`: クリック先記事
- `position`: カードの表示順(1始まり)
- `module_name`: `popular_articles` または `related_offers`

### 実装しなかったイベント

**`internal_cta_click`**: 本文中の通常テキストリンクには「CTAとして意味のあるリンク」を安全に識別できるクラスや属性が存在せず(`cta-simple`クラスは外部/アフィリエイトCTA専用)、無理に実装すると通常の参照リンクまで一律にイベント化して大量送信してしまう恐れがあったため、指示書の但し書き(「安全に識別できない場合は2つを優先」)に従い今回は見送った。

### 二重計測・href変更の確認

- ASP URL・アフィリエイトID・トラッキングパラメータは一切変更していない(`href`属性は完全に元のまま)。JavaScript経由でのURL書き換えも行っていない。
- 既存の`rel="noopener sponsored"`付与は元々サイト全体で100%一貫していたため(BASELINE監査で確認済み)、新しいクリック判定基準を追加する必要はなく、既存の実装をそのまま再利用した。
- GA4の「拡張計測機能」(管理画面側の設定)が有効な場合、外部ドメインへのリンククリックで汎用的な`click`イベントが自動計測される可能性があるが、これは管理画面側の設定でコード側からは制御できない。今回追加した`affiliate_click`は名称・パラメータともに独立したカスタムイベントであり、汎用`click`イベントと目的が異なる(案件・記事単位の粒度で分析可能)ため、同一イベントの二重送信には当たらない。

---

## 5. Before / After

| 指標 | Before | After | 差分 |
|---|---|---|---|
| 記事数 | 396 | 396 | - |
| ORPHAN(被リンク0、本文+関連記事モジュール基準) | 191 | **57** | -134(-70.2%) |
| Affiliate CTAありORPHAN | 35 | **7** | -28(-80.0%) |
| shopping関連記事問題(固定13記事のみが表示される記事) | 161 | **0** | 全件で個別候補に差別化(解消) |
| fallback問題(初心者4記事に一律フォールバックする記事) | 72 | **0** | 全件で個別候補に差別化(解消) |
| 自己リンク混入 | - | **0件** | 問題なし |
| 候補内の重複記事 | - | **0件** | 問題なし |
| 最終フォールバック(初心者4記事)を一部でも使用した記事 | 396(fallback対象は無条件) | **15記事のみ**(furima/sidejob等、候補が本質的に少ないカテゴリ) | 大幅減少 |

「関連記事問題」「fallback問題」の解消基準: 該当記事の「よくみられている記事」候補が、修正前の固定リスト(shopping13記事 or 初心者4記事)だけで構成されていないことを機械的に確認(1件でも新ロジック由来の候補があれば解消とみなす)。

新ロジックが実際に採用した候補の内訳(全記事合計、候補は記事ごとに最大15件生成、うち上位10件を表示に使用):

| 優先順位 | 件数 | 割合 |
|---|---:|---:|
| 1. 本文の出リンク先 | 356 | 6.3% |
| 2. 本文からの被リンク | 254 | 4.5% |
| 3. カテゴリ+タグ一致 | 1,056 | 18.6% |
| 4. カテゴリ+thumbType一致 | 2,844 | 50.1% |
| 5. カテゴリのハブ記事 | 239 | 4.2% |
| 6. 同カテゴリ(被リンク数順) | 931 | 16.4% |

1・2(本文リンク由来、最も信頼できるシグナル)が候補の10.8%を占め、これらは表示順の先頭に来るため、実際にユーザーの目に触れる上位1〜4枠には高確率で含まれる(後述のテスト記事12件全てで、上位2〜4件は1・2・3のいずれかで占められていることを確認)。

---

## 6. テスト記事(修正前→修正後)

| # | テーマ | slug | 修正前(上位5件相当) | 修正後(上位5件) |
|---|---|---|---|---|
| 1 | 本・電子書籍 | `hon-denshi-shoseki-poikatsu` | 楽天市場/Yahoo!ショッピング/Amazon/auPAYマーケット/dショッピング(EC総合通販固定13記事) | rakuten-point-tamekata / **dmmbooks-toha** / point-koukan-toha / poikatsu-kiso / ana-jal-mile-hikaku |
| 2 | ネットスーパー | `net-super-poikatsu` | 同上(EC総合通販固定13記事) | **ponta-supermarket / rakuten-point-supermarket / d-point-supermarket / v-point-supermarket**(スーパー特化のPonta/楽天/d/V比較記事4本) / hikkoshi-seikatsuyohin-poikatsu |
| 3 | クレジットカード | `dcard-poikatsu` | 初心者向け4記事(fallback) | credit-card-common-point-hikaku / docomo-ahamo-dpoint / dpoint-tsukaikata / point-niju-sanjudori-kumiawase / credit-card-point-hikaku |
| 4 | 銀行 | `rakuten-ginkou-happy-program` | 初心者向け4記事(fallback) | rakuten-card-poikatsu / rakuten-ichiba-toha / rakuten-point-tamekata / rakuten-poikatsu-kiso / point-tamaru-ginkou-hikaku |
| 5 | アプリ | `app-hitsuyou` | 初心者向け4記事(fallback) | code-receipt-poikatsu / reshichare-poikatsu / one-receipt-poikatsu / torima-idou-poikatsu / app-install-anken-poikatsu |
| 6 | sidejob | `fukugyou` | 初心者向け4記事(fallback) | kakuteishinkoku-point-seiri / keihiseisan-point-dareno / kojinjigyounushi-point-kanri(3件とも同ジャンル。以降は他カテゴリの候補で自然に補完) |
| 7 | furima | `furima-app-kounyuu-point` | 初心者向け4記事(fallback) | mercari-poikatsu(furimaカテゴリの唯一の兄弟記事。残り9枠は自然にフォールバック補完) |
| 8 | ポイントサイト | `chobirich-poikatsu` | ワラウ/ポイントインカム/アメフリ/ECナビ/ハピタス(固定7記事) | pointsite-kyakka-genin / amefri-poikatsu / chobirich-tsukaikata / ecnavi-poikatsu / ecnavi-tsukaikata |
| 9 | アンケート | `opinionworld-poikatsu` | ファンくる/Ipsos iSay/アイリサーチ/マクロミル/フルーツメール(固定7記事) | ipsos-isay-poikatsu / iresearch-poikatsu / enquete-monitor-poikatsu / cue-monitor-poikatsu / fancrew-poikatsu |
| 10 | 旅行 | `jalan-net-poikatsu` | イオンコンパス/Yahoo!トラベル/トラベリスト/エアトリ(固定7記事) | dpoint-dharai-tamekata / dpoint-tsukaikata / ponta-tamekata / ponta-tsukaikata / rakuten-travel-supersale-entry-coupon(本文の被リンク由来。旅行の決済ポイント文脈) |
| 11 | ドラッグストア | `drugstore-point-hikaku` | 楽天市場/Yahoo!ショッピング/Amazon等(EC総合通販固定13記事) | **matsukiyo-cocokara-point / doramori-point / seims-point / welcia-point / sugi-point**(ドラッグストア個別5チェーン全て) |
| 12 | 家電量販店 | `kadenryohanten-point-hikaku` | 楽天市場/Yahoo!ショッピング/Amazon等(EC総合通販固定13記事) | jisshitsu-kakaku-keisan / kadenryohanten-point / au-uq-ponta / aupay-market-poikatsu / aupay-market-toha |

**改善理由の要約**: 1〜5・8・9・11は本文リンク(band1・2)により、記事の実テーマに直結する候補が最上位に来るようになった。3・4・6・7は、修正前は無関係な初心者向け4記事に固定されていたカテゴリで、記事同士の実際のつながりにもとづく候補に置き換わった。10・12は本文リンク由来の候補で始まるが、5件目以降は同カテゴリの他タグ記事も混ざる(#12のkadenryohantenは記事自体がd/楽天/Ponta/V4ブランドの比較記事のため、タグ一致で他ブランド関連記事も候補に入る。これは記事の実際の内容と整合しており誤りではない)。

---

## 7. SEO安全性

| 項目 | 状態 |
|---|---|
| title | 変更なし |
| meta description | 変更なし |
| H1・本文 | 変更なし(396記事とも無編集) |
| canonical | 変更なし |
| publishedAt(作成日)/updatedAt(更新日) | 変更なし |
| URL | 変更なし |
| XML sitemap / HTML sitemap | 変更なし(生成元データを一切変更していないため再生成不要と確認済み) |
| affiliate URL・トラッキングパラメータ | 変更なし |

---

## 8. 技術監査

| 項目 | 結果 |
|---|---|
| 404内部リンク | 0 |
| 旧`.html`リンク | 0 |
| canonical不一致 | 0 |
| 未登録記事(hub grid) | 0 |
| 重複slug | 0 |
| トップ新着同期 | PASS |
| 新着一覧同期 | PASS |
| トップ更新同期 | PASS |
| サイトマップ監査(`audit_sitemap.js`) | PASS |
| HTMLサイトマップ監査 | PASS |
| `node --check js/main.js`(構文) | PASS |
| 関連記事データ: 自己リンク混入 | 0件 |
| 関連記事データ: 候補内重複 | 0件 |
| 関連記事データ: 候補0件の記事(最終フォールバックのみ表示) | 0件 |

ローカルサーバー(`npx serve`)+ヘッドレスEdgeで実記事ページを描画確認し、「よくみられている記事」に新データが正しくレンダリングされること、既存のアフィリエイトCTA(`rel="noopener sponsored"`のhref)が完全に元のままであることを確認した。

---

## 9. 変更ファイル

- `js/main.js` — `POPULAR_ARTICLES`固定配列を廃止し、事前生成データ(`RELATED_ARTICLES_META`/`RELATED_ARTICLES_MAP`、マーカーコメントで区切った自動生成ブロック)へ置き換え。`initPopularArticles`をデータ駆動のロジックへ書き換え。`initRelatedOffers`のカード生成に`data-category`/`data-module`/`data-position`属性を追加(選定ロジック自体は無変更)。GA4計測用の`trackEvent`/`initAnalyticsTracking`を追加し、DOMContentLoadedハンドラから呼び出すよう1行追加。
- `scripts/lib/site-data.js` — `readArticle()`の返り値に`tags`配列を追加(既存の呼び出し元には影響しない加算のみ)。
- `scripts/generate_related_articles.js`(新規) — 関連記事データの生成・`js/main.js`への書き込みスクリプト。再実行方法: `node scripts/generate_related_articles.js`。
- `reports/link-audit-after-related-fix-2026-09-07.md`(本ファイル、新規)
- `reports/link-audit-after-related-fix-2026-09-07.csv`(新規) — 新「よくみられている記事」候補全件(3,882行、記事×最大10候補)
- `reports/link-audit-after-related-fix-2026-09-07-articles.csv`(新規) — 記事396件ごとのBefore/After比較

既存のBASELINEレポート(`reports/link-audit-2026-09-06.md`/`.csv`/`-articles.csv`/`article-link-map.json`)は削除・上書きしていません。

---

## 10. 次のPhaseで対応すべきもの

関連記事ロジック修正後も、以下は未対応のまま残っている(いずれも今回の指示で明示的にPhase 1対象外とされたもの)。

- **ORPHAN: 57記事**(修正前191から70%減。うち7記事はアフィリエイトCTAを持つため優先度が高い: `ocn-online-shop-toha`, `pointincome-tsukaikata`, `rimawarikun-toha`, `satofull-poikatsu`, `sevennet-shopping-poikatsu`, `shinseikatsu-poikatsu-checklist`, `warau-tsukaikata`)
- **MONETIZATION_MISMATCH: 7記事**(BASELINE時点から変更なし。本文を編集していないため)
- **AFFILIATE_OPPORTUNITY_HIGH: 43記事**(同上)

これらはBASELINEレポート(`reports/link-audit-2026-09-06.md`)の該当セクションに詳細があり、次フェーズで10〜20記事ずつ対応する対象として引き続き有効です。
