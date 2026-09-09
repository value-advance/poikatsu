# サイト信頼性改善 Phase 1 実装報告(2026-09-09)

対象範囲: お問い合わせページ / ブランド表記統一 / 運営・編集体制の分かりやすさ / プライバシーポリシーとGA4実装の整合。
SEO・収益導線・CTA・関連記事ロジックの変更は行っていません。

---

## A. ブランド表記監査

「Value Advance」表記の全出現箇所を調査し、以下のとおり分類しました。単純な一括置換は行わず、1件ずつ判定しています。

| 分類 | 内容 | 件数 | 対応 |
|---|---|---|---|
| A) サイトブランドとしての使用(共通テンプレート文言) | `pages/articles/index.html` `new.html` `updated.html` のリード文(3ファイル・各1箇所) | 3 | 「ポイントの殿堂」に変更 |
| C) 記事本文内の旧ブランド表記("Value Advance編集部") | 19記事ファイル+`pages/category/mile.html` の本文中(評価コメント等) | 25箇所/20ファイル | **変更なし(理由は下記)** |
| B) 運営法人としての使用 | 該当なし(調査の結果、「Value Advance」を法人名として使用している箇所は発見されませんでした。実際の運営法人は `pages/company.html` に記載の「株式会社ネクストフロー」です) | 0 | – |
| D) 技術・ドメイン表記 | ドメイン名 `value-advance.com`(URL・canonical・メールアドレス等) | – | 変更なし(技術基盤のため対象外) |

**記事本文25箇所を変更しなかった理由**: これらは個別記事(19記事)・カテゴリページ(1ページ)の本文中に埋め込まれた文章であり、本タスクの指示で明確に禁止されている「記事本文の変更」「約396記事の本文の機械的な一括書き換え」に該当するため、対象外としました。該当ファイル・行番号の一覧:

```
pages/articles/ana-jal-mile-hikaku.html:420
pages/articles/ana-mile-tameru-kachi.html:170
pages/articles/au-uq-ponta.html:185, 210
pages/articles/credit-card-mile-hikaku.html:251, 282
pages/articles/credit-card-point-hikaku.html:465, 500
pages/articles/d-point-supermarket.html:300
pages/articles/docomo-ahamo-dpoint.html:185
pages/articles/doramori-point.html:179
pages/articles/drugstore-point-hikaku.html:508, 555
pages/articles/jal-mile-tameru-kachi.html:170
pages/articles/kadenryohanten-point-hikaku.html:471, 506
pages/articles/point-museum-poikatsu.html:139
pages/articles/rakuten-mobile-rakuten-point.html:190, 215
pages/articles/rakuten-point-supermarket.html:406
pages/articles/seims-point.html:164
pages/articles/softbank-ymobile-paypay-point.html:180
pages/articles/v-point-supermarket.html:316
pages/articles/vpoint-no-carrier.html:225
pages/category/mile.html:774
```

なお「編集部」単独表記(Value Advanceを冠さないもの)は9箇所で確認しましたが、これらはすでにブランド中立でありそのままで問題ないため変更していません(`au-uq-ponta.html:208`、`docomo-ahamo-dpoint.html:208`、`poikatsu-ranking-hanteikijun.html:53,146`、`rakuten-mobile-rakuten-point.html:213`、`rakuten-paypay-hikaku.html:229`、`softbank-ymobile-paypay-point.html:203`、`vpoint-no-carrier.html:266`、`common-point.html:702`)。

フッターのブランド表記(`site-footer__brand`)はすでに「ポイントの殿堂」で統一されており、変更していません。

---

## B. お問い合わせページ

**変更前**: `pages/contact.html` は「準備中です。」のプレースホルダーのみで、実際の問い合わせ手段がありませんでした。

**調査結果**: リポジトリ内を調査したところ、`pages/company.html` の会社概要テーブルに実在する連絡先メールアドレス `info@value-advance.com` が確認できました。これ以外に問い合わせフォームや外部フォームサービスの実装は見つかりませんでした。

**対応**: `CONTACT_DESTINATION_NOT_FOUND` には該当しなかったため、確認できた実在のメールアドレスを使い、`mailto:` リンクによる実用的なお問い合わせページを実装しました(新規フォーム・新規外部サービスは導入していません)。

**変更後の掲載内容**:
- お問い合わせ先(mailtoリンク)
- お問い合わせ例(誤情報の指摘・修正依頼/広告・提携に関する問い合わせ/著作権・記事内容に関する問い合わせ/その他ご意見)
- 返信についての注意(返信をお約束できない場合がある旨)
- 個人情報・機密情報を不用意に送らないよう注意喚起
- 各サービス自体の利用に関する問い合わせは対象外である旨の案内
- プライバシーポリシーへの内部リンク

title・meta description・canonicalは変更していません(既存の内容ですでに整合していたため)。

---

## C. サイトについてページ(About)

既存の内容(サイトの目的、事実確認方針、比較方針、更新方針、訂正方針、広告方針など)はすべてそのまま維持し、書き換えていません。

**追加した内容**: 「運営・編集について」セクションを新規に追加し、確認できる事実のみを記載しました。

| 項目 | 内容 |
|---|---|
| サイト名 | ポイントの殿堂 |
| URL | https://value-advance.com/ |
| 編集 | ポイントの殿堂編集部 |

運営会社等の事業者情報については、実在情報が既に掲載されている `pages/company.html`(会社概要)への内部リンクを設置し、本ページ側では法人名・代表者名・住所等を新たに記載していません。「監修」等の資格・実績に関する主張は一切追加していません。

title・meta description・canonicalは変更していません。

---

## D. プライバシーポリシー / GA4実装の整合

**実装状況の確認**: リポジトリ全ページ(About/Privacy/Contact/Company含む)で `gtag.js`(測定ID `G-H9CCXWBSXJ`)が実際に読み込まれ、`gtag('config', ...)` が実行されていることを確認しました。GTM(Googleタグマネージャー)やCookie同意バナーの実装は見つかりませんでした。

**変更前**(アクセス解析ツールについて):
> 当サイトでは、サイトの利用状況を把握するため、Googleアナリティクスなどのアクセス解析ツールを導入する場合があります。これらのツールはCookieを利用してデータを収集しますが、個人を特定する情報は含まれません。Cookieを無効にすることで収集を拒否できますので、お使いのブラウザの設定をご確認ください。

**変更後**:
> 当サイトでは、サイトの利用状況を把握するため、Googleアナリティクス(GA4)を利用しています。このツールはCookieを利用してデータを収集しますが、個人を特定する情報は含まれません。Cookieを無効にすることで収集を拒否できますので、お使いのブラウザの設定をご確認ください。

「導入する場合があります」(仮定・将来形)を「利用しています」(事実・現在形)に修正し、実装済みのツール名(GA4)を明記しました。データ項目やGoogle側の内部処理・広告機能に関する未確認の詳細は追加していません。広告配信について(A8.net)のセクションは既に事実と整合していたため変更していません。

---

## E. 共通ページのブランド表記(記事一覧/新着/更新)

`pages/articles/index.html`・`new.html`・`updated.html` のリード文3箇所で「Value Advance」を「ポイントの殿堂」に変更しました(テキストのみ、HTML構造・一覧生成ロジックは変更なし)。

| ファイル | 変更前 | 変更後 |
|---|---|---|
| index.html:36 | Value Advanceで公開している... | ポイントの殿堂で公開している... |
| new.html:36 | Value Advanceで新しく公開した... | ポイントの殿堂で新しく公開した... |
| updated.html:36 | Value Advanceで内容を実質的に更新した... | ポイントの殿堂で内容を実質的に更新した... |

記事本文中の「Value Advance編集部」(25箇所)は上記A節のとおり変更していません。

---

## F. フッター・ヘッダーのお問い合わせ導線

`includes/footer.html` の `site-footer__links` と `includes/header.html` の「記事・サイト情報」ナビに `<li><a href="/pages/contact">お問い合わせ</a></li>` を追加しました。既存のAbout/Company/Sitemap/Privacyへのリンクはそのまま維持しています。

フッターから到達可能なページ: サイトについて/会社概要/サイトマップ/プライバシーポリシー/お問い合わせ ✅(すべて確認済み)

---

## G. SEO安全性の確認

| 項目 | 状態 |
|---|---|
| 記事本文 | 変更なし |
| 記事title | 変更なし |
| 記事H1 | 変更なし |
| 記事meta description | 変更なし |
| 記事URL | 変更なし |
| canonical | 変更なし |
| category | 変更なし |
| 関連記事ロジック | 変更なし |
| affiliate CTA / URL / ASPパラメータ | 変更なし |
| GA4イベント仕様(`affiliate_click`, `related_article_click`) | 変更なし |
| article updatedAt | 変更なし(いずれの記事ファイルも未編集) |
| トップページ主要UI | 変更なし |
| sitemap生成ロジック | 変更なし(`scripts/lib/sitemap.js` 未編集) |

About/Privacy/Contactのtitle・meta descriptionはいずれも既存内容のまま(修正不要と判断)、canonicalも変更していません。

---

## H. 技術監査結果

`node scripts/audit_articles.js` を実行し、以下すべてPASSを確認しました。

| 項目 | 結果 |
|---|---|
| 記事ファイル総数/hub登録数の一致 | 406 / 406(欠落0) |
| 重複slug | 0 |
| 新着一覧同期(new.html) | PASS |
| トップ新着同期 | PASS |
| トップ更新同期 | PASS |
| サイトマップ生成内容とrepo保存内容の一致 | PASS |
| サイトマップXML | PASS |
| canonical不一致 | 0 |
| noindex混入 | 0 |
| 記事/カテゴリのサイトマップ未登録 | 0 |
| lastmod不一致 | 0 |
| 404リンク(HTMLサイトマップ監査) | 0 |
| 旧.html URL | 0 |
| JavaScript(main.js) | 未編集のため影響なし |

※監査ログ中「hon-denshi-shoseki-poikatsu の更新日順が1件前後している」という参考情報が出力されていますが、これは今回の変更と無関係の既存データであり、PASS/FAIL判定には影響しません(監査スクリプト自体がその旨を明記しています)。

**手動確認(ローカルサーバー + ヘッドレスブラウザでJS実行後のDOMを確認)**:
- トップページ:200応答を確認
- お問い合わせページ:ヘッダー/フッターinclude読み込み、mailtoリンク、注意書き、レイアウトを確認 ✅
- サイトについてページ:「運営・編集について」セクションの表示、会社概要への内部リンクを確認 ✅
- プライバシーポリシー:GA4修正後の文言を確認 ✅
- 記事一覧/新着一覧/更新一覧:200応答を確認(リード文の変更はソースレベルで確認済み。ヘッダー/フッターincludeの動作は同一の共通コンポーネントであるため、Contact/Aboutページでの表示確認により動作を確認済みと判断)
- 代表記事ページ:200応答・生ソース確認(ヘッドレスブラウザでのDOM取得は環境側の一時的な不安定さにより一部未取得ですが、記事ファイル自体は本タスクで一切編集していません)

---

## I. 変更ファイル一覧

```
pages/contact.html         「準備中」を実用ページに置き換え(mailto問い合わせ導線を実装)
pages/about.html            「運営・編集について」セクションを追加
pages/privacy.html          GA4に関する記述を現状に合わせて修正
includes/header.html        「お問い合わせ」リンクを追加
includes/footer.html        「お問い合わせ」リンクを追加
pages/articles/index.html   リード文の「Value Advance」→「ポイントの殿堂」(1箇所)
pages/articles/new.html     リード文の「Value Advance」→「ポイントの殿堂」(1箇所)
pages/articles/updated.html リード文の「Value Advance」→「ポイントの殿堂」(1箇所)
```

記事本文ファイル・sitemap.js・main.js・CSS・その他コンポーネントは一切変更していません。

---

## J. 未解決・残課題

- 記事本文中の「Value Advance編集部」表記(25箇所・20ファイル)は、本タスクの指示範囲(記事本文不可侵)により未対応のまま残っています。将来的にブランド統一を徹底する場合は、別タスクとして本文修正の可否を改めて判断いただく必要があります。
- お問い合わせ手段は現状メール(`mailto:`)のみです。フォーム化を希望される場合は、利用するフォームサービス(または追加実装方針)をご指示ください。

以上、今回の対応はいずれも小規模かつ既存の事実に基づく修正のみとし、法人名・資格・監修者・実績・住所・電話番号・メールアドレスの新規創作は行っていません。コミットはまだ行っていません。内容をご確認のうえ、問題なければコミットの可否をご指示ください。
