// 記事HTMLの外部リンクを確認する(ASP・広告計測URLへの通信を防ぐ安全側の設計)。
//
// 単体実行: node scripts/check_external_links.js pages/articles/xxx.html [...]
//             … 外部リンクを抽出して分類するだけ。ネットワーク通信は一切しない(既定)
//           node scripts/check_external_links.js --network pages/articles/xxx.html [...]
//             … 許可リスト(scripts/external_link_allowlist.json)にある公式ドメインのURLだけHTTPで確認する
//
// 方針:
//  - 通信は既定で禁止。許可リストにあるホストだけを確認し、それ以外(ASP・広告・計測・短縮URL・分類できないURL)は通信しない
//  - rel に sponsored / nofollow があるリンク、ASP・計測ホスト、計測用パラメータ付きのURLは、許可リストより先に除外する
//  - リダイレクトは自動で追わない(redirect: "manual")。転送先も毎回同じ判定をし、許可されたホストだけ次に進む
//  - 通信しなかったURLは「未確認」として件数を出す。外部リンクすべての200をPASSの条件にはしない
// テスト: node scripts/test_check_external_links.js(実際の通信なし。fetch をモックに差し替えて検証)
const fs = require("fs");
const path = require("path");

const ALLOWLIST_FILE = path.join(__dirname, "external_link_allowlist.json");

// ASP・広告配信・計測のホスト(許可リストより優先して除外)
const DENY_HOST_PATTERNS = [
  /(^|\.)a8\.net$/i,
  /(^|\.)trafficgate\.net$/i,
  /(^|\.)accesstrade\.net$/i,
  /(^|\.)valuecommerce\.(com|ne\.jp)$/i,
  /(^|\.)moshimo\.com$/i,
  /(^|\.)afi-b\.com$/i,
  /(^|\.)rentracks\.jp$/i,
  /(^|\.)felmat\.net$/i,
  /(^|\.)j-a-net\.jp$/i,
  /(^|\.)linksynergy\.com$/i,
  /(^|\.)tcs-asp\.net$/i,
  /(^|\.)atcampaign\.net$/i,
  /(^|\.)amazon-adsystem\.com$/i,
  /(^|\.)doubleclick\.net$/i,
  /(^|\.)googleadservices\.com$/i,
  /^hb\.afl\.rakuten\.co\.jp$/i,
  /affiliate/i,
  // ad. / ad2. / ads. / track. / click. / tr. など、計測・リダイレクト用によく使われるサブドメイン
  /^(ad|ads|adv|adserver|track|tracking|trk|click|clk|tr|redirect|aff|afl)[0-9]*\./i,
];
// 短縮URL(転送先が分からないため通信しない)
const SHORTENER_HOSTS = new Set(["amzn.to", "bit.ly", "t.co", "goo.gl", "tinyurl.com", "ow.ly", "buff.ly", "is.gd", "rebrand.ly", "x.gd", "cutt.ly"]);
// 計測・アフィリエイト用のクエリパラメータ(公式ドメインでも、付いていれば通信しない)
const TRACKING_PARAMS = /^(a8mat|tag|linkcode|linkid|ascsubtag|vc_url|aff_id|affid|afid|aid|clickid|click_id|irclickid|ranmid|raneaid|ransiteid)$/i;
// ASPのリダイレクタによくあるパス
const DENY_PATH_PATTERNS = [/\/svt\/ejp/i, /^\/t\/r\//i, /^\/cl\//i];

// 公式情報の確認に使うホストの許可リスト(先頭が "." の項目はそのドメインのサブドメインも許可)
function loadAllowlist(file = ALLOWLIST_FILE) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return data.hosts;
}
function isAllowedHost(host, allow) {
  host = host.toLowerCase();
  return allow.some((a) => (a.startsWith(".") ? host === a.slice(1) || host.endsWith(a) : host === a));
}

// 1つのURLを分類する(ネットワーク通信なし)。戻り値の kind: "allowed" | "blocked" | "unknown"
function classify(url, rel, allow) {
  let u;
  try { u = new URL(url); } catch { return { kind: "unknown", reason: "URLとして解釈できない" }; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return { kind: "unknown", reason: "http(s)以外" };
  if (rel && /\b(sponsored|nofollow)\b/i.test(rel)) return { kind: "blocked", reason: `rel="${rel}"` };
  const host = u.hostname.toLowerCase();
  if (DENY_HOST_PATTERNS.some((re) => re.test(host))) return { kind: "blocked", reason: "ASP・広告・計測のホスト" };
  if (SHORTENER_HOSTS.has(host)) return { kind: "blocked", reason: "短縮URL" };
  for (const k of u.searchParams.keys()) if (TRACKING_PARAMS.test(k)) return { kind: "blocked", reason: `計測パラメータ ${k}` };
  if (DENY_PATH_PATTERNS.some((re) => re.test(u.pathname))) return { kind: "blocked", reason: "ASPのリダイレクタのパス" };
  if (isAllowedHost(host, allow)) return { kind: "allowed", reason: "許可リスト" };
  return { kind: "unknown", reason: "許可リストにないホスト" };
}

// HTMLから外部リンク(<a href="http...">)を静的に抽出する(ネットワーク通信なし)
function extractLinks(html) {
  const out = [];
  const seen = new Set();
  for (const m of html.matchAll(/<a\b([^>]*)>/gi)) {
    const attrs = m[1];
    const href = (attrs.match(/\bhref\s*=\s*"([^"]*)"/i) || [])[1];
    if (!href || !/^https?:\/\//i.test(href)) continue;
    const rel = (attrs.match(/\brel\s*=\s*"([^"]*)"/i) || [])[1] || "";
    const url = href.replace(/&amp;/g, "&");
    const key = url + "\u0000" + rel;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ url, rel });
  }
  return out;
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";
// 許可されたURLだけを確認する。リダイレクトは1回ずつ判定し、許可されない転送先には進まない
async function checkUrl(url, { allow, fetchImpl = globalThis.fetch, maxHops = 5, timeoutMs = 30000 } = {}) {
  let current = url;
  const hops = [];
  for (let i = 0; i <= maxHops; i++) {
    const c = classify(current, "", allow);
    if (c.kind !== "allowed") {
      return i === 0
        ? { status: "UNCHECKED", detail: c.reason, hops }
        : { status: "REDIRECT_STOPPED", detail: `転送先に通信しない(${c.reason}): ${current}`, hops };
    }
    let res;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      res = await fetchImpl(current, { method: "GET", redirect: "manual", signal: ctrl.signal, headers: { "User-Agent": UA, "Accept-Language": "ja-JP" } });
    } catch (e) {
      return { status: "ERROR", detail: String(e && e.message || e), hops };
    } finally {
      clearTimeout(timer);
    }
    try { if (res.body && typeof res.body.cancel === "function") await res.body.cancel(); } catch { /* 本文は読まない */ }
    hops.push(`${res.status} ${current}`);
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers && typeof res.headers.get === "function" ? res.headers.get("location") : null;
      if (!loc) return { status: "FAIL", detail: `${res.status} でLocationなし`, hops };
      current = new URL(loc, current).toString();
      continue;
    }
    if (res.status >= 200 && res.status < 300) return { status: "OK", detail: String(res.status), hops };
    if ([401, 403, 429, 503].includes(res.status)) return { status: "REFUSED", detail: `${res.status}(サーバーが拒否。ページの有無は未確認)`, hops };
    return { status: "FAIL", detail: String(res.status), hops };
  }
  return { status: "FAIL", detail: `リダイレクトが${maxHops}回を超えた`, hops };
}

async function run(files, { network = false, allow = loadAllowlist(), fetchImpl = globalThis.fetch, log = console.log } = {}) {
  const results = [];
  for (const f of files) {
    const html = fs.readFileSync(f, "utf8");
    for (const { url, rel } of extractLinks(html)) {
      const c = classify(url, rel, allow);
      let r;
      if (c.kind !== "allowed") r = { status: c.kind === "blocked" ? "BLOCKED" : "UNCHECKED", detail: c.reason };
      else if (!network) r = { status: "NOT_RUN", detail: "通信なしモード(--network で確認)" };
      else r = await checkUrl(url, { allow, fetchImpl });
      results.push({ file: f, url, ...r });
      log(`${r.status.padEnd(16)} ${url}  [${r.detail}]`);
    }
  }
  const count = (s) => results.filter((r) => r.status === s).length;
  const unchecked = results.length - count("OK") - count("FAIL");
  log(`\n外部リンク ${results.length}件: OK ${count("OK")} / FAIL ${count("FAIL")} / 未確認 ${unchecked}(BLOCKED ${count("BLOCKED")}・UNCHECKED ${count("UNCHECKED")}・REFUSED ${count("REFUSED")}・REDIRECT_STOPPED ${count("REDIRECT_STOPPED")}・ERROR ${count("ERROR")}・NOT_RUN ${count("NOT_RUN")})`);
  log(network ? "通信したのは許可リストにある公式ホストだけです。未確認のURLはPASS扱いにしていません。" : "ネットワーク通信は行っていません。");
  return results;
}

module.exports = { classify, extractLinks, checkUrl, run, loadAllowlist, isAllowedHost };

if (require.main === module) {
  const args = process.argv.slice(2);
  const network = args.includes("--network");
  const files = args.filter((a) => a !== "--network");
  if (!files.length) { console.error("使い方: node scripts/check_external_links.js [--network] <html>..."); process.exit(2); }
  run(files, { network }).then((res) => { process.exitCode = res.some((r) => r.status === "FAIL") ? 1 : 0; });
}
