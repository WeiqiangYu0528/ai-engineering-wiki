---
type: concept
title: "In-Context Recall"
summary: In-Context Recall is the ability of an LLM to surface a specific fact ("needle") embedded at varying depths within a long prompt ("haystack") and varying total lengths.
visibility: public
aliases:
  - "Needle-in-a-Haystack"
  - "NIAH Recall"
  - "Prompt-Dependent Recall"
tags:
  - llm-fundamentals
  - prompt-engineering
  - rag
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-research-llm-recall]]"
  - "[[source-promptingguide-research-rag]]"
  - "[[source-promptingguide-research-infini-attention]]"
related:
  - "[[retrieval-augmented-generation]]"
  - "[[context-engineering]]"
  - "[[prompt-engineering]]"
  - "[[inference]]"
---

# In-Context Recall

## Overview
**In-Context Recall** is the ability of an LLM to surface a specific fact ("needle") embedded at varying depths within a long prompt ("haystack") and varying total lengths. Machlab and Battle (2024) show recall is **prompt-dependent**: small prompt changes, insertion depth (begin/end vs middle), and training-data interplay materially affect whether a fact is used, even when the model nominally supports the context length.

## Key Ideas
- **Length × depth heatmap:** Performance is not uniform across haystack sizes or needle positions; middle-depth recall is systematically weaker (lost-in-the-middle effect echoed in Gao et al. and CoT surveys).
- **Prompt sensitivity:** Minor rephrasing of the same recall task can shift accuracy significantly — recall is a property of prompt-model interaction, not model alone.
- **Training-data interplay:** Content overlap between prompt and training distribution can amplify or degrade recall.
- **Scale and architectural levers:** Larger parameters, enhanced attention (e.g., Infini-attention), training-strategy changes, and task-specific fine-tuning improve recall; no single fix eliminates prompt dependence.

## How It Works
Standard NIAH protocol inserts a synthetic fact at depth d ∈ {0, 0.25, 0.5, 0.75, 1.0} of a haystack of length L (4K→200K+), then queries for the fact. Accuracy is plotted as L×d heatmap. Claude 3 Opus reportedly nears perfect recall at 200K (with select 1M), Gemini Pro hits 98% at 32K; smaller/weaker models degrade sharply at middle depths and long L.

## Practical Implications
- **RAG placement matters:** Retrieved chunks placed in the middle of a long concatenated context are recalled less reliably; rerankers should push key facts to edges (cf. Advanced RAG post-retrieval "relocation to edges").
- **Continuous evaluation is required:** Model selection for long-context use cases cannot rely on advertised window size alone; NIAH heatmaps per prompt are needed (Machlab's practical tip).
- **Complements retrieval evaluation:** A retriever may be perfect (hit@k=1) yet the generator fails to use the hit due to recall failure — end-to-end RAG evaluation must measure both.
- **Design alternative:** Infini-attention's compressive memory and RAPTOR's hierarchical retrieval are architectural alternatives to brute-force long-context stuffing.

## Connections
- Explains a generator-side bottleneck for [[retrieval-augmented-generation]]: context relevance ≠ answer faithfulness if recall fails.
- Directly exercises [[context-engineering]] principles (where to place instructions, context, and retrieved docs).
- Linked to [[inference]] cost/attention design (KV-cache pressure at long L; MQA/GQA; Infini-attention 114× compression and 1M scaling).
- Evaluated via [[rag-evaluation]] (RGB/RECALL) and mitigated by chunking/reranking strategies in [[source-promptingguide-research-rag]].

## Open Questions
- What prompt-formatting primitives (XML delimiters, repeated fact, edge duplication) most robustly counteract middle-depth degradation?
- At what L does compressive memory (Infini-attention) outperform naive long-context scaling on cost-recall Pareto frontier?

## Sources
- [[source-promptingguide-research-llm-recall]]
- [[source-promptingguide-research-rag]]
- [[source-promptingguide-research-infini-attention]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
