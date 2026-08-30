---
type: concept
title: "Retrieval Augmented Generation (RAG)"
summary: Retrieval Augmented Generation (RAG) is the architecture that combines a neural information-retrieval component over an external corpus with a text generator (seq2seq) model to answer knowledge-intensive tasks with…
visibility: public
aliases:
  - RAG
  - Retrieval-Augmented Generation
  - wiki/retrieval-augmented-generation
tags:
  - rag
  - llm-fundamentals
  - prompt-engineering
created: 2026-08-24
updated: 2026-08-25
status: draft
sources:
  - "[[source-retrieval-augmented-generation-rag]]"
  - "[[source-promptingguide-techniques-rag]]"
  - "[[source-promptingguide-techniques-knowledge]]"
  - "[[source-promptingguide-techniques-prompt-chaining]]"
  - "[[source-promptingguide-research-rag]]"
  - "[[source-promptingguide-research-rag-faithfulness]]"
  - "[[source-promptingguide-research-rag-hallucinations]]"
related:
  - "[[retrieval-augmented-generation|RAG]]"
  - "[[embeddings]]"
  - "[[generated-knowledge-prompting]]"
  - "[[prompt-chaining]]"
  - "[[hallucination]]"
  - "[[tool-use]]"
  - "[[function-calling]]"
  - "[[in-context-learning]]"
  - "[[pretraining]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Retrieval Augmented Generation (RAG) is the architecture that combines a neural information-retrieval component over an external corpus with a text generator (seq2seq) model to answer knowledge-intensive tasks with…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li><li><a href="/llm-fundamentals/concepts/embeddings">Embeddings</a></li><li><a href="/prompt-engineering/concepts/generated-knowledge-prompting">Generated Knowledge Prompting</a></li><li><a href="/prompt-engineering/concepts/prompt-chaining">Prompt Chaining</a></li><li><a href="/eval-safety/concepts/hallucination">Hallucination</a></li><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/agents/concepts/function-calling">Function Calling</a></li><li><a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/rag/sources/source-retrieval-augmented-generation-rag">Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks</a></li><li><a href="/rag/sources/source-promptingguide-techniques-rag">Prompt Engineering Guide — Retrieval Augmented Generation (RAG)</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-knowledge">Prompt Engineering Guide — Generated Knowledge Prompting</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-prompt-chaining">Prompt Engineering Guide — Prompt Chaining</a></li><li><a href="/rag/sources/source-promptingguide-research-rag">Retrieval Augmented Generation (RAG) for LLMs — Survey Summary</a></li><li><a href="/rag/sources/source-promptingguide-research-rag-faithfulness">How Faithful are RAG Models? — Tug-of-War Between RAG and LLM Prior</a></li><li><a href="/rag/sources/source-promptingguide-research-rag-hallucinations">Reducing Hallucination in Structured Outputs via RAG</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview

**Retrieval Augmented Generation (RAG)** is the architecture that combines a **neural information-retrieval component** over an external corpus with a **text generator (seq2seq) model** to answer knowledge-intensive tasks with grounded, factual, and adaptive responses, mitigating [[hallucination]] from static parametric memory. Introduced as a general-purpose fine-tuning recipe by Lewis et al. (FAIR, 2020, [[source-retrieval-augmented-generation-rag]]), RAG's canonical form pairs **parametric memory** (pre-trained [[embeddings]] + seq2seq, e.g., BART-large 400M) with **non-parametric memory** (dense vector index of Wikipedia — 21M 100-word chunks, FAISS HNSW — accessed via a pre-trained neural retriever DPR bi-encoder). The probabilistic model marginalizes latent documents as either **RAG-Sequence** (one doc per whole output) or **RAG-Token** (different doc per token), jointly fine-tuned end-to-end. The flow remains **query → retrieve relevant docs → fuse as context → generate**, enabling knowledge updates via reindexing without retraining the LM (diagram Fig.1 in [[source-retrieval-augmented-generation-rag]]; prompt-centric illustration `rag.png` from the guide).

## Key Ideas

- **Two memories, one model (Lewis Fig.1).** **Parametric** (LM weights after [[pretraining]] + [[supervised-fine-tuning]]) holds fuzzy general knowledge; **non-parametric** (dense index + retriever) holds explicit, updatable facts. RAG is defined as $p(y|x)=\sum_z p_\eta(z|x)p_\theta(y|x,z)$ (Sequence: same $z$ for all tokens; Token: $\prod_i\sum_z p_\eta(z|x)p_\theta(y_i|x,z,y_{<i})$). Retriever is $p_\eta(z|x)\propto\exp(d(z)^T q(x))$, $d=\text{BERT}_d$, $q=\text{BERT}_q$ — see [[embeddings]] for bi-encoder basis — with Maximum Inner Product Search (MIPS). This formalizes the guide's concatenation intuition as marginalization.

- **Lewis 2020 recipe.** Pre-trained DPR retriever (trained on NQ+TriviaQA) + BART generator concatenated as $x$+$z$ input, trained jointly to minimize $-\sum\log p(y|x)$ with document encoder frozen (avoiding index rebuild as in REALM) and only query encoder + generator updated (Adam). Decoding: RAG-Token via standard beam over $p'_\theta(y_i|...)=\sum_z p_\eta(z|x)p_\theta(y_i|...)$; RAG-Sequence via per-doc beams plus Thorough (extra forwards) vs Fast (approx 0 if not in beam) marginal.

- **Empirical footprint from primary paper (beyond guide).** Open QA EM: RAG-Sequence **44.5** on NQ (vs T5-11B+SSM 36.6, REALM 40.4, DPR 41.5), **68.0** on WQ, SOTA on 3/4 sets; can answer correctly even when no doc contains verbatim answer (11.8% NQ). MS-MARCO NLG (open, no gold): BART 38.2 Rouge-L → RAG-Seq **40.8** (+2.6 BLEU/Rouge-L), 2.6 above BART despite SOTA using gold passages. Jeopardy question generation: Q-BLEU-1 BART 19.7 → RAG-Tok **22.2**, human factuality **42.7%** RAG better vs 7.1% BART, specificity 37.4% vs 16.8%; diversity (distinct/total trigrams) Gold 89.6/90.0, BART 70.7/32.4, **RAG-Seq 83.5/53.8**. FEVER claim verification (no retrieval supervision): 3-way **72.5** vs pipeline SOTA 76.8* (with gold), 2-way **89.5** vs 92.2*; top-1 retrieved is gold article 71%, top-10 90%. These numbers replace the guide's survey-level claims with primary evidence.

- **Learned vs static retrieval and hot-swap.** Ablations (Table 6): learned dense (RAG-Seq NQ 44.0) >> frozen (41.2) >> BM25 (31.8); FEVER exception where BM25 wins (entity-centric). Index hot-swap on 82 leaders changed 2016→2018: matched index **70%/68%** correct vs mismatched **12%/4%** — non-parametric update without retraining, the canonical adaptivity proof the guide only sketched. More docs helps Seq monotonically (NQ) but Token peaks at 10 (Fig.3).

- **Comparison point.** [[generated-knowledge-prompting]] generates knowledge from parametric memory instead of retrieving it — complementary but more hallucination-prone; RAG grounds in external truth. Guide's notebook `pe-rag.ipynb` (https://github.com/dair-ai/Prompt-Engineering-Guide/blob/main/notebooks/pe-rag.ipynb) remains the minimal open-source runnable stack for title generation (chunk → embed → retrieve → generate), now understood as a local case of the Lewis recipe with concatenation fusion.

## How It Works

```
User prompt: "What prompting techniques handle reasoning?"
        │
        ▼
[Neural Retriever DPR: q(x)=BERT_q(x)] ─► FAISS HNSW over 21M Wikipedia chunks (d(z)=BERT_d(z))
        │   p_η(z|x) ∝ exp(d(z)^T q(x)), top-K MIPS
        ▼
Top-k docs: ["Chain-of-thought (CoT) prompting...", "Self-consistency …"]
        │
        ▼
[Marginalization]  RAG-Seq: Σ_z p_η(z|x) p_θ(y|x,z)  │  RAG-Tok: ∏_i Σ_z p_η(z|x) p_θ(y_i|x,z,…)
        │   or guide's concatenation-as-context approximation: prompt = instruction + docs + query
        ▼
[Generator BART-large] ─► grounded answer (more factual/specific/diverse, provenance via docs)
```

1. Offline: corpus chunked (100-word), embedded via document encoder, indexed as vectors (FAISS).
2. Online: query embedded via query encoder; MIPS retrieves $k\in\{5,10\}$ relevant chunks (modern stacks add hybrid sparse + reranker beyond guide/Lewis).
3. Fusion + marginalization: chunks concatenated with query for BART; Lewis marginalizes over $k$ hypotheses (per-sequence or per-token) rather than pure concatenation — production systems often approximate via concatenation (guide's path).
4. Generation conditioned on retrieved facts; diversity and factuality improve vs parametric-only.

## Practical Implications

- **Anti-hallucination substrate.** Primary production guardrail for factual QA, support, and any domain where knowledge cutoff matters — inserts truth into working memory so model need not confabulate. FEVER/J eopardy human evals are the evidence base for these claims.
- **Freshness without retrain.** Update corpus and reindex → answers reflect latest facts without expensive LLM retraining; hot-swap experiment quantifies this (70% vs 12%). Critical for news, docs, compliance.
- **Engineering dimensions omitted by guide, foreshadowed by Lewis.** Chunking (100-word), embedding choice (BERT bi-encoder vs modern), top-$k$, reranking, hybrid search, citation formatting, and joint vs separate retriever-generator fine-tuning all dominate real-world RAG quality and are active gaps flagged in §4.5. Dense vs BM25 ablation explains why modern hybrid helps.
- **Failure modes.** Irrelevant retrieval still leads to hallucination; long concatenated context raises token cost and attention dilution ([[in-context-recall]] bottleneck) — rerankers, compression, and Token-level marginalization help. RAG-Seq benefits monotonically from more docs (compute vs. quality tradeoff).
- **UX notebook.** `pe-rag.ipynb` provides minimal runnable open-source RAG stack for title generation — good starter template, now contextualized as simplified RAG-Sequence.

## Connections

- Primary defense against [[hallucination]] (grounding via context window, cf. [[pretraining]] fuzzy weights vs context RAM metaphor in [[hallucination]] page); faithfulness dynamics detailed in [[rag-faithfulness]] (note FEVER 71% gold recall vs faithfulness tension).
- Implements [[prompt-elements]] Context slot with external documents; realized as a [[prompt-chaining]] pattern (retrieve → synthesize) often with [[tool-use]] / [[function-calling]] retrievers via [[model-context-protocol]].
- Contrasted with [[generated-knowledge-prompting]] (parametric knowledge generation) and [[prompt-chaining]]'s LLM-extraction variant; can be interleaved per step of [[chain-of-thought]] or [[tree-of-thoughts]] for grounded reasoning (cf. RAG-Token per-token).
- Relies on [[in-context-learning]] mechanics (context conditioning without weight updates) and [[decoding-strategies]] / [[inference]] cost model (retrieved docs length → KV-cache pressure) and [[llm-settings]] context allocation.
- Depends on [[embeddings]] quality (bi-encoder dense space); retrieval training (DPR → Lewis query encoder finetuning) is a form of [[supervised-fine-tuning]] on the retriever.
- Paradigm taxonomy (Naive → Advanced → Modular) and 60-paper map in [[source-promptingguide-research-rag]] builds directly on the naive pattern Lewis establishes; generator-side [[in-context-recall]] bottleneck explains why relevance ≠ use; [[synthetic-data]] can supplement parametric memory while RAG supplements non-parametric.
- Structured-output hallucination mitigation via small-model RAG in [[source-promptingguide-research-rag-hallucinations]] instantiates same principle with BART-scale models.

## Open Questions

- What chunking and embedding strategy best balances recall vs precision for diverse domains? Lewis's 100-word static split is now known to be suboptimal.
- How to jointly optimize retriever and generator (RETRO, Atlas) vs keep them decoupled for modularity? Lewis freezes doc encoder — later work pre-trains jointly.
- When does retrieval add noise vs value, and can adaptive retrieval (retrieve only when needed, as suggested by Token-level posterior flattening after first entity token) improve efficiency?

## Sources

- [[source-retrieval-augmented-generation-rag]] — **Primary** Lewis et al. 2020 probabilistic RAG (RAG-Sequence/RAG-Token, DPR+BART, experiments §3–4, hot-swap).
- [[source-promptingguide-techniques-rag]]
- [[source-promptingguide-techniques-knowledge]]
- [[source-promptingguide-techniques-prompt-chaining]]
- [[source-promptingguide-research-rag]]
- [[source-promptingguide-research-rag-faithfulness]]
- [[source-promptingguide-research-rag-hallucinations]]
- Lewis et al. 2020 RAG https://arxiv.org/pdf/2005.11401.pdf; Meta AI Blog Sep 2020; RAG Survey https://arxiv.org/abs/2312.10997; NQ https://ai.google.com/research/NaturalQuestions / WQ https://paperswithcode.com/dataset/webquestions / FEVER

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
