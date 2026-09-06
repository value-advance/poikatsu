# 内部リンク・アフィリエイトリンク関連性 全件監査レポート

調査日: 2026年9月6日
対象: `pages/articles/*.html` の実記事全件(一覧ページ`index.html`/`new.html`/`updated.html`を除く)
方針: **本レポートは監査のみ。記事・リンク・設定ファイルへの変更は一切行っていない。**

---

## 0. 監査方法(手法の透明性のため明記)

1. 396記事すべてを機械的にパースし、本文中の全リンク(内部/外部/アフィリエイト)、PR表記の有無、CTAボタン、`data-category`/`data-tags`を抽出。
2. `js/main.js`の「関連記事」「よくみられている記事」の実装コード(`initRelatedOffers`/`initPopularArticles`とその元データ`PR_OFFERS`/`POPULAR_ARTICLES`)を直接読み、**推測せずに**そのマッチングロジックを特定。特定したロジックをNode.jsで再現し、各記事で実際にどの記事が表示されるかを全記事分シミュレーションした。
3. 抽出した841件の本文リンク+アフィリエイトCTAリンクすべて(サンプルではなく全件)について、カテゴリ別に9バッチに分割し、並列のサブエージェント(Claude)にユーザー指定のルーブリック(関連性0〜5、MONETIZATION_MISMATCH、CTA_OVERUSE等)で個別採点させ、396記事すべてに対して総合スコア・TOFU/MOFU/BOFU・KEEP/REVIEW/FIX判定を付与した。
4. ASP判定・技術監査(404/重複/rel属性/http等)・孤立記事判定・「よくみられている記事」アルゴリズムの構造評価は、実際のURLパターン・コードロジックから機械的に算出した(推測による断定は行っていない)。
5. **GSC(Google Search Console)データはリポジトリ内に存在しないため、優先度付けにクリック数・CTR・掲載順位は使用していない**(推測値は使用禁止のルールに従う)。優先度は内部リンク構造・収益導線・関連性スコアのみに基づく。

---

## 1. 最重要な発見(全体を読む前に)

個別リンクの粗探しより先に、**構造的な問題2つ**が全体のインパクトの大半を占めている。これはリンクを1本ずつ直しても解決しない、アルゴリズム側の設計の問題。

### 発見A: 「よくみられている記事」がカテゴリ単位の固定リストで、shopping(174記事)の92.5%が無関係な固定リストを見せられている

`POPULAR_ARTICLES`(`js/main.js`)は`data-category`が一致する固定プール(最大10件)を表示するだけの実装。`shopping`カテゴリのプールはEC総合通販13サイト(楽天市場・Yahoo!ショッピング・Amazon・auPAYマーケット・dショッピング・マツキヨココカラ・LOHACO・ヨドバシ・ビックカメラ・Joshin・ニッセン・高島屋・大丸松坂屋)のみ。

`shopping`カテゴリは174記事あるが、このプール自体である13記事を除く**161記事(92.5%)**が、本来のテーマ(ドラッグストア比較、共通ポイント比較、外食、引っ越し、ペット用品、本・電子書籍など)と無関係な「EC総合通販13サイト」を「よくみられている記事」として見せられている。

実例で検証済み: `hon-denshi-shoseki-poikatsu`(本・電子書籍のポイ活。楽天ブックス・Kobo・hontoの比較)の「よくみられている記事」は楽天市場・Yahoo!ショッピング・Amazon・auPAYマーケット・dショッピング・マツキヨココカラ・LOHACO・ヨドバシ・ビックカメラ・Joshinの10件で、**書籍系サービスは1件も含まれない**。関連記事(related-offers)も同じ6件で同様。

### 発見B: creditcard/kouza/app/sidejob/furima/カテゴリ未設定の記事(合計72記事)は「よくみられている記事」が存在せず、全員が同一の初心者向け4記事にフォールバックする

`POPULAR_ARTICLES`には`creditcard`・`kouza`・`app`・`sidejob`・`furima`・カテゴリ未設定用のプールが**そもそも存在しない**。該当する72記事(creditcard 30・kouza 14・app 12・カテゴリ未設定10・sidejob 4・furima 2)は、実際のテーマと関係なく`__default__`プール(「ポイ活とは」「始め方3ステップ」「おすすめポイントサイト3選」「稼ぎ方の種類」の4記事)が固定表示される。

さらに`PR_OFFERS`(related-offers)にも`sidejob`・`furima`・カテゴリ未設定用のプールが無く、該当**17記事は「関連記事」セクション自体が非表示**(`section.remove()`が実行される)になっている。

**推奨対応(実装は次フェーズ):** `POPULAR_ARTICLES`/`PR_OFFERS`の一致条件を`data-category`のみでなく`data-tags`も併用したマッチングに拡張する、または`shopping`カテゴリをサブカテゴリ(ドラッグストア/共通ポイント比較/外食/書籍 等)に分けてプールを持たせる。creditcard/kouza/app/sidejob/furimaにも専用プールを追加する。

---

## 2. サマリー

| 項目 | 値 |
|---|---|
| 対象記事数 | **396件**(`pages/articles/*.html`からハブページ3件を除いた実記事) |
| 監査したリンク総数(本文リンク+アフィリエイトCTA、全件) | **841件** |
| うち本文内部/外部リンク(A/D/E/G) | 683件 |
| うちアフィリエイト/ASPリンク(F) | 158件(CTAボタン形式)+ 2件(本文中の通常リンク形式、`point-toushi-unyou-service-hikaku`)= **160件** |

**内部リンク関連性(683件、0〜5評価)**

| 5 | 4 | 3 | 2 | 1 | 0 |
|---|---|---|---|---|---|
| 356 | 240 | 87 | 0 | 0 | 0 |

**関連性2以下の内部リンク: 0件**(サブエージェント採点による本文リンクは全て3以上。既存の内部リンクの質自体は良好)

**アフィリエイトリンク関連性(158件、0〜5評価)**

| 5 | 4 | 3 | 2 | 1 | 0 |
|---|---|---|---|---|---|
| 146 | 4 | 6 | 2 | 0 | 0 |

**関連性2以下のアフィリエイトリンク: 2件**(`creditcard-hakkou-anken-poikatsu`のエポスカード・コスモザカードオーパスCTA。後述)

**孤立記事(ORPHAN、本文・関連記事どちらからも被リンク0)**: **191件**(本文リンクのみで見ると218件)
**被リンク1本のみ(WEAK)**: **79件**

**MONETIZATION_MISMATCH(案件と記事テーマの不一致)**: **7件**
**AFFILIATE_OPPORTUNITY_HIGH(高収益機会だが案件導線なし)**: **43件**
**AFFILIATE_OPPORTUNITY_MEDIUM**: **61件**
**CTA_OVERUSE(同一CTAが3回以上)**: **2件**(いずれも許容範囲内と判断、後述)
**AFFILIATE_DISCLOSURE_MISSING(案件リンクありなのに広告表記なし)**: **0件**
**DISCLOSURE_WITHOUT_AFFILIATE(広告表記があるのに実質アフィリエイト化されていない)**: **1件**(`itoyokado-netsuper-onigo-poikatsu`)
**sponsored属性不足**: **0件**(全160件のASPリンクで`rel="noopener sponsored"`が正しく設定済み)
**404内部リンク/存在しないカテゴリ・記事へのリンク**: **0件**
**旧`.html`付き内部リンク**: **0件**
**自己リンク・空href・javascript:リンク**: **0件**
**httpリンク(非HTTPS)**: **0件**
**canonical不一致**: **0件**(既存の`audit_sitemap.js`で継続監視中)

**記事ごとの総合判定**

| KEEP | REVIEW | FIX_LOW | FIX_MEDIUM | FIX_HIGH |
|---|---|---|---|---|
| 98 | 141 | 59 | 69 | **29** |

**TOFU/MOFU/BOFU分布**: TOFU 140 / MOFU 133 / BOFU 123

**ASPネットワーク別リンク数(160件)**

| ASP | 件数 |
|---|---|
| A8.net | 114 |
| TrafficGate | 16 |
| ドコモアフィリエイト | 14 |
| ValueCommerce | 7 |
| ACCESSTRADE | 3 |
| TCS-ASP | 3 |
| JANet | 2 |
| Amazonアソシエイト | 1 |

ユニーク案件数(a8mat/pid/tag等のパラメータで判定): **80件**(うち20件は複数記事で再利用されている同一案件)

---

## 3. 技術監査の結果(全件クリーン)

実装は非常に丁寧に保守されており、技術的な不備はほぼ皆無だった。

- 存在しない内部URL・カテゴリURLへのリンク: **0件**
- 旧`.html`付きURL: **0件**
- 自己リンク・空href・javascript:のみのリンク・認識不能なhref: **0件**(調査中に1件のプロトコル相対URL誤判定を発見したが、実際は正常なアフィリエイトリンクだった)
- 非HTTPSリンク: **0件**
- アフィリエイトリンクのrel属性(`noopener sponsored`)不足: **0件**(全160件で100%正しく設定)
- 広告表記(PR表記)の不足: **0件**(アフィリエイトCTAがある104記事全てにPR表記あり)

唯一の要確認事項: `itoyokado-netsuper-onigo-poikatsu`はPR表記があるがCTAリンク先(`itoyokado-netsuper.jp`)がASP経由ではない直接公式リンク(`rel="noopener"`のみ、sponsoredなし)。広告契約が現在ないなら表記を外すか、契約があるなら追跡リンクへの差し替えが必要(ビジネス側の確認が必要なため、判断はしていない)。

---

## 4. アンカーテキストの問題

「こちら」等の曖昧なアンカーは**サイト全体でごく少数**(8件、`VAGUE_ANCHOR`)。目立った例は`point-toushi-unyou-service-hikaku`の比較表内で「▶ 詳細」というアンカーが繰り返し使われている箇所(4箇所)で、うち2つはASPの追跡リンクに直接飛ぶため、リンク先サービス名を含む具体的な文言への変更を推奨(例:「▶ SBI証券の詳細を見る」)。キーワードの詰め込みは不要。

---

## 5. アフィリエイトリンクの関連性・案件一致の問題

### MONETIZATION_MISMATCH(7件、全て確認済み)

| 記事 | 本文の比較対象 | CTA案件 | 推奨対応 |
|---|---|---|---|
| `hon-denshi-shoseki-poikatsu` | 楽天ブックス・Kobo・honto | DMMブックス(A8.net) | DMMブックスを本文の比較対象に正式追加、または楽天ブックス等のASP案件があればそちらに揃える |
| `furusato-portal-erabikata` | ポータル選び方全般 | au PAYふるさと納税のみ | 楽天ふるさと納税等も比較対象に含める、またはCTA訴求範囲を該当セクションに限定 |
| `keitai-ryokin-setsuyaku` | 複数キャリア横並び解説 | 楽天モバイルのみ | 楽天モバイルを比較表に正式追加、またはCTA文言を「一例として」に調整 |
| `net-super-poikatsu` | Ponta/楽天/d/Vポイント対応ネットスーパー比較 | IYNS by ONIGO(比較表外) | IYNS by ONIGOを比較表に追加、または比較対象内サービスのCTAに変更 |
| `shouken-kouza-anken-poikatsu` | 松井証券・DMM株 | マネックス証券(無関係) | マネックス証券を比較対象に追加、または松井証券/DMM株のリンクに差し替え |
| `creditcard-hakkou-anken-poikatsu` | 発行案件の仕組み説明 | エポスカード+コスモザカードオーパス(仕組み説明の直後) | CTA位置を確認事項説明後(記事末尾)に移動、または「代表例」として比較文脈を追加 |

### AFFILIATE_OPPORTUNITY_HIGH の主な内訳(43件)

すでにアフィリエイト提携があるにもかかわらず社内で導線が引かれていない、または高単価ジャンルなのにCTA自体が存在しない記事。カテゴリ別の代表例:

- **クレジットカード**: `dcard-poikatsu`・`mitsui-sumitomo-card-vpoint`(いずれも他の4記事から「着地点」として頻繁にリンクされる個別カード記事だが、CTA自体が0件)、`credit-card-point-hikaku`(9枚比較のハブ記事なのに、本文で名指ししている楽天カード/dカード/三井住友カードへのリンクが1つもない)、`nenkaihi-muryo-card`(年会費無料カードは既存提携のエポス/Nexus/楽天カードと直接合致するのに内部リンク・CTAともに0件)
- **銀行/証券**: `rakuten-ginkou-happy-program`・`docomo-ginkou-dpoint-poikatsu`(いずれも内部リンクは充実、比較記事からの被リンクもあるが、CTAが0件)
- **保険/高額案件**: `hoken-soudan-anken-poikatsu`(高単価ジャンルを詳しく解説しているのにCTA・PR表記ともに0)
- **アンケートサイト**: `cue-monitor-poikatsu`・`infoq-poikatsu`・`rakuten-insight-tsukaikata`(同カテゴリの類似レビュー記事はCTA+PR表記ありだが、この3記事だけ両方なし)
- **ショッピング**: `hikkoshi-poikatsu`(引っ越し一括見積もり比較、定番の高単価案件だがCTA0)、`denryoku-norikae-point`・`gas-norikae-poikatsu`(電力・ガス乗り換え、高単価案件だがCTA0)、`ryokou-yoyaku-point`・`shukuhaku-yoyaku-point`(宿泊・航空券予約比較だがCTA0)
- **サイト内発見性**: `amazon-poikatsu`→`amazon-tsuhan-toha`、`aupay-market-poikatsu`→`aupay-market-toha`、`yahoo-shopping-paypay`→`yahoo-shopping-toha` のように、CTAが設置済みの「とは」記事への内部リンクを追加するだけで解決するケースが複数あり

### CTA_OVERUSEの確認(2件、いずれも問題なしと判断)

`jcb-airmacau-campaign-2026`(同一CTA3回)・`yahoo-travel-ultrasale-poikatsu`(同一CTA3回)。いずれも期間限定キャンペーン特集記事で、記事が長く「メリット説明後」「詳細説明後」「記事末尾」に自然に配置されているため、ユーザー指定の許容基準(判断材料を読んだ後の複数箇所)の範囲内と判断し、修正不要とした。

---

## 6. 内部リンク構造の問題

### 孤立記事(ORPHAN)の内訳

- 本文・関連記事(アルゴリズム含む)を通じて**一切被リンクのない記事: 191件**
- そのうち、**すでにアフィリエイトCTAを持つが被リンクが0件(＝収益導線があるのに誰も辿り着けない記事): 35件**。特に優先度が高い(全件確認済み、抜粋):
  - ポイントサイトレビュー系: `chobirich-tsukaikata`・`hapitas-tsukaikata`・`pointincome-tsukaikata`・`ecnavi-tsukaikata`・`macromill-tsukaikata`・`warau-tsukaikata`・`gendama-poikatsu`
  - 通信/サブスク系(ドコモ関連アフィリエイト): `dhits-toha`・`dmagazine-toha`・`dphoto-toha`・`hikaritv-toha`・`lemino-premium-toha`・`anshin-security-toha`・`docomo-select-toha`
  - その他: `auhikari-poikatsu`・`creditcard-hakkou-anken-poikatsu`・`shouken-kouza-anken-poikatsu`・`satofull-poikatsu`・`rakuten-carwash-poikatsu`・`rakuten-kakeibo-poikatsu`

### 親子(比較記事↔個別記事)の双方向リンク

**良い実例(既存の運用がすでに機能している例)**: ドラッグストア比較クラスタ(`drugstore-point-hikaku` ↔ `seims-point`/`doramori-point`/`tsuruha-point`/`welcia-point`/`sugi-point`)は比較記事→個別記事、個別記事→比較記事の両方向リンクが全て設置されている。クレジットカード比較(`credit-card-mile-hikaku`/`credit-card-point-hikaku` ↔ 個別カード記事)も同様に一部良好。

**一方向のみで改善余地がある実例**:
- `dpoint-kiso`・`ponta-kiso`・`paypay-point-kiso`(各共通ポイントの基礎記事)は、いずれも比較記事(`dpoint-ponta-hikaku`・`kikangentei-point-5shu-hikaku`等)への本文内リンクが**0件**。比較記事側からは(部分的に)リンクされているが、基礎記事から比較記事へ「もっと詳しく知りたい人向け」の導線がない。
- `vpoint-rakuten-hikaku`も本文内リンク0件で、他記事からは3件リンクされているのに発信側のリンクがない。
- `vpoint-tamaranai`は被リンク0・本文内リンク0の完全孤立記事。

---

## 7. 収益導線が不足している記事(AFFILIATE_OPPORTUNITY)

`HIGH`: 43件、`MEDIUM`: 61件。合計104件が「商業意図はあるが案件導線が不足」と判定された。一方、`NO_AFFILIATE_NEEDED`(情報記事のため無理にCTAを追加すべきでない)と判定されたのは75件で、これらは適切にCTA無しのままとすべきというのが今回の結論(例: 有効期限管理・失効原因・計算方法・用語解説系の記事群)。

---

## 8. 「案件ありき」の疑い(MONETIZATION_MISMATCH以外の懸念)

セクション5のMONETIZATION_MISMATCH 7件以外に、案件優先で押し込まれたような不自然な挿入は確認されなかった。ただし`itoyokado-netsuper-onigo-poikatsu`(広告表記はあるが実質非アフィリエイト)は、意図と実装がズレている可能性があるため個別確認を推奨。

---

## 9. 収益ファネル(TOFU/MOFU/BOFU)の分布

TOFU(用語解説等)140記事・MOFU(比較)133記事・BOFU(個別サービスレビュー)123記事。BOFU記事のうち、内部リンク・CTAが十分に機能していないものが今回のFIX_HIGH/AFFILIATE_OPPORTUNITY_HIGHの中心(個別カード記事・個別ポイントサイト記事・個別通信サービス記事など)。TOFU記事の多くはCTA不要と正しく判定されており、「情報記事にCTAを無理に入れない」という方針は概ね守られていた。

---

## 10. 最優先修正20項目

GSC(Google Search Console)のデータはリポジトリ内に存在しないため、表示回数・CTR・掲載順位は優先度判定に使用していない。優先度は「内部リンク構造」「案件との整合性」「収益機会の大きさ」「影響範囲(何記事に影響するか)」の4点で判定した。上位2件はアルゴリズムレベルの修正で、他のどの個別記事修正よりも影響範囲が大きい。

| 順位 | 記事slug/対象 | 問題 | 内部リンク問題 | 案件リンク問題 | 収益機会 | 推奨対応 |
|---|---|---|---|---|---|---|
| 1 | **(アルゴリズム)** `js/main.js`の`POPULAR_ARTICLES`カテゴリ別マッチング | shoppingカテゴリ161記事(92.5%)が無関係なEC総合通販13サイトの固定リストを表示 | 該当 | - | 全カテゴリで回遊率に影響 | サブカテゴリ化またはタグベースマッチングへの拡張(実装は次フェーズ) |
| 2 | **(アルゴリズム)** `js/main.js`の`POPULAR_ARTICLES`/`PR_OFFERS`カテゴリ欠落 | creditcard/kouza/app/sidejob/furima/未設定=72記事が`__default__`の初心者向け4記事にフォールバック。17記事は関連記事セクション自体が非表示 | 該当 | 該当 | HIGH(72記事に影響) | 該当5カテゴリ用のプール追加 |
| 3 | `hon-denshi-shoseki-poikatsu` | MONETIZATION_MISMATCH。比較対象外のDMMブックスにCTA | - | 有 | MEDIUM | DMMブックスを比較対象に正式追加 |
| 4 | `dcard-poikatsu` | 4記事から着地点として参照されるがCTA0件 | 良好(被リンク4) | CTA無し | HIGH | dカードのASP案件確保・CTA設置 |
| 5 | `mitsui-sumitomo-card-vpoint` | 同上、4記事から参照されるがCTA0件 | 良好(被リンク4) | CTA無し | HIGH | 同上 |
| 6 | `credit-card-point-hikaku` | 9枚比較ハブ。本文で名指しした3カードへのリンクが0件 | 要改善 | CTA無し | HIGH | 名指しした個別カード記事への内部リンク追加 |
| 7 | `nenkaihi-muryo-card` | 完全孤立(被リンク0・本文リンク0)。既存提携3社と直接合致 | 要改善 | CTA無し | HIGH | エポス/Nexus/楽天カードへのリンク・CTA追加 |
| 8 | `roadmap` | 登録〜初回ポイント獲得という中核導線記事が完全孤立 | 要改善(被リンク0) | CTA無し | HIGH | ハブ記事化して他記事からの被リンクを増やす |
| 9 | `rakuten-ginkou-happy-program` | 内部リンク6件と充実だがCTA0件 | 良好 | CTA無し | HIGH | 楽天銀行の口座開設案件があればCTA追加 |
| 10 | `docomo-ginkou-dpoint-poikatsu` | 比較記事から被リンクありだがCTA0件 | 良好 | CTA無し | HIGH | ドコモ銀行口座開設案件のCTA追加 |
| 11 | `hoken-soudan-anken-poikatsu` | 高単価ジャンルなのにCTA・PR表記ともに0 | - | CTA無し・disclosure無し | HIGH | 該当案件を扱うポイントサイトへのCTA追加 |
| 12 | `hikkoshi-poikatsu` | 引っ越し一括見積もり(定番高単価案件)にCTA0 | - | CTA無し | HIGH | 一括見積もりサービスのCTA追加 |
| 13 | `ryokou-yoyaku-point` / `shukuhaku-yoyaku-point` | 宿泊・航空券予約比較にCTA0(2記事) | 要改善(被リンク0) | CTA無し | HIGH | じゃらん等、既存提携サービスへのCTA追加 |
| 14 | `amazon-poikatsu` / `aupay-market-poikatsu` / `yahoo-shopping-paypay` | CTA設置済みの「とは」記事への内部リンクが0(3記事) | 要改善 | - | HIGH | `amazon-tsuhan-toha`等への内部リンク追加のみで解決 |
| 15 | `denryoku-norikae-point` / `gas-norikae-poikatsu` | 電力・ガス乗り換え(高単価案件)にCTA0 | - | CTA無し | HIGH | 乗り換え案件のCTA追加 |
| 16 | `cue-monitor-poikatsu` / `infoq-poikatsu` / `rakuten-insight-tsukaikata` | 同カテゴリの類似記事は CTA+PR表記ありだがこの3記事のみ両方無し、かつ孤立 | 要改善(被リンク0) | CTA無し・disclosure無し | MEDIUM | 他アンケートサイト記事と同水準のCTA設置 |
| 17 | `ana-hikari-poikatsu` | ANA公式への直リンクのみ。同カテゴリ光回線記事はASP化済み | - | 非アフィリエイト直リンク | MEDIUM | ASP案件の有無を確認しCTA差し替え |
| 18 | `dpoint-kiso` / `ponta-kiso` / `paypay-point-kiso` | 比較記事への本文内リンクが0(基礎記事→比較記事の導線欠落) | 要改善 | - | LOW〜MEDIUM(回遊改善) | 各比較記事への内部リンク追加 |
| 19 | `creditcard-hakkou-anken-poikatsu` | MONETIZATION_MISMATCH+CTA位置(仕組み説明直後)の問題 | - | 有(関連性2点の案件2件) | MEDIUM | CTAを記事末尾に移動、比較文脈を追加 |
| 20 | `itoyokado-netsuper-onigo-poikatsu` | PR表記があるが実質非アフィリエイト(direct link) | - | disclosure/CTA不整合 | LOW〜MEDIUM(要ビジネス確認) | 契約有無を確認し表記かリンクを整合させる |

---

## 11. 良かった点(壊してはいけないもの)

- 内部リンクの関連性は全体として非常に高い(683件中、関連性3未満が0件)。既存の本文リンクの「質」自体は問題ない。
- ASPリンクのrel属性(`sponsored`/`noopener`)は160件全てで100%正しく設定されている。
- 広告表記(PR表記)の欠落は0件。表記漏れによるコンプライアンスリスクはない。
- 404・旧URL・自己リンク等の技術的な不備は0件。
- ドラッグストア比較クラスタ、クレジットカード比較クラスタなど、一部の記事群では比較記事↔個別記事の双方向リンクが理想的に機能している(セクション6参照)。これらのパターンを他クラスタにも展開するのが効率的。

---

## 12. 今回のスコープ外・未実施事項

- **記事・リンクの実際の修正は行っていない**(監査のみという指示のため)。
- 外部ASPリンクの実際の遷移先(リンク切れ等)はローカル環境からは検証できないため、`UNVERIFIED_EXTERNAL`として全160件を「未検証」扱いとした。技術的なURL形式(http/https、パラメータ形式)は検証済みだが、実際にクリックしてリダイレクト先が正しいかは確認していない。
- `POPULAR_ARTICLES`/`PR_OFFERS`のプール自体を拡張・タグベース化する実装は行っていない(セクション1の推奨対応として次フェーズに提案)。
- 関連性2以下の内部リンクは0件だったため、個別の削除候補リストは作成していない(該当なし)。

---

## 付録: 出力ファイル

- `reports/link-audit-2026-09-06.csv` — 本文リンク+アフィリエイトCTA全841件の詳細(source_slug, source_title, source_category, link_type, target_url, target_title_or_service, anchor_text, section_heading, relevance_score, affiliate_network, revenue_opportunity, issue, recommended_action)
- `reports/link-audit-2026-09-06-articles.csv` — 記事396件ごとの総合評価(internal_link_score, affiliate_relevance_score, revenue_opportunity, user_intent_match, tofu_mofu_bofu, overall_verdict, article_issues, notes)
- `reports/article-link-map.json` — 記事396件ごとの構造データ(被リンク数、シミュレートした「関連記事」「よくみられている記事」の実際の表示内容、上記スコアを統合したJSON)
