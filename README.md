# ポイントの殿堂 (poikatsu)

静的サイト(素のHTML/CSS/JS)。モバイルファーストで、600px・1024pxでレスポンシブ対応。

## フォルダ構成

```
poikatsu/
├── index.html          トップページ
├── pages/               サブページ(about / contact / privacy など)
├── includes/            共通ヘッダー・フッター(JSで各ページに読み込み)
├── css/style.css        共通スタイル
├── js/main.js           共通スクリプト(ヘッダー/フッター読込・ハンバーガーメニュー)
└── images/
    ├── slider/           TOPスライダーのバナー画像(PNG)
    └── (その他)          TOP以外でローカル保存する画像(WebP)
```

## 画像フォーマットのルール

| 画像の種類 | 保存場所 / 形式 |
|---|---|
| TOPバナー(スライダー) | `images/slider/` に **PNG** で保存 |
| アフィリエイト経由の画像 | ローカル保存せず、**アフィリエイトのURLをそのまま `<img src>` に指定** |
| 上記以外でローカル保存する画像(TOP以外) | **WebP** で保存 |

### 新着記事サムネイルの画像ルール(記事タイプ別テンプレート画像)

記事ごとに個別の写真を用意するのではなく、**「記事タイプ」ごとに共通のテンプレート背景画像**を
3枚ずつ用意し、JSが自動で割り当てる方式。

**サムネイルのデザイン(確定版)**:
- タイトルは画像の**前面(中央・左詰め)**に直接オーバーレイ表示する(画像下部に帯を敷いたりはしない)
- 画像自体には暗いオーバーレイ等の加工は行わない(明るさそのまま)
- タイトル文字は `.article-card__thumb--◯◯` ごとに異なる `--thumb-accent` カラー+白い縁取り
  (`-webkit-text-stroke`)で表示し、どんな写真の上でも読めるようにする(タイプごとに文字色が変わるため、
  カード同士の見分けもつきやすい)
- 分類(カテゴリ)バッジは画像内にも画像下部にも表示しない。画像の下は **「更新日:YYYY.MM.DD」+ 抜粋文** のみ
  (`data-category` 属性自体は削除せず、記事一覧の絞り込み・関連するお得なポイントのマッチングに引き続き使う)

**記事タイプ一覧**(`data-thumb-type`。1記事につき1つ):

| 値 | 表示名 |
|---|---|
| `compare` | ポイントサイト比較 |
| `mobile` | 携帯料金・節約 |
| `earnings` | 稼げる金額系 |
| `beginner` | 初心者向け |
| `yosekatsu` | 寄せ活・経済圏 |
| `campaign` | キャンペーン系 |
| `caution` | 注意点・危険性 |
| `app` | アプリ紹介 |
| `creditcard` | クレカ・決済 |
| `summary` | まとめ記事 |
| `mile` | マイル |

※この「記事タイプ」は、サムネイル画像の出し分け専用の分類で、
「関連するお得なポイント」機能で使う`分類`(`data-category`)・`タグ`(`data-tags`)とは別軸。

**画像の準備ルール**:
- 保存場所: `images/article-thumb/{タイプ名}/1.webp` 〜 `3.webp`(1タイプにつき3枚、**WebP形式**)
- アスペクト比は **必ず4:3で書き出す**(推奨サイズ800×600px、150KB以下目安)
- 画像が用意できていないタイプは、CSS側のタイプ別グラデーション(`.article-card__thumb--◯◯`)が
  自動的にフォールバック表示される(`<img>`のような壊れたアイコン表示にはならない)

**同じタイプが横並びになったときの重複回避**:
`js/main.js` の `initArticleThumbTypes()` が、同じ一覧(`.article-list`)内で同じタイプが
複数回登場するたびに1→2→3→1→2…の順で画像をローテーションするため、隣り合う記事同士で
同じ画像になることはない(3枚しか無いため、離れた位置で重複することはある)。

**新しい記事に追加する手順**:
1. 記事内容から上記11タイプのいずれか1つを選ぶ
2. 記事カード(`<a class="article-card">`)に `data-thumb-type="タイプ名"` を追加する(`data-category`・`data-tags` も別途指定)
3. カード内のマークアップは以下の形を踏襲する(`.article-card__cat` は使わない):
   ```html
   <a class="article-card" href="..." data-category="..." data-tags="..." data-thumb-type="タイプ名">
     <div class="article-card__thumb">
       <h3 class="article-card__title">記事タイトル</h3>
     </div>
     <div class="article-card__body">
       <div class="article-card__meta">
         <span class="article-card__date">更新日:YYYY.MM.DD</span>
       </div>
       <p class="article-card__excerpt">抜粋文</p>
     </div>
   </a>
   ```
4. 検索結果ページ用に `js/main.js` の `ARTICLE_SEARCH_INDEX` にもエントリを追加する
   (`category` フィールドは表示には使わないが、検索マッチング用に引き続き保持する)

### TOPバナー(スライダー)の表示ルール

- **キャンペーン・特集が無いとき**:メインバナー(`slider_main_pc.png` / `slider_main_sp.png`)の1枚のみを表示する
- **キャンペーン・特集があるとき**:メインバナーに加えて、キャンペーンスライド(`main_sliderNN_pc.png` / `main_sliderNN_sp.png`)を追加する

`index.html` の `<!-- 例:キャンペーンスライド -->` 以下はコメントアウトされたテンプレートになっている。
キャンペーンが決まったら、コメントを外して画像URL・リンク先(`href`)を差し替える。
スライドが1枚のときは矢印・ドット・自動再生は自動的に非表示になる(`js/main.js` の `initSlider()` で制御)。

### TOPバナー(スライダー)のファイル名規則

スマホ用・PC用で画像が異なるため、1枚につき2ファイル用意する。

```
images/slider/slider_main_pc.png     … メインバナー・PC用(1024px以上で表示、常時表示)
images/slider/slider_main_sp.png     … メインバナー・スマホ用(常時表示)

images/slider/main_slider02_pc.png   … キャンペーンスライド・PC用(キャンペーン時のみ)
images/slider/main_slider02_sp.png   … キャンペーンスライド・スマホ用
images/slider/main_slider03_pc.png   … キャンペーンスライド・PC用
images/slider/main_slider03_sp.png   … キャンペーンスライド・スマホ用
```

`index.html` は `<picture>` + `<source media="(min-width: 1024px)">` で
1024px以上のときPC画像、それ未満のときスマホ画像に自動で出し分ける。
キャンペーンスライドが増える場合は `main_slider04_sp.png` のように連番を増やす。

### TOPバナー(スライダー)のリンク先ルール

各スライドは `<a class="slider__link" href="#" data-slide-id="slider_main">` で
スライド全体を囲んでおり、`href` を差し替えるだけでリンク先を設定できる
(`data-slide-id` は画像ファイル名と揃えた識別用の目印)。

| リンク先の種類 | 設定方法 |
|---|---|
| 内部ページ(記事・キャンペーンページなど) | サイト内の相対パスを指定する(例: `pages/campaign/campaign-01.html`) |
| アフィリエイト経由の案件 | ローカル保存せず、**アフィリエイトの発行URLをそのまま `href` に指定** |

リンク先が未定の間は `href="#"` のプレースホルダーのままにしている。

## ローカルでの確認方法

`includes/header.html` `includes/footer.html` は `fetch()` で読み込んでいるため、
HTMLファイルを直接ダブルクリックで開く(`file://`)と読み込めません。
必ずローカルサーバー経由で確認してください。

```powershell
# poikatsu フォルダ直下で実行
npx serve .
# または
python -m http.server 8000
```

ブラウザで `http://localhost:xxxx/index.html` を開いて確認します。

## 新しいページの追加ルール

- `pages/` 配下に HTML を追加する
- `<body data-root="../">` を指定する(ルート直下のページは `data-root=""`)
- `<div data-include="header"></div>` / `<div data-include="footer"></div>` を配置する
- `<script src="../js/main.js"></script>` を読み込む

## 記事下部の「関連する案件」自動表示(タグマッチング)

記事の `<article>` タグに `data-category` / `data-tags` を指定しておくと、
一致するタグを持つPR案件を `js/main.js` の `PR_OFFERS` から自動抽出し、
記事下部に表示する(`initRelatedOffers()`)。一致する案件が無い場合、
このセクションはJSにより自動的に非表示(削除)になる。

### タグの一覧

**分類(カテゴリ)**(`data-category`。1記事につき1つ。この9種類に固定):

| 値 | 表示名 |
|---|---|
| `creditcard` | クレジットカード |
| `kouza` | 口座開設 |
| `shopping` | ショッピング |
| `app` | アプリ案件 |
| `survey` | アンケート |
| `campaign` | キャンペーン |
| `furima` | フリマ・オークション |
| `sidejob` | 副業 |
| `pointsite` | ポイントサイト |

**タグ**(`data-tags`。分類をさらに詳細化するもの。半角スペース区切りで複数指定可):

| 値 | 表示名 |
|---|---|
| `rakuten` | 楽天ポイント |
| `dpoint` | dポイント |
| `paypay` | PayPayポイント |
| `ponta` | Pontaポイント |
| `vpoint` | Vポイント |
| `waon` | WAON POINT |
| `nanaco` | nanacoポイント |
| `jrepoint` | JRE POINT |
| `beginner` | 初心者向け |

例:クレジットカードの記事で、楽天カード・初心者向けの内容であれば
`data-category="creditcard" data-tags="rakuten beginner"` のように指定する。
「初心者向け」はタグであり、分類(`data-category`)には含めない。

### 新しい記事に追加する手順

1. `<article class="section container article-page" data-category="creditcard" data-tags="rakuten dpoint">` のように指定する
2. 記事下部(`article-footer-nav` の手前など)に次を追加する

```html
<section class="related-offers" id="relatedOffers">
  <h2 class="section-title">この記事に関連するお得なポイント</h2>
  <div class="ranking-grid" id="relatedOffersGrid"></div>
</section>
```

3. マッチさせたいPR案件がまだ `PR_OFFERS`(`js/main.js`)に無い場合は追加する

## サイト内検索

- **PC**: ヘッダー中央に検索フォームを表示(`.site-search--desktop`)
- **スマホ**: ハンバーガーメニューを開いた際の一番上に検索フォームを表示(`.site-search--mobile`)
- 検索フォームは `GET /pages/search?q=キーワード`(拡張子なし)に送信するだけの素のHTMLフォーム(JS不要で動作)。
  `action` を `/pages/search.html` にすると、`serve` などのサーバーが拡張子なしURLへ301リダイレクトする際に
  クエリパラメータ(`?q=...`)ごと失われてしまうため、**必ず拡張子なしの `/pages/search` を指定する**
- `pages/search.html` が検索結果ページ(拡張子なしの `/pages/search` でアクセスされる)。
  `js/main.js` の `ARTICLE_SEARCH_INDEX`(記事のタイトル・カテゴリ・抜粋を持つ配列)に対して、
  URLの `q` パラメータをタイトル・カテゴリ・抜粋に対して部分一致(大文字小文字を区別しない)で検索し、
  一致した記事を記事カード形式で表示する(`initSearchResults()`)
- **検索結果ページはクロール対象外**: `pages/search.html` の `<head>` に
  `<meta name="robots" content="noindex, nofollow">` を指定済み
- 新しい記事を追加したら、`ARTICLE_SEARCH_INDEX` にもタイトル・URL・カテゴリ・日付・
  `data-thumb-type`・抜粋を追加する(追加を忘れると検索にヒットしない)

## TODO

- [ ] TOPページのカテゴリー構成が決まり次第、`index.html` の `#categoryGrid` と
      `includes/header.html` のナビゲーションにカテゴリーリンクを追加する
- [ ] ロゴ・favicon の用意
- [ ] 各ページのコンテンツ作成
- [ ] TOPスライダー用のメインバナー(`slider_main_pc.png` / `slider_main_sp.png`)を
      `images/slider/` に配置する(`<picture>` タグは実装済み。画像が無い間はCSSグラデーションが背景に表示される)
- [ ] TOPバナーのリンク先が決まり次第、`index.html` の `.slider__link` の
      `href="#"` を実際のURL(内部ページ or アフィリエイトURL)に差し替える
- [ ] キャンペーン・特集が決まったら、`index.html` 内のコメントアウトされた
      キャンペーンスライドを有効化し、画像URL・リンク先を設定する
- [ ] ランキングサムネイル画像を用意(アフィリエイト経由は外部URL指定、それ以外はWebP)し、
      `.ranking-card__thumb` (現在はCSSグラデーションのプレースホルダー)を `<img>` タグに差し替える
- [ ] 記事タイプ別のテンプレート背景画像(`images/article-thumb/{タイプ名}/1.webp`〜`3.webp`、
      全11タイプ×3枚=33枚、必ず4:3で書き出す)を用意する。画像が無い間はタイプ別グラデーションが表示される
- [ ] `js/main.js` の `PR_OFFERS` を実際のPR案件データに差し替える
      (現在はタグマッチングの動作確認用サンプル)
- [ ] 新しい記事を追加するたびに `js/main.js` の `ARTICLE_SEARCH_INDEX` にも追加する
