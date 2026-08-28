---
type: source-summary
title: "Context Caching with Gemini 1.5 Flash — Prompt Engineering Guide (DAIR.AI) Applications"
summary: Hands-on guide to Gemini 1.5 Pro/Flash context caching (caching.CachedContent.create() via generativeai library) for low-latency querying over large static corpora.
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/context-caching.en.mdx"
date-published: 2024-06-01
date-ingested: 2026-08-24
tags:
  - inference
  - rag
key-concepts:
  - "[[context-caching]]"
  - "[[applications-overview]]"
  - "[[retrieval-augmented-generation]]"
key-entities:
  - "[[google-research]]"
verified-by: agent
verified-on: 2026-08-27
---

# Context Caching with Gemini 1.5 Flash — Prompt Engineering Guide (DAIR.AI) Applications

## Summary
Hands-on guide to **Gemini 1.5 Pro/Flash context caching** (`caching.CachedContent.create()` via `generativeai` library) for low-latency querying over large static corpora. Demo: upload the year's `ML-Papers-of-the-Week` summaries as a text file, create a named cache with `model="gemini-1.5-flash"`, instruction `"You are an expert AI researcher…"`, and TTL (e.g., 15 min), instantiate `GenerativeModel` from cache, then run interactive natural-language queries ("latest AI papers of the week?", "papers that mention Mamba? List title+summary", "innovations around long-context LLMs?") without resending the full file — cutting tokens/cost per query. Includes YouTube `987Pd89EDPs` and notebook `gemini-context-caching.ipynb`.

## Key Takeaways
1. **API:** `caching.CachedContent.create(model, display_name, system_instruction, contents=[uploaded_file], ttl="15m")` → `GenerativeModel.from_cached_content(cache)` → repeated `generate_content()` calls reuse cached prefix.
2. **Workload:** Yearly ML-paper summaries (≈ repo README → `.txt`) as cached context; queries retrieve/summarize slices (Mamba, long-context) accurately.
3. **Benefit:** Eliminates resending multi-thousand-token context per query — measured as "promising" accurate retrieval with token/latency savings; especially valuable for interactive research sessions over fixed KB.
4. **Scope:** Available on Gemini 1.5 Pro/Flash via Gemini API; cache TTL governs invalidation; authors flag future agentic workflow potential.

## Detailed Notes
- **Structure:** Header with Cards/CodeIcon imports; Use Case (year's ML papers), Process (5 steps: Data Prep → Upload → Cache Create → Model Create → Query), notebook card, academy callout.
- **Steps verbatim:** 1 Convert README to plain text, 2 upload via `generativeai`, 3 `caching.CachedContent.create()` with model/name/instruction/TTL, 4 create model instance, 5 query with NL questions (3 examples listed).
- **Results:** "Accurately retrieved and summarized information"; "highly efficient, eliminating need to repeatedly send entire text file."
- **Applications listed:** Quick analysis of research data, finding-specific retrieval, interactive sessions without token waste.
- **Relation to prompt caching:** Analogous to Anthropic prompt caching but via Gemini managed cache object rather than prefix auto-cache.

## Notable Quotes
> "Context caching proved highly efficient, eliminating the need to repeatedly send the entire text file with each query."
> "We are excited to explore further applications of context caching, especially within more complex scenarios like agentic workflows."

## Concepts Introduced or Referenced
- [[context-caching]] — Managed prefix caching for repeated large-context queries (Gemini implementation).
- [[applications-overview]] — Applied inference optimization.
- [[retrieval-augmented-generation]] — Alternative to RAG indexing for moderately sized static corpora.
- [[inference]] — Prefill/KV-cache savings; cost/latency co-design.
- [[context-engineering]] — System instruction + cached corpus as persistent context layer.

## Critical Assessment
- **Strengths:** Concrete, reproducible API steps with realistic research corpus; clearly articulates token-saving mechanism and interactive UX benefit.
- **Weaknesses:** No cost/latency numbers (hit vs miss), no cache size/TTL limits, no invalidation/error handling, no comparison to RAG vector indexing tradeoffs; YouTube-linked claims not quantified.
- **Contradictions:** None; complements [[inference]] (KV cache, prompt caching in [[claude-code]]) — Gemini's explicit TTL vs Anthropic's implicit prefix caching.
- **Gaps:** Needs link to [[inference]] caching taxonomy and to [[retrieval-augmented-generation]] decision guide (when to cache vs retrieve).

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/context-caching.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/context-caching.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/context-caching.en.mdx)
- Cited: https://ai.google.dev/gemini-api/docs/caching?lang=python ; notebook https://github.com/dair-ai/Prompt-Engineering-Guide/blob/main/notebooks/gemini-context-caching.ipynb ; YouTube 987Pd89EDPs

---

**Source:** Context Caching with Gemini 1.5 Flash — Prompt Engineering Guide (DAIR.AI) Applications by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/context-caching.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
