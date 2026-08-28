---
type: concept
title: "Prompt Caching"
summary: Prompt Caching is Anthropic's prefix-caching primitive for the Claude API that reuses the KV and prefix state for static prompt prefixes marked with cachecontrol, cutting cost to 10% and latency on cache hits.
visibility: public
aliases:
  - "Claude Prompt Caching"
  - "Prefix Caching"
  - "KV Cache Reuse"
  - "Automatic Caching"
tags:
  - inference
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-prompt-caching]]"
  - "[[source-effective-context-engineering-for-ai-agents]]"
  - "[[source-context-engineering-for-agents-langchain]]"
related:
  - "[[inference]]"
  - "[[context-engineering]]"
  - "[[context-caching]]"
  - "[[claude-code]]"
  - "[[anthropic]]"
  - "[[context-engineering-thesis]]"
---

# Prompt Caching

## Overview
**Prompt Caching** is Anthropic's **prefix-caching** primitive for the Claude API that reuses the KV and prefix state for static prompt prefixes marked with `cache_control`, cutting cost to **10%** and latency on cache hits. Documented canonically in [[source-prompt-caching]] (platform.claude.com, 2025), it offers **automatic caching** (single top-level `cache_control: {type:"ephemeral"}` auto-moved to the last cacheable block — ideal for growing multi-turn conversations) and **explicit breakpoints** (per-block `cache_control` on `tools`→`system`→`messages`, up to 4) sharing the same hierarchy, pricing, and underlying infrastructure.

## Key Ideas

### 1. Two Modes, One Infrastructure
- **Automatic:** `cache_control: {type:"ephemeral"}` at top-level → system auto-applies to last cacheable block each turn and marches forward (Table: Request1 writes System+User1+Asst1+User2; Request2 reads System→User2, writes Asst2+User3). TTL 5m default, `ttl:"1h"` at 2×. Combines with explicit (uses one of 4 slots); no-op if last block already ephemeral, 400 if different TTL or 4 explicit full.
- **Explicit:** Place `cache_control` on individual blocks (tools/system/messages content). Needed for caching sections changing at different frequencies, precise control, or ensuring a hit when growing conversation pushes breakpoint ≥20 blocks past last write.

### 2. Prefix-Hash Mechanics — 3 Principles + 20-Block Window
1. **Writes only at breakpoint:** Hash is cumulative prefix up to and including breakpoint — single entry, not per-block.
2. **Reads walk back:** On each request compute hash at breakpoint and walk back up to **20 positions** checking for prior writes.
3. **Lookback = 20:** Breakpoint itself is first. Example: Turn1 10-block write, Turn2 15-block hit at 10, Turn3 35-block (35→16) misses 15 → need second breakpoint at 15 from start. **Common trap:** breakpoint on varying suffix (timestamp/user message) → hash never matches stable prefix → always write, never read; fix by moving to **last stable block's end** (end of static prefix). Automatic caching has same trap when last block varies — use explicit.

### 3. Pricing & Minimums
Multipliers stack with Batch/data-residency: **5m writes 1.25× base, 1h writes 2×, hits 0.1×**. Examples:
- Opus 5: $5 → $6.25/$10 → $0.50 per MTok
- Sonnet 5: $2 → $2.50/$4 → $0.20
- Haiku 4.5: $1 → $1.25/$2 → $0.10
(Older Opus 4 $15→$18.75/$30→$1.50). Minimum cacheable tokens: **512** for Opus 5/Fable 5, **1,024** for Sonnet 5/Opus 4.8, **2,048** for Mythos Preview/Opus 4.7, **4,096** for Opus 4.5/4.6/Haiku 4.5; below threshold → no caching, both usage fields 0, no error. Ephemeral only; must wait for first response before parallel hits.

### 4. Hierarchy & Invalidation
Order `tools` → `system` → `messages`; change invalidates that level and all subsequent:
- `tools` definitions → all
- `web_search`/`citations`/`speed` toggles → system+messages
- `tool_choice`/images → messages only
- `thinking`/`effort` → always messages, plus tools/system model-specifically (Opus/Sonnet version dependent). Mid-conversation `{"role":"system"}` in `messages` preserves cache on Fable 5/Mythos 5/Opus 4.8+/Opus 5.

### 5. What Can Be Cached & Thinking Special Handling
Cacheable: tools, system, text messages (user/assistant), images/documents, tool_use/tool_results (each with `cache_control`). Not directly: thinking blocks, sub-content (citations), empty blocks — but thinking *does* get cached **alongside** when it appears in prior assistant turns during tool use. When read from cache, thinking counts as `input_tokens`. On Opus 4.5+/Sonnet 4.6+, thinking preserved even with non-tool user messages; earlier Opus/Sonnet and all Haiku strip thinking and following messages (see tool-use example Request1 thinking+tool_use, Request2 tool_result cached, Request3 non-tool text → model-dependent stripping).

### 6. Usage Tracking & Isolation
API returns `cache_creation_input_tokens` (written now), `cache_read_input_tokens` (hit), `input_tokens` (post-breakpoint uncached). **Total = read + creation + input** (e.g., 100k + 0 + 50 = 100,050). `input_tokens` alone is *not* total — critical for rate limits. Workspace-level isolation (Claude API/AWS/Foundry) vs organization (Bedrock/GCP); exact prefix matching required; output generation unaffected.

### 7. Best Practices & Use Cases
Cache **stable reusable prefix at beginning** (tool defs, system, instructions, 20+ few-shot examples, large doc) and place breakpoint on **last stable block** (static prefix end). Start with automatic for conversations; explicit for multi-frequency sections. Stable key ordering (Swift/Go random JSON breaks hash). Recommended for: long instructions/large docs, 20+ examples, agentic tool loops, coding assistants, long multi-turn, books/papers. Troubleshooting via stable placement, lifetime check, minima, image/tool_choice consistency, and **cache diagnostics beta** (API compares consecutive requests and reports divergence).

## How It Works
```
Request preparation (tools, system, messages in order)
  ├─ Mark last stable prefix with cache_control (ephemeral, ttl 5m/1h)
  └─ Hash = cumulative prefix up to breakpoint
        │
        ├── On request: compute hash at breakpoint → walk back ≤20 → hit? reuse cached KV/prefix → process only suffix
        └── Miss? process full prefix → write cache at breakpoint after response begins (5m lifetime from request start, refresh free on hit)
              │
              ▼
        Usage: cache_read + cache_creation + input_tokens = total_input
        Cost: creation 1.25×/2×, read 0.1× base
```

**Explicit breakpoint example (static prefix + varying suffix):**
```
[Tools defs] [System instructions] [Examples x20] [Doc context] ◀ cache on last stable block (NOT on timestamp/user message)
[Timestamp + user message] ← varying suffix, not cached, processed fresh
```

**Automatic growing conversation (per Anthropic table):**
```
Req1: Sys+Usr1+Asst1+Usr2 ◀ cache → write all
Req2: Sys..Usr2 (hit) + Asst2+Usr3 ◀ cache → read System→Usr2, write Asst2+Usr3
Req3: Sys..Usr3 (hit) + Asst3+Usr4 ◀ cache → read System→Usr3, write Asst3+Usr4
```

## Practical Implications
- **Cost/latency lever:** Hitting cache avoids recomputing prefill for the entire prefix ($0.10×$ vs $1.25×$ write); for agentic loops with repeated system+tools+history, savings dominate. Reaching 512–4k minimum often pays for itself; 20+ examples become viable.
- **Reliability:** Stable prefix placement and key-order hygiene are correctness requirements; diagnostics beta pinpoints divergence without manual diff.
- **Long-horizon agents:** Prompt caching is the low-level primitive behind LangChain's *select/compress* and Anthropic's *compaction* — but complements (not replaces) summarization: caching preserves exact prefix; compaction discards. Choose caching for exact reuse, compaction for forgetting.
- **Model upgrades:** Moving between Opus 4.5↔Sonnet 4.6 changes thinking/effort invalidation and Mid-conversation system-message support — test per model version.

## Connections
- Low-level realization of [[inference]] prefix reuse and [[context-caching]] (Gemini `CachedContent` sibling; Claude's naive upfront `CLAUDE.md` + grep JIT is just a caching strategy). While Gemini manages TTL via `CachedContent.create(ttl)`, Claude manages via `cache_control` breakpoints — both implement *smallest high-signal prefix at beginning*.
- Operationalizes [[context-engineering]]'s hybrid and anatomy guidance (cache stable prefix at beginning, breakpoint on last stable block) and [[ai-agents]] agentic tool loops where each turn is a new API call.
- Underlies [[claude-code]] 95% auto-compact, sub-agent 1–2k summaries, and the **LangSmith virtuous loop** (trace `cache_read`/`creation` to identify optimization).
- Distinct from [[decoding-strategies]] (sampling) and [[reasoning-llms]] thinking — thinking blocks are handled specially but still counted as input when read.

## Open Questions
- What hit-rate thresholds justify 1-hour (2× write) vs 5-minute caching for intermittent agents?
- Can workspace vs organization isolation be leveraged for safe cache sharing across agents vs tenants without leakage?
- How does key-order nondeterminism in generated SDKs (Swift/Go) affect real-world hit rates at scale?

## Sources
- [[source-prompt-caching]]
- [[source-effective-context-engineering-for-ai-agents]]
- [[source-context-engineering-for-agents-langchain]]

## Synthesis

- [[context-engineering-thesis]] — why prefix layout is an inference-cost decision

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
