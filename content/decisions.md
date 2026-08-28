---
title: Decisions
---

# Decisions

Architecture decision records for the knowledge base itself. Each entry states the
problem, the decision, and what it costs — the last part matters most, because a
decision recorded without its downside gets revisited by someone who only sees the upside.

Append new records; do not rewrite old ones. Supersede instead.

---

## ADR-001 — The index is generated, never hand-maintained

**Status:** accepted 2026-08-27

**Problem.** The v1 `index.md` was written by hand. Descriptions were sliced out of page
bodies at ~120 characters with `...` markup deleted, producing 308 malformed entries
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

**Problem.** The plan called for moving unrecoverable sources to (source held privately).

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
