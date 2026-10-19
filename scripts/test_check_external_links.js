// scripts/check_external_links.js のオフラインテスト。実際のネットワーク通信は行わない
// (globalThis.fetch を「呼ばれたら失敗する」スタブに差し替え、HTTPの応答はモックで返す)。
// 単体実行: node scripts/test_check_external_links.js
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

// 通信が1回でも起きたら失敗させる
const realFetch = globalThis.fetch;
globalThis.fetch = () => { throw new Error("テスト中に実際のfetchが呼ばれた"); };

const { classify, extractLinks, checkUrl, run } = require("./check_external_links");
const allow = ["value-advance.com", "point.rakuten.co.jp", "www.amazon.co.jp", ".example-official.jp"];

// 応答を返すだけのモック。呼ばれたURLを記録する
function mockFetch(table) {
  const calls = [];
  const fn = async (url, opts) => {
    calls.push(url);
    assert.strictEqual(opts.redirect, "manual", "リダイレクトを自動で追わない設定になっていない");
    const r = table[url];
    if (!r) throw new Error("モックに無いURLへ通信しようとした: " + url);
    return { status: r.status, headers: { get: (k) => (k.toLowerCase() === "location" ? r.location || null : null) }, body: null };
  };
  fn.calls = calls;
  return fn;
}

let n = 0;
const test = async (name, f) => { await f(); n++; console.log("ok -", name); };

(async () => {
  await test("ad2.trafficgate.net は除外", () => assert.strictEqual(classify("https://ad2.trafficgate.net/t/r/948/1396/1_1", "", allow).kind, "blocked"));
  await test("ad.trafficgate.net は除外", () => assert.strictEqual(classify("https://ad.trafficgate.net/t/r/1", "", allow).kind, "blocked"));
  await test("未登録の広告用ホスト(ad7./track./click.)は除外", () => {
    for (const u of ["https://ad7.unknown-asp.example/x", "https://track.new-asp.example/x", "https://click.new-asp.example/x"]) assert.strictEqual(classify(u, "", allow).kind, "blocked", u);
  });
  await test("許可リストにない普通のホストは通信対象にしない(unknown)", () => assert.strictEqual(classify("https://www.new-asp.example/p", "", allow).kind, "unknown"));
  await test("許可ドメインでも計測パラメータ付きは除外(Amazonのtag・A8のa8mat)", () => {
    assert.strictEqual(classify("https://www.amazon.co.jp/?&linkCode=ll2&tag=xxxx-22", "", allow).kind, "blocked");
    assert.strictEqual(classify("https://point.rakuten.co.jp/?a8mat=ABC", "", allow).kind, "blocked");
  });
  await test("rel=sponsored / nofollow は許可ドメインでも除外", () => {
    assert.strictEqual(classify("https://point.rakuten.co.jp/", "noopener sponsored", allow).kind, "blocked");
    assert.strictEqual(classify("https://point.rakuten.co.jp/", "nofollow", allow).kind, "blocked");
  });
  await test("短縮URLは除外", () => assert.strictEqual(classify("https://amzn.to/abc", "", allow).kind, "blocked"));
  await test("サブドメイン許可(.example-official.jp)は本体とサブドメインだけ", () => {
    assert.strictEqual(classify("https://www.example-official.jp/", "", allow).kind, "allowed");
    assert.strictEqual(classify("https://example-official.jp/", "", allow).kind, "allowed");
    assert.strictEqual(classify("https://evil-example-official.jp/", "", allow).kind, "unknown");
  });
  await test("抽出はHTMLの静的解析だけ(rel付き・&amp;の復元・重複除去)", () => {
    const html = '<a href="https://ad2.trafficgate.net/t/r/1" rel="noopener sponsored">x</a><a href="https://point.rakuten.co.jp/?a=1&amp;b=2">y</a><a href="https://point.rakuten.co.jp/?a=1&amp;b=2">y</a><a href="rakuten-point-tamekata">z</a>';
    const links = extractLinks(html);
    assert.deepStrictEqual(links, [{ url: "https://ad2.trafficgate.net/t/r/1", rel: "noopener sponsored" }, { url: "https://point.rakuten.co.jp/?a=1&b=2", rel: "" }]);
  });
  await test("許可された公式URLが200ならOK", async () => {
    const f = mockFetch({ "https://point.rakuten.co.jp/": { status: 200 } });
    assert.strictEqual((await checkUrl("https://point.rakuten.co.jp/", { allow, fetchImpl: f })).status, "OK");
    assert.deepStrictEqual(f.calls, ["https://point.rakuten.co.jp/"]);
  });
  await test("公式ページがASPへ302転送しても追跡しない", async () => {
    const f = mockFetch({ "https://point.rakuten.co.jp/go": { status: 302, location: "https://ad2.trafficgate.net/t/r/9" } });
    const r = await checkUrl("https://point.rakuten.co.jp/go", { allow, fetchImpl: f });
    assert.strictEqual(r.status, "REDIRECT_STOPPED");
    assert.deepStrictEqual(f.calls, ["https://point.rakuten.co.jp/go"], "転送先へ通信している");
  });
  await test("許可されないホストへの転送も追跡しない", async () => {
    const f = mockFetch({ "https://point.rakuten.co.jp/x": { status: 301, location: "https://www.unknown.example/y" } });
    assert.strictEqual((await checkUrl("https://point.rakuten.co.jp/x", { allow, fetchImpl: f })).status, "REDIRECT_STOPPED");
    assert.strictEqual(f.calls.length, 1);
  });
  await test("許可ホスト内の転送は1回ずつ判定して進む", async () => {
    const f = mockFetch({ "https://point.rakuten.co.jp/a": { status: 301, location: "/b" }, "https://point.rakuten.co.jp/b": { status: 200 } });
    const r = await checkUrl("https://point.rakuten.co.jp/a", { allow, fetchImpl: f });
    assert.strictEqual(r.status, "OK");
    assert.deepStrictEqual(f.calls, ["https://point.rakuten.co.jp/a", "https://point.rakuten.co.jp/b"]);
  });
  await test("403は未確認(REFUSED)、404はFAIL", async () => {
    const f = mockFetch({ "https://point.rakuten.co.jp/403": { status: 403 }, "https://point.rakuten.co.jp/404": { status: 404 } });
    assert.strictEqual((await checkUrl("https://point.rakuten.co.jp/403", { allow, fetchImpl: f })).status, "REFUSED");
    assert.strictEqual((await checkUrl("https://point.rakuten.co.jp/404", { allow, fetchImpl: f })).status, "FAIL");
  });
  await test("許可されていないURLはcheckUrlでも通信しない", async () => {
    const f = mockFetch({});
    assert.strictEqual((await checkUrl("https://ad2.trafficgate.net/t/r/1", { allow, fetchImpl: f })).status, "UNCHECKED");
    assert.strictEqual((await checkUrl("https://www.unknown.example/", { allow, fetchImpl: f })).status, "UNCHECKED");
    assert.strictEqual(f.calls.length, 0);
  });
  await test("一覧の作成(通信なしモード)ではfetchを一度も呼ばない", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "extlink-"));
    const file = path.join(dir, "a.html");
    fs.writeFileSync(file, '<a href="https://ad2.trafficgate.net/t/r/1" rel="sponsored">x</a><a href="https://point.rakuten.co.jp/">y</a><a href="https://www.unknown.example/">z</a>');
    const res = await run([file], { network: false, allow, log: () => {} });
    assert.deepStrictEqual(res.map((r) => r.status), ["BLOCKED", "NOT_RUN", "UNCHECKED"]);
    fs.rmSync(dir, { recursive: true, force: true });
  });
  await test("通信ありモードでも、モックに渡るのは許可された公式URLだけ", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "extlink-"));
    const file = path.join(dir, "b.html");
    fs.writeFileSync(file, '<a href="https://ad2.trafficgate.net/t/r/1" rel="noopener sponsored">x</a><a href="https://px.a8.net/svt/ejp?a8mat=1" rel="nofollow">x</a><a href="https://point.rakuten.co.jp/">y</a><a href="https://www.amazon.co.jp/?tag=a-22">z</a><a href="https://www.unknown.example/">w</a>');
    const f = mockFetch({ "https://point.rakuten.co.jp/": { status: 200 } });
    const res = await run([file], { network: true, allow, fetchImpl: f, log: () => {} });
    assert.deepStrictEqual(f.calls, ["https://point.rakuten.co.jp/"]);
    assert.deepStrictEqual(res.map((r) => r.status), ["BLOCKED", "BLOCKED", "OK", "BLOCKED", "UNCHECKED"]);
    fs.rmSync(dir, { recursive: true, force: true });
  });
  console.log(`\n${n}件のテストがすべて成功しました(実際のネットワーク通信なし)。`);
  globalThis.fetch = realFetch;
})().catch((e) => { console.error("FAIL:", e.message); process.exitCode = 1; });
