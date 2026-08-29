#!/usr/bin/env node
// trim-search-index.mjs — bring the built search index under its byte budget.
//
// Reads `.search-budget.json` (written by the vault's `tools/publish.py` from
// `kb.search_budget_manifest()`), truncates each entry's `content` to the limit
// for that page's type, drops the slugs the manifest lists as unlisted,
// rewrites `contentIndex.json` in place, and exits non-zero when the result
// still exceeds the budget, reporting the measured size against the budget.
//
// Requirements 9.1, 9.3, 9.5. Spec: .kiro/specs/wiki-site-experience task 11.1.
//
// WHERE THIS RUNS
//
//   After `npx quartz build`, in the same workflow step, against
//   $RUNNER_TEMP/quartz/public/static/contentIndex.json. The Quartz build stays
//   outside the work tree on purpose: Quartz's file discovery honours the
//   enclosing repository's .gitignore, which ignores `public/`, so a build moved
//   into the work tree finds zero input files. Do not "simplify" this by
//   building in place.
//
// WHY THE POLICY IS NOT IN THIS FILE
//
//   The limits live in `tools/kb_lib.py` in the vault and are pinned by
//   measurement against the built index (891,439 bytes, recall@10 90%,
//   MRR 0.64; recall is non-monotonic in the primary limit, so raising one can
//   lower recall). This script reads them and never restates them. One
//   definition, two consumers. If you find yourself typing 7000 in here, stop.
//
// ---------------------------------------------------------------------------
// CONFORMANCE CONTRACT — read this before changing any line below
// ---------------------------------------------------------------------------
//
// `kb.trim_index_entries(payload, manifest)` in the vault is the Python
// reference for the same transformation, and a conformance test (task 10.5)
// asserts the two produce BYTE-IDENTICAL output from the same input. Every
// choice that could make them differ is fixed here, explicitly, so the test can
// adjudicate rather than guess.
//
// 1. TRUNCATION UNIT: UTF-16 code units — JavaScript's own `String.length` —
//    never splitting a surrogate pair. `kb.truncate_utf16` is the reference and
//    this reproduces it: cut at `limit` units, and where the cut would land
//    between the high and low surrogate of an astral character, drop that
//    character whole and stop one unit early rather than emit a lone surrogate,
//    which has no UTF-8 encoding at all.
//
//    ADJUDICATED IN TASK 10.5, and reversed from this script's first version,
//    which counted Unicode code points via
//    `Array.from(content).slice(0, limit).join("")`. Both units are
//    surrogate-safe, so that is not what decides it. The byte budget is:
//
//      * The limit exists to bound BYTES (Requirement 9.1, 1,000,000 of them).
//        UTF-8 spends at most 3 bytes per UTF-16 code unit — including astral
//        characters, which are 4 bytes across 2 units — but up to 4 bytes per
//        code point. So a limit counted in code units bounds the artifact at
//        3 x limit and a limit counted in code points only at 4 x limit. The
//        tighter bound is the one the budget wants.
//      * Every consumer measures units. Quartz's search, `String.length`,
//        `slice` and the index it builds are all UTF-16; nothing in the browser
//        counts code points. A limit in a unit no consumer uses is a limit the
//        Reader's artifact can exceed in the unit that matters — 700 code points
//        of emoji is 1,400 units of JavaScript string.
//
//    Measured on the real index: 303 entries, 2 astral code points — U+1F30D at
//    code point 3,600 of `source-cs336-lecture01-overview-tokenization` and
//    U+1F917 at 1,505 of `source-roformer`. Both are source-summary entries,
//    limit 700, so both fall outside the retained prefix: the two unit choices
//    agree on today's artifact, which is why the pinned constants and their
//    measured recall are unaffected by this reversal. They do not agree on a
//    fixture that puts an emoji inside the retained prefix, which is what
//    `tests/test_search_budget.py` pins.
//
// 2. DROP RULE: `manifest.unlisted` is matched against the whole slug AND
//    against its last path segment, as `kb.trim_index_entries` does. Exact-only
//    matching was the first version here and it fails open: the manifest carries
//    bare published slugs (`catalog`, `catalog-sources`, `log`, `notice`,
//    `open-questions`) while the built index keys entries by path — `wiki/log`
//    before the grouped layout landed, `<domain>/<kind>/<slug>` after — so
//    `wiki/log` would survive every drop rule and the changelog would stay in
//    the Reader's search results. Dropping a policy silently is worse than the
//    narrow risk basename matching carries, which is bounded and documented in
//    `kb_lib.py`: no unlisted slug may equal another entry's basename, satisfied
//    by all five (none is a canonical tag, so no `tags/<tag>` listing page
//    collides), and it is what any addition to the set has to be checked
//    against.
//
// 3. LIMIT LOOKUP: `limits[page_types[slug]]`, retrying `page_types` on the last
//    path segment, and falling back to `default_limit` when the slug is absent
//    from `page_types` under both spellings, when its type is absent from
//    `limits`, or when either value is empty. Total by construction — every
//    entry the walk meets gets a limit, matching `kb.search_content_limit()`.
//    The basename retry is the same fail-open argument as item 2, and here the
//    failure is quantitative: without it a path-keyed index takes the 7,000
//    default for all 303 entries, which is the untrimmed artifact passing as a
//    trimmed one.
//
// 4. KEY ORDER: input document order, preserved exactly. Neither the slug map
//    nor the fields inside an entry are sorted, and no key is added or removed
//    beyond the dropped slugs. Only `content` is ever rewritten; `slug`,
//    `filePath`, `title`, `links` and `tags` pass through untouched. The output
//    is assembled key by key rather than handed to `JSON.stringify` as one
//    object, so an integer-like slug cannot be silently reordered into
//    JavaScript's numeric-keys-first position.
//
// 5. SERIALISATION: compact separators (`,` and `:`, no spaces), no
//    indentation, non-ASCII emitted literally as UTF-8, no trailing newline, no
//    BOM. The Python side must therefore use
//    `json.dumps(payload, ensure_ascii=False, separators=(",", ":"))`.
//    Python's default `json.dumps` differs twice over: `", "` / `": "`
//    separators, and `ensure_ascii=True`, which escapes every non-ASCII
//    character. Both are wrong here, and the second is wrong for a reason
//    beyond conformance: escaping inflates the artifact the Reader downloads
//    (2,583,487 -> 2,651,058 bytes on the untrimmed index, since a 3-byte UTF-8
//    CJK character becomes a 6-byte `\uXXXX` escape) and would measure a size
//    the browser never sees against the budget. Verified against the real
//    artifact: Python compact + ensure_ascii=False reproduces Quartz's own
//    bytes exactly, so this contract also leaves untouched entries identical to
//    what Quartz wrote.
//
// 6. BYTE MEASUREMENT: UTF-8 length of that exact string, which is the number
//    of bytes written and the number compared against `budget_bytes`.
//
// IDEMPOTENCE (Property 28). Truncating an already-truncated `content` is a
// no-op, dropping an already-dropped slug is a no-op, and re-serialising this
// script's own output reproduces it byte for byte. So a second run cannot
// compound truncation, and the workflow asserts that by running the script
// twice and comparing bytes.
//
// EXIT CODES: 0 trimmed and within budget; 1 within-spec run whose result
// exceeds `budget_bytes` (the trimmed file is still written, so a re-run
// measures the same number rather than a different one); 2 usage, I/O, or
// malformed-input failure — nothing was written. A run whose output equals the
// bytes already on disk skips the write and says so, which is the same outcome
// as writing and is one less way to disturb a file that is already correct.
//
// Node 22, ESM, no third-party dependencies: `npm ci` runs in Quartz's tree,
// not this one.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const EXIT_OK = 0;
const EXIT_OVER_BUDGET = 1;
const EXIT_USAGE = 2;

const USAGE = `Usage: node scripts/trim-search-index.mjs [INDEX] [options]

  INDEX                 path to the built static/contentIndex.json
                        (default: $KB_CONTENT_INDEX, else
                        $RUNNER_TEMP/quartz/public/static/contentIndex.json)
  --index PATH          same as the positional argument
  --manifest PATH       path to .search-budget.json
                        (default: $KB_SEARCH_BUDGET, else searched next to the
                        built output and in the staged content directory)
  --help                print this and exit 0

Exit: 0 within budget, 1 over budget, 2 usage or malformed input.`;

/** A fatal, reportable failure: message reaches stderr, no file is written. */
class UsageError extends Error {}

// ---------------------------------------------------------------------------
// Argument and path resolution
// ---------------------------------------------------------------------------

export function parseArgs(argv) {
  const parsed = { index: null, manifest: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const take = (name) => {
      const inline = arg.startsWith(`${name}=`) ? arg.slice(name.length + 1) : null;
      if (inline !== null) return inline;
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("-")) {
        throw new UsageError(`${name} needs a path`);
      }
      i += 1;
      return next;
    };
    if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--index" || arg.startsWith("--index=")) parsed.index = take("--index");
    else if (arg === "--manifest" || arg.startsWith("--manifest=")) parsed.manifest = take("--manifest");
    else if (arg.startsWith("-")) throw new UsageError(`unknown option: ${arg}`);
    else if (parsed.index === null) parsed.index = arg;
    else throw new UsageError(`unexpected extra argument: ${arg}`);
  }
  return parsed;
}

/**
 * The built index: explicit path first, then the environment, then the
 * $RUNNER_TEMP layout the workflow builds into. Never a machine-specific
 * absolute default.
 */
export function resolveIndexPath(parsed, env) {
  const explicit = parsed.index ?? env.KB_CONTENT_INDEX;
  if (explicit) return resolve(explicit);
  if (env.RUNNER_TEMP) {
    return resolve(join(env.RUNNER_TEMP, "quartz", "public", "static", "contentIndex.json"));
  }
  throw new UsageError(
    "no index path given and $RUNNER_TEMP is unset, so the default location is unknown.\n" +
      "Pass the path to the built static/contentIndex.json as the first argument."
  );
}

/**
 * Candidate locations for the manifest, in order. It ships inside the published
 * content, so it is wherever the staged content ended up: copied beside the
 * built output if Quartz treated it as a static asset, otherwise still in the
 * content directory the build read from.
 */
export function manifestCandidates(parsed, env, indexPath) {
  const explicit = parsed.manifest ?? env.KB_SEARCH_BUDGET;
  if (explicit) return [resolve(explicit)];
  const staticDir = dirname(indexPath); // .../public/static
  const publicDir = dirname(staticDir); // .../public
  const quartzRoot = dirname(publicDir); // .../quartz
  const candidates = [
    join(publicDir, ".search-budget.json"),
    join(staticDir, ".search-budget.json"),
    join(quartzRoot, "content", ".search-budget.json"),
  ];
  if (env.GITHUB_WORKSPACE) {
    candidates.push(join(env.GITHUB_WORKSPACE, "content", ".search-budget.json"));
  }
  candidates.push(join(process.cwd(), "content", ".search-budget.json"));
  return candidates.map((candidate) => resolve(candidate));
}

/** Read a JSON file, keeping the raw text so its bytes on disk can be reported. */
function readJson(path, label) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    throw new UsageError(`cannot read the ${label} at ${path}: ${error.message}`);
  }
  try {
    return { text, value: JSON.parse(text.replace(/^\uFEFF/, "")) };
  } catch (error) {
    throw new UsageError(`the ${label} at ${path} is not valid JSON: ${error.message}`);
  }
}

function readManifest(candidates) {
  const tried = [];
  for (const candidate of candidates) {
    try {
      const text = readFileSync(candidate, "utf8");
      let parsed;
      try {
        parsed = JSON.parse(text.replace(/^\uFEFF/, ""));
      } catch (error) {
        throw new UsageError(`the budget manifest at ${candidate} is not valid JSON: ${error.message}`);
      }
      return { manifest: validateManifest(parsed, candidate), path: candidate };
    } catch (error) {
      if (error instanceof UsageError) throw error;
      tried.push(candidate);
    }
  }
  throw new UsageError(
    "no .search-budget.json found. The vault's publish step writes it into\n" +
      "dist/public/, and it must reach the site repository's content/ directory —\n" +
      "the site .gitignore (node_modules/, .quartz/, public/, .DS_Store) does not\n" +
      "exclude it, so a missing manifest means it was never staged.\n" +
      `Tried:\n${tried.map((path) => `  ${path}`).join("\n")}\n` +
      "Pass --manifest PATH to point at it directly."
  );
}

// ---------------------------------------------------------------------------
// Manifest validation — a malformed policy must not silently become no policy
// ---------------------------------------------------------------------------

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function positiveInteger(value) {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function validateManifest(manifest, path) {
  const bad = (detail) => new UsageError(`the budget manifest at ${path} is malformed: ${detail}`);
  if (!isPlainObject(manifest)) throw bad("the top level is not an object");
  if (!positiveInteger(manifest.budget_bytes)) throw bad("budget_bytes is not a positive integer");
  if (!positiveInteger(manifest.default_limit)) throw bad("default_limit is not a positive integer");
  if (!isPlainObject(manifest.limits)) throw bad("limits is not an object");
  for (const [type, limit] of Object.entries(manifest.limits)) {
    if (!positiveInteger(limit)) throw bad(`limits.${type} is not a positive integer`);
  }
  if (!Array.isArray(manifest.unlisted) || manifest.unlisted.some((slug) => typeof slug !== "string")) {
    throw bad("unlisted is not an array of strings");
  }
  if (!isPlainObject(manifest.page_types)) throw bad("page_types is not an object");
  for (const [slug, type] of Object.entries(manifest.page_types)) {
    if (typeof type !== "string") throw bad(`page_types["${slug}"] is not a string`);
  }
  return manifest;
}

// ---------------------------------------------------------------------------
// The transformation — pure, and the half that must match Python byte for byte
// ---------------------------------------------------------------------------

/** Last path segment of a slug: `wiki/log` and `a/b/log` both -> `log`. */
export function slugBasename(slug) {
  return slug.slice(slug.lastIndexOf("/") + 1);
}

/** Own-property read, so an inherited `toString` can never pose as a page type. */
function own(table, key) {
  return Object.hasOwn(table, key) ? table[key] : undefined;
}

/**
 * UTF-16 code units of `content` to keep for this slug. Total: always returns a
 * limit. Contract items 2 and 3 — the whole slug first, then its basename.
 *
 * `positiveInteger` also guards a zero or negative limit, which `kb` would honour
 * as "keep nothing". Unreachable through the CLI: `validateManifest` refuses such
 * a manifest before the walk starts, so the two sides cannot be handed one.
 */
export function contentLimit(slug, manifest) {
  const type = own(manifest.page_types, slug) || own(manifest.page_types, slugBasename(slug)) || "";
  const limit = type ? own(manifest.limits, type) : undefined;
  return positiveInteger(limit) ? limit : manifest.default_limit;
}

/** Truncate to `limit` UTF-16 code units. Contract item 1. */
export function truncateContent(content, limit) {
  if (limit <= 0) return "";
  // `String.length` IS the UTF-16 length, so this is the whole "already short
  // enough" case — and it is what makes a second run of this script a no-op.
  if (content.length <= limit) return content;
  const cut = content.slice(0, limit);
  const last = cut.charCodeAt(cut.length - 1);
  const next = content.charCodeAt(limit);
  const splitsAPair = last >= 0xd800 && last <= 0xdbff && next >= 0xdc00 && next <= 0xdfff;
  // Drop the astral character whole. A lone surrogate already in the input is
  // left where it is, because `kb.truncate_utf16` walks code points and keeps it
  // — such an input is outside the conformance domain either way, since Python
  // cannot encode it as UTF-8 and Quartz never writes one.
  return splitsAPair ? cut.slice(0, -1) : cut;
}

/**
 * Drop unlisted slugs, truncate the rest. Returns entries as an ordered array
 * of [slug, entry] pairs so the caller controls serialisation order (contract
 * item 4), plus everything the report needs.
 */
export function trimIndex(payload, manifest) {
  if (!isPlainObject(payload)) {
    throw new UsageError("the content index is not an object of slug -> entry");
  }
  const unlisted = new Set(manifest.unlisted);
  const entries = [];
  const dropped = [];
  let truncated = 0;
  let defaulted = 0;
  let longest = { slug: null, units: -1 };

  for (const [slug, entry] of Object.entries(payload)) {
    const basename = slugBasename(slug);
    if (unlisted.has(slug) || unlisted.has(basename)) {
      dropped.push(slug);
      continue;
    }
    if (!isPlainObject(entry)) {
      throw new UsageError(`the content index entry for "${slug}" is not an object`);
    }
    if (!Object.hasOwn(manifest.page_types, slug) && !Object.hasOwn(manifest.page_types, basename)) {
      defaulted += 1;
    }
    const limit = contentLimit(slug, manifest);
    let kept = entry;
    if (typeof entry.content === "string") {
      const trimmedContent = truncateContent(entry.content, limit);
      if (trimmedContent !== entry.content) {
        truncated += 1;
        // Rebuild in the original key order so `content` keeps its position.
        kept = {};
        for (const [key, value] of Object.entries(entry)) {
          kept[key] = key === "content" ? trimmedContent : value;
        }
      }
      const units = typeof kept.content === "string" ? kept.content.length : 0;
      if (units > longest.units) longest = { slug, units };
    }
    entries.push([slug, kept]);
  }
  return { entries, dropped, truncated, defaulted, longest };
}

/** Contract items 4 and 5: insertion order, compact, literal UTF-8, no newline. */
export function serialise(entries) {
  const parts = entries.map(([slug, entry]) => `${JSON.stringify(slug)}:${JSON.stringify(entry)}`);
  return `{${parts.join(",")}}`;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const bytes = (value) => `${value.toLocaleString("en-US")} bytes`;

function report(lines) {
  for (const line of lines) process.stdout.write(`${line}\n`);
}

function summary({ indexPath, manifestPath, before, after, result, budget, unchanged }) {
  const entriesBefore = result.entries.length + result.dropped.length;
  const lines = [
    "trim-search-index",
    `  index      ${indexPath}`,
    `  manifest   ${manifestPath}`,
    `  entries    ${entriesBefore} -> ${result.entries.length} (${result.dropped.length} dropped, ${result.truncated} truncated)`,
    `  bytes      ${bytes(before)} -> ${bytes(after)} (${bytes(before - after)} removed)`,
    `  budget     ${bytes(budget)}, ${after <= budget ? `${bytes(budget - after)} of headroom` : `EXCEEDED by ${bytes(after - budget)}`}`,
    `  longest    ${result.longest.slug ?? "(none)"} at ${result.longest.units} UTF-16 code units of content`,
    `  result     ${unchanged ? "no change — the output is byte-identical to the file on disk, so it was left alone" : "rewritten"}`,
  ];
  if (result.dropped.length > 0) lines.push(`  dropped    ${result.dropped.join(", ")}`);
  if (result.defaulted > 0) {
    // A handful is expected: tag pages and generated root pages carry no vault
    // `type`. A large share means the manifest's slugs no longer match the
    // index's, which would silently give every entry the default limit.
    lines.push(
      `  note       ${result.defaulted} of ${result.entries.length} entries are absent from the manifest's page_types and took the default limit`
    );
  }
  return lines;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function main(argv, env) {
  const parsed = parseArgs(argv);
  if (parsed.help) {
    report([USAGE]);
    return EXIT_OK;
  }
  const indexPath = resolveIndexPath(parsed, env);
  const { manifest, path: manifestPath } = readManifest(manifestCandidates(parsed, env, indexPath));
  const { text: original, value: payload } = readJson(indexPath, "content index");

  const before = Buffer.byteLength(original, "utf8");
  const result = trimIndex(payload, manifest);
  const text = serialise(result.entries);
  const after = Buffer.byteLength(text, "utf8");
  const unchanged = text === original;

  if (!unchanged) {
    try {
      writeFileSync(indexPath, text, "utf8");
    } catch (error) {
      throw new UsageError(`cannot write the trimmed index to ${indexPath}: ${error.message}`);
    }
  }

  const budget = manifest.budget_bytes;
  report(summary({ indexPath, manifestPath, before, after, result, budget, unchanged }));
  if (after > budget) {
    process.stderr.write(
      `trim-search-index: the trimmed search index measures ${bytes(after)} against a budget of ${bytes(budget)}, ` +
        `over by ${bytes(after - budget)}.\n` +
        "The limits are pinned by measurement in the vault's tools/kb_lib.py: lower the\n" +
        "source-summary limit first, leave the primary limit alone, and re-measure with\n" +
        "tools/retrieval_baseline.py --index-file before and after.\n"
    );
    return EXIT_OVER_BUDGET;
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
      process.stderr.write(`trim-search-index: ${error.message}\n`);
      process.exitCode = EXIT_USAGE;
    } else {
      throw error;
    }
  }
}
