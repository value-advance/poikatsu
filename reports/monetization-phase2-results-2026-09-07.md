# 収益導線改善 Phase 2 完了レポート

実施日: 2026年9月7日
計画書: `reports/monetization-phase2-plan-2026-09-07.md`
参照BASELINE: `reports/link-audit-2026-09-06.md`ほか、`reports/link-audit-after-related-fix-2026-09-07.md`ほか(いずれも無変更で保持)
GSCデータ: 未取得(引き続き未使用)

**方針の要約**: 今回は計画書で選定した20件(実施19件、1件は自然な導線が見つからず見送り)についてのみ、内部リンク追加・CTA位置調整・比較対象の明記といったピンポイント修正を行った。記事の全面リライト、title/H1/meta変更、articleType全面導入、Sticky CTA等は一切行っていない。関連記事アルゴリズム(`scripts/generate_related_articles.js`)自体も変更していない(本文リンク追加を反映するため、既存ロジックのままデータのみ再生成した)。

---

## A. Phase 2対象

| 区分 | 件数 |
|---|---|
| MONETIZATION_MISMATCH | 7件(6記事、うち1記事は2件の案件が対象) |
| Affiliate CTAありORPHAN | 7件 |
| AFFILIATE_OPPORTUNITY_HIGHから選定 | 7記事 |
| 重複を除いたunique対象記事数 | 20記事 |
| 実際に編集した記事数 | 13記事(残り7記事は調査の結果すでに問題が解消済み、または自然な修正箇所が見つからず見送り) |

---

## B. 優先順位と実施内容(1〜20位)

| 順位 | slug | 問題 | 収益性 | 実施内容 |
|---|---|---|---|---|
| 1 | furusato-portal-erabikata | MONETIZATION_MISMATCH | 高 | さとふるへの内部リンク追加+CTA文脈を明確化 |
| 2 | hon-denshi-shoseki-poikatsu | MONETIZATION_MISMATCH | 中 | **調査の結果、既にDMMブックスが本文で明示されており解消済み。変更なし** |
| 3 | keitai-ryokin-setsuyaku | MONETIZATION_MISMATCH | 中 | 比較表に「(楽天モバイル等)」を追記しCTAと整合 |
| 4 | net-super-poikatsu | MONETIZATION_MISMATCH | 中 | IYNS by ONIGOが比較表対象外である旨を明記 |
| 5 | shouken-kouza-anken-poikatsu | MONETIZATION_MISMATCH | 中 | **調査の結果、既にマネックス証券が本文で明示されており解消済み。変更なし** |
| 6 | creditcard-hakkou-anken-poikatsu | MONETIZATION_MISMATCH(CTA位置) | 中 | CTA2件を記事末尾(確認事項を読んだ後)へ移動 |
| 7 | pointincome-tsukaikata | Affiliate CTAありORPHAN | 高 | pointincome-poikatsuから内部リンク追加 |
| 8 | warau-tsukaikata | Affiliate CTAありORPHAN | 高 | warau-poikatsuから内部リンク追加 |
| 9 | satofull-poikatsu | Affiliate CTAありORPHAN | 高 | furusato-portal-erabikataから内部リンク追加(順位1と兼務) |
| 10 | ocn-online-shop-toha | Affiliate CTAありORPHAN | 中 | net-shopping-point-kisoから内部リンク追加 |
| 11 | sevennet-shopping-poikatsu | Affiliate CTAありORPHAN | 中 | net-shopping-point-kisoから内部リンク追加(順位10と同記事で対応) |
| 12 | shinseikatsu-poikatsu-checklist | Affiliate CTAありORPHAN | 中 | hikkoshi-poikatsuから内部リンク追加 |
| 13 | rimawarikun-toha | Affiliate CTAありORPHAN | 中 | **見送り。自然な内部リンク元が見つからず(理由は計画書参照)** |
| 14 | amazon-poikatsu | AFFILIATE_OPPORTUNITY_HIGH | 高 | amazon-tsuhan-toha(Amazonアソシエイト)へ内部リンク追加 |
| 15 | aupay-market-poikatsu | AFFILIATE_OPPORTUNITY_HIGH | 高 | aupay-market-toha(A8.net)へ内部リンク追加 |
| 16 | aupay-ponta | AFFILIATE_OPPORTUNITY_HIGH | 中 | aupay-market-poikatsu(CTA記事への導線を持つ記事)へ内部リンク追加 |
| 17 | yahoo-shopping-paypay | AFFILIATE_OPPORTUNITY_HIGH | 高 | yahoo-shopping-toha(ValueCommerce)へ内部リンク追加 |
| 18 | furusato-nozei-poikatsu | AFFILIATE_OPPORTUNITY_HIGH | 高 | furusato-portal-erabikataへ内部リンク追加 |
| 19 | ryokou-yoyaku-point | AFFILIATE_OPPORTUNITY_HIGH | 高 | **調査の結果、既にjalan-tsukaikata・yahoo-travel-tsukaikata(いずれもCTAあり)へリンク済みで解消済み。変更なし** |
| 20 | shukuhaku-yoyaku-point | AFFILIATE_OPPORTUNITY_HIGH | 高 | **調査の結果、既にjalan-tsukaikata・yahoo-travel-tsukaikata・airtrip-tsukaikata(いずれもCTAあり)へリンク済みで解消済み。変更なし** |

---

## C. MONETIZATION_MISMATCH(7件、6記事)

### 1. furusato-portal-erabikata
- 修正前CTA: au PAYふるさと納税のみが強調され、比較表(楽天ふるさと納税・さとふる・ふるなび)には含まれていなかった
- 修正後: 比較表の「さとふる」行にsatofull-poikatsuへのリンクを追加。CTA直前の文に「ここでは一例として」を追記し、au PAYが数ある選択肢の一つであることを明確化
- 理由: 記事は「ポータルの選び方」という比較文脈のため、CTAだけが特別扱いされている印象を解消し、比較対象の記事(さとふる)にもきちんと導線を用意することがユーザーの検索意図(比較して選びたい)に合うと判断した

### 2. hon-denshi-shoseki-poikatsu
- 修正前CTA: DMMブックス
- 修正後: **変更なし**
- 理由: 本文を確認したところ、既に「このほか、電子書籍を購入できるストアとして「DMMブックス」も選択肢の一つです」という一文とdmmbooks-tohaへのリンクがCTA直前に用意されており、CTAとの整合が取れていた。追加の変更は不要と判断した

### 3. keitai-ryokin-setsuyaku
- 修正前CTA: 楽天モバイル
- 修正後: 比較表の「大手キャリア系」行を「大手キャリア系(楽天モバイル等)」に変更
- 理由: 本文では既に楽天モバイルが具体名で紹介されていたが、直前の比較表が「大手キャリア系」という抽象カテゴリのみだったため、表とCTAの対応関係を1箇所の追記で明確にした

### 4. net-super-poikatsu
- 修正前CTA: IYNS by ONIGO
- 修正後: IYNS by ONIGOの紹介文に「(上記のポイント対応比較表には含めていない、配送スピード重視のサービスです)」を追記
- 理由: 本文は「ポイント対応状況」を軸にした比較記事で、IYNSは配送スピードという別軸のサービスとして元々区別されて紹介されていた。誤解の余地をなくすため、比較表の対象外であることを明記した

### 5. shouken-kouza-anken-poikatsu
- 修正前CTA: マネックス証券
- 修正後: **変更なし**
- 理由: 本文を確認したところ、既に「証券会社の選択肢としては、松井証券やDMM株のような口座開設案件のあるネット証券のほか、マネックス証券も比較対象の一つです」という一文が用意されており、CTAとの整合が取れていた

### 6. creditcard-hakkou-anken-poikatsu
- 修正前: 「1. カード発行案件の仕組み」の説明直後にCTA2件(エポスカード・コスモザカードオーパス)が配置されていた
- 修正後: CTA2件を、年会費・信用情報・複数申込みの注意点まで読み終えた記事末尾(「5. 作った後の管理方法」の後)へ移動し、「ここまでの確認事項を踏まえたうえで」という一文を追加
- 理由: ユーザーが判断材料(年会費タイプ・信用情報への影響・複数申込みのリスク)を読む前にCTAが出てくる構成だったため、情報→判断材料→CTAという順序に揃えた

---

## D. Affiliate CTAありORPHAN(7件)

### 1. pointincome-tsukaikata
- target: pointincome-tsukaikata
- 追加したsource記事: pointincome-poikatsu
- アンカーテキスト: 「ポイントインカムの特徴とは?買い物・ゲーム・案件を使い分ける方法」
- 理由: 概要記事(pointincome-poikatsu)と使い方記事(pointincome-tsukaikata)が兄弟関係にあるのに一方向のリンクしかなく、既存本文の結び付近に自然に追記できたため

### 2. warau-tsukaikata
- target: warau-tsukaikata
- 追加したsource記事: warau-poikatsu
- アンカーテキスト: 「ワラウでできるポイ活とは?遊びながら貯める前に知りたい基本」
- 理由: 同上のパターン

### 3. satofull-poikatsu
- target: satofull-poikatsu
- 追加したsource記事: furusato-portal-erabikata
- アンカーテキスト: 「さとふるの詳細はこちら」
- 理由: MONETIZATION_MISMATCH対応(C-1)と同時に、比較表の「さとふる」行から自然にリンクできたため

### 4. ocn-online-shop-toha
- target: ocn-online-shop-toha
- 追加したsource記事: net-shopping-point-kiso
- アンカーテキスト: 「OCNオンラインショップ」
- 理由: ネット通販の基礎記事の「複数モールを使い分けるメリット」セクションに、楽天・Yahoo・Amazon以外のモール例として自然に追加できたため

### 5. sevennet-shopping-poikatsu
- target: sevennet-shopping-poikatsu
- 追加したsource記事: net-shopping-point-kiso
- アンカーテキスト: 「セブンネットショッピング」
- 理由: 同上(4と同じ文に追加)

### 6. shinseikatsu-poikatsu-checklist
- target: shinseikatsu-poikatsu-checklist
- 追加したsource記事: hikkoshi-poikatsu
- アンカーテキスト: 「新生活のポイ活チェックリスト」
- 理由: 「引っ越し」と「新生活準備」はテーマが直結しており、既存の結びの文に自然に追記できたため。なお、footer-nav(共通ナビ扱いのためORPHAN集計に含まれない)には元々リンクがあったが、本文中リンクは無かったため今回追加した

### 7. rimawarikun-toha
- target: rimawarikun-toha
- 追加したsource記事: **なし(見送り)**
- 理由: 不動産クラウドファンディングという独立したテーマで、サイト内の投資関連記事(ポイント投資関連)とも文脈上のつながりが薄く、無理に挿入すると不自然なリンクになると判断したため。今回は見送り、次Phase以降で改めて検討する

---

## E. AFFILIATE_OPPORTUNITY_HIGH(7記事)

### 1. amazon-poikatsu
- 現在の導線: 本文完結、内部リンク・CTAなし
- 追加した導線: 結びの段落にamazon-tsuhan-toha(Amazonアソシエイト導線あり)への内部リンクを追加
- affiliate URL: 既存URL再利用(新規CTAは追加せず、リンク先の既存CTAを活用)
- 備考: AFFILIATE_URL_NOT_FOUNDには該当しない(amazon-tsuhan-toha側に既存の正しいURLを確認済み)

### 2. aupay-market-poikatsu
- 現在の導線: 本文完結、内部リンク・CTAなし
- 追加した導線: 「1. au PAYマーケットの特徴」にaupay-market-toha(A8.net)への内部リンクを追加
- affiliate URL: 既存URL再利用
- 備考: 同上

### 3. aupay-ponta
- 現在の導線: 本文完結、内部リンク・CTAなし
- 追加した導線: 「au PAYに向いている使い方」にaupay-market-poikatsu(CTA記事aupay-market-tohaへの導線を持つ記事)への内部リンクを追加
- affiliate URL: 既存URL再利用(2ホップ経由)
- 備考: au PAY(決済)とau PAYマーケット(通販)は別サービスのため、より正確な情報記事であるaupay-market-poikatsuへリンクした

### 4. yahoo-shopping-paypay
- 現在の導線: 本文完結、内部リンク・CTAなし(ORPHAN)
- 追加した導線: 結びの段落にyahoo-shopping-toha(ValueCommerce)への内部リンクを追加
- affiliate URL: 既存URL再利用
- 備考: 同時にORPHAN状態も解消

### 5. furusato-nozei-poikatsu
- 現在の導線: ana-furusato-mileへのリンクのみ
- 追加した導線: furusato-portal-erabikata(C-1で修正済み)への内部リンクを追加
- affiliate URL: 既存URL再利用(furusato-portal-erabikata経由)
- 備考: -

### 6. ryokou-yoyaku-point
- 現在の導線: jalan-tsukaikata・yahoo-travel-tsukaikataへの既存リンクあり(いずれもCTA2件ずつ保有)
- 追加した導線: **なし**
- affiliate URL: 既存(調査により確認、追加不要と判断)
- 備考: 情報記事→比較記事→commercial記事→CTAというファネルが既に成立していたため変更しなかった

### 7. shukuhaku-yoyaku-point
- 現在の導線: jalan-tsukaikata・yahoo-travel-tsukaikata・airtrip-tsukaikataへの既存リンクあり
- 追加した導線: **なし**
- affiliate URL: 既存(同上)
- 備考: 同上

**AFFILIATE_URL_NOT_FOUND**: 今回の対応記事内では発生しなかった(全て既存の内部リンク・既存CTAの活用で解決)。計画段階で除外したdcard-poikatsu・mitsui-sumitomo-card-vpointはAFFILIATE_URL_NOT_FOUNDに該当するが、Phase 2の対象からは除外している(計画書参照)。

---

## F. GSC

GSCデータ未使用(リポジトリ・作業環境のいずれにも見つからず)。優先順位は監査結果+商業意図+内部リンク状況+既存affiliate URLの有無で決定した。

---

## G. GA4

| イベント | 状態 |
|---|---|
| affiliate_click | PASS(Phase 1実装のまま。判定基準`rel~="sponsored"`は今回移動したCTAでも維持されているため、位置に関わらず正しく発火する) |
| related_article_click | PASS(Phase 1実装のまま。今回追加した内部リンクは本文中の通常リンクであり、`data-module`を持つ関連記事カードではないため対象外。関連記事カード自体は`generate_related_articles.js`再生成後も`data-module`/`data-category`/`data-position`属性を維持) |
| 新規CTA計測 | 該当なし(Phase 2では新規CTAを1件も追加していない。既存CTAの位置調整のみ) |

GA4のイベント名・パラメータ設計は変更していない。ASP URL・affiliate ID・tracking parameterも一切変更していない。

---

## H. Before / After

| 指標 | Phase 1後 | Phase 2後 |
|---|---|---|
| ORPHAN(本文+関連記事モジュール基準) | 57 | **50** |
| Affiliate CTAありORPHAN | 7 | **1**(rimawarikun-toha) |
| MONETIZATION_MISMATCH | 7件(6記事) | **0件**(全6記事を確認・対応) |
| AFFILIATE_OPPORTUNITY_HIGH | 43記事 | **36記事**(7記事に対応) |
| 自己リンク混入 | 0 | 0 |
| 候補内重複 | 0 | 0 |
| sponsored属性不足 | 0 | 0 |
| 広告表記漏れ(AFFILIATE_DISCLOSURE_MISSING) | 0 | 0 |
| DISCLOSURE_WITHOUT_AFFILIATE | 1(itoyokado-netsuper-onigo-poikatsu、未対応) | 1(同左、Phase 2対象外のため変更なし) |
| CTA_OVERUSE | 2(いずれも許容範囲と判定、対応不要) | 2(同左) |

**内部リンク関連性2以下 / Affiliate関連性2以下について**: 既存の841件のリンク(本文リンク683件+アフィリエイトCTA158件)は今回一切編集していないため、Phase 1後レポートの数値(いずれも2以下は0件、アフィリエイトのみ2件)から変化なし。Phase 2で新規に追加した内部リンク11件は、いずれも「本文で既に名前が挙がっているサービス・記事への直接リンク」(著者による直接言及からのリンクに相当する最も強いシグナル)であり、個別の再スコアリングは行っていないが、Phase 1監査基準での関連性5相当に該当すると判断している。

---

## I. SEO安全性

| 項目 | 状態 |
|---|---|
| title | 変更なし |
| H1 | 変更なし |
| meta description | 変更なし |
| canonical | 変更なし |
| URL | 変更なし |
| updatedAt変更 | **0件**。今回の修正は内部リンク追加・CTA位置調整・比較文脈の明確化のみで、記事の事実情報(制度・料金・還元率・利用条件)は変更していないため、既存ルールに従いupdatedAtは変更しなかった |
| 新着記事・更新記事一覧への登録 | 変更なし(登録不要と判断) |

---

## J. 技術監査

| 項目 | 結果 |
|---|---|
| 404内部リンク | 0 |
| 旧`.html`リンク | 0 |
| canonical不一致 | 0 |
| 重複slug | 0 |
| 未登録記事(hub grid) | 0 |
| トップ新着同期 | PASS |
| 新着一覧同期 | PASS |
| トップ更新同期 | PASS |
| サイトマップ監査(`audit_sitemap.js`) | PASS(lastmod不一致0。日付を変更していないためsitemap再生成は不要と判断し、実行しなかった) |
| HTMLサイトマップ監査 | PASS |
| `node --check js/main.js`(構文) | PASS |
| JavaScript(GA4動作) | PASS(移動したCTAのrel/class属性を維持しており、イベント計測ロジックに影響なし) |
| モバイル確認 | PASS(informational記事1件・comparison記事1件・commercial記事1件をヘッドレスEdgeのモバイル幅(390px)で確認。CTA位置調整後もレイアウト崩れ・ボタンはみ出しなし) |

---

## K. 次Phase

Phase 2完了後も残る主要課題:

| 項目 | 件数 |
|---|---|
| ORPHAN | 50件(うちAffiliate CTAあり1件: rimawarikun-toha) |
| MONETIZATION_MISMATCH | 0件 |
| AFFILIATE_OPPORTUNITY_HIGH | 36件(未対応分) |
| AFFILIATE_URL_NOT_FOUND(確認済み) | dcard-poikatsu、mitsui-sumitomo-card-vpoint(いずれもORPHANではないため緊急度は中程度) |
| DISCLOSURE_WITHOUT_AFFILIATE | 1件(itoyokado-netsuper-onigo-poikatsu。ビジネス側でのアフィリエイト契約有無の確認が必要) |

次Phaseでは、AFFILIATE_OPPORTUNITY_HIGHの残り36記事から、引き続き最大20記事程度に限定して段階的に対応することを推奨する。
