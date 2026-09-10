# インデックス未登録7記事の監査・修正レポート(2026-09-10)

Google Search Consoleで「クロール済み - インデックス未登録」になっていた7記事について、
まずリポジトリ全体を監査し(技術SEO・検索意図の重複・内部リンク・サイトマップ)、
その判断結果にもとづいて必要な記事のみ修正した。記事を長くする/水増しする対応は行っていない。

**追記(2026-09-10 続報)**: 下記1-D「matsui-shouken-ideco-poikatsu」のNEEDS_EXTERNAL_FACT_CHECK項目について、
ユーザーが松井証券公式サイトで確認した最新情報の提供を受け、記事を更新した(手数料内訳・還元率比較の基準日など)。
詳細はこのレポート末尾の「追記:外部確認完了(2026-09-10)」セクションを参照。

## 0. サイト全体の技術SEO監査結果(修正前のベースライン)

`node scripts/audit_articles.js`(sitemap監査・HTMLサイトマップ監査込み)を実行し、以下を確認した。

- 408記事すべてが記事ハブ(`pages/articles/index.html`)に登録済み、孤立ページ・重複slugなし
- noindex記事: 0件
- サイトマップ(`sitemap.xml` / `sitemap-articles.xml` 等)の生成内容とリポジトリ保存内容は一致、URL重複・非HTTPS・別ドメイン・`.html`重複URL・クエリ付きURLはいずれも0件
- canonical不一致・サイトマップ未登録・lastmod不一致・存在しない記事/カテゴリURLの残存: いずれも0件
- `robots.txt` はサイトマップを正しく指定しており、ブロックもなし

→ **7記事とも技術的なインデックスブロック要因(noindex/robots遮断/canonical誤り/孤立/サイトマップ不整合)は確認されなかった**。
既存の実装(canonicalは拡張子なしURL、`.html`→拡張子なしのCloudFront/S3側301リダイレクト、`generate_sitemap.js`によるサイトマップ自動生成)は健全な状態。
したがって、今回の未インデックスの主因は技術要因ではなく、**検索意図の重複・内容の薄さ・内部リンクの少なさ**と判断し、記事ごとに個別に調査した。

サイト全体に`.html`重複URLの実体は存在せず、過去のcanonical統一作業(コミット `e8e7eb0` 等)で解消済みのため、
今回「統合」と判断した記事についても、**実体のある新規リダイレクト機構は作っていない**(詳細は1-Aを参照)。

---

## 1. 記事ごとの調査結果と対応

### A. rakuten-travel-supersale-entry-coupon

- **現在の問題**: 本文からの被リンクが `rakuten-travel-supersale-poikatsu` 1記事のみと少ない
- **重複候補**: `rakuten-travel-supersale-poikatsu`(スーパーSALE全般の予約前チェックリスト)
- **検索意図の比較(本文を実際に比較した結果)**:
  - `rakuten-travel-supersale-poikatsu` = 毎回のスーパーSALEに共通する評価軸(クーポン優先順位・ポイント倍率・キャンセル条件・予算管理)を扱う**評価軸ガイド**
  - `rakuten-travel-supersale-entry-coupon` = 2026年9月開催回に固有の日付・エントリー要否・クーポン併用ルールを扱う**開催回別の実務情報**
  - 両記事はすでに本文・footer navで相互リンクされており、内容の重複よりも役割分担(評価軸ガイド⇄開催回別詳細)として機能している
- **判断: 統合しない**。理由は上記の通り検索意図が明確に異なるため(NO_CHANGE_REQUIRED、ただし内部リンクのみ強化)
- **実施した修正**: `ryokou-yoyaku-point.html`の「4. キャンペーン確認の手順」内に、両記事への文脈リンクを追加(内部リンクの薄さを補強)
- **内部リンク変更**: `ryokou-yoyaku-point` → 本記事、`rakuten-travel-supersale-poikatsu` の計2本を追加
- **統合**: せず / **redirect**: せず
- **updatedAt変更**: 本記事は変更なし(リンク追加はリンク元の`ryokou-yoyaku-point`側で発生。リンク元・リンク先いずれもリンク追加のみのためupdatedAtは変更していない)
- **sitemapへの影響**: なし
- **ステータス**: `NO_CHANGE_REQUIRED`(統合判断) / `INTERNAL_LINK_UPDATED`(リンク強化)

### B. paypay-point-kiso

- **現在の問題**: title/H1が「貯め方・使い方・注意点」を含み、実際に本文の半分近くが`paypay-point-tamekata`(貯め方)・`paypay-point-tsukaikata`(使い方)と重複する具体的手順を再説明していた
- **重複候補**: `paypay-point-tamekata`、`paypay-point-tsukaikata`
- **検索意図の比較(本文を実際に比較した結果)**:
  - `paypay-point-tamekata`・`paypay-point-tsukaikata` はいずれも2026年8月作成の高品質な記事(JSON-LD/OGP完備、具体的な手順・accordion・比較表つき)で、貯め方/使い方それぞれの検索意図をすでに明確に分離できていた
  - 一方 `paypay-point-kiso`(2026年7月作成、JSON-LD/OGPなし)は、後から作られたこの2記事とH2見出し・FAQ・具体的な手順が重複しており、内容の質でも劣後していた(例:有効期限の説明がkisoは曖昧、tamekataは公式情報にもとづき明確)
- **判断: 3記事は統合せず、役割分担で維持**。`paypay-point-kiso`を「PayPayポイントとは(仕組み・基本ルールの定義)」専用ページとして再構成し、具体的な貯め方・使い方は完全に他の2記事へ譲る方針とした
- **実施した修正(paypay-point-kiso)**:
  - title/H1/meta description/OGP/Twitterカードを「仕組みと基本ルール」に特化する内容へ変更
  - 重複していた「PayPay決済で貯める方法」「Yahoo!ショッピングで貯める方法」「初めてPayPayを使うときの準備」「PayPayポイントの確認方法」「無理なく貯め続けるコツ」「向いている使い方」の各セクションを削除
  - 代わりに「PayPay残高との違い」「通常ポイントと期間限定ポイントの違い」「ポイント運用とは」「有効期限の基本ルール」という定義中心の構成に再編し、貯め方・使い方の詳細は`paypay-point-tamekata`/`paypay-point-tsukaikata`への誘導カードに置き換えた
  - FAQを定義系の5問(残高との違い/1ポイント何円/期間限定ポイントとの違い/送金・出金可否/ポイント運用要否)に絞り込み
  - サイト内の他記事(tamekata/tsukaikata含む)と揃える形でBreadcrumbList・FAQPageのJSON-LD、OGP/Twitterカードを新設
  - `paypay-point-tamekata`・`paypay-point-tsukaikata` 自体は、すでに検索意図が明確に分離できていたため変更していない(過剰な修正を避けるため)
- **内部リンク変更**: kiso本文の序盤・末尾にtamekata/tsukaikataへの誘導リンクを追加。加えて、旧タイトル文字列を参照していた8ファイル(`new.html`、`index.html`、`paypay-jichitai-campaign-2026.html`、`paypay-point-tamekata.html`、`paypay-point-tsukaikata.html`、`softbank-ymobile-paypay-point.html`、`starbucks-poikatsu.html`、`yahoo-travel-ultrasale-poikatsu.html`)のカード表示・アンカーテキストを新タイトルに統一し、`js/main.js`の`ARTICLE_SEARCH_INDEX`(サイト内検索用データ)も更新
- **統合**: せず(役割分担で維持) / **redirect**: せず
- **updatedAt変更**: あり(2026.07.10 → 2026.09.10、実質的な構成変更のため)。`pages/articles/updated.html`とトップページ「更新記事」に本記事を新規登録
- **sitemapへの影響**: `sitemap-articles.xml`の本記事の`lastmod`が`2026-09-10`に更新(`generate_sitemap.js`で自動反映)
- **ステータス**: `CONTENT_UPDATED`

### C. fx-kouza-anken-poikatsu

- **現在の問題**: 「開設のみ vs 取引条件」の対比、レバレッジの基本注意など骨格はあるが、案件比較の実務的な視点(Lot数の考え方・成果対象外条件・比較チェックリスト)が欠けており、一般論の反復にとどまっていた。本文内部リンクも0件だった
- **重複候補**: 明確な重複記事なし(`shouken-kouza-anken-poikatsu`・`kasoshisan-kouza-anken-poikatsu`はテーマが近いが対象金融商品が異なり、むしろ相互補完関係)
- **実施した修正**:
  - 「2. 取引条件の確認」の表に「入金条件あり」「成果対象外」の行を追加
  - 新設「3. 案件比較時に確認したいチェック項目」で、開設のみ/取引量条件/成果対象外条件/獲得ポイントとリスクの見合いを整理
  - Lot数について、**特定の数値を断定せず**「1,000通貨単位・10,000通貨単位など複数の基準が使われている」という一般的な金融知識の範囲で説明を追加(架空のポイント額・キャンペーン・ASP案件は一切作成していない)
  - `shouken-kouza-anken-poikatsu`・`kasoshisan-kouza-anken-poikatsu`への文脈内部リンクを本文中に追加(従来はfooter navのみ)
  - 断定的な利益表現は元々使われておらず、今回追加した内容でも使用していない
- **内部リンク変更**: 本文内リンク2本を新規追加(footer navは変更なし)
- **統合**: せず / **redirect**: せず
- **updatedAt変更**: あり(2026.08.04 → 2026.09.10、実質的な内容強化のため)。`pages/articles/updated.html`とトップページ「更新記事」に本記事を新規登録
- **sitemapへの影響**: `lastmod`が`2026-09-10`に更新
- **ステータス**: `CONTENT_UPDATED`

### D. matsui-shouken-ideco-poikatsu

- **現在の問題**: 本文内部リンクが0件。「投信残高ポイントサービス最大1%」の還元率優位性比較が「当社調べ、2024年7月31日時点」という2年以上前の基準日にもとづいており、現在も成立するか repo内の情報だけでは確認できない
- **実施した修正**: 数値・比較優位性の記述は一切書き換えず(推測で事実を追加しないという方針を厳守)、本文序盤と「こんな方におすすめ」節に`shouken-kouza-anken-poikatsu`・`dmm-kabu-poikatsu`への文脈内部リンクを追加
- **NEEDS_EXTERNAL_FACT_CHECK(外部公式情報での確認が必要な項目)**:
  - 運営管理手数料が現在も0円か
  - 取扱商品数(40種類/法令上31商品)の現状
  - 投信残高ポイントサービスの還元率(最大1%)・対象銘柄数(全39種類)が現状も同じか
  - 「オンライン証券大手5社中で還元率最高」の比較優位性が2026年9月時点でも成立するか(基準日2024.07.31から2年超経過)
  - iDeCo制度自体(拠出限度額等)に2024年以降の改正が反映されているか
- **内部リンク変更**: 本文内リンク2本を新規追加
- **統合**: せず / **redirect**: せず
- **updatedAt変更**: なし(内部リンク追加のみで、数値・構成に実質変更を加えていないため。ルール6「リンク修正だけで最新記事に見せる日付更新は禁止」に従った)
- **sitemapへの影響**: なし(lastmod変更なし)
- **ステータス**: `INTERNAL_LINK_UPDATED` + `NEEDS_EXTERNAL_FACT_CHECK`

---

## 2. 新規3記事(2026.09.05作成)の扱い

技術上・構造上の問題(hub未登録・孤立・canonical不一致・リンク切れ)はいずれも確認されなかった。
「インデックス未登録=リライトが必要」という前提を取らず、記事ごとに重複・薄さ・内部リンクを個別確認した。

### pointsite-kyakka-genin

- 明確な重複記事なし(`pointsite-hanteimachi-toha`「判定待ちとは」とは状態が異なり補完関係、`point-tsukanai-genin`とは扱う範囲が異なる)
- 本文文字数・内部リンク(本文9件)とも同カテゴリの他記事と同水準で、薄さの問題もなし
- **判断: 技術上・構造上問題なし、大規模修正は行わない**
- **ステータス**: `NO_CHANGE_REQUIRED`

### poikatsu-taikai-mae-kakunin

- 明確な重複記事なし。ただし3記事中もっとも内部リンク・被リンクが少なく、本文もやや薄め
- **実施した修正(小規模)**: 「3. 未承認ポイントの扱い」節に`pointsite-hanteimachi-toha`(判定待ちとは)・`pointsite-kyakka-genin`(却下される原因)への文脈内部リンクを本文・footer navに追加。文章量を増やすための追記は行っていない
- **内部リンク変更**: 本文内リンク2本+footer nav1本を新規追加
- **updatedAt変更**: なし(リンク追加のみ)
- **ステータス**: `INTERNAL_LINK_UPDATED`

### kakuyasu-sim-norikae-poikatsu

- 明確な重複記事なし(単体SIM会社記事とは切り口が異なり、むしろそちらから本記事へリンクされる構造)
- 6社の特典比較表・事務手数料比較表をすでに保有しており、比較情報は十分。3記事中もっとも被リンクが多く、内部リンクも十分
- **判断: 技術上・構造上問題なし。既に比較情報が十分にあるため、文章量を増やす修正は行わない**
- **ステータス**: `NO_CHANGE_REQUIRED`

---

## 3. 内部リンク監査(修正後)

全編集ファイルについて、本文中の内部リンク先(bare-slugリンク)が実在する記事ファイルに解決するかを機械的に検証し、**リンク切れ0件**を確認した。
また `node scripts/audit_articles.js`(サイトマップ監査・HTMLサイトマップ監査を含む)を再実行し、以下すべてPASSを確認した。

- 記事ハブ登録・重複slug・孤立ページ: 問題なし
- `new.html`・トップページ「新着記事」「更新記事」の同期: PASS
- サイトマップ(生成内容と保存内容の一致・URL重複・canonical不一致・noindex混入・lastmod不一致・存在しないURLの残存): すべて0件でPASS
- HTMLサイトマップ(`/pages/sitemap`)の404リンク・旧`.html` URL・canonical不一致・noindexリンク混入: すべて0件でPASS

## 4. 関連記事ロジック(`data/related_articles.json`)について

調査の結果、本サイトでは`data/related_articles.json`という独立ファイルは存在せず、`scripts/generate_related_articles.js`が
`js/main.js`内の`AUTO-GENERATED:RELATED_ARTICLES_DATA`マーカー間に関連記事データを直接書き込む方式だった(README.mdおよびスクリプト本体で確認)。
今回の内容変更(特にpaypay-point-kisoのtitle/description変更、内部リンクの追加・削除)を反映するため`node scripts/generate_related_articles.js`を実行し、
408記事分の関連記事データを再生成した。候補0件の記事は0件を維持。

## 5. サイトマップ

`scripts/generate_sitemap.js`(手書きURL配列を持たず、実ファイルから自動生成する既存方式)を実行し、`sitemap.xml` / `sitemap-articles.xml` / `sitemap-categories.xml` / `sitemap-pages.xml`
を再生成した。更新した2記事(paypay-point-kiso、fx-kouza-anken-poikatsu)のlastmodが2026-09-10に反映され、他記事のlastmodは変更されていないことを確認済み。

## 6. updatedAt変更のあった記事

| 記事 | 変更 | 理由 |
|---|---|---|
| paypay-point-kiso | 2026.07.10 → 2026.09.10 | title/H1/構成の実質的な再編 |
| fx-kouza-anken-poikatsu | 2026.08.04 → 2026.09.10 | 比較チェック項目・Lot数説明などの実質的な内容追加 |

上記以外(matsui-shouken-ideco-poikatsu、poikatsu-taikai-mae-kakunin、rakuten-travel-supersale-entry-coupon〈リンク元のryokou-yoyaku-point〉)は
内部リンク追加のみのためupdatedAtを変更していない。

## 7. 集計

| ステータス | 件数 | 対象 |
|---|---|---|
| INDEXING_FIX | 0 | (技術的なインデックス阻害要因が無かったため該当なし) |
| NO_CHANGE_REQUIRED | 3 | rakuten-travel-supersale-entry-coupon(統合判断)、pointsite-kyakka-genin、kakuyasu-sim-norikae-poikatsu |
| CONTENT_UPDATED | 2 | paypay-point-kiso、fx-kouza-anken-poikatsu |
| INTERNAL_LINK_UPDATED | 4 | rakuten-travel-supersale-entry-coupon(+poikatsu側)、matsui-shouken-ideco-poikatsu、poikatsu-taikai-mae-kakunin、paypay-point-kiso |
| MERGED | 0 | (実際に検索意図が異なると判断したため統合した記事なし) |
| REDIRECTED | 0 | (統合なしのためredirectなし) |
| NEEDS_EXTERNAL_FACT_CHECK | 1 | matsui-shouken-ideco-poikatsu |

(1記事が複数ステータスに該当する場合があるため、件数の単純合計は7と一致しない)

## 8. GSCで次に行う操作(ユーザー側の作業)

Claude CodeからGoogle Search Consoleへは直接アクセスできないため、以下はユーザー側での確認をお願いします。
「インデックス登録をリクエストしました」「Googleがインデックスしました」等の実施報告はこのレポートには含めていません。

今回コンテンツ・内部リンクを変更した2記事について、GSCで以下の手順を実施してください。

1. **paypay-point-kiso**(`https://value-advance.com/pages/articles/paypay-point-kiso`)
   - URL検査 → 公開URLをテスト → canonical・インデックス登録可否を確認 → 問題なければ「インデックス登録をリクエスト」
2. **fx-kouza-anken-poikatsu**(`https://value-advance.com/pages/articles/fx-kouza-anken-poikatsu`)
   - 同上の手順

以下の記事は内部リンクのみの変更(実質的なコンテンツ変更なし)のため、インデックス登録の再リクエストは必須ではありませんが、
次回のクロール状況を確認したい場合はURL検査で現状確認のみ行うことをおすすめします。

- matsui-shouken-ideco-poikatsu
- poikatsu-taikai-mae-kakunin
- rakuten-travel-supersale-entry-coupon

技術上・構造上問題がなく無修正とした以下2記事は、時間経過とともに内部リンクが蓄積し自然にクロール頻度が上がるのを待つのが妥当です。
現時点で追加のGSC操作は不要です。

- pointsite-kyakka-genin
- kakuyasu-sim-norikae-poikatsu

なお、matsui-shouken-ideco-poikatsuについては、本レポート4節に記載した手数料・商品数・還元率比較の数値が現在も正しいか、
松井証券の公式サイトで確認したうえで、必要であれば数値の更新をご検討ください(本タスクでは数値の書き換えは行っていません)。

---

## 追記:外部確認完了(2026-09-10)

ユーザーが松井証券公式サイトで確認した以下の情報を基準に、matsui-shouken-ideco-poikatsu.htmlを更新した。

- 松井証券の運営管理手数料は0円だが、iDeCo制度上、国民年金基金連合会105円/月・信託銀行(事務委託先金融機関)66円/月が別途かかり、掛金拠出者の合計負担は171円/月
- 新規加入・企業年金からの移換時は2,829円
- 取扱商品数は松井証券公式サイト上「40種類」(2026年9月時点掲載)、法令上はターゲットシリーズを1商品とするため31商品
- 投信残高ポイントサービスは年間最大1%(銘柄により異なる)、iDeCoも対象、オンライン証券大手5社比較で全銘柄が業界最高の還元率と松井証券が公表(松井証券調べ、2026年8月5日時点)

### 変更内容

- **title**: 「手数料0円」という曖昧な表現を「運営管理手数料0円」に修正
- **基本情報表**: 「運営管理手数料」行を「松井証券の運営管理手数料」に改名し0円の対象を明確化。「加入者が毎月負担する費用(合計171円/月の内訳)」「新規加入・移換時の手数料(2,829円)」を新規行として追加。「取扱商品数」行に「2026年9月時点で松井証券公式サイト上の掲載」の注記を追加
- **警告ボックス新設**: 「『手数料0円』の意味について」を基本情報表の直後に追加し、0円は運営管理手数料のみであることを明記
- **主な特徴・メリット**: 手数料0円の記述をすべて「松井証券の運営管理手数料が0円」に統一し、171円/月・2,829円の情報を追記
- **投信残高ポイントサービスの比較記述**: 比較基準日を「2024年7月31日時点」→「2026年8月5日時点」に更新し、「(当社調べ)」→「(松井証券調べ)」に明確化。「対象商品39種類」という未確認の具体数は削除し、「還元率は銘柄によって異なります」という確認済み情報に置き換え
- **FAQ4問**(運営管理手数料/取扱商品数/投信残高ポイントサービスの対象/還元率)を上記の確認済み情報にもとづき更新。「2024年8月1日より」という古い起点表現は、iDeCo商品を対象に含めた事実自体の記述に単純化し削除
- **まとめ**: 手数料の内訳・商品数の時点注記・還元率の銘柄差を反映

「40種類」の商品数について、事実以上の比較優位("業界最多"等)を推測する表現は追加していない。
還元率の業界最高表現には、指示どおり「松井証券調べ」と基準日を明記している。

### 実施した付随対応

- **updatedAt**: 2026.08.06 → 2026.09.10 に変更
- **sitemap**: `node scripts/generate_sitemap.js` を再実行し、`sitemap-articles.xml` の本記事のlastmodを2026-09-10に同期
- **関連記事**: `node scripts/generate_related_articles.js` を再実行し、内部リンク変化を反映して408記事分を再生成
- **`pages/articles/updated.html`・トップページ「更新記事」**: 本記事を最新更新として先頭に追加(全36件→37件)
- **`js/main.js` の `ARTICLE_SEARCH_INDEX`**: date・excerptを更新
- **audit_articles.js**: 再実行し、記事ハブ登録・新着/更新同期・サイトマップ監査・HTMLサイトマップ監査すべてPASS(exit code 0)を確認
- **内部リンク監査**: 本文中の全リンク先が実在ファイルに解決することを機械的に確認、リンク切れ0件
- **描画確認**: ローカルサーバー+ヘッドレスブラウザで記事ページ・トップページをレンダリングし、新しい数値(171円・2,829円・2026年8月5日等)が正しく表示されること、ヘッダー/フッターが正常に読み込まれることを確認済み

### ステータス更新

matsui-shouken-ideco-poikatsu: `NEEDS_EXTERNAL_FACT_CHECK` → `CONTENT_UPDATED`(外部確認完了・反映済み)
