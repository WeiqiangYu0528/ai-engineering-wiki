---
title: Decisions
---

Architecture decision records for the knowledge base itself. Each entry states the
problem, the decision, and what it costs — the last part matters most, because a
decision recorded without its downside gets revisited by someone who only sees the upside.

Append new records; do not rewrite old ones. Supersede instead.

---

## ADR-001 — The index is generated, never hand-maintained

**Status:** accepted 2026-08-27

**Problem.** The v1 `index.md` was written by hand. Descriptions were sliced out of page
bodies at ~120 characters with `[[...]]` markup deleted, producing 308 malformed entries
such as "founding member of . Formerly the". Ten entities were listed twice and the
declared page count never matched the directory.

**Decision.** `tools/build_index.py` generates `index.md`, `index-sources.md`, and ten
per-domain maps from frontmatter. Each entry prints the page's own authored `summary:`
field. Drift is lint error `IX006`.

**Cost.** Two more generated files to keep converging, and an authored `summary:` becomes
mandatory on every page (`FM009`). The generator must be run after any page change, which
is why `make check` includes it.

---

## ADR-002 — `status` describes evidence, not effort

**Status:** accepted 2026-08-27

**Problem.** v1 let the agent set `status: mature` in the same pass that wrote the page.
36 pages claimed `mature` or `reviewed` with nothing checked, so the field measured
nothing while looking like a quality signal.

**Decision.** `stub → draft → verified → mature`. `verified` means every quantitative
claim and quoted passage was located in the stored source, and requires `verified-by` +
`verified-on`. `mature` additionally requires `verified-by: human`. `FM015` makes the
claim unmakeable without its evidence. All 36 self-assigned pages were demoted to `draft`.

**Cost.** The wiki now looks less finished than it did, because it is. 84 of 308 pages are
`verified` and none are `mature` until a human reads them.

---

## ADR-003 — Provenance is a frontmatter field, not prose

**Status:** accepted 2026-08-27

**Problem.** Source summaries referenced their raw file in prose, in three different
phrasings, so nothing could be checked mechanically. 21 summaries had no resolvable
reference at all.

**Decision.** `raw:` (string or list), `extraction:`, `sha256:`, `fetched:` in frontmatter.
`PV001`/`PV002` enforce presence and existence. Automated matching writes `raw:` only on a
certain match — explicit path, exact filename, or unique prefix. The 21 uncertain cases
were resolved by hand in `tools/resolve_provenance.py` with the rationale recorded per
entry, each confirmed twice: plausible filename *and* measured claim overlap.

**Cost.** A judged mapping table that has to be maintained if files are renamed. Accepted
because the alternative — guessing — produces a page that looks verified and is not, which
is worse than a page with no provenance at all.

---

## ADR-004 — Raw sources are immutable, with one sanctioned exception

**Status:** accepted 2026-08-27

**Problem.** 22 stored sources were placeholders or stubs, so the pages citing them could
not be verified. Leaving them meant permanent unverifiability; editing the private layer freely would
destroy the one layer the wiki is checked against.

**Decision.** the private layer is immutable except through `tools/refetch.py`, which validates a
replacement *before* writing and rolls back if the result does not classify better or
carry more content. 14 of 22 were recovered (10 from PDFs already on disk, 4 from arXiv).
One was correctly refused: a scanned 1986 PDF with no text layer.

**Cost.** Recovery is not always possible. 8 sources remain `failed` and their pages carry
`status: unverified`.

---

## ADR-005 — Unrecoverable thin sources are not quarantined

**Status:** accepted 2026-08-27, deviates from the original plan

**Problem.** The plan called for moving unrecoverable sources to a private directory.

**Decision.** They stay where they are. The 8 remaining are not corrupt — they are thin
because the upstream source is thin: two promptingguide pages that really are two
sentences, a leaderboard, a Medium essay, two CS336 guest lectures whose materials were
never published. Moving them would break the provenance link while adding no information.
They carry `extraction: failed` and `status: unverified` instead.

**Cost.** the private layer contains files that cannot evidence anything, which is only safe because
the label says so.

---

## ADR-006 — One agent-instruction file, imported rather than duplicated

**Status:** accepted 2026-08-27

**Problem.** `AGENTS.md` was duplicated into `CLAUDE.md` and `.cursor/rules` as symlinks.
Writing `CLAUDE.md` therefore wrote through the link and destroyed the schema — which
happened during this work.

**Decision.** `AGENTS.md` is the single source. `CLAUDE.md` is a regular file containing
`@AGENTS.md`, the import Anthropic documents for repositories that already use AGENTS.md.
`.cursor/rules` deleted (unused).

**Cost.** `AGENTS.md` is 350 lines, above Anthropic's ~200-line guidance. Accepted: it is a
schema, and the frontmatter and trust-ladder tables are exactly what agents get wrong when
absent. If adherence degrades, split Operations into `.claude/rules/` with path scoping.

---

## ADR-007 — The publish gate withholds pages instead of failing the build

**Status:** accepted 2026-08-27

**Problem.** A policy violation on one page should not prevent inspecting the other 268,
but it must also never ship.

**Decision.** Violations withhold the offending page and are reported with a reason; the
build always produces a safe artifact. `--strict` (the default for `make publish`) still
exits non-zero so CI fails. Links to withheld pages are flattened to plain text and the
indexes are regenerated from the published subset, so a withheld page cannot be linked
into existence.

**Cost.** A silently smaller site if nobody reads the output. Mitigated by the exit code
and by `audit_output`, which re-reads the finished tree and refuses on any leak.

---

## ADR-008 — Verbatim overlap is measured on expressive prose only

**Status:** accepted 2026-08-27

**Problem.** A 20-word shared run between a page and its source is the signal for
unattributed copying. Naively applied it produced 19 violations, most of them benchmark
tables, LaTeX formulas, and URLs — shingle normalisation strips punctuation, so
"1 22 8 c2 50k 20 9 24" is a twenty-word run.

**Decision.** Runs must be ≥70% alphabetic words and ≤25% URL components to count, and
findings report distinct passages rather than overlapping windows (one copied sentence was
reported as 16 incidents). 19 → 10 → 8 → 6, and the 6 that remain are genuine.

**Cost.** A page that reproduces a whole results table will pass. Accepted: factual data is
a different question from an author's sentences, and conflating them buried the real
findings.

---

## ADR-009 — Trust reporting ships with the site

**Status:** accepted 2026-08-27

**Problem.** Publishing LLM-written pages without saying so invites a reader to treat them
as authored research.

**Decision.** `reports/trust.md` is part of the published build and states what was
checked, the numbers, and explicitly what the checking does *not* establish — that a
present figure may still be misused, that charts are invisible to text extraction, that
the reasoning is the model's. `NOTICE.md` names every source and discloses LLM authorship.
Every page carries its status in a footer.

**Cost.** The published site advertises its own limitations. That is the point.

---

## ADR-010 — Nothing leaves the machine without per-action approval

**Status:** accepted 2026-08-27

**Problem.** A public git history cannot be un-published, and the private layer contains
third-party copyrighted material.

**Decision.** No remote, no push, no repository creation without explicit approval for that
specific action. `dist/` is gitignored. The publish pipeline is verified locally against a
served Quartz build.

**Cost.** The work is backed up only by a local `git bundle` until the owner decides
otherwise, which is a real risk recorded in `README.md`.
---

## ADR-011 — Grouping happens in the published output; the vault stays flat

**Status:** accepted 2026-08-29

**Problem.** The Quartz explorer builds its navigation tree by splitting each slug on `/`,
so groups can only come from real directories in the published content. `wiki/` has 279
published pages and zero subdirectories, which renders as one flat alphabetical list where
160 of the 279 filenames (57%) begin with `source-` and bury the 91 concept pages that are
the actual contribution. Hierarchical navigation therefore needs directories, and
`AGENTS.md`, `tools/kb_lib.py`, `tools/build_index.py`, `NM001`–`NM003` and `IX001`–`IX006`
all require the vault not to have any. The two facts conflict.

**Decision.** Group in `dist/public/` only; the vault does not move. Published layout is
domain-major, `<domain>/<kind>/<slug>`, with each domain's Map_Page becoming `<domain>/index`
so that it labels the group a Reader clicks instead of being an orphaned navigational page.
`KIND_SEGMENTS` in `tools/kb_lib.py` maps concept/synthesis/comparison → `concepts`,
entity → `entities`, source-summary → `sources`; `moc` is absent from it deliberately.
Measured on the current vault: 10 top-level groups and a largest leaf of 51. Domain-major
beats type-major because the domain is the unit every other requirement is written against —
reading paths, page counts and thin-coverage labels are all per-domain, as are the 10
Map_Pages. `synthesis` and `comparison` file under `concepts` rather than getting segments of
their own, matching the grouping `build_index.build_moc` already uses and avoiding
directories that hold one page.

**Cost.** Published URLs change, so `/wiki/transformer` moves and every inbound link and
bookmark breaks unless redirects are emitted — redirect emission becomes a pipeline
obligation rather than an option. `tools/publish.py` stops being a pure filter and gains a
page-to-group mapping, which is a new way to misplace a page and needs tests. Flat vault
filenames no longer match published URLs one-to-one, so debugging a published page is one
hop less direct. And "the Source_Note group", singular in the requirements, becomes ten, one
per domain; the reader-facing intent holds, because `concepts` sorts first and `sources`
sorts last and collapsed inside every domain. Accepted because the rejected alternative —
migrating the vault into subdirectories — would have touched 311 vault files, five tools plus
their fixtures, and nine lint codes for a reader outcome that is identical, and would have
made every new page a directory decision forever.

---

## ADR-012 — The injected page header gets 4,608 bytes, not 4,096

**Status:** accepted 2026-08-29, deviates from Requirement 10.1 of the wiki-site-experience spec

**Problem.** That requirement caps the header injected above each page body — trust badge,
type label, summary, relationship panel — at 4,096 bytes of uncompressed HTML, and the
prescribed response to a breach is to fail the build and name the page. Measured against the
real vault with the final markup (root-absolute hrefs, no heading elements, minimal
attributes): p50 873 B, p90 1,883 B, p95 2,329 B, p99 3,276 B. 278 of 279 pages fit.
`transformer` needs 4,150 B — 54 bytes over, 1.3% — carrying 13 `related` and 20 `sources`
entries. So the budget as written stops the first build over one page.

**Decision.** `HEADER_BUDGET_BYTES = 4608`, one named constant in `tools/kb_lib.py`, and
Requirement 10.1 is read as amended to match. Rejected: capping each panel group at 12
entries with an "and N more" link, which brings the maximum to 3,162 B but drops relationship
links from the page, contradicting the requirement that the panel render on all 109 pages
carrying `related` and all 94 carrying `sources` — that trades a stated correctness guarantee
for 54 bytes. Also rejected: shaving attributes, which buys tens of bytes and reopens the
moment another well-connected page appears. 512 extra bytes on one page whose median total
weight is 25 KB is not a cost a Reader can perceive; a hidden relationship is.

**Cost.** The enforced budget is 12.5% looser than the number that motivated it, and a
presentation budget that has been relaxed once is easier to relax again — which is why it is
a single constant with the measured distribution recorded beside it, so the next request to
raise it has to argue against the same figures. Relaxing it also removes the pressure that
would have forced the per-group cap to be designed, so returning to 4,096 is not the
one-line constant change it looks like: the cap has to be designed first, with an answer for
what "and N more" does to the guarantee above. The known overshoot is pinned in the design as
a real-vault assertion — maximum at or under the budget, and exactly one page over 4,096 —
so a regression stays distinguishable from this accepted deviation rather than hiding inside
the new headroom.

---

## ADR-013 — ADR-012's arithmetic, re-measured after the prerequisite line

**Status:** accepted 2026-08-29, supersedes the figures in ADR-012; the decision itself stands

**Problem.** ADR-012 records `transformer` exceeding Requirement 10.1's 4,096-byte header
budget by **54 bytes**, measured when that page's injected header came to 4,150 bytes. That
measurement predates task 7.3 of the wiki-site-experience spec, which added the reading-path
prerequisite line to the header of every page a path cites — `transformer` is entry 6 of the
`llm-fundamentals` path. Re-measured against the real vault with the shipped markup, its
header is **4,390 bytes**, so the overshoot is **294 bytes** (7.2%), not 54 (1.3%). The
distribution moved with it: p50 **729 B**, p90 **2,044 B**, p95 **2,498 B**, max **4,390 B**,
where ADR-012 recorded p50 873, p90 1,883, p95 2,329. The page carries 13 `related`, 20
rendered `sources`, and that prerequisite line. It is still the only page over 4,096, and it
still fits `HEADER_BUDGET_BYTES = 4608` — with 218 bytes to spare rather than 458.

**Decision.** ADR-012 stands; only its arithmetic is superseded. Read every "54 bytes" in that
record as **294 bytes**, and its measured distribution as the figures above. The rejected
alternative is rejected for the same reason, and the reason is if anything stronger: capping
panel entries at 12 per group would trade Requirement 3.3's guarantee that every surviving
relationship renders — Property 11 — for 294 bytes on 1 page in 279. `HEADER_BUDGET_BYTES`
stays at 4608 and is deliberately *not* re-derived from the new maximum, because a budget that
tracks the largest page has stopped being a budget. Recorded as an amendment rather than an
edit, because this file is append-only.

One figure in ADR-012's rejected-alternative sentence is worth pinning while it is being read
closely. "All 94 carrying `sources`" is the count of published pages that carry the field,
which is correct. The count that renders a `sources` group is **92**: `graph-prompting` and
`prompts-hub` cite only withheld sources, so Requirement 3.5 removes every entry and no group
is drawn. The guarantee the cap would trade away is over surviving entries, so 92 is the
figure the argument turns on, and it does not change the argument.

**Cost.** The headroom ADR-012 bought is now visibly thinner, and it thinned for a reason the
ADR did not anticipate: not a page acquiring relationships, but a *feature* adding a line to
every header. So the next header addition is a candidate to breach 4,608, and it will arrive
from a design decision rather than from the vault. Two things follow. Any change that adds
content to the header re-measures the real-vault distribution before it lands, and the example
test pinning "exactly 1 page over 4,096" is the tripwire if it does not. And ADR-012 warned
that a presentation budget relaxed once is easier to relax again; this record is the first
evidence for that warning rather than a counterexample to it, so a request to raise 4,608
should be answered with the per-group cap ADR-012 deferred, not with a larger constant.

---

## ADR-014 — Page weight is measured and reported, not enforced

**Status:** accepted 2026-08-30, amends Requirement 10 of the wiki-site-experience spec: criteria
10.2, 10.3 and 10.4 become reported measurements, and 10.6's fail-the-build clause now reaches only
10.1 and 10.5

**Problem.** Two things, and the order matters.

The owner's decision came first: page weight is not a constraint on this site. In their words, they
are lenient toward the HTML budget and more concerned about quality than anything — if images,
inline SVG or anything else makes the site richer and helps a Reader understand a concept, it ships.
There is no byte figure whose breach should stop a deploy of correct content.

The second thing is what turns that from a relaxation into a correction. **The budget was not a valid
comparison in the first place.** Requirement 10.3 states its p95 as "at or below 72,000 bytes
uncompressed, holding the current p95 of 68 KB". That 68 KB was measured over 594 built HTML files —
the whole pre-feature output, **including its 290 alias-redirect stubs**, which are meta-refresh
documents of about 344 bytes each and made up 49% of the population. `check-built-site.mjs` excludes
stubs from its page population, correctly, because a redirect nobody reads is not a page. So the gate
was comparing a stub-excluded measurement against a stub-polluted figure. Measured on both footings —
pre-feature at `b54ce4a` of the public repo under its own configuration, against the current build:

| Population | Pre-feature | Current | Change |
| --- | --- | --- | --- |
| Content pages + redirect stubs (n=594 → 900) | 70,623 B | 60,626 B | −9,997 B, −14% |
| Content pages only (n=304 → 330) | 89,138 B | 89,807 B | +669 B, +0.75% |

The first row is where the 68 KB came from, and it reproduces there — so on the population the budget
was written against, the site got 14% lighter. The second row is the population the gate measured,
and on it the pre-feature site was already 89,138 B, 17 KB over its own stated budget, before this
feature existed. The feature's true cost at the p95 is 669 bytes. Failing the build on that would
have been reporting a population defect as a site defect. Also re-measured: the content-only maximum
went 187,924 B → 229,248 B, which is `log.html` growing because this work appended to the changelog,
not a page-weight regression from the feature.

**Decision.** `weight-max`, `weight-p95` and `weight-total` in `scripts/check-built-site.mjs` become
reported measurements. They measure what they measured before, print the same detail — including
`whyHeavy()`'s per-page byte breakdown, which is the diagnostic worth keeping — and contribute
nothing to `failures`. Four choices inside that:

*A fifth status, `report`, not a `pass`.* `pass` is a claim that something was asserted and held;
these three assert nothing, and the build can be over every figure and still exit 0. Reusing `pass`
would make one summary line mean two things, which is the failure mode `partial` was added to avoid.
It is counted as `reported=N` in the `RESULT=` marker, placed after `partial=N` because `pages.yml`
greps `RESULT=[a-z-]+ .*partial=[1-9]` and `partial=[0-9]+` and must keep reading what it always
read. The verb vocabulary is untouched, so `RESULT=pass-with-skips` still means a skip and never a
measurement.

*Enforcement is retained behind `--enforce-weight`, not deleted.* The flag restores the original
pass/fail gate for all three, verified to still fail. A future owner who wants the gate back turns it
on rather than reconstructing it, and `--max-bytes` / `--p95-bytes` / `--total-bytes` keep working as
the figures a measurement is reported against.

*The register partition and `REGISTER_MAX_BYTES` stay.* That partition existed to admit the activity
log without moving the Reader ceiling, which sounds like dead weight once nothing fails. It is what
makes `--enforce-weight` worth having: without it the restored gate fails on `log.html` at 229,248 B,
a register whose size tracks how much the vault has ingested and which nobody considers a defect — a
flag that reports a known-acceptable fact as a breach is a flag no one turns on. It also carries
`registerRunway()`'s "N further entries, then it is pagination", the one piece of weight advice still
worth acting on, and it keeps the log's size printed on every run.

*Two neighbouring budgets are deliberately untouched.* The Search_Index budget of 1,000,000 bytes
(Requirement 9.1, `SEARCH_CONTENT_LIMITS`) bounds `static/contentIndex.json`, which every visitor
downloads before search works at all — a different kind of cost from a page a Reader chose to open,
and a separate question the owner is raising separately. And `kb.HEADER_BUDGET_BYTES` (Requirement
10.1, ADR-012 and ADR-013) stays a gate: it is a tripwire on a header-rendering bug, not a
page-weight budget.

**Cost.** Nothing now catches a page that becomes genuinely enormous. Not a page that grows — a page
that breaks: a template defect that inlines something 40 times, a KaTeX regression, an emitter loop.
The gate would have caught that class of thing for the wrong stated reason, and it will no longer
catch it at all. The only mitigation is that the figures print on every run, with the heaviest pages
named and their bytes broken down, so the evidence is in front of anyone who reads the gate output —
which is weaker than a gate, because it depends on someone reading. If a page-weight surprise is ever
found in production, this ADR is where to look first, and the fix is `--enforce-weight` with figures
re-measured on the content-only population, not the ones recorded above.

Two smaller costs. The three reference figures now have no mechanism keeping them current: a budget
is re-derived when it fails, a reference figure just goes stale, so the numbers in Requirement 10.2
to 10.4 should be read as "what the site measured on 2026-08-30" and not as a target. And the status
vocabulary grew to five, so anything that parses this script's output has one more value to know
about — `pages.yml` does not, having been checked, but the next consumer will have to be.

## ADR-015 — A public `diagrams/` directory, SVG only, referenced-and-attributed or it fails

**Status:** accepted 2026-08-30. Adds a directory to the layout, five finding codes
(`DG001`–`DG005`), and criterion 12.7 to Requirement 12 of the wiki-site-experience spec. Does
**not** amend hard rule 2: the private layer are untouched and the allowlist that excludes
them is unchanged.

**Problem.** Nothing on the published site was visual. Every explanation of a mechanism —
attention, the Transformer stack, the RLHF branches, the RAG pipeline — was prose plus, in four
cases, ASCII art inside a code fence. The blocker was not authoring effort. It was that the only
place the schema had for an image was the private layer, which is private third-party material behind a
Git LFS filter and is never published, so a figure stored the way the conventions said to store
it could not reach a Reader. Publishing a figure needed a second path that the allowlist copies
through, which is a schema change.

**Decision.** Four parts.

**1. A new root-level `diagrams/` directory, and the private layer keeps its meaning.** The line between
them is provenance, not file type: `diagrams/` is work authored here for publication, the private layer
is somebody else's material held for reference. Nothing may be moved from one to the other. This
is why the answer was a new directory rather than a "public" subdirectory inside the private layer — a
rule of the form "the public ones inside the private directory" is not one a reviewer can check
by looking, and the whole value of an allowlist is that it is a list.

Root-level rather than `wiki/diagrams/`, because `NM001` holds `wiki/` flat.

The name was chosen against a real collision. `BARE_DIR_RE` is `\b(?:raw|assets)/`, and `\b`
matches at a `-`-to-letter boundary, so **`public-the private layer and `wiki-the private layer are both matched
and would have been silently redacted out of every page that named them**. Tested before
choosing: `diagrams/`, `figures/`, `media/` and `images/` are all clean.

**2. SVG only.** Three reasons, in order of how much they cost to ignore:

- **`.gitattributes` LFS-filters `*.png`, `*.jpg`, `*.jpeg`, `*.gif` and `*.webp` repo-wide, and
  not `*.svg`.** GitHub Pages serves committed bytes and does not resolve LFS pointers, so a PNG
  committed under the current filters publishes as a ~130-byte text pointer and renders as a
  broken image. That failure is invisible locally and only appears on the deployed site.
- **SVG is text**, so it travels on the existing `OutputFile(path, text)` carrier and through
  `write_output` unchanged. A binary format needs a second carrier threaded through every stage,
  and the pipeline's twelve named stages are load-bearing — three of them document an ordering
  constraint. Adding a thirteenth to move bytes would be the largest structural change in this
  work, in service of the least interesting part of it.
- **SVG diffs**, so a change to a figure is reviewable the way a change to prose is.

**3. The reference form was measured, not chosen.** Four spellings are plausible and three are
broken, all three silently. Against a real Quartz build:

| Authored | Emitted | Verdict |
| --- | --- | --- |
| `![alt](/diagrams/x.svg)` | `<img src="../../diagrams/x.svg" alt="alt">` | correct |
| `![[x.svg\|alt]]` | `<object data="x.svg" aria-label="alt">` | 404 at depth |
| `![[diagrams/x.svg\|alt]]` | `<object data="diagrams/x.svg" …>` | 404 at depth |
| `![alt](../../diagrams/x.svg)` | `src="../.././../diagrams/x.svg"` | Property 18 |

Only the root-absolute markdown form survives, for the reason `rewrite_root_links` already
records: Quartz re-resolves a root-absolute href correctly from any depth and corrupts a relative
one. So pages author `![[x.svg|alt]]`, which previews natively in Obsidian, and the gate rewrites
it to the form that works. That rewrite must run **before** `rewrite_excluded_links` — the first
attempt had it after, the link flattener ate the embed because `x.svg` is not a published page
key, and every figure then failed `DG003` for being unreferenced, which was a correct report of a
state the transform had itself caused.

**4. Two rules, both fail-closed, plus alt text as a real gate.**

- `DG003` — a figure no **published** page embeds fails the build. Referenced-only is the whole
  guarantee: a file lands in the public tree because a page asked for it, never because it was in
  the directory. A file copied to a public site for no stated reason is how a private layer leaks
  one commit at a time.
- `DG004`/`DG005` — every figure needs an entry in `diagrams/README.md` stating **both** an
  origin and a licence. Two fields rather than one free-text note, because "where did this come
  from" and "what may a Reader do with it" are different questions and one note reliably answers
  only the first. "It is probably ours" is not a licence.
- `DG001`/`DG002` — a missing figure, or an embed with no alt text, fails. Alt text is a gate and
  not a warning: it is the figure's entire content for a screen reader and everything a failed
  image load leaves behind, and a figure carrying an argument only sighted Readers can follow is
  a figure that does not carry it. Enforced twice on purpose — `tools/validate.py` checks the
  authored embed, and `check-built-site.mjs`'s new `figures-resolve` check confirms it survived
  into the `alt` attribute a browser reads, which is a different claim.

All five are fatal rather than page-withholding. None of them withholds a page — a page whose
figure is missing is still publishable prose — so reporting one under WITHHELD would state
something false about what happened, and every repair is a filename fix or a one-line register
entry rather than a choice between two bad options.

**Mermaid, and why it is preferred to both directories.** Structure — a flow, a pipeline, a
decision tree, a sequence — is better expressed as a ```mermaid fence than as any file: no
attribution, no register entry, no second artifact to keep in sync, and it diffs. `mermaid: true`
is already the default in the Obsidian-flavored-markdown plugin's options, so no configuration
changed. An authored SVG is for what Mermaid cannot express, which in practice means anything
whose content is position or scale: a matrix, a plot, a heatmap. Both figures shipped here are of
that kind — a causal-mask grid and two log-log slopes.

Two costs, accepted and recorded.

**Mermaid renders from a CDN.** Quartz lazily imports
`cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.0/mermaid.esm.min.mjs` at runtime on pages that have
a diagram, so those pages do not render their figures with JavaScript disabled or the CDN blocked
— they degrade to a code block showing the Mermaid source, which is less readable than the ASCII
art it replaced. This is **not** a new class of dependency, and an earlier draft of this ADR said
it was: `check-console.mjs` reports the hosts actually contacted, and the site already reaches
`cdn.jsdelivr.net` (KaTeX fonts, pixi.js), `fonts.googleapis.com` and `fonts.gstatic.com`. It is
a fourth third-party host on a site that had three. `cdnjs.cloudflare.com` is not in the
`ANALYTICS_HOSTS` list `no-analytics` scans for, correctly — it serves a rendering library, not
telemetry — and that check still reports 0 references across the build.

**The figures paint their own light background.** Each SVG draws an opaque light panel with dark
ink rather than inheriting the page's colours, so it reads identically on the light and dark site
themes. The elegant alternative is a `prefers-color-scheme` media query inside the SVG, which
does work for an `<img>`-referenced document — but it follows the **operating system** setting,
not the site's theme toggle, so a Reader on a light OS who switches the site to dark would get a
light figure on a dark page. A figure that is always a figure was judged better than one that is
usually right.

**Cost.** The register is hand-kept, so it can go stale in one direction: an entry naming a file
that no longer exists is deliberately not a finding, because failing a build over a stale line
would punish deleting a figure. Nothing catches that. `DG003` is also strict enough to be a
nuisance in the small: a figure cannot be committed one change ahead of the page that uses it.
That is the intended trade — the alternative is a directory of files nobody can account for — but
it means "add the figure and the reference together" is now a rule rather than a preference.
