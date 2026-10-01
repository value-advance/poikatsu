// サイトマップの監査。generate_sitemap.js を実行して repo に書き込む代わりに、
// 「今 repo に保存されているサイトマップ」を、実データから生成した「あるべき内容」と
// 突き合わせ、さらに掲載URLの正しさ(重複・リダイレクト・noindex・canonical・lastmod など)を検証する。
// ズレがあれば、CIを含めFAILさせる(このスクリプト自身はファイルを一切書き換えない)。
//
// 単体実行: node scripts/audit_sitemap.js
//           node scripts/audit_sitemap.js --live   … 本番(value-advance.com)でも確認する
//             (サイトマップ各ファイルのHTTP 200・Content-Type、リダイレクト元の301とLocation、
//              掲載URLすべてのHTTP 200。外部へのHTTPアクセスを行うため既定ではオフ)
// audit_articles.js からは runSitemapAudit() として呼び出される(オフラインの検査のみ)。
const fs = require("fs");
const path = require("path");
const {
  root,
  SITE_ORIGIN,
  listArticles,
  listCategories,
  listTopLevelPages,
  listBeginnerPages,
  readArticleHubPage,
  readHomePage,
  normalizePathKey,
  dotDateToDash,
} = require("./lib/site-data");
const {
  SITEMAP_FILES,
  BUCKETS,
  normalizeEol,
  validateSitemapXml,
  buildSitemaps,
  exclusionReason,
  parseSitemapIndexXml,
  parseUrlsetXml,
  listManagedSitemapFilesOnDisk,
} = require("./lib/sitemap");

function readFileIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
}

// サイト内のHTMLファイル(リダイレクト元への内部リンク残りの検査用)。
function listSiteHtmlFiles() {
  const out = [];
  const walk = dir => {
    for (const name of fs.readdirSync(dir)) {
      if (name === ".git" || name === "node_modules" || name === "scripts" || name === "reports") continue;
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (name.endsWith(".html")) out.push(p);
    }
  };
  walk(root);
  return out;
}

// HTMLファイル内の href を、サイト内のパスに解決する(外部URL・mailto等は除外)。
function resolveInternalHrefs(absFile, content) {
  const rel = path.relative(root, absFile).split(path.sep).join("/");
  // そのHTMLが配信されるURLのディレクトリ(相対パス解決の基準)。includes/ の部品はルート基準で使われる。
  const baseDir = rel.startsWith("includes/") ? "/" : "/" + path.posix.dirname(rel).replace(/^\.$/, "") + "/";
  const hrefs = [];
  for (const m of content.matchAll(/href="([^"]*)"/g)) {
    const raw = m[1].trim();
    if (!raw || raw.startsWith("#") || /^(mailto:|tel:|javascript:|data:)/i.test(raw)) continue;
    if (/^\/\//.test(raw)) continue; // プロトコル相対(外部ASPなど)
    let p;
    if (/^https?:\/\//i.test(raw)) {
      if (!/^https?:\/\/(www\.)?value-advance\.com/i.test(raw)) continue;
      p = raw;
    } else if (raw.startsWith("/")) p = raw;
    else p = path.posix.resolve(baseDir.replace(/\/\/+/g, "/"), raw.replace(/[?#].*$/, ""));
    hrefs.push(normalizePathKey(p));
  }
  return hrefs;
}

function runSitemapAudit() {
  const problems = [];
  const note = (label, count, extra) => {
    console.log(`${label}: ${count}${extra ? "  " + extra : ""}`);
    return count === 0;
  };
  const summary = {};

  console.log("=== SITEMAP AUDIT ===");

  // --- 1. 「生成忘れ」検出: 実データから今生成した内容と、repoに保存されている内容が一致しているか。
  //         改行コード(CRLF/LF)の違いだけでは不一致にしない。
  const expected = buildSitemaps();
  const expectedNames = Object.keys(expected.files);
  const onDisk = {};
  const missingFiles = [];
  for (const fileName of expectedNames) {
    const content = readFileIfExists(path.join(root, fileName));
    onDisk[fileName] = content;
    if (content === null) missingFiles.push(fileName);
  }
  const staleFiles = expectedNames.filter(f => onDisk[f] !== null && normalizeEol(onDisk[f]) !== expected.files[f]);
  const orphanFiles = listManagedSitemapFilesOnDisk().filter(f => !expectedNames.includes(f));
  const generationOk = missingFiles.length === 0 && staleFiles.length === 0 && orphanFiles.length === 0;
  console.log("");
  console.log("生成内容とrepo保存内容の一致:", generationOk ? "PASS" : "FAIL");
  if (!generationOk) {
    console.error("ERROR: サイトマップが最新状態ではありません。実行してください:  node scripts/generate_sitemap.js");
    if (missingFiles.length) console.error("  存在しないファイル:", missingFiles.join(", "));
    if (staleFiles.length) console.error("  差分があるファイル:", staleFiles.join(", "));
    if (orphanFiles.length) console.error("  どこからも参照されない古いサイトマップファイル:", orphanFiles.join(", "));
  }
  problems.push(!generationOk);

  // --- 2. XML妥当性(repoに実際に保存されている中身を検証する) -----------------
  console.log("");
  let xmlOk = true;
  for (const fileName of expectedNames) {
    const errors = validateSitemapXml(onDisk[fileName]);
    if (errors.length) {
      xmlOk = false;
      console.log(`XML不正: ${fileName}`);
      errors.slice(0, 10).forEach(e => console.log("  - " + e));
    }
  }
  console.log("サイトマップXML:", xmlOk ? "PASS" : "FAIL");
  problems.push(!xmlOk);
  if (missingFiles.length || !xmlOk) {
    console.log("\nFAIL: サイトマップファイルが存在しないか、XMLとして不正です。");
    return false;
  }

  // --- 3. sitemap.xml(サイトマップインデックス)が子サイトマップを正しく参照しているか ----
  const index = parseSitemapIndexXml(normalizeEol(onDisk[SITEMAP_FILES.index]));
  const expectedChildLocs = expected.children.map(c => c.loc);
  const indexLocsOk = JSON.stringify(index.map(c => c.loc)) === JSON.stringify(expectedChildLocs);
  const indexLastmodMissing = index.filter(c => !c.lastmod).map(c => c.loc);
  const entriesByBucket = { articles: [], categories: [], pages: [] };
  const childLastmodTooOld = [];
  for (const child of expected.children) {
    const entries = parseUrlsetXml(normalizeEol(onDisk[child.fileName]));
    entriesByBucket[child.bucket].push(...entries.map(e => ({ ...e, fileName: child.fileName })));
    const maxEntry = entries.map(e => e.lastmod).filter(Boolean).sort().pop() || null;
    const indexChild = index.find(c => c.loc === child.loc);
    if (indexChild && indexChild.lastmod && maxEntry && indexChild.lastmod < maxEntry) childLastmodTooOld.push(`${child.fileName}(${indexChild.lastmod} < ${maxEntry})`);
  }
  const allEntries = BUCKETS.flatMap(b => entriesByBucket[b]);
  console.log("");
  console.log("サイトマップ掲載URL総数:", allEntries.length);
  console.log("  記事URL数:", entriesByBucket.articles.length);
  console.log("  カテゴリURL数:", entriesByBucket.categories.length);
  console.log("  その他URL数:", entriesByBucket.pages.length);
  console.log("sitemap.xml(インデックス)の参照先:", indexLocsOk ? "PASS" : "FAIL", indexLocsOk ? "" : JSON.stringify(index.map(c => c.loc)));
  problems.push(!indexLocsOk);
  problems.push(!note("sitemap.xmlのlastmod欠落", indexLastmodMissing.length, indexLastmodMissing.length ? JSON.stringify(indexLastmodMissing) : ""));
  problems.push(!note("sitemap.xmlのlastmodが子サイトマップの最新URLより古い", childLastmodTooOld.length, childLastmodTooOld.join(", ")));

  // --- 4. URL重複(完全一致・表記ゆれ: .html有無 / 末尾スラッシュ / index.html / http・www) ------
  const locCounts = {};
  allEntries.forEach(e => { locCounts[e.loc] = (locCounts[e.loc] || 0) + 1; });
  const dupeLocs = Object.entries(locCounts).filter(([, c]) => c > 1).map(([loc]) => loc);
  const keyToLocs = {};
  allEntries.forEach(e => { (keyToLocs[normalizePathKey(e.loc)] = keyToLocs[normalizePathKey(e.loc)] || new Set()).add(e.loc); });
  const variantDupes = Object.entries(keyToLocs).filter(([, s]) => s.size > 1).map(([k, s]) => `${k}: ${[...s].join(" | ")}`);
  console.log("");
  problems.push(!note("URL重複(完全一致)", dupeLocs.length, dupeLocs.length ? JSON.stringify(dupeLocs) : ""));
  problems.push(!note("URL重複(表記ゆれ: .html・末尾スラッシュ・index.html・http/www)", variantDupes.length, variantDupes.join(", ")));
  summary.duplicate = dupeLocs.length + variantDupes.length;

  // --- 5. URLの正規化(HTTPS・wwwなし・自ドメイン・.htmlなし・index.htmlなし・クエリ/フラグメントなし) ----
  const nonHttps = allEntries.filter(e => !e.loc.startsWith("https://"));
  const www = allEntries.filter(e => /^https?:\/\/www\./i.test(e.loc));
  const otherDomain = allEntries.filter(e => e.loc.startsWith("https://") && !/^https?:\/\/www\./i.test(e.loc) && !e.loc.startsWith(SITE_ORIGIN + "/"));
  const htmlSuffixed = allEntries.filter(e => /\.html$/i.test(e.loc));
  const indexHtml = allEntries.filter(e => /\/index\.html?$/i.test(e.loc));
  const withQueryOrFragment = allEntries.filter(e => e.loc.includes("?") || e.loc.includes("#"));
  problems.push(!note("非HTTPS URL", nonHttps.length, nonHttps.length ? JSON.stringify(nonHttps.map(e => e.loc)) : ""));
  problems.push(!note("www付きURL", www.length, www.length ? JSON.stringify(www.map(e => e.loc)) : ""));
  problems.push(!note("別ドメインURL", otherDomain.length, otherDomain.length ? JSON.stringify(otherDomain.map(e => e.loc)) : ""));
  problems.push(!note(".html付きURL", htmlSuffixed.length, htmlSuffixed.length ? JSON.stringify(htmlSuffixed.map(e => e.loc)) : ""));
  problems.push(!note("index.html付きURL", indexHtml.length, indexHtml.length ? JSON.stringify(indexHtml.map(e => e.loc)) : ""));
  problems.push(!note("クエリ/フラグメント付きURL", withQueryOrFragment.length, withQueryOrFragment.length ? JSON.stringify(withQueryOrFragment.map(e => e.loc)) : ""));

  // --- 6. 実ページとの突き合わせ(canonical・noindex・掲載漏れ・存在しないURL・lastmod) -------
  const articles = listArticles();
  const sources = [
    ...articles.map(p => ({ ...p, bucket: "articles" })),
    ...listCategories().map(p => ({ ...p, bucket: "categories" })),
    ...listTopLevelPages().map(p => ({ ...p, bucket: "pages" })),
    ...listBeginnerPages().map(p => ({ ...p, bucket: "pages" })),
    ...["index.html", "new.html", "updated.html"].map(f => ({ ...readArticleHubPage(f), bucket: "pages", computedLastmod: true })),
    { ...readHomePage(), bucket: "pages", computedLastmod: true },
  ];
  const redirectKeys = new Set(expected.redirects.map(r => r.sourceKey));
  const sourceByKey = {};
  sources.forEach(s => { sourceByKey[normalizePathKey(s.expectedCanonical)] = s; });
  const entryByKey = {};
  allEntries.forEach(e => { entryByKey[normalizePathKey(e.loc)] = e; });

  const canonicalMismatches = [];
  const noindexIncluded = [];
  const missing = [];
  const wrongBucket = [];
  const lastmodMismatches = [];
  for (const s of sources) {
    const key = normalizePathKey(s.expectedCanonical);
    const entry = entryByKey[key];
    const reason = exclusionReason(s, redirectKeys);
    if (reason === "canonicalなし" || reason === "canonicalが別URL") canonicalMismatches.push(`${s.file} → ${s.canonical || "(なし)"}`);
    if (s.noindex && entry) noindexIncluded.push(s.file);
    if (reason === null) {
      if (!entry) missing.push(s.file);
      else {
        if (!entriesByBucket[s.bucket].includes(entry)) wrongBucket.push(`${s.file}(${s.bucket}以外のサイトマップに掲載)`);
        if (entry.loc !== s.expectedCanonical) canonicalMismatches.push(`${s.file}: sitemap=${entry.loc} canonical=${s.canonical}`);
        if (!s.computedLastmod && (entry.lastmod || null) !== (s.lastmod || null)) lastmodMismatches.push(`${s.file}: sitemap=${entry.lastmod || "(なし)"} 表示日付=${s.lastmod || "(なし)"}`);
      }
    }
  }
  // 記事一覧・新着・更新一覧・トップページのlastmodは掲載記事の日付から計算されるため、生成ロジックの結果と比較する。
  const expectedPages = parseUrlsetXml(expected.files[SITEMAP_FILES.pages]);
  for (const s of sources.filter(x => x.computedLastmod)) {
    const e = entryByKey[normalizePathKey(s.expectedCanonical)];
    const ex = expectedPages.find(x => normalizePathKey(x.loc) === normalizePathKey(s.expectedCanonical));
    if (e && ex && e.lastmod !== ex.lastmod) lastmodMismatches.push(`${s.file}: sitemap=${e.lastmod} 期待値=${ex.lastmod}`);
  }
  // 記事の Article 構造化データ(datePublished / dateModified)と表示日付の一致。
  const jsonLdMismatches = [];
  for (const a of articles) {
    for (const d of a.jsonLdDates || []) {
      if (d.parseError) { jsonLdMismatches.push(`${a.slug}: JSON-LDが解析できない`); continue; }
      if (d.dateModified && d.dateModified.slice(0, 10) !== a.lastmod) jsonLdMismatches.push(`${a.slug}: dateModified=${d.dateModified} 表示=${a.lastmod}`);
      if (d.datePublished && d.datePublished.slice(0, 10) !== dotDateToDash(a.created)) jsonLdMismatches.push(`${a.slug}: datePublished=${d.datePublished} 表示=${dotDateToDash(a.created)}`);
    }
  }
  // サイトマップにあるのに、対応する実ファイルが無いURL(削除済み・統合済みの残り=404の疑い)。
  const broken = allEntries.filter(e => !sourceByKey[normalizePathKey(e.loc)]).map(e => e.loc);

  console.log("");
  problems.push(!note("canonical不一致(自己参照でないページ)", canonicalMismatches.length, canonicalMismatches.join(", ")));
  problems.push(!note("noindex URL混入", noindexIncluded.length, noindexIncluded.join(", ")));
  problems.push(!note("インデックス対象ページのサイトマップ掲載漏れ", missing.length, missing.join(", ")));
  problems.push(!note("別の種類のサイトマップに掲載", wrongBucket.length, wrongBucket.join(", ")));
  problems.push(!note("lastmod不一致(表示日付・計算値)", lastmodMismatches.length, lastmodMismatches.join(", ")));
  problems.push(!note("記事の構造化データ(datePublished/dateModified)と表示日付の不一致", jsonLdMismatches.length, jsonLdMismatches.join(", ")));
  problems.push(!note("実ファイルが無いURL(削除・統合済みの残り/404の疑い)", broken.length, broken.join(", ")));
  summary.canonical = canonicalMismatches.length;
  summary.noindex = noindexIncluded.length;
  summary.missing = missing.length;
  summary.lastmod = lastmodMismatches.length + jsonLdMismatches.length;
  summary.broken = broken.length;

  // --- 7. リダイレクト(scripts/redirects.json = Amplifyの301の記録) -------------------------
  const redirectInSitemap = [];
  const redirectTargetMissing = [];
  const redirectChains = [];
  const redirectSourceFiles = [];
  for (const r of expected.redirects) {
    if (entryByKey[r.sourceKey]) redirectInSitemap.push(entryByKey[r.sourceKey].loc);
    if (!entryByKey[r.targetKey]) redirectTargetMissing.push(`${r.source} → ${r.target}`);
    if (redirectKeys.has(r.targetKey)) redirectChains.push(`${r.source} → ${r.target}`);
    if (sourceByKey[r.sourceKey]) redirectSourceFiles.push(sourceByKey[r.sourceKey].file);
  }
  // サイト内HTMLにリダイレクト元への内部リンクが残っていないか(main.jsのURLデータも対象)。
  const linksToRedirects = [];
  if (redirectKeys.size) {
    for (const f of listSiteHtmlFiles()) {
      const content = fs.readFileSync(f, "utf8");
      for (const key of resolveInternalHrefs(f, content)) {
        if (redirectKeys.has(key)) linksToRedirects.push(`${path.relative(root, f).split(path.sep).join("/")} → ${key}`);
      }
    }
    const mainJs = readFileIfExists(path.join(root, "js", "main.js")) || "";
    for (const r of expected.redirects) {
      const slug = r.sourceKey.split("/").pop();
      if (mainJs.includes(`"${r.sourceKey}"`) || mainJs.includes(`"${slug}"`)) linksToRedirects.push(`js/main.js → ${r.sourceKey}`);
    }
  }
  console.log("");
  console.log("リダイレクト元(scripts/redirects.json):", expected.redirects.length ? expected.redirects.map(r => `${r.source} → ${r.target}`).join(", ") : "なし");
  problems.push(!note("リダイレクト元URLの混入", redirectInSitemap.length, redirectInSitemap.join(", ")));
  problems.push(!note("リダイレクト先のサイトマップ掲載漏れ", redirectTargetMissing.length, redirectTargetMissing.join(", ")));
  problems.push(!note("リダイレクトチェーン(リダイレクト先がさらにリダイレクト元)", redirectChains.length, redirectChains.join(", ")));
  problems.push(!note("リダイレクト元への内部リンク残り", linksToRedirects.length, linksToRedirects.join(", ")));
  if (redirectSourceFiles.length) console.log(`  注意: リダイレクト元のHTMLファイルが残っています(サイトマップからは除外済み): ${redirectSourceFiles.join(", ")}`);
  summary.redirect = redirectInSitemap.length + redirectChains.length;

  // --- 8. HTMLサイトマップ(ユーザー向け)に載せている重要ページがXMLから漏れていないか -------
  const htmlSitemapPath = path.join(root, "pages", "sitemap.html");
  const htmlSitemapMissing = [];
  if (fs.existsSync(htmlSitemapPath)) {
    for (const key of new Set(resolveInternalHrefs(htmlSitemapPath, fs.readFileSync(htmlSitemapPath, "utf8")))) {
      const s = sourceByKey[key];
      if (s && exclusionReason(s, redirectKeys) === null && !entryByKey[key]) htmlSitemapMissing.push(key);
    }
  }
  problems.push(!note("HTMLサイトマップに載っているがXMLサイトマップに無いインデックス対象ページ", htmlSitemapMissing.length, htmlSitemapMissing.join(", ")));

  // --- 9. robots.txt --------------------------------------------------------------------
  const robotsTxt = readFileIfExists(path.join(root, "robots.txt")) || "";
  const sitemapDirectives = robotsTxt.match(/^Sitemap:\s*(.+)$/gim) || [];
  const hasRootSitemapDirective = sitemapDirectives.some(l => l.replace(/^Sitemap:\s*/i, "").trim() === `${SITE_ORIGIN}/sitemap.xml`);
  const disallowRules = (robotsTxt.match(/^Disallow:\s*(.*)$/gim) || []).map(l => l.replace(/^Disallow:\s*/i, "").trim()).filter(Boolean);
  const blockedSitemapFiles = expectedNames.filter(f => disallowRules.some(rule => `/${f}`.startsWith(rule)));
  const robotsOk = hasRootSitemapDirective && sitemapDirectives.length <= 1 && blockedSitemapFiles.length === 0;
  console.log("");
  console.log("robots.txtにSitemap指定あり(1件):", hasRootSitemapDirective && sitemapDirectives.length <= 1 ? "PASS" : "FAIL", `(検出${sitemapDirectives.length}件)`);
  console.log("robots.txtでサイトマップがブロックされていない:", blockedSitemapFiles.length === 0 ? "PASS" : "FAIL", blockedSitemapFiles.length ? JSON.stringify(blockedSitemapFiles) : "");
  problems.push(!robotsOk);

  const ok = !problems.some(Boolean);
  console.log("");
  console.log("SITEMAP AUDIT");
  console.log("");
  console.log(`Articles: ${entriesByBucket.articles.length}`);
  console.log(`Categories: ${entriesByBucket.categories.length}`);
  console.log(`Pages: ${entriesByBucket.pages.length}`);
  console.log(`Total: ${allEntries.length}`);
  console.log(`Excluded (noindex/redirect/canonical): ${expected.excluded.length}`);
  console.log("");
  console.log(`Duplicate URLs: ${summary.duplicate}`);
  console.log(`Missing URLs: ${summary.missing}`);
  console.log(`Redirect URLs: ${summary.redirect}`);
  console.log(`Noindex URLs: ${summary.noindex}`);
  console.log(`Canonical mismatches: ${summary.canonical}`);
  console.log(`Lastmod mismatches: ${summary.lastmod}`);
  console.log(`Broken URLs: ${summary.broken}`);
  console.log("");
  console.log(ok ? "PASS" : "FAIL");
  console.log(ok ? "OK: サイトマップ監査はすべてPASSしました。" : "FAIL: サイトマップ監査で問題が見つかりました。上記を確認してください。");
  return ok;
}

// --live: 本番での確認(外部HTTPアクセスあり)。
async function runLiveChecks() {
  const problems = [];
  console.log("\n=== LIVE CHECK (https://value-advance.com) ===");
  const head = async (url, method = "HEAD") => {
    try {
      const res = await fetch(url, { method, redirect: "manual" });
      return { status: res.status, location: res.headers.get("location"), type: res.headers.get("content-type") || "" };
    } catch (e) {
      return { status: 0, error: String(e) };
    }
  };
  const expected = buildSitemaps();
  for (const fileName of Object.keys(expected.files)) {
    const r = await head(`${SITE_ORIGIN}/${fileName}`, "GET");
    const ok = r.status === 200 && /xml/i.test(r.type);
    console.log(`${fileName}: HTTP ${r.status} ${r.type}`, ok ? "PASS" : "FAIL");
    problems.push(!ok);
  }
  for (const rd of expected.redirects) {
    for (const variant of [rd.sourceKey, `${rd.sourceKey}.html`, `${rd.sourceKey}/`]) {
      const r = await head(`${SITE_ORIGIN}${variant}`);
      const ok = r.status === 301 && r.location && normalizePathKey(new URL(r.location, SITE_ORIGIN).href) === rd.targetKey;
      console.log(`redirect ${variant}: HTTP ${r.status} → ${r.location || "-"}`, ok ? "PASS" : "FAIL");
      problems.push(!ok);
    }
  }
  const locs = BUCKETS.flatMap(b => expected.chunksByBucket[b]).flatMap(f => parseUrlsetXml(expected.files[f]).map(e => e.loc));
  const bad = [];
  let i = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (i < locs.length) {
      const loc = locs[i++];
      const r = await head(loc);
      if (r.status !== 200) bad.push(`${r.status} ${loc}`);
    }
  }));
  console.log(`掲載URLのHTTP 200: ${locs.length - bad.length}/${locs.length}`, bad.length ? "FAIL" : "PASS");
  bad.slice(0, 30).forEach(b => console.log("  " + b));
  problems.push(bad.length > 0);
  const ok = !problems.some(Boolean);
  console.log(ok ? "LIVE: PASS" : "LIVE: FAIL");
  return ok;
}

if (require.main === module) {
  const ok = runSitemapAudit();
  if (process.argv.includes("--live")) {
    runLiveChecks().then(liveOk => process.exit(ok && liveOk ? 0 : 1));
  } else {
    process.exit(ok ? 0 : 1);
  }
}

module.exports = { runSitemapAudit, runLiveChecks };
