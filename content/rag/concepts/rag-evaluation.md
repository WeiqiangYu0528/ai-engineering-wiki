---
type: concept
title: "RAG Evaluation"
summary: RAG Evaluation measures both retriever quality (context relevance) and generator quality (faithfulness, relevance) across three primary quality scores and four robustness abilities.
visibility: public
aliases:
  - RAG Metrics
  - RAG Benchmarking
  - wiki/rag-evaluation
tags:
  - rag
  - eval-safety
  - prompt-engineering
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-research-rag]]"
  - "[[source-promptingguide-research-rag-faithfulness]]"
  - "[[source-promptingguide-research-llm-recall]]"
related:
  - "[[retrieval-augmented-generation]]"
  - "[[rag-faithfulness]]"
  - "[[in-context-recall]]"
  - "[[hallucination]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">RAG Evaluation measures both retriever quality (context relevance) and generator quality (faithfulness, relevance) across three primary quality scores and four robustness abilities.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li><li><a href="/rag/concepts/rag-faithfulness">RAG Faithfulness</a></li><li><a href="/llm-fundamentals/concepts/in-context-recall">In-Context Recall</a></li><li><a href="/eval-safety/concepts/hallucination">Hallucination</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/rag/sources/source-promptingguide-research-rag">Retrieval Augmented Generation (RAG) for LLMs — Survey Summary</a></li><li><a href="/rag/sources/source-promptingguide-research-rag-faithfulness">How Faithful are RAG Models? — Tug-of-War Between RAG and LLM Prior</a></li><li><a href="/llm-fundamentals/sources/source-promptingguide-research-llm-recall">LLM In-Context Recall is Prompt Dependent — Needle-in-a-Haystack Analysis</a></li></ul></nav>
</aside>

## Overview
**RAG Evaluation** measures both retriever quality (context relevance) and generator quality (faithfulness, relevance) across three primary quality scores and four robustness abilities. The Gao et al. (2023) survey framing (RaLLe, RGB, RECALL, RAGAS, ARES, TruLens) plus Wu et al. faithfulness and Machlab NIAH recall together define the modern RAG evaluation stack: retrieval metrics (NDCG, Hit Rate) complement generation-side faithfulness and answer-relevance judged by humans or LLM-as-a-Judge.

## Key Ideas
- **Three quality scores:** Context relevance (precision/specificity of retrieved chunks), answer faithfulness (adherence to retrieved context), answer relevance (answer vs question). Automated via RAGAS/ARES/TruLens often using LLM judges.
- **Four abilities:** Noise robustness (ignore irrelevant chunks), negative rejection (abstain when no support), information integration (fuse across chunks), counterfactual robustness (resist contradicting/false context).
- **Two-level metrics:** Retrieval level (NDCG, Hit Rate, as in recommender/IR) vs generation level (accuracy/F1 on labeled QA, relevance/harmfulness on open-ended).
- **Benchmark harness:** RGB and RECALL stress the four abilities; RaLLe provides an open framework for knowledge-intensive task evaluation; RAGAS AAAI suite supports reference-free scoring.
- **Interaction effects:** Wu faithfulness curves (94% correction but deviation-dependent adoption) and NIAH recall heatmaps (prompt/depth sensitivity) are essential complements — a perfect retriever can still fail if the generator ignores context or recalls from the wrong depth.

## How It Works
Standard flow: run retrieval → compute context relevance (ranked retrieval vs gold) → generate with retrieved context → score faithfulness against context + answer relevance against gold/question → probe robustness via perturbed contexts (noisy, counterfactual, empty) to score the four abilities. Tools like RAGAS automate faithfulness/relevance via LLM critics without human labels.

## Practical Implications
- **End-to-end coverage:** Evaluating only downstream task EM/F1 hides whether failure was retrieval vs generation; splitting scores directs interventions (rerank vs prompt fix vs fine-tune).
- **Production gate:** Run RGB/RECALL-style counterfactual suites and Wu-style contradicting-context probes before shipping; NIAH heatmaps for chosen prompt template at target length/depth.
- **Beyond RAG:** Same faithfulness/relevance lens applies to [[synthetic-data]] filtering and [[trustworthiness-in-llms]] truthfulness dimension.

## Connections
- Evaluates [[retrieval-augmented-generation]] quality; specializes into [[rag-faithfulness]] (faithfulness score) and [[in-context-recall]] (generator recall bottleneck).
- Grounds [[hallucination]] measurement (TruthfulQA/HaluEval vs faithfulness) and [[trustworthiness-in-llms]] robustness.
- Ingests [[inference]] cost (longer retrieved context → higher faithfulness but higher KV-cache cost and lost-in-the-middle risk).
- Uses [[prompt-engineering]] controls (post-retrieval reranking, edge relocation, compression) as interventions under evaluation.

## Open Questions
- Can a single RAGAS-style faithfulness metric remain stable across prompt variants given NIAH prompt sensitivity?
- How to jointly optimize the three scores plus cost (tokens) on a Pareto frontier for production thresholds?

## Sources
- [[source-promptingguide-research-rag]]
- [[source-promptingguide-research-rag-faithfulness]]
- [[source-promptingguide-research-llm-recall]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
