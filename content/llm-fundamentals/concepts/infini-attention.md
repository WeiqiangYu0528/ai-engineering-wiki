---
type: concept
title: "Infini-attention"
summary: Infini-attention (Google, arXiv 2404.07143) integrates a compressive memory into vanilla dot-product attention so a Transformer can process effectively infinite-length inputs with bounded memory and compute.
visibility: public
aliases:
  - Infinite Context Transformer
  - Compressive Memory Attention
  - wiki/infini-attention
tags:
  - llm-fundamentals
  - inference
  - rag
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-research-infini-attention]]"
related:
  - "[[transformer]]"
  - "[[self-attention]]"
  - "[[positional-encoding]]"
  - "[[inference]]"
  - "[[retrieval-augmented-generation]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Infini-attention (Google, arXiv 2404.07143) integrates a compressive memory into vanilla dot-product attention so a Transformer can process effectively infinite-length inputs with bounded memory and compute.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/self-attention">Self-Attention Mechanism</a></li><li><a href="/llm-fundamentals/concepts/positional-encoding">Positional Encoding</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/llm-fundamentals/sources/source-promptingguide-research-infini-attention">Efficient Infinite Context Transformers — Infini-attention</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**Infini-attention** (Google, arXiv 2404.07143) integrates a compressive memory into vanilla dot-product attention so a Transformer can process effectively infinite-length inputs with **bounded memory and compute**. A single block combines masked local attention for short-range dependencies with long-term linear attention over the compressive store, achieving 114× compression, 1B-model scaling to 1M tokens, and an 8B SoTA on 500K book summarization.

## Key Ideas
- **Hybrid single block:** Local causal attention handles recent window; compressive memory + linear attention handles long-range context — no separate memory module or multi-stage pipeline.
- **Bounded footprint, unbounded context:** Memory usage stays flat as sequence grows, breaking KV-cache linear scaling that limits standard [[transformer]] deployments.
- **Quantified long-context wins:** 114× memory compression ratio on long-context LM; 1B model → 1M length natively; 8B model beats prior SoTA on 500K summarization.
- **Enabling thesis:** Efficient long-context memory unlocks reasoning, planning, and continual adaptation over extended horizons.

## How It Works
```
Input sequence (streaming)
      │
      ├─► [Masked Local Attention] ──► short-range reps
      │
      └─► [Compressive Memory] ──┐
              ▲  write/read        │
              └─► [Linear Attention] ──► long-range reps
                      │
                      ▼
            [Fusion → Output]
```
The memory compresses past KV states into a fixed-size state updated recurrently; reads are via linear attention, keeping total compute/memory bounded.

## Practical Implications
- **Alternative to RAG stuffing:** Instead of concatenating retrieved chunks into a growing prompt (paying in KV-cache and [[in-context-recall]] fragility), long inputs are streamed through compressive memory.
- **Serving economics:** Bounded memory enables very-long-context deployment without proportional VRAM — complementary to [[inference]] optimizations (PagedAttention, GQA/MQA) and to [[chinchilla]] compute-optimal sizing.
- **Design choice:** Useful when context is truly sequential and massive (books, logs, video transcripts); RAG remains preferable when external knowledge is discrete and updatable via reindexing.

## Connections
- Extends [[self-attention]] mechanics within [[transformer]] architecture as an alternative to [[positional-encoding]]-based window extension (RoPE scaling).
- Compared to [[retrieval-augmented-generation]]: internal compressive memory vs external vector-store retrieval.
- Underpins [[in-context-recall]] at extreme lengths and enables [[reasoning-llms]] / [[thoughtsculpt]] search over long histories.
- Related to classical long-context work (Transformer-XL, Recurrent Memory Transformer) but unified in-block.

## Open Questions
- How does compressive fidelity degrade for needle-precise recall vs summarization-style long-range gist?
- What interaction between Infini-attention and RAG (retrieve-then-compress) yields best cost-accuracy at 100K–1M regimes?

## Sources
- [[source-promptingguide-research-infini-attention]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
