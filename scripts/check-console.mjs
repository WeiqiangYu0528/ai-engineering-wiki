#!/usr/bin/env node
// check-console.mjs — load a sample of built pages in a real headless browser
// and fail on any client-side script error.
//
// Requirement 15.5: "WHEN a Reader loads any published page, THE Site SHALL
// render that page without a client-side script error."
// Spec: .kiro/specs/wiki-site-experience task 12.3.
//
// This is the only check for 15.5. Nothing in `make check` and nothing in
// `check-built-site.mjs` executes a line of the site's JavaScript — they read
// markdown and parse HTML. Quartz ships an SPA router, popovers, a client-side
// search, a graph view, an explorer and KaTeX; all of that is invisible to a
// static scan and observable only by running it.
//
// ===========================================================================
// NO BROWSER DEPENDENCY, AND NO VACUOUS PASS
// ===========================================================================
//
// `npm ci` runs inside Quartz's own tree, not this repository, so `import
// puppeteer` would throw at runtime. What is actually reachable was measured
// rather than assumed:
//
//   * `dist/quartz/node_modules/` holds 241 packages. No puppeteer, no
//     playwright, no playwright-core, no jsdom, no happy-dom, no linkedom.
//     It does carry `ws` and `serve-handler`, but those are Quartz's
//     transitive dependencies, not ours, and depending on another project's
//     dependency tree is how a check starts failing for reasons unrelated to
//     the site.
//   * Node has no built-in headless browser at any version.
//
// So this script drives Chrome over the DevTools Protocol directly, with zero
// third-party dependencies. Node supplies everything needed: `child_process`
// to launch, global `fetch` to read the debugger endpoint, global `WebSocket`
// to speak CDP, and `http` to serve the built files. `WebSocket` became a
// no-flag global in Node 22.4; on an older 22.x, run with
// `--experimental-websocket`. The script says so rather than crashing.
//
// A console check that quietly does nothing when no browser is present is
// worse than no check at all, because the workflow goes green while verifying
// nothing. So the exit codes separate "did not run" from "ran and found
// nothing", and the default is fail-closed:
//
//   0  the browser ran, the sample loaded, nothing counted as a failure
//   1  the browser ran and at least one message counted as a failure
//   2  the check could not be run as designed — bad arguments, unreadable
//      site directory, a sample role that no built page could fill, or a
//      browser that was found but would not start
//   3  NO BROWSER AVAILABLE. The check did not run. Nothing was verified.
//      Stdout names every location searched and what to install.
//
// Exit 3 is non-zero on purpose, so a workflow that forgets to provide a
// browser goes red. `--allow-missing-browser` downgrades 3 to 0 for local
// development; the workflow must never pass it. Every run also prints one
// machine-readable line so task 12.2 can branch without parsing prose:
//
//   check-console: RESULT=pass|fail|skipped-no-browser|error pages=N failures=N warnings=N
//
// GETTING A BROWSER IN CI — recommendation
//
//   Install nothing. The `ubuntu-latest` runner image already ships Google
//   Chrome in PATH as `google-chrome` / `google-chrome-stable`, which this
//   script finds unaided. Chromium on that image comes from snap and is
//   documented as not reliably startable, which is why the discovery order
//   below prefers Google Chrome and treats `chromium` as a fallback.
//   (actions/runner-images issues #10726, #12096.)
//
//   If the image ever drops Chrome, `browser-actions/setup-chrome@v1` is the
//   cheap fix — one step, no lockfile change. It downloads a
//   Chrome-for-Testing build, so budget a few hundred MB of download and
//   roughly 15-30 s of run time. `npm i puppeteer` costs the same download
//   plus an npm install plus a dependency this repository otherwise does not
//   have, and buys nothing this file does not already do. Neither is
//   recommended while the image ships Chrome.
//
//   Flakiness is the real cost of a browser in CI, and it is spent on the
//   waits, not the install. Every wait here is bounded and every timeout is
//   reported as a failure with its budget, so a hang shows up as a message
//   rather than a six-hour job.
//
// ===========================================================================
// WHAT COUNTS AS A FAILURE, AND WHY
// ===========================================================================
//
// 15.5 says "script error", not "quiet console", and the distinction is doing
// work. `classify()` is the single place the policy lives.
//
//   FAIL  an uncaught exception or unhandled promise rejection
//         (`Runtime.exceptionThrown`) — the definition of a script error.
//   FAIL  `console.error` and `console.assert` — code reporting its own
//         failure.
//   FAIL  a same-origin request that failed or returned >= 400. This is the
//         bug class this check exists for: task 11.1's trim script rewrites
//         `contentIndex.json`, dropping entries and truncating `content`,
//         and the explorer, graph, search and backlinks all read that file.
//         A dropped slug that is still linked surfaces here and nowhere else.
//   FAIL  the sampled URL not returning 200. A sample that silently lands on
//         404.html would report a clean console for a page that does not
//         exist — a vacuous pass wearing a green tick.
//   FAIL  a `rendering` or `security` error from the Log domain. A CSP block
//         that kills a script is a render failure by any reading.
//   FAIL  a JavaScript dialog. `alert()` on a wiki page is a defect, and
//         auto-dismissing it also stops it hanging the run.
//   FAIL  a target crash, or any wait exceeding its budget.
//
//   WARN  `console.warn` / `info` / `log` / `debug`, and `deprecation`,
//         `intervention` and `other` Log entries. Reported with page and
//         text, counted in the summary, never failing.
//
//         This is the deliberate call on KaTeX. The build logs
//         `LaTeX-incompatible input ... Unrecognized Unicode character "—"`,
//         and if it reaches the client it is a defect in one page's maths
//         source: KaTeX renders the character in its error colour and the
//         page still renders. Requirement 15.5 is about script errors, and a
//         warning is by definition not one. Failing on warnings would make
//         this gate the arbiter of content typography, which is a different
//         job with a different owner — an em dash inside `$...$` is a lint
//         finding about the vault, not a broken page. `--fail-on-warning`
//         tightens it for anyone who disagrees; the count is always printed,
//         so a warning cannot hide behind the default.
//
//   NOTE  a cross-origin request failing. The built pages load
//         `cdn.jsdelivr.net/.../copy-tex.min.js`; a CDN being slow in CI is
//         not the Site failing to render, and a gate that depends on
//         jsdelivr's uptime produces red builds that mean nothing.
//         `--fail-on-external` opts in.
//
//         Every third-party host actually contacted at runtime is listed in
//         the summary regardless, because only a real load can observe that.
//         The assertion about analytics hosts (Requirements 10.5, 14.7)
//         belongs to `check-built-site.mjs`; two scripts owning one
//         requirement is how a requirement ends up owned by neither. This one
//         reports the evidence.
//
// Log-domain entries with source `network` or `javascript` are dropped, not
// because they are unimportant but because Chrome mirrors both into the
// Runtime domain and into this script's own network bookkeeping, where the
// same event arrives with better location data and a same-origin
// determination. Keeping both would triple-count one 404.
//
// ===========================================================================
// THE PAGE SAMPLE
// ===========================================================================
//
// Five roles, resolved by discovery against the built tree rather than
// hard-coded slugs, because the tree is generated and slugs move.
//
//   root            /                  depth 0, the Landing_Page or Quartz's
//                                      generated root page
//   domain-index    /<domain>/         depth 1, a Map_Page written to
//                                      <domain>/index.md
//   concept         /<domain>/concepts/<slug>   depth 2
//   reading-note    /<domain>/sources/<slug>    depth 2, a source-summary
//   generated-root  /catalog           depth 0, generated and `unlisted`
//
// Why this sample covers the risk. Two things are new: the injected
// Page_Header, which is the same markup on every page but whose hrefs are
// resolved against the page's own depth, and grouping, which introduced
// depths 1 and 2 where the site used to be flat. The probe build in the
// design turned `../../wiki/x` into `../.././../wiki/x` — a depth bug, and
// depth is exactly what grouping changed. So the sample crosses the header
// against every depth that exists (0, 1, 2), then crosses depth 2 against
// both page types that live there, because a concept page and a reading note
// carry different header blocks and different search-content limits
// (7,000 vs 700 characters), and the trim script cuts them differently.
// The generated root page covers the one asymmetry neither of those reaches:
// task 10.2 marks it `unlisted: true`, so its slug is present in the HTML
// link graph and absent from `contentIndex.json`, which is precisely the
// mismatch that makes a client-side index reader throw.
//
// Five pages, five distinct axes. A sixth page at an already-covered
// (depth, type, listed) combination would add run time and no coverage. The
// concept and reading-note roles pick the *largest* built page in their
// directory rather than the first alphabetically, since the largest page
// carries the most injected links and therefore the most hrefs to resolve —
// `transformer` has 13 `related` plus 20 `sources`. `--all` sweeps every
// built page for anyone who wants the exhaustive run; `--page URL` adds
// specific ones.
//
// A role that no built page can fill is exit 2, not exit 1: the site is not
// broken, the check could not be run as specified. `--allow-partial-sample`
// proceeds with what exists and prints which axes went uncovered.
//
// ===========================================================================
// WHY THE FILES ARE SERVED OVER HTTP
// ===========================================================================
//
// `file://` would defeat the point. Quartz's SPA router, search and graph all
// `fetch` — including `contentIndex.json`, the artifact task 11.1 rewrites —
// and `fetch` is not permitted on `file://`, so every one of those code paths
// would fail for a reason that has nothing to do with the site. The tiny
// static server below is `node:http` from the standard library: 127.0.0.1, an
// ephemeral port, directory URLs to `index.html`, extensionless URLs to
// `.html`, a path-traversal guard, and `404.html` at status 404. `--url`
// skips it and checks an origin someone else is already serving.
//
// Node 22, ESM, no third-party dependencies.

import { spawn } from "node:child_process";
import { accessSync, constants, createReadStream, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { delimiter, dirname, extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const EXIT_OK = 0;
const EXIT_FAILURES = 1;
const EXIT_USAGE = 2;
const EXIT_NO_BROWSER = 3;

const USAGE = `Usage: node scripts/check-console.mjs [SITE] [options]

  SITE                      built site directory to serve and load
                            (default: $KB_SITE_DIR, else
                            $RUNNER_TEMP/quartz/public)

  --site PATH               same as the positional argument
  --url ORIGIN              check an already-served origin instead of
                            starting a server (e.g. http://127.0.0.1:8080)
  --page PATH               add a page to the sample; repeatable
  --all                     load every built page instead of the sample
  --browser PATH            Chrome/Chromium executable to use
  --profile-dir PATH        parent directory for the throwaway browser
                            profile (default: $RUNNER_TEMP, else the cwd)
  --search-term TERM        query typed into the search box (default: attention)
  --platform NAME           restrict discovery to another platform's well-known
                            locations. With an emptied PATH this exercises the
                            exit-3 path on a machine that does have a browser,
                            so a workflow author can prove the gate goes red
                            when the browser is missing instead of assuming it
  --timeout MS              per-page budget (default: 20000)
  --settle MS               network-quiet window before a page is done
                            (default: 750)
  --no-interact             skip the search interaction
  --sandbox                 keep Chrome's sandbox enabled
  --fail-on-warning         count console warnings as failures
  --fail-on-external        count cross-origin request failures as failures
  --allow-partial-sample    proceed when a sample role cannot be filled
  --allow-missing-browser   exit 0 instead of 3 when no browser is found.
                            LOCAL USE ONLY — this makes the check vacuous.
  --report PATH             write the full findings as JSON
  --quiet                   print only failures and the summary
  --help                    print this and exit 0

Exit: 0 clean, 1 failures found, 2 could not run as designed,
      3 no browser available (nothing was verified).`;

/** A fatal, reportable failure: the check could not be run. Exit 2. */
class UsageError extends Error {}
/** No browser could be found. Exit 3, and the message says what to install. */
class NoBrowserError extends Error {}

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------

export function parseArgs(argv) {
  const parsed = {
    site: null,
    url: null,
    pages: [],
    all: false,
    browser: null,
    profileDir: null,
    searchTerm: "attention",
    timeout: 20000,
    settle: 750,
    interact: true,
    sandbox: false,
    failOnWarning: false,
    failOnExternal: false,
    allowPartialSample: false,
    allowMissingBrowser: false,
    report: null,
    quiet: false,
    platform: process.platform,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const take = (name) => {
      if (arg.startsWith(`${name}=`)) return arg.slice(name.length + 1);
      const next = argv[i + 1];
      if (next === undefined || (next.startsWith("-") && next.length > 1)) {
        throw new UsageError(`${name} needs a value`);
      }
      i += 1;
      return next;
    };
    const integer = (name) => {
      const raw = take(name);
      const value = Number(raw);
      if (!Number.isInteger(value) || value <= 0) {
        throw new UsageError(`${name} needs a positive integer, got ${JSON.stringify(raw)}`);
      }
      return value;
    };
    const is = (name) => arg === name || arg.startsWith(`${name}=`);

    if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (is("--site")) parsed.site = take("--site");
    else if (is("--url")) parsed.url = take("--url");
    else if (is("--page")) parsed.pages.push(take("--page"));
    else if (is("--browser")) parsed.browser = take("--browser");
    else if (is("--profile-dir")) parsed.profileDir = take("--profile-dir");
    else if (is("--search-term")) parsed.searchTerm = take("--search-term");
    else if (is("--platform")) parsed.platform = take("--platform");
    else if (is("--timeout")) parsed.timeout = integer("--timeout");
    else if (is("--settle")) parsed.settle = integer("--settle");
    else if (is("--report")) parsed.report = take("--report");
    else if (arg === "--all") parsed.all = true;
    else if (arg === "--no-interact") parsed.interact = false;
    else if (arg === "--sandbox") parsed.sandbox = true;
    else if (arg === "--fail-on-warning") parsed.failOnWarning = true;
    else if (arg === "--fail-on-external") parsed.failOnExternal = true;
    else if (arg === "--allow-partial-sample") parsed.allowPartialSample = true;
    else if (arg === "--allow-missing-browser") parsed.allowMissingBrowser = true;
    else if (arg === "--quiet") parsed.quiet = true;
    else if (arg.startsWith("-")) throw new UsageError(`unknown option: ${arg}`);
    else if (parsed.site === null) parsed.site = arg;
    else throw new UsageError(`unexpected extra argument: ${arg}`);
  }
  return parsed;
}

/**
 * The built site: explicit path, then the environment, then the $RUNNER_TEMP
 * layout the workflow builds into — the same resolution order as
 * trim-search-index.mjs, so the two scripts agree about where the build is.
 */
export function resolveSitePath(parsed, env) {
  const explicit = parsed.site ?? env.KB_SITE_DIR;
  if (explicit) return resolve(explicit);
  if (env.RUNNER_TEMP) return resolve(join(env.RUNNER_TEMP, "quartz", "public"));
  throw new UsageError(
    "no site directory given and $RUNNER_TEMP is unset, so the default location is unknown.\n" +
      "Pass the built site directory as the first argument, or --url an already-served origin."
  );
}

// ---------------------------------------------------------------------------
// Browser discovery
// ---------------------------------------------------------------------------

/**
 * Candidates in preference order. Google Chrome first everywhere: on the
 * GitHub ubuntu image it is the one that reliably starts, while `chromium`
 * ships from snap and is documented as not startable in that environment.
 */
export function browserCandidates(env, platform) {
  const fromEnv = [env.KB_CHROME, env.CHROME_PATH, env.PUPPETEER_EXECUTABLE_PATH, env.CHROMIUM_PATH]
    .filter((value) => typeof value === "string" && value.length > 0);
  const names = ["google-chrome", "google-chrome-stable", "chrome", "chromium", "chromium-browser", "microsoft-edge", "microsoft-edge-stable"];
  const onPath = [];
  for (const dir of (env.PATH ?? "").split(delimiter).filter(Boolean)) {
    for (const name of names) onPath.push(join(dir, name));
  }
  const wellKnown = {
    darwin: [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ],
    linux: [
      "/usr/bin/google-chrome",
      "/usr/bin/google-chrome-stable",
      "/opt/google/chrome/chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/snap/bin/chromium",
      "/usr/bin/microsoft-edge",
    ],
    win32: [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ],
  };
  return [...fromEnv, ...onPath, ...(wellKnown[platform] ?? [])];
}

function isExecutableFile(path) {
  try {
    if (!statSync(path).isFile()) return false;
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export function findBrowser(parsed, env, platform) {
  if (parsed.browser) {
    if (!isExecutableFile(parsed.browser)) {
      throw new UsageError(`--browser ${parsed.browser} is not an executable file`);
    }
    return parsed.browser;
  }
  const candidates = browserCandidates(env, platform);
  const found = candidates.find(isExecutableFile);
  if (found) return found;
  const searched = [...new Set(candidates)].slice(0, 24);
  throw new NoBrowserError(
    "no Chrome or Chromium executable found, so no page was loaded and nothing\n" +
      "was verified. This is exit 3, not a pass.\n\n" +
      "What to do, cheapest first:\n" +
      "  * On a GitHub ubuntu-latest runner, Google Chrome is already installed as\n" +
      "    `google-chrome`. If this fired there, the PATH was altered or the image\n" +
      "    changed — check `which google-chrome` in the step before this one.\n" +
      "  * Otherwise add one workflow step: `uses: browser-actions/setup-chrome@v1`.\n" +
      "  * Or point at an existing install: --browser PATH, or $CHROME_PATH.\n" +
      "  * Locally on macOS, install Google Chrome; this script finds it in\n" +
      "    /Applications unaided.\n\n" +
      `Searched ${candidates.length} locations, including:\n${searched.map((p) => `  ${p}`).join("\n")}`
  );
}

// ---------------------------------------------------------------------------
// Static server — node:http only
// ---------------------------------------------------------------------------

const CONTENT_TYPES = new Map(Object.entries({
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
}));

/**
 * URL path to a file inside `root`, or null. Directory URLs get index.html and
 * extensionless URLs get .html, matching how a static host serves a Quartz
 * build. Returns null for anything that escapes the root.
 */
export function resolveRequestPath(root, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  } catch {
    return null;
  }
  const candidate = resolve(join(root, decoded));
  const rooted = resolve(root);
  if (candidate !== rooted && !candidate.startsWith(rooted + sep)) return null; // traversal
  const attempts = decoded.endsWith("/")
    ? [join(candidate, "index.html")]
    : [candidate, `${candidate}.html`, join(candidate, "index.html")];
  for (const attempt of attempts) {
    try {
      if (statSync(attempt).isFile()) return attempt;
    } catch {
      // next
    }
  }
  return null;
}

function startStaticServer(root) {
  return new Promise((res, rej) => {
    const server = createServer((req, response) => {
      const file = resolveRequestPath(root, req.url ?? "/");
      if (file === null) {
        const notFound = join(root, "404.html");
        if (existsSync(notFound)) {
          response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
          createReadStream(notFound).pipe(response);
          return;
        }
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("not found\n");
        return;
      }
      response.writeHead(200, {
        "content-type": CONTENT_TYPES.get(extname(file).toLowerCase()) ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      createReadStream(file).pipe(response);
    });
    server.on("error", rej);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      res({ server, origin: `http://127.0.0.1:${port}` });
    });
  });
}

// ---------------------------------------------------------------------------
// The page sample
// ---------------------------------------------------------------------------

const GENERATED_ROOT_PREFERENCE = ["catalog", "catalog-sources", "open-questions", "trust", "how-it-was-built", "log", "notice"];
const KIND_SEGMENTS = ["concepts", "entities", "sources"];

function directories(path) {
  try {
    return readdirSync(path, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
  } catch {
    return [];
  }
}

/** Largest .html file under `dir`, by bytes: the page with the most injected links. */
function largestPage(dir) {
  let best = null;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (!entry.isFile() || extname(entry.name) !== ".html") continue;
    const full = join(dir, entry.name);
    const size = statSync(full).size;
    if (best === null || size > best.size) best = { path: full, size };
  }
  return best;
}

/**
 * Resolve the five roles against the built tree. Returns the pages found and
 * the roles that could not be filled, so the caller decides whether an
 * unfillable role is fatal.
 */
export function resolveSample(root) {
  const pages = [];
  const missing = [];
  const add = (role, urlPath, why) => pages.push({ role, path: urlPath, why });

  if (existsSync(join(root, "index.html"))) {
    add("root", "/", "depth 0; the first page every Reader loads, and the one that carries search, graph and explorer with no body to hide behind");
  } else {
    missing.push({ role: "root", why: "no index.html at the site root" });
  }

  const domains = directories(root).filter((name) => {
    if (!existsSync(join(root, name, "index.html"))) return false;
    return KIND_SEGMENTS.some((segment) => existsSync(join(root, name, segment)));
  });
  if (domains.length > 0) {
    add("domain-index", `/${domains[0]}/`, "depth 1; a Map_Page served as a directory URL, so every root-absolute injected href is resolved one level down");
  } else {
    missing.push({ role: "domain-index", why: "no <domain>/index.html beside a concepts/entities/sources directory" });
  }

  // Depth 2, both page types: the deepest pages, where a relative injected
  // href escapes the site root, crossed against the two search-content limits.
  for (const [role, segment, why] of [
    ["concept", "concepts", "depth 2, the deepest normal page and the largest header (most hrefs to resolve against that depth)"],
    ["reading-note", "sources", "depth 2, a source-summary: a different header block and a 700-character search limit, so the trim script cuts it hardest"],
  ]) {
    let best = null;
    for (const domain of directories(root)) {
      const found = largestPage(join(root, domain, segment));
      if (found && (best === null || found.size > best.size)) best = found;
    }
    if (best) {
      const urlPath = `/${relative(root, best.path).split(sep).join("/").replace(/\.html$/, "")}`;
      add(role, urlPath, `${why}; picked as the largest built page in any ${segment}/ at ${best.size.toLocaleString("en-US")} bytes`);
    } else {
      missing.push({ role, why: `no built page under any <domain>/${segment}/` });
    }
  }

  const generated = GENERATED_ROOT_PREFERENCE.find((slug) => existsSync(join(root, `${slug}.html`)));
  if (generated) {
    add("generated-root", `/${generated}`, "depth 0 and generated: marked `unlisted`, so its slug is in the HTML link graph and absent from contentIndex.json — the mismatch that makes a client-side index reader throw");
  } else {
    missing.push({ role: "generated-root", why: `none of ${GENERATED_ROOT_PREFERENCE.join(", ")} was built` });
  }

  return { pages, missing };
}

/** Every built page, for `--all`. Alias-redirect stubs included: they run scripts too. */
export function allPages(root) {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (extname(entry.name) === ".html" && entry.name !== "404.html") {
        const rel = relative(root, full).split(sep).join("/");
        found.push({
          role: "all",
          path: rel === "index.html" ? "/" : `/${rel.replace(/\.html$/, "")}`,
          why: "every built page (--all)",
        });
      }
    }
  };
  walk(root);
  return found;
}

// ---------------------------------------------------------------------------
// CDP client — request/response over the global WebSocket, no dependencies
// ---------------------------------------------------------------------------

class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 0;
    this.pending = new Map();
    this.handlers = new Map();
    this.closed = false;
    socket.onmessage = (event) => this.#receive(event.data);
    socket.onclose = () => {
      this.closed = true;
      for (const { rej } of this.pending.values()) rej(new UsageError("the browser closed the DevTools connection"));
      this.pending.clear();
    };
  }

  #receive(data) {
    let message;
    try {
      message = JSON.parse(typeof data === "string" ? data : data.toString());
    } catch {
      return;
    }
    if (message.id !== undefined) {
      const waiter = this.pending.get(message.id);
      if (!waiter) return;
      this.pending.delete(message.id);
      if (message.error) waiter.rej(new Error(`${message.method ?? "cdp"}: ${message.error.message ?? JSON.stringify(message.error)}`));
      else waiter.res(message.result ?? {});
      return;
    }
    for (const handler of this.handlers.get(message.method) ?? []) handler(message.params ?? {}, message.sessionId);
  }

  on(method, handler) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(handler);
  }

  send(method, params = {}, sessionId) {
    if (this.closed) return Promise.reject(new UsageError(`the DevTools connection is closed; cannot send ${method}`));
    this.nextId += 1;
    const id = this.nextId;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function chromeArgs(profileDir, sandbox) {
  return [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--no-default-apps",
    "--disable-extensions",
    "--disable-gpu",
    "--disable-sync",
    "--disable-default-apps",
    // Chrome's own background traffic (variations, component updates,
    // optimization guide) would otherwise land in the cross-origin host list
    // and make it useless for spotting a request the site actually made.
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-client-side-phishing-detection",
    "--metrics-recording-only",
    "--mute-audio",
    "--window-size=1280,900",
    // The sandbox is off by default because the only content loaded is this
    // build, served from 127.0.0.1 — and because sandbox setup is the single
    // most common source of "works locally, dies in CI" for headless Chrome
    // on Ubuntu 24.04 and inside containers. --sandbox opts back in.
    ...(sandbox ? [] : ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]),
    "about:blank",
  ];
}

/** Chrome writes port and browser path to DevToolsActivePort once it is listening. */
async function readDevToolsPort(profileDir, child, timeoutMs) {
  const file = join(profileDir, "DevToolsActivePort");
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new UsageError(`the browser exited with status ${child.exitCode} before it began listening`);
    }
    try {
      const lines = readFileSync(file, "utf8").split("\n");
      if (lines.length >= 2 && lines[0].trim() && lines[1].trim()) {
        return { port: Number(lines[0].trim()), path: lines[1].trim() };
      }
    } catch {
      // not written yet
    }
    await sleep(50);
  }
  throw new UsageError(`the browser did not write ${file} within ${timeoutMs} ms, so it never began listening`);
}

async function launch(executable, profileParent, sandbox, stderrSink) {
  mkdirSync(profileParent, { recursive: true });
  const profileDir = mkdtempSync(join(profileParent, "kb-console-profile-"));
  const child = spawn(executable, chromeArgs(profileDir, sandbox), { stdio: ["ignore", "ignore", "pipe"] });
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => stderrSink.push(chunk.trimEnd()));
  child.on("error", (error) => stderrSink.push(`spawn failed: ${error.message}`));

  // Cleanup must never throw. Chrome keeps writing to its profile for a moment
  // after SIGKILL, so a bare rmSync races it and raises ENOTEMPTY — and this
  // runs in a `finally`, where a throw would replace the real exit code with a
  // stack trace and turn a clean run into an apparent failure. Retry, then give
  // up quietly with a note: a leftover profile directory is untidy, not wrong.
  const close = () => {
    try {
      child.kill("SIGKILL");
    } catch {
      // already gone
    }
    try {
      rmSync(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    } catch (error) {
      stderrSink.push(`could not remove the throwaway profile ${profileDir}: ${error.message}`);
    }
  };

  try {
    const { port } = await readDevToolsPort(profileDir, child, 30000);
    const version = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json());
    const socket = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      socket.onopen = res;
      socket.onerror = () => rej(new UsageError(`cannot open a DevTools WebSocket to ${version.webSocketDebuggerUrl}`));
    });
    return { cdp: new Cdp(socket), browser: version.Browser, close: () => { try { socket.close(); } catch { /* closing */ } close(); } };
  } catch (error) {
    close();
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Classification — the whole policy, in one place
// ---------------------------------------------------------------------------

const FAILING_CONSOLE_TYPES = new Set(["error", "assert"]);
const LOG_SOURCES_FAILING = new Set(["rendering", "security"]);
// Dropped: `network` and `javascript`. Chrome mirrors both into the Runtime
// domain and into this script's own request bookkeeping, where the same event
// arrives with a location and a same-origin verdict.
const LOG_SOURCES_IGNORED = new Set(["network", "javascript"]);

export function classify(message, options) {
  switch (message.kind) {
    case "exception":
    case "http-status":
    case "navigation":
    case "crash":
    case "dialog":
    case "timeout":
      return "fail";
    case "console":
      if (FAILING_CONSOLE_TYPES.has(message.level)) return "fail";
      return options.failOnWarning && message.level === "warning" ? "fail" : "warn";
    case "log-entry":
      if (LOG_SOURCES_IGNORED.has(message.source)) return "ignore";
      if (message.level === "error" && LOG_SOURCES_FAILING.has(message.source)) return "fail";
      return options.failOnWarning && message.level === "error" ? "fail" : "warn";
    case "request-failed":
      if (message.sameOrigin) return "fail";
      return options.failOnExternal ? "fail" : "note";
    case "browser-request-failed":
      return "note";
    default:
      return "warn";
  }
}

function argText(arg) {
  if (arg === undefined || arg === null) return "";
  if ("value" in arg && arg.value !== undefined) return typeof arg.value === "string" ? arg.value : JSON.stringify(arg.value);
  if (arg.description) return arg.description;
  if (arg.unserializableValue) return String(arg.unserializableValue);
  if (arg.preview?.description) return arg.preview.description;
  return arg.type ?? "";
}

function firstFrame(stackTrace) {
  const frame = stackTrace?.callFrames?.[0];
  if (!frame) return null;
  return `${frame.url || "<inline>"}:${frame.lineNumber + 1}:${frame.columnNumber + 1}`;
}

// ---------------------------------------------------------------------------
// Loading one page
// ---------------------------------------------------------------------------

const INTERACT_SOURCE = (term) => `(() => {
  const notes = [];
  try {
    const control = document.querySelector(
      ".search button, button.search-button, .search > div[role=button], #search-button, .search"
    );
    if (control) { control.click(); notes.push("clicked the search control"); }
    else notes.push("no search control found on this page");
  } catch (error) { notes.push("clicking search threw: " + String(error && error.message)); }
  try {
    const input = document.querySelector("#search-bar, .search input, input.search-bar");
    if (input) {
      input.focus();
      input.value = ${JSON.stringify(term)};
      input.dispatchEvent(new Event("input", { bubbles: true }));
      notes.push("typed a query, so the client indexes contentIndex.json");
    } else { notes.push("no search input found"); }
  } catch (error) { notes.push("typing threw: " + String(error && error.message)); }
  return notes.join("; ");
})()`;

async function loadPage(cdp, origin, page, options) {
  const messages = [];
  const externalHosts = new Set();
  const notes = [];
  const url = new URL(page.path, origin).href;

  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  const mine = (eventSessionId) => eventSessionId === sessionId;
  const record = (message) => messages.push({ page: page.path, role: page.role, ...message });

  let inFlight = 0;
  let lastActivity = Date.now();
  let loaded = false;
  let mainStatus = null;
  let mainError = null;
  const requestUrls = new Map();

  cdp.on("Runtime.consoleAPICalled", (params, sid) => {
    if (!mine(sid)) return;
    record({
      kind: "console",
      level: params.type,
      source: "console",
      text: (params.args ?? []).map(argText).join(" ").trim() || `console.${params.type}()`,
      at: firstFrame(params.stackTrace),
    });
  });
  cdp.on("Runtime.exceptionThrown", (params, sid) => {
    if (!mine(sid)) return;
    const details = params.exceptionDetails ?? {};
    record({
      kind: "exception",
      level: "error",
      source: "javascript",
      text: details.exception?.description?.split("\n")[0] ?? details.text ?? "uncaught exception",
      at: firstFrame(details.stackTrace) ?? `${details.url ?? "<inline>"}:${(details.lineNumber ?? 0) + 1}`,
    });
  });
  cdp.on("Log.entryAdded", (params, sid) => {
    if (!mine(sid)) return;
    const entry = params.entry ?? {};
    record({ kind: "log-entry", level: entry.level, source: entry.source, text: entry.text, at: entry.url ?? null });
  });
  cdp.on("Page.javascriptDialogOpening", (params, sid) => {
    if (!mine(sid)) return;
    record({ kind: "dialog", level: "error", source: "page", text: `a ${params.type} dialog opened: ${params.message}`, at: params.url ?? null });
    cdp.send("Page.handleJavaScriptDialog", { accept: false }, sessionId).catch(() => {});
  });
  cdp.on("Inspector.targetCrashed", (_params, sid) => {
    if (!mine(sid)) return;
    record({ kind: "crash", level: "error", source: "browser", text: "the renderer crashed while loading this page", at: null });
  });
  cdp.on("Page.loadEventFired", (_params, sid) => {
    if (mine(sid)) loaded = true;
  });
  cdp.on("Network.requestWillBeSent", (params, sid) => {
    if (!mine(sid)) return;
    inFlight += 1;
    lastActivity = Date.now();
    requestUrls.set(params.requestId, params.request.url);
    if (!params.request.url.startsWith(origin) && /^https?:/.test(params.request.url)) {
      externalHosts.add(new URL(params.request.url).host);
    }
  });
  cdp.on("Network.loadingFinished", (_params, sid) => {
    if (!mine(sid)) return;
    inFlight = Math.max(0, inFlight - 1);
    lastActivity = Date.now();
  });
  cdp.on("Network.loadingFailed", (params, sid) => {
    if (!mine(sid)) return;
    inFlight = Math.max(0, inFlight - 1);
    lastActivity = Date.now();
    const requestUrl = requestUrls.get(params.requestId) ?? "<unknown url>";
    if (params.canceled) return;
    record({
      kind: "request-failed",
      level: "error",
      source: "network",
      sameOrigin: requestUrl.startsWith(origin),
      text: `request failed (${params.errorText}) for ${requestUrl}`,
      at: requestUrl,
    });
  });
  cdp.on("Network.responseReceived", (params, sid) => {
    if (!mine(sid)) return;
    const responseUrl = params.response.url;
    if (params.type === "Document" && responseUrl.startsWith(origin) && mainStatus === null) mainStatus = params.response.status;
    if (params.response.status >= 400 && responseUrl.startsWith(origin)) {
      // Chrome asks for /favicon.ico on its own when a page declares no icon
      // link. That request comes from the browser, not from the site's
      // scripts, so a 404 on it is not a client-side script error and must not
      // fail this gate. Whether the favicon exists and differs from Quartz's
      // default is Requirement 12.4, checked in check-built-site.mjs.
      const implicitFavicon = new URL(responseUrl).pathname === "/favicon.ico";
      record({
        kind: implicitFavicon ? "browser-request-failed" : "request-failed",
        level: implicitFavicon ? "info" : "error",
        source: "network",
        sameOrigin: true,
        text: implicitFavicon
          ? `HTTP ${params.response.status} for the favicon Chrome requested on its own; Requirement 12.4 owns the favicon, not this check`
          : `HTTP ${params.response.status} for ${responseUrl}`,
        at: responseUrl,
      });
    }
  });

  const deadline = Date.now() + options.timeout;
  try {
    await cdp.send("Runtime.enable", {}, sessionId);
    await cdp.send("Log.enable", {}, sessionId);
    await cdp.send("Network.enable", {}, sessionId);
    await cdp.send("Page.enable", {}, sessionId);

    const navigation = await cdp.send("Page.navigate", { url }, sessionId);
    if (navigation.errorText) mainError = navigation.errorText;

    // Wait for load, then for the network to go quiet. Both bounded: a wait
    // that runs out is a reported failure, never a silent pass.
    while (!loaded && Date.now() < deadline) await sleep(25);
    if (!loaded) {
      record({ kind: "timeout", level: "error", source: "harness", text: `the load event did not fire within ${options.timeout} ms`, at: null });
    }
    await settle(deadline, options.settle, () => ({ inFlight, lastActivity }));

    if (options.interact) {
      const result = await cdp.send("Runtime.evaluate", { expression: INTERACT_SOURCE(options.searchTerm), returnByValue: true, awaitPromise: false }, sessionId);
      if (result.exceptionDetails) {
        // The harness's own probe misfired. That is this file's bug, not the
        // site's, so it is a note. Anything the page throws in response still
        // arrives through Runtime.exceptionThrown and still fails the page.
        notes.push(`the search interaction could not run: ${result.exceptionDetails.text}`);
      } else if (result.result?.value) {
        notes.push(String(result.result.value));
      }
      await settle(deadline, options.settle, () => ({ inFlight, lastActivity }));
    }

    if (mainError) {
      record({ kind: "navigation", level: "error", source: "browser", text: `navigation failed: ${mainError}`, at: url });
    } else if (mainStatus !== null && mainStatus !== 200) {
      // A sample landing on 404.html would otherwise report a clean console
      // for a page that does not exist.
      record({ kind: "http-status", level: "error", source: "network", text: `the page itself returned HTTP ${mainStatus}, so this sample slot verified nothing`, at: url });
    } else if (mainStatus === null) {
      record({ kind: "navigation", level: "error", source: "harness", text: "no response was observed for the page document", at: url });
    }
  } finally {
    await cdp.send("Target.closeTarget", { targetId }).catch(() => {});
  }
  return { messages, externalHosts: [...externalHosts].sort(), notes };
}

/** Quiet window: no request started or finished for `quietMs`, bounded by `deadline`. */
async function settle(deadline, quietMs, probe) {
  while (Date.now() < deadline) {
    const { inFlight, lastActivity } = probe();
    if (inFlight === 0 && Date.now() - lastActivity >= quietMs) return true;
    await sleep(25);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const SEVERITY_LABEL = { fail: "FAIL", warn: "warn", note: "note" };

/**
 * Collapse messages a page emitted more than once, identically. Nothing is
 * hidden — the count is printed and the JSON report keeps every occurrence.
 * The site's own postscript.js logs eleven `[Explorer]` lines per navigation,
 * and the SPA router replays them, so without this the useful output drowns.
 */
export function collapse(messages) {
  const order = [];
  const seen = new Map();
  for (const message of messages) {
    const key = `${message.verdict}\u0000${message.source}\u0000${message.level}\u0000${message.text}\u0000${message.at ?? ""}`;
    const existing = seen.get(key);
    if (existing) {
      existing.count += 1;
      continue;
    }
    const entry = { ...message, count: 1 };
    seen.set(key, entry);
    order.push(entry);
  }
  return order;
}

function renderMessage(message) {
  const location = message.at ? `\n            at ${message.at}` : "";
  const repeats = message.count > 1 ? ` (x${message.count})` : "";
  return `    [${SEVERITY_LABEL[message.verdict]}] ${message.source}/${message.level}: ${message.text}${repeats}${location}`;
}

export async function main(argv, env) {
  const parsed = parseArgs(argv);
  if (parsed.help) {
    process.stdout.write(`${USAGE}\n`);
    return EXIT_OK;
  }
  return await run(parsed, env);
}

async function run(parsed, env) {
  const out = (line) => process.stdout.write(`${line}\n`);
  const chatty = (line) => {
    if (!parsed.quiet) out(line);
  };

  let executable;
  try {
    executable = findBrowser(parsed, env, parsed.platform);
  } catch (error) {
    if (!(error instanceof NoBrowserError)) throw error;
    out("check-console");
    out(`  ${error.message.split("\n").join("\n  ")}`);
    out("");
    out("check-console: RESULT=skipped-no-browser pages=0 failures=0 warnings=0 browser=none");
    if (parsed.allowMissingBrowser) {
      process.stderr.write(
        "check-console: --allow-missing-browser was passed, so this exits 0 having verified\n" +
          "nothing. Requirement 15.5 is UNCHECKED for this run. Do not pass this flag in CI.\n"
      );
      return EXIT_OK;
    }
    return EXIT_NO_BROWSER;
  }

  const siteRoot = parsed.url ? null : resolveSitePath(parsed, env);
  if (siteRoot !== null) {
    if (!existsSync(siteRoot) || !statSync(siteRoot).isDirectory()) {
      throw new UsageError(`the built site directory ${siteRoot} does not exist. Run the Quartz build first, or pass --url.`);
    }
  }

  let sample;
  let missing = [];
  if (siteRoot === null) {
    if (parsed.pages.length === 0) throw new UsageError("--url needs at least one --page, since the sample cannot be discovered from a remote origin");
    sample = [];
  } else if (parsed.all) {
    sample = allPages(siteRoot);
  } else {
    const resolved = resolveSample(siteRoot);
    sample = resolved.pages;
    missing = resolved.missing;
  }
  for (const path of parsed.pages) {
    sample.push({ role: "explicit", path: path.startsWith("/") ? path : `/${path}`, why: "named on the command line" });
  }

  if (missing.length > 0 && !parsed.allowPartialSample) {
    process.stderr.write(
      "check-console: the page sample could not be filled, so the check was not run as\n" +
        "designed. This is not a pass and not a site failure — it means the built tree\n" +
        `does not hold a page for every axis the sample covers.\n${missing.map((m) => `  ${m.role}: ${m.why}`).join("\n")}\n` +
        "Fix the build, or pass --allow-partial-sample to accept reduced coverage.\n"
    );
    out("check-console: RESULT=error pages=0 failures=0 warnings=0 browser=none");
    return EXIT_USAGE;
  }
  if (sample.length === 0) throw new UsageError("no pages to load");

  const stderrSink = [];
  const profileParent = resolve(parsed.profileDir ?? env.RUNNER_TEMP ?? process.cwd());
  let server = null;
  let origin = parsed.url;
  let session = null;
  const findings = [];
  const externalHosts = new Set();
  let failures = 0;
  let warnings = 0;

  try {
    if (siteRoot !== null) {
      const started = await startStaticServer(siteRoot);
      server = started.server;
      origin = started.origin;
    }
    session = await launch(executable, profileParent, parsed.sandbox, stderrSink);

    chatty("check-console");
    chatty(`  browser    ${session.browser} (${executable})`);
    chatty(`  serving    ${siteRoot ?? "(not serving; --url given)"}`);
    chatty(`  origin     ${origin}`);
    chatty(`  sample     ${sample.length} page${sample.length === 1 ? "" : "s"}`);
    chatty("");

    for (const page of sample) {
      const result = await loadPage(session.cdp, origin, page, parsed);
      for (const host of result.externalHosts) externalHosts.add(host);

      const kept = [];
      for (const message of result.messages) {
        const verdict = classify(message, parsed);
        if (verdict === "ignore") continue;
        if (verdict === "fail") failures += 1;
        if (verdict === "warn") warnings += 1;
        kept.push({ ...message, verdict });
        findings.push({ ...message, verdict });
      }

      const collapsed = collapse(kept);
      const failed = collapsed.filter((m) => m.verdict === "fail");
      if (parsed.quiet && failed.length === 0) continue;
      out(`  ${failed.length === 0 ? "ok  " : "FAIL"} ${page.path}  [${page.role}]`);
      if (!parsed.quiet) {
        out(`       why sampled: ${page.why}`);
        for (const note of result.notes) out(`       ${note}`);
      }
      // Every message is reported with its page, whatever its verdict.
      for (const message of parsed.quiet ? failed : collapsed) out(renderMessage(message));
      if (!parsed.quiet && collapsed.length === 0) out("       no console output at all");
    }
  } finally {
    if (session) session.close();
    if (server) await new Promise((res) => server.close(res));
  }

  out("");
  out(`  pages      ${sample.length} loaded`);
  out(`  failures   ${failures}`);
  out(`  warnings   ${warnings} (reported, not failing${parsed.failOnWarning ? " — but --fail-on-warning is on, so they failed" : ""})`);
  // Broken out so the counts stay visible under --quiet, where the individual
  // messages are not printed. A jump in console.log volume is a real signal:
  // it means debug logging shipped to the Reader.
  const byLevel = new Map();
  for (const finding of findings) {
    const key = `${finding.source}/${finding.level}`;
    byLevel.set(key, (byLevel.get(key) ?? 0) + 1);
  }
  if (byLevel.size > 0) {
    const breakdown = [...byLevel.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
    out(`  by kind    ${breakdown.map(([key, count]) => `${key} ${count}`).join(", ")}`);
  }
  if (missing.length > 0) {
    out(`  coverage   REDUCED — ${missing.map((m) => m.role).join(", ")} not sampled (--allow-partial-sample)`);
  }
  // Only a real load can see this, which is why it is printed here even though
  // check-built-site.mjs owns the analytics-host assertion.
  out(`  third-party hosts contacted at runtime: ${externalHosts.size === 0 ? "none" : [...externalHosts].sort().join(", ")}`);

  if (parsed.report) {
    writeFileSync(parsed.report, `${JSON.stringify({
      result: failures > 0 ? "fail" : "pass",
      browser: session?.browser ?? null,
      executable,
      origin,
      site: siteRoot,
      pages: sample,
      missingRoles: missing,
      failures,
      warnings,
      thirdPartyHosts: [...externalHosts].sort(),
      findings,
      browserStderr: stderrSink,
    }, null, 2)}\n`, "utf8");
    out(`  report     ${resolve(parsed.report)}`);
  }

  out("");
  out(`check-console: RESULT=${failures > 0 ? "fail" : "pass"} pages=${sample.length} failures=${failures} warnings=${warnings} browser=${JSON.stringify(session?.browser ?? "unknown")}`);

  if (failures > 0) {
    process.stderr.write(
      `check-console: ${failures} message${failures === 1 ? "" : "s"} counted as a client-side script error across ` +
        `${sample.length} sampled page${sample.length === 1 ? "" : "s"}.\n` +
        "Requirement 15.5 asks that a Reader load any published page without one.\n" +
        "The most likely cause on this site is a slug that survives in the HTML link\n" +
        "graph but was dropped from static/contentIndex.json by scripts/trim-search-index.mjs;\n" +
        "the explorer, graph, search and backlinks all read that file.\n"
    );
  }
  return failures > 0 ? EXIT_FAILURES : EXIT_OK;
}

const invokedDirectly =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invokedDirectly) {
  if (typeof WebSocket !== "function") {
    process.stderr.write(
      "check-console: this Node build has no global WebSocket, which the DevTools\n" +
        "connection needs. It is unflagged from Node 22.4; on an older 22.x run\n" +
        "`node --experimental-websocket scripts/check-console.mjs`.\n" +
        `This Node is ${process.version}.\n`
    );
    process.exitCode = EXIT_USAGE;
  } else {
    try {
      process.exitCode = await main(process.argv.slice(2), process.env);
    } catch (error) {
      if (error instanceof UsageError) {
        process.stderr.write(`check-console: ${error.message}\n`);
        process.stdout.write("check-console: RESULT=error pages=0 failures=0 warnings=0 browser=none\n");
        process.exitCode = EXIT_USAGE;
      } else {
        throw error;
      }
    }
  }
}
