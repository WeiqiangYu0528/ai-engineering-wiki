#!/usr/bin/env node
// check-built-site.mjs — assert the built Quartz output against the budgets and
// structural guarantees that are only observable after `npx quartz build`.
//
// Spec: .kiro/specs/wiki-site-experience, task 12.1, "Site suite — integration
// checks in pages.yml". Requirements 2.2, 3.7, 5.10, 8.5, 9.3, 9.7, 10.2, 10.3,
// 10.4, 10.5, 10.6, 11.1, 11.7, 11.10, 11.11, 12.2, 12.4, 14.7.
//
// Runs in CI after `npx quartz build` and after `scripts/trim-search-index.mjs`,
// against $RUNNER_TEMP/quartz/public. It reads the build; it never writes to it.
//
// ===========================================================================
// WHY THESE CHECKS LIVE HERE AND NOT IN `make check`
// ===========================================================================
//
// `tools/publish.py` writes markdown. Every requirement below is a fact about
// *HTML Quartz produced from that markdown*, and several of them are facts the
// markdown cannot even express:
//
//   * Page weight is post-render. The header injector budgets 4,608 bytes of
//     its own markup; the page it lands on is 25 KB of Quartz chrome, KaTeX and
//     anchor SVG. Only the built file has a size.
//   * Backlinks and breadcrumbs are emitted by Quartz plugins. Nothing in the
//     vault knows they exist.
//   * The header's hrefs are authored root-absolute and Quartz *rewrites* them
//     to relative form at build time — `/trust` becomes `../../trust` on a
//     depth-2 page. So "the href is root-absolute" is checkable in the vault
//     (Property 18's second clause, and the vault suite owns it), while "the
//     href resolves" is only checkable here, against the rewritten output. This
//     is the split that matters: a *relative* injected href survives the vault
//     check by accident and is re-resolved against the page's own depth, which
//     is how the design's probe build turned `../../wiki/x` into
//     `../.././../wiki/x` and pointed above the site root. That defect is
//     visible in exactly one place, and this is the place.
//
// ===========================================================================
// EXIT CODES — the same contract as check-console.mjs
// ===========================================================================
//
//   0  every check ran and passed
//   1  at least one check failed
//   2  the check could not be run as designed — bad arguments, missing build
//      directory, unreadable content index
//   3  reserved for "no browser available", and never returned by this script.
//      Every check here is static: `fs`, `path`, `crypto` and parsers written
//      below, no npm dependency and no browser. The browser-dependent work is
//      check-console.mjs's, which owns exit 3. The code is reserved rather than
//      reused so that a workflow can treat 3 identically from either script.
//
// One machine-readable line on stdout, so task 12.2 can branch without parsing
// prose:
//
//   check-built-site: RESULT=pass|pass-with-skips|fail|error checks=N failures=N skipped=N partial=N reported=N pages=N
//
// `pass-with-skips` still starts with `pass`, so a workflow that greps for
// RESULT=pass is lenient by choice rather than by accident, while a reader of
// the log can see that some requirement went unchecked in that run.
//
// `reported=N` counts the checks that measure and print but never gate — the
// three page-weight measurements, see below. It sits AFTER `partial=N` on
// purpose: pages.yml greps `RESULT=[a-z-]+ .*partial=[1-9]` and
// `partial=[0-9]+`, and appending a field behind the one it anchors on leaves
// both readings untouched.
//
// ===========================================================================
// SKIPS ARE REPORTED, NOT SWALLOWED
// ===========================================================================
//
// Two checks depend on content that may not exist in a given build — a term
// that occurs only in the activity log (Requirement 9.3), and a term that
// occurs in exactly one page title (9.7). When the build offers no such term
// the check cannot run, and calling that a pass would be a lie. Those report
// `skip` with the reason, are counted in the summary and in the RESULT line,
// and `--strict-skips` turns them into failures for anyone who wants the gate
// to insist.
//
// One check is honestly partial and says so every run. Requirement 9.7 asks
// that a title match outrank body-only matches. Ranking happens in FlexSearch
// in the Reader's browser; a static reader of contentIndex.json can verify that
// the title-matching page is *in* the index with the term in its `title` field
// and that body-only rivals exist, which is the precondition for the ranking,
// but it cannot observe the order. That is stated in the output rather than
// hidden behind a green tick.
//
// ===========================================================================
// REDIRECT STUBS ARE EXCLUDED, AND HERE IS HOW THEY ARE IDENTIFIED
// ===========================================================================
//
// Decision 4 publishes every page's previous URL as an alias, so
// `alias-redirects` emits a stub per old URL — `wiki/<slug>.html` for the
// pre-grouping path, plus one per vault alias at the root. Measured on the
// grouped build on disk: 897 HTML files, of which 570 are stubs of this shape
// (326 content pages and one 404 page make up the rest):
//
//   <title>agents/concepts/agent-components</title>
//   <link rel="canonical" href="../agents/concepts/agent-components">
//   <meta name="robots" content="noindex">
//   <meta http-equiv="refresh" content="0; url=../agents/concepts/...">
//
// There is no <body>, no <h1>, no description and no header, so they would fail
// `h1-single`, `meta-description`, `header-present` and `nojs-nav` for a reason
// that is correct behaviour. `classifyPage` calls a file a stub when it carries
// a `<meta http-equiv="refresh">` with a `url=` target — decisive on its own,
// since no content page Quartz emits carries one — and records whether the
// corroborating `robots: noindex` is also present (570 of 570 do, on the build
// measured). The count is printed every run, so a build that suddenly reports
// 0 stubs (redirects lost, Requirement 5.8) or 890 (content pages collapsing
// into stubs) is visible rather than silently changing the denominator. Their refresh targets are resolved by
// `redirect-targets`, so excluding them from the page checks does not mean they
// go unchecked.
//
// ===========================================================================
// THREE FINDINGS FROM THE FIRST REAL CI RUN, AND WHERE EACH IS ANSWERED
// ===========================================================================
//
// Two of them were this script being imprecise; one was the site.
//
//   * `search-excludes-log` called `history-human-language-understanding` a
//     log-only term that another page carried. The probe's fault: candidates were
//     filtered by token equality while the assertion tests substring
//     containment, and that term is a bare token in the log but only ever part of
//     `source-history-…` elsewhere. Fixed by giving selection the assertion's own
//     predicate. See the comment in that check for the two stages.
//
//   * `h1-single` counted `tags.html`, which Quartz's tag emitter writes
//     title-less and which this pipeline does not write at all. Scoped out, by
//     name and on evidence, and reported on every run. See
//     QUARTZ_GENERATED_LISTINGS.
//
//   * `weight-max` and `weight-p95` reported a breach of the stated budgets.
//     Registers — the pages the manifest marks `unlisted` — are measured as their
//     own population with their own stated ceiling, which is what admits the
//     229 KB activity log without moving the Reader ceiling by a byte (see
//     REGISTER_MAX_BYTES). The Reader p95 was over the stated figure on its own
//     merits, 79,543 B against 72,000 B with 24 of 324 Reader pages above it, and
//     no partition changes that. That is now REPORTED RATHER THAN GATED, for the
//     reasons in the next section — and not by raising the number, which is the
//     one fix this file still will not accept.
//
// ===========================================================================
// PAGE WEIGHT IS MEASURED AND PRINTED, NOT GATED (ADR-014)
// ===========================================================================
//
// `weight-max`, `weight-p95` and `weight-total` report status `report`. They
// measure exactly what they measured before, print the same detail including
// `whyHeavy()`'s per-page byte breakdown, and contribute nothing to `failures`.
// Two independent reasons, recorded in ADR-014 of the vault's decisions.md:
//
//   1. The owner's decision. Page weight is not a constraint on this site.
//      Quality of explanation wins over bytes: if an inline SVG or a diagram
//      makes a concept land, it ships. There is no byte figure whose breach
//      should stop a deploy of correct content.
//
//   2. The stated budget was not a valid comparison in the first place. The
//      68 KB p95 in requirements.md was measured over 594 files INCLUDING the
//      290 alias-redirect stubs of that build, which are ~344 B each. This
//      script excludes stubs from the page population, correctly — a meta-refresh
//      redirect is not a page anyone reads — so it was testing a stub-excluded
//      measurement against a stub-polluted figure. Measured on the same footing:
//      the pre-feature site was already at 89,138 B p95 content-only, and the
//      current build is 89,807 B. The feature's true cost at the p95 is 669 B,
//      0.75%. On the population the budget was actually taken over, the site got
//      14% lighter (70,623 B -> 60,626 B).
//
// So a `fail` here would have been reporting a population defect as a site
// defect. The measurements stay because they are worth watching — a page that
// doubles is worth knowing about — and `--enforce-weight` restores the hard
// failure for a future owner who wants the gate back. The capability is
// defaulted off, not deleted. What is genuinely lost is written down in the
// ADR's cost section: nothing now stops a page that becomes enormous, and the
// only mitigation is that every one of these figures prints on every run.
//
// Node 22, ESM, no third-party dependencies: `npm ci` runs in Quartz's tree,
// not this one.

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const EXIT_OK = 0;
const EXIT_FAILURES = 1;
const EXIT_USAGE = 2;
// Reserved so a workflow can treat exit 3 the same way from either script.
// Never returned here: nothing in this file needs a browser.
const EXIT_NO_BROWSER = 3;

// Requirements 10.2, 10.3, 10.4. Defaults are the requirement's numbers, which
// are in turn the pre-feature maximum (188 KB), p95 (68 KB) and total (25 MB)
// rounded up. They are REFERENCE FIGURES, not budgets: a measurement above one
// is printed as "over the reference figure" and the run still exits 0. Pass
// --enforce-weight to read them as budgets again. See the ADR-014 section above,
// and note that the 68 KB p95 was taken over a population that included
// redirect stubs, which this script excludes.
const DEFAULT_MAX_PAGE_BYTES = 200_000;
const DEFAULT_P95_PAGE_BYTES = 72_000;

// ---------------------------------------------------------------------------
// REGISTERS ARE MEASURED SEPARATELY, AND THIS IS NOT A WIDENED BUDGET
// ---------------------------------------------------------------------------
//
// Requirements 10.2 and 10.3 budget what a *Reader* downloads to read a page.
// Five published pages are not that. They are the slugs the pipeline itself
// marks `unlisted` in `.search-budget.json` — log, notice, open-questions,
// catalog, catalog-sources — which keeps them out of contentIndex.json and so
// out of search, the explorer and the graph (Requirement 9.2), leaving an
// explicit link as the only route to one (Requirement 9.6). They are also the
// only pages whose size is a function of how much the vault has ingested rather
// than of what one page explains: log.md is append-only and grows monotonically,
// and the other four are one entry per page or per source.
//
// So they are partitioned out of the Reader population and measured against the
// ceiling below. Four properties keep that an exception rather than a bump:
//
//   * The Reader ceiling of 200,000 B is untouched and still applies to every
//     Reader page. Nothing moved.
//   * The partition is not a hand-kept exception list. It is the manifest's own
//     `unlisted` array, so it cannot drift from what the pipeline excluded, and
//     the source of the list is printed with the result.
//   * No register goes unmeasured or unreported. Both halves print their sizes
//     every run, pass or fail.
//   * The ceiling is a DEADLINE, not an allowance. The report converts the
//     remaining headroom into further log entries at the measured cost per
//     entry — about ten, on the build this was written against. When they are
//     spent the answer is to paginate the log, not to raise this number.
//
// If the log were measured as a Reader page it would be 29,248 B over
// Requirement 10.2's figure, and the report line says so in as many words.
//
// KEPT AFTER ADR-014, deliberately, even though nothing here fails by default.
// The partition is what makes `--enforce-weight` worth having: without it, the
// restored gate fails on log.html at 229 KB — a register whose size tracks how
// much the vault has ingested, which nobody considers a defect — so enforcement
// would be a flag that reports a known-acceptable fact as a breach, i.e. a flag
// no one would turn on. It also carries the one piece of weight advice still
// worth acting on, `registerRunway()`'s "N further entries, then it is
// pagination". Removing it would delete both and buy nothing but a shorter file.
const REGISTER_MAX_BYTES = 262_144;
// 25 MB read as MiB. The baseline in requirements.md was taken with a `du`-style
// tool, which reports MiB, and reading it as 25,000,000 would fail a build that
// is exactly at the documented baseline. Both figures are printed on failure so
// the reading is never invisible. --total-bytes overrides.
const DEFAULT_TOTAL_BYTES = 26_214_400;

// Requirement 12.4. The stock Quartz icon, which the project icon must not be.
const QUARTZ_DEFAULT_ICON_SHA256 = "532d053e33c2c6bdefdd8145996cedc4be2fc32cfdac740c8488749457d131cf";
// The project icon, for a positive identification in the report. Not asserted:
// the requirement is "not the default", and pinning the exact bytes would make
// this gate fail on a legitimate redesign of the icon.
const PROJECT_ICON_SHA256 = "6de32eae8bf6394803a299cf8d941e3904f0dfbb4459f87f400f5ae071125246";

// Requirements 10.5 and 14.7. Hostnames of analytics and session-recording
// services, matched only inside a URL context (`//host`) so a page that
// discusses one in prose is not mistaken for a page that calls one.
const ANALYTICS_HOSTS = [
  "google-analytics.com", "googletagmanager.com", "analytics.google.com",
  "stats.g.doubleclick.net", "connect.facebook.net", "static.hotjar.com",
  "plausible.io", "static.cloudflareinsights.com", "cdn.segment.com",
  "api.segment.io", "cdn.mxpnl.com", "api.mixpanel.com", "app.posthog.com",
  "us.i.posthog.com", "eu.i.posthog.com", "cdn.usefathom.com",
  "www.clarity.ms", "matomo.cloud", "cdn.matomo.cloud", "umami.is",
  "cloud.umami.is", "scripts.simpleanalyticscdn.com", "gc.zgo.at",
  "vitals.vercel-insights.com", "cdn.splitbee.io", "tinylytics.app",
];

// The published layout (Decision 1): <domain>/<kind>/<slug>.html, a Map_Page at
// <domain>/index.html, and reading/<domain>.html.
const KIND_SEGMENTS = ["concepts", "entities", "sources"];
// Root pages that are generated rather than authored, in the order the sample
// prefers them. `index` is the Landing_Page and is sampled separately.
const ROOT_EXTRAS = [
  "catalog", "catalog-sources", "open-questions", "trust",
  "how-it-was-built", "decisions", "NOTICE", "log",
];
// Requirement 9.2/9.3: pages the publish pipeline marks `unlisted`, so they
// never reach contentIndex.json. Used only when .search-budget.json is absent.
const FALLBACK_UNLISTED = ["catalog", "catalog-sources", "open-questions", "log", "notice"];

// ---------------------------------------------------------------------------
// QUARTZ'S OWN GENERATED LISTING PAGES
// ---------------------------------------------------------------------------
//
// One built page is not published by this pipeline at all. Quartz's tag emitter
// writes the tag index twice: `tags/index.html`, titled "Tag Index" and carrying
// exactly one <h1 class="article-title">, and a title-less duplicate at the root,
// `tags.html`, whose heading is <h2 class="page-title"> because that emit has no
// file data to take a title from. Both list the same 14 tags and the same 390
// entries. There is no `tags.md` in the staged content and tools/publish.py
// never writes one, so the missing <h1> cannot be fixed without patching Quartz,
// and Requirement 11.1 is about published pages.
//
// The exemption is kept as narrow as the evidence supports. It is this one file,
// not "everything under tags/": the 14 per-tag listings and every folder page
// carry exactly one <h1> and stay in scope. And it is conditional on evidence
// rather than on the filename alone — a page here is exempt only while it also
// carries no injected kb-header, which every page the pipeline writes does. If
// publish.py ever authors tags.md, the header appears, the exemption lapses and
// the page is back in scope without anyone remembering to edit this set.
//
// Exempt pages are reported with their measured count on every run, pass or
// fail. Silently shrinking a denominator is how a gate stops meaning anything.
const QUARTZ_GENERATED_LISTINGS = new Set(["tags.html"]);

const USAGE = `Usage: node scripts/check-built-site.mjs [SITE] [options]

  SITE                     built site directory to check
                           (default: $KB_SITE_DIR, else
                           $RUNNER_TEMP/quartz/public)

  --site PATH              same as the positional argument
  --index PATH             built content index
                           (default: SITE/static/contentIndex.json)
  --budget PATH            .search-budget.json, for the unlisted-slug list
                           (default: searched beside the build, then in the
                           staged content directory)
  --max-bytes N            per-page reference figure (default: ${DEFAULT_MAX_PAGE_BYTES})
  --p95-bytes N            95th-percentile reference figure (default: ${DEFAULT_P95_PAGE_BYTES})
  --total-bytes N          whole-build reference figure (default: ${DEFAULT_TOTAL_BYTES})
  --enforce-weight         read the three figures above as BUDGETS and fail the
                           run when one is exceeded. Off by default: page weight
                           is measured and printed, never gated (ADR-014). The
                           three weight checks report status \`report\` unless
                           this is passed.
  --only ID[,ID...]        run just these checks (see --list)
  --skip ID[,ID...]        run everything except these
  --list                   print the check ids and their requirements, exit 0
  --strict-skips           count a check that could not run as a failure
  --max-findings N         findings printed per check (default: 10)
  --report PATH            write every finding as JSON
  --quiet                  print only failures and the summary
  --help                   print this and exit 0

Exit: 0 pass, 1 failures, 2 could not run as designed.
      3 is reserved for "no browser" and is never returned by this script.`;

/** A fatal, reportable failure: the check suite could not be run. Exit 2. */
class UsageError extends Error {}

// ---------------------------------------------------------------------------
// Arguments and path resolution
// ---------------------------------------------------------------------------

export function parseArgs(argv) {
  const parsed = {
    site: null,
    index: null,
    budget: null,
    maxBytes: DEFAULT_MAX_PAGE_BYTES,
    p95Bytes: DEFAULT_P95_PAGE_BYTES,
    totalBytes: DEFAULT_TOTAL_BYTES,
    enforceWeight: false,
    only: [],
    skip: [],
    list: false,
    strictSkips: false,
    maxFindings: 10,
    report: null,
    quiet: false,
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
      const value = Number(raw.replaceAll("_", ""));
      if (!Number.isInteger(value) || value <= 0) {
        throw new UsageError(`${name} needs a positive integer, got ${JSON.stringify(raw)}`);
      }
      return value;
    };
    const list = (name) => take(name).split(",").map((part) => part.trim()).filter(Boolean);
    const is = (name) => arg === name || arg.startsWith(`${name}=`);

    if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--list") parsed.list = true;
    else if (is("--site")) parsed.site = take("--site");
    else if (is("--index")) parsed.index = take("--index");
    else if (is("--budget")) parsed.budget = take("--budget");
    else if (is("--max-bytes")) parsed.maxBytes = integer("--max-bytes");
    else if (is("--p95-bytes")) parsed.p95Bytes = integer("--p95-bytes");
    else if (is("--total-bytes")) parsed.totalBytes = integer("--total-bytes");
    else if (is("--max-findings")) parsed.maxFindings = integer("--max-findings");
    else if (is("--only")) parsed.only.push(...list("--only"));
    else if (is("--skip")) parsed.skip.push(...list("--skip"));
    else if (is("--report")) parsed.report = take("--report");
    else if (arg === "--enforce-weight") parsed.enforceWeight = true;
    else if (arg === "--strict-skips") parsed.strictSkips = true;
    else if (arg === "--quiet") parsed.quiet = true;
    else if (arg.startsWith("-")) throw new UsageError(`unknown option: ${arg}`);
    else if (parsed.site === null) parsed.site = arg;
    else throw new UsageError(`unexpected extra argument: ${arg}`);
  }
  return parsed;
}

/**
 * The built site: explicit path, then the environment, then the $RUNNER_TEMP
 * layout the workflow builds into. The same resolution order as
 * trim-search-index.mjs and check-console.mjs, so all three scripts agree about
 * where the build is and none of them carries a machine-specific default.
 */
export function resolveSitePath(parsed, env) {
  const explicit = parsed.site ?? env.KB_SITE_DIR;
  if (explicit) return resolve(explicit);
  if (env.RUNNER_TEMP) return resolve(join(env.RUNNER_TEMP, "quartz", "public"));
  throw new UsageError(
    "no site directory given and $RUNNER_TEMP is unset, so the default location is unknown.\n" +
      "Pass the built site directory as the first argument."
  );
}

export function resolveIndexPath(parsed, env, siteRoot) {
  const explicit = parsed.index ?? env.KB_CONTENT_INDEX;
  if (explicit) return resolve(explicit);
  return join(siteRoot, "static", "contentIndex.json");
}

/** Same candidate order as trim-search-index.mjs. */
export function budgetCandidates(parsed, env, siteRoot) {
  const explicit = parsed.budget ?? env.KB_SEARCH_BUDGET;
  if (explicit) return [resolve(explicit)];
  const candidates = [
    join(siteRoot, ".search-budget.json"),
    join(siteRoot, "static", ".search-budget.json"),
    join(dirname(siteRoot), "content", ".search-budget.json"),
  ];
  if (env.GITHUB_WORKSPACE) candidates.push(join(env.GITHUB_WORKSPACE, "content", ".search-budget.json"));
  candidates.push(join(process.cwd(), "content", ".search-budget.json"));
  return candidates.map((candidate) => resolve(candidate));
}

// ---------------------------------------------------------------------------
// A small HTML reader
//
// Written rather than installed. Every question asked below is lexical — count
// an element, read an attribute, pull the hrefs out of one subtree, get the text
// content — and a DOM parser would add a dependency to `npm ci` in Quartz's tree
// for no additional answer. The one real hazard is `<script>`: Quartz inlines a
// bundle and serializes explorer options into `data-` attributes, both of which
// contain text that looks like markup. Every check that asks "is this in the
// served HTML" therefore runs against `stripScripts()` output, which is also
// exactly what Requirement 11.11 means by "rather than only after client-side
// scripting runs".
// ---------------------------------------------------------------------------

const SCRIPT_OR_STYLE = /<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const HTML_COMMENT = /<!--[\s\S]*?-->/g;

/** The document with every <script>, <style> and comment removed. */
export function stripScripts(html) {
  return html.replace(HTML_COMMENT, "").replace(SCRIPT_OR_STYLE, "");
}

const ENTITIES = new Map(Object.entries({
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0", "#39": "'", "#x27": "'",
}));

export function decodeEntities(text) {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, name) => {
    const known = ENTITIES.get(name.toLowerCase());
    if (known !== undefined) return known;
    if (name.startsWith("#x") || name.startsWith("#X")) {
      const code = Number.parseInt(name.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    if (name.startsWith("#")) {
      const code = Number.parseInt(name.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return whole;
  });
}

/** Visible text: tags dropped, entities decoded, whitespace collapsed. */
export function textOf(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

/** Count of occurrences of an element's opening tag. */
export function countTags(html, tag) {
  const pattern = new RegExp(`<${tag}(?=[\\s>])`, "gi");
  return (html.match(pattern) ?? []).length;
}

/**
 * The value of `attr` on the first tag matching `pattern`, or null.
 * `pattern` must be a RegExp with a capture group for the tag's attribute text.
 */
export function attrValue(tagText, attr) {
  const match = new RegExp(`\\s${attr}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tagText);
  if (!match) return null;
  return decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
}

/**
 * Every `<a href=...>` in `html`, as {href, text, tag}. Order preserved.
 *
 * Driven off the opening tag rather than a paired `<a>…</a>` match, so an
 * unterminated anchor still contributes its href — the href is the thing three
 * checks resolve, and dropping one because its closing tag is missing would turn
 * a markup defect into a silently smaller denominator.
 */
export function anchors(html) {
  const lower = html.toLowerCase();
  const found = [];
  const pattern = /<a\b([^>]*)>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const start = pattern.lastIndex;
    const close = lower.indexOf("</a", start);
    found.push({
      href: attrValue(match[1], "href"),
      text: close === -1 ? "" : textOf(html.slice(start, close)),
      tag: `<a${match[1]}>`,
    });
  }
  return found;
}

/** The first subtree opened by `openPattern`, closed by counting `tag` nesting. */
export function subtree(html, openPattern, tag) {
  const open = openPattern.exec(html);
  if (!open) return null;
  const start = open.index;
  const opener = new RegExp(`<${tag}(?=[\\s>])`, "gi");
  const closer = new RegExp(`</${tag}\\s*>`, "gi");
  let depth = 0;
  let cursor = start;
  while (cursor < html.length) {
    opener.lastIndex = cursor;
    closer.lastIndex = cursor;
    const nextOpen = opener.exec(html);
    const nextClose = closer.exec(html);
    if (!nextClose) return html.slice(start);
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth += 1;
      cursor = nextOpen.index + 1;
      continue;
    }
    depth -= 1;
    cursor = nextClose.index + nextClose[0].length;
    if (depth <= 0) return html.slice(start, cursor);
  }
  return html.slice(start);
}

// ---------------------------------------------------------------------------
// Page discovery
// ---------------------------------------------------------------------------

const REFRESH_META = /<meta[^>]+http-equiv\s*=\s*["']?refresh["']?[^>]*>/i;
const NOINDEX_META = /<meta[^>]+name\s*=\s*["']?robots["']?[^>]+noindex/i;

/**
 * Everything about a built file this suite needs, decided once. `role` drives
 * the samples; `kind` decides which checks apply.
 *
 *   kind "redirect"  an alias-redirect stub (see the header comment)
 *   kind "error"     404.html — served, but not a published page
 *   kind "page"      everything else
 */
export function classifyPage(siteRoot, absolutePath, html, bytes) {
  const rel = relative(siteRoot, absolutePath).split(sep).join("/");
  const segments = rel.split("/");
  const refresh = REFRESH_META.exec(html);
  if (refresh) {
    return {
      rel,
      path: absolutePath,
      bytes,
      kind: "redirect",
      role: "redirect",
      depth: segments.length - 1,
      refreshTarget: refreshUrl(refresh[0]),
      noindex: NOINDEX_META.test(html),
    };
  }
  const base = { rel, path: absolutePath, bytes, kind: "page", depth: segments.length - 1 };
  if (rel === "404.html") return { ...base, kind: "error", role: "error" };
  if (rel === "index.html") return { ...base, role: "landing" };
  if (segments.length === 1) return { ...base, role: "root-extra" };
  if (segments[0] === "tags") return { ...base, role: "tag" };
  if (segments[0] === "reading") return { ...base, role: "reading-path" };
  if (segments.length === 2 && segments[1] === "index.html") {
    return { ...base, role: "domain-index", domain: segments[0] };
  }
  if (segments.length === 3 && segments[2] === "index.html" && KIND_SEGMENTS.includes(segments[1])) {
    return { ...base, role: "kind-index", domain: segments[0], group: segments[1] };
  }
  if (segments.length === 3 && KIND_SEGMENTS.includes(segments[1])) {
    return {
      ...base,
      role: segments[1] === "sources" ? "reading-note" : segments[1] === "entities" ? "entity" : "concept",
      domain: segments[0],
      group: segments[1],
    };
  }
  return { ...base, role: "other" };
}

function refreshUrl(metaTag) {
  const content = attrValue(metaTag, "content") ?? "";
  const match = /url\s*=\s*(.+)$/i.exec(content.trim());
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
}

/** Every file in the build, with its size. One walk; nothing is stat'ed twice. */
export function walkFiles(root) {
  const files = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch (error) {
      throw new UsageError(`cannot read ${dir}: ${error.message}`);
    }
    for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push({ path: full, bytes: statSync(full).size });
    }
  };
  walk(root);
  return files;
}

/**
 * One to three representative pages per check, resolved against the build
 * rather than hard-coded, because slugs move.
 *
 * The axes that matter are depth and page type, for the reason Property 18
 * gives: grouping is what introduced depths 1 and 2, and a relative injected
 * href fails as a function of depth. So the sample is the largest concept page
 * at depth 2 (most injected hrefs to resolve), a reading note at depth 2 (a
 * different header block, and the type whose search content is cut hardest), a
 * domain index at depth 1, and the Landing_Page plus one generated root page at
 * depth 0. Largest-in-directory rather than first-alphabetically, since the
 * largest page carries the most links and therefore the most ways to be wrong.
 */
export function pickSamples(pages) {
  const largestOf = (role) =>
    pages.filter((page) => page.role === role).sort((a, b) => b.bytes - a.bytes)[0] ?? null;
  return {
    concept: largestOf("concept"),
    readingNote: largestOf("reading-note"),
    entity: largestOf("entity"),
    domainIndex: largestOf("domain-index"),
    landing: pages.find((page) => page.role === "landing") ?? null,
    rootExtra:
      ROOT_EXTRAS.map((slug) => pages.find((page) => page.rel === `${slug}.html`)).find(Boolean) ?? null,
    readingPath: largestOf("reading-path"),
  };
}

// ---------------------------------------------------------------------------
// Link resolution
//
// The single most load-bearing helper in the file, because three requirements
// reduce to it: 5.7 (zero unresolvable internal links), Property 18 via 1.5 /
// 3.6 / 13.3 (every injected header href resolves from any depth), and 5.8
// (every redirect lands somewhere).
//
// A relative href is resolved against the *directory the page is served from*,
// which for both `a/b/slug.html` (served at `/a/b/slug`) and `a/index.html`
// (served at `/a/`) is the file's own directory — so `dirname` is correct in
// both cases and no special-casing of index pages is needed.
//
// "Escapes the site root" is reported separately from "target missing" because
// it is the signature of the specific defect Property 18 exists for: a relative
// injected href that Quartz re-resolved against the page's depth and pushed
// above the root. The two failures need different fixes, so the report
// distinguishes them.
// ---------------------------------------------------------------------------

const EXTERNAL_SCHEME = /^[a-z][a-z0-9+.\-]*:/i;

export function resolveHref(siteRoot, pageDir, rawHref, exists) {
  if (rawHref === null || rawHref.trim() === "") return { status: "skipped", why: "empty href" };
  const href = rawHref.trim();
  if (href.startsWith("#")) return { status: "skipped", why: "same-page fragment" };
  if (href.startsWith("//")) return { status: "skipped", why: "protocol-relative external" };
  if (EXTERNAL_SCHEME.test(href)) return { status: "skipped", why: "absolute URL or non-http scheme" };

  const withoutFragment = href.split("#")[0].split("?")[0];
  if (withoutFragment === "") return { status: "skipped", why: "query or fragment only" };
  let decoded;
  try {
    decoded = decodeURIComponent(withoutFragment);
  } catch {
    decoded = withoutFragment;
  }
  const rooted = resolve(siteRoot);
  // A root-absolute href in the *built* output is unusual: Quartz rewrites the
  // header's root-absolute hrefs to relative form. It is resolved against the
  // build root here and noted, because with a path-prefixed baseURL (this site
  // is served from /ai-engineering-wiki/) a surviving root-absolute href 404s
  // in production even though it resolves against the build directory.
  const candidate = decoded.startsWith("/")
    ? resolve(join(rooted, decoded))
    : resolve(join(pageDir, decoded));
  if (candidate !== rooted && !candidate.startsWith(rooted + sep)) {
    return { status: "escapes", target: candidate, rootAbsolute: decoded.startsWith("/") };
  }
  const attempts = decoded.endsWith("/")
    ? [join(candidate, "index.html")]
    : [candidate, `${candidate}.html`, join(candidate, "index.html")];
  for (const attempt of attempts) {
    if (exists(attempt)) {
      return { status: "ok", target: attempt, rootAbsolute: decoded.startsWith("/") };
    }
  }
  return { status: "missing", target: candidate, attempts, rootAbsolute: decoded.startsWith("/") };
}

// ---------------------------------------------------------------------------
// Reporting helpers
// ---------------------------------------------------------------------------

const bytes = (value) => `${value.toLocaleString("en-US")} B`;
const mib = (value) => `${(value / 1_048_576).toFixed(2)} MiB`;

/**
 * Nearest-rank 95th percentile: sort ascending, take ceil(0.95 * n). Reported
 * with the method named, since "p95" without a method is three different
 * numbers on a 300-item population.
 */
export function percentile(sortedAscending, fraction) {
  if (sortedAscending.length === 0) return 0;
  const rank = Math.ceil(fraction * sortedAscending.length);
  return sortedAscending[Math.min(sortedAscending.length - 1, Math.max(0, rank - 1))];
}

const pass = (detail, measured) => ({ status: "pass", detail, measured, findings: [] });
const fail = (detail, findings, measured) => ({ status: "fail", detail, measured, findings });
const skip = (detail) => ({ status: "skip", detail, findings: [] });

/**
 * A measurement that is printed and never gated: status `report`. A fifth status
 * rather than a `pass`, because `pass` is a claim that something was asserted and
 * held, and these three assert nothing — the site can be over every reference
 * figure and still exit 0. Folding them into `pass` would make "17 passed" mean
 * two different things in one line, which is the failure mode `partial` was
 * added to avoid. Counted as `reported=N` in the RESULT marker and named in the
 * summary, so "no failures" is never read as "every requirement enforced".
 */
const report = (detail, findings, measured) => ({ status: "report", detail, measured, findings });

/**
 * The verdict for a weight measurement. `report` unless --enforce-weight, in
 * which case the original pass/fail gate is restored exactly. `over` is the
 * measurement's own answer to "is this above its reference figure"; findings ride
 * along on every branch, since the register lines and the per-page `whyHeavy()`
 * breakdowns are the reason to read the output at all.
 */
function weightResult(parsed, { over, detail, findings = [], measured }) {
  // Recorded in the JSON report next to the numbers: a consumer reading
  // `overReader: ["log.html"]` has to be able to tell whether that was a breach
  // of a gate or a line of reporting, without knowing which flags the run used.
  const annotated = { ...measured, overReferenceFigure: over, enforced: parsed.enforceWeight };
  if (!parsed.enforceWeight) return report(detail, findings, annotated);
  return over
    ? { status: "fail", detail, measured: annotated, findings }
    : { status: "pass", detail, measured: annotated, findings };
}

/**
 * What to call the three byte figures in prose. They are budgets only while
 * --enforce-weight is passed; the rest of the time calling them budgets would
 * misdescribe a number nothing enforces.
 */
const limitWord = (parsed) => (parsed.enforceWeight ? "budget" : "reference figure");

// ---------------------------------------------------------------------------
// Weight accounting
//
// Every region is measured by removal — find the subtree, take its length, skip
// past it — so nested markup cannot be counted twice and a guessed end tag
// cannot silently undercount. `<span class="katex">` nests `<span>` dozens deep
// on a single formula, which is exactly where a naive non-greedy match reads a
// KaTeX block as 400 bytes instead of 4,000.
// ---------------------------------------------------------------------------

/** Total bytes and count of every non-overlapping subtree opened by `openSource`. */
export function regionBytes(html, openSource, tag) {
  const opener = new RegExp(openSource, "gi");
  let total = 0;
  let count = 0;
  let cursor = 0;
  let match;
  while ((match = opener.exec(html)) !== null) {
    if (match.index < cursor) continue;
    const found = subtree(html.slice(match.index), new RegExp(openSource, "i"), tag);
    if (!found) break;
    total += found.length;
    count += 1;
    cursor = match.index + found.length;
    opener.lastIndex = cursor;
  }
  return { bytes: total, count };
}

const KATEX_OPEN = '<span[^>]*class="[^"]*\\bkatex\\b[^"]*"[^>]*>';
const HEADING_SVG_OPEN = '<svg[^>]*class="[^"]*(?:anchor-icon|external-icon)[^"]*"[^>]*>';

/**
 * Where one page's bytes are, in the terms a fix would be written in. Used to
 * explain a budget failure rather than merely report it: "153,832 B" says a page
 * is too big, "77,072 B of that is 88 KaTeX formulas" says what to do about it.
 */
export function weightBreakdown(page) {
  const served = stripScripts(page.html);
  const katex = regionBytes(served, KATEX_OPEN, "span");
  const headingSvg = regionBytes(page.html, HEADING_SVG_OPEN, "svg");
  const backlinks = subtree(served, /<h3[^>]*>\s*Backlinks\s*<\/h3>/i, "ul") ?? "";
  const header = subtree(served, /<aside[^>]*\bclass\s*=\s*"[^"]*\bkb-header\b[^"]*"[^>]*>/i, "aside") ?? "";
  const article = subtree(served, /<article\b[^>]*>/i, "article") ?? "";
  return {
    katex: katex.bytes,
    formulas: katex.count,
    headingSvg: headingSvg.bytes,
    headings: headingSvg.count,
    backlinks: backlinks.length,
    backlinkEntries: (backlinks.match(/<li\b/gi) ?? []).length,
    header: header.length,
    article: article.length,
    // Everything outside <article>: <head>, the sidebars, the explorer template,
    // the inlined scripts. Near-constant across the build, so a page that is
    // heavy here rather than in its article is heavy for a structural reason.
    chrome: page.html.length - article.length,
  };
}

/** The dominant causes on one page, largest first, as a printable phrase. */
function whyHeavy(page) {
  const b = weightBreakdown(page);
  const parts = [
    b.katex > 0 ? [b.katex, `KaTeX ${bytes(b.katex)} in ${b.formulas} formula${b.formulas === 1 ? "" : "s"}`] : null,
    b.backlinks > 0 ? [b.backlinks, `backlinks panel ${bytes(b.backlinks)} for ${b.backlinkEntries} inbound page${b.backlinkEntries === 1 ? "" : "s"}`] : null,
    b.headingSvg > 0 ? [b.headingSvg, `heading anchor SVG ${bytes(b.headingSvg)} across ${b.headings}`] : null,
    b.header > 0 ? [b.header, `injected header ${bytes(b.header)}`] : null,
  ].filter(Boolean).sort((x, y) => y[0] - x[0]);
  // The four regions are disjoint in every build measured — KaTeX spans, heading
  // anchor SVGs, the backlinks list and the header aside do not nest in each
  // other — so subtracting their sum is sound. Clamped anyway, because a
  // remainder printed as a negative number would read as a measurement error and
  // distract from the finding it is attached to.
  const named = parts.reduce((sum, part) => sum + part[0], 0);
  return `${parts.map((part) => part[1]).join(", ")}${parts.length ? "; " : ""}remaining prose and chrome ${bytes(Math.max(0, page.bytes - named))}`;
}

/**
 * Reader pages and registers, split by the manifest's own `unlisted` list rather
 * than by a list kept here. See REGISTER_MAX_BYTES for why the split exists.
 */
export function partitionRegisters(contentPages, unlisted) {
  const registerSlugs = new Set(unlisted.map((slug) => slug.toLowerCase()));
  const reader = [];
  const registers = [];
  for (const page of contentPages) {
    (registerSlugs.has(slugOf(page.rel).toLowerCase()) ? registers : reader).push(page);
  }
  return { reader, registers };
}

/**
 * A register's headroom expressed in further entries, so its ceiling reads as a
 * deadline rather than an allowance. An entry is an <h2> in the article, which is
 * what one `## [date] op | title` block in log.md becomes.
 */
function registerRunway(page, ceiling) {
  const article = subtree(stripScripts(page.html), /<article\b[^>]*>/i, "article") ?? "";
  const entries = (article.match(/<h2\b/gi) ?? []).length;
  if (entries < 3) return null;
  const perEntry = Math.round(article.length / entries);
  return { entries, perEntry, remaining: Math.max(0, Math.floor((ceiling - page.bytes) / perEntry)) };
}

// ---------------------------------------------------------------------------
// The checks
//
// Each entry: an id for --only/--skip, the requirements it discharges, and a
// run() returning {status, detail, findings, measured}. Every failing check
// reports the measured value next to its budget or its expectation — Property 35
// applies to structural checks as much as to byte budgets, so "3 pages have 2
// h1 elements, expected 1" is the shape, never "h1 check failed".
//
// The first three are measurements rather than gates: they report status
// `report` and their requirement ids are marked "(reported)". Requirement 10.6's
// fail-the-build clause no longer reaches them — it now covers 10.1 and 10.5,
// the two criteria in that requirement still enforced. See the ADR-014 section
// in the file header.
// ---------------------------------------------------------------------------

export const CHECKS = [
  {
    id: "weight-max",
    requirements: "10.2 (reported)",
    title: "the heaviest published page, measured and reported, registers measured separately",
    run: ({ contentPages, parsed, unlisted, unlistedSource }) => {
      const limit = limitWord(parsed);
      const { reader, registers } = partitionRegisters(contentPages, unlisted);
      const heaviestOf = (list) => list.reduce((a, b) => (b.bytes > a.bytes ? b : a), list[0] ?? null);
      const overReader = reader.filter((page) => page.bytes > parsed.maxBytes).sort((a, b) => b.bytes - a.bytes);
      const overRegister = registers.filter((page) => page.bytes > REGISTER_MAX_BYTES).sort((a, b) => b.bytes - a.bytes);
      const readerTop = heaviestOf(reader);
      const registerTop = heaviestOf(registers);
      const byBytes = [...registers].sort((a, b) => b.bytes - a.bytes);

      // Printed on every run, whatever the verdict. The partition is only honest
      // if the pages it moves out of the Reader population are named with their
      // sizes — and with nothing gated, this is the only place the log's size is
      // reported at all.
      const registerLines = byBytes.map((page) => {
        const runway = registerRunway(page, REGISTER_MAX_BYTES);
        const overReaderCeiling = page.bytes > parsed.maxBytes
          ? `, which is ${bytes(page.bytes - parsed.maxBytes)} above the Reader ${limit} of ${bytes(parsed.maxBytes)} and is counted as a register instead`
          : "";
        const runwayNote = runway
          ? `; ${runway.entries} entries at ${bytes(runway.perEntry)} each, so ${runway.remaining} further entries before the ceiling — then it is pagination, not a bigger number`
          : "";
        return `register ${page.rel}: measured ${bytes(page.bytes)} against the register ceiling of ${bytes(REGISTER_MAX_BYTES)}${overReaderCeiling}${runwayNote}`;
      });
      const partitionNote =
        `${reader.length} Reader pages measured against ${bytes(parsed.maxBytes)}; ` +
        `${registers.length} registers (${byBytes.map((page) => slugOf(page.rel)).join(", ") || "none"}) measured against ` +
        `${bytes(REGISTER_MAX_BYTES)} because the pipeline marks them unlisted per ${unlistedSource}, ` +
        "so search, the explorer and the graph never reach them and their size tracks how much the vault has ingested";
      const measured = {
        readerPages: reader.length,
        readerMaxBytes: readerTop?.bytes ?? 0,
        readerMaxPage: readerTop?.rel ?? null,
        readerBudget: parsed.maxBytes,
        registerPages: registers.map((page) => ({ page: page.rel, bytes: page.bytes })),
        registerBudget: REGISTER_MAX_BYTES,
        registerSource: unlistedSource,
        overReader: overReader.map((page) => page.rel),
        overRegister: overRegister.map((page) => page.rel),
      };

      const over = overReader.length > 0 || overRegister.length > 0;
      // Both details keep the wording they had as a gate, so the printed output
      // reads the same whether or not --enforce-weight decided the verdict; only
      // "budget" softens to "reference figure". The over-figure lines keep
      // whyHeavy()'s breakdown, which is the diagnostic worth having even when
      // nothing fails: it says where the bytes are, in the terms a fix is
      // written in.
      const detail = over
        ? `${overReader.length} of ${reader.length} Reader pages exceed ${bytes(parsed.maxBytes)}` +
          (overRegister.length > 0 ? ` and ${overRegister.length} of ${registers.length} registers exceed ${bytes(REGISTER_MAX_BYTES)}` : "") +
          `; heaviest ${bytes((overReader[0] ?? overRegister[0]).bytes)} at ${(overReader[0] ?? overRegister[0]).rel} — ${partitionNote}`
        : (readerTop
            ? `heaviest Reader page ${readerTop.rel} at ${bytes(readerTop.bytes)}, ${limit} ${bytes(parsed.maxBytes)}, ${bytes(parsed.maxBytes - readerTop.bytes)} of headroom`
            : "no Reader pages in this build") +
          `; heaviest register ${registerTop ? `${registerTop.rel} at ${bytes(registerTop.bytes)}` : "none"} — ${partitionNote}`;
      // The register lines ride along whatever the verdict. An exception that is
      // only printed when something else fails is an exception nobody reads.
      const findings = over
        ? [
            ...overReader.map((page) => `${page.rel}: measured ${bytes(page.bytes)}, Reader ${limit} ${bytes(parsed.maxBytes)}, over by ${bytes(page.bytes - parsed.maxBytes)} — ${whyHeavy(page)}`),
            ...overRegister.map((page) => `${page.rel}: measured ${bytes(page.bytes)}, register ceiling ${bytes(REGISTER_MAX_BYTES)}, over by ${bytes(page.bytes - REGISTER_MAX_BYTES)} — the ceiling is a deadline for paginating this register, and it has arrived`),
            ...registerLines,
          ]
        : registerLines;
      return weightResult(parsed, { over, detail, findings, measured });
    },
  },
  {
    id: "weight-p95",
    requirements: "10.3 (reported)",
    title: "the 95th-percentile Reader page, measured and reported",
    run: ({ contentPages, parsed, unlisted, unlistedSource }) => {
      const limit = limitWord(parsed);
      const { reader, registers } = partitionRegisters(contentPages, unlisted);
      if (reader.length === 0) {
        return skip(
          `every one of the ${contentPages.length} content pages in this build is a register per ${unlistedSource}, ` +
            "so there is no Reader population to take a p95 over and Requirement 10.3 went unmeasured"
        );
      }
      const readerBytes = reader.map((page) => page.bytes).sort((a, b) => a - b);
      const allBytes = contentPages.map((page) => page.bytes).sort((a, b) => a - b);
      const value = percentile(readerBytes, 0.95);
      const allValue = percentile(allBytes, 0.95);
      const over = reader.filter((page) => page.bytes > parsed.p95Bytes).sort((a, b) => b.bytes - a.bytes);
      // Both figures, always. The partition must not be able to hide anything:
      // if excluding the registers were what got this under budget, the two
      // numbers printed side by side would say so.
      const how =
        `nearest-rank p95 over ${readerBytes.length} Reader pages (median ${bytes(percentile(readerBytes, 0.5))}, ` +
        `${over.length} above the ${limit}); over all ${allBytes.length} content pages including the ${registers.length} registers it is ${bytes(allValue)}. ` +
        `Registers are listed by weight-max and get no p95 of their own: with ${registers.length} of them the nearest-rank p95 is just the maximum, which weight-max already reports. ` +
        `The all-content-pages figure is the one comparable to a pre-feature measurement: the 68 KB in Requirement 10.3 was taken over a population that included redirect stubs, which are excluded here`;
      const measured = {
        p95Bytes: value,
        budget: parsed.p95Bytes,
        readerPopulation: readerBytes.length,
        readerMedian: percentile(readerBytes, 0.5),
        readerOverBudget: over.length,
        allPagesP95: allValue,
        allPopulation: allBytes.length,
        registerPages: registers.map((page) => slugOf(page.rel)),
        registerSource: unlistedSource,
      };
      if (value <= parsed.p95Bytes) {
        return weightResult(parsed, {
          over: false,
          detail: `p95 ${bytes(value)}, ${limit} ${bytes(parsed.p95Bytes)}, ${bytes(parsed.p95Bytes - value)} of headroom — ${how}`,
          measured,
        });
      }

      // Over the figure, so the report has to be good enough to act on whether or
      // not it gates anything: what kind of page is over, where the bytes are on
      // each one, and what the whole build spends on each candidate lever.
      const byRole = new Map();
      for (const page of over) byRole.set(page.role, (byRole.get(page.role) ?? 0) + 1);
      const totals = { katex: 0, katexPages: 0, backlinks: 0, headingSvg: 0, header: 0, headerOver4096: 0 };
      for (const page of reader.concat(registers)) {
        const b = weightBreakdown(page);
        totals.katex += b.katex;
        if (b.katex > 0) totals.katexPages += 1;
        totals.backlinks += b.backlinks;
        totals.headingSvg += b.headingSvg;
        totals.header += b.header;
        if (b.header > 4096) totals.headerOver4096 += 1;
      }
      measured.populationTotals = totals;
      const levers = [
        `across all ${contentPages.length} built pages the candidate levers measure: KaTeX ${bytes(totals.katex)} on ${totals.katexPages} pages, ` +
          `backlinks panels ${bytes(totals.backlinks)}, heading anchor SVG ${bytes(totals.headingSvg)}, injected Page_Header ${bytes(totals.header)} ` +
          `(${totals.headerOver4096} pages over the ${bytes(4096)} Requirement 10.1 allows per page)`,
        `the pages over the ${limit} are ${[...byRole.entries()].sort((a, b) => b[1] - a[1]).map(([role, count]) => `${count} ${role}`).join(", ")}, ` +
          "so this is not one outlier type: it is ordinary Reader prose plus Quartz's own tag and folder listings",
      ];
      return weightResult(parsed, {
        over: true,
        detail: `p95 measured ${bytes(value)} against a ${limit} of ${bytes(parsed.p95Bytes)}, over by ${bytes(value - parsed.p95Bytes)} — ${how}`,
        findings: [
          ...over.map((page) => `${page.rel}: ${bytes(page.bytes)}, ${limit} ${bytes(parsed.p95Bytes)}, over by ${bytes(page.bytes - parsed.p95Bytes)} — ${whyHeavy(page)}`),
          ...levers,
        ],
        measured,
      });
    },
  },
  {
    id: "weight-total",
    requirements: "10.4 (reported)",
    title: "the whole built output, measured and reported",
    run: ({ files, parsed, siteRoot }) => {
      const limit = limitWord(parsed);
      const total = files.reduce((sum, file) => sum + file.bytes, 0);
      const measured = { totalBytes: total, budget: parsed.totalBytes, files: files.length };
      if (total <= parsed.totalBytes) {
        return weightResult(parsed, {
          over: false,
          detail: `${bytes(total)} (${mib(total)}) across ${files.length} files, ${limit} ${bytes(parsed.totalBytes)} (${mib(parsed.totalBytes)})`,
          measured,
        });
      }
      // The heaviest directories, so a build over the figure says where the weight is.
      const byTop = new Map();
      for (const file of files) {
        const key = relative(siteRoot, file.path).split(sep)[0] ?? ".";
        byTop.set(key, (byTop.get(key) ?? 0) + file.bytes);
      }
      return weightResult(parsed, {
        over: true,
        detail: `built output measures ${bytes(total)} (${mib(total)}) against a ${limit} of ${bytes(parsed.totalBytes)} (${mib(parsed.totalBytes)}), over by ${bytes(total - parsed.totalBytes)}`,
        findings: [...byTop.entries()].sort((a, b) => b[1] - a[1]).map(([key, size]) => `${key}: ${bytes(size)} (${mib(size)})`),
        measured,
      });
    },
  },
  {
    id: "h1-single",
    requirements: "11.1",
    title: "exactly one <h1> per published page, Quartz's own listings named and exempt",
    run: ({ contentPages }) => {
      const counts = contentPages.map((page) => {
        const served = stripScripts(page.html);
        return {
          page,
          count: countTags(served, "h1"),
          // The evidence half of the exemption: every page tools/publish.py
          // writes carries an injected header, so a page without one is not a
          // page this pipeline published. See QUARTZ_GENERATED_LISTINGS.
          hasHeader: HEADER_OPEN.test(served),
        };
      });
      const exempt = counts.filter((entry) => QUARTZ_GENERATED_LISTINGS.has(entry.page.rel) && !entry.hasHeader);
      const published = counts.filter((entry) => !exempt.includes(entry));
      const wrong = published.filter((entry) => entry.count !== 1);
      const distributionOf = (list) => Object.fromEntries(
        [...list.reduce((map, entry) => map.set(entry.count, (map.get(entry.count) ?? 0) + 1), new Map())].sort()
      );
      // Reported, not swallowed: named, with the measured count and the reason,
      // whether the check passes or fails.
      const exemptNote = exempt.length === 0
        ? [...QUARTZ_GENERATED_LISTINGS].every((rel) => !contentPages.some((page) => page.rel === rel))
          ? `no Quartz-generated listing page in this build, so nothing was exempted (${[...QUARTZ_GENERATED_LISTINGS].join(", ")} looked for)`
          : `nothing exempted: ${[...QUARTZ_GENERATED_LISTINGS].join(", ")} is in the build but now carries an injected header, so the pipeline publishes it and Requirement 11.1 applies`
        : `exempt and reported: ${exempt.map((entry) => `${entry.page.rel} measured ${entry.count} <h1>`).join(", ")} — Quartz's own tag listing, emitted title-less and not written by tools/publish.py (no injected header, no tags.md in the staged content, and tags/index.html carries the titled copy), so Requirement 11.1's "published page" does not reach it and fixing it would mean patching Quartz`;
      const measured = {
        publishedPages: published.length,
        withOne: published.filter((entry) => entry.count === 1).length,
        distribution: distributionOf(published),
        exempt: exempt.map((entry) => ({ page: entry.page.rel, h1: entry.count, reason: "Quartz-generated listing, no injected header" })),
        distributionIncludingExempt: distributionOf(counts),
      };
      if (wrong.length === 0) {
        return pass(`all ${published.length} published pages carry exactly 1 <h1>; ${exemptNote}`, measured);
      }
      return fail(
        `${wrong.length} of ${published.length} published pages do not carry exactly 1 <h1>; measured counts ${JSON.stringify(measured.distribution)}, expected {"1": ${published.length}}. ${exemptNote}`,
        wrong.sort((a, b) => b.count - a.count).map((entry) => `${entry.page.rel}: measured ${entry.count} <h1> elements, expected 1`),
        measured
      );
    },
  },
  {
    id: "meta-description",
    requirements: "2.2",
    title: "<meta name=\"description\"> present and non-empty",
    run: ({ contentPages }) => {
      const findings = [];
      for (const page of contentPages) {
        const tag = /<meta[^>]+name\s*=\s*["']?description["']?[^>]*>/i.exec(page.html);
        if (!tag) {
          findings.push(`${page.rel}: no <meta name="description"> at all`);
          continue;
        }
        const content = attrValue(tag[0], "content");
        if (content === null || content.trim() === "") {
          findings.push(`${page.rel}: <meta name="description"> present but empty (measured 0 characters)`);
        }
      }
      const measured = { pages: contentPages.length, missingOrEmpty: findings.length };
      if (findings.length === 0) {
        const lengths = contentPages
          .map((page) => (attrValue(/<meta[^>]+name\s*=\s*["']?description["']?[^>]*>/i.exec(page.html)?.[0] ?? "", "content") ?? "").length)
          .sort((a, b) => a - b);
        return pass(
          `all ${contentPages.length} content pages carry a non-empty description (shortest ${lengths[0]} characters, median ${percentile(lengths, 0.5)})`,
          measured
        );
      }
      return fail(
        `${findings.length} of ${contentPages.length} content pages lack a usable <meta name="description">, expected 0`,
        findings,
        measured
      );
    },
  },
  {
    id: "links-resolve",
    requirements: "5.7",
    title: "zero unresolvable internal links, across all pages",
    run: ({ contentPages, siteRoot, exists }) => {
      const findings = [];
      let internal = 0;
      let external = 0;
      let rootAbsolute = 0;
      for (const page of contentPages) {
        const pageDir = dirname(page.path);
        for (const anchor of anchors(stripScripts(page.html))) {
          const result = resolveHref(siteRoot, pageDir, anchor.href, exists);
          if (result.status === "skipped") {
            external += 1;
            continue;
          }
          internal += 1;
          if (result.rootAbsolute) rootAbsolute += 1;
          if (result.status === "ok") continue;
          const label = anchor.text ? ` (link text ${JSON.stringify(anchor.text.slice(0, 60))})` : "";
          findings.push(
            result.status === "escapes"
              ? `${page.rel}: href ${JSON.stringify(anchor.href)} escapes the site root, resolving to ${result.target}${label}` +
                  " — this is the relative-href-at-depth defect Property 18 describes"
              : `${page.rel}: href ${JSON.stringify(anchor.href)} resolves to nothing; tried ${result.attempts.map((a) => relative(siteRoot, a)).join(", ")}${label}`
          );
        }
      }
      const measured = { internalLinks: internal, externalLinks: external, unresolvable: findings.length, rootAbsolute };
      const note = rootAbsolute > 0
        ? ` ${rootAbsolute} internal href(s) are root-absolute in the built HTML; they resolve against the build root but 404 under a path-prefixed baseURL`
        : "";
      if (findings.length === 0) {
        return pass(`${internal.toLocaleString("en-US")} internal links across ${contentPages.length} pages all resolve, 0 unresolvable (expected 0); ${external.toLocaleString("en-US")} external or non-http hrefs skipped.${note}`, measured);
      }
      return fail(
        `measured ${findings.length} unresolvable internal links of ${internal.toLocaleString("en-US")} checked, budget 0.${note}`,
        findings,
        measured
      );
    },
  },
  {
    id: "redirect-targets",
    requirements: "5.8",
    title: "every alias-redirect stub points at a page that was built",
    run: ({ redirects, siteRoot, exists }) => {
      if (redirects.length === 0) {
        return skip(
          "no redirect stubs in the build. Requirement 5.8 wants one per changed URL, so 0 is " +
            "suspicious rather than clean — but with nothing to resolve this check has no subject."
        );
      }
      const findings = [];
      for (const stub of redirects) {
        if (!stub.refreshTarget) {
          findings.push(`${stub.rel}: <meta http-equiv="refresh"> carries no url= target`);
          continue;
        }
        const result = resolveHref(siteRoot, dirname(stub.path), stub.refreshTarget, exists);
        if (result.status === "ok") continue;
        findings.push(
          `${stub.rel}: redirect target ${JSON.stringify(stub.refreshTarget)} ${result.status === "escapes" ? `escapes the site root (${result.target})` : "resolves to nothing"}`
        );
      }
      const noindexed = redirects.filter((stub) => stub.noindex).length;
      const measured = { stubs: redirects.length, broken: findings.length, withNoindex: noindexed };
      if (findings.length === 0) {
        return pass(
          `${redirects.length} redirect stubs, all targets resolve (0 broken, expected 0); ${noindexed} of ${redirects.length} also carry robots:noindex`,
          measured
        );
      }
      return fail(`measured ${findings.length} broken redirect targets of ${redirects.length} stubs, budget 0`, findings, measured);
    },
  },
];

// A check that ran, verified a real precondition, and could not verify the whole
// claim from static files. Never a pass and never a failure; counted and named
// in the summary so the gap is visible in CI output rather than implied.
const partial = (detail, findings = []) => ({ status: "partial", detail, findings });

/** The named sample pages that exist, as an array. */
function sampled(samples, ...names) {
  return names.map((name) => samples[name]).filter(Boolean);
}

/** A built file's slug as contentIndex.json spells it: the path minus `.html`. */
export function slugOf(rel) {
  return rel.replace(/\.html$/, "");
}

const HEADER_OPEN = /<aside[^>]*\bclass\s*=\s*"[^"]*\bkb-header\b[^"]*"[^>]*>/i;

CHECKS.push(
  {
    id: "header-present",
    requirements: "11.11",
    title: "the Page_Header is in the served HTML, outside any <script>",
    run: ({ samples }) => {
      const pages = sampled(samples, "concept", "readingNote", "domainIndex");
      if (pages.length === 0) return skip("no concept, reading-note or domain-index page in the build to sample");
      const findings = [];
      const seen = [];
      for (const page of pages) {
        // stripScripts() is the whole point: a header that exists only inside a
        // <script> payload is exactly what Requirement 11.11 forbids, and it
        // would satisfy a naive substring search on the raw file.
        const served = stripScripts(page.html);
        const inRaw = HEADER_OPEN.test(page.html);
        const block = subtree(served, new RegExp(HEADER_OPEN.source, "i"), "aside");
        if (!block) {
          findings.push(
            inRaw
              ? `${page.rel}: a kb-header appears in the file but not outside <script>/<style> — it renders only if client-side scripting runs, which Requirement 11.11 forbids`
              : `${page.rel}: no element with class kb-header in the served HTML (measured 0, expected 1)`
          );
          continue;
        }
        const parts = ["kb-type", "kb-summary", "kb-trust"].filter((cls) => block.includes(cls));
        if (parts.length < 3) {
          findings.push(
            `${page.rel}: kb-header present but missing ${["kb-type", "kb-summary", "kb-trust"].filter((cls) => !parts.includes(cls)).join(", ")} ` +
              `(measured ${parts.length} of 3 required parts)`
          );
          continue;
        }
        seen.push(`${page.rel} (${bytes(block.length)}, depth ${page.depth})`);
      }
      const measured = { sampled: pages.length, withHeader: seen.length };
      if (findings.length === 0) {
        return pass(`type, summary and trust rendered server-side on all ${pages.length} sampled pages: ${seen.join("; ")}`, measured);
      }
      return fail(`${findings.length} of ${pages.length} sampled pages do not carry a server-rendered Page_Header, expected 0`, findings, measured);
    },
  },
  {
    id: "header-hrefs",
    requirements: "1.5, 3.6, 13.3 (Property 18)",
    title: "every injected header href resolves, sampled at depth 2 and depth 1",
    run: ({ samples, siteRoot, exists }) => {
      // Depth is the axis: grouping created depths 1 and 2, and a relative
      // injected href fails as a function of depth. Two depth-2 page types plus
      // one depth-1 domain index covers it.
      const pages = sampled(samples, "concept", "readingNote", "domainIndex");
      if (pages.length === 0) return skip("no page at depth 1 or depth 2 in the build to sample");
      const findings = [];
      let resolved = 0;
      let escaped = 0;
      const perPage = [];
      let trustLinks = 0;
      for (const page of pages) {
        const block = subtree(stripScripts(page.html), new RegExp(HEADER_OPEN.source, "i"), "aside");
        if (!block) {
          findings.push(
            `${page.rel} (depth ${page.depth}): no kb-header in the served HTML, so its trust link and Relationship_Panel hrefs cannot be resolved — Requirements 1.5, 3.6 and 13.3 are unmet on this page, not merely unmeasured`
          );
          continue;
        }
        const found = anchors(block);
        let ok = 0;
        for (const anchor of found) {
          const result = resolveHref(siteRoot, dirname(page.path), anchor.href, exists);
          if (result.status === "skipped") continue;
          if (result.status === "ok") {
            ok += 1;
            resolved += 1;
            if (/(^|\/)trust(\.html)?$/.test(relative(siteRoot, result.target).split(sep).join("/").replace(/\.html$/, ""))) {
              trustLinks += 1;
            }
            continue;
          }
          if (result.status === "escapes") escaped += 1;
          findings.push(
            `${page.rel} (depth ${page.depth}): injected href ${JSON.stringify(anchor.href)} ` +
              (result.status === "escapes"
                ? `escapes the site root, resolving to ${result.target}. This is the Property 18 defect: an injected href that was relative rather than root-absolute gets re-resolved against the page's own depth.`
                : `resolves to nothing; tried ${result.attempts.map((a) => relative(siteRoot, a)).join(", ")}`)
          );
        }
        perPage.push(`${page.rel} depth ${page.depth}: ${ok}/${found.length} hrefs resolve`);
      }
      const measured = { sampled: pages.length, resolved, unresolved: findings.length, escapingRoot: escaped, trustLinks };
      if (findings.length === 0 && trustLinks < pages.length) {
        return fail(
          `every injected href resolves, but only ${trustLinks} of ${pages.length} sampled pages link the trust page from the header; Requirement 13.3 asks for all of them`,
          perPage,
          measured
        );
      }
      if (findings.length === 0) {
        return pass(`${resolved} injected hrefs resolve across ${pages.length} pages at depths ${[...new Set(pages.map((p) => p.depth))].sort().join(" and ")}, 0 unresolvable (expected 0); trust link present on all ${trustLinks}`, measured);
      }
      return fail(
        `measured ${findings.length} unresolvable injected hrefs (${escaped} of them escaping the site root) against a budget of 0, over ${pages.length} sampled pages`,
        [...findings, ...perPage],
        measured
      );
    },
  },
  {
    id: "backlinks",
    requirements: "3.7",
    title: "the backlinks panel lists the expected inbound pages",
    run: ({ samples, index, siteRoot, exists }) => {
      if (!index) return skip("no readable contentIndex.json, so the expected inbound set cannot be computed");
      const pages = sampled(samples, "concept", "readingNote");
      if (pages.length === 0) return skip("no concept or reading-note page in the build to sample");
      const findings = [];
      const notes = [];
      for (const page of pages) {
        const slug = slugOf(page.rel);
        // The expected set comes from the index that shipped, so it is already
        // a subset of the true link graph: the trim step drops Catalog_Pages and
        // the log, while Quartz computed the panel from the untrimmed graph. The
        // assertion is therefore expected-subset-of-rendered, which is sound
        // under trimming in a way that set equality would not be.
        const expected = [];
        for (const [otherSlug, entry] of Object.entries(index)) {
          if (otherSlug === slug) continue;
          if ((entry.links ?? []).includes(slug)) expected.push(otherSlug);
        }
        const panel = subtree(stripScripts(page.html), /<h3[^>]*>\s*Backlinks\s*<\/h3>/i, "ul")
          ?? subtree(stripScripts(page.html), /<(div|aside)[^>]*\bclass\s*=\s*"[^"]*\bbacklinks\b[^"]*"[^>]*>/i, "div");
        if (!panel) {
          findings.push(`${page.rel}: no backlinks panel in the served HTML, expected one listing ${expected.length} inbound page(s)`);
          continue;
        }
        const rendered = new Set();
        for (const anchor of anchors(panel)) {
          const result = resolveHref(siteRoot, dirname(page.path), anchor.href, exists);
          if (result.status !== "ok") continue;
          rendered.add(slugOf(relative(siteRoot, result.target).split(sep).join("/")));
        }
        const missing = expected.filter((other) => !rendered.has(other));
        if (expected.length === 0) {
          notes.push(`${page.rel}: the index records no inbound links, so the panel has nothing to list (rendered ${rendered.size})`);
          continue;
        }
        if (missing.length > 0) {
          findings.push(
            `${page.rel}: measured ${expected.length - missing.length} of ${expected.length} expected inbound pages in the panel (${rendered.size} entries rendered); missing ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? ` and ${missing.length - 8} more` : ""}`
          );
          continue;
        }
        notes.push(`${page.rel}: all ${expected.length} inbound pages from the index appear among the ${rendered.size} rendered entries`);
      }
      const measured = { sampled: pages.length, failing: findings.length };
      if (findings.length === 0) return pass(notes.join("; ") || "nothing to compare", measured);
      return fail(`${findings.length} of ${pages.length} sampled pages have an incomplete backlinks panel, expected 0`, [...findings, ...notes], measured);
    },
  },
  {
    id: "breadcrumb",
    requirements: "5.10",
    title: "the breadcrumb names the domain and the kind",
    run: ({ samples, siteRoot, exists }) => {
      const pages = sampled(samples, "concept", "readingNote", "entity").filter((page) => page.domain && page.group);
      if (pages.length === 0) return skip("no <domain>/<kind>/<slug> page in the build to sample");
      const findings = [];
      const notes = [];
      for (const page of pages) {
        const nav = subtree(stripScripts(page.html), /<nav[^>]*\bclass\s*=\s*"[^"]*\bbreadcrumb-container\b[^"]*"[^>]*>/i, "nav");
        if (!nav) {
          findings.push(`${page.rel}: no breadcrumb-container in the served HTML (measured 0, expected 1)`);
          continue;
        }
        const trail = anchors(nav).map((anchor) => {
          const result = resolveHref(siteRoot, dirname(page.path), anchor.href, exists);
          return {
            text: anchor.text,
            slug: result.status === "ok" ? slugOf(relative(siteRoot, result.target).split(sep).join("/")) : null,
          };
        });
        // "Names the domain" is satisfied by a crumb that resolves to the
        // domain's Map_Page, since that page's title is the domain's
        // reader-facing name. "Names the kind" accepts either a crumb resolving
        // to the kind folder page or a crumb whose text is the kind segment,
        // because Quartz labels a folder crumb from the directory name.
        const namesDomain = trail.some((crumb) => crumb.slug === `${page.domain}/index`)
          || trail.some((crumb) => crumb.text.toLowerCase().includes(page.domain.replace(/-/g, " ")));
        const namesKind = trail.some((crumb) => crumb.slug === `${page.domain}/${page.group}/index`)
          || trail.some((crumb) => crumb.text.trim().toLowerCase() === page.group);
        const rendered = trail.map((crumb) => crumb.text || "(current)").join(" > ");
        if (!namesDomain || !namesKind) {
          findings.push(
            `${page.rel}: breadcrumb ${JSON.stringify(rendered)} does not name ${[!namesDomain ? `the domain (${page.domain})` : null, !namesKind ? `the kind (${page.group})` : null].filter(Boolean).join(" or ")}`
          );
          continue;
        }
        notes.push(`${page.rel}: ${rendered}`);
      }
      const measured = { sampled: pages.length, failing: findings.length };
      if (findings.length === 0) return pass(notes.join(" | "), measured);
      return fail(`${findings.length} of ${pages.length} sampled breadcrumbs do not name both domain and kind, expected 0`, [...findings, ...notes], measured);
    },
  }
);

CHECKS.push(
  {
    id: "explorer-collapsed",
    requirements: "8.5",
    title: "the explorer ships with its folders collapsed",
    run: ({ samples }) => {
      const page = sampled(samples, "concept", "domainIndex", "landing")[0];
      if (!page) return skip("no page in the build to sample");
      const served = stripScripts(page.html);
      // `explorer` as a whole class token, not a prefix: the same page also
      // carries `.explorer-content` and `.explorer-ul`, and a `\bexplorer\b`
      // pattern would happily read data-collapsed off the wrong element.
      const container = /<div[^>]*\bclass\s*=\s*"(?:[^"]*\s)?explorer(?:\s[^"]*)?"[^>]*>/i.exec(served);
      if (!container) {
        return fail(`${page.rel}: no explorer container in the served HTML (measured 0, expected 1)`, [], { found: false });
      }
      const collapsed = attrValue(container[0], "data-collapsed");
      const saveState = attrValue(container[0], "data-savestate");
      const measured = { page: page.rel, dataCollapsed: collapsed, dataSavestate: saveState };
      if (collapsed !== "collapsed") {
        return fail(
          `${page.rel}: explorer data-collapsed measured ${JSON.stringify(collapsed)}, expected "collapsed" — every folder, the ${KIND_SEGMENTS.length} kind folders included, starts expanded and a Reader meets the full list`,
          [container[0].slice(0, 300)],
          measured
        );
      }
      // Said plainly rather than implied: the tree is built client-side from
      // contentIndex.json, so the served attribute is the initial state and the
      // only thing a static reader can see. data-savestate="true" means a
      // Reader's own earlier expansion is restored from localStorage, which is
      // deliberate Quartz behaviour and not a violation of 8.5.
      return pass(
        `${page.rel}: explorer serves data-collapsed="collapsed", so every folder including each domain's sources/ starts collapsed` +
          (saveState === "true" ? "; data-savestate=\"true\", so a Reader's own earlier expansion is restored — that is per-Reader state, not the served default" : ""),
        measured
      );
    },
  },
  {
    id: "explorer-button",
    requirements: "11.7",
    title: "the explorer folder control is a <button>",
    run: ({ samples }) => {
      const page = sampled(samples, "concept", "domainIndex", "landing")[0];
      if (!page) return skip("no page in the build to sample");
      // The folder rows are cloned from <template id="template-folder"> at run
      // time, so the template *is* the control's markup and is checkable
      // statically. A <div> or <span> here is the accessibility defect
      // Requirement 11.7 guards against: not focusable, not activatable by
      // Enter or Space, no implicit button role.
      const template = subtree(page.html, /<template[^>]*\bid\s*=\s*"template-folder"[^>]*>/i, "template");
      if (!template) {
        return fail(
          `${page.rel}: no <template id="template-folder"> in the served HTML, so the folder control's markup cannot be identified (measured 0, expected 1)`,
          [], { found: false }
        );
      }
      const control = /<(button|div|span|a)\b[^>]*\bclass\s*=\s*"[^"]*\bfolder-button\b[^"]*"[^>]*>/i.exec(template);
      if (!control) {
        return fail(`${page.rel}: template-folder contains no .folder-button control (measured 0, expected 1 <button>)`, [template.slice(0, 400)], { found: false });
      }
      const tag = control[1].toLowerCase();
      const measured = { page: page.rel, element: tag };
      if (tag !== "button") {
        return fail(
          `${page.rel}: the explorer folder control is a <${tag}>, expected <button> — a <${tag}> takes no keyboard focus and cannot be activated with Enter or Space`,
          [control[0]],
          measured
        );
      }
      return pass(`${page.rel}: folder control is <button class="folder-button">, focusable and activatable by keyboard`, measured);
    },
  },
  {
    id: "nojs-nav",
    requirements: "11.10",
    title: "root and catalog links are present without JavaScript",
    run: ({ samples, siteRoot, exists, index }) => {
      const pages = sampled(samples, "concept", "readingNote", "rootExtra");
      if (pages.length === 0) return skip("no page in the build to sample");
      const catalogSlugs = new Set(["catalog", "catalog-sources"]);
      const findings = [];
      const notes = [];
      for (const page of pages) {
        const served = stripScripts(page.html);
        // A link inside the backlinks panel is a route only by accident — it
        // exists because the catalog happens to link to this page. The route
        // Requirement 11.10 asks for has to be structural, so a catalog link
        // found only among the backlinks does not count, and the finding says so.
        const panel = subtree(served, /<h3[^>]*>\s*Backlinks\s*<\/h3>/i, "ul") ?? "";
        const structural = panel ? served.replace(panel, "") : served;
        const classify = (html) => {
          let root = false;
          let catalog = false;
          for (const anchor of anchors(html)) {
            const result = resolveHref(siteRoot, dirname(page.path), anchor.href, exists);
            if (result.status !== "ok") continue;
            const slug = slugOf(relative(siteRoot, result.target).split(sep).join("/"));
            if (slug === "index") root = true;
            if (catalogSlugs.has(slug)) catalog = true;
          }
          return { root, catalog };
        };
        const outside = classify(structural);
        const anywhere = classify(served);
        if (outside.root && outside.catalog) {
          notes.push(`${page.rel}: both routes present in the served HTML outside <script> and outside the backlinks panel`);
          continue;
        }
        const missing = [];
        if (!outside.root) missing.push(anywhere.root ? "a link to the Landing_Page only inside the backlinks panel" : "no link to the Landing_Page");
        if (!outside.catalog) missing.push(anywhere.catalog ? "a link to the catalog only inside the backlinks panel" : "no link to the catalog");
        findings.push(`${page.rel}: ${missing.join("; ")} — with JavaScript unavailable the explorer list ships empty, so these two anchors are the whole navigation route`);
      }
      const measured = { sampled: pages.length, failing: findings.length, indexEntries: index ? Object.keys(index).length : null };
      if (findings.length === 0) return pass(notes.join("; "), measured);
      return fail(`${findings.length} of ${pages.length} sampled pages lack a script-free route to the Landing_Page or the catalog, expected 0`, [...findings, ...notes], measured);
    },
  },
  {
    id: "no-properties-table",
    requirements: "12.2",
    title: "no properties-table markup survives anywhere",
    run: ({ contentPages }) => {
      // The three markers the note-properties plugin emits. Any one of them means
      // the plugin is still enabled and the Page_Header is competing with the
      // block it was meant to replace.
      const markers = [/\bnote-properties\b/, /\bnote-properties-header\b/, /\bmetadata-container\b/];
      const findings = [];
      for (const page of contentPages) {
        const hit = markers.find((marker) => marker.test(page.html));
        if (hit) findings.push(`${page.rel}: matches ${hit.source}`);
      }
      const measured = { pages: contentPages.length, withPropertiesMarkup: findings.length };
      if (findings.length === 0) {
        return pass(`0 of ${contentPages.length} pages carry note-properties markup (expected 0)`, measured);
      }
      return fail(
        `measured ${findings.length} of ${contentPages.length} pages still rendering the properties block, budget 0 — set note-properties enabled:false in quartz.config.yaml`,
        findings,
        measured
      );
    },
  },
  {
    id: "favicon",
    requirements: "12.4",
    title: "the favicon resolves and is not the Quartz default",
    run: ({ samples, siteRoot, exists, parsed }) => {
      const page = sampled(samples, "landing", "concept", "rootExtra")[0];
      if (!page) return skip("no page in the build to sample");
      const tag = /<link[^>]+rel\s*=\s*["']?(?:shortcut )?icon["']?[^>]*>/i.exec(stripScripts(page.html));
      if (!tag) return fail(`${page.rel}: no <link rel="icon"> in the served HTML (measured 0, expected 1)`, [], { found: false });
      const href = attrValue(tag[0], "href");
      const result = resolveHref(siteRoot, dirname(page.path), href, exists);
      if (result.status !== "ok") {
        return fail(
          `${page.rel}: favicon href ${JSON.stringify(href)} ${result.status === "escapes" ? "escapes the site root" : "resolves to nothing"} — the icon does not resolve`,
          [tag[0]],
          { href, status: result.status }
        );
      }
      const buffer = readFileSync(result.target);
      const digest = createHash("sha256").update(buffer).digest("hex");
      const measured = {
        href,
        file: relative(siteRoot, result.target).split(sep).join("/"),
        bytes: buffer.length,
        sha256: digest,
        quartzDefault: QUARTZ_DEFAULT_ICON_SHA256,
      };
      if (digest === QUARTZ_DEFAULT_ICON_SHA256) {
        return fail(
          `${measured.file} resolves but is byte-identical to the stock Quartz icon: measured sha256 ${digest}, which must not equal ${QUARTZ_DEFAULT_ICON_SHA256} (${bytes(buffer.length)})`,
          [`replace static/icon.png with the project icon; the requirement is an identity change, not a 404 fix`],
          measured
        );
      }
      const identity = digest === PROJECT_ICON_SHA256
        ? "matches the project icon recorded in the spec"
        : "is neither the Quartz default nor the project icon recorded in the spec, which is fine if the icon was redesigned";
      return pass(`${measured.file} resolves at ${bytes(buffer.length)}, sha256 ${digest.slice(0, 16)}… — differs from the Quartz default and ${identity}`, measured);
    },
  },
  {
    id: "no-analytics",
    requirements: "10.5, 14.7",
    title: "no request to a known analytics host",
    run: ({ files, siteRoot }) => {
      const scannable = files.filter((file) => [".html", ".js", ".mjs", ".css", ".json", ".xml"].includes(extname(file.path).toLowerCase()));
      const findings = [];
      let scanned = 0;
      for (const file of scannable) {
        let text;
        try {
          text = readFileSync(file.path, "utf8");
        } catch {
          continue;
        }
        scanned += 1;
        for (const host of ANALYTICS_HOSTS) {
          // Matched only in URL position. A page that discusses a vendor in
          // prose is not a page that calls one, and the surrounding context is
          // printed so a false positive is diagnosable rather than mysterious.
          const pattern = new RegExp(`(?:https?:)?//(?:[a-z0-9.\\-]*\\.)?${host.replace(/\./g, "\\.")}`, "i");
          const match = pattern.exec(text);
          if (!match) continue;
          const start = Math.max(0, match.index - 60);
          findings.push(
            `${relative(siteRoot, file.path).split(sep).join("/")}: ${host} in URL position — …${text.slice(start, match.index + match[0].length + 60).replace(/\s+/g, " ")}…`
          );
        }
      }
      const measured = { filesScanned: scanned, hostsChecked: ANALYTICS_HOSTS.length, hits: findings.length };
      if (findings.length === 0) {
        return pass(
          `0 references to ${ANALYTICS_HOSTS.length} known analytics or session-recording hosts across ${scanned} built files (expected 0). ` +
            "This is a static scan; `analytics: null` in quartz.config.yaml is the upstream guarantee, and check-console.mjs reports the third-party hosts actually contacted at runtime",
          measured
        );
      }
      return fail(
        `measured ${findings.length} reference(s) to a known analytics host across ${scanned} built files, budget 0`,
        findings,
        measured
      );
    },
  }
);

// ---------------------------------------------------------------------------
// Search behaviour
//
// These two read the trimmed `static/contentIndex.json` rather than driving the
// client-side search. Quartz's search is FlexSearch running in the Reader's
// browser over exactly this file, so the file is the whole input to the
// behaviour — and reading it makes the checks deterministic, dependency-free and
// fast, where driving the UI would need a browser and a settled keystroke.
//
// The honest limit: the index decides what *can* be returned, so an exclusion is
// fully verifiable here (Requirement 9.3 — nothing in the index, nothing
// returned), while an *ordering* is not (Requirement 9.7 — the rank comes out of
// FlexSearch's scoring, which this file cannot observe). So the first check
// passes or fails, and the second reports `partial` and names what it verified.
// Re-implementing FlexSearch's scoring to assert the order would be testing this
// script's arithmetic, not the site's search.
// ---------------------------------------------------------------------------

/** Lowercased word-ish tokens of 6+ characters: long enough to be distinctive. */
function tokens(text) {
  return new Set(text.toLowerCase().match(/[a-z][a-z0-9-]{5,}/g) ?? []);
}

CHECKS.push(
  {
    id: "figures-resolve",
    requirements: "12.7",
    title: "every <img> resolves to a served file and carries alt text",
    // A real gate, not a `report`. Both halves fail a run, and each is a defect a
    // static scan is uniquely placed to catch:
    //
    //   * an <img> whose src does not resolve renders as a broken-image glyph, and
    //     the publish gate cannot see it because the corruption happens in Quartz's
    //     href resolution AFTER the markdown is written. Three of the four ways to
    //     reference a figure produce exactly this, and they all look correct in the
    //     markdown. That is what makes this check the one that would notice.
    //   * an <img> with no alt text is unreadable to a screen reader and leaves
    //     nothing behind when the image fails to load. The vault linter enforces alt
    //     text on the authored embed (`DG002`), and this confirms it survived into
    //     the attribute a browser actually reads, which is a different claim.
    //
    // An empty `alt=""` is the correct markup for a decorative image and is NOT
    // failed here, but it is counted and printed: this site has no decorative
    // images, so a non-zero count is worth seeing even though it is legal.
    run: ({ contentPages, siteRoot, exists }) => {
      const findings = [];
      let images = 0;
      let decorative = 0;
      const seen = new Set();
      for (const page of contentPages) {
        for (const tag of page.html.match(/<img\b[^>]*>/gi) ?? []) {
          images += 1;
          const src = attrValue(tag, "src");
          const alt = attrValue(tag, "alt");
          if (alt === null) {
            findings.push(`${page.rel}: <img src=${JSON.stringify(src ?? "")}> has no alt attribute at all`);
          } else if (alt.trim() === "") {
            decorative += 1;
          }
          if (src === null || src.trim() === "") {
            findings.push(`${page.rel}: <img> has no src`);
            continue;
          }
          if (EXTERNAL_SCHEME.test(src) || src.startsWith("//") || src.startsWith("data:")) continue;
          const result = resolveHref(siteRoot, dirname(page.path), src, exists);
          if (result.status === "ok") {
            seen.add(relative(siteRoot, result.target).split(sep).join("/"));
            continue;
          }
          if (result.status === "skipped") continue;
          findings.push(
            `${page.rel}: <img src=${JSON.stringify(src)}> ${result.status === "escapes" ? "escapes the site root" : "resolves to nothing"} — the figure would render as a broken image`
          );
        }
      }
      const measured = { pages: contentPages.length, images, decorative, distinctFiles: seen.size, broken: findings.length };
      if (images === 0) {
        return pass("0 <img> elements in the build, so nothing to resolve", measured);
      }
      if (findings.length > 0) {
        return fail(
          `measured ${findings.length} of ${images} <img> elements broken or undescribed, budget 0`,
          findings,
          measured
        );
      }
      const note = decorative > 0 ? `, ${decorative} with an intentionally empty alt` : "";
      return pass(
        `${images} <img> element(s) across ${contentPages.length} pages resolve to ${seen.size} served file(s) and all carry alt text${note}`,
        measured
      );
    },
  },
  {
    id: "search-excludes-log",
    requirements: "9.2, 9.3",
    title: "a term appearing only in the activity log returns no search result",
    run: ({ index, contentPages, unlisted, unlistedSource }) => {
      if (!index) return skip("no readable contentIndex.json to check exclusions against");
      const keys = new Set(Object.keys(index));
      const lowerKeys = new Map([...keys].map((key) => [key.toLowerCase(), key]));
      const stillIndexed = unlisted.filter((slug) => keys.has(slug) || lowerKeys.has(slug.toLowerCase()));
      const findings = stillIndexed.map((slug) => {
        const key = keys.has(slug) ? slug : lowerKeys.get(slug.toLowerCase());
        const size = Buffer.byteLength(JSON.stringify(index[key]), "utf8");
        return `${key}: still present in the index at ${bytes(size)}, expected absent (unlisted per ${unlistedSource})`;
      });

      const logPage = contentPages.find((page) => /^log\.html$/i.test(page.rel));
      let terms = [];
      const selection = { candidates: 0, rejected: 0, example: null };
      if (logPage) {
        // A term is "log-only" when it appears in the log's rendered text and
        // nowhere in any other built page. Such a term can only reach the search
        // index through an excluded page's own entry, which makes it the precise
        // probe Requirement 9.3 describes. Candidates come from the log's visible
        // *text*, because that is what a Reader would type, longest first: a long
        // token is the least likely to be an artifact of tokenisation.
        //
        // WHY THIS SELECTION IS TWO STAGES, AND WHAT THE FIRST ONE MISSED
        //
        // The first run against a real build reported
        // `history-human-language-understanding` as a log-only term that
        // `llm-fundamentals/concepts/pretraining` nevertheless carried. That was
        // a defect in this probe, not in the site. The term is the slug of a
        // published source page, and 19 other pages contain it — but every one of
        // them contains it *inside a longer token*,
        // `source-history-human-language-understanding`, in an href, a data-slug
        // and the visible link text. The log happens to print it bare, in a
        // parenthesised list of the summaries an ingest created, so it tokenises
        // there as a token of its own.
        //
        // The exclusion set was a set of tokens and membership was exact
        // equality, so `history-…` never matched `source-history-…`. The
        // assertion below, by contrast, asks `haystack.includes(term)` —
        // substring containment. Selection and assertion used two different
        // notions of "occurs", and every term that is a proper substring of some
        // other page's token lived in the gap between them. Widening the corpus,
        // which is what the previous fix did, could not close it: the corpus was
        // never the problem, the predicate was.
        //
        // So stage 1 keeps the cheap token filter (2,242 log tokens down to a few
        // hundred) and stage 2 re-tests the survivors with the assertion's own
        // predicate against the assertion's own corpus. A term another page
        // contains — as a token, as a substring, in prose or in an attribute —
        // can no longer be selected. The stage can only discard candidates, never
        // invent a failure, and the count it discarded is reported so this class
        // of misfire stays visible instead of turning into a mysterious skip.
        const logTokens = tokens(textOf(stripScripts(logPage.html)));
        const elsewhere = new Set();
        for (const page of contentPages) {
          if (page === logPage) continue;
          for (const token of tokens(stripScripts(page.html))) elsewhere.add(token);
        }
        for (const slug of keys) for (const token of tokens(slug)) elsewhere.add(token);
        const candidates = [
          ...new Set(
            [...logTokens]
              .filter((token) => !elsewhere.has(token))
              // A token cut at a punctuation boundary can end in a hyphen
              // (`source-jurafsky-chapter-`). Trimmed, because the probe should
              // read like something a Reader would type; trimmed *before* stage 2
              // so the form that gets probed is the form that was verified.
              .map((token) => token.replace(/^-+|-+$/g, ""))
              .filter((token) => token.length >= 6)
          ),
        ]
          .sort((a, b) => b.length - a.length || (a < b ? -1 : 1))
          // Bounded so stage 2 stays O(pages x a few dozen) rather than
          // O(pages x hundreds); the longest candidates are also the best ones.
          .slice(0, 60);
        selection.candidates = candidates.length;

        let survivors = candidates;
        const reject = (term, where) => {
          selection.rejected += 1;
          if (!selection.example) selection.example = `${JSON.stringify(term)} (contained in ${where})`;
        };
        for (const page of contentPages) {
          if (page === logPage || survivors.length === 0) continue;
          const haystack = stripScripts(page.html).toLowerCase();
          survivors = survivors.filter((term) => {
            if (!haystack.includes(term)) return true;
            reject(term, page.rel);
            return false;
          });
        }
        if (survivors.length > 0) {
          const slugCorpus = [...keys].join("\n").toLowerCase();
          survivors = survivors.filter((term) => {
            if (!slugCorpus.includes(term)) return true;
            reject(term, "an index slug");
            return false;
          });
        }
        terms = survivors.slice(0, 5);

        for (const term of terms) {
          for (const [slug, entry] of Object.entries(index)) {
            const haystack = `${slug} ${entry.title ?? ""} ${(entry.tags ?? []).join(" ")} ${entry.content ?? ""}`.toLowerCase();
            if (!haystack.includes(term)) continue;
            // Selection has already established that no other built page carries
            // this term, so a hit here is one of two real defects, and the
            // finding says which: an excluded page is in the index, or an entry
            // carries text its own page does not render.
            const ownPage = contentPages.find((page) => slugOf(page.rel).toLowerCase() === slug.toLowerCase());
            const because = !ownPage
              ? "and no built page corresponds to that entry, so the index is carrying a page that was not published"
              : "and the term is in no other built page, so that entry carries text its own page does not render — the excluded page's content reached the index through it";
            findings.push(
              `the log-only term ${JSON.stringify(term)} is searchable via index entry ${slug}, so a Reader searching it gets a result — expected 0 results, ${because}`
            );
            break;
          }
        }
      }

      const measured = {
        indexEntries: keys.size,
        unlistedExpectedAbsent: unlisted,
        unlistedStillPresent: stillIndexed,
        logOnlyTermsProbed: terms,
        candidatesConsidered: selection.candidates,
        candidatesRejectedAsNotLogOnly: selection.rejected,
      };
      const selectionNote =
        `${selection.candidates} candidate term(s) survived the token filter, ${selection.rejected} then rejected because another built page contains the term as a substring` +
        (selection.example ? `, e.g. ${selection.example}` : "");
      if (findings.length > 0) {
        return fail(
          `measured ${findings.length} way(s) for an excluded page's text to be searchable, budget 0 (${keys.size} index entries). ${selectionNote}`,
          findings,
          measured
        );
      }
      if (!logPage) {
        return skip(`no log.html in the build, so no log-only term could be probed. The exclusion half was checked: all ${unlisted.length} unlisted slugs are absent from the ${keys.size}-entry index`);
      }
      if (terms.length === 0) {
        return skip(
          `all ${unlisted.length} unlisted slugs are absent from the ${keys.size}-entry index, but no term occurs in log.html and nowhere else, ` +
            `so the positive probe had no subject. Requirement 9.3 is therefore only half checked in this build (${selectionNote})`
        );
      }
      return pass(
        `${unlisted.length} unlisted slugs absent from the ${keys.size}-entry index; ${terms.length} log-only term(s) return nothing — probed ${terms.map((t) => JSON.stringify(t)).join(", ")}. ${selectionNote}`,
        measured
      );
    },
  },
  {
    id: "search-title-rank",
    requirements: "9.7",
    title: "a title match can outrank body-only matches",
    run: ({ index }) => {
      if (!index) return skip("no readable contentIndex.json to reason about ranking over");
      // Find a term carried by exactly one entry's title and by other entries'
      // body text only. That is the shape Requirement 9.7 talks about, and its
      // existence in the index is the precondition for the ranking.
      const entries = Object.entries(index);
      const titleTerms = new Map();
      for (const [slug, entry] of entries) {
        for (const term of tokens(entry.title ?? "")) {
          if (!titleTerms.has(term)) titleTerms.set(term, []);
          titleTerms.get(term).push(slug);
        }
      }
      let chosen = null;
      for (const [term, slugs] of [...titleTerms.entries()].sort((a, b) => b[0].length - a[0].length)) {
        if (slugs.length !== 1) continue;
        const rivals = entries.filter(([slug, entry]) =>
          slug !== slugs[0] && !tokens(entry.title ?? "").has(term) && (entry.content ?? "").toLowerCase().includes(term));
        if (rivals.length === 0) continue;
        chosen = { term, holder: slugs[0], rivals: rivals.map(([slug]) => slug) };
        break;
      }
      if (!chosen) {
        return skip("no term in this index appears in exactly one title and in other entries' body text only, so the ranking comparison has no subject");
      }
      const measured = {
        term: chosen.term,
        titleHolder: chosen.holder,
        bodyOnlyRivals: chosen.rivals.length,
        verified: ["title-match entry present in the index", "term present in that entry's title field", "body-only rivals exist"],
        notVerified: ["the resulting rank order"],
      };
      return partial(
        `for ${JSON.stringify(chosen.term)}: the title-matching entry ${chosen.holder} is in the index with the term in its title field, and ${chosen.rivals.length} entr${chosen.rivals.length === 1 ? "y matches" : "ies match"} in body text only. ` +
          "That is the precondition for Requirement 9.7 and it holds. The rank ORDER was NOT verified: Quartz ranks in FlexSearch in the Reader's browser, and no static read of contentIndex.json can observe it. " +
          "Verifying it needs a real browser typing into the search box — check-console.mjs already drives one, so that is where the assertion belongs if it is ever wanted",
        [`body-only rivals: ${chosen.rivals.slice(0, 5).join(", ")}${chosen.rivals.length > 5 ? ` and ${chosen.rivals.length - 5} more` : ""}`]
      );
    },
  }
);

// ---------------------------------------------------------------------------
// Loading the build
// ---------------------------------------------------------------------------

/**
 * Read the build once: every file's size for the total budget, every HTML file's
 * text for the structural checks, and each page classified. ~25 MB of HTML held
 * in memory, which is cheaper than the twelve re-reads the checks would
 * otherwise do.
 */
export function loadBuild(siteRoot) {
  if (!isDirectory(siteRoot)) {
    throw new UsageError(
      `the built site directory ${siteRoot} does not exist or is not a directory.\n` +
        "Run `npx quartz build` first, then point this script at its output."
    );
  }
  const files = walkFiles(siteRoot);
  if (files.length === 0) throw new UsageError(`${siteRoot} holds no files, so there is nothing to check`);
  // Case-sensitive membership on purpose: the runner and GitHub Pages are both
  // case-sensitive, so a link that only resolves on a case-insensitive macOS
  // volume is a real defect and this set reports it as one.
  const present = new Set(files.map((file) => file.path));
  const pages = [];
  for (const file of files) {
    if (extname(file.path).toLowerCase() !== ".html") continue;
    const html = readFileSync(file.path, "utf8");
    pages.push({ ...classifyPage(siteRoot, file.path, html, file.bytes), html });
  }
  if (pages.length === 0) throw new UsageError(`${siteRoot} holds no .html files, so the build is empty or the wrong directory was given`);
  return { files, pages, exists: (path) => present.has(path) };
}

function isDirectory(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/** The trimmed content index, or null with the reason recorded. */
export function loadIndex(indexPath) {
  let text;
  try {
    text = readFileSync(indexPath, "utf8");
  } catch (error) {
    return { index: null, why: `cannot read ${indexPath}: ${error.message}`, bytes: 0 };
  }
  try {
    const value = JSON.parse(text.replace(/^\uFEFF/, ""));
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return { index: null, why: `${indexPath} is not an object keyed by slug`, bytes: Buffer.byteLength(text, "utf8") };
    }
    return { index: value, why: null, bytes: Buffer.byteLength(text, "utf8") };
  } catch (error) {
    return { index: null, why: `${indexPath} is not valid JSON: ${error.message}`, bytes: Buffer.byteLength(text, "utf8") };
  }
}

/** The unlisted-slug list from .search-budget.json, or the documented fallback. */
export function loadUnlisted(candidates) {
  for (const candidate of candidates) {
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(candidate, "utf8").replace(/^\uFEFF/, ""));
    } catch {
      continue;
    }
    if (Array.isArray(parsed?.unlisted)) {
      return { unlisted: parsed.unlisted.map(String), source: relative(process.cwd(), candidate) || candidate };
    }
  }
  return { unlisted: [...FALLBACK_UNLISTED], source: "this script's fallback list (no .search-budget.json found)" };
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

// Five statuses, four characters each so the id column stays aligned. Lower case
// for the two that need no attention, upper case for the three that do — and
// `meas` is deliberately not `ok`, because a measurement asserted nothing.
const STATUS_LABEL = { pass: "ok  ", fail: "FAIL", skip: "skip", partial: "PART", report: "meas" };

/**
 * Identical findings printed once with a count. `log.html` carries the same
 * broken `./wikilinks` href 16 times; sixteen identical lines would consume the
 * whole --max-findings budget and hide the other fifteen distinct defects.
 * The measured totals are unaffected — this is a display concern only.
 */
/**
 * The requirement ids as printed. The three weight checks carry "(reported)",
 * which stops being true the moment --enforce-weight is passed, so the label
 * follows the flag rather than contradicting the verdict beside it. Display only:
 * the JSON report keeps the static field, and `budgets.weightEnforced` says which
 * mode the run was in.
 */
const requirementLabel = (check, parsed) =>
  parsed.enforceWeight ? check.requirements.replace(" (reported)", " (enforced)") : check.requirements;

export function collapse(findings) {
  const counts = new Map();
  for (const finding of findings) counts.set(finding, (counts.get(finding) ?? 0) + 1);
  return [...counts.entries()].map(([finding, count]) => (count > 1 ? `${finding} (x${count})` : finding));
}

export function main(argv, env) {
  const parsed = parseArgs(argv);
  if (parsed.help) {
    process.stdout.write(`${USAGE}\n`);
    return EXIT_OK;
  }
  if (parsed.list) {
    process.stdout.write("check-built-site: checks\n");
    for (const check of CHECKS) {
      process.stdout.write(`  ${check.id.padEnd(22)} [${requirementLabel(check, parsed)}] ${check.title}\n`);
    }
    return EXIT_OK;
  }

  const unknown = [...parsed.only, ...parsed.skip].filter((id) => !CHECKS.some((check) => check.id === id));
  if (unknown.length > 0) {
    throw new UsageError(`unknown check id(s): ${unknown.join(", ")}. Run --list to see them.`);
  }

  const siteRoot = resolveSitePath(parsed, env);
  const indexPath = resolveIndexPath(parsed, env, siteRoot);
  const { files, pages, exists } = loadBuild(siteRoot);
  const { index, why: indexWhy, bytes: indexBytes } = loadIndex(indexPath);
  const { unlisted, source: unlistedSource } = loadUnlisted(budgetCandidates(parsed, env, siteRoot));

  const contentPages = pages.filter((page) => page.kind === "page");
  const redirects = pages.filter((page) => page.kind === "redirect");
  const errorPages = pages.filter((page) => page.kind === "error");
  const samples = pickSamples(contentPages);
  const context = { parsed, siteRoot, files, pages, contentPages, redirects, samples, index, unlisted, unlistedSource, exists };

  const out = (line) => process.stdout.write(`${line}\n`);
  const chatty = (line) => {
    if (!parsed.quiet) out(line);
  };

  chatty("check-built-site");
  chatty(`  site       ${siteRoot}`);
  chatty(`  index      ${index ? `${indexPath} (${Object.keys(index).length} entries, ${bytes(indexBytes)})` : `UNREADABLE — ${indexWhy}`}`);
  chatty(`  weight     max ${bytes(parsed.maxBytes)} / p95 ${bytes(parsed.p95Bytes)} / total ${bytes(parsed.totalBytes)} — ${parsed.enforceWeight
    ? "ENFORCED as budgets (--enforce-weight): exceeding one fails the run"
    : "reference figures, measured and printed but NOT enforced (ADR-014); --enforce-weight restores the gate"}`);
  chatty(`  pages      ${contentPages.length} content, ${redirects.length} redirect stubs, ${errorPages.length} error page — ${pages.length} HTML files of ${files.length} files total`);
  chatty(`  stubs      identified by <meta http-equiv="refresh"> with a url= target; ${redirects.filter((r) => r.noindex).length} also carry robots:noindex. Excluded from the page checks, resolved by redirect-targets`);
  chatty(`  sample     ${Object.entries(samples).filter(([, page]) => page).map(([role, page]) => `${role}=${page.rel}`).join(", ") || "(none)"}`);
  chatty("");

  const selected = CHECKS.filter((check) =>
    (parsed.only.length === 0 || parsed.only.includes(check.id)) && !parsed.skip.includes(check.id));
  if (selected.length === 0) throw new UsageError("no checks selected");

  const results = [];
  for (const check of selected) {
    let result;
    try {
      result = check.run(context);
    } catch (error) {
      // A check that throws is a broken check, not a clean site. Reported as a
      // failure with the stack so it cannot be mistaken for a pass.
      result = fail(`the check itself threw: ${error.message}`, [String(error.stack ?? error).split("\n").slice(0, 4).join("\n")], {});
    }
    results.push({ ...check, ...result });
    if (parsed.quiet && result.status === "pass") continue;
    out(`  ${STATUS_LABEL[result.status]} ${check.id.padEnd(22)} [${requirementLabel(check, parsed)}]`);
    out(`       ${result.detail}`);
    const findings = collapse(result.findings ?? []);
    for (const finding of findings.slice(0, parsed.maxFindings)) out(`       - ${finding}`);
    if (findings.length > parsed.maxFindings) {
      out(`       - … and ${findings.length - parsed.maxFindings} more distinct finding(s) (raise --max-findings, or --report PATH for all of them)`);
    }
  }

  const tally = (status) => results.filter((result) => result.status === status).length;
  const failures = tally("fail");
  const skipped = tally("skip");
  const partials = tally("partial");
  const reported = tally("report");

  out("");
  out(`  checks     ${results.length} run: ${tally("pass")} passed, ${failures} failed, ${skipped} skipped, ${partials} partial, ${reported} reported`);
  if (skipped > 0) {
    out(`  skipped    ${results.filter((r) => r.status === "skip").map((r) => r.id).join(", ")} — these verified NOTHING${parsed.strictSkips ? " and --strict-skips counts them as failures" : "; pass --strict-skips to make that fail the build"}`);
  }
  if (partials > 0) {
    out(`  partial    ${results.filter((r) => r.status === "partial").map((r) => r.id).join(", ")} — precondition verified, full claim not observable from static files`);
  }
  if (reported > 0) {
    out(`  reported   ${results.filter((r) => r.status === "report").map((r) => r.id).join(", ")} — measured and printed above, never gated: page weight is not a constraint on this site (ADR-014), and the figures they are read against were taken over a population that included redirect stubs. Pass --enforce-weight to make them fail the run again`);
  }

  if (parsed.report) {
    writeFileSync(parsed.report, `${JSON.stringify({
      result: failures > 0 ? "fail" : skipped > 0 ? "pass-with-skips" : "pass",
      site: siteRoot,
      indexPath,
      indexEntries: index ? Object.keys(index).length : null,
      // `weightEnforced: false` is what makes the three byte figures readable as
      // reference figures rather than budgets; see ADR-014.
      budgets: { maxBytes: parsed.maxBytes, p95Bytes: parsed.p95Bytes, totalBytes: parsed.totalBytes, weightEnforced: parsed.enforceWeight },
      counts: {
        files: files.length, html: pages.length, content: contentPages.length,
        redirects: redirects.length, errorPages: errorPages.length,
      },
      tally: { pass: tally("pass"), fail: failures, skip: skipped, partial: partials, report: reported },
      samples: Object.fromEntries(Object.entries(samples).map(([role, page]) => [role, page?.rel ?? null])),
      checks: results.map((result) => ({
        id: result.id, requirements: result.requirements, status: result.status,
        detail: result.detail, measured: result.measured ?? null, findings: result.findings ?? [],
      })),
    }, null, 2)}\n`, "utf8");
    out(`  report     ${resolve(parsed.report)}`);
  }

  out("");
  const verb = failures > 0 ? "fail" : skipped > 0 ? "pass-with-skips" : "pass";
  // `reported=` goes after `partial=` so pages.yml's two anchored greps —
  // `RESULT=[a-z-]+ .*partial=[1-9]` and `partial=[0-9]+` — read what they always
  // read. The verb vocabulary is unchanged, so `RESULT=pass-with-skips` still
  // matches exactly when a check was skipped and never because of a measurement.
  out(`check-built-site: RESULT=${verb} checks=${results.length} failures=${failures} skipped=${skipped} partial=${partials} reported=${reported} pages=${contentPages.length}`);

  if (failures > 0) {
    process.stderr.write(
      `check-built-site: ${failures} of ${results.length} checks failed against ${siteRoot}.\n` +
        "Every failure above reports the measured value next to its budget or expectation\n" +
        "(Requirement 10.6, Property 35), so no fix needs a re-run to find its number.\n"
    );
    return EXIT_FAILURES;
  }
  if (skipped > 0 && parsed.strictSkips) {
    process.stderr.write(
      `check-built-site: ${skipped} check(s) could not run and --strict-skips was passed.\n` +
        "A skipped check verified nothing; the requirement it covers is unchecked for this build.\n"
    );
    return EXIT_FAILURES;
  }
  return EXIT_OK;
}

const invokedDirectly =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invokedDirectly) {
  try {
    process.exitCode = main(process.argv.slice(2), process.env);
  } catch (error) {
    if (error instanceof UsageError) {
      process.stderr.write(`check-built-site: ${error.message}\n`);
      process.stdout.write("check-built-site: RESULT=error checks=0 failures=0 skipped=0 partial=0 reported=0 pages=0\n");
      process.exitCode = EXIT_USAGE;
    } else {
      throw error;
    }
  }
}

// EXIT_NO_BROWSER is exported-in-spirit: referenced here so the reserved code is
// not mistaken for dead weight by a reader or a linter, and so the contract with
// check-console.mjs stays written down in one place.
void EXIT_NO_BROWSER;
