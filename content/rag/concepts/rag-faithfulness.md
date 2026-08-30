---
type: concept
title: "RAG Faithfulness"
summary: RAG Faithfulness measures whether a model's answer adheres to its retrieved context rather than its parametric prior — and quantifies the tug-of-war between the two.
visibility: public
aliases:
  - Retrieval Faithfulness
  - RAG vs Prior Tug-of-War
  - wiki/rag-faithfulness
tags:
  - rag
  - eval-safety
  - prompt-engineering
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-research-rag-faithfulness]]"
  - "[[source-promptingguide-research-rag]]"
  - "[[source-promptingguide-research-rag-hallucinations]]"
related:
  - "[[retrieval-augmented-generation]]"
  - "[[hallucination]]"
  - "[[rag-evaluation]]"
  - "[[in-context-recall]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">RAG Faithfulness measures whether a model's answer adheres to its retrieved context rather than its parametric prior — and quantifies the tug-of-war between the two.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li><li><a href="/eval-safety/concepts/hallucination">Hallucination</a></li><li><a href="/rag/concepts/rag-evaluation">RAG Evaluation</a></li><li><a href="/llm-fundamentals/concepts/in-context-recall">In-Context Recall</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/rag/sources/source-promptingguide-research-rag-faithfulness">How Faithful are RAG Models? — Tug-of-War Between RAG and LLM Prior</a></li><li><a href="/rag/sources/source-promptingguide-research-rag">Retrieval Augmented Generation (RAG) for LLMs — Survey Summary</a></li><li><a href="/rag/sources/source-promptingguide-research-rag-hallucinations">Reducing Hallucination in Structured Outputs via RAG</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**RAG Faithfulness** measures whether a model's answer adheres to its retrieved context rather than its parametric prior — and quantifies the tug-of-war between the two. Wu et al. (2024) show correct context fixes 94% of errors, but faithfulness collapses when context contains many incorrect values and the model's internal prior is weak; stronger priors resist contradicting context, with adoption likelihood inversely proportional to deviation from prior.

## Key Ideas
- **94% correction ceiling:** When retrieved documents are correct, GPT-4 family models correct 94% of prior mistakes — establishing an upper bound for RAG grounding value.
- **Noise sensitivity:** As the proportion of incorrect values in retrieved documents grows, the model increasingly recites those incorrect values — especially when prior confidence is low.
- **Prior-strength moderator:** Models with strong internal priors are more resistant to false context; the larger the deviation of the planted information from prior, the less likely the model prefers it.
- **Context taxonomy matters:** Supporting vs contradicting vs wholly incorrect retrieved content produce different risk profiles; evaluating only retrieval hit-rate misses the prior interaction.

## How It Works
```
Correct prior + wrong context ──► Strong-prior model → resists (low adoption)
Weak prior + wrong context   ──► High adoption → faithfulness failure
Correct context + any prior ──► 94% correction → faithful generation
Deviation from prior ↑       ──► Adoption likelihood ↓
```
Evaluation varies prior strength (e.g., factual confidence) and document correctness systematically across QA items to map adoption curves.

## Practical Implications
- **Production RAG must test contradicting/noisy contexts,** not just supporting ones; otherwise faithfulness is overestimated.
- **Prior-aware routing:** For facts where the model is confidently wrong, retrieval is especially valuable; for weak-prior facts, retrieval quality must be higher to avoid injecting errors.
- **Connects to evaluation:** Faithfulness is one of the three RAG quality scores in Gao et al. (context relevance, answer faithfulness, answer relevance) and maps to RAGAS/ARES/TruLens metrics.
- **Structured outputs amplify risk:** ServiceNow's RAG-for-JSON case shows that even small faithfulness drops corrupt executable workflows — schema-valid but factually wrong.

## Connections
- Core metric of [[retrieval-augmented-generation]] quality, alongside context relevance and answer relevance; operationalized in [[rag-evaluation]].
- Explains a failure mode of [[hallucination]] *via* context (reciting false retrieved info) vs classic parametric hallucination.
- Complements [[in-context-recall]] — faithful use of context presupposes the model can recall it (lost-in-the-middle effects degrade both).
- Mitigated by design choices in [[context-engineering]] (reranking, compression) and [[retrieval-augmented-generation|RAG]] hybrid/iterative retrieval (CRAG self-correction, Self-RAG reflection tokens).

## Open Questions
- Can faithfulness be predicted from prior-confidence calibration without running full QA probes?
- What fine-tuning (e.g., RA-DIT) or post-retrieval (RECOMP compression, Chain-of-Note) most efficiently shifts the adoption curve toward correct context?

## Sources
- [[source-promptingguide-research-rag-faithfulness]]
- [[source-promptingguide-research-rag]]
- [[source-promptingguide-research-rag-hallucinations]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
