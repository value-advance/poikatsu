# 収益導線改善 Phase 3 完了レポート

実施日: 2026年9月7日
優先順位レポート: `reports/monetization-phase3-priority-2026-09-07.md`
参照BASELINE/Phase1/Phase2レポート: すべて無変更で保持

**方針の要約**: GSCデータ(ユーザー提供のGoogle Search Consoleエクスポート、2026-07-23〜2026-09-05)を用いてAFFILIATE_OPPORTUNITY_HIGH 36件+Affiliate CTAありORPHAN 1件(rimawarikun-toha)の計37件を優先順位付けし、リポジトリ内で正しいaffiliate URLの存在を1件ずつ検証した。結果、**検証によって実施できることが確認できたのは2記事のみ**で、Direct Affiliate CTAの新規追加は0件、既存記事への内部リンク追加のみを実施した。title/H1/meta/URL/updatedAtは変更していない。

---

## A. Phase 3対象

母集団37件(AFFILIATE_OPPORTUNITY_HIGH 36件+rimawarikun-toha)全件について、GSC照合・検索意図レビュー・既存affiliate URL検証を実施した。

## B. AFFILIATE_OPPORTUNITY_HIGH 36件

- GSCと照合できた件数(GSC「ページ」タブに行が存在): 28件
- 表示回数0(9件): データ欠落ではなく実際に0件であることを確認済み。根拠は2点。(1) GSC「ページ」タブの全462行を確認したところ表示回数の最小値は1で、0件のページはそもそもタブに出力されない仕様のため。(2) 残り9件のslug文字列をGSCエクスポート全体(全シート)から検索し、表記ゆれによる取りこぼしが無いことを確認した。詳細は`reports/monetization-phase3-priority-2026-09-07.md`のA章参照
- 表示あり: 28件
- 平均順位10位以内: 9件

## C. 優先TOP10(検証結果を含む)

| 順位 | slug | clicks | impressions | CTR | position | 検索意図 | 収益機会 | 既存affiliate | 対応内容 | score |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ana-hikari-poikatsu | 0 | 23 | 0% | 15.17 | 比較・申込 | 高 | **NOT_FOUND** | 見送り | 95 |
| 2 | gas-norikae-poikatsu | 0 | 2 | 0% | 7 | 比較・申込 | 高 | NOT_FOUND | 見送り | 93 |
| 3 | infoq-poikatsu | 0 | 7 | 0% | 8.29 | 個別サービス | 中 | NOT_FOUND | 見送り | 93 |
| 4 | aeon-point-tameru | 0 | 91 | 0% | 65.92 | 個別サービス | 中 | NOT_FOUND | 見送り | 80 |
| 5 | nifty-point-club-poikatsu | 0 | 69 | 0% | 38.14 | 個別サービス | 中 | NOT_FOUND | 見送り | 80 |
| 6 | ikkyu-poikatsu | 0 | 41 | 0% | 17.98 | 個別サービス | 中 | NOT_FOUND | 見送り | 80 |
| 7 | mitsui-sumitomo-card-vpoint | 0 | 32 | 0% | 78 | 個別サービス | 中 | NOT_FOUND(再確認) | 見送り | 80 |
| 8 | rakuten-insight-tsukaikata | 0 | 90 | 0% | 38.02 | 個別サービス | 中 | NOT_FOUND | 見送り | 80 |
| 9 | biyouin-salon-point | 0 | 3 | 0% | 8 | comparison | 中 | **あり** | **内部リンク追加** | 78 |
| 20 | keitai-ryokin-point | 0 | 5 | 0% | 15.2 | comparison | 中 | **あり** | **内部リンク追加** | 70 |

(全37件の詳細は`reports/monetization-phase3-priority-2026-09-07.md`参照)

---

## D. 実際に変更した記事

件数: **2記事**

| パターン | 件数 |
|---|---|
| A: Direct Affiliate | 0件 |
| B: Internal Commercial | **2件**(biyouin-salon-point、keitai-ryokin-point) |
| C: Comparison Funnel | 0件 |
| 見送り | 35件(うち34件はAFFILIATE_URL_NOT_FOUND、1件は方針上の理由で除外継続=credit-card-point-hikaku) |

### 1. biyouin-salon-point(パターンB: Internal Commercial)
- 修正前: 「予約アプリごとの特徴比較」が「大手予約サイト」「サロン専用アプリ」という一般名のみ
- 修正後: 大手予約サイトの実例として「楽天ビューティ」を紹介する1文を追加し、`rakuten-beauty-poikatsu`(既存のTrafficGate CTA記事)への内部リンクを追加
- 理由: サロン予約という記事テーマと、楽天ビューティ(美容室・ネイル・エステの検索・予約サービス)は完全に一致しており、既に正しいaffiliate URLを持つ記事が存在したため

### 2. keitai-ryokin-point(パターンB: Internal Commercial)
- 修正前: 「楽天モバイル利用者向け:楽天カード」の節で楽天カードを名指ししているが、内部リンクが無かった
- 修正後: 該当段落に`rakuten-card-poikatsu`(既存のTrafficGate CTA記事)への内部リンクを追加
- 理由: 記事のdescriptionが「相性の良いクレジットカードの紹介」を謳っており、既に本文で名指ししているサービスへリンクするのが最も自然な導線だったため

---

## E. affiliate

| 項目 | 件数 |
|---|---|
| 新規CTA | **0件**(Direct Affiliateは1件も追加していない) |
| 既存affiliate URL再利用(内部リンク経由) | 2件 |
| AFFILIATE_URL_NOT_FOUND | 34件 |

**AFFILIATE_URL_NOT_FOUNDの内訳(代表例)**: ana-hikari-poikatsu(ANAひかり)、gas-norikae-poikatsu/denryoku-norikae-point(電力・ガス乗り換え)、infoq-poikatsu/rakuten-insight-tsukaikata/cue-monitor-poikatsu(アンケートサイト個別)、moppy-hajimekata(モッピー)、nifty-point-club-poikatsu、ikkyu-poikatsu(一休.com)、mitsui-sumitomo-card-vpoint/dcard-poikatsu(Phase2で確認済み、再確認)、aeon-point-tameru(イオンカード)、zozotown-poikatsu、demaecan-poikatsu(出前館)、cleaning-poikatsu、tiktok-lite-poikatsu、one-receipt-poikatsu/reshichare-poikatsu/code-receipt-poikatsu/torima-idou-poikatsu(レシート・移動系アプリ)、roadmap、rakuten-ginkou-happy-program/docomo-ginkou-dpoint-poikatsu(銀行口座)、rakuten-travel-supersale-poikatsu/rakuten-travel-supersale-entry-coupon(楽天トラベル関連)、nenkaihi-muryo-card、hoken-soudan-anken-poikatsu、kakuyasu-sim-norikae-poikatsu、ana-amex-campaign-2026/ana-amex-poikatsu(いずれもANA公式への直リンクのみで代替ASPなし)、chuushajou-yoyaku-poikatsu、hahanohi-chichinohi-gift-point

いずれもサービス名・ブランド名でリポジトリ全体を検索し、`class="cta-simple"`が付随する既存記事が無いことを確認したうえでの判定であり、推測による除外ではない。無関係な代替サービスへの誘導も行っていない。

---

## F. rimawarikun-toha

- **GSC**: 対象期間中の表示回数0件(エクスポートに行が存在しない)
- **記事テーマ**: 不動産クラウドファンディング(実際の現金を用いた投資サービス。ポイントを使う「ポイント投資」とは仕組みが異なる)
- **既存CTA**: あり(1件、affiliate URL確認済み)
- **内部被リンク**: 0件(ORPHAN)
- **調査したsource候補**: `point-toushi-toha`(ポイント投資とは)、`point-unyou-toha`(ポイント運用とは)を調査したが、いずれも「貯めたポイントを使う」投資サービスの解説記事であり、現金を用いる不動産クラウドファンディングとは投資の仕組みが異なるため、無理にリンクすると読者に「ポイントで投資できるサービス」という誤解を与えかねないと判断した
- **対応**: **見送り(内部リンク追加なし)**
- **理由**: サイト内に本記事と自然に接続できる文脈の記事が存在しないため、無理なリンク追加はユーザー意図とのミスマッチを生むと判断し、ORPHANのまま残す方が誠実な対応と考えた

---

## G. Before / After

| 指標 | Phase2後 | Phase3後 |
|---|---|---|
| ORPHAN | 50 | **50**(変更なし。今回の内部リンク追加は両方向とも非ORPHAN記事間だったため) |
| Affiliate CTAありORPHAN | 1 | **1**(rimawarikun-toha、上記F参照のとおり見送り) |
| MONETIZATION_MISMATCH | 0 | **0**(維持) |
| AFFILIATE_OPPORTUNITY_HIGH | 36 | **34**(biyouin-salon-point、keitai-ryokin-pointの2件を内部リンクで対応) |
| 内部リンク関連性2以下 | 0 | **0**(新規追加2件も含め、既存記事で明示的に言及されているサービスへの直接リンクのため関連性5相当) |
| Affiliate関連性2以下 | 2件(Phase1から継続、`creditcard-hakkou-anken-poikatsu`) | **2件**(新規CTAを追加していないため変化なし) |
| CTA_OVERUSE | 2件(許容範囲と判定済み) | **2件**(変化なし) |
| sponsored属性不足 | 0 | 0 |
| DISCLOSURE_WITHOUT_AFFILIATE | 1件(itoyokado-netsuper-onigo-poikatsu) | **1件**(下記参照、変更せず) |

### DISCLOSURE_WITHOUT_AFFILIATEの調査結果(itoyokado-netsuper-onigo-poikatsu)

サイト全体を調査した結果、PR表記(`class="pr-disclosure"`)は**サイト共通表示ではなく記事単位**で付与されている(396記事中105記事のみに存在)。したがって本件は「記事単位の誤表記」に分類される。当該記事のCTAは`itoyokado-netsuper.jp`への直接リンク(`rel="noopener"`、sponsoredなし)であり、実際のアフィリエイト追跡は行われていない。指示に従い、ビジネス/法的表記を推測で削除することはせず、**変更していない**。アフィリエイト契約の有無について、サイト運営側での確認を推奨する。

---

## H. SEO安全性

| 項目 | 状態 |
|---|---|
| title | 変更なし |
| H1 | 変更なし |
| meta | 変更なし |
| URL | 変更なし |
| canonical | 変更なし |
| updatedAt変更 | **0件**(内部リンク追加のみで事実情報は無変更のため) |

---

## I. GA4

| イベント | 状態 |
|---|---|
| affiliate_click | PASS(Phase 1実装のまま。今回は新規CTAを追加していないため発火対象に変化なし) |
| related_article_click | PASS(Phase 1実装のまま。`generate_related_articles.js`再生成後も`data-module`等の属性を維持) |
| 新規CTA | 該当なし(Direct Affiliateを1件も追加していないため) |

新しいGA4イベント名は追加していない(`internal_cta_click`も今回実装せず)。

---

## J. 技術監査

| 項目 | 結果 |
|---|---|
| 404 | 0 |
| 旧`.html` | 0 |
| canonical不一致 | 0 |
| 重複slug | 0 |
| sitemap | PASS(lastmod不一致0。日付を変更していないため再生成不要と判断) |
| audit_articles | PASS(未登録記事0、トップ新着同期・新着一覧同期・トップ更新同期すべてPASS) |
| モバイル | PASS(biyouin-salon-point、keitai-ryokin-pointの2記事をヘッドレスEdgeのモバイル幅(390px)で確認。新規リンクは既存段落内のテキストリンクのため、レイアウト崩れ・CTA連続・広告感の増加なし) |

---

## K. 次Phase

| 項目 | 件数 |
|---|---|
| AFFILIATE_OPPORTUNITY_HIGH残数 | 34件(うち33件はAFFILIATE_URL_NOT_FOUND、1件はcredit-card-point-hikakuで方針上の理由により対象外継続) |
| ORPHAN残数 | 50件(うちAffiliate CTAあり1件: rimawarikun-toha、見送り理由は上記F参照) |

### 次にarticleType基盤へ進むべきか: **NO**

**理由**: Phase 3の調査で判明した最大の課題は、記事構造やCTA配置ロジックではなく、**「収益機会があると判定された記事の9割以上に、そもそも対応する正しいaffiliate URL(ASP案件)が存在しない」**という点だった。articleType基盤やAffiliateCTA共通コンポーネントを導入しても、リンク先の案件自体が無ければ収益は生まれない。次に着手すべきは、以下のいずれかだと考えられる。

1. **ASP側での新規案件開拓**(モッピー、ニフティポイントクラブ、一休.com、電力・ガス乗り換え、ANAひかり等、GSCで一定の表示がありながら未提携のサービス)
2. 新規案件が確保できた記事から順に、今回と同様の手順(検索意図レビュー→内部リンクまたはCTA追加→再監査)で個別対応する
3. `credit-card-point-hikaku`のような中立方針記事・`itoyokado-netsuper-onigo-poikatsu`のような表記不整合記事は、コード変更ではなくビジネス側の意思決定(提携するか、表記を見直すか)が必要

articleType全面導入は、案件そのものが十分に存在する状態になってから検討するのが妥当と判断する。
