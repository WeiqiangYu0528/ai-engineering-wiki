---
type: concept
title: "Context Caching"
summary: Context Caching is the managed prefix/KV-cache reuse for large static contexts so repeated queries over the same corpus avoid resending and recomputing the full prompt.
visibility: public
aliases:
  - Prompt Caching
  - Cached Content
  - Gemini Context Caching
  - wiki/context-caching
tags:
  - inference
  - rag
  - agents
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-effective-context-engineering-for-ai-agents]]"
  - "[[source-promptingguide-applications-context-caching]]"
related:
  - "[[context-engineering]]"
  - "[[inference]]"
  - "[[claude-code]]"
  - "[[applications-overview]]"
  - "[[retrieval-augmented-generation]]"
  - "[[tool-use]]"
  - "[[ai-agents]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Context Caching is the managed prefix/KV-cache reuse for large static contexts so repeated queries over the same corpus avoid resending and recomputing the full prompt.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/agents/concepts/context-engineering">Context Engineering</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/agents/concepts/claude-code">Claude Code</a></li><li><a href="/prompt-engineering/concepts/applications-overview">LLM Applications Overview</a></li><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/agents/concepts/ai-agents">AI Agents</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/agents/sources/source-effective-context-engineering-for-ai-agents">Effective Context Engineering for AI Agents</a></li><li><a href="/inference/sources/source-promptingguide-applications-context-caching">Context Caching with Gemini 1.5 Flash — Prompt Engineering Guide (DAIR.AI) Applications</a></li></ul></nav>
</aside>

## Overview
**Context Caching** is the managed **prefix/KV-cache reuse** for large static contexts so repeated queries over the same corpus avoid resending and recomputing the full prompt. The DAIR guide demonstrates **Gemini 1.5 Pro/Flash** `caching.CachedContent.create(model="gemini-1.5-flash", display_name, system_instruction="You are an expert AI researcher…", contents=[uploaded_file], ttl="15m")` → `GenerativeModel.from_cached_content(cache)` → many `generate_content()` queries (e.g., yearly `ML-Papers-of-the-Week` summaries → "papers that mention Mamba? List title+summary") with token/latency savings vs full RAG indexing for moderately sized corpora. Conceptually sibling to Anthropic prompt caching (90% prefix hit) in [[claude-code]] but exposed as explicit TTL-managed cache.

## Key Ideas
- **API (Gemini):** Upload `.txt` via `generativeai`, `CachedContent.create` with model, name, instruction, TTL, then `from_cached_content` for query loop — file contents become resident prefix, not per-request payload.
- **Anthropic Hybrid (CLAUDE.md upfront + JIT):** Per [[source-effective-context-engineering-for-ai-agents]], [[anthropic]]'s [[claude-code]] does **naive upfront caching** of `CLAUDE.md` files (entire context) plus **just-in-time** `glob`/`grep`/`head`/`tail` retrieval — hybrid bypasses stale indexing and syntax-tree complexity while preserving speed for the stable prefix; this is the same primitive as Gemini `CachedContent` but applied as agent context management, governed by the *smallest high-signal set* principle.
- **Demo workload:** `ML-Papers-of-the-Week` README → `.txt` → cache → interactive queries ("latest AI papers of the week?", "innovations around long-context LLMs?") → accurate retrieval without manual search; flagged as efficient for research agents.
- **When to use vs RAG vs JIT:** Cache suits fixed corpora that fit model context (≤1M) and see many queries; RAG (vector chunk + retrieve) suits larger/dynamic corpora where full context would overflow or need ranking; JIT (load via tools at runtime) suits exploratory code/data tasks with progressive disclosure. Anthropic notes hybrid is pragmatic for less-dynamic contexts (legal/finance).
- **Cost model:** Tool definitions/cached prefix billed once (plus TTL refresh); per-query cost drops to suffix + generation — analog to [[inference]] prefill vs decoding split. Every cached token still consumes attention budget — [[context-engineering]]'s finite-resource argument.
- **Relation to agent architecture:** Upcoming use in agentic workflows as persistent memory layer; Anthropic's memory tool (Sonnet 4.5 beta) extends caching to file-based notes outside window for long-horizon coherence.

## How It Works
```
Prepare text file (e.g., ML-papers README → .txt)
   │
   ▼
Upload via generativeai → file_id
   │
   ▼
caching.CachedContent.create(
  model="gemini-1.5-flash", display_name="ml-papers-2024",
  system_instruction="You are an expert AI researcher…",
  contents=[file_id], ttl="15m")
   │  → server stores prefix KV
   ▼
model = GenerativeModel.from_cached_content(cache)
   │
   ▼
Loop: model.generate_content("Can you list the papers that mention Mamba? List title+summary.")  → uses cached prefix, returns filtered summaries
```

## Practical Implications
- **Interactive research acceleration:** Analysts can brainstorm over a paper set without token blowup per turn; ideal for notebook-style sessions.
- **TTL & invalidation:** Cache expires per TTL; updates require re-upload → stale-cache risk similar to RAG reindex staleness.
- **Limit duality with RAG:** Caching gives exact lexical grounding (full docs in context) but no relevance ranking; RAG gives ranking but may miss nuance. Hybrid: cache for core docs + RAG for overflow.
- **Engineering gap:** Guide reports "promising" but no hit/miss latency numbers; production needs cache-size limits and quota tracking.

## Connections
- Implements [[inference]] KV/prompt caching at application layer; aligns with [[claude-code]] prompt caching economics (90% hit saving).
- Alternative implementation of [[retrieval-augmented-generation]] grounding (full-context vs retrieve-top-k).
- Context layer in [[context-engineering]] (system + tool + memory) — cached file = persistent memory slot.

## Open Questions
- What cache size/TTL maximizes hit rate without staleness for mixed chat + document QA?
- How to benchmark hybrid cache+RAG vs pure RAG on recall/latency/cost?

## Sources
- [[source-promptingguide-applications-context-caching]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
