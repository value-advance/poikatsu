# 収益導線改善 Phase 2 計画書

作成日: 2026年9月7日
参照レポート: `reports/link-audit-2026-09-06.md`/`.csv`/`-articles.csv`/`article-link-map.json`(BASELINE)、`reports/link-audit-after-related-fix-2026-09-07.md`/`.csv`/`-articles.csv`(Phase 1後)
GSCデータ: **未取得**(リポジトリ・作業環境のいずれにも見つからず。数値は使用せず、監査結果+商業意図+内部リンク状況+既存affiliate URLの有無で優先順位を決定した)

## 対象確定の方法

- MONETIZATION_MISMATCH: `link-audit-2026-09-06.csv`から`issue`列に`MONETIZATION_MISMATCH`を含む行を抽出(7件、6記事)。Phase 1で記事本文は無編集のため現在も有効と確認。
- Affiliate CTAありORPHAN: `link-audit-after-related-fix-2026-09-07-articles.csv`の`inbound_after=0`かつ`has_affiliate_cta=TRUE`の行を抽出(7記事)。
- AFFILIATE_OPPORTUNITY_HIGH: `link-audit-2026-09-06-articles.csv`の`article_issues`に`AFFILIATE_OPPORTUNITY_HIGH`を含む行を抽出(43記事)。この中から、(a)commercial/comparison意図が明確、(b)同一サービスの既存affiliate URLが確認できる、または内部リンクのみで解決可能、(c)他記事から参照されている、を基準に7記事を選定。

## Phase 2対象一覧(20件)

| priority | slug | title | category | issue_type | current_affiliate_cta | orphan_status | gsc_clicks | gsc_impressions | gsc_ctr | gsc_position | commercial_intent | verified_affiliate_available | planned_action | reason |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P0-1 | furusato-portal-erabikata | ふるさと納税ポータルの選び方! | shopping | MONETIZATION_MISMATCH | au PAYふるさと納税(A8.net) | 非ORPHAN | 未取得 | 未取得 | 未取得 | 未取得 | comparison | 既存(au PAY) | 本文にさとふる・楽天ふるさと納税を比較対象として明記し、CTAが「一例」であることを明確化。あわせてsatofull-poikatsuへ内部リンク追加(P1と兼務) | 記事は「ポータルの選び方」という比較文脈なのに、CTAが1社のみ強調されていたため |
| P0-2 | hon-denshi-shoseki-poikatsu | 本・電子書籍のポイ活方法 | shopping | MONETIZATION_MISMATCH | DMMブックス(A8.net) | 非ORPHAN | 未取得 | 未取得 | 未取得 | 未取得 | comparison | 既存(DMMブックス) | 本文の比較対象にDMMブックスを明示的に追加し、CTAとの整合を取る | タイトルで楽天ブックス・Kobo・hontoの比較を掲げながらCTAは対象外のDMMブックスだったため |
| P0-3 | keitai-ryokin-setsuyaku | 携帯料金をポイ活で節約する方法 | shopping | MONETIZATION_MISMATCH | 楽天モバイル(直接/ASP) | 非ORPHAN | 未取得 | 未取得 | 未取得 | 未取得 | comparison | 既存(楽天モバイル) | 本文の比較表に楽天モバイルを正式な比較対象として追加 | 複数キャリアを横並び解説しているのにCTAは楽天モバイルのみだったため |
| P0-4 | net-super-poikatsu | ネットスーパーのポイントを比較 | shopping | MONETIZATION_MISMATCH | IYNS by ONIGO(A8.net) | 非ORPHAN | 未取得 | 未取得 | 未取得 | 未取得 | comparison | 既存(IYNS) | 本文の比較対象にIYNS by ONIGOを明示的に追加 | Ponta/楽天/d/Vポイント対応ネットスーパー比較が中心なのに、CTAは比較表に含まれないIYNSだったため |
| P0-5 | shouken-kouza-anken-poikatsu | 証券口座開設案件でポイ活する方法 | pointsite | MONETIZATION_MISMATCH | マネックス証券(ASP) | 非ORPHAN | 未取得 | 未取得 | 未取得 | 未取得 | comparison | 既存(マネックス証券) | 本文で例示する証券会社にマネックス証券を追加 | 松井証券・DMM株を例示しているのにCTAは無関係のマネックス証券だったため |
| P0-6 | creditcard-hakkou-anken-poikatsu | クレジットカード発行案件のポイ活術 | creditcard | MONETIZATION_MISMATCH | エポスカード・コスモザカードオーパス(直接申込) | 非ORPHAN | 未取得 | 未取得 | 未取得 | 未取得 | comparison | 既存(両社) | 「仕組みの説明」直後にあるCTAを、選び方の文脈を一言添えたうえで配置し直す(位置調整、削除ではない) | 制度説明の直後に脈絡なくCTAが2件並んでいたため |
| P1-1 | pointincome-tsukaikata | ポイントインカムでポイントを貯める方法 | pointsite | Affiliate CTAありORPHAN | あり(A8.net) | ORPHAN(被リンク0) | 未取得 | 未取得 | 未取得 | 未取得 | BOFU | 既存 | pointincome-poikatsu(概要記事)から「使い方はこちら」の内部リンクを追加 | 概要記事と使い方記事が兄弟関係にあるのに一方向リンクが無かったため |
| P1-2 | warau-tsukaikata | ワラウでできるポイ活とは | pointsite | Affiliate CTAありORPHAN | あり(A8.net) | ORPHAN(被リンク0) | 未取得 | 未取得 | 未取得 | 未取得 | BOFU | 既存 | warau-poikatsu(概要記事)から内部リンクを追加 | 同上のパターン |
| P1-3 | satofull-poikatsu | さとふるとは | shopping | Affiliate CTAありORPHAN | あり(ValueCommerce) | ORPHAN(被リンク0) | 未取得 | 未取得 | 未取得 | 未取得 | BOFU | 既存 | furusato-portal-erabikata(P0-1で編集)から内部リンクを追加 | ふるさと納税ポータル比較記事の自然な参照先だったため |
| P1-4 | ocn-online-shop-toha | OCNオンラインショップとは | shopping | Affiliate CTAありORPHAN | あり | ORPHAN(被リンク0) | 未取得 | 未取得 | 未取得 | 未取得 | BOFU | 既存 | net-shopping-point-kiso(ネット通販基礎記事)から内部リンクを追加 | 通販モール解説の基礎記事から個別モールへの導線が自然なため |
| P1-5 | sevennet-shopping-poikatsu | セブンネットショッピングとは | shopping | Affiliate CTAありORPHAN | あり | ORPHAN(被リンク0) | 未取得 | 未取得 | 未取得 | 未取得 | BOFU | 既存 | net-shopping-point-kiso(同上)から内部リンクを追加 | 同上のパターン |
| P1-6 | shinseikatsu-poikatsu-checklist | 新生活のポイ活チェックリスト | shopping | Affiliate CTAありORPHAN | あり | ORPHAN(被リンク0) | 未取得 | 未取得 | 未取得 | 未取得 | 情報+comparison | 既存 | hikkoshi-poikatsu(P2-6で編集、引っ越し記事)から内部リンクを追加 | 「引っ越し」と「新生活準備」はテーマが直結するため |
| P1-7 | rimawarikun-toha | 利回りくんとは | seikatsu | Affiliate CTAありORPHAN | あり | ORPHAN(被リンク0) | 未取得 | 未取得 | 未取得 | 未取得 | BOFU | 既存 | **見送り**(自然な挿入位置が見つからず) | 不動産クラウドファンディングという独立したテーマで、本文中に自然にリンクできる既存記事(ポイント投資・資産運用系記事)にも文脈上のつながりが薄く、無理な追加を避けた |
| P2-1 | amazon-poikatsu | Amazonでポイ活はできる? | shopping | AFFILIATE_OPPORTUNITY_HIGH | 現状0 | 非ORPHAN | 未取得 | 未取得 | 未取得 | 未取得 | comparison | 既存(amazon-tsuhan-toha) | amazon-tsuhan-toha(Amazonアソシエイト導線あり)への内部リンクを追加。新規CTAは追加しない | 中心テーマがAmazonなのに、CTAのある「Amazonとは」記事への導線が無かったため |
| P2-2 | aupay-market-poikatsu | au PAYマーケットでポイントを活用する方法 | shopping | AFFILIATE_OPPORTUNITY_HIGH | 現状0 | 非ORPHAN | 未取得 | 未取得 | 未取得 | 未取得 | comparison | 既存(aupay-market-toha) | aupay-market-toha(A8.net CTAあり)への内部リンクを追加 | 同上のパターン |
| P2-3 | aupay-ponta | au PAYでPontaポイントを貯める方法 | shopping | AFFILIATE_OPPORTUNITY_HIGH | 現状0 | 非ORPHAN | 未取得 | 未取得 | 未取得 | 未取得 | comparison | 既存(aupay-market-toha) | aupay-market-toha(同上)への内部リンクを追加 | au PAY関連の既存CTAへの導線が無かったため |
| P2-4 | yahoo-shopping-paypay | Yahoo!ショッピング×PayPay | shopping | AFFILIATE_OPPORTUNITY_HIGH | 現状0 | ORPHAN | 未取得 | 未取得 | 未取得 | 未取得 | comparison | 既存(yahoo-shopping-toha) | yahoo-shopping-toha(ValueCommerce CTAあり)への内部リンクを追加 | 主題がYahoo!ショッピングなのにCTAのある記事への導線が無かったため |
| P2-5 | furusato-nozei-poikatsu | ふるさと納税でポイ活はできる? | shopping | AFFILIATE_OPPORTUNITY_HIGH | 現状0 | 非ORPHAN | 未取得 | 未取得 | 未取得 | 未取得 | comparison | 既存(furusato-portal-erabikata経由) | furusato-portal-erabikata(P0-1で修正済み)への内部リンクを追加 | ふるさと納税の入門記事から比較記事への導線が自然なため |
| P2-6 | ryokou-yoyaku-point | 旅行予約でポイントを貯める方法 | shopping | AFFILIATE_OPPORTUNITY_HIGH | 現状0 | 非ORPHAN | 未取得 | 未取得 | 未取得 | 未取得 | comparison | 既存(jalan-net-poikatsu) | jalan-net-poikatsu(CTAあり)への内部リンクを追加 | 宿泊・航空券予約の比較記事から個別サービスへの導線が無かったため |
| P2-7 | shukuhaku-yoyaku-point | 宿泊予約でポイントを貯める方法 | shopping | AFFILIATE_OPPORTUNITY_HIGH | 現状0 | ORPHAN | 未取得 | 未取得 | 未取得 | 未取得 | comparison | 既存(jalan-net-poikatsu) | jalan-net-poikatsu(同上)への内部リンクを追加 | 同上のパターン |

## 除外した候補とその理由

- **dcard-poikatsu / mitsui-sumitomo-card-vpoint**(AFFILIATE_OPPORTUNITY_HIGH): サイト内を検索したが、dカード・三井住友カードの正しいアフィリエイトURLが1件も確認できなかった。`AFFILIATE_URL_NOT_FOUND`。新規URLの推測は禁止のため、今回はCTA追加を見送る。両記事とも既に4記事から参照されておりORPHANではないため、緊急度は他候補より低いと判断した。
- **credit-card-point-hikaku**(AFFILIATE_OPPORTUNITY_HIGH): 本文末尾に「現在アフィリエイト提携がないカードも、公式条件のみを基準に公平に扱っています」という編集部の明記がある。アフィリエイト提携の有無で内部リンク・CTAを差別化すると、この記事自身が掲げる中立性の方針と矛盾するため、今回のPhase 2では対象から除外した。
- 上記2件を除外した結果、AFFILIATE_OPPORTUNITY_HIGHからは7記事を採用し、合計は20件(rimawarikun-toha1件は見送りのため実施は19件)とした。

## Phase2PriorityScoreについて

GSCデータが無いため、指示書のスコア配点のうちGSC由来の加点(表示回数・CTR・掲載順位)は使用していない。使用した加点根拠は「MONETIZATION_MISMATCH」「Affiliate CTAありORPHAN」「AFFILIATE_OPPORTUNITY_HIGH」「commercial/comparison意図の強さ」「既存の正しいaffiliate URLの有無」「他記事からの被参照頻度」の6項目で、これらはすべて上表の`commercial_intent`/`verified_affiliate_available`列と当日確認したORPHAN状態から機械的に導出可能なため、数値化した独自スコアを別途作成することはせず、この表を優先順位の根拠として直接使用する。
