---
name: verify
description: Verify changes to the poikatsu static site by driving it in a real (headless) browser.
---

# poikatsu site verification

Static site (plain HTML/CSS/JS), no build step. The surface is the browser (GUI/DOM),
not the raw HTML response — this project relies on client-side JS (header/footer
`fetch()` include, search, filters, ranking tabs) that only shows up after JS runs.

## Launch

```powershell
cd "C:\Users\pcpt2\OneDrive\Desktop\media\poikatsu"
npx --yes serve . -l 5500
```

Serves the project root at `http://localhost:5500`.

## Drive it (capture the JS-rendered DOM)

`Invoke-WebRequest` only returns the raw HTML file — it does **not** execute the
page's JavaScript, so it will never show header/footer includes, search results,
ranking tabs, or anything else rendered client-side. Use headless Edge instead:

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
& $edge --headless=new --disable-gpu --virtual-time-budget=5000 --dump-dom "http://localhost:5500/<path>" 2>$null
```

- `--virtual-time-budget=5000` is required — without it, `--dump-dom` captures the
  DOM before the page's `async` `DOMContentLoaded` handler (header/footer `fetch()`,
  search rendering, etc.) finishes, giving a false-empty result.
- Pipe to `Select-String` for specific elements, or `Out-File` + Read for the full DOM.

## Known pitfall: `serve`'s clean-URL redirect eats query strings

`npx serve` 301-redirects `/foo.html` → `/foo` (strips the `.html`), and **the
redirect drops the entire query string** in the process. Any form or link whose
`action`/`href` points at an extension-full URL with a query param (e.g.
`action="/pages/search.html"` for the site search) will silently lose `?q=...`
on submit. Always point such forms/links at the extension-less path
(`action="/pages/search"`) to bypass the redirect entirely. Verified by comparing
`Invoke-WebRequest ... | % BaseResponse.ResponseUri` before/after removing `.html`.

## Flows worth driving after a change

- Homepage load → header/footer present, slider, ranking tabs, new-articles list, category logo list
- `pages/articles` (bare, no trailing slash) → article links still resolve (root-relative links, not relative filenames)
- `pages/search?q=<term>` → result count + article cards render; `pages/search?q=<nonsense>` → 0-result message; `pages/search` (no q) → prompt message
- Any article page → related-offers section (tag/category matching) and thumb-type background render
