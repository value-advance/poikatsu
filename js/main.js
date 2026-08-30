/**
 * poikatsu site - common script
 * - inject header/footer partials
 * - mobile nav toggle
 *
 * NOTE: fetch() of local partials requires a local HTTP server
 * (file:// double-click will fail due to browser CORS restrictions).
 * See README.md for how to run one.
 */
(function () {
  async function includeHTML(selector, path) {
    const el = document.querySelector(selector);
    if (!el) return;
    const res = await fetch(path);
    el.innerHTML = await res.text();
  }

  function initNavToggle() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("siteNav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu when a nav link is tapped (mobile)
    nav.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initFooterYear() {
    const yearEl = document.getElementById("footerYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // rootSelector配下の1インスタンス分のスライダーを初期化する(ヒーローバナー・特集バナー共通)
  function initSliderComponent(rootSelector, blockName) {
    const slider = document.querySelector(rootSelector);
    if (!slider) return;

    const track = slider.querySelector(`.${blockName}__track`);
    const slides = Array.from(slider.querySelectorAll(`.${blockName}__slide`));
    const dotsWrap = slider.querySelector(`.${blockName}__dots`);
    const prevBtn = slider.querySelector(`.${blockName}__nav--prev`);
    const nextBtn = slider.querySelector(`.${blockName}__nav--next`);
    let index = 0;
    let timer = null;

    // スライドが1枚以下のときは矢印・ドット・自動再生は不要
    if (slides.length <= 1) {
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      if (dotsWrap) dotsWrap.style.display = "none";
      return;
    }

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = `${blockName}__dot` + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", `${i + 1}枚目のスライドを表示`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function render() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
      resetTimer();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(next, 5000);
    }

    prevBtn.addEventListener("click", prev);
    nextBtn.addEventListener("click", next);

    // Swipe support
    let startX = 0;
    slider.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    slider.addEventListener("touchend", (e) => {
      const diff = e.changedTouches[0].clientX - startX;
      if (diff > 40) prev();
      else if (diff < -40) next();
    });

    resetTimer();
  }

  function initSlider() {
    initSliderComponent(".slider", "slider");
    initSliderComponent(".feature-slider", "feature-slider");
  }

  const RANKING_DATA = {
    pointsite: [
      { title: "ワラウ 1pt=1円で豊富な交換先に対応", type: "ポイントサイト", points: "40", suffix: "種類の交換先", url: "/pages/articles/warau-poikatsu", img: "https://www22.a8.net/svt/bgt?aid=260714058081&wid=002&eno=01&mid=s00000018660003014000&mc=1" },
      { title: "ポイントインカム 累計会員数が突破", type: "ポイントサイト", points: "500", suffix: "万人が利用", url: "/pages/articles/pointincome-poikatsu", img: "https://www27.a8.net/svt/bgt?aid=260715065122&wid=002&eno=01&mid=s00000025908001003000&mc=1" },
      { title: "アメフリ 1日5分のすきま時間から", type: "ポイントサイト", points: "5", suffix: "分から始められる", url: "/pages/articles/amefri-poikatsu", img: "https://www26.a8.net/svt/bgt?aid=260715065190&wid=002&eno=01&mid=s00000020637001023000&mc=1" },
      { title: "ECナビ 多彩な貯め方に対応", type: "ポイントサイト", points: "多彩な貯め方", suffix: "に対応", url: "/pages/articles/ecnavi-poikatsu", img: "https://www27.a8.net/svt/bgt?aid=260715065204&wid=002&eno=01&mid=s00000017066001042000&mc=1" },
      { title: "ハピタス 1pt=1円のわかりやすいレート", type: "ポイントサイト", points: "300", suffix: "円から交換可", url: "/pages/articles/hapitas-poikatsu", img: "https://www24.a8.net/svt/bgt?aid=260715065205&wid=002&eno=01&mid=s00000007478002065000&mc=1" },
      { title: "ポイントミュージアム 毎日抽選で当たる", type: "ポイントサイト", points: "1,000", suffix: "円が毎日抽選で当たる", url: "/pages/articles/point-museum-poikatsu", img: "https://www20.a8.net/svt/bgt?aid=260715065224&wid=002&eno=01&mid=s00000003655005014000&mc=1" },
      { title: "ちょびリッチ 無料登録+ミッション達成で獲得", type: "ポイントサイト", points: "200", suffix: "pts.", url: "/pages/articles/chobirich-poikatsu", img: "https://www24.a8.net/svt/bgt?aid=260714058071&wid=002&eno=01&mid=s00000015067001040000&mc=1" },
    ],
    shopping: [
      { title: "楽天市場 総合通販でジャンルが幅広い", type: "総合通販", points: "楽天ポイント", suffix: "が貯まる", url: "/pages/articles/rakuten-ichiba-toha", img: "/images/article-thumb/shopping/rakuten-ichiba.webp" },
      { title: "Yahoo!ショッピング 獲得予定ポイントを表示", type: "総合通販", points: "PayPayポイント", suffix: "などが貯まる", url: "/pages/articles/yahoo-shopping-toha", img: "/images/article-thumb/shopping/yahoo-shopping.webp" },
      { title: "Amazon 品ぞろえと配送が充実", type: "総合通販", points: "Amazonポイント", suffix: "が貯まる", url: "/pages/articles/amazon-tsuhan-toha", img: "/images/article-thumb/shopping/amazon.webp" },
      { title: "au PAY マーケット Pontaポイントが貯まる", type: "総合通販", points: "Pontaポイント", suffix: "が貯まる", url: "/pages/articles/aupay-market-toha", img: "/images/article-thumb/shopping/aupay-market.webp" },
      { title: "dショッピング 食品・日用品・家電まで幅広く", type: "総合通販", points: "dポイント", suffix: "が貯まる", url: "/pages/articles/dshopping-toha", img: "/images/article-thumb/shopping/dshopping.webp" },
      { title: "LOHACO 日用品・食品中心の通販", type: "日用品", points: "PayPayポイント", suffix: "が貯まる", url: "/pages/articles/lohaco-toha", img: "/images/article-thumb/shopping/lohaco.webp" },
      { title: "ヨドバシ.com 家電から書籍まで幅広く展開", type: "家電", points: "ゴールドポイント", suffix: "が貯まる", url: "/pages/articles/yodobashi-toha", img: "/images/article-thumb/shopping/yodobashi.webp" },
      { title: "ビックカメラ.com 店舗とネットで共通利用", type: "家電", points: "ビックポイント", suffix: "が貯まる", url: "/pages/articles/biccamera-toha", img: "/images/article-thumb/shopping/biccamera.webp" },
      { title: "Joshin webショップ 家電・ゲーム・おもちゃ中心", type: "家電", points: "ジョーシンポイント", suffix: "が貯まる", url: "/pages/articles/joshin-web-toha", img: "/images/article-thumb/shopping/joshin-web.webp" },
      { title: "ニッセン 衣類・家具・生活用品の通販", type: "衣類・家具", points: "ニッセンポイント", suffix: "が貯まる", url: "/pages/articles/nissen-toha", img: "/images/article-thumb/shopping/nissen.webp" },
      { title: "高島屋オンラインストア 百貨店品質のギフト", type: "百貨店", points: "タカシマヤポイント", suffix: "などが貯まる", url: "/pages/articles/takashimaya-online-toha", img: "/images/article-thumb/shopping/takashimaya-online.webp" },
      { title: "大丸松坂屋オンラインストア ギフト・化粧品", type: "百貨店", points: "QIRAポイント", suffix: "などが貯まる", url: "/pages/articles/daimaru-matsuzakaya-toha", img: "/images/article-thumb/shopping/daimaru-matsuzakaya.webp" },
    ],
    travel: [
      { title: "イオンコンパストラベルモール(宿泊予約) WAON POINTが貯まる", type: "宿・ホテル予約", points: "WAON POINT", suffix: "が貯まる・1pt=1円で使える", url: "/pages/articles/aeoncompass-travelmall-yado-poikatsu", img: "https://www26.a8.net/svt/bgt?aid=260720103817&wid=002&eno=01&mid=s00000026954001003000&mc=1" },
      { title: "Yahoo!トラベル 約17,000施設から比較", type: "宿・ホテル予約", points: "PayPayポイント", suffix: "が貯まる・その場で使える", url: "/pages/articles/yahoo-travel-poikatsu", img: "https://www25.a8.net/svt/bgt?aid=260720104460&wid=002&eno=01&mid=s00000023244001026000&mc=1" },
      { title: "トラベリスト(海外航空券) IATA認可代理店", type: "海外航空券予約", points: "20秒", suffix: "で発券完了(最短)", url: "/pages/articles/travelist-kaigai-poikatsu", img: "https://www24.a8.net/svt/bgt?aid=260720103939&wid=002&eno=01&mid=s00000023067003003000&mc=1" },
      { title: "じゃらんnet 国内最大級の掲載数", type: "宿・ホテル予約", points: "2%", suffix: "程度のポイント還元(基本)", url: "/pages/articles/jalan-net-poikatsu", img: "https://www23.a8.net/svt/bgt?aid=260720103913&wid=002&eno=01&mid=s00000005230001087000&mc=1" },
      { title: "エアトリ 国内主要14社を一括比較", type: "航空券予約", points: "2%", suffix: "がポイント還元(購入額)", url: "/pages/articles/airtrip-poikatsu", img: "https://www29.a8.net/svt/bgt?aid=260720103908&wid=002&eno=01&mid=s00000001343001062000&mc=1" },
      { title: "イオンコンパストラベルモール(レンタカー予約) 複数社を比較", type: "レンタカー予約", points: "WAON POINT", suffix: "が貯まる・1pt=1円で使える", url: "/pages/articles/aeoncompass-travelmall-poikatsu", img: "https://www22.a8.net/svt/bgt?aid=260720103819&wid=002&eno=01&mid=s00000026954002003000&mc=1" },
      { title: "トラベリスト(国内航空券) JAL・ANA・LCCを比較", type: "航空券予約", points: "3%", suffix: "還元(アプリ購入時)", url: "/pages/articles/travelist-poikatsu", img: "https://www24.a8.net/svt/bgt?aid=260715065195&wid=002&eno=01&mid=s00000023067001009000&mc=1" },
    ],
    survey: [
      { title: "ファンくる 約8,000店舗の飲食店が対象", type: "覆面調査・モニター", points: "8,000", suffix: "店舗の飲食店が対象", url: "/pages/articles/fancrew-poikatsu", img: "https://www26.a8.net/svt/bgt?aid=260720103535&wid=002&eno=01&mid=s00000007875007018000&mc=1" },
      { title: "オピニオンワールド 単価が高くて貯まりやすい", type: "海外企業アンケート", points: "1pt=2円", suffix: "と単価が高め", url: "/pages/articles/opinionworld-poikatsu", img: "https://www23.a8.net/svt/bgt?aid=260715065241&wid=002&eno=01&mid=s00000014177001052000&mc=1" },
      { title: "Ipsos iSay 交換先が豊富", type: "海外企業アンケート", points: "300pt", suffix: "から交換可能(Amazon/PeX)", url: "/pages/articles/ipsos-isay-poikatsu", img: "https://www28.a8.net/svt/bgt?aid=260715065235&wid=002&eno=01&mid=s00000018951001006000&mc=1" },
      { title: "アイリサーチ 簡単にポイントが貯まる", type: "アンケート・会場調査", points: "500円", suffix: "相当以上が簡単に貯まる", url: "/pages/articles/iresearch-poikatsu", img: "https://www22.a8.net/svt/bgt?aid=260715065250&wid=002&eno=01&mid=s00000023983001009000&mc=1" },
      { title: "マクロミル 振込手数料無料で交換可能", type: "アンケートモニター", points: "1pt=1円", suffix: "相当・振込手数料無料", url: "/pages/articles/macromill-poikatsu", img: "https://www23.a8.net/svt/bgt?aid=260715065256&wid=002&eno=01&mid=s00000013554002116000&mc=1" },
      { title: "フルーツメール 運営実績20年以上", type: "ゲーム・アンケート・懸賞", points: "20年", suffix: "以上の運営実績", url: "/pages/articles/fruitmail-poikatsu", img: "https://www21.a8.net/svt/bgt?aid=260715065258&wid=002&eno=01&mid=s00000000368004040000&mc=1" },
      { title: "モニタータウン 登録+アプリインストールで獲得", type: "調査モニター", points: "900円", suffix: "相当ポイント(登録+アプリ導入)", url: "/pages/articles/monitor-town-poikatsu", img: "https://www25.a8.net/svt/bgt?aid=260715065264&wid=002&eno=01&mid=s00000017030004011000&mc=1" },
    ],
    seikatsu: [
      { title: "@nifty with ドコモ光 最大35,000円キャッシュバック", type: "光回線", points: "35,000円", suffix: "キャッシュバック(最大)", url: "/pages/articles/nifty-docomo-hikari-poikatsu", img: "https://www29.a8.net/svt/bgt?aid=260720104398&wid=002&eno=01&mid=s00000019208003021000&mc=1" },
      { title: "au PAY ふるさと納税 Pontaポイントが貯まる", type: "ふるさと納税", points: "1%", suffix: "相当のPontaポイント還元(基本)", url: "/pages/articles/aupay-furusato-poikatsu", img: "https://www28.a8.net/svt/bgt?aid=260720103926&wid=002&eno=01&mid=s00000023934001006000&mc=1" },
      { title: "ドコモでんき 電気代でdポイントが貯まる", type: "電力", points: "最大20%", suffix: "dポイント還元(Greenプラン)", url: "/pages/articles/docomo-denki-poikatsu", img: "https://www22.a8.net/svt/bgt?aid=260720103797&wid=002&eno=01&mid=s00000000018049011000&mc=1" },
      { title: "ahamo光 新規申込みでdポイントプレゼント", type: "光回線", points: "10,000pt", suffix: "dポイントプレゼント(新規申込)", url: "/pages/articles/ahamo-hikari-poikatsu", img: "https://www29.a8.net/svt/bgt?aid=260720103759&wid=002&eno=01&mid=s00000017718076006000&mc=1" },
      { title: "Retty 会員登録不要でネット予約", type: "グルメ予約", points: "2,600万人", suffix: "が利用(2022年5月時点)", url: "/pages/articles/retty-poikatsu", img: "https://www29.a8.net/svt/bgt?aid=260720103753&wid=002&eno=01&mid=s00000020542002015000&mc=1" },
      { title: "dバリューパス 約150の人気コンテンツが使い放題", type: "壁紙・待受サブスク", points: "31日間", suffix: "無料でお試し可能", url: "/pages/articles/d-value-pass-poikatsu", img: "https://www27.a8.net/svt/bgt?aid=260720103545&wid=002&eno=01&mid=s00000027196001008000&mc=1" },
      { title: "auひかり(NEXT申込窓口) オプション加入不要", type: "光回線", points: "最大181,800円", suffix: "相当お得(キャッシュバック合計)", url: "/pages/articles/auhikari-poikatsu", img: "https://www27.a8.net/svt/bgt?aid=260720103522&wid=002&eno=01&mid=s00000014546021006000&mc=1" },
    ],
    sougou: [
      { title: "ワラウ 1pt=1円で豊富な交換先に対応", type: "ポイントサイト", points: "40", suffix: "種類の交換先", url: "/pages/articles/warau-poikatsu", img: "https://www22.a8.net/svt/bgt?aid=260714058081&wid=002&eno=01&mid=s00000018660003014000&mc=1" },
      { title: "ハピタス 1pt=1円のわかりやすいレート", type: "ポイントサイト", points: "300", suffix: "円から交換可", url: "/pages/articles/hapitas-poikatsu", img: "https://www24.a8.net/svt/bgt?aid=260715065205&wid=002&eno=01&mid=s00000007478002065000&mc=1" },
      { title: "楽天市場 総合通販でジャンルが幅広い", type: "総合通販", points: "楽天ポイント", suffix: "が貯まる", url: "/pages/articles/rakuten-ichiba-toha", img: "/images/article-thumb/shopping/rakuten-ichiba.webp" },
      { title: "Amazon 品ぞろえと配送が充実", type: "総合通販", points: "Amazonポイント", suffix: "が貯まる", url: "/pages/articles/amazon-tsuhan-toha", img: "/images/article-thumb/shopping/amazon.webp" },
      { title: "ファンくる 約8,000店舗の飲食店が対象", type: "覆面調査・モニター", points: "8,000", suffix: "店舗の飲食店が対象", url: "/pages/articles/fancrew-poikatsu", img: "https://www26.a8.net/svt/bgt?aid=260720103535&wid=002&eno=01&mid=s00000007875007018000&mc=1" },
      { title: "マクロミル 振込手数料無料で交換可能", type: "アンケートモニター", points: "1pt=1円", suffix: "相当・振込手数料無料", url: "/pages/articles/macromill-poikatsu", img: "https://www23.a8.net/svt/bgt?aid=260715065256&wid=002&eno=01&mid=s00000013554002116000&mc=1" },
      { title: "Yahoo!トラベル 約17,000施設から比較", type: "宿・ホテル予約", points: "PayPayポイント", suffix: "が貯まる・その場で使える", url: "/pages/articles/yahoo-travel-poikatsu", img: "https://www25.a8.net/svt/bgt?aid=260720104460&wid=002&eno=01&mid=s00000023244001026000&mc=1" },
      { title: "エアトリ 国内主要14社を一括比較", type: "航空券予約", points: "2%", suffix: "がポイント還元(購入額)", url: "/pages/articles/airtrip-poikatsu", img: "https://www29.a8.net/svt/bgt?aid=260720103908&wid=002&eno=01&mid=s00000001343001062000&mc=1" },
      { title: "@nifty with ドコモ光 最大35,000円キャッシュバック", type: "光回線", points: "35,000円", suffix: "キャッシュバック(最大)", url: "/pages/articles/nifty-docomo-hikari-poikatsu", img: "https://www29.a8.net/svt/bgt?aid=260720104398&wid=002&eno=01&mid=s00000019208003021000&mc=1" },
      { title: "auひかり(NEXT申込窓口) オプション加入不要", type: "光回線", points: "最大181,800円", suffix: "相当お得(キャッシュバック合計)", url: "/pages/articles/auhikari-poikatsu", img: "https://www27.a8.net/svt/bgt?aid=260720103522&wid=002&eno=01&mid=s00000014546021006000&mc=1" },
    ],
  };

  function renderRankingCards(grid, catKey) {
    const items = RANKING_DATA[catKey] || [];
    grid.innerHTML = items.map((item) => `
      <a class="ranking-card" href="${item.url || "#"}">
        <div class="ranking-card__thumb">${item.img ? `<img src="${item.img}" alt="${item.title}" loading="lazy">` : ""}</div>
        <div class="ranking-card__body">
          <p class="ranking-card__title">${item.title}</p>
          <span class="ranking-card__type">${item.type}</span>
          <div class="ranking-card__points">${item.points}<small>${item.suffix}</small></div>
        </div>
      </a>
    `).join("");
  }

  function initRankingTabs() {
    const tabsWrap = document.getElementById("rankingTabs");
    const grid = document.getElementById("rankingGrid");
    if (!tabsWrap || !grid) return;

    const tabs = Array.from(tabsWrap.querySelectorAll(".ranking-tab"));

    renderRankingCards(grid, tabs.find((t) => t.classList.contains("is-active"))?.dataset.tab || "sougou");

    tabsWrap.addEventListener("click", (e) => {
      const tab = e.target.closest(".ranking-tab");
      if (!tab) return;

      tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
      renderRankingCards(grid, tab.dataset.tab);
    });
  }

  // 記事下部の「関連するお得なポイント」表示用データ
  // 分類(category、1つ) … pointsite(ポイントサイト) / shopping(ショッピング) /
  //                        campaign(旅行・キャンペーン系) / survey(アンケート) /
  //                        seikatsu(生活) / app(アプリ案件) / kouza(銀行/証券口座開設)
  // タグ(tags、複数可)   … rakuten(楽天ポイント) / dpoint(dポイント) / paypay(PayPayポイント) /
  //                        ponta(Pontaポイント) / vpoint(Vポイント) / beginner(初心者向け)
  // 記事側は <article> タグに data-category / data-tags を指定する(半角スペース区切り)。
  // 各記事の category/tags は実際の <article> タグの値と一致させること。
  const PR_OFFERS = [
    // ポイントサイト
    { title: "ワラウ 1pt=1円で豊富な交換先に対応", type: "ポイントサイト", points: "40", suffix: "種類の交換先", category: "pointsite", tags: ["beginner"], url: "/pages/articles/warau-poikatsu", img: "https://www22.a8.net/svt/bgt?aid=260714058081&wid=002&eno=01&mid=s00000018660003014000&mc=1" },
    { title: "ポイントインカム 累計会員数が突破", type: "ポイントサイト", points: "500", suffix: "万人が利用", category: "pointsite", tags: ["beginner"], url: "/pages/articles/pointincome-poikatsu", img: "https://www27.a8.net/svt/bgt?aid=260715065122&wid=002&eno=01&mid=s00000025908001003000&mc=1" },
    { title: "アメフリ 1日5分のすきま時間から", type: "ポイントサイト", points: "5", suffix: "分から始められる", category: "pointsite", tags: ["beginner"], url: "/pages/articles/amefri-poikatsu", img: "https://www26.a8.net/svt/bgt?aid=260715065190&wid=002&eno=01&mid=s00000020637001023000&mc=1" },
    { title: "ECナビ 多彩な貯め方に対応", type: "ポイントサイト", points: "多彩な貯め方", suffix: "に対応", category: "pointsite", tags: ["beginner"], url: "/pages/articles/ecnavi-poikatsu", img: "https://www27.a8.net/svt/bgt?aid=260715065204&wid=002&eno=01&mid=s00000017066001042000&mc=1" },
    { title: "ハピタス 1pt=1円のわかりやすいレート", type: "ポイントサイト", points: "300", suffix: "円から交換可", category: "pointsite", tags: ["beginner"], url: "/pages/articles/hapitas-poikatsu", img: "https://www24.a8.net/svt/bgt?aid=260715065205&wid=002&eno=01&mid=s00000007478002065000&mc=1" },
    { title: "ポイントミュージアム 毎日抽選で当たる", type: "ポイントサイト", points: "1,000", suffix: "円が毎日抽選で当たる", category: "pointsite", tags: ["beginner"], url: "/pages/articles/point-museum-poikatsu", img: "https://www20.a8.net/svt/bgt?aid=260715065224&wid=002&eno=01&mid=s00000003655005014000&mc=1" },
    { title: "ちょびリッチ 無料登録+ミッション達成で獲得", type: "ポイントサイト", points: "200", suffix: "pts.", category: "pointsite", tags: ["beginner"], url: "/pages/articles/chobirich-poikatsu", img: "https://www24.a8.net/svt/bgt?aid=260714058071&wid=002&eno=01&mid=s00000015067001040000&mc=1" },
    // ショッピング
    { title: "楽天市場 総合通販でジャンルが幅広い", type: "総合通販", points: "楽天ポイント", suffix: "が貯まる", category: "shopping", tags: ["rakuten", "beginner"], url: "/pages/articles/rakuten-ichiba-toha", img: "/images/article-thumb/shopping/rakuten-ichiba.webp" },
    { title: "Yahoo!ショッピング 獲得予定ポイントを表示", type: "総合通販", points: "PayPayポイント", suffix: "などが貯まる", category: "shopping", tags: ["paypay", "beginner"], url: "/pages/articles/yahoo-shopping-toha", img: "/images/article-thumb/shopping/yahoo-shopping.webp" },
    { title: "Amazon 品ぞろえと配送が充実", type: "総合通販", points: "Amazonポイント", suffix: "が貯まる", category: "shopping", tags: ["beginner"], url: "/pages/articles/amazon-tsuhan-toha", img: "/images/article-thumb/shopping/amazon.webp" },
    { title: "au PAY マーケット Pontaポイントが貯まる", type: "総合通販", points: "Pontaポイント", suffix: "が貯まる", category: "shopping", tags: ["ponta", "beginner"], url: "/pages/articles/aupay-market-toha", img: "/images/article-thumb/shopping/aupay-market.webp" },
    { title: "dショッピング 食品・日用品・家電まで幅広く", type: "総合通販", points: "dポイント", suffix: "が貯まる", category: "shopping", tags: ["dpoint", "beginner"], url: "/pages/articles/dshopping-toha", img: "/images/article-thumb/shopping/dshopping.webp" },
    { title: "LOHACO 日用品・食品中心の通販", type: "日用品", points: "PayPayポイント", suffix: "が貯まる", category: "shopping", tags: ["paypay", "beginner"], url: "/pages/articles/lohaco-toha", img: "/images/article-thumb/shopping/lohaco.webp" },
    { title: "ヨドバシ.com 家電から書籍まで幅広く展開", type: "家電", points: "ゴールドポイント", suffix: "が貯まる", category: "shopping", tags: ["beginner"], url: "/pages/articles/yodobashi-toha", img: "/images/article-thumb/shopping/yodobashi.webp" },
    { title: "ビックカメラ.com 店舗とネットで共通利用", type: "家電", points: "ビックポイント", suffix: "が貯まる", category: "shopping", tags: ["beginner"], url: "/pages/articles/biccamera-toha", img: "/images/article-thumb/shopping/biccamera.webp" },
    { title: "Joshin webショップ 家電・ゲーム・おもちゃ中心", type: "家電", points: "ジョーシンポイント", suffix: "が貯まる", category: "shopping", tags: ["beginner"], url: "/pages/articles/joshin-web-toha", img: "/images/article-thumb/shopping/joshin-web.webp" },
    { title: "ニッセン 衣類・家具・生活用品の通販", type: "衣類・家具", points: "ニッセンポイント", suffix: "が貯まる", category: "shopping", tags: ["beginner"], url: "/pages/articles/nissen-toha", img: "/images/article-thumb/shopping/nissen.webp" },
    { title: "高島屋オンラインストア 百貨店品質のギフト", type: "百貨店", points: "タカシマヤポイント", suffix: "などが貯まる", category: "shopping", tags: ["beginner"], url: "/pages/articles/takashimaya-online-toha", img: "/images/article-thumb/shopping/takashimaya-online.webp" },
    { title: "大丸松坂屋オンラインストア ギフト・化粧品", type: "百貨店", points: "QIRAポイント", suffix: "などが貯まる", category: "shopping", tags: ["beginner"], url: "/pages/articles/daimaru-matsuzakaya-toha", img: "/images/article-thumb/shopping/daimaru-matsuzakaya.webp" },
    { title: "セブンネットショッピング 店舗受け取りで送料無料", type: "総合通販", points: "24時間", suffix: "受け取り可能", category: "shopping", tags: ["beginner"], url: "/pages/articles/sevennet-shopping-poikatsu", img: "https://ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=3776575&pid=892684845" },
    // 旅行(data-category="campaign")
    { title: "イオンコンパストラベルモール(宿泊予約) WAON POINTが貯まる", type: "宿・ホテル予約", points: "WAON POINT", suffix: "が貯まる・1pt=1円で使える", category: "campaign", tags: ["beginner"], url: "/pages/articles/aeoncompass-travelmall-yado-poikatsu", img: "https://www26.a8.net/svt/bgt?aid=260720103817&wid=002&eno=01&mid=s00000026954001003000&mc=1" },
    { title: "Yahoo!トラベル 約17,000施設から比較", type: "宿・ホテル予約", points: "PayPayポイント", suffix: "が貯まる・その場で使える", category: "campaign", tags: ["paypay", "beginner"], url: "/pages/articles/yahoo-travel-poikatsu", img: "https://www25.a8.net/svt/bgt?aid=260720104460&wid=002&eno=01&mid=s00000023244001026000&mc=1" },
    { title: "トラベリスト(海外航空券) IATA認可代理店", type: "海外航空券予約", points: "20秒", suffix: "で発券完了(最短)", category: "campaign", tags: ["beginner"], url: "/pages/articles/travelist-kaigai-poikatsu", img: "https://www24.a8.net/svt/bgt?aid=260720103939&wid=002&eno=01&mid=s00000023067003003000&mc=1" },
    { title: "じゃらんnet 国内最大級の掲載数", type: "宿・ホテル予約", points: "2%", suffix: "程度のポイント還元(基本)", category: "campaign", tags: ["beginner", "ponta", "dpoint"], url: "/pages/articles/jalan-net-poikatsu", img: "https://www23.a8.net/svt/bgt?aid=260720103913&wid=002&eno=01&mid=s00000005230001087000&mc=1" },
    { title: "エアトリ 国内主要14社を一括比較", type: "航空券予約", points: "2%", suffix: "がポイント還元(購入額)", category: "campaign", tags: ["beginner"], url: "/pages/articles/airtrip-poikatsu", img: "https://www29.a8.net/svt/bgt?aid=260720103908&wid=002&eno=01&mid=s00000001343001062000&mc=1" },
    { title: "イオンコンパストラベルモール(レンタカー予約) 複数社を比較", type: "レンタカー予約", points: "WAON POINT", suffix: "が貯まる・1pt=1円で使える", category: "campaign", tags: ["beginner"], url: "/pages/articles/aeoncompass-travelmall-poikatsu", img: "https://www22.a8.net/svt/bgt?aid=260720103819&wid=002&eno=01&mid=s00000026954002003000&mc=1" },
    { title: "トラベリスト(国内航空券) JAL・ANA・LCCを比較", type: "航空券予約", points: "3%", suffix: "還元(アプリ購入時)", category: "campaign", tags: ["paypay", "beginner"], url: "/pages/articles/travelist-poikatsu", img: "https://www24.a8.net/svt/bgt?aid=260715065195&wid=002&eno=01&mid=s00000023067001009000&mc=1" },
    // アンケート
    { title: "ファンくる 約8,000店舗の飲食店が対象", type: "覆面調査・モニター", points: "8,000", suffix: "店舗の飲食店が対象", category: "survey", tags: ["beginner"], url: "/pages/articles/fancrew-poikatsu", img: "https://www26.a8.net/svt/bgt?aid=260720103535&wid=002&eno=01&mid=s00000007875007018000&mc=1" },
    { title: "オピニオンワールド 単価が高くて貯まりやすい", type: "海外企業アンケート", points: "1pt=2円", suffix: "と単価が高め", category: "survey", tags: ["beginner"], url: "/pages/articles/opinionworld-poikatsu", img: "https://www23.a8.net/svt/bgt?aid=260715065241&wid=002&eno=01&mid=s00000014177001052000&mc=1" },
    { title: "Ipsos iSay 交換先が豊富", type: "海外企業アンケート", points: "300pt", suffix: "から交換可能(Amazon/PeX)", category: "survey", tags: ["beginner"], url: "/pages/articles/ipsos-isay-poikatsu", img: "https://www28.a8.net/svt/bgt?aid=260715065235&wid=002&eno=01&mid=s00000018951001006000&mc=1" },
    { title: "アイリサーチ 簡単にポイントが貯まる", type: "アンケート・会場調査", points: "500円", suffix: "相当以上が簡単に貯まる", category: "survey", tags: ["beginner"], url: "/pages/articles/iresearch-poikatsu", img: "https://www22.a8.net/svt/bgt?aid=260715065250&wid=002&eno=01&mid=s00000023983001009000&mc=1" },
    { title: "マクロミル 振込手数料無料で交換可能", type: "アンケートモニター", points: "1pt=1円", suffix: "相当・振込手数料無料", category: "survey", tags: ["beginner"], url: "/pages/articles/macromill-poikatsu", img: "https://www23.a8.net/svt/bgt?aid=260715065256&wid=002&eno=01&mid=s00000013554002116000&mc=1" },
    { title: "フルーツメール 運営実績20年以上", type: "ゲーム・アンケート・懸賞", points: "20年", suffix: "以上の運営実績", category: "survey", tags: ["beginner"], url: "/pages/articles/fruitmail-poikatsu", img: "https://www21.a8.net/svt/bgt?aid=260715065258&wid=002&eno=01&mid=s00000000368004040000&mc=1" },
    { title: "モニタータウン 登録+アプリインストールで獲得", type: "調査モニター", points: "900円", suffix: "相当ポイント(登録+アプリ導入)", category: "survey", tags: ["beginner"], url: "/pages/articles/monitor-town-poikatsu", img: "https://www25.a8.net/svt/bgt?aid=260715065264&wid=002&eno=01&mid=s00000017030004011000&mc=1" },
    // 生活
    { title: "BIGLOBE光 フレッツ光の設備を使った格安光回線", type: "光回線", points: "最大2,200円", suffix: "割引(auスマートバリュー)", category: "seikatsu", tags: ["beginner"], url: "/pages/articles/biglobe-hikari-poikatsu", img: "https://www22.a8.net/svt/bgt?aid=260813279105&wid=002&eno=01&mid=s00000017718046009000&mc=1" },
    { title: "SoftBank 光 フレッツ光より安い高速光回線", type: "光回線", points: "最大10万円", suffix: "還元(あんしん乗り換えキャンペーン)", category: "seikatsu", tags: ["beginner"], url: "/pages/articles/softbank-hikari-poikatsu", img: "https://www20.a8.net/svt/bgt?aid=260813279086&wid=002&eno=01&mid=s00000016370001008000&mc=1" },
    { title: "楽天ひかり 楽天モバイルとセットで楽天市場ポイント7倍", type: "光回線", points: "毎日7倍", suffix: "楽天モバイルとセット利用で楽天市場ポイント", category: "seikatsu", tags: ["rakuten", "beginner"], url: "/pages/articles/rakuten-hikari-poikatsu", img: "https://srv2.trafficgate.net/t/b/208/3159/318897_398564" },
    { title: "楽天ミュージック 広告なしで約1億曲聴き放題", type: "音楽サブスク", points: "780円", suffix: "〜/月(楽天モバイル・楽天カード会員)", category: "seikatsu", tags: ["rakuten", "beginner"], url: "/pages/articles/rakuten-music-poikatsu", img: "https://srv2.trafficgate.net/t/b/146/6277/318897_398564" },
    { title: "楽天Car車検 見積もり比較・予約で楽天ポイント", type: "車検の見積もり・予約", points: "500", suffix: "ポイント進呈(見積もり予約&車検実施)", category: "seikatsu", tags: ["rakuten", "beginner"], url: "/pages/articles/rakuten-car-shaken-poikatsu", img: "https://srv2.trafficgate.net/t/b/78/5734/318897_398564" },
    { title: "楽天ビューティ 美容室・ネイル・エステの検索&予約", type: "美容室・サロン予約", points: "楽天ポイント", suffix: "が貯まる・使える", category: "seikatsu", tags: ["rakuten", "beginner"], url: "/pages/articles/rakuten-beauty-poikatsu", img: "https://srv2.trafficgate.net/t/b/10/6369/318897_398564" },
    { title: "楽天写真館 写真プリント〜フォトブックが作れる", type: "写真プリント・フォトブック", points: "100円", suffix: "につき楽天ポイント1pt", category: "seikatsu", tags: ["rakuten", "beginner"], url: "/pages/articles/rakuten-shashinkan-poikatsu", img: "https://srv2.trafficgate.net/t/b/391/4055/318897_398564" },
    { title: "楽天でんわ 番号そのままで通話料半額", type: "電話アプリ", points: "30秒11円", suffix: "(税込)の通話料、110円で楽天ポイント1pt", category: "seikatsu", tags: ["rakuten", "beginner"], url: "/pages/articles/rakuten-denwa-poikatsu", img: "https://srv2.trafficgate.net/t/b/17/5812/318897_398564" },
    { title: "楽天モバイル データ使い放題で楽天ポイントも貯まる", type: "携帯回線", points: "2,980円", suffix: "(税込3,278円)/月でデータ使い放題", category: "seikatsu", tags: ["rakuten", "beginner"], url: "/pages/articles/rakuten-mobile-poikatsu", img: "https://www28.a8.net/svt/bgt?aid=260720103756&wid=002&eno=01&mid=s00000027494001003000&mc=1" },
    { title: "@nifty with ドコモ光 最大35,000円キャッシュバック", type: "光回線", points: "35,000円", suffix: "キャッシュバック(最大)", category: "seikatsu", tags: ["beginner"], url: "/pages/articles/nifty-docomo-hikari-poikatsu", img: "https://www29.a8.net/svt/bgt?aid=260720104398&wid=002&eno=01&mid=s00000019208003021000&mc=1" },
    { title: "au PAY ふるさと納税 Pontaポイントが貯まる", type: "ふるさと納税", points: "1%", suffix: "相当のPontaポイント還元(基本)", category: "seikatsu", tags: ["ponta", "beginner"], url: "/pages/articles/aupay-furusato-poikatsu", img: "https://www28.a8.net/svt/bgt?aid=260720103926&wid=002&eno=01&mid=s00000023934001006000&mc=1" },
    { title: "ドコモでんき 電気代でdポイントが貯まる", type: "電力", points: "最大20%", suffix: "dポイント還元(Greenプラン)", category: "seikatsu", tags: ["dpoint", "beginner"], url: "/pages/articles/docomo-denki-poikatsu", img: "https://www22.a8.net/svt/bgt?aid=260720103797&wid=002&eno=01&mid=s00000000018049011000&mc=1" },
    { title: "ahamo光 新規申込みでdポイントプレゼント", type: "光回線", points: "10,000pt", suffix: "dポイントプレゼント(新規申込)", category: "seikatsu", tags: ["dpoint", "beginner"], url: "/pages/articles/ahamo-hikari-poikatsu", img: "https://www29.a8.net/svt/bgt?aid=260720103759&wid=002&eno=01&mid=s00000017718076006000&mc=1" },
    { title: "Retty 会員登録不要でネット予約", type: "グルメ予約", points: "2,600万人", suffix: "が利用(2022年5月時点)", category: "seikatsu", tags: ["paypay", "beginner"], url: "/pages/articles/retty-poikatsu", img: "https://www29.a8.net/svt/bgt?aid=260720103753&wid=002&eno=01&mid=s00000020542002015000&mc=1" },
    { title: "dバリューパス 約150の人気コンテンツが使い放題", type: "壁紙・待受サブスク", points: "31日間", suffix: "無料でお試し可能", category: "seikatsu", tags: ["dpoint", "beginner"], url: "/pages/articles/d-value-pass-poikatsu", img: "https://www27.a8.net/svt/bgt?aid=260720103545&wid=002&eno=01&mid=s00000027196001008000&mc=1" },
    { title: "auひかり(NEXT申込窓口) オプション加入不要", type: "光回線", points: "最大181,800円", suffix: "相当お得(キャッシュバック合計)", category: "seikatsu", tags: ["beginner"], url: "/pages/articles/auhikari-poikatsu", img: "https://www27.a8.net/svt/bgt?aid=260720103522&wid=002&eno=01&mid=s00000014546021006000&mc=1" },
    // アプリ(特集)
    { title: "HashPort Wallet 暗号資産・ポイント・NFTを一元管理", type: "Web3ウォレット", points: "無料", suffix: "で基本機能を利用可能", category: "app", tags: ["beginner"], url: "/pages/articles/hashport-wallet-poikatsu", img: null },
    // 銀行/証券
    { title: "松井証券のiDeCo 運営管理手数料0円", type: "証券", points: "0円", suffix: "の運営管理手数料・低コスト商品40種類", category: "kouza", tags: ["beginner"], url: "/pages/articles/matsui-shouken-ideco-poikatsu", img: "https://www21.a8.net/svt/bgt?aid=260715065123&wid=002&eno=01&mid=s00000018318002010000&mc=1" },
    { title: "DMM株 少額投資・低コストのネット証券", type: "証券", points: "1,000円", suffix: "以下で購入できる銘柄あり", category: "kouza", tags: ["beginner"], url: "/pages/articles/dmm-kabu-poikatsu", img: "https://www28.a8.net/svt/bgt?aid=260714058100&wid=002&eno=01&mid=s00000008903007004000&mc=1" },
  ];

  // 関連リンクとして意味を持つタグ(beginnerは対象が広すぎるため除外)
  const RELATED_TAG_WHITELIST = ["rakuten", "dpoint", "paypay", "ponta", "vpoint"];

  function initRelatedOffers() {
    const section = document.getElementById("relatedOffers");
    const grid = document.getElementById("relatedOffersGrid");
    const article = document.querySelector("[data-category]");
    if (!section || !grid || !article) return;

    const category = article.dataset.category || "";
    const tags = (article.dataset.tags || "").split(" ").filter(Boolean);
    const meaningfulTags = tags.filter((t) => RELATED_TAG_WHITELIST.includes(t));
    const currentFile = location.pathname.split("/").pop();

    const matches = PR_OFFERS.filter((offer) => {
      if (offer.url && currentFile && offer.url.endsWith("/" + currentFile)) return false;
      return offer.category === category || offer.tags.some((t) => meaningfulTags.includes(t));
    }).slice(0, 6);

    if (matches.length === 0) {
      section.remove();
      return;
    }

    grid.innerHTML = matches.map((offer) => `
      <a class="ranking-card" href="${offer.url || "#"}">
        <div class="ranking-card__thumb">${offer.img ? `<img src="${offer.img}" alt="${offer.title}" loading="lazy">` : ""}</div>
        <div class="ranking-card__body">
          <p class="ranking-card__title">${offer.title}</p>
          <span class="ranking-card__type">${offer.type}</span>
          <div class="ranking-card__points">${offer.points}<small>${offer.suffix}</small></div>
        </div>
      </a>
    `).join("");
  }

  // 記事下部の「よくみられている記事」表示用データ
  // category が現在の記事の data-category と一致するものを優先的に表示し、
  // 一致がない場合は "__default__"(初心者ガイド)にフォールバックする。
  const POPULAR_ARTICLES = [
    // 初心者ガイド(フォールバック用)
    { title: "ポイ活とは?仕組み・種類・始め方から注意点まで完全ガイド", excerpt: "ポイ活とは何か、できること、種類、始め方、メリット・デメリット、よくある質問まで、初心者向けに13のポイントで詳しく解説します。", url: "/pages/beginner/poikatsu-toha", thumbType: "beginner", category: "__default__" },
    { title: "ポイ活の始め方3ステップ|初心者でも今日から始められる", excerpt: "ポイ活を始めたいけど何からすればいいかわからない方向けに、登録から交換までの流れを3ステップでわかりやすく解説します。", url: "/pages/beginner/hajimekata-3steps", thumbType: "beginner", category: "__default__" },
    { title: "初心者におすすめのポイントサイト3選", excerpt: "初めてポイントサイトを使う方に向けて、おすすめのポイントサイト3つと、サイト選びで失敗しないためのチェックポイントをわかりやすく紹介します。", url: "/pages/beginner/osusume-site", thumbType: "beginner", category: "__default__" },
    { title: "ポイ活の稼ぎ方には何がある?自分に合った方法を見つけよう", excerpt: "ポイントサイトでポイントを貯める方法にはさまざまな種類があります。それぞれの仕組みやメリット、向いている人を初心者向けにわかりやすく解説します。", url: "/pages/beginner/kasegikata-shurui", thumbType: "beginner", category: "__default__" },
    // ショッピング
    { title: "楽天市場とは?総合通販でジャンルが幅広い", excerpt: "総合通販でジャンルが幅広く、楽天ポイントが貯まる「楽天市場」の特徴を解説します。", url: "/pages/articles/rakuten-ichiba-toha", thumbType: "summary", category: "shopping" },
    { title: "Yahoo!ショッピングとは?獲得予定ポイントを表示", excerpt: "商品ごとに獲得予定ポイントを表示してくれる「Yahoo!ショッピング」の特徴を解説します。", url: "/pages/articles/yahoo-shopping-toha", thumbType: "summary", category: "shopping" },
    { title: "Amazonとは?品ぞろえと配送サービスが充実", excerpt: "品ぞろえと配送サービスが充実した通販サイト「Amazon」の特徴を解説します。", url: "/pages/articles/amazon-tsuhan-toha", thumbType: "summary", category: "shopping" },
    { title: "au PAY マーケットとは?Pontaポイントが貯まる総合通販", excerpt: "Pontaポイントが貯まる総合通販サイト「au PAY マーケット」の特徴を解説します。", url: "/pages/articles/aupay-market-toha", thumbType: "summary", category: "shopping" },
    { title: "dショッピングとは?食品・日用品・家電など幅広く展開", excerpt: "食品・日用品・家電など幅広く展開する通販サイト「dショッピング」の特徴を解説します。", url: "/pages/articles/dshopping-toha", thumbType: "summary", category: "shopping" },
    { title: "LOHACOとは?日用品・食品中心の通販サイト", excerpt: "日用品・食品を中心に取り扱う通販サイト「LOHACO」の特徴を解説します。", url: "/pages/articles/lohaco-toha", thumbType: "summary", category: "shopping" },
    { title: "ヨドバシ.comとは?家電から日用品・書籍まで幅広く展開", excerpt: "家電から日用品・書籍まで幅広く展開する通販サイト「ヨドバシ.com」の特徴を解説します。", url: "/pages/articles/yodobashi-toha", thumbType: "summary", category: "shopping" },
    { title: "ビックカメラ.comとは?店舗とネットでポイント共通利用", excerpt: "店舗とネットでポイントを共通利用できる「ビックカメラ.com」の特徴を解説します。", url: "/pages/articles/biccamera-toha", thumbType: "summary", category: "shopping" },
    { title: "Joshin webショップとは?家電・ゲーム・おもちゃが中心", excerpt: "家電・ゲーム・おもちゃを中心に取り扱う「Joshin webショップ」の特徴を解説します。", url: "/pages/articles/joshin-web-toha", thumbType: "summary", category: "shopping" },
    { title: "ニッセンとは?衣類・家具・生活用品の通販", excerpt: "衣類・家具・生活用品を扱う通販サイト「ニッセン」の特徴を解説します。", url: "/pages/articles/nissen-toha", thumbType: "summary", category: "shopping" },
    { title: "高島屋オンラインストアとは?百貨店品質のギフト・食品・衣類", excerpt: "百貨店品質のギフト・食品・衣類を扱う「高島屋オンラインストア」の特徴を解説します。", url: "/pages/articles/takashimaya-online-toha", thumbType: "summary", category: "shopping" },
    { title: "大丸松坂屋オンラインストアとは?ギフト・化粧品・ファッション", excerpt: "百貨店のギフト・化粧品・ファッションを扱う「大丸松坂屋オンラインストア」の特徴を解説します。", url: "/pages/articles/daimaru-matsuzakaya-toha", thumbType: "summary", category: "shopping" },
    // ポイントサイト
    { title: "ワラウとは?老舗ポイントサイトの貯め方・交換方法を解説", excerpt: "運営歴26年以上、コンテンツ50種類以上の老舗ポイントサイト「ワラウ」の特徴を解説します。", url: "/pages/articles/warau-poikatsu", thumbType: "earnings", category: "pointsite" },
    { title: "ポイントインカムとは?アプリでも貯まるポイントサイトの特徴を解説", excerpt: "累計500万人以上が利用し、アプリの動画視聴や歩数計測でも貯まるポイントサイト「ポイントインカム」の特徴を解説します。", url: "/pages/articles/pointincome-poikatsu", thumbType: "earnings", category: "pointsite" },
    { title: "アメフリとは?すきま時間で貯まるポイントサイトの特徴を解説", excerpt: "1日5分のすきま時間からでも取り組める、続けやすさが魅力のポイントサイト「アメフリ」の特徴を解説します。", url: "/pages/articles/amefri-poikatsu", thumbType: "earnings", category: "pointsite" },
    { title: "ECナビとは?多彩な方法でポイントが貯まるポイントサイトの特徴を解説", excerpt: "ネットショッピングやアンケート、モニター参加など多彩な方法でポイントが貯まるポイントサイト「ECナビ」の特徴を解説します。", url: "/pages/articles/ecnavi-poikatsu", thumbType: "earnings", category: "pointsite" },
    { title: "ハピタスとは?1pt=1円の明確なレートで貯まるポイントサイトの特徴を解説", excerpt: "3,000件以上のショップと提携し、1pt=1円のわかりやすいレートで貯まる高還元ポイントサイト「ハピタス」の特徴を解説します。", url: "/pages/articles/hapitas-poikatsu", thumbType: "earnings", category: "pointsite" },
    { title: "ポイントミュージアムとは?毎日楽しく貯まるポイントサイトの特徴を解説", excerpt: "毎日抽選の「1000円ゲット」など、コツコツ楽しく貯められるポイントサイト「ポイントミュージアム」の特徴を解説します。", url: "/pages/articles/point-museum-poikatsu", thumbType: "earnings", category: "pointsite" },
    { title: "ちょびリッチとは?評判・特徴からポイントの貯め方まで徹底解説", excerpt: "20年以上の運営実績があり、無料登録+ミッション達成でポイントが貯まる老舗ポイントサイト「ちょびリッチ」の特徴を解説します。", url: "/pages/articles/chobirich-poikatsu", thumbType: "earnings", category: "pointsite" },
    // 旅行(data-category="campaign")
    { title: "イオンコンパストラベルモール(宿泊予約)とは?WAON POINTが貯まる予約サービス", excerpt: "全国の宿・ホテルを検索・予約でき、WAON POINTが貯まる・使える「イオンコンパストラベルモール」の宿泊予約サービスを解説します。", url: "/pages/articles/aeoncompass-travelmall-yado-poikatsu", thumbType: "compare", category: "campaign" },
    { title: "Yahoo!トラベルとは?PayPayポイントが貯まる・使える宿泊予約サービス", excerpt: "全国約17,000施設から比較できる宿泊予約サービス「Yahoo!トラベル」の特徴を解説します。", url: "/pages/articles/yahoo-travel-poikatsu", thumbType: "compare", category: "campaign" },
    { title: "トラベリスト(海外航空券)とは?IATA認可代理店の予約サービスを解説", excerpt: "IATA認可代理店として海外航空券を比較・予約できる「トラベリスト」の海外航空券サービスを解説します。", url: "/pages/articles/travelist-kaigai-poikatsu", thumbType: "compare", category: "campaign" },
    { title: "じゃらんnetとは?宿・ホテル予約でポイントが貯まる仕組みを解説", excerpt: "国内最大級の掲載数を誇る宿泊予約サービス「じゃらんnet」の特徴を解説します。", url: "/pages/articles/jalan-net-poikatsu", thumbType: "compare", category: "campaign" },
    { title: "エアトリとは?国内航空券の一括比較とポイントの貯め方を解説", excerpt: "国内主要14社の航空券を一括比較できる旅行予約サービス「エアトリ」の特徴を解説します。", url: "/pages/articles/airtrip-poikatsu", thumbType: "compare", category: "campaign" },
    { title: "イオンコンパストラベルモール(レンタカー予約)とは?WAON POINTを貯める方法", excerpt: "複数のレンタカー会社を比較・予約できる「イオンコンパストラベルモール」のレンタカー予約サービスを解説します。", url: "/pages/articles/aeoncompass-travelmall-poikatsu", thumbType: "compare", category: "campaign" },
    { title: "トラベリストとは?国内航空券を一括比較できる予約サービス", excerpt: "JAL・ANA・LCCを一括比較できる航空券予約サービス「トラベリスト」の特徴を解説します。", url: "/pages/articles/travelist-poikatsu", thumbType: "compare", category: "campaign" },
    // アンケート
    { title: "ファンくるとは?覆面調査でお店をおトクに体験できるモニターサービス", excerpt: "約8,000店舗の飲食店をはじめ多ジャンルの案件がある覆面調査サービス「ファンくる」の特徴を解説します。", url: "/pages/articles/fancrew-poikatsu", thumbType: "earnings", category: "survey" },
    { title: "オピニオンワールドとは?単価が高めの海外アンケートサイトを解説", excerpt: "大手市場調査会社Dynataの日本法人が運営し、単価が高めとされるアンケートサイト「オピニオンワールド」の特徴を解説します。", url: "/pages/articles/opinionworld-poikatsu", thumbType: "earnings", category: "survey" },
    { title: "Ipsos iSayとは?海外企業のアンケートに答えてポイントが貯まるサイト", excerpt: "世界的な市場調査会社イプソスが運営するアンケートサイト「Ipsos iSay」の特徴を解説します。", url: "/pages/articles/ipsos-isay-poikatsu", thumbType: "earnings", category: "survey" },
    { title: "アイリサーチとは?自社会場調査もあるアンケートサイトの特徴を解説", excerpt: "東証スタンダード上場企業が運営し、自社会場調査もあるアンケートサイト「アイリサーチ」の特徴を解説します。", url: "/pages/articles/iresearch-poikatsu", thumbType: "earnings", category: "survey" },
    { title: "マクロミルとは?アンケート回答でポイントが貯まるモニターサービス", excerpt: "アンケート回答でポイントが貯まる大手ネットリサーチ企業のモニターサービス「マクロミル」の特徴を解説します。", url: "/pages/articles/macromill-poikatsu", thumbType: "earnings", category: "survey" },
    { title: "フルーツメールとは?ゲーム・アンケートでポイントが貯まる懸賞サイト", excerpt: "ゲームやアンケートで手軽にポイントが貯まる懸賞サイト「フルーツメール」の特徴を解説します。", url: "/pages/articles/fruitmail-poikatsu", thumbType: "earnings", category: "survey" },
    { title: "モニタータウンとは?PC調査モニターの特徴・参加方法をわかりやすく解説", excerpt: "PCに専用アプリを入れるだけで参加できる調査モニターサービス「モニタータウン」の特徴を解説します。", url: "/pages/articles/monitor-town-poikatsu", thumbType: "beginner", category: "survey" },
    // 生活
    { title: "BIGLOBE光とは?フレッツ光の設備を使った高速・格安光回線を解説", excerpt: "フレッツ光の回線設備を使った「BIGLOBE光」の月額料金、auスマートバリュー割引、工事費、WEB限定キャンペーンを解説します。", url: "/pages/articles/biglobe-hikari-poikatsu", thumbType: "compare", category: "seikatsu" },
    { title: "SoftBank 光とは?フレッツ光より安い高速光回線とキャッシュバックを解説", excerpt: "フレッツ光の回線を使ったソフトバンクの光インターネット「SoftBank 光」の月額料金、あんしん乗り換えキャンペーン、キャッシュバックを解説します。", url: "/pages/articles/softbank-hikari-poikatsu", thumbType: "compare", category: "seikatsu" },
    { title: "楽天ひかりとは?楽天モバイルとセットで楽天市場ポイントが7倍になる光回線", excerpt: "楽天ひかりの月額料金、楽天モバイルとのセット利用による楽天市場ポイント最大7倍の仕組み、契約期間を解説します。", url: "/pages/articles/rakuten-hikari-poikatsu", thumbType: "compare", category: "seikatsu" },
    { title: "楽天ミュージックとは?広告なしで約1億曲聴き放題の音楽アプリを解説", excerpt: "月額980円(会員なら780円)で約1億曲が広告なしで聴き放題の「楽天ミュージック」の特徴、料金プラン、楽天ポイントの貯め方を解説します。", url: "/pages/articles/rakuten-music-poikatsu", thumbType: "app", category: "seikatsu" },
    { title: "楽天Car車検とは?見積もり比較・予約で楽天ポイントがもらえるサービス", excerpt: "車検の見積もり比較・予約ができる「楽天Car車検」の特徴、楽天ポイントの貯め方、加盟店を解説します。", url: "/pages/articles/rakuten-car-shaken-poikatsu", thumbType: "app", category: "seikatsu" },
    { title: "楽天ビューティとは?美容室・ネイル・エステの検索・予約ができるサービス", excerpt: "全国の美容室・ネイル・まつげ・エステ・リラクサロンを検索・予約できる「楽天ビューティ」の特徴や楽天ポイントの貯め方・使い方を解説します。", url: "/pages/articles/rakuten-beauty-poikatsu", thumbType: "app", category: "seikatsu" },
    { title: "楽天写真館とは?写真プリントからフォトブックまで作れるサービス", excerpt: "デジカメ写真のプリントからオリジナルフォトブックまで作成できる「楽天写真館」の特徴や料金、楽天ポイントの貯め方を解説します。", url: "/pages/articles/rakuten-shashinkan-poikatsu", thumbType: "app", category: "seikatsu" },
    { title: "楽天でんわとは?番号そのままで通話料を半額にできる電話アプリ", excerpt: "通話料が30秒22円のプランを契約中なら通話料半額、月額基本料0円で使った分だけ後払いの電話アプリ「楽天でんわ」の特徴を解説します。", url: "/pages/articles/rakuten-denwa-poikatsu", thumbType: "app", category: "seikatsu" },
    { title: "楽天モバイルとは?データ使い放題と楽天ポイント最大+4倍を解説", excerpt: "データ使用量に応じた段階制料金で、楽天市場のポイントも上乗せされる「楽天モバイル」の特徴を解説します。", url: "/pages/articles/rakuten-mobile-poikatsu", thumbType: "compare", category: "seikatsu" },
    { title: "@nifty with ドコモ光とは?キャッシュバックと料金・特典を解説", excerpt: "老舗プロバイダーのニフティが提供するドコモ光の申込窓口「@nifty with ドコモ光」の特徴を解説します。", url: "/pages/articles/nifty-docomo-hikari-poikatsu", thumbType: "compare", category: "seikatsu" },
    { title: "au PAY ふるさと納税とは?Pontaポイントが貯まる・使える寄付サイト", excerpt: "KDDIとauコマース&ライフが共同運営するふるさと納税ポータル「au PAY ふるさと納税」の特徴を解説します。", url: "/pages/articles/aupay-furusato-poikatsu", thumbType: "beginner", category: "seikatsu" },
    { title: "ドコモでんきとは?電気代でdポイントが貯まる仕組みを解説", excerpt: "電気料金の支払いでdポイントが貯まる電力サービス「ドコモでんき」の特徴を解説します。", url: "/pages/articles/docomo-denki-poikatsu", thumbType: "compare", category: "seikatsu" },
    { title: "ahamo光とは?料金・dポイント特典・工事費無料の条件を解説", excerpt: "NTTドコモが提供する光インターネットサービス「ahamo光」の特徴を解説します。", url: "/pages/articles/ahamo-hikari-poikatsu", thumbType: "compare", category: "seikatsu" },
    { title: "Rettyとは?会員登録不要でPayPayポイントが貯まるグルメ予約サービス", excerpt: "実名ユーザーの口コミからお店探し・ネット予約ができるグルメサービス「Retty」の特徴を解説します。", url: "/pages/articles/retty-poikatsu", thumbType: "app", category: "seikatsu" },
    { title: "dバリューパスとは?初月無料で壁紙・待受が使い放題のサブスク", excerpt: "NTTドコモが提供し、待受・壁紙など約150の人気コンテンツが使い放題になるサブスク「dバリューパス」の特徴を解説します。", url: "/pages/articles/d-value-pass-poikatsu", thumbType: "app", category: "seikatsu" },
    { title: "auひかりとは?NEXT経由の申込みでキャッシュバックが早いって本当?", excerpt: "IPv6通信標準装備のKDDI光回線「auひかり」を、正規代理店NEXT経由で申し込める窓口を解説します。", url: "/pages/articles/auhikari-poikatsu", thumbType: "compare", category: "seikatsu" },
  ];

  function initPopularArticles() {
    const section = document.getElementById("popularArticles");
    const grid = document.getElementById("popularArticlesGrid");
    const article = document.querySelector("[data-category]");
    if (!section || !grid || !article) return;

    const category = article.dataset.category || "";
    const currentFile = location.pathname.split("/").pop();
    const isSelf = (item) => item.url && currentFile && item.url.endsWith("/" + currentFile);

    let pool = POPULAR_ARTICLES.filter((item) => item.category === category);
    if (pool.length === 0) {
      pool = POPULAR_ARTICLES.filter((item) => item.category === "__default__");
    }

    const selfIndex = pool.findIndex(isSelf);
    const others = pool.filter((item) => !isSelf(item));

    if (others.length === 0) {
      section.remove();
      return;
    }

    const MAX_ITEMS = 10;
    const matches = [];

    // 配列の先頭(=新しく追加した記事)を、自分自身でなければ常に1枠目に固定表示する
    const newest = pool[0];
    if (newest && !isSelf(newest)) {
      matches.push(newest);
    }

    // 残りの枠は、自分自身と1枠目に固定した記事を除いた中から、
    // 自記事の位置に応じて開始位置をずらして表示する
    // (11と互いに素な5をずらし幅にすることで、隣り合う記事同士でも表示が大きく重ならないようにする)
    const rotationPool = others.filter((item) => item !== newest);
    const STRIDE = 5;
    const start = selfIndex >= 0 && rotationPool.length > 0 ? (selfIndex * STRIDE) % rotationPool.length : 0;
    for (let i = 0; matches.length < MAX_ITEMS && i < rotationPool.length; i++) {
      matches.push(rotationPool[(start + i) % rotationPool.length]);
    }

    grid.innerHTML = matches.map((item) => `
      <a class="article-card" href="${item.url}" data-thumb-type="${item.thumbType}">
        <div class="article-card__thumb">
          <h3 class="article-card__title">${item.title}</h3>
        </div>
        <div class="article-card__body">
          <p class="article-card__excerpt">${item.excerpt}</p>
        </div>
      </a>
    `).join("");
  }

  function initArticleFilter() {
    const form = document.getElementById("articleFilter");
    const grid = document.getElementById("articleListFull");
    const countEl = document.getElementById("articleCount");
    const paginationEl = document.getElementById("articlePagination");
    if (!form || !grid || !countEl) return;

    const PAGE_SIZE = 24;
    const cards = Array.from(grid.querySelectorAll(".article-card"));
    const total = cards.length;
    let currentPage = 1;

    function getMatchedCards() {
      const checked = Array.from(form.querySelectorAll("input[type='checkbox']:checked")).map((cb) => cb.value);
      return cards.filter((card) => checked.length === 0 || checked.includes(card.dataset.category));
    }

    function renderPagination(totalPages) {
      if (!paginationEl) return;
      if (totalPages <= 1) {
        paginationEl.innerHTML = "";
        return;
      }

      const pageNumbers = [];
      for (let p = 1; p <= totalPages; p++) {
        if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
          pageNumbers.push(p);
        } else if (pageNumbers[pageNumbers.length - 1] !== "...") {
          pageNumbers.push("...");
        }
      }

      const btn = (label, page, opts = {}) => {
        const { disabled = false, active = false } = opts;
        return `<button type="button" class="pagination__btn${active ? " is-active" : ""}"
          data-page="${page}" ${disabled ? "disabled" : ""} aria-label="${label === "‹" ? "前のページ" : label === "›" ? "次のページ" : `${label}ページ目`}"
          ${active ? 'aria-current="page"' : ""}>${label}</button>`;
      };

      let html = btn("‹", currentPage - 1, { disabled: currentPage === 1 });
      pageNumbers.forEach((p) => {
        html += p === "..."
          ? `<span class="pagination__ellipsis">…</span>`
          : btn(String(p), p, { active: p === currentPage });
      });
      html += btn("›", currentPage + 1, { disabled: currentPage === totalPages });

      paginationEl.innerHTML = html;

      paginationEl.querySelectorAll(".pagination__btn").forEach((b) => {
        b.addEventListener("click", () => {
          const page = Number(b.dataset.page);
          if (!page || page === currentPage) return;
          currentPage = page;
          renderPage();
          grid.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }

    function renderPage() {
      const matched = getMatchedCards();
      const totalPages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
      currentPage = Math.min(Math.max(1, currentPage), totalPages);

      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const matchedSet = new Set(matched);

      cards.forEach((card) => {
        card.hidden = !matchedSet.has(card);
      });
      matched.forEach((card, i) => {
        card.hidden = i < start || i >= end;
      });

      countEl.innerHTML = `全${total}件中 <strong>${matched.length}件</strong> を表示`;
      renderPagination(totalPages);
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      currentPage = 1;
      renderPage();
    });

    renderPage();
  }

  // 記事タイプ別サムネイル
  // タイプ一覧: compare(ポイントサイト比較) / mobile(携帯料金・節約) / earnings(稼げる金額系) /
  //             beginner(初心者向け) / yosekatsu(寄せ活・経済圏) / campaign(キャンペーン系) /
  //             caution(注意点・危険性) / app(アプリ紹介) / creditcard(クレカ・決済) / summary(まとめ記事) /
  //             mile(マイル)
  // 記事側は .article-card に data-thumb-type="タイプ名" を指定する。
  // テンプレート画像は images/article-thumb/{タイプ名}/1.webp 〜 3.webp(3枚)を用意する想定。
  // 画像が無い間は、CSS側のタイプ別グラデーション(.article-card__thumb--◯◯)が表示される。
  const THUMB_VARIANTS_PER_TYPE = 3;

  // .article-card__thumb--◯◯ のグラデーション(style.css)と同じ内容。
  // 実画像(images/article-thumb/)が読み込めない間、この色がフォールバックとして透けて見える。
  const THUMB_TYPE_FALLBACK = {
    compare: "linear-gradient(135deg, #7ee8d8, #4fc3e8)",
    mobile: "linear-gradient(135deg, #ffb26b, #ff7a00)",
    earnings: "linear-gradient(135deg, #ffe066, #ff8fa3)",
    beginner: "linear-gradient(135deg, #a8d8ff, #6fe0d0)",
    yosekatsu: "linear-gradient(135deg, #cdb4f7, #8f7fe8)",
    campaign: "linear-gradient(135deg, #ffb199, #ff6f91)",
    caution: "linear-gradient(135deg, #ffcf86, #ff8a65)",
    app: "linear-gradient(135deg, #90cdf4, #4a90e2)",
    creditcard: "linear-gradient(135deg, #ffe9a8, #ffb347)",
    summary: "linear-gradient(135deg, #d6d1f5, #a3a1e8)",
    mile: "linear-gradient(135deg, #b3ecff, #56ccf2)",
  };

  function initArticleThumbTypes() {
    const root = document.body.dataset.root || "";

    document.querySelectorAll(".article-list").forEach((grid) => {
      const counts = {};

      grid.querySelectorAll(".article-card[data-thumb-type]").forEach((card) => {
        const type = card.dataset.thumbType;
        const thumb = card.querySelector(".article-card__thumb");
        const fallback = THUMB_TYPE_FALLBACK[type];
        if (!thumb || !fallback) return;

        const occurrence = (counts[type] = (counts[type] || 0) + 1);
        const variant = ((occurrence - 1) % THUMB_VARIANTS_PER_TYPE) + 1;

        thumb.classList.add(`article-card__thumb--${type}`);
        // 1つ目(実画像)が読み込めない間は、2つ目(タイプ別グラデーション)が透けて見える
        thumb.style.backgroundImage = `url(${root}images/article-thumb/${type}/${variant}.webp), ${fallback}`;
      });
    });
  }

  // サイト内検索用インデックス
  // TODO: 新しい記事を作成したら、ここにも追加する
  const ARTICLE_SEARCH_INDEX = [
    { title: "PayPayポイント⇄Vポイント相互交換 完全ガイド【2026年版】", url: "/pages/articles/paypay-vpoint-koukan", category: "ショッピング", date: "2026.08.30", thumbType: "compare", excerpt: "交換レート・条件・PayPay⇄Vそれぞれの手順、有効期限の注意点を解説します。" },
    { title: "ドコモの銀行(ドコモSMTBネット銀行)でdポイントを貯める方法【2026年】", url: "/pages/articles/docomo-ginkou-dpoint-poikatsu", category: "口座開設", date: "2026.08.30", thumbType: "app", excerpt: "dアカウント連携や給与受取・デビットカードでの貯め方を解説します。" },
    { title: "コード決済4社を徹底比較|PayPay・d払い・楽天ペイ・au PAY", url: "/pages/articles/code-kessai-4sha-hikaku", category: "ショッピング", date: "2026.08.30", thumbType: "compare", excerpt: "還元率・貯まるポイント・有効期限・カード組み合わせをタイプ別に比較します。" },
    { title: "ドラッグストアのポイントを徹底比較|マツキヨ・ウエルシア・スギ薬局・ツルハなど", url: "/pages/articles/drugstore-point-hikaku", category: "ショッピング", date: "2026.08.26", thumbType: "compare", excerpt: "主要8社を公式情報で比較。独自ポイントと共通ポイントの関係、ポイントアップ制度、月間利用額シミュレーションを解説します。" },
    { title: "マツキヨココカラのポイント制度!マツキヨココカラポイントとdポイントの関係", url: "/pages/articles/matsukiyo-cocokara-point", category: "ショッピング", date: "2026.08.27", thumbType: "compare", excerpt: "現金払いとクレジット払いでの違い、dポイントとの併用条件を解説します。" },
    { title: "ウエルシアのポイント制度!WAON POINT・Vポイントと「ウエル活」の仕組み", url: "/pages/articles/welcia-point", category: "ショッピング", date: "2026.08.26", thumbType: "campaign", excerpt: "WAON POINT・Vポイントの基本還元と、毎月20日の「ウエル活」の現在の条件を解説します。" },
    { title: "スギ薬局のポイント制度!スギポイントの貯め方と使い方", url: "/pages/articles/sugi-point", category: "ショッピング", date: "2026.08.26", thumbType: "beginner", excerpt: "スギポイントの付与条件、クレジット払いでの上乗せ、処方箋支払い時の注意を解説します。" },
    { title: "ツルハのポイント制度!ツルハポイントカードと楽天ポイントの併用", url: "/pages/articles/tsuruha-point", category: "ショッピング", date: "2026.08.26", thumbType: "compare", excerpt: "商品カテゴリ別の還元率、楽天ポイントとの二重取り条件を解説します。" },
    { title: "ドラッグストアモリのポイントを解説|ポイントデー・使い方・キャッシュレス時の条件", url: "/pages/articles/doramori-point", category: "ショッピング", date: "2026.08.26", thumbType: "compare", excerpt: "現金払いとキャッシュレス払いの違い、常設のポイント3倍デー、dポイントとの関係を解説します。" },
    { title: "ドラッグセイムスのポイントを解説|セイムスポイントカードと楽天ポイントの関係", url: "/pages/articles/seims-point", category: "ショッピング", date: "2026.08.26", thumbType: "compare", excerpt: "富士薬品グループで使える範囲、楽天ポイントとの関係を解説します。" },
    { title: "楽天トラベルスーパーセールで失敗しないポイ活!予約前チェックリスト", url: "/pages/articles/rakuten-travel-supersale-poikatsu", category: "キャンペーン", date: "2026.08.27", thumbType: "caution", excerpt: "セール時に見るべき条件、クーポンの優先順位、ポイント倍率の確認、キャンセル条件の注意、予算内に収めるコツを解説します。" },
    { title: "Uber Eatsでポイ活する方法!クーポン・支払い・手数料の見方", url: "/pages/articles/ubereats-poikatsu", category: "生活", date: "2026.08.27", thumbType: "app", excerpt: "利用時にかかる費用の内訳、クーポンの使い方、ポイントが貯まる支払い方法、配達手数料の注意点を解説します。" },
    { title: "マツキヨココカラでポイ活する方法!アプリ・クーポン・決済の基本", url: "/pages/articles/matsukiyo-cocokara-poikatsu", category: "ショッピング", date: "2026.08.27", thumbType: "earnings", excerpt: "公式アプリ会員の確認、クーポンの入手・使い方、支払い方法の選び方、日用品購入で活用するコツを解説します。" },
    { title: "空港ラウンジ特典はポイ活に役立つ?カード特典の見極め方", url: "/pages/articles/kuukou-lounge-poikatsu", category: "クレジットカード", date: "2026.08.28", thumbType: "compare", excerpt: "対象カードの確認、同伴者料金の注意、年会費との比較、旅行頻度での判断コツを初心者向けに解説します。" },
    { title: "引越し後の生活用品で使えるポイ活術!支出が増える前に確認したい節約ポイント", url: "/pages/articles/hikkoshi-seikatsuyohin-poikatsu", category: "ショッピング", date: "2026.08.29", thumbType: "caution", excerpt: "支出が増えやすい理由、ポイント還元日の確認、クーポンと支払い方法の組み合わせ、買いすぎを防ぐ注意点を解説します。" },
    { title: "クリーニング代でポイントを貯める方法!宅配と店舗を比較するコツ", url: "/pages/articles/cleaning-poikatsu", category: "ショッピング", date: "2026.08.29", thumbType: "compare", excerpt: "宅配クリーニングと店舗のポイントの違い、送料・保管料の注意点、衣替え時期の活用コツを解説します。" },
    { title: "ANAのふるさと納税でマイルを貯める方法!旅行好き向けの基本", url: "/pages/articles/ana-furusato-mile", category: "ショッピング", date: "2026.08.29", thumbType: "mile", excerpt: "マイル積算終了後の現在の仕組み、返礼品の選び方、控除手続きの注意点を初心者向けに解説します。" },
    { title: "複数クレジットカードの整理術!ポイ活効率を落とさない見直し方", url: "/pages/articles/creditcard-seiri-poikatsu", category: "クレジットカード", date: "2026.08.29", thumbType: "compare", excerpt: "メインカード・サブカードの役割分担、年会費と特典の確認、解約前に見るポイントを解説します。" },
    { title: "ポイ活メール通知の整理術!必要なキャンペーンだけ見逃さない方法", url: "/pages/articles/poikatsu-mail-tsuuchi-seiri", category: "ポイントサイト", date: "2026.08.25", thumbType: "beginner", excerpt: "必要な通知の選び方、フォルダ分け、迷惑メール化を防ぐ注意、週1回で確認するコツを解説します。" },
    { title: "ハロウィン用品でポイ活する方法!衣装・お菓子を買いすぎないコツ", url: "/pages/articles/halloween-yohin-poikatsu", category: "ショッピング", date: "2026.08.25", thumbType: "caution", excerpt: "支出の目安、早めに買うメリット、100円ショップと通販の比較、ポイント利用の注意を解説します。" },
    { title: "クレジットカードのポイントを徹底比較|還元率・年会費・使い道で選ぶ", url: "/pages/articles/credit-card-point-hikaku", category: "クレジットカード", date: "2026.08.25", thumbType: "compare", excerpt: "主要9枚を公式情報で比較。基本還元率と条件付き還元を分けて整理し、年間利用額別の実質還元シミュレーションも掲載します。" },
    { title: "共通ポイント別クレジットカード比較|d・楽天・Ponta・Vポイントで選ぶ", url: "/pages/articles/credit-card-common-point-hikaku", category: "クレジットカード", date: "2026.08.25", thumbType: "compare", excerpt: "貯めたい共通ポイントから選ぶカード比較。直接貯まるカードと交換して貯めるカードの違いも解説します。" },
    { title: "マイルが貯まるクレジットカード比較|ANA・JALの還元と移行条件", url: "/pages/articles/credit-card-mile-hikaku", category: "クレジットカード", date: "2026.08.25", thumbType: "mile", excerpt: "ANA JCB一般カード・JALカード普通カードを比較。カード還元率とマイル還元率の違い、移行条件を解説します。" },
    { title: "西友でお得に買い物する方法!ネットスーパーと店舗利用のポイント", url: "/pages/articles/seiyu-poikatsu", category: "ショッピング", date: "2026.08.24", thumbType: "compare", excerpt: "西友の店舗とネットスーパーの違い、支払い方法の注意、送料・配送条件、まとめ買いの判断基準を解説します。" },
    { title: "イトーヨーカドーでポイ活する方法!アプリ・nanaco・セールの使い分け", url: "/pages/articles/itoyokado-poikatsu", category: "ショッピング", date: "2026.08.24", thumbType: "app", excerpt: "イトーヨーカドーのポイント制度やアプリ特典の使い方、nanaco利用時の注意、セール日との組み合わせを解説します。" },
    { title: "JCBのJ-POINT(旧Oki Dokiポイント)活用術!交換先と還元率の考え方", url: "/pages/articles/jcb-jpoint-poikatsu", category: "ショッピング", date: "2026.08.24", thumbType: "creditcard", excerpt: "JCBのJ-POINT(旧Oki Dokiポイント)の貯まり方、交換先ごとの違い、キャンペーンの見方を解説します。" },
    { title: "セブンネットショッピングとは?セブン‐イレブン受け取りで送料無料になる通販サイト", url: "/pages/articles/sevennet-shopping-poikatsu", category: "ショッピング", date: "2026.08.24", thumbType: "summary", excerpt: "セブンネットショッピングの特徴やセブン‐イレブン受け取りで送料無料になる仕組み、限定商品、会員登録・注文方法を解説します。" },
    { title: "回転寿司でポイントを貯める方法!予約アプリと支払い前のチェック", url: "/pages/articles/kaitenzushi-yoyaku-poikatsu", category: "ショッピング", date: "2026.08.23", thumbType: "app", excerpt: "回転寿司チェーンごとの予約アプリの特徴や来店予約で得する場面、支払い方法の確認、クーポン利用の注意、家族外食で使うコツを解説します。" },
    { title: "ガス会社乗り換えでポイ活する方法!セット割とポイントの確認術", url: "/pages/articles/gas-norikae-poikatsu", category: "ショッピング", date: "2026.08.23", thumbType: "compare", excerpt: "ガス会社乗り換えの基本的な仕組みやセット割の確認、ポイント特典の条件、供給エリアの注意、年間費用で比較するコツを解説します。" },
    { title: "Visaタッチ決済でポイ活する方法!対象店舗と支払い前の確認ポイント", url: "/pages/articles/visa-touch-poikatsu", category: "ショッピング", date: "2026.08.23", thumbType: "creditcard", excerpt: "Visaのタッチ決済の基本的な仕組みや対象カードの確認、対象店舗での使い方、キャンペーン条件の注意、コンビニ利用で活かすコツを解説します。" },
    { title: "高速バス予約でポイントを貯める方法!移動費を抑えるポイ活術", url: "/pages/articles/kousokubus-yoyaku-poikatsu", category: "ショッピング", date: "2026.08.22", thumbType: "compare", excerpt: "高速バス予約サイトごとに貯まるポイントの違いや比較ポイント、早割・クーポンの確認、キャンセル料の注意、帰省・旅行で活用するコツを解説します。" },
    { title: "ドトール・タリーズでポイ活する方法!カフェ利用時の支払い術", url: "/pages/articles/doutor-tullys-poikatsu", category: "ショッピング", date: "2026.08.22", thumbType: "app", excerpt: "ドトール・タリーズのポイント制度の違いや公式アプリの使い方、チャージと決済の注意、クーポン確認の頻度、コーヒー代を抑えるコツを解説します。" },
    { title: "ZOZOTOWNでポイ活する方法!服を買う前に確認したい支払いと送料", url: "/pages/articles/zozotown-poikatsu", category: "ショッピング", date: "2026.08.22", thumbType: "caution", excerpt: "ZOZOTOWNのポイント制度やクーポンの探し方、送料・返品条件、支払い方法の選び方、衝動買いを防ぐコツを解説します。" },
    { title: "【期間限定】ANAアメックス新規入会キャンペーン特集!最大242,000マイル", url: "/pages/articles/ana-amex-campaign-2026", category: "キャンペーン", date: "2026.08.21", thumbType: "campaign", excerpt: "2026年9月2日13:00〜11月4日の期間限定、ANAアメックス新規入会キャンペーンのカード別獲得マイル数・適用条件をまとめて解説します。" },
    { title: "ANAアメックスが大幅刷新!ゴールド・プレミアムの新特典とマイル還元まとめ", url: "/pages/articles/ana-amex-poikatsu", category: "クレジットカード", date: "2026.08.28", thumbType: "creditcard", excerpt: "2026年9月2日リニューアルの「ANAアメリカン・エキスプレス・カード」の年会費・マイル還元率・空港ラウンジなど新特典を解説します。" },
    { title: "ANAマイルが貯まる光回線が登場!「ANA光 powered by SoftBank」を徹底解説", url: "/pages/articles/ana-hikari-poikatsu", category: "生活", date: "2026.08.21", thumbType: "compare", excerpt: "ANAマイルが貯まる新しい光回線サービス「ANA光 powered by SoftBank」の月額料金、マイル特典の仕組み、契約期間、申込方法を解説します。" },
    { title: "家電量販店のポイント還元を徹底比較!ヨドバシ・ビック・ヤマダなど", url: "/pages/articles/kadenryohanten-point-hikaku", category: "ショッピング", date: "2026.08.20", thumbType: "compare", excerpt: "ヨドバシ・ビック・ヤマダ・エディオン・ジョーシン・ノジマ・ケーズデンキのポイント制度と現金値引きを比較。支払い方法による差、10万円購入シミュレーションまで解説します。" },
    { title: "JALマイレージモールでマイルを貯める方法!ネット通販前の基本", url: "/pages/articles/jal-mileage-mall-poikatsu", category: "ショッピング", date: "2026.08.18", thumbType: "mile", excerpt: "JALマイレージモールの特徴や通販前に経由する流れ、対象外条件の確認、マイル反映までの注意、JALカード利用との組み合わせを解説します。" },
    { title: "レンタカー予約でポイ活する方法!旅行前に確認したい支払いと補償", url: "/pages/articles/rentacar-yoyaku-poikatsu", category: "ショッピング", date: "2026.08.18", thumbType: "caution", excerpt: "レンタカー予約でポイントを貯めるコツや比較サイトと公式予約の違い、クーポン利用時の注意、保険・補償の確認を解説します。" },
    { title: "電力会社乗り換えでポイントを貯める方法!料金比較と特典の見方", url: "/pages/articles/denryoku-norikae-point", category: "ショッピング", date: "2026.08.18", thumbType: "compare", excerpt: "電力会社乗り換えの基本やポイント特典の確認、料金プランの比較、解約条件の注意、家計全体で判断するコツを解説します。" },
    { title: "ポイントサイト経由忘れを防ぐ方法!買い物前チェックを習慣化するコツ", url: "/pages/articles/keiyu-wasure-boushi", category: "ポイントサイト", date: "2026.08.17", thumbType: "caution", excerpt: "経由忘れが起きる理由や買い物前の確認手順、ブックマーク活用、家族共有時の注意、習慣化の工夫を解説します。" },
    { title: "エアトリで旅行予約ポイ活!航空券購入前に見るべき費用とポイント", url: "/pages/articles/airtrip-tsukaikata", category: "キャンペーン", date: "2026.08.17", thumbType: "caution", excerpt: "エアトリ利用時の確認点や航空券代以外の費用、ポイント・クーポンの見方、キャンセル規定の注意を解説します。" },
    { title: "駐車場予約サービスでポイ活する方法!イベント前に確認したい条件", url: "/pages/articles/chuushajou-yoyaku-poikatsu", category: "ショッピング", date: "2026.08.17", thumbType: "caution", excerpt: "駐車場予約のメリットやポイント・クーポンの確認、予約時間と延長料金、キャンセル規定の注意を解説します。" },
    { title: "Yahoo!トラベルでポイントを活用する方法!宿泊予約前の確認ポイント", url: "/pages/articles/yahoo-travel-tsukaikata", category: "キャンペーン", date: "2026.08.16", thumbType: "caution", excerpt: "予約時に確認したいポイントやクーポン併用の注意、キャンセル時の扱い、PayPay利用者が見るべき点を解説します。" },
    { title: "出前館でポイ活する方法!注文前に確認したい割引とポイント", url: "/pages/articles/demaecan-poikatsu", category: "ショッピング", date: "2026.08.16", thumbType: "app", excerpt: "出前館のポイント確認やクーポン適用条件、支払い方法の選び方、配達料と最低注文金額、家族利用のコツを解説します。" },
    { title: "ABC-MARTでポイ活する方法!靴購入時のアプリ・決済チェック", url: "/pages/articles/abc-mart-poikatsu", category: "ショッピング", date: "2026.08.16", thumbType: "beginner", excerpt: "ABC-MARTの会員特典やセール時期の確認、サイズ交換の注意、決済ポイントの組み合わせ、家族分を買うコツを解説します。" },
    { title: "ANAマイルとMileagePlusはどっち?同じスターアライアンスで何が違う?", url: "/pages/articles/ana-mileageplus-hikaku", category: "ショッピング", date: "2026.08.15", thumbType: "compare", excerpt: "有効期限・貯めやすさ・特典航空券・国内線の使いやすさで比較し、利用スタイルによる選び方を解説します。" },
    { title: "MileagePlusは日本在住でも貯める価値がある?メリット・注意点を解説", url: "/pages/articles/mileageplus-nihon-zaijuu", category: "ショッピング", date: "2026.08.15", thumbType: "compare", excerpt: "有効期限なしのメリット、ANA便との関係、日本国内での貯めにくさなど注意点まで初心者向けに解説します。" },
    { title: "JALマイルを貯めるべき人・貯めない方がいい人を解説", url: "/pages/articles/jal-mile-tameru-kachi", category: "ショッピング", date: "2026.08.15", thumbType: "compare", excerpt: "JALマイルを貯める価値がある人・無理に貯めなくてもよい人を利用状況別に解説します。" },
    { title: "ANAマイルを貯めるべき人・貯めない方がいい人を解説", url: "/pages/articles/ana-mile-tameru-kachi", category: "ショッピング", date: "2026.08.15", thumbType: "compare", excerpt: "ANAマイルを貯める価値がある人・無理に貯めなくてもよい人を利用状況別に解説します。" },
    { title: "ANAマイルとJALマイルはどっち?貯めやすさ・使いやすさを比較", url: "/pages/articles/ana-jal-mile-hikaku", category: "ショッピング", date: "2026.08.15", thumbType: "compare", excerpt: "利用航空会社・国内線・国際線・航空連合・ポイント交換・有効期限・特典航空券・家族利用の軸で比較し、生活圏で選ぶ考え方を解説します。" },
    { title: "楽天ポイントとPayPayポイントはどっち?通販・決済・カードで比較", url: "/pages/articles/rakuten-paypay-hikaku", category: "ショッピング", date: "2026.08.14", thumbType: "compare", excerpt: "楽天市場とYahoo!ショッピング、楽天ペイとPayPay、楽天カードとPayPayカードなど項目別に比較し、生活圏で選ぶ考え方を解説します。" },
    { title: "dポイントとPontaポイントはどっち?貯めやすさ・使いやすさを比較", url: "/pages/articles/dpoint-ponta-hikaku", category: "ショッピング", date: "2026.08.14", thumbType: "compare", excerpt: "携帯キャリア・スマホ決済・クレジットカード・コンビニ・ネット通販・交換・有効期限で比較し、生活圏で選ぶ考え方を解説します。" },
    { title: "Vポイントと携帯キャリアの関係|ドコモ・au・ソフトバンクでも使える?", url: "/pages/articles/vpoint-no-carrier", category: "ショッピング", date: "2026.08.27", thumbType: "compare", excerpt: "携帯キャリア別のVポイントとの関係、三井住友カード・Olive・SBI証券との相性、メリット・注意点を初心者向けに解説します。" },
    { title: "au・UQユーザーはPontaポイントにまとめるべき?相性の良いサービスを解説", url: "/pages/articles/au-uq-ponta", category: "ショッピング", date: "2026.08.14", thumbType: "compare", excerpt: "au PAY・au PAYカード・auじぶん銀行・ローソンとの相性や、Pontaに寄せない方がよいケースを初心者向けに解説します。" },
    { title: "SoftBank・Y!mobileならPayPayポイント?相性の良いサービスを比較", url: "/pages/articles/softbank-ymobile-paypay-point", category: "ショッピング", date: "2026.08.14", thumbType: "compare", excerpt: "PayPay決済・PayPayカード・Yahoo!ショッピングとの相性や、他ポイントの方が向く人を初心者向けに解説します。" },
    { title: "楽天モバイルなら楽天ポイントにまとめるべき?楽天経済圏との相性を解説", url: "/pages/articles/rakuten-mobile-rakuten-point", category: "ショッピング", date: "2026.08.14", thumbType: "compare", excerpt: "楽天カード・楽天ペイ・楽天市場・楽天銀行・楽天証券との相性や、寄せすぎるデメリットを初心者向けに解説します。" },
    { title: "ドコモ・ahamoユーザーはdポイントにまとめるべき?相性の良いサービスを解説", url: "/pages/articles/docomo-ahamo-dpoint", category: "ショッピング", date: "2026.08.14", thumbType: "compare", excerpt: "d払い・dカード・ahamo光・ドコモでんきとの相性や、まとめなくてもよいケースを初心者向けに解説します。" },
    { title: "サブスク無料トライアル案件のポイ活!解約忘れを防ぐ管理方法", url: "/pages/articles/subscription-trial-poikatsu", category: "ポイントサイト", date: "2026.08.13", thumbType: "caution", excerpt: "無料トライアル案件の仕組みやポイント条件の確認、解約期限の管理、継続課金の注意点、本当に使うサービスを選ぶコツを解説します。" },
    { title: "すかいらーくグループでポイ活する方法!外食前のアプリ確認術", url: "/pages/articles/sukairaku-group-poikatsu", category: "ショッピング", date: "2026.08.13", thumbType: "mobile", excerpt: "すかいらーくアプリの特徴やクーポンの使い方、支払いで貯まるポイント、キャンペーン確認の注意、家族外食で活用するコツを解説します。" },
    { title: "SHEINでポイ活する時の注意点!海外通販で見るべき費用とポイント", url: "/pages/articles/shein-poikatsu-chuuiten", category: "ショッピング", date: "2026.08.13", thumbType: "compare", excerpt: "SHEIN利用時の確認点やクーポン・ポイントの使い方、配送日数の注意、返品・サイズ確認、買いすぎを防ぐルールを解説します。" },
    { title: "資料請求案件でポイ活する方法!申し込み前に確認したい注意点", url: "/pages/articles/shiryouseikyuu-anken-poikatsu", category: "ポイントサイト", date: "2026.08.12", thumbType: "caution", excerpt: "資料請求案件の特徴や対象外になりやすい条件、電話連絡の可能性、個人情報入力時の注意点、興味がある案件に絞るコツを初心者向けに解説します。" },
    { title: "ブラウザ拡張機能でポイ活を便利にする方法!使いすぎない管理術", url: "/pages/articles/browser-kakuchou-poikatsu", category: "ポイントサイト", date: "2026.08.12", thumbType: "app", excerpt: "ブラウザ拡張の役割や経由忘れ防止に使う方法、通知が増えるデメリット、セキュリティ確認のポイント、必要な機能だけ残すコツを解説します。" },
    { title: "ファストフードアプリでポイ活する方法!クーポンと決済を組み合わせるコツ", url: "/pages/articles/fastfood-app-poikatsu", category: "アプリ案件", date: "2026.08.12", thumbType: "compare", excerpt: "公式アプリの役割やクーポンの探し方、ポイントが貯まる決済、モバイルオーダーの注意、よく行く店だけ登録するコツを解説します。" },
    { title: "アプリインストール案件のポイ活!条件達成とアンインストールの注意", url: "/pages/articles/app-install-anken-poikatsu", category: "アプリ案件", date: "2026.08.11", thumbType: "app", excerpt: "アプリ案件の基本や初回起動・登録条件の確認、達成期限のチェック、アンインストール前の注意点を初心者向けに解説します。" },
    { title: "カーシェア利用でポイントを活かす方法!短時間利用の節約チェック", url: "/pages/articles/carshare-point-katsuyou", category: "ショッピング", date: "2026.08.11", thumbType: "compare", excerpt: "カーシェアの費用構造やポイントが使える場面、クレカ払いの確認、長時間利用との比較、車なし生活で活用するコツを解説します。" },
    { title: "無料会員登録案件でポイ活する方法!登録前後に確認したいこと", url: "/pages/articles/muryou-kaiin-touroku-poikatsu", category: "ポイントサイト", date: "2026.08.11", thumbType: "earnings", excerpt: "無料登録案件の特徴やメール認証の確認、対象外条件の見方、退会前の注意点、登録サービスを管理するコツを初心者向けに解説します。" },
    { title: "携帯料金でポイント還元!キャリア別お得な貯め方ガイド", url: "/pages/articles/keitai-ryokin-point", category: "クレジットカード", date: "2026.07.08", thumbType: "mobile", excerpt: "携帯料金の支払いでポイントを貯める方法を、ドコモ・ソフトバンク・au・楽天モバイル別に解説。" },
    { title: "ポイ活とは?初心者が最初に知っておきたい仕組みと始め方", url: "/pages/articles/poikatsu-kiso", category: "ポイントサイト", date: "2026.07.08", thumbType: "beginner", excerpt: "ポイ活の基本的な意味から、ポイントが貯まる主な場面、最初に準備するものまで解説します。" },
    { title: "ポイ活で月いくら節約できる?目安金額と現実的な稼ぎ方", url: "/pages/articles/tsukiikura-setsuyaku", category: "ポイントサイト", date: "2026.07.08", thumbType: "earnings", excerpt: "ポイ活で得られる金額の考え方や、月1,000円〜5,000円を目指す現実的な方法を解説します。" },
    { title: "ポイ活初心者が最初に貯めるべきポイントはどれ?主要ポイントを比較", url: "/pages/articles/hajimeni-tameru-point", category: "ポイントサイト", date: "2026.07.08", thumbType: "compare", excerpt: "楽天ポイント・PayPayポイント・dポイント・Ponta・Vポイントの特徴を比較して解説します。" },
    { title: "ポイ活の新常識!ポイントを分散せず効率よく貯める「寄せ活」の始め方", url: "/pages/articles/yosekatsu", category: "ポイントサイト", date: "2026.07.08", thumbType: "yosekatsu", excerpt: "ポイントを1つに寄せて貯める「寄せ活」の考え方と具体的な始め方を解説します。" },
    { title: "ポイ活は副業になる?収入目的で始める前に知るべきメリットと限界", url: "/pages/articles/fukugyou", category: "副業", date: "2026.07.08", thumbType: "earnings", excerpt: "ポイ活と副業の違い、得られる主な利益、副業として考える場合の注意点を解説します。" },
    { title: "ポイ活を1日10分で続ける方法!忙しい人向けの時短ルーティン", url: "/pages/articles/ichinichi-10pun", category: "ポイントサイト", date: "2026.07.08", thumbType: "beginner", excerpt: "忙しい人でも続けやすいポイ活の時短ルーティンを紹介します。" },
    { title: "ポイ活で失敗しない始め方!初心者がやりがちな勘違いを解説", url: "/pages/articles/shippai-shinai-hajimekata", category: "ポイントサイト", date: "2026.07.08", thumbType: "caution", excerpt: "高還元だけを追うリスク、条件確認を忘れる失敗など、やりがちな勘違いを解説します。" },
    { title: "ポイ活アプリは必要?初心者におすすめの使い分けと管理方法", url: "/pages/articles/app-hitsuyou", category: "アプリ案件", date: "2026.07.08", thumbType: "app", excerpt: "ポイ活アプリでできることや、公式アプリを使うメリット、管理方法を解説します。" },
    { title: "ポイ活で貯めたポイントの使い道は?節約につながる使い方を解説", url: "/pages/articles/point-tsukaimichi", category: "ショッピング", date: "2026.07.08", thumbType: "summary", excerpt: "日用品への活用やネットショッピングでの使い方、失効前に使い切るコツを解説します。" },
    { title: "ポイ活初心者向けロードマップ!登録から初回ポイント獲得までの流れ", url: "/pages/articles/roadmap", category: "ポイントサイト", date: "2026.07.08", thumbType: "beginner", excerpt: "登録から初めてポイントを獲得するまでの流れをロードマップ形式で解説します。" },
    { title: "ポイ活とは?仕組み・種類・始め方から注意点まで完全ガイド", url: "/pages/beginner/poikatsu-toha", category: "初心者向け", date: "2026.07.08", thumbType: "beginner", excerpt: "ポイ活とは何か、できること、種類、始め方、メリット・デメリットまで詳しく解説します。" },
    { title: "ポイ活の始め方3ステップ|初心者でも今日から始められる", url: "/pages/beginner/hajimekata-3steps", category: "初心者向け", date: "2026.07.07", thumbType: "beginner", excerpt: "登録から交換までの流れを3ステップでわかりやすく解説します。" },
    { title: "楽天ポイントの貯め方を初心者向けに解説!楽天経済圏の基本", url: "/pages/articles/rakuten-poikatsu-kiso", category: "ショッピング", date: "2026.07.10", thumbType: "beginner", excerpt: "楽天ポイントの特徴から、楽天市場・楽天カード・楽天ペイでの貯め方、SPUの考え方までを解説します。" },
    { title: "楽天市場でポイントを効率よく貯める方法!買い回り前に確認すること", url: "/pages/articles/rakuten-ichiba-kaimawari", category: "ショッピング", date: "2026.07.10", thumbType: "campaign", excerpt: "楽天市場のポイント構造や買い回りキャンペーンの基本、エントリー忘れを防ぐ方法を解説します。" },
    { title: "楽天カードはポイ活に向いている?メリットと注意点を初心者向けに解説", url: "/pages/articles/rakuten-card-poikatsu", category: "クレジットカード", date: "2026.07.10", thumbType: "creditcard", excerpt: "楽天カードの基本還元や楽天市場・楽天ペイとの相性、申し込み前の確認事項を解説します。" },
    { title: "楽天ペイで楽天ポイントを貯める方法!街のお買い物で使うコツ", url: "/pages/articles/rakuten-pay-tameru", category: "ショッピング", date: "2026.07.10", thumbType: "app", excerpt: "楽天ペイの基本や楽天ポイントカードとの違い、二重取りを狙える場面を解説します。" },
    { title: "楽天ポイントの使い道おすすめまとめ!通常ポイントと期間限定ポイントの違い", url: "/pages/articles/rakuten-point-tsukaimichi", category: "ショッピング", date: "2026.07.10", thumbType: "summary", excerpt: "通常ポイントと期間限定ポイントの違いや、失効を防ぐ管理方法を解説します。" },
    { title: "PayPayポイントとは?貯め方・使い方・注意点を初心者向けに解説", url: "/pages/articles/paypay-point-kiso", category: "ショッピング", date: "2026.07.10", thumbType: "beginner", excerpt: "PayPayポイントの基本、決済やYahoo!ショッピングでの貯め方、ポイント運用との違いを解説します。" },
    { title: "PayPayでポイントを効率よく貯める方法!キャンペーン活用の基本", url: "/pages/articles/paypay-campaign-katsuyo", category: "キャンペーン", date: "2026.07.10", thumbType: "campaign", excerpt: "PayPayの基本還元やクーポンの使い方、キャンペーン確認の手順を解説します。" },
    { title: "Yahoo!ショッピングでPayPayポイントを貯める方法!買い物前のチェックリスト", url: "/pages/articles/yahoo-shopping-paypay", category: "ショッピング", date: "2026.07.10", thumbType: "compare", excerpt: "Yahoo!ショッピングの還元構造、支払い方法の選び方、付与上限の見方を解説します。" },
    { title: "PayPayポイントの使い道おすすめ!支払い・運用・貯蓄感覚で使う方法", url: "/pages/articles/paypay-point-tsukaimichi", category: "ショッピング", date: "2026.07.10", thumbType: "summary", excerpt: "PayPay残高との違いや、街のお店・ネットサービスでの使い方、運用の考え方を解説します。" },
    { title: "PayPayポイントが付かない原因は?確認すべき条件と対策", url: "/pages/articles/paypay-point-tsukanai", category: "ショッピング", date: "2026.08.11", thumbType: "caution", excerpt: "PayPayポイントがつかない・反映されない時に確認したい原因と、対象外の取引、確認すべき条件を解説します。" },
    { title: "dポイントの貯め方を初心者向けに解説!ドコモ以外の人でも使える?", url: "/pages/articles/dpoint-kiso", category: "ショッピング", date: "2026.07.10", thumbType: "beginner", excerpt: "dポイントの基本からdアカウントでできること、d払いや加盟店での貯め方までを初心者向けに解説します。" },
    { title: "d払いでdポイントを貯める方法!日常決済で活用するコツ", url: "/pages/articles/dpoint-d-harai", category: "ショッピング", date: "2026.07.10", thumbType: "app", excerpt: "d払いの基本やdポイントカード提示との違い、支払い方法の組み合わせを初心者向けに解説します。" },
    { title: "dカードはポイ活におすすめ?dポイントを貯めやすい人の特徴", url: "/pages/articles/dcard-poikatsu", category: "クレジットカード", date: "2026.07.10", thumbType: "creditcard", excerpt: "dカードの基本還元やd払いとの相性、申し込み前の確認点を初心者向けに解説します。" },
    { title: "dポイントのおすすめの使い道!コンビニ・ドラッグストア・ネットで使う方法", url: "/pages/articles/dpoint-tsukaimichi", category: "ショッピング", date: "2026.07.10", thumbType: "summary", excerpt: "街のお店やd払いでの使い方、期間・用途限定ポイントの注意点を解説します。" },
    { title: "dポイントが反映されない原因は?dポイントマーケットの確認方法も解説", url: "/pages/articles/dpoint-hanei-sarenai", category: "ショッピング", date: "2026.08.27", thumbType: "caution", excerpt: "付与時期のズレやカード提示忘れ、対象外商品・サービス、サービス終了したdポイントマーケットの確認方法を解説します。" },
    { title: "Vポイントとは?旧Tポイントとの違いとポイ活での使い方", url: "/pages/articles/vpoint-kiso", category: "ショッピング", date: "2026.07.10", thumbType: "beginner", excerpt: "Vポイントの基本や旧Tポイントとの関係、貯められる主な場所を初心者向けに解説します。" },
    { title: "三井住友カードでVポイントを貯める方法!対象店舗とタッチ決済の基本", url: "/pages/articles/mitsui-sumitomo-card-vpoint", category: "クレジットカード", date: "2026.07.10", thumbType: "creditcard", excerpt: "三井住友カードの還元の考え方や対象店舗の確認方法、タッチ決済の注意点を解説します。" },
    { title: "Vポイントの貯め方と使い方!コンビニ・カード・アプリ活用術", url: "/pages/articles/vpoint-tameru-tsukau", category: "ショッピング", date: "2026.07.10", thumbType: "app", excerpt: "Vポイントを貯める主な方法やファミマなどでの使い方、アプリ連携の基本を解説します。" },
    { title: "Vポイントと楽天ポイントはどっちが使いやすい?生活圏別に比較", url: "/pages/articles/vpoint-rakuten-hikaku", category: "ショッピング", date: "2026.07.10", thumbType: "compare", excerpt: "使える店舗の違いやネットショッピングでの違い、向いている人の違いを解説します。" },
    { title: "Vポイントが貯まらない原因は?よくあるミスと確認ポイント", url: "/pages/articles/vpoint-tamaranai", category: "ショッピング", date: "2026.07.10", thumbType: "caution", excerpt: "提示忘れ・連携ミスや対象外決済の確認など、貯まらない原因を解説します。" },
    { title: "Pontaポイントとは?貯め方・使い方・相性の良いサービスを解説", url: "/pages/articles/ponta-kiso", category: "ショッピング", date: "2026.07.10", thumbType: "beginner", excerpt: "Pontaポイントの基本やローソンで貯める方法、au PAYとの組み合わせを解説します。" },
    { title: "ローソンでPontaポイントを貯める方法!買い物前に知っておきたい基本", url: "/pages/articles/lawson-ponta", category: "ショッピング", date: "2026.07.10", thumbType: "app", excerpt: "Pontaカード提示の基本やアプリを使うメリット、対象外商品の注意点を解説します。" },
    { title: "au PAYでPontaポイントを貯める方法!スマホ決済との組み合わせを解説", url: "/pages/articles/aupay-ponta", category: "ショッピング", date: "2026.07.10", thumbType: "app", excerpt: "au PAYの基本やPonta連携の手順、還元対象外の注意点を初心者向けに解説します。" },
    { title: "リクルートサービスでPontaポイントを貯める方法!予約・買い物で活用", url: "/pages/articles/recruit-ponta", category: "ショッピング", date: "2026.07.10", thumbType: "mile", excerpt: "リクルートIDとの関係やじゃらん・ホットペッパーで貯める方法を解説します。" },
    { title: "Pontaポイントのおすすめの使い道!ローソン・au・旅行で活用する方法", url: "/pages/articles/ponta-tsukaimichi", category: "ショッピング", date: "2026.07.10", thumbType: "summary", excerpt: "ローソンで使う方法やau PAYで使う方法、失効を防ぐ管理方法を解説します。" },
    { title: "WAON POINTの貯め方を解説!イオンで得するポイ活の基本", url: "/pages/articles/waon-point-kiso", category: "ショッピング", date: "2026.07.10", thumbType: "beginner", excerpt: "WAON POINTの基本やイオンで貯める方法、電子マネーWAONとの違いを解説します。" },
    { title: "イオンでポイントを効率よく貯める方法!WAON POINTと支払い方法の選び方", url: "/pages/articles/aeon-point-tameru", category: "ショッピング", date: "2026.07.10", thumbType: "campaign", excerpt: "イオンカードの基本や対象店舗、お客さま感謝デーの考え方を解説します。" },
    { title: "WAON POINTと電子マネーWAONポイントの違いは?初心者向けに整理", url: "/pages/articles/waon-point-chigai", category: "ショッピング", date: "2026.07.10", thumbType: "compare", excerpt: "名称が似ている理由や貯まり方の違い、間違えやすいポイントを整理します。" },
    { title: "nanacoポイントの貯め方と使い方!セブン系で活用する基本", url: "/pages/articles/nanaco-point-kiso", category: "ショッピング", date: "2026.07.10", thumbType: "beginner", excerpt: "nanacoポイントの基本やセブン-イレブンで貯める方法を解説します。" },
    { title: "セブン-イレブンでポイントを貯める方法!nanacoとアプリ活用の基本", url: "/pages/articles/seven-eleven-point", category: "ショッピング", date: "2026.07.10", thumbType: "app", excerpt: "nanaco提示・決済の違いやセブンアプリの活用、公共料金支払いの注意点を解説します。" },
    { title: "JRE POINTの貯め方と使い方!Suica利用者向けポイ活入門", url: "/pages/articles/jre-point-kiso", category: "ショッピング", date: "2026.07.10", thumbType: "mile", excerpt: "JRE POINTの基本やSuicaで貯める方法、ビューカードとの相性を解説します。" },
    { title: "Suicaでポイントを貯める方法!JRE POINT登録から使い方まで解説", url: "/pages/articles/suica-point-tameru", category: "ショッピング", date: "2026.07.10", thumbType: "app", excerpt: "Suica登録の必要性や鉄道利用で貯める条件、モバイルSuicaの活用を解説します。" },
    { title: "クレジットカードでポイ活する基本!還元率だけで選ばない考え方", url: "/pages/articles/creditcard-poikatsu-kiso", category: "クレジットカード", date: "2026.07.10", thumbType: "beginner", excerpt: "還元率の基本や年会費とのバランス、作りすぎを避ける注意点を解説します。" },
    { title: "ポイ活向けクレジットカードの選び方!初心者が見るべき5つのポイント", url: "/pages/articles/creditcard-erabikata", category: "クレジットカード", date: "2026.07.10", thumbType: "compare", excerpt: "メインポイントとの相性や普段使う店舗での還元、管理しやすさの重要性を解説します。" },
    { title: "クレジットカードのポイント還元率とは?1%と0.5%の違いをわかりやすく解説", url: "/pages/articles/creditcard-kangenritsu", category: "クレジットカード", date: "2026.07.10", thumbType: "compare", excerpt: "還元率の計算方法や年間利用額での差、高還元カードの注意点を解説します。" },
    { title: "年会費無料カードでポイ活はできる?無理なく始めるカード活用術", url: "/pages/articles/nenkaihi-muryo-card", category: "クレジットカード", date: "2026.07.10", thumbType: "beginner", excerpt: "年会費無料カードのメリットや初心者に向く理由、カード管理の注意点を解説します。" },
    { title: "クレジットカードを作りすぎると危険?ポイ活で注意したい信用情報の基本", url: "/pages/articles/creditcard-tsukurisugi-chuui", category: "クレジットカード", date: "2026.08.29", thumbType: "caution", excerpt: "カード枚数が増えるデメリットや申し込み頻度の注意点、安全なポイ活の考え方を解説します。" },
    { title: "スマホ決済でポイ活する方法!PayPay・楽天ペイ・d払いの使い分け", url: "/pages/articles/sumaho-kessai-poikatsu", category: "ショッピング", date: "2026.07.10", thumbType: "app", excerpt: "スマホ決済の基本や主要決済サービスの違い、キャンペーン活用のコツを解説します。" },
    { title: "スマホ決済とクレジットカードはどっちがお得?ポイント二重取りの基本", url: "/pages/articles/sumaho-kessai-creditcard-hikaku", category: "クレジットカード", date: "2026.07.10", thumbType: "compare", excerpt: "二重取りの仕組みや組み合わせ例、対象外になるケースを解説します。" },
    { title: "QRコード決済でポイントを貯める方法!支払い前のチェックポイント", url: "/pages/articles/qr-kessai-poikatsu", category: "ショッピング", date: "2026.07.11", thumbType: "app", excerpt: "QRコード決済の種類やクーポン確認の重要性、ポイント付与条件の見方を解説します。" },
    { title: "スマホ決済キャンペーンの見方!エントリー・上限・対象店舗を確認しよう", url: "/pages/articles/sumaho-kessai-campaign-mikata", category: "キャンペーン", date: "2026.07.11", thumbType: "campaign", excerpt: "キャンペーンページで見る項目やエントリーの必要性、付与上限の考え方を解説します。" },
    { title: "キャッシュレス決済で節約する方法!現金派から始めるポイ活入門", url: "/pages/articles/cashless-setsuyaku", category: "ショッピング", date: "2026.07.11", thumbType: "beginner", excerpt: "キャッシュレスのメリットや使いすぎを防ぐ管理方法、少額決済で貯めるコツを解説します。" },
    { title: "ネットショッピングでポイントを貯める方法!楽天・Yahoo・Amazonの基本", url: "/pages/articles/net-shopping-point-kiso", category: "ショッピング", date: "2026.07.11", thumbType: "beginner", excerpt: "ネット通販のポイント構造やモールごとの特徴、セール前の準備を解説します。" },
    { title: "Amazonでポイ活はできる?ポイントを貯める方法と注意点を解説", url: "/pages/articles/amazon-poikatsu", category: "ショッピング", date: "2026.07.11", thumbType: "caution", excerpt: "Amazonポイントの基本やクレジットカード活用、他モールとの比較を解説します。" },
    { title: "楽天市場とYahoo!ショッピングはどっちがお得?ポイ活視点で比較", url: "/pages/articles/rakuten-yahoo-hikaku", category: "ショッピング", date: "2026.07.11", thumbType: "compare", excerpt: "ポイント還元の仕組みやセール・キャンペーンの違い、初心者に向く選び方を解説します。" },
    { title: "ふるさと納税でポイ活はできる?ポイント還元と注意点をわかりやすく解説", url: "/pages/articles/furusato-nozei-poikatsu", category: "ショッピング", date: "2026.08.29", thumbType: "caution", excerpt: "ふるさと納税の基本やポイント還元の考え方、控除上限額の確認を解説します。" },
    { title: "旅行予約でポイントを貯める方法!ホテル・航空券・予約サイト活用術", url: "/pages/articles/ryokou-yoyaku-point", category: "ショッピング", date: "2026.07.11", thumbType: "mile", excerpt: "旅行予約で貯まるポイントやクレカ決済の活用、予約変更時の注意点を解説します。" },
    { title: "コンビニでポイ活する方法!主要チェーンで貯まるポイントを比較", url: "/pages/articles/konbini-poikatsu-hikaku", category: "ショッピング", date: "2026.07.11", thumbType: "compare", excerpt: "セブン・ローソン・ファミマの違いやクーポン活用のコツを解説します。" },
    { title: "スーパーでポイントを貯める方法!日用品の買い物を節約につなげるコツ", url: "/pages/articles/super-point-tameru", category: "ショッピング", date: "2026.07.11", thumbType: "beginner", excerpt: "スーパー系ポイントの特徴や曜日キャンペーンの活用、家計とのバランスを解説します。" },
    { title: "ドラッグストアでポイ活する方法!日用品・薬・コスメでポイントを貯める", url: "/pages/articles/drugstore-poikatsu", category: "ショッピング", date: "2026.07.11", thumbType: "app", excerpt: "ドラッグストアの還元の特徴や共通ポイントの使い分け、対象外商品への注意を解説します。" },
    { title: "外食でポイントを貯める方法!予約サイト・決済・アプリ活用の基本", url: "/pages/articles/gaishoku-point-tameru", category: "ショッピング", date: "2026.07.11", thumbType: "app", excerpt: "外食で貯まるポイントや予約サイトの活用、予約キャンセル時の注意点を解説します。" },
    { title: "ガソリン代でポイントを貯める方法!車利用者向けポイ活の基本", url: "/pages/articles/gasoline-point-tameru", category: "クレジットカード", date: "2026.07.11", thumbType: "creditcard", excerpt: "ガソリンスタンドのポイントやクレジットカードの選び方、給油前の確認事項を解説します。" },
    { title: "携帯料金をポイ活で節約する方法!ポイント払いとキャンペーンの活用", url: "/pages/articles/keitai-ryokin-setsuyaku", category: "ショッピング", date: "2026.07.11", thumbType: "mobile", excerpt: "携帯料金で貯まるポイントやポイント払いのメリット、乗り換え時の注意点を解説します。" },
    { title: "電気・ガス・水道でポイントは貯まる?公共料金ポイ活の基本", url: "/pages/articles/koukyou-ryokin-poikatsu", category: "ショッピング", date: "2026.07.11", thumbType: "caution", excerpt: "公共料金で貯める方法やカード払いの注意点、固定費見直しの考え方を解説します。" },
    { title: "サブスク料金でポイントを貯める方法!動画・音楽・クラウドサービスの支払い術", url: "/pages/articles/subscription-point-tameru", category: "ショッピング", date: "2026.07.11", thumbType: "app", excerpt: "サブスク支払いの見直しやカード払いで貯める方法、毎月の固定費管理を解説します。" },
    { title: "家賃支払いでポイントは貯まる?対応サービスと注意点を解説", url: "/pages/articles/yachin-point-chuui", category: "ショッピング", date: "2026.07.11", thumbType: "caution", excerpt: "家賃でポイントを狙う方法やカード払い対応の確認、無理に狙わない判断基準を解説します。" },
    { title: "保険料でポイントを貯める方法!クレジットカード払いの確認ポイント", url: "/pages/articles/hokenryo-point-tameru", category: "クレジットカード", date: "2026.07.11", thumbType: "creditcard", excerpt: "保険料支払いの基本やカード払い対応の確認、注意したい規約を解説します。" },
    { title: "税金支払いでポイントを貯める方法はある?手数料と還元率の考え方", url: "/pages/articles/zeikin-shiharai-point", category: "クレジットカード", date: "2026.07.11", thumbType: "caution", excerpt: "税金支払いの方法やクレカ払いの手数料、自治体ルールの確認を解説します。" },
    { title: "ポイ活キャンペーンで失敗しない方法!エントリー忘れと上限に注意", url: "/pages/articles/poikatsu-campaign-shippai-boushi", category: "キャンペーン", date: "2026.07.11", thumbType: "caution", excerpt: "キャンペーンの基本構造やエントリーの必要性、対象外条件の確認を解説します。" },
    { title: "ポイント還元率の見方を解説!本当にお得か判断する計算方法", url: "/pages/articles/point-kangenritsu-mikata", category: "ショッピング", date: "2026.07.11", thumbType: "summary", excerpt: "還元率の意味や実質還元の考え方、お得に見える表現の注意点を解説します。" },
    { title: "ポイントが付かない原因まとめ!問い合わせ前に確認すべきこと", url: "/pages/articles/point-tsukanai-genin", category: "ショッピング", date: "2026.08.11", thumbType: "caution", excerpt: "付与時期の確認や対象外商品・店舗、証拠を残す方法を解説します。" },
    { title: "ポイントの有効期限を管理する方法!失効を防ぐチェック習慣", url: "/pages/articles/point-yuukoukigen-kanri", category: "ショッピング", date: "2026.07.11", thumbType: "beginner", excerpt: "有効期限の種類やアプリで確認する方法、月1回の確認習慣を解説します。" },
    { title: "ポイ活でやってはいけないこと!規約違反・不正利用・危険な案件に注意", url: "/pages/articles/poikatsu-yattehaikenai-koto", category: "ポイントサイト", date: "2026.07.11", thumbType: "caution", excerpt: "規約違反になりやすい行為や複数アカウントのリスク、怪しい案件の見分け方を解説します。" },
    { title: "ポイ活で個人情報を守る方法!登録前に確認したい安全チェック", url: "/pages/articles/poikatsu-kojinjouhou-mamoru", category: "ポイントサイト", date: "2026.07.11", thumbType: "caution", excerpt: "登録前に見るべき運営情報やパスワード管理、怪しいサイトを避けるコツを解説します。" },
    { title: "ポイント交換とは?他社ポイント・ギフト券・マイルへの交換方法", url: "/pages/articles/point-koukan-toha", category: "ショッピング", date: "2026.07.11", thumbType: "mile", excerpt: "ポイント交換の基本や交換レートの見方、交換先の選び方を解説します。" },
    { title: "ポイントをマイルに交換するメリットは?旅行好き向けポイ活入門", url: "/pages/articles/mile-koukan-merit", category: "ショッピング", date: "2026.07.12", thumbType: "mile", excerpt: "マイル交換の基本やANA・JALマイルの違い、特典航空券の魅力、初心者が注意することを解説します。" },
    { title: "楽天ポイントをANAマイルに交換できる?交換ルートと注意点を解説", url: "/pages/articles/rakuten-ana-mile-koukan", category: "ショッピング", date: "2026.07.12", thumbType: "mile", excerpt: "楽天ポイントとマイルの関係や交換条件の確認、交換レートの考え方を解説します。" },
    { title: "Vポイントを他社ポイントへ交換する方法!交換先の選び方と注意点", url: "/pages/articles/vpoint-tasha-koukan", category: "ショッピング", date: "2026.07.12", thumbType: "compare", excerpt: "Vポイント交換の基本や交換先の種類、レートと手数料、反映までの日数を解説します。" },
    { title: "Pontaポイントをマイルや他社ポイントに交換する方法!使い道を広げるコツ", url: "/pages/articles/ponta-mile-koukan", category: "ショッピング", date: "2026.07.12", thumbType: "mile", excerpt: "Ponta交換の基本やマイル交換の考え方、au系サービスでの活用を解説します。" },
    { title: "ポイント投資とは?貯めたポイントで投資体験を始める方法", url: "/pages/articles/point-toushi-toha", category: "ショッピング", date: "2026.07.12", thumbType: "beginner", excerpt: "ポイント投資の基本や現金投資との違い、メリットとリスク、向いている人を解説します。" },
    { title: "ポイント運用とは?投資との違いと初心者が知るべき注意点", url: "/pages/articles/point-unyou-toha", category: "ショッピング", date: "2026.07.12", thumbType: "caution", excerpt: "ポイント運用の仕組みやポイント投資との違い、損失リスクへの向き合い方を解説します。" },
    { title: "家族でポイ活する方法!ポイントをまとめて効率よく貯めるコツ", url: "/pages/articles/kazoku-poikatsu", category: "ポイントサイト", date: "2026.07.12", thumbType: "yosekatsu", excerpt: "家族で貯めるメリットやメインポイントの決め方、家族カードの活用を解説します。" },
    { title: "主婦・主夫におすすめのポイ活!日用品とスーパーで無理なく節約", url: "/pages/articles/shufu-shufu-poikatsu", category: "ポイントサイト", date: "2026.07.12", thumbType: "beginner", excerpt: "日用品購入で貯める方法やスーパーアプリの活用法、無駄買いを防ぐコツを解説します。" },
    { title: "学生でもできるポイ活!お金をかけずに始める安全な方法", url: "/pages/articles/gakusei-poikatsu", category: "ポイントサイト", date: "2026.07.12", thumbType: "beginner", excerpt: "学生に向くポイ活の始め方やクレカなしでできる方法、個人情報の注意点を解説します。" },
    { title: "一人暮らしのポイ活術!固定費と日用品をポイントで節約する方法", url: "/pages/articles/hitorigurashi-poikatsu", category: "ポイントサイト", date: "2026.07.12", thumbType: "summary", excerpt: "一人暮らしで貯めやすい場面やコンビニ利用の見直し、固定費支払いの工夫を解説します。" },
    { title: "シニア向けポイ活入門!スマホが苦手でも始めやすいポイント活用", url: "/pages/articles/senior-poikatsu", category: "ポイントサイト", date: "2026.07.12", thumbType: "beginner", excerpt: "シニアに向くポイントの特徴やカード提示で貯める方法、詐欺への注意点を解説します。" },
    { title: "ポイ活を家計簿に活かす方法!ポイントを収入ではなく節約として管理する", url: "/pages/articles/poikatsu-kakeibo", category: "ポイントサイト", date: "2026.07.12", thumbType: "summary", excerpt: "ポイントの家計上の考え方や記録方法、貯めすぎない使い方を解説します。" },
    { title: "ポイ活の年間計画を作る方法!セール時期と固定費を整理しよう", url: "/pages/articles/poikatsu-nenkan-keikaku", category: "ポイントサイト", date: "2026.07.12", thumbType: "campaign", excerpt: "年間で見るメリットや大型セールの把握、ポイント失効月の確認を解説します。" },
    { title: "ポイ活の優先順位を決める方法!時間効率の良い案件と買い物の選び方", url: "/pages/articles/poikatsu-yuusenjyuni", category: "ポイントサイト", date: "2026.07.12", thumbType: "summary", excerpt: "時間効率の考え方や日常買い物を優先する理由、継続しやすいルールを解説します。" },
    { title: "ポイ活で節約できる人・できない人の違い!向き不向きを解説", url: "/pages/articles/poikatsu-muki-fumuki", category: "ポイントサイト", date: "2026.07.12", thumbType: "caution", excerpt: "ポイ活に向いている人・向いていない人の特徴や無理なく始める判断を解説します。" },
    { title: "ポイ活の口コミは信用できる?体験談を見る時のチェックポイント", url: "/pages/articles/poikatsu-kuchikomi-shinyou", category: "ポイントサイト", date: "2026.07.12", thumbType: "caution", excerpt: "口コミのメリットや古い情報に注意する理由、公式情報と照合する方法を解説します。" },
    { title: "ポイ活でおすすめランキングを見る前に!順位より大切な判断基準", url: "/pages/articles/poikatsu-ranking-hanteikijun", category: "ポイントサイト", date: "2026.07.12", thumbType: "compare", excerpt: "ランキングの見方や生活圏との相性、自分向けに選ぶコツを解説します。" },
    { title: "ポイ活のデメリットとは?時間・個人情報・無駄買いのリスクを解説", url: "/pages/articles/poikatsu-demerit", category: "ポイントサイト", date: "2026.07.12", thumbType: "caution", excerpt: "時間がかかるデメリットや個人情報登録の注意、デメリットを減らす方法を解説します。" },
    { title: "ポイ活で疲れないコツ!キャンペーン追いすぎを防ぐシンプル運用", url: "/pages/articles/poikatsu-tsukarenai-kotsu", category: "ポイントサイト", date: "2026.07.12", thumbType: "beginner", excerpt: "疲れる原因ややることを絞るメリット、ゆるく続けるルールを解説します。" },
    { title: "LINEポイントを日常で貯める方法!LINEサービスと決済前チェックの基本", url: "/pages/articles/line-point-nichijou", category: "ショッピング", date: "2026.07.12", thumbType: "app", excerpt: "LINEポイントの特徴やLINE関連サービスで貯める場面、支払い前に確認すること、スタンプ・ギフト利用時の注意、使い道を決めて無駄なく使うコツを解説します。" },
    { title: "メルカリでできるポイ活術!売る・買う・支払うをお得につなげる方法", url: "/pages/articles/mercari-poikatsu", category: "フリマ・オークション", date: "2026.07.12", thumbType: "app", excerpt: "メルカリ内でポイントが発生する場面や売上金とポイントの違い、購入時に確認したいキャンペーン、メルペイ利用時の注意点、不用品整理と節約を両立するコツを解説します。" },
    { title: "Amazonギフト券チャージで損しない考え方!支払い方法と使い切りのコツ", url: "/pages/articles/amazon-gift-charge", category: "ショッピング", date: "2026.07.12", thumbType: "caution", excerpt: "ギフト券チャージの基本やチャージ前に確認する条件、クレジットカード支払いとの違い、残高管理で失敗しない方法、必要額だけ使うためのルールを解説します。" },
    { title: "au PAYマーケットでポイントを活用する方法!買い物前の確認ポイント", url: "/pages/articles/aupay-market-poikatsu", category: "ショッピング", date: "2026.07.12", thumbType: "app", excerpt: "au PAYマーケットの特徴や還元条件の確認方法、クーポンとの組み合わせ方、Pontaポイント利用時の注意、日用品購入で活かすコツを解説します。" },
    { title: "Qoo10でポイ活する方法!メガ割前に準備したいチェックリスト", url: "/pages/articles/qoo10-poikatsu", category: "ショッピング", date: "2026.07.12", thumbType: "campaign", excerpt: "Qoo10で確認したいポイント制度やメガ割前に準備すること、クーポンとポイントの使い分け、送料・配送条件の確認、コスメ購入で失敗しないコツを解説します。" },
    { title: "宿泊予約サイトでポイントを取りこぼさない方法!予約前の比較ポイント", url: "/pages/articles/shukuhaku-yoyaku-point", category: "ショッピング", date: "2026.08.27", thumbType: "compare", excerpt: "予約サイトごとのポイントの違いや公式サイト予約との比較、クーポン併用の確認、キャンセル時のポイント注意、旅行後に確認することを解説します。" },
    { title: "美容院・サロン代をポイントで節約!予約前に見るべき条件と使い方", url: "/pages/articles/biyouin-salon-point", category: "ショッピング", date: "2026.07.12", thumbType: "app", excerpt: "サロン予約で貯まるポイントの種類や予約前に見るべき条件、クーポンとポイントの使い分け、来店後の反映確認、リピート時に損しないコツを解説します。" },
    { title: "PASMO・ICOCAでもポイ活できる?交通系IC利用者向けの確認ポイント", url: "/pages/articles/pasmo-icoca-poikatsu", category: "ショッピング", date: "2026.07.12", thumbType: "caution", excerpt: "PASMO・ICOCAなど交通系ICカードのポイント対応状況や、登録が必要になるケース、定期券・チャージで見るポイント、買い物利用時の注意点、自分の利用エリアで確認する方法を解説します。" },
    { title: "ETCマイレージサービスとは?高速道路利用者が知っておきたい基本", url: "/pages/articles/etc-mileage-toha", category: "ショッピング", date: "2026.07.12", thumbType: "mile", excerpt: "ETCマイレージの仕組みや登録前に必要なもの、通行料金でポイントが貯まる流れ、還元額の使い方、車利用者が注意したい期限について解説します。" },
    { title: "Coke ONで飲み物代を節約する方法!スタンプ・チケット活用の基本", url: "/pages/articles/coke-on-setsuyaku", category: "ショッピング", date: "2026.07.12", thumbType: "app", excerpt: "Coke ONの仕組みやスタンプが貯まる場面、チケットの使い方、キャンペーン参加時の注意、自販機利用を増やしすぎないコツをまとめて解説します。" },
    { title: "家電量販店のポイントを賢く使う方法!現金値引きとの違いを解説", url: "/pages/articles/kadenryohanten-point", category: "ショッピング", date: "2026.08.27", thumbType: "compare", excerpt: "家電量販店ポイントの特徴やポイント還元と現金値引きの違い、大型家電で注意したいこと、保証・配送費との比較、次回購入に残すか使うかの判断について解説します。" },
    { title: "百貨店・デパートでポイ活する方法!ギフト購入で損しないコツ", url: "/pages/articles/hyakkaten-depart-poikatsu", category: "ショッピング", date: "2026.07.12", thumbType: "beginner", excerpt: "百貨店ポイントの特徴やクレジットカードとの相性、ギフト購入で確認すること、セール品のポイント注意、高額購入時の使い方についてまとめて解説します。" },
    { title: "ホームセンターの会員アプリ活用術!DIY用品と日用品をお得に買う方法", url: "/pages/articles/homecenter-app-katsuyou", category: "ショッピング", date: "2026.07.12", thumbType: "app", excerpt: "ホームセンターで貯まるポイントの仕組みや会員アプリの活用、まとめ買い前の確認、大型商品の配送費の注意、生活消耗品で使うコツについて解説します。" },
    { title: "ユニクロ・GUでポイントは貯まる?衣類購入でできる節約チェック", url: "/pages/articles/uniqlo-gu-point", category: "ショッピング", date: "2026.08.11", thumbType: "beginner", excerpt: "衣類購入で見るべきポイントや公式アプリの役割、ポイントサイト経由の活用、キャッシュレス決済との組み合わせを解説します。" },
    { title: "無印良品でお得に買い物する方法!マイル・クーポン・決済の基本", url: "/pages/articles/muji-otoku-kaimono", category: "ショッピング", date: "2026.07.12", thumbType: "summary", excerpt: "無印良品の会員制度の基本や、マイルとポイントの違い、クーポン確認のタイミング、支払い方法ごとの還元、定番品をお得に買うコツまでを解説します。" },
    { title: "スターバックスでポイ活する方法!アプリ・チャージ・支払いの基本", url: "/pages/articles/starbucks-poikatsu", category: "ショッピング", date: "2026.07.12", thumbType: "app", excerpt: "スタバアプリの仕組みや、チャージ時に確認したいこと、カード支払いとの組み合わせ、リワード利用時の注意点、カフェ代を増やさないコツを解説します。" },
    { title: "ファミレス・カフェでポイントを貯める方法!外食前のアプリ確認術", url: "/pages/articles/famiresu-cafe-point", category: "ショッピング", date: "2026.07.12", thumbType: "app", excerpt: "飲食店アプリで確認すべきことや、共通ポイント対応の見方、クーポンとの併用条件、支払い方法の選び方、家族利用で管理するコツを解説します。" },
    { title: "映画館でポイントを貯める方法!チケット購入と会員制度の使い分け", url: "/pages/articles/eigakan-point", category: "ショッピング", date: "2026.07.12", thumbType: "compare", excerpt: "映画館の会員制度や、チケット購入で見るポイント、前売券・割引日との比較、売店利用の注意点、エンタメ費を抑えるコツを解説します。" },
    { title: "本・電子書籍でポイ活する方法!紙の本と電子版の選び方", url: "/pages/articles/hon-denshi-shoseki-poikatsu", category: "ショッピング", date: "2026.07.12", thumbType: "compare", excerpt: "書店ポイントの特徴や、電子書籍ストアの還元、セール時期の見方、読みたい本だけ買うルール、ポイントで学習費を抑えるコツを解説します。" },
    { title: "ゲーム課金でポイントを貯める方法!Apple・Google残高利用時の注意", url: "/pages/articles/game-kakin-point", category: "ショッピング", date: "2026.07.12", thumbType: "caution", excerpt: "ゲーム課金で見るポイントや、ギフトカード購入時の確認、アプリ内課金の注意点、子ども利用時の管理、課金しすぎを防ぐルールを解説します。" },
    { title: "フリマアプリ購入でポイントを活用する方法!中古品選びの注意点", url: "/pages/articles/furima-app-kounyuu-point", category: "フリマ・オークション", date: "2026.07.12", thumbType: "app", excerpt: "フリマ購入で得する場面やクーポンとポイントの使い方、送料込み価格の見方、出品者評価の確認、新品購入との比較方法を初心者向けに解説します。" },
    { title: "宅配・デリバリーでポイ活する方法!割引とポイントの使い分け", url: "/pages/articles/takuhai-delivery-poikatsu", category: "ショッピング", date: "2026.07.12", thumbType: "caution", excerpt: "デリバリーアプリの還元条件や初回クーポンの注意、少額注文で損しやすい理由、支払い方法の選び方、外食費を増やさないコツをやさしく解説します。" },
    { title: "ネットスーパーのポイントを比較!Ponta・楽天・WAON POINTなど対応状況を解説", url: "/pages/articles/net-super-poikatsu", category: "ショッピング", date: "2026.08.27", thumbType: "compare", excerpt: "主要ネットスーパーのポイント対応状況を比較。Pontaが貯まる・使えるのか、共通ポイントと決済側ポイントの違いも解説します。" },
    { title: "医療費・処方薬でポイントは貯まる?支払い前に確認したい注意点", url: "/pages/articles/iryouhi-shohouyaku-point", category: "ショッピング", date: "2026.07.12", thumbType: "caution", excerpt: "医療費支払いの基本やキャッシュレス対応の確認、薬局で貯まるポイント、領収書管理の重要性、節約より優先すべきことをやさしく解説します。" },
    { title: "ペット用品でポイ活する方法!定期購入とまとめ買いの節約術", url: "/pages/articles/pet-yohin-poikatsu", category: "ショッピング", date: "2026.07.12", thumbType: "beginner", excerpt: "ペット用品で貯めやすい場面や定期購入のメリット、まとめ買いの注意点、ネット通販と店舗の比較、必要量を管理するコツをやさしく解説します。" },
    { title: "銀行口座のポイ活とは?給与受取・口座振替で貯める基本", url: "/pages/articles/ginkou-kouza-poikatsu", category: "口座開設", date: "2026.07.12", thumbType: "beginner", excerpt: "銀行口座でポイントが貯まる場面や給与受取の確認ポイント、口座振替で見る条件、手数料との比較、メイン口座を決めるコツをやさしく解説します。" },
    { title: "ネット銀行を使ったポイ活術!振込・ATM・残高条件の見方", url: "/pages/articles/net-ginkou-poikatsu", category: "口座開設", date: "2026.07.12", thumbType: "app", excerpt: "ネット銀行のポイント制度や振込回数と手数料の確認、ATM利用時の注意、ランク制度の見方、生活口座として使う判断をやさしく解説します。" },
    { title: "ポイントサイトの高額案件を見る前に!口座開設・カード案件の注意点", url: "/pages/articles/pointsite-kougaku-anken", category: "ポイントサイト", date: "2026.07.12", thumbType: "caution", excerpt: "高額案件が多い理由や申し込み条件の確認、短期間で増やしすぎるリスク、成果反映までの流れ、必要な案件だけ選ぶコツを冷静な視点で解説します。" },
    { title: "クレカ積立でポイントは貯まる?投資前に知りたい基本と注意点", url: "/pages/articles/creca-tsumitate-point", category: "クレジットカード", date: "2026.07.12", thumbType: "caution", excerpt: "クレジットカードで投資信託を積み立てるクレカ積立について、仕組みやポイント還元の見方、投資リスクとの違い、NISA利用時に確認したい点、無理のない積立額の決め方まで、投資初心者向けに丁寧に解説します。" },
    { title: "チャージルートでポイントを増やす考え方!複雑にしすぎない決済設計", url: "/pages/articles/charge-route-point", category: "ショッピング", date: "2026.07.12", thumbType: "summary", excerpt: "クレジットカードから電子マネーやQR決済へのチャージルートとは何かという基本から、複数経由するメリット、管理が難しくなる原因、改悪時の見直し方、シンプルに続けるルールまで初心者向けに丁寧に解説します。" },
    { title: "プリペイドカードでポイ活する方法!使いすぎ防止にも役立つ活用術", url: "/pages/articles/prepaid-card-poikatsu", category: "ショッピング", date: "2026.07.12", thumbType: "beginner", excerpt: "クレジットカードに抵抗がある方や使いすぎが心配な方に向けて、プリペイドカードの特徴やチャージ時に見るポイント、残高管理のコツ、使える店の確認方法、予算管理への活かし方まで初心者向けに丁寧に解説します。" },
    { title: "デビットカード派のポイ活入門!即時払いで支出を管理するコツ", url: "/pages/articles/debit-card-poikatsu", category: "クレジットカード", date: "2026.07.12", thumbType: "beginner", excerpt: "クレジットカードの後払いに不安がある方に向けて、即時払いのデビットカードの基本やクレジットカードとの違い、ポイント還元の見方、口座残高管理の注意点、支出を抑えて節約するコツまで初心者向けに丁寧に解説します。" },
    { title: "家族カードでポイントをまとめる方法!家計管理と使いすぎ防止のコツ", url: "/pages/articles/kazoku-card-matomeru", category: "クレジットカード", date: "2026.07.12", thumbType: "yosekatsu", excerpt: "家族それぞれの支出をまとめてポイントを貯めたい方に向けて、家族カードの仕組みやポイントをまとめるメリット、利用明細の確認方法、予算ルールの決め方、家族で使う時の注意点まで初心者向けに丁寧に解説します。" },
    { title: "通勤定期・交通費でポイントを貯める方法!毎月の移動費を見直そう", url: "/pages/articles/tsukin-teiki-koutsuhi-point", category: "ショッピング", date: "2026.07.12", thumbType: "summary", excerpt: "毎月かかる通勤定期や交通費でポイントを貯める考え方から、定期券購入時の確認点、チャージ方法の選び方、会社への精算時の注意点、日々の移動費を上手に管理するコツまで初心者向けに丁寧に解説します。" },
    { title: "個人事業主向けポイント管理術!経費支払いで迷わない考え方", url: "/pages/articles/kojinjigyounushi-point-kanri", category: "副業", date: "2026.07.12", thumbType: "summary", excerpt: "個人事業主の経費支払いで迷わないよう、事業用と私用を分けて管理する理由や経費支払いで貯まる場面、会計処理で注意すること、ポイント利用時の記録、無理なく管理する方法まで初心者向けに丁寧に解説します。" },
    { title: "経費精算でポイントは誰のもの?会社員が確認したいルールとマナー", url: "/pages/articles/keihiseisan-point-dareno", category: "副業", date: "2026.07.12", thumbType: "caution", excerpt: "経費精算とポイントの考え方、会社規定を確認する理由、立替払いの注意点、トラブルを防ぐ記録、個人利用と分けるコツを会社員向けにわかりやすく解説します。" },
    { title: "確定申告前に整理したいポイント利用履歴!家計と事業を分ける方法", url: "/pages/articles/kakuteishinkoku-point-seiri", category: "副業", date: "2026.07.12", thumbType: "caution", excerpt: "ポイント履歴を残す理由、事業利用と私用利用の分け方、領収書との照合、会計ソフト入力の注意、迷った時の確認先を確定申告前に整理する視点から解説します。" },
    { title: "ポイント収支表の作り方!貯める・使う・失効を見える化する方法", url: "/pages/articles/point-shuushihyou-tsukurikata", category: "ポイントサイト", date: "2026.07.12", thumbType: "summary", excerpt: "ポイント収支を作るメリット、記録する項目、使ったポイントの扱い、失効予定の管理、月1回で続けるコツを、初心者でも続けやすい方法として解説します。" },
    { title: "前払いしすぎないポイ活術!ポイント目当ての出費を防ぐ考え方", url: "/pages/articles/maebarai-shisugi-poikatsu", category: "ショッピング", date: "2026.07.12", thumbType: "caution", excerpt: "前払いで失敗しやすい理由、チャージ残高の管理、まとめ買いの判断基準、現金余力を残す重要性、買う前に確認するルールを、無理のないポイ活の視点から解説します。" },
    { title: "ポイントで生活費を軽くする方法!食費・日用品に優先して使う考え方", url: "/pages/articles/point-seikatsuhi-karuku", category: "ショッピング", date: "2026.07.12", thumbType: "beginner", excerpt: "生活費に使うメリット、優先して使う支出、貯め込みすぎのデメリット、月末の使い切りルール、節約実感を高めるコツを、初心者向けにやさしく解説します。" },
    { title: "新生活のポイ活チェックリスト!家具・家電・日用品をお得にそろえる方法", url: "/pages/articles/shinseikatsu-poikatsu-checklist", category: "ショッピング", date: "2026.07.12", thumbType: "beginner", excerpt: "新生活で必要な出費の洗い出し、家電購入前の確認、家具・日用品の買い方、配送費と設置費への注意、ポイントを新生活費に回すコツをチェックリスト形式で解説します。" },
    { title: "引っ越しでポイ活する方法!見積もり・家具購入・手続きの確認ポイント", url: "/pages/articles/hikkoshi-poikatsu", category: "ショッピング", date: "2026.08.28", thumbType: "summary", excerpt: "引っ越しで発生する出費、見積もり比較時の注意、家具家電購入のタイミング、住所変更で忘れがちなこと、無駄な契約を増やさないコツを解説します。" },
    { title: "入学・進学準備でポイントを貯める方法!学用品購入の節約術", url: "/pages/articles/nyuugaku-shingaku-junbi-point", category: "ショッピング", date: "2026.07.12", thumbType: "beginner", excerpt: "新学期を迎える家庭に向けて、入学・進学準備で必要なものの整理から、まとめ買い前のリスト作成、ネット通販と店舗の比較、名前入れ・配送の注意点、家計負担を平準化するコツまで初心者にもわかりやすく解説します。" },
    { title: "夏休み前のポイ活準備!旅行・レジャー・日用品を計画的に買う方法", url: "/pages/articles/natsuyasumi-poikatsu-junbi", category: "キャンペーン", date: "2026.07.12", thumbType: "campaign", excerpt: "家族の予定が集中しやすい夏休み前に押さえておきたい支出の特徴や旅行予約の確認ポイント、レジャー用品の購入時期、外食費を抑える工夫、帰宅後のポイント確認方法まで初心者にもわかりやすく詳しく解説します。" },
    { title: "年末年始のポイ活術!帰省・おせち・初売りで使える節約ポイント", url: "/pages/articles/nenmatsunenshi-poikatsu", category: "キャンペーン", date: "2026.07.12", thumbType: "campaign", excerpt: "毎年慌ただしくなりがちな年末年始にかかる出費の整理や帰省費用で見るポイント、おせち・手土産の買い方、初売り前に決める予算、失効ポイントを使い切るコツまでをまとめて丁寧に解説します。" },
    { title: "ブラックフライデーで失敗しないポイ活!買うものリストと上限確認の基本", url: "/pages/articles/black-friday-poikatsu", category: "キャンペーン", date: "2026.07.12", thumbType: "caution", excerpt: "毎年11月下旬に大型セールが集中するブラックフライデーの特徴や事前リストを作る理由、還元上限の確認方法、セール価格の見極め方、買いすぎを防ぐ方法まで初心者にもわかりやすく丁寧に解説します。" },
    { title: "決算セールでポイ活する方法!家電・日用品をお得に買う判断基準", url: "/pages/articles/kessan-sale-poikatsu", category: "キャンペーン", date: "2026.07.12", thumbType: "campaign", excerpt: "家電量販店などで年に数回実施される決算セールの時期の把握や本当に必要な物を決める考え方、ポイント還元との比較、型落ち商品の注意点、購入後に確認すべきことまで丁寧に解説します。" },
    { title: "母の日・父の日ギフトでポイントを貯める方法!早割と配送日の確認術", url: "/pages/articles/hahanohi-chichinohi-gift-point", category: "ショッピング", date: "2026.07.12", thumbType: "campaign", excerpt: "毎年5月・6月に訪れる母の日・父の日のギフト購入で貯まるポイントや早割を使うメリット、配送日指定の注意点、メッセージカードの確認、相手に合わせた選び方まで初心者にも丁寧に解説します。" },
    { title: "防災グッズ購入でポイ活する方法!備蓄を無駄なくそろえるコツ", url: "/pages/articles/bousai-goods-poikatsu", category: "ショッピング", date: "2026.07.12", thumbType: "beginner", excerpt: "いざという時に備えたい防災グッズで必要なものやまとめ買いの注意点、期限管理が必要な商品、ネットと店舗の使い分け、ポイントより安全を優先する考え方までを丁寧に解説します。" },
    { title: "冬支度のポイ活術!暖房家電・防寒用品をお得に準備する方法", url: "/pages/articles/fuyujitaku-poikatsu", category: "キャンペーン", date: "2026.07.14", thumbType: "campaign", excerpt: "冬支度で増える支出の内訳や暖房家電の購入時期、防寒用品の選び方、電気代も含めた予算の考え方、シーズン後の見直し方法までを解説します。" },
    { title: "ボーナス月のポイ活計画!大きな買い物で損しない予算管理", url: "/pages/articles/bonus-tsuki-poikatsu-keikaku", category: "キャンペーン", date: "2026.07.14", thumbType: "campaign", excerpt: "ボーナス月に買いやすいものの特徴や予算を先に決める理由、高額購入時の還元確認、分割払いの注意点、ポイントの使い道の決め方までを解説します。" },
    { title: "誕生日特典を活用したポイ活!会員登録前に確認したい注意点", url: "/pages/articles/tanjoubi-tokuten-poikatsu", category: "キャンペーン", date: "2026.07.14", thumbType: "campaign", excerpt: "誕生日特典の種類や登録時期の確認方法、クーポンの利用条件、不要なメルマガの整理方法、家族分の特典を管理するコツまでを解説します。" },
    { title: "月初・月末のポイ活ルーティン!キャンペーンと失効をまとめて確認する方法", url: "/pages/articles/tsukihatsu-tsukimatsu-poikatsu-routine", category: "ポイントサイト", date: "2026.07.14", thumbType: "summary", excerpt: "月初に確認すべきことや月末の確認事項、失効しそうなポイントの使い切り方、予算残高との照合方法、10分で終わるチェックリストまでを解説します。" },
    { title: "雨の日・平日限定キャンペーンのポイ活術!条件を見落とさないコツ", url: "/pages/articles/ame-heijitsu-campaign-poikatsu", category: "キャンペーン", date: "2026.07.14", thumbType: "caution", excerpt: "雨の日・平日限定キャンペーンの特徴や対象日・対象店舗の確認方法、クーポン併用の注意点、無理に出かけない判断基準、通知の整理方法までを解説します。" },
    { title: "福袋・初売りでポイ活する方法!お得に見えて損しない選び方", url: "/pages/articles/fukubukuro-hatsuuri-poikatsu", category: "キャンペーン", date: "2026.07.14", thumbType: "campaign", excerpt: "福袋購入前の考え方や中身の必要度の確認方法、初売りポイントの見方、返品条件の注意点、買った後の活用方法までを解説します。" },
    { title: "キャンペーンメモの作り方!エントリー忘れを減らすポイ活管理術", url: "/pages/articles/campaign-memo-tsukurikata", category: "ポイントサイト", date: "2026.07.14", thumbType: "summary", excerpt: "キャンペーンメモに残す項目やエントリー日の記録方法、付与予定日の管理、上限金額のメモ、見返しやすく整理するコツまでを初心者向けに解説します。" },
    { title: "付与予定ポイントの見える化術!反映待ちを忘れないチェック習慣", url: "/pages/articles/fuyoyotei-point-mieruka", category: "ポイントサイト", date: "2026.07.14", thumbType: "summary", excerpt: "付与予定ポイントを管理する理由や確認タイミング、スクリーンショットの残し方、反映遅れへの対応、月次で整理するコツを解説します。" },
    { title: "ポイ活専用メールアドレスは必要?登録管理をラクにする考え方", url: "/pages/articles/poikatsu-senyou-mail-hitsuyou", category: "ポイントサイト", date: "2026.07.14", thumbType: "beginner", excerpt: "専用メールのメリットや通常メールと分ける理由、重要メールの見落とし防止、迷惑メール対策、不要サービスを整理する方法を解説します。" },
    { title: "家族アカウントでポイ活する時の注意点!規約確認とトラブル防止", url: "/pages/articles/kazoku-account-poikatsu-chuui", category: "ポイントサイト", date: "2026.07.14", thumbType: "caution", excerpt: "家族アカウントで起きやすい問題や同一住所・同一端末の注意、規約確認のポイント、ポイント共有時のルール、安全に使うための確認事項を解説します。" },
    { title: "ポイント履歴の見方を解説!獲得・利用・失効を確認する手順", url: "/pages/articles/point-rireki-mikata", category: "ポイントサイト", date: "2026.07.14", thumbType: "beginner", excerpt: "ポイント履歴で分かることや獲得履歴・利用履歴の確認方法、失効履歴の見方、不明点を整理する方法を初心者にもわかりやすく解説します。" },
    { title: "ポイント問い合わせの準備方法!必要情報をそろえてスムーズに確認する", url: "/pages/articles/point-toiawase-junbi", category: "ポイントサイト", date: "2026.07.14", thumbType: "summary", excerpt: "問い合わせ前に確認すべきことや購入日時・注文番号の整理、スクリーンショットの活用、条件未達の可能性、丁寧な文章の作り方を解説します。" },
    { title: "スクリーンショット保存でポイ活ミスを減らす方法!残すべき画面を解説", url: "/pages/articles/screenshot-hozon-poikatsu-miss", category: "ポイントサイト", date: "2026.07.14", thumbType: "caution", excerpt: "スクショが役立つ理由や保存すべき画面、ファイル名の付け方、保存期間の目安、個人情報の扱いに注意する点を初心者向けに解説します。" },
    { title: "エントリーカレンダーの作り方!毎月のポイ活予定を見える化する", url: "/pages/articles/entry-calendar-tsukurikata", category: "ポイントサイト", date: "2026.07.14", thumbType: "summary", excerpt: "カレンダー化するメリットや登録するキャンペーン情報、通知設定の使い方、家計予定との連携、続けやすい更新頻度を解説します。" },
    { title: "実質価格の計算方法!値引き・クーポン・ポイントをまとめて比較する", url: "/pages/articles/jisshitsu-kakaku-keisan", category: "ショッピング", date: "2026.07.14", thumbType: "summary", excerpt: "実質価格とは何か、値引きとポイントの違い、クーポンを入れた計算、送料・手数料の扱い、安さを判断する手順までを初心者向けに解説します。" },
    { title: "ポイント還元と現金値引きはどっちが得?迷った時の比較方法", url: "/pages/articles/point-kangen-genkin-nebiki-hikaku", category: "ショッピング", date: "2026.07.14", thumbType: "compare", excerpt: "現金値引きのメリット、ポイント還元のメリット、使い切れるかの確認、有効期限の考え方、高額商品での判断例までをわかりやすく解説します。" },
    { title: "送料で損しないポイ活術!送料無料ラインとまとめ買いの考え方", url: "/pages/articles/souryou-son-poikatsu", category: "ショッピング", date: "2026.07.14", thumbType: "caution", excerpt: "送料が損につながる理由、送料無料ラインの確認、まとめ買いの注意点、店舗受け取りの活用、実質価格で判断する方法までを解説します。" },
    { title: "ポイント倍率表の読み方!何倍表示に惑わされないチェックポイント", url: "/pages/articles/point-bairitsu-hyou-yomikata", category: "ショッピング", date: "2026.07.14", thumbType: "caution", excerpt: "ポイント倍率表示の基本、通常還元を含むかの確認、付与上限の見方、対象外商品への注意、実際の還元額の計算方法までを解説します。" },
    { title: "端数支払いでポイントを使う方法!少額ポイントを無駄にしないコツ", url: "/pages/articles/hasuu-shiharai-point", category: "ショッピング", date: "2026.07.14", thumbType: "beginner", excerpt: "端数支払いのメリット、少額ポイントの使い道、決済前の確認、期間限定ポイントの消化、管理を簡単にする方法までをわかりやすく解説します。" },
    { title: "高還元日の買い物リスト術!必要な物だけ買うポイ活ルール", url: "/pages/articles/koukangen-hi-kaimono-list", category: "ショッピング", date: "2026.07.14", thumbType: "summary", excerpt: "高還元日に向く商品、リストを作る理由、買わない物の決め方、予算上限の設定、購入後に振り返る方法までを解説します。" },
    { title: "ポイ活の見直しタイミングはいつ?使わないサービスを整理する方法", url: "/pages/articles/poikatsu-minaoshi-timing", category: "ポイントサイト", date: "2026.07.14", thumbType: "summary", excerpt: "見直しが必要なサイン、使わないアプリの整理、還元率より手間を見る視点、メイン決済の再確認、年に数回の棚卸しの方法までを解説します。" },
    { title: "共働き家庭のポイ活術!忙しくても続く支払い管理と役割分担", url: "/pages/articles/tomobataraki-katei-poikatsu", category: "ポイントサイト", date: "2026.07.14", thumbType: "beginner", excerpt: "共働き家庭で管理が難しくなる理由やメイン決済の決め方、家計用カードの使い方、夫婦で確認する頻度、手間を増やさないルールまでを初心者向けに解説します。" },
    { title: "子育て世帯のポイ活術!おむつ・ミルク・学用品をお得に買う方法", url: "/pages/articles/kosodate-setai-poikatsu", category: "ポイントサイト", date: "2026.07.14", thumbType: "beginner", excerpt: "子育て支出の特徴や定期購入とまとめ買いの使い分け、ドラッグストア以外の選択肢、セール前の在庫確認、成長に合わせた見直し方までを初心者向けに解説します。" },
    { title: "単身赴任中のポイ活術!二重生活の支出をポイントで軽くする方法", url: "/pages/articles/tanshinfunin-poikatsu", category: "ポイントサイト", date: "2026.07.14", thumbType: "beginner", excerpt: "単身赴任で増える支出や交通費・宿泊費の確認方法、日用品購入の管理、家族口座との分け方、帰省時に使うポイントまでを初心者向けにわかりやすく解説します。" },
    { title: "旅行好きのポイ活計画!普段の買い物を旅費に近づける考え方", url: "/pages/articles/ryokou-zuki-poikatsu-keikaku", category: "ポイントサイト", date: "2026.07.14", thumbType: "mile", excerpt: "旅行目的で貯めるメリットやマイルとポイントの使い分け、日常支出で貯める方法、有効期限の管理、旅先で使う時の注意までを初心者向けにわかりやすく解説します。" },
    { title: "車なし生活のポイ活術!交通・ネット通販・日用品で節約する方法", url: "/pages/articles/kurumanashi-seikatsu-poikatsu", category: "ポイントサイト", date: "2026.07.14", thumbType: "beginner", excerpt: "車なし生活の支出特徴や交通費で見るポイント、ネット通販の送料対策、重い日用品の買い方、買い物回数を減らす工夫までを初心者向けにわかりやすく解説します。" },
    { title: "地方在住者のポイ活術!使える店舗が少ない時のポイント活用法", url: "/pages/articles/chihou-zaijuu-poikatsu", category: "ポイントサイト", date: "2026.07.14", thumbType: "caution", excerpt: "地方で起きやすい悩みやネット通販の活用法、対応店舗の調べ方、交通費とのバランス、無理に都会型を真似しない考え方までを解説します。" },
    { title: "都市部在住者のポイ活術!店舗・交通・外食を使い分ける方法", url: "/pages/articles/toshibu-zaijuu-poikatsu", category: "ポイントサイト", date: "2026.07.14", thumbType: "beginner", excerpt: "都市部で貯めやすい場面や店舗アプリの使い分け、交通費で見るポイント、外食キャンペーンの注意点、情報過多を整理するコツまでを解説します。" },
    { title: "海外在住者が日本のポイントを管理する方法!帰国時に使う前提の考え方", url: "/pages/articles/kaigai-zaijuu-point-kanri", category: "ポイントサイト", date: "2026.07.14", thumbType: "caution", excerpt: "海外在住で起きる課題や有効期限の確認方法、日本の電話番号・認証の注意点、帰国時に使うポイント、家族に頼む時の注意までを解説します。" },
    { title: "ミニマリスト向けポイ活!買わない生活でもポイントを活かす方法", url: "/pages/articles/minimalist-poikatsu", category: "ポイントサイト", date: "2026.07.14", thumbType: "beginner", excerpt: "ミニマリストとポイ活の相性や買わずに貯める場面、必要な支出だけに絞る考え方、アプリを増やさない管理法、ポイントを使い切る考え方までを解説します。" },
    { title: "節約が苦手な人のポイ活入門!頑張らずに支出を見える化する方法", url: "/pages/articles/setsuyaku-nigate-poikatsu-nyumon", category: "ポイントサイト", date: "2026.07.14", thumbType: "beginner", excerpt: "節約が続かない原因やポイントを記録するメリット、支払い方法を固定するコツ、小さな成功の作り方、やめるルールの決め方までを解説します。" },
    { title: "買い物が苦手な人のポイ活術!比較しすぎずに得するシンプル運用", url: "/pages/articles/kaimono-nigate-poikatsu", category: "ポイントサイト", date: "2026.07.14", thumbType: "beginner", excerpt: "比較疲れが起きる理由や買う店を固定する考え方、高還元日だけ見る方法、迷った時の判断基準、時間を使いすぎないコツまで、比較が苦手な人向けのシンプルなポイ活運用法を解説します。" },
    { title: "忙しい会社員の週末ポイ活ルーティン!平日に追わない管理方法", url: "/pages/articles/isogashii-kaishain-shuumatsu-poikatsu", category: "ポイントサイト", date: "2026.07.14", thumbType: "summary", excerpt: "平日に追わないメリットや週末に確認する項目、通勤・昼食費の見直し、固定費の支払い確認、続けやすい予定の入れ方まで、忙しい会社員向けの週末ポイ活ルーティンを解説します。" },
    { title: "固定費が少ない人のポイ活術!少額支出でも効率よく貯める方法", url: "/pages/articles/koteihi-sukunai-poikatsu", category: "ポイントサイト", date: "2026.07.14", thumbType: "beginner", excerpt: "固定費が少ない人の特徴や日常買い物を中心にする考え方、キャンペーンの絞り方、ポイント失効を防ぐ方法、少額でも満足度を上げる工夫まで、少額支出型のポイ活術を解説します。" },
    { title: "キャッシュレスが不安な人向けポイ活!現金感覚で使うための管理方法", url: "/pages/articles/cashless-fuan-poikatsu", category: "ポイントサイト", date: "2026.07.14", thumbType: "beginner", excerpt: "不安を感じる理由や利用上限を決める方法、通知で支出を確認するコツ、プリペイド型の活用、現金と併用するコツまで、キャッシュレスが不安な人向けのポイ活管理方法を解説します。" },
    { title: "ちょびリッチとは?評判・特徴からポイントの貯め方まで徹底解説", url: "/pages/articles/chobirich-poikatsu", category: "ポイントサイト", date: "2026.07.15", thumbType: "earnings", excerpt: "老舗ポイントサイト「ちょびリッチ」の特徴や実績、おすすめの訴求ポイント、ポイントの貯め方、登録方法までをわかりやすく解説します。" },
    { title: "ポイントミュージアムとは?安全性・交換条件・特徴をわかりやすく解説", url: "/pages/articles/point-museum-poikatsu", category: "ポイントサイト", date: "2026.08.27", thumbType: "earnings", excerpt: "ポイントミュージアムの運営会社や安全性、メール受信・クリックで貯める仕組み、交換方法、登録方法までわかりやすく解説します。" },
    { title: "モッピーでポイ活を始める方法!高還元案件を見る前の確認ポイント", url: "/pages/articles/moppy-hajimekata", category: "ポイントサイト", date: "2026.07.26", thumbType: "earnings", excerpt: "モッピーの基本や案件ジャンルの種類、高還元案件の注意点、承認条件の読み方、交換先を決めて使うコツを初心者向けに解説します。" },
    { title: "ポイントインカムの特徴とは?買い物・ゲーム・案件を使い分ける方法", url: "/pages/articles/pointincome-tsukaikata", category: "ポイントサイト", date: "2026.07.26", thumbType: "earnings", excerpt: "ポイントインカムの特徴や買い物案件の使い方、ゲーム案件の考え方、ランク制度を見る時の注意、自分に合う案件を選ぶコツを初心者向けに解説します。" },
    { title: "ワラウでできるポイ活とは?遊びながら貯める前に知りたい基本", url: "/pages/articles/warau-tsukaikata", category: "ポイントサイト", date: "2026.07.26", thumbType: "earnings", excerpt: "ワラウの主な貯め方やゲーム系コンテンツの使い方、広告案件の確認ポイント、毎日続ける場合の注意、時間をかけすぎないコツを初心者向けに解説します。" },
    { title: "ちょびリッチの使い方!ポイントサイト初心者が見るべき案件と交換先", url: "/pages/articles/chobirich-tsukaikata", category: "ポイントサイト", date: "2026.07.27", thumbType: "earnings", excerpt: "ちょびリッチの基本や案件利用の流れ、交換先の選び方、承認待ちの確認方法、他サイトと比べる時のポイントを初心者向けに解説します。" },
    { title: "ECナビでポイントを貯める方法!アンケートと買い物を組み合わせるコツ", url: "/pages/articles/ecnavi-tsukaikata", category: "ポイントサイト", date: "2026.07.27", thumbType: "earnings", excerpt: "ECナビの特徴やアンケートで貯める方法、ネットショッピングで使う流れ、交換先と手数料の確認、毎日作業にしない続け方を初心者向けに解説します。" },
    { title: "ハピタスの使い方を初心者向けに解説!案件選びとポイント交換の基本", url: "/pages/articles/hapitas-tsukaikata", category: "ポイントサイト", date: "2026.07.25", thumbType: "beginner", excerpt: "ハピタスでできることや初心者が選びやすい案件、判定期間と通帳の確認方法、ポイント交換時の注意、無理なく続けるコツを初心者向けに解説します。" },
    { title: "ニフティポイントクラブの活用術!ネット利用者向けのポイ活基本", url: "/pages/articles/nifty-point-club-poikatsu", category: "ポイントサイト", date: "2026.07.27", thumbType: "earnings", excerpt: "ニフティポイントクラブの特徴や通販案件の探し方、サービス申込み案件の注意、ポイント交換の流れ、利用履歴を残すコツを初心者向けに解説します。" },
    { title: "トリマで移動ポイ活する方法!歩く・移動する前に知るべき注意点", url: "/pages/articles/torima-idou-poikatsu", category: "アプリ案件", date: "2026.07.27", thumbType: "mobile", excerpt: "トリマの仕組みや移動・歩数で貯める流れ、バッテリー消費の注意、生活に合わせて続けるコツを初心者向けに解説します。" },
    { title: "レシチャレ(旧クラシルリワード)で貯めるポイ活とは?レシート・移動・広告の使い方", url: "/pages/articles/reshichare-poikatsu", category: "アプリ案件", date: "2026.07.27", thumbType: "mobile", excerpt: "レシチャレ(旧クラシルリワード)の特徴やレシート登録の基本、移動や広告で貯める方法、交換前に確認することを初心者向けに解説します。" },
    { title: "TikTok Liteのポイ活はどう使う?登録前に確認したい条件と注意点", url: "/pages/articles/tiktok-lite-poikatsu", category: "アプリ案件", date: "2026.07.27", thumbType: "mobile", excerpt: "TikTok Liteで貯める仕組みや招待・タスクの確認ポイント、条件変更への注意、交換・出金前のチェック事項を初心者向けに解説します。" },
    { title: "レシートアプリでポイ活する方法!買い物後に捨てずに活用するコツ", url: "/pages/articles/receipt-app-poikatsu", category: "アプリ案件", date: "2026.07.29", thumbType: "app", excerpt: "レシートアプリの基本や撮影前に確認すること、対象商品案件の探し方、個人情報を守る注意点、習慣化しやすい管理方法を初心者向けに解説します。" },
    { title: "ONEでレシートポイ活を始める方法!撮影前に確認したいポイント", url: "/pages/articles/one-receipt-poikatsu", category: "アプリ案件", date: "2026.07.29", thumbType: "mobile", excerpt: "レシート買取アプリONEの特徴やレシート登録の流れ、対象ミッションの選び方、否認されやすいケースを初心者向けに解説します。" },
    { title: "CODEで商品バーコードを使ったポイ活!レシート登録と案件活用の基本", url: "/pages/articles/code-receipt-poikatsu", category: "アプリ案件", date: "2026.07.29", thumbType: "mobile", excerpt: "CODEの仕組みやバーコード登録の流れ、対象商品の見つけ方、レシート撮影の注意点、日用品購入で活かすコツを初心者向けに解説します。" },
    { title: "楽天チェックで来店ポイントを貯める方法!外出ついでに使う基本", url: "/pages/articles/rakuten-check-poikatsu", category: "ショッピング", date: "2026.07.30", thumbType: "app", excerpt: "楽天チェックの特徴や対象店舗の探し方、来店時の操作手順、位置情報利用の注意点を初心者向けに解説します。" },
    { title: "移動系ポイ活アプリの選び方!歩数・移動距離・広告視聴の違い", url: "/pages/articles/idou-app-erabikata", category: "アプリ案件", date: "2026.07.30", thumbType: "compare", excerpt: "歩数型・移動距離型・広告視聴型など、移動系ポイ活アプリの種類と違い、バッテリー・通信量の確認ポイントを初心者向けに解説します。" },
    { title: "歩数アプリでポイントを貯める方法!健康習慣と節約を両立するコツ", url: "/pages/articles/hosuu-app-poikatsu", category: "アプリ案件", date: "2026.07.30", thumbType: "beginner", excerpt: "歩数ポイ活の基本や目標歩数の決め方、ポイント獲得条件の見方、スマホ設定の注意点を初心者向けに解説します。" },
    { title: "アンケートモニターでポイ活する方法!スキマ時間で稼ぐ前の基本", url: "/pages/articles/enquete-monitor-poikatsu", category: "アンケート", date: "2026.07.31", thumbType: "beginner", excerpt: "アンケートモニターの仕組みや事前登録で入力する情報、単価と時間効率の考え方、個人情報の注意点を初心者向けに解説します。" },
    { title: "マクロミルでアンケートポイ活を始める方法!回答前の注意点を解説", url: "/pages/articles/macromill-tsukaikata", category: "アンケート", date: "2026.07.31", thumbType: "earnings", excerpt: "マクロミルの特徴やアンケート配信の流れ、本調査に進むための考え方、ポイント交換の基本、正確に回答するための注意点を初心者向けに解説します。" },
    { title: "楽天インサイトの使い方!楽天ポイントをアンケートで貯める方法", url: "/pages/articles/rakuten-insight-tsukaikata", category: "アンケート", date: "2026.07.31", thumbType: "app", excerpt: "楽天インサイトの特徴やアンケート回答の流れ、楽天ポイントとして受け取る仕組み、回答時の注意点を初心者向けに解説します。" },
    { title: "infoQでポイ活する方法!アンケートと記事作成案件の見方", url: "/pages/articles/infoq-poikatsu", category: "アンケート", date: "2026.08.01", thumbType: "compare", excerpt: "infoQの主な貯め方やアンケート案件の基本、ライティング系案件の注意、交換先の確認、得意な案件に絞るコツを初心者向けに解説します。" },
    { title: "キューモニターでアンケートポイ活!初心者が知るべき使い方", url: "/pages/articles/cue-monitor-poikatsu", category: "アンケート", date: "2026.08.01", thumbType: "earnings", excerpt: "キューモニターの特徴やアンケートの種類、ポイント付与の流れ、回答品質で注意することを初心者向けに解説します。" },
    { title: "座談会・会場調査のポイ活とは?高単価案件に参加する前の注意点", url: "/pages/articles/zadankai-kaijouchousa-poikatsu", category: "アンケート", date: "2026.08.01", thumbType: "caution", excerpt: "座談会案件の特徴や会場調査の流れ、参加条件の確認方法、個人情報と交通費の注意を初心者向けに解説します。" },
    { title: "クレジットカード発行案件のポイ活術!申し込み前に確認すべきこと", url: "/pages/articles/creditcard-hakkou-anken-poikatsu", category: "クレジットカード", date: "2026.08.02", thumbType: "caution", excerpt: "カード発行案件の仕組みや年会費と利用条件の確認、信用情報への影響、複数申込みを避ける理由、作った後の管理方法を初心者向けに解説します。" },
    { title: "じゃらんでポイ活する方法!宿泊・遊び体験予約でポイントを貯めるコツ", url: "/pages/articles/jalan-tsukaikata", category: "キャンペーン", date: "2026.08.02", thumbType: "earnings", excerpt: "じゃらんのポイントの特徴や宿泊予約で貯める流れ、遊び体験予約の活用、クーポンとポイントの確認、旅行後に見直すことを初心者向けに解説します。" },
    { title: "マクドナルドでお得に買うポイ活術!アプリ・クーポン・支払いの基本", url: "/pages/articles/mcdonalds-poikatsu", category: "ショッピング", date: "2026.08.02", thumbType: "mobile", excerpt: "マクドナルドアプリの使い方やクーポン利用の注意、ポイントが貯まる支払い方法、モバイルオーダーの確認を初心者向けに解説します。" },
    { title: "証券口座開設案件でポイ活する方法!投資前提で注意したい基本", url: "/pages/articles/shouken-kouza-anken-poikatsu", category: "口座開設", date: "2026.08.03", thumbType: "caution", excerpt: "証券口座案件の特徴や開設だけと取引条件の違い、入金・取引条件の確認、投資リスクを分けて考える視点を初心者向けに解説します。" },
    { title: "一休.comでお得に予約する考え方!高級宿・レストラン利用時のポイント", url: "/pages/articles/ikkyu-poikatsu", category: "キャンペーン", date: "2026.08.03", thumbType: "campaign", excerpt: "一休.comの特徴や宿泊とレストラン予約の違い、ポイント即時利用の考え方、タイムセールの注意点を初心者向けに解説します。" },
    { title: "タクシーアプリでポイ活する方法!クーポンと決済ポイントの使い方", url: "/pages/articles/taxi-app-poikatsu", category: "アプリ案件", date: "2026.08.03", thumbType: "mobile", excerpt: "タクシーアプリの基本や初回クーポンの確認、決済方法で貯まるポイント、迎車料金の注意点を初心者向けに解説します。" },
    { title: "ANAマイレージモールの使い方!通販前にマイルを貯める経由術", url: "/pages/articles/ana-mileage-mall-poikatsu", category: "ショッピング", date: "2026.08.04", thumbType: "mile", excerpt: "ANAマイレージモールの仕組みや対象ショップの探し方、マイル付与条件の確認、他ポイントとの違いを初心者向けに解説します。" },
    { title: "FX口座案件のポイ活は注意が必要?高還元に飛びつく前の確認点", url: "/pages/articles/fx-kouza-anken-poikatsu", category: "口座開設", date: "2026.08.04", thumbType: "caution", excerpt: "FX案件が高還元になりやすい理由や取引条件の確認、損失リスクの考え方、初心者が避けたい使い方を初心者向けに解説します。" },
    { title: "牛丼チェーンでポイ活する方法!吉野家・すき家・松屋利用時の基本", url: "/pages/articles/gyudon-chain-poikatsu", category: "ショッピング", date: "2026.08.04", thumbType: "mobile", excerpt: "牛丼チェーンのポイント確認や公式アプリとクーポン、スマホ決済の使い分け、朝食・ランチ利用の注意点を初心者向けに解説します。" },
    { title: "ウエル活とは?ドラッグストアでポイントを活用する基本と注意点", url: "/pages/articles/welkatsu-poikatsu", category: "ショッピング", date: "2026.08.05", thumbType: "campaign", excerpt: "ウエル活の基本や対象日・対象ポイント、買うものリストの作り方、使いすぎを防ぐ注意点を初心者向けに解説します。" },
    { title: "暗号資産口座案件でポイ活する時の注意点!口座開設前に見るべき条件", url: "/pages/articles/kasoshisan-kouza-anken-poikatsu", category: "口座開設", date: "2026.08.05", thumbType: "compare", excerpt: "暗号資産口座案件の基本や本人確認と入金条件、価格変動リスクの確認、手数料と送金条件を初心者向けに解説します。" },
    { title: "ふるさと納税ポータルの選び方!ポイント重視で比較する時の注意点", url: "/pages/articles/furusato-portal-erabikata", category: "ショッピング", date: "2026.08.05", thumbType: "compare", excerpt: "ふるさと納税ポータルサイトごとの特徴やポイント還元を見る時の注意、返礼品だけで選ばない理由、控除上限額の確認を初心者向けに解説します。" },
    { title: "DMM株とは?少額投資・低手数料が魅力の株式投資アプリを解説", url: "/pages/articles/dmm-kabu-poikatsu", category: "口座開設", date: "2026.08.05", thumbType: "earnings", excerpt: "DMM株の特徴や手数料、少額投資への対応、口座開設の流れ、キャンペーン情報までを投資初心者向けにわかりやすく解説します。" },
    { title: "松井証券のiDeCo(イデコ)とは?手数料や商品ラインナップを解説", url: "/pages/articles/matsui-shouken-ideco-poikatsu", category: "口座開設", date: "2026.08.06", thumbType: "earnings", excerpt: "松井証券のiDeCoは運営管理手数料が0円で、eMAXIS Slimを含む低コスト商品40種類が揃うのが特徴。投信残高ポイントサービスの仕組みや申込方法までわかりやすく解説します。" },
    { title: "dポイント・d払いの貯め方|ポイントをもらう方法と使い方", url: "/pages/articles/dpoint-dharai-tamekata", category: "ショッピング", date: "2026.08.06", thumbType: "beginner", excerpt: "dポイントやd払いでポイントを貯める方法を初心者向けに解説。店舗、d払い、dカード、ネットサービスなど、主な貯め方と使い方、注意点をまとめています。" },
    { title: "楽天ポイントの貯め方|ポイントをもらう方法と使い方", url: "/pages/articles/rakuten-point-tamekata", category: "ショッピング", date: "2026.08.06", thumbType: "beginner", excerpt: "楽天ポイントの貯め方を初心者向けに解説。楽天市場、楽天ペイ、楽天カード、楽天ポイントカード加盟店など、主な貯め方と使い方、注意点をまとめています。" },
    { title: "PayPayポイントの貯め方|ポイントをもらう方法と使い方", url: "/pages/articles/paypay-point-tamekata", category: "ショッピング", date: "2026.08.06", thumbType: "beginner", excerpt: "PayPayポイントの貯め方を初心者向けに解説。PayPay決済、Yahoo!ショッピング、クレジットカード紐付けなど、主な貯め方と使い方、注意点をまとめています。" },
    { title: "Pontaポイントの貯め方|ポイントをもらう方法と使い方", url: "/pages/articles/ponta-tamekata", category: "ショッピング", date: "2026.08.06", thumbType: "beginner", excerpt: "Pontaポイントの貯め方を初心者向けに解説。ローソン、au PAY、リクルート系サービスなど、主な貯め方と使い方、注意点をまとめています。" },
    { title: "Vポイントの貯め方|ポイントをもらう方法と使い方", url: "/pages/articles/vpoint-tamekata", category: "ショッピング", date: "2026.08.06", thumbType: "beginner", excerpt: "Vポイントの貯め方を初心者向けに解説。提携店舗での提示、三井住友カードのタッチ決済、VポイントPayアプリなど、主な貯め方と使い方、注意点をまとめています。" },
    { title: "dポイントの使い方|そのまま使う・連携する・交換する完全ガイド", url: "/pages/articles/dpoint-tsukaikata", category: "ショッピング", date: "2026.08.07", thumbType: "summary", excerpt: "dポイントの使い方を徹底解説。街のお店やネットでそのまま使う方法、アカウント連携で使えるサービス、JALマイル・スターバックスカードへの交換方法を紹介します。" },
    { title: "楽天ポイントの使い方|そのまま使う・連携する・交換する完全ガイド", url: "/pages/articles/rakuten-point-tsukaikata", category: "ショッピング", date: "2026.08.27", thumbType: "summary", excerpt: "楽天ポイントの使い方を徹底解説。街のお店やネットでそのまま使う方法、アカウント連携で使えるサービス、ANAマイル・楽天Edyへの交換方法を紹介します。" },
    { title: "PayPayポイントの使い方|そのまま使う・連携する・交換する完全ガイド", url: "/pages/articles/paypay-point-tsukaikata", category: "ショッピング", date: "2026.08.09", thumbType: "summary", excerpt: "PayPayポイントの使い方を徹底解説。街のお店やネットでそのまま使う方法、アカウント連携で使えるサービス、Vポイントへの交換方法を紹介します。" },
    { title: "Pontaポイントの使い方|そのまま使う・連携する・交換する完全ガイド", url: "/pages/articles/ponta-tsukaikata", category: "ショッピング", date: "2026.08.09", thumbType: "summary", excerpt: "Pontaポイントの使い方を徹底解説。街のお店やau PAYでそのまま使う方法、アカウント連携で使えるサービス、JALマイル・ポイント運用への交換方法を紹介します。" },
    { title: "Vポイントの使い方|そのまま使う・連携する・交換する完全ガイド", url: "/pages/articles/vpoint-tsukaikata", category: "ショッピング", date: "2026.08.09", thumbType: "summary", excerpt: "Vポイントの使い方を徹底解説。提携店やVポイントPayアプリでそのまま使う方法、アカウント連携で使えるサービス、PayPayポイント・WAON POINT・ANAマイルへの交換方法を紹介します。" },
  ];

  function initSearchResults() {
    const listEl = document.getElementById("searchResultList");
    const countEl = document.getElementById("searchResultCount");
    const noResultEl = document.getElementById("searchNoResult");
    const titleEl = document.getElementById("searchResultTitle");
    const inputEl = document.getElementById("searchPageInput");
    if (!listEl || !countEl) return;

    const query = new URLSearchParams(window.location.search).get("q")?.trim() || "";
    if (inputEl) inputEl.value = query;

    if (titleEl) {
      titleEl.textContent = query ? `「${query}」の検索結果` : "検索結果";
    }

    if (!query) {
      countEl.textContent = "キーワードを入力して検索してください。";
      return;
    }

    const q = query.toLowerCase();
    const matches = ARTICLE_SEARCH_INDEX.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.excerpt.toLowerCase().includes(q)
    );

    countEl.innerHTML = `<strong>${matches.length}件</strong> 見つかりました`;

    if (matches.length === 0) {
      if (noResultEl) noResultEl.hidden = false;
      return;
    }

    listEl.innerHTML = matches.map((item) => `
      <a class="article-card" href="${item.url}" data-thumb-type="${item.thumbType}">
        <div class="article-card__thumb">
          <h3 class="article-card__title">${item.title}</h3>
        </div>
        <div class="article-card__body">
          <div class="article-card__meta">
            <span class="article-card__date">更新日:${item.date}</span>
          </div>
          <p class="article-card__excerpt">${item.excerpt}</p>
        </div>
      </a>
    `).join("");
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const root = document.body.dataset.root || "";
    await includeHTML("[data-include='header']", root + "includes/header.html");
    await includeHTML("[data-include='footer']", root + "includes/footer.html");
    initNavToggle();
    initFooterYear();
    initSlider();
    initRankingTabs();
    initRelatedOffers();
    initPopularArticles();
    initArticleFilter();
    initSearchResults();
    initArticleThumbTypes();
  });
})();
