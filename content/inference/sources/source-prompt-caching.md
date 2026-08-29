---
type: source-summary
title: "Prompt caching — Anthropic Claude Platform"
summary: The canonical Claude Platform API documentation for Prompt Caching — Anthropic's mechanism to cache prompt prefixes with cachecontrol to cut cost and latency by reusing KV and prefix state.
status: draft
visibility: public
author: "Anthropic"
source-type: code-doc
url: "https://platform.claude.com/docs/en/build-with-claude/prompt-caching"
date-published: 2025-08-24
date-ingested: 2026-08-24
tags:
  - inference
  - mlops
  - agents
key-concepts:
  - "[[prompt-caching]]"
  - "[[inference]]"
  - "[[context-engineering]]"
  - "[[context-caching]]"
key-entities:
  - "[[anthropic]]"
aliases:
  - wiki/source-prompt-caching
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The canonical Claude Platform API documentation for Prompt Caching — Anthropic's mechanism to cache prompt prefixes with cachecontrol to cut cost and latency by reusing KV and prefix state.</p>
<p class="kb-provenance">Anthropic, 2025-08-24. <a href="https://platform.claude.com/docs/en/build-with-claude/prompt-caching">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 1 of 18 figures on this page were not found in [https://platform.claude.com/docs/en/build-with-claude/prompt-caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching): `90%`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The **canonical Claude Platform API documentation** for **Prompt Caching** — Anthropic's mechanism to cache prompt prefixes with `cache_control` to cut cost and latency by reusing KV and prefix state. It details **two modes** — **automatic caching** (single top-level `cache_control: {type:"ephemeral"}` auto-moved to last cacheable block, ideal for multi-turn) and **explicit breakpoints** (per-block `cache_control` on tools/system/messages for fine-grained control, up to 4) — the underlying **how it works** (prefix hash check up to breakpoint, otherwise write after response begins; 5-minute TTL refreshed on hit, 1-hour at 2× write cost), **pricing** (writes 1.25×/2× base, hits 0.1×; e.g., Opus 5 $5/$6.25/$10/$0.50 per MTok), **support** (all active Claude models with platform-specific minimums), **structuring** (hierarchy `tools→system→messages`, 3 principles: writes only at breakpoint, reads walk back, 20-block lookback window with growing-conversation example and timestamp trap), **limitations** (512–4,096 token minima per model, ephemeral only), **what can/cannot be cached** (tool use/results yes, thinking blocks only alongside, citations/empty no), **invalidation matrix** (tool definitions invalidate all, web search/citations/speed invalidate system+messages, tool_choice/images invalidate messages only), **usage tracking** (`cache_creation_input_tokens`/`cache_read_input_tokens`/`input_tokens`), **thinking-block handling**, **workspace vs organization isolation**, and **best practices** (stable prefix at beginning, breakpoint on last stable block, hybrid automatic+explicit, diagnostics beta, key-order stability, 20+ examples).

## Key Takeaways
1. **Two Enabling Modes:** `Automatic` (top-level `cache_control: {type:"ephemeral"}` → system auto-applies to last cacheable block and marches forward each turn; handles growing history without marker updates) vs `Explicit` (place `cache_control` on individual blocks — tools/system/messages — for control over sections changing at different frequencies, up to 4 breakpoints). Both share pricing/thresholds/ordering.
2. **Prefix-Hash Mechanics & 20-Block Window:** Cache is a hash of the prefix *up to and including* the breakpoint — not per-block entries. Write happens only at breakpoint; read walks backward up to 20 blocks looking for a prior write's hash (example: 10-block write, 15-block hit at 10, 35-block with 20-window misses 15 → needs second breakpoint at 15). Common mistake: putting breakpoint on varying suffix (timestamp/user message) → hash never matches because later hash includes varying block; fix by moving breakpoint to end of static prefix (automatic caching has same trap — use explicit for varying suffixes).
3. **TTL & Cost Economics:** Default 5 min (refresh free on hit), measured from request start (response generation counts). 1-hour TTL at 2× base write cost (`{ttl:"1h"}`) for longer reuse. Pricing multipliers stack with Batch/data-residency: 5m writes 1.25×, 1h writes 2×, hits 0.1× base. Table e.g., Opus 5 $5→$6.25/$10→$0.50, Sonnet 5 $2→$2.50/$4→$0.20, Haiku 4.5 $1→$1.25/$2→$0.10; retired Opus 4 $15→$18.75/$30→$1.50. Writes charged 25% premium because cache creation still processes input; hits are 90% discount — reaching minimum cacheable length (512–4k per model) often pays for itself on repeated prefixes.
4. **Minimums & Eligibility:** Per-model minima (512 tokens for Opus 5/Fable 5, 1,024 for Sonnet 5/Opus 4.8, 2,048 for Mythos Preview/Opus 4.7, 4,096 for Opus 4.5/4.6/Haiku 4.5) — below threshold marked requests process without caching, both usage fields 0, no error. Minimums apply per platform (Claude API, AWS, Vertex, Foundry); Bedrock has separate docs.
5. **Invalidation Hierarchy:** Cache order `tools` → `system` → `messages` — change invalidates that level and all later: tool definitions invalidate all; web search/citations/speed invalidate system+messages; `tool_choice`/images invalidate only messages; `thinking`/`effort` params are model-specific (always invalidate messages, sometimes tools/system depending on Opus/Sonnet version; see `thinking#prompt-caching`). On Fable 5/Mythos 5/Opus 4.8+/Opus 5, mid-conversation `{"role":"system"}` in `messages` avoids system invalidation.
6. **Thinking Blocks & Usage Accounting:** Thinking blocks cannot be directly marked with `cache_control` but are cached alongside when they appear in prior assistant turns (common during tool use). When read from cache they count as `input_tokens`. Invalidation diverges: Opus 4.5+/Sonnet 4.6+ preserve thinking on non-tool user messages; earlier Opus/Sonnet and all Haiku strip thinking and following messages.
7. **Best Practices & Use Cases:** Cache stable reusable prefixes at beginning (tool defs, system, examples, large doc), breakpoint on last stable block (static prefix end), use automatic for conversations, explicit for multi-frequency sections, ensure stable key ordering (Swift/Go random JSON breaks hash), wait for first response before parallel hits, monitor `cache_creation/read` and `input_tokens` (total = read+creation+input; `input_tokens` is only post-breakpoint — e.g., 100k read + 0 creation + 50 input = 100,050 total). Recommended for: long instructions/20+ few-shots, large docs (books/papers), agentic tool loops, coding assistants, conversational agents, plus diagnostics beta to pinpoint divergence.

## Detailed Notes

### How Prompt Caching Works (Section)
- Check prefix hash vs breakpoint; if hit, reuse; else process full and cache prefix once response begins. Especially useful for many examples, large context, repetitive tasks, long multi-turn. Cache refreshed at no cost on hit; lifetime from request start (4-min streaming leaves ~1 min window for next hit). Tip: caches full prefix `tools, system, messages` up to block.

### Automatic Caching (Section)
- Code samples across 8 languages (curl, CLI `ant messages create --transform usage`, Python `cache_control=dict`, TypeScript, C#, Go, Java, PHP, Ruby) for single-turn literary analysis and multi-turn Alex example (System + User1 + Asst1 + User2). Moving breakpoint table Request1-3. TTL default 5m, 1h optional. Combining: automatic uses one of 4 slots; example caching system explicitly while automatic handles conversation. Edge cases: no-op if last block already ephemeral, 400 if different TTL or 4 breakpoints full, silent walk-back if last block ineligible; Bedrock legacy Opus 4.6- returns 400 for top-level `cache_control`.

### Explicit Breakpoints (Section)
- Structuring: static at beginning; cache prefixes hierarchy; automatic prefix checking 3 principles detailed; growing conversation 10→15→35 example; common mistake timestamp on block 6 → move to block 5; multiple breakpoints for different frequencies / beyond 20 blocks; cost note: breakpoints free, charged only on reads/writes.

### Caching Strategies (Section)
- **Limitations:** Full minima table per model, concurrent first-response requirement, ephemeral only, ZDR note.
- **What can be cached:** bullets for tools/system/messages/images/documents/tool use/results with cache_control; cached alongside for thinking.
- **What cannot:** thinking blocks directly, sub-content/citations, empty blocks.
- **Invalidation:** Full matrix table with ✓/✘ per What changes vs Tools/System/Messages + notes for Thinking/Effort per model via `thinking#prompt-caching`.
- **Tracking:** Three usage fields, spatial explanation (read=before breakpoint cached, creation=before breakpoint new, input=after breakpoint), example 100k/0/50.
- **Thinking blocks:** Section with tool-use example (Request1 thinking+tool_use, Request2 tool_result cache=True, Request3 non-tool text → model-specific stripping vs preservation).
- **Storage/sharing:** workspace-level isolation (Claude API/AWS/Foundry) vs organization (Bedrock/GCP), exact matching, output unaffected.
- **Best practices:** bullets 6 + **Optimizing for use cases** (6 bullets: conversational, coding, large docs, 20+ examples, agentic tool use, books/papers).
- **Troubleshooting:** 7 bullets including key-order stability and cache diagnostics beta.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 6 passages in this section could not be located in the stored source ([https://platform.claude.com/docs/en/build-with-claude/prompt-caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Prompt caching optimizes your API usage by allowing resuming from specific prefixes in your prompts. This significantly reduces processing time and costs for repetitive tasks or prompts with consistent elements."

> "Cache prefixes are created in the following order: `tools`, `system`, then `messages`."

> "Cache writes happen only at your breakpoint. [...] Cache reads look backward for entries that prior requests wrote. [...] The lookback window is 20 blocks."

> "Place `cache_control` on the last block whose prefix is identical across the requests you want to share a cache."

> "Prompt caching caches the full prefix — `tools`, `system`, and `messages` (in that order) up to and including the block designated with `cache_control`."

> "The `input_tokens` field represents only the tokens that come after the last cache breakpoint in your request - not all the input tokens you sent."

## Concepts Introduced or Referenced
- [[prompt-caching]] — Core mechanism: automatic vs explicit breakpoints, 5m/1h TTLs, pricing multipliers, hierarchy, prefix-hash 20-block lookback, stable-block placement, minima, thinking/ invalidation handling, usage fields.
- [[inference]] — Prefill vs decode split where cached prefix avoids prefill recomputation; total token accounting and rate-limit implications.
- [[context-engineering]] — Badge as strategy: smallest high-signal prefix at beginning, breakpoint on last stable block, hybrid automatic+explicit, cache at beginning best.
- [[context-caching]] — Concrete implementation alongside Gemini `CachedContent` — cache as prefix/KV reuse for large static context with TTL and refresh.
- [[model-context-protocol]] — Included in context state alongside tools/system before messages.

## Critical Assessment
- **Strengths:** Definitive, exhaustive reference covering every dimension of caching — 8-language code samples, pricing table with multipliers, invalidation matrix, thinking-block nuances per model version, and actionable debugging (stable-block placement, 20-block walk, exact-match, diagnostics beta). As the pre-retrieval/hybrid caching counterpart to Anthropic's JIT theory (Sep 2025) and LangChain's write/select taxonomy (Jul 2025), it operationalizes the "cache at beginning, 20-break lookback" rule that engineers need for production.
- **Limitations:** No empirical latency/reuse hit-rate numbers beyond pricing; pricing table quickly dates (models like Fable 5/Mythos 5 are speculative/limited availability); thinking/effort invalidation model-specificity requires cross-referencing separate `thinking#prompt-caching` docs; concurrent-request first-response constraint not quantified; ZDR and workspace vs org isolation nuances buried in notes.
- **Wiki Integration:** Fills the implementation gap left by [[source-effective-context-engineering-for-ai-agents]] (principled scarcity) and [[source-context-engineering-for-agents-langchain]] (operational 4-bucket) — now the concrete `cache_control` API for the "select/write" buckets and the long-horizon prefix (CLAUDE.md + examples) strategy. No contradictions; should be linked from [[context-engineering]] and [[context-caching]] as the Claude-flavored caching primitive.

---

**Source:** Prompt caching — Anthropic Claude Platform by Anthropic — <https://platform.claude.com/docs/en/build-with-claude/prompt-caching>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
