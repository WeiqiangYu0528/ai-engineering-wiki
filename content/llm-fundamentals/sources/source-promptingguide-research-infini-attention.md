---
type: source-summary
title: "Efficient Infinite Context Transformers — Infini-attention"
summary: Summary of Google paper (arXiv 2404.07143) introducing Infini-attention — a modified attention layer that integrates compressive memory into vanilla dot-product attention to process infinitely long inputs with bounded…
status: verified
visibility: public
author: "Google (Munkhdalai et al., 2024) via DAIR.AI"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/infini-attention.en.mdx"
date-published: 2024-04-01
date-ingested: 2026-08-24
tags:
  - llm-fundamentals
  - inference
  - rag
key-concepts:
  - "[[infini-attention]]"
  - "[[self-attention]]"
  - "[[inference]]"
key-entities:
  - "[[google-research]]"
  - "[[deepmind]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-research-infini-attention
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Summary of Google paper (arXiv 2404.07143) introducing Infini-attention — a modified attention layer that integrates compressive memory into vanilla dot-product attention to process infinitely long inputs with bounded…</p>
<p class="kb-provenance">Google (Munkhdalai et al., 2024) via DAIR.AI, 2024-04-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/infini-attention.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
Summary of Google paper (arXiv 2404.07143) introducing Infini-attention — a modified attention layer that integrates compressive memory into vanilla dot-product attention to process infinitely long inputs with bounded memory and compute. Combines masked local attention (short-range) with long-term linear attention over compressed memory (long-range) in a single Transformer block. Claims 114× memory compression, 1B model scaling to 1M context length, and 8B achieving SoTA on 500K book summarization.

## Key Takeaways
1. **Single-block hybrid** — Merges masked local attention + long-term linear attention with compressive memory into one Transformer block, handling short and long dependencies jointly.
2. **Bounded footprint, unbounded context** — Enables effectively infinite context without linear KV-cache growth.
3. **Quantified gains** — 114× compression ratio on long-context language modeling; 1B → 1M sequence length; 8B SoTA on 500K book summarization.
4. **Capability unlock** — Efficient long-context memory is framed as prerequisite for advanced reasoning, planning, and continual adaptation.

## Detailed Notes
- Architecture figure shows local attention window plus compressive memory read/write path feeding linear attention.
- Outperforms baselines on long-context LM while maintaining computation boundedness.

## Concepts Introduced or Referenced
- [[infini-attention]] — compressive-memory-augmented attention mechanism.
- [[self-attention]] / [[transformer]] — base mechanism extended.
- [[positional-encoding]] — implicit long-range alternative (RoPE etc. compared).
- [[inference]] — KV-cache pressure and context-window scaling.
- [[retrieval-augmented-generation]] — alternative long-context strategy (external retrieval vs internal memory).
- [[context-engineering]] / [[in-context-recall]] — long-context recall robustness link.

## Critical Assessment
High-signal architecture summary; strongest claims are quantified (114×, 1M, 500K SoTA). Limitation: summary omits memory-update mechanics and comparison to prior long-context methods (e.g., Transformer-XL, RMT, RoPE scaling). Complements [[inference]] long-context cost discussion and offers alternative to RAG-based context extension. No contradictions; strengthens long-context reasoning narrative alongside [[reasoning-llms]] and [[thoughtsculpt]].

---

**Source:** Efficient Infinite Context Transformers — Infini-attention by Google (Munkhdalai et al., 2024) via DAIR.AI — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/infini-attention.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
