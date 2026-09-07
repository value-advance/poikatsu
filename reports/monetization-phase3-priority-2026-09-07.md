# 収益導線改善 Phase 3 優先順位レポート

作成日: 2026年9月7日
母集団: AFFILIATE_OPPORTUNITY_HIGH 36件(`reports/link-audit-2026-09-06-articles.csv`からPhase 2対応済み7件を除外) + Affiliate CTAありORPHAN 1件(rimawarikun-toha) = **37件**

## A. GSC

- **使用ファイル**: ユーザー提供のGoogleスプレッドシート(Google Search Console検索パフォーマンスのエクスポート、シート「ページ」タブ)
- **対象期間**: 2026年7月23日 〜 2026年9月5日(スプレッドシート「平均読み込み時間のチャート」の日付タブで確認できる範囲)
- **GSC対象記事数(全サイト)**: 462ページ(記事以外の固定ページ含む)。うち`pages/articles/`配下の記事URLへの正規化に成功したもの: 37件中28件

URL正規化方法: `https://value-advance.com/pages/articles/{slug}` の形式からdomain・末尾スラッシュ・query・fragmentを除去し、`/pages/articles/([a-zA-Z0-9_-]+)$`のパターンでslugを抽出。URLそのものの書き換えは行っていない(分析上の照合のみ)。

**「表示0件」と「GSC未照合(データ品質上の欠落)」の切り分け**: 母集団37件のうち28件はGSC「ページ」タブに行が存在し、指標を直接取得できた。残り9件はこのタブに行が存在しなかったため、以下2点を確認したうえで「期間中の表示回数が実際に0件だった」と判定した(URL正規化の失敗による見かけ上の欠落ではない)。

1. GSCの「ページ」タブは全462行を確認したところ、表示回数の最小値は1で、表示回数0の行は1件も含まれていなかった。これはGoogle Search Consoleの仕様上、表示回数0のページはページ単位レポートに出力されないためであり、少なくとも1回の表示があったページのみが行として現れる。
2. 念のため、GSCエクスポート全体(「ページ」タブに限らず「クエリ」「国」「デバイス」等の全シートを含むスプレッドシート全体の文字列データ)に対して、残り9件それぞれのslug文字列を検索したが、いずれも一致する行は1件も見つからなかった。これにより、表記ゆれ(末尾スラッシュ・旧URL・別ドメイン表記等)によるマッチング漏れの可能性を排除した。

以上より、残り9件は「GSC未照合(データ欠落)」ではなく、**期間中の表示回数が実際に0件と確認できたもの**として扱う。

## B. AFFILIATE_OPPORTUNITY_HIGH 36件 + rimawarikun-toha

- GSCと照合できた件数(行が存在し、指標を直接取得): 28/37
- 表示回数0(上記の確認手順により「期間中の表示が実際に0件」と確認済み。データ欠落によるものではない): 9件
  - 内訳: chuushajou-yoyaku-poikatsu、hahanohi-chichinohi-gift-point、rakuten-ginkou-happy-program、nenkaihi-muryo-card、rimawarikun-toha、hoken-soudan-anken-poikatsu、kakuyasu-sim-norikae-poikatsu、rakuten-travel-supersale-entry-coupon、ana-amex-poikatsu
- 表示あり: 28件
- 平均順位10位以内: 9件

## C. 優先順位一覧(全37件、スコア降順)

| priority | slug | title | category | clicks | impressions | ctr | position | commercial_intent | comparison_intent | current_cta | affiliate_available | recently_updated | score | recommended_action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ana-hikari-poikatsu | ANAひかりとは?... | seikatsu | 0 | 23 | 0% | 15.17 | ○ | ○ | 2件(非アフィリエイト) | **AFFILIATE_URL_NOT_FOUND** | No | 95 | 見送り(検証済み、下記D参照) |
| 2 | gas-norikae-poikatsu | ガス会社乗り換え... | shopping | 0 | 2 | 0% | 7 | ○ | ○ | 0件 | **NOT_FOUND** | No | 93 | 見送り |
| 3 | infoq-poikatsu | infoQでポイ活する方法 | survey | 0 | 7 | 0% | 8.29 | ○ | - | 0件 | **NOT_FOUND**(サイト内に外部リンク自体が皆無) | No | 93 | 見送り |
| 4 | aeon-point-tameru | イオンで効率よく貯める方法 | shopping | 0 | 91 | 0% | 65.92 | ○ | - | 0件 | NOT_FOUND | No | 80 | 見送り |
| 5 | nifty-point-club-poikatsu | ニフティポイントクラブの活用術 | pointsite | 0 | 69 | 0% | 38.14 | ○ | - | 0件 | NOT_FOUND | No | 80 | 見送り |
| 6 | ikkyu-poikatsu | 一休.comとは | campaign | 0 | 41 | 0% | 17.98 | ○ | - | 0件 | NOT_FOUND | No | 80 | 見送り |
| 7 | mitsui-sumitomo-card-vpoint | 三井住友カードでVポイントを貯める | creditcard | 0 | 32 | 0% | 78 | ○ | - | 0件(被リンク4件) | **NOT_FOUND**(Phase2で確認済み、再確認) | No | 80 | 見送り |
| 8 | rakuten-insight-tsukaikata | 楽天インサイトの使い方 | survey | 0 | 90 | 0% | 38.02 | ○ | - | 0件 | NOT_FOUND | No | 80 | 見送り |
| 9 | biyouin-salon-point | 美容院・サロン代の節約 | shopping | 0 | 3 | 0% | 8 | ○ | - | 0件 | **既存記事あり(rakuten-beauty-poikatsu)** | No | 78 | **実施:内部リンク追加** |
| 10 | cleaning-poikatsu | 宅配クリーニング | shopping | 0 | 5 | 0% | 9.2 | ○ | ○ | 0件 | NOT_FOUND | **Yes(14日以内)** | 78 | 見送り(直近更新+affiliate無し) |
| 11 | zozotown-poikatsu | ZOZOTOWN購入前チェック | shopping | 0 | 5 | 0% | 9.8 | ○ | - | 0件 | NOT_FOUND | No | 78 | 見送り |
| 12 | moppy-hajimekata | モッピーの始め方 | pointsite | 0 | 2 | 0% | 7 | ○ | - | 0件 | **NOT_FOUND**(サイト内に外部リンク自体が皆無) | No | 78 | 見送り |
| 13 | roadmap | 登録〜初回ポイント獲得ロードマップ | pointsite | 0 | 5 | 0% | 7.8 | ○ | - | 0件 | NOT_FOUND | No | 78 | 見送り |
| 14 | ana-amex-campaign-2026 | ANAアメックス入会キャンペーン特集 | creditcard | 0 | 5 | 0% | 6.8 | ○ | - | 3件(非アフィリエイト) | NOT_FOUND | No | 78 | 見送り(既にANA公式への直リンクで最適化済み) |
| 15 | tiktok-lite-poikatsu | TikTok Lite注意点 | app | 0 | 5 | 0% | 6 | ○ | - | 0件 | NOT_FOUND | No | 78 | 見送り |
| 16 | denryoku-norikae-point | 電力会社乗り換え | shopping | 0 | 4 | 0% | 42 | ○ | - | 0件 | NOT_FOUND | No | 75 | 見送り |
| 17 | one-receipt-poikatsu | ONEレシートポイ活 | app | 0 | 70 | 0% | 16.56 | ○ | - | 0件(被リンク1) | NOT_FOUND | No | 75 | 見送り |
| 18 | hikkoshi-poikatsu | 引っ越しでポイ活 | shopping | 0 | 22 | 0% | 35.5 | ○ | - | 0件(被リンク1) | NOT_FOUND | **Yes** | 70 | 見送り |
| 19 | dcard-poikatsu | dカードはポイ活に向いている? | creditcard | 0 | 5 | 0% | 68.8 | ○ | - | 0件(被リンク4) | **NOT_FOUND**(Phase2で確認済み) | No | 70 | 見送り |
| 20 | keitai-ryokin-point | 携帯料金でポイント還元ガイド | creditcard | 0 | 5 | 0% | 15.2 | ○ | ○ | 0件 | **既存記事あり(rakuten-card-poikatsu)** | No | 70 | **実施:内部リンク追加** |
| 21 | torima-idou-poikatsu | トリマ移動ポイ活 | app | 0 | 32 | 0% | 39.53 | ○ | - | 0件(被リンク1) | NOT_FOUND | No | 70 | 見送り |
| 22 | docomo-ginkou-dpoint-poikatsu | dスマートバンクdポイント | kouza | 0 | 22 | 0% | 16.23 | ○ | - | 0件(被リンク2) | NOT_FOUND | **Yes** | 65 | 見送り |
| 23 | reshichare-poikatsu | レシチャレ | app | 0 | 42 | 0% | 10.5 | ○ | - | 0件(被リンク2) | NOT_FOUND | No | 65 | 見送り |
| 24 | demaecan-poikatsu | 出前館 | shopping | 0 | 3 | 0% | 32 | ○ | - | 0件 | NOT_FOUND | No | 60 | 見送り |
| 25 | credit-card-point-hikaku | クレカポイント徹底比較 | creditcard | 0 | 3 | 0% | 83.33 | - | ○ | 0件 | (記事自身が中立方針を明記、対象外) | **Yes** | 60 | 見送り(方針上の理由、Phase2から継続) |
| 26 | cue-monitor-poikatsu | キューモニター | survey | 0 | 19 | 0% | 39.42 | ○ | - | 0件 | NOT_FOUND | No | 60 | 見送り |
| 27 | rakuten-travel-supersale-poikatsu | 楽天トラベルSALEチェックリスト | campaign | 0 | 2 | 0% | 89 | ○ | - | 0件(被リンク3) | NOT_FOUND | **Yes** | 55 | 見送り |
| 28 | code-receipt-poikatsu | CODEレシートポイ活 | app | 0 | 33 | 0% | 20.97 | ○ | - | 0件(被リンク2) | NOT_FOUND | No | 55 | 見送り |
| 29〜37 | chuushajou-yoyaku-poikatsu / hahanohi-chichinohi-gift-point / rakuten-ginkou-happy-program / nenkaihi-muryo-card / rimawarikun-toha / hoken-soudan-anken-poikatsu / kakuyasu-sim-norikae-poikatsu / rakuten-travel-supersale-entry-coupon / ana-amex-poikatsu | (期間中の表示回数0件、確認済み。上記A章参照) | 各種 | 0 | 0 | - | - | 混在 | 混在 | 各種 | ほぼ全てNOT_FOUND(rimawarikun-toha除く) | 混在 | 30〜45 | 見送り(rimawarikun-toha除き詳細はD章参照) |

## D. affiliate_available列の判定方法

各候補について、リポジトリ内の全記事ファイルを対象に、サービス名・ブランド名での`grep`検索とその周辺の`class="cta-simple"`の有無を確認した。加えて、候補記事自身に外部リンクが1件も存在しないケース(infoq-poikatsu、moppy-hajimekata等)も個別に確認した。

**AFFILIATE_URL_NOT_FOUND(新たに確認できなかった)ものが大半を占めた。** これはPhase 1・Phase 2で「既存のCTAを持つ兄弟記事への内部リンク」で解決できる案件をすでに対応済みのため、Phase 3の母集団には「そもそも該当ASP案件がサイト内に存在しない」記事が相対的に多く残っている状態だと考えられる。

一方で、以下2件は既存記事に確認済みの正しいaffiliate URLが存在するため、Phase 3の実施対象とした(詳細は`reports/monetization-phase3-results-2026-09-07.md`参照)。

- **biyouin-salon-point** → `rakuten-beauty-poikatsu`(TrafficGate、`楽天ビューティでサロンを探す`)
- **keitai-ryokin-point** → `rakuten-card-poikatsu`(TrafficGate、`楽天カードの詳細を見る`)

## E. 選定理由(実施対象2件)

**biyouin-salon-point**
- GSC: 3表示 / CTR 0% / 順位8.0
- 検索意図: サロン予約でのポイ活方法(commercial intent)
- 問題: 「予約アプリごとの特徴比較」が一般的なカテゴリ名のみで、具体的なサービス名の記載がなかった
- 既存affiliate: `rakuten-beauty-poikatsu`(楽天ビューティ)に確認済み
- 対応: 大手予約サイトの実例として楽天ビューティを紹介する1文+内部リンクを追加

**keitai-ryokin-point**
- GSC: 5表示 / CTR 0% / 順位15.2
- 検索意図: キャリア別のお得なポイント貯め方(comparison + commercial intent)
- 問題: 「楽天モバイル利用者向け:楽天カード」という節で楽天カードを名指ししているのに、楽天カードの個別記事(CTA設置済み)へのリンクが無かった
- 既存affiliate: `rakuten-card-poikatsu`に確認済み
- 対応: 該当段落に内部リンクを追加

他の候補については、記事の主テーマに一致する既存affiliate URLが確認できなかったため(rule 12の条件3を満たさない)、Direct Affiliate CTAの追加・内部リンクの追加のいずれも見送った。無関係な代替サービスへ誘導することは検索意図とのミスマッチを招くため行っていない。
