---
type: source-summary
title: "Generating Synthetic Dataset for RAG — Prompt Engineering Guide (DAIR.AI) Applications"
summary: Practical guide to LLM-distilled synthetic query generation for training domain-specific retrievers when labeled pairs are scarce.
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/synthetic_rag.en.mdx"
date-published: 2023-09-15
date-ingested: 2026-08-24
tags:
  - rag
  - prompt-engineering
key-concepts:
  - "[[synthetic-data|Synthetic Data Generation]]"
  - "[[retrieval-augmented-generation]]"
  - "[[applications-overview]]"
  - "[[context-caching]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-applications-synthetic-rag
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Practical guide to LLM-distilled synthetic query generation for training domain-specific retrievers when labeled pairs are scarce.</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2023-09-15. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/synthetic_rag.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
Practical guide to **LLM-distilled synthetic query generation for training domain-specific retrievers** when labeled pairs are scarce. Motivates the paradigm shift (test idea with LLM API before lengthy annotation), explains why generic retrievers fail on niche/low-resource domains (Czech laws, Indian tax assistant), and details the **PROMPTGATOR / Dai et al. (2022)** method: 8 few-shot examples + large unlabeled corpus → synthetic `(query, document)` pairs that train a local encoder retriever to near-SOTA, formalized as $(e_{prompt}, e_{doc}(d_1), e_{query}(q_1), …, e_{doc}(d))$, with cost math (≈$55 for 50k docs via GPT-3.5 Turbo) and emphasis on search-intent-specific relevance (e.g., ArguAna counter-argument).

## Key Takeaways
1. **Distillation via prompt:** Generate synthetic queries from each unlabeled document using 2–8 few-shot `(doc, query)` exemplars + task instruction; only the final `(doc, new query)` pair is used for retriever fine-tuning — distilling LLM generalization into a cheap encoder.
2. **Intent matters:** Same `(query, doc)` relevance changes with task (support vs counter-argument); prompts must encode search intent explicitly (ArguAna example).
3. **Quality levers:** Prepare ~20 careful exemplars, sample 2–8 per prompt for diversity; specify length/tone; precise instructions beat cheap templating — poor few-shots degrade retriever quality.
4. **Economics:** Prompt ≈700 tokens + 25 generated tokens; 50k docs × GPT-3.5 Turbo ($0.0015 input / $0.002 output per 1k) ≈ $55 — vs ~10k manual labels / >1 month / >$1000 and 50k docs to match synthetic quality per Dai et al.; 2–4 queries per doc possible.
5. **When it shines:** Low-resource languages and specialized domains where off-the-shelf retrievers underperform.

## Detailed Notes
- **Motivation & paradigm shift:** Image from `The Rise of the AI Engineer` (S. Wang) — from "collect for months → build" to "prompt LLM immediately → validate → then train." RAG refresher with link to techniques/rag.
- **Use cases:** Czech laws in Czech; Indian tax assistant (GPT-4 demo) — both retrieval-degraded without domain tuning.
- **Method (Dai et al. 2022 https://arxiv.org/abs/2209.11755):** 8 labeled examples + unlabeled corpus → synthetic data → fine-tune retriever; near-SOTA with minimal supervision.
- **Prompt template (counter-argument task):**
  ```
  Task: Identify a counter-argument for the given argument.
  Argument #1: {X1}  →  A concise counter-argument query related to #1: {Y1}
  Argument #2: {X2}  →  query: {Y2}
  ...
  Argument N: {long proportional-fine passage}  →  query:
  ```
  Output: `punishment house would make fines relative income`
- **Formal abstract:** $(e_{prompt}, e_{doc}(d_1), e_{query}(q_1), …, e_{doc}(d_k), e_{query}(q_k), e_{doc}(d))$ — last doc is the generation target.
- **Pipeline images:** `synthetic_rag_2.png` (PROMPTGATOR overview), `synthetic_rag_3.png` (synthetic vs manually labeled — 50k synthetic ≈ 50k manual), `synthetic_rag_4.png` (BEIR prompt templates).
- **Diversity note:** Randomly sample exemplars (better from 20) to increase variance without annotation cost.
- **Language claim:** ChatGPT/GPT-4 handle non-English low-resource prompts in native language.

## Notable Quotes
> "This process can be viewed as distilling LLMs into standard-sized encoders via prompt-based query generation. While the distillation is computationally intensive, it substantially reduces inference costs and might greatly enhance performance, particularly in low-resource languages or specialized domains."
> "With only 8 manually labeled examples and a large corpus of unlabeled data … one can achieve a near State-of-the-Art performance."
> "The more precise the examples and instructions, the better the synthetic data will be for training Retriever. Low-quality few-shot examples can negatively impact the resulting quality."

## Concepts Introduced or Referenced
- [[synthetic-data|Synthetic Data Generation]] — Prompt-based query synthesis for retriever training (PROMPTGATOR pattern).
- [[retrieval-augmented-generation]] — Host architecture whose retriever is the fine-tuning target; performance bottleneck addressed.
- [[applications-overview]] — Applied RAG engineering use case.
- [[in-context-learning]] — Few-shot conditioning governs synthetic query style and intent.
- [[retrieval-augmented-generation|RAG]] — Tag alignment; links to canonical [[retrieval-augmented-generation]].

## Critical Assessment
- **Strengths:** Clear cost model and decision rule (when domain is niche/low-resource, synthetic wins); intent-sensitivity insight with concrete ArguAna grounding; formal prompt abstraction plus reusable templates; quantifies manual-label equivalence (50k).
- **Weaknesses:** No filtering/quality-evaluation step for synthetic queries (hallucinated queries could mis-train); images not text-extracted; cost math uses dated GPT-3.5 pricing; no guidance on hard negatives or retriever architecture choice.
- **Contradictions:** None with [[retrieval-augmented-generation]]; complements [[source-promptingguide-applications-generating-textbooks]] (diversity seeding) by adding intent-specific conditioning.
- **Gaps:** Needs link to negative mining, reranking, and hybrid search interplay.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/synthetic_rag.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/synthetic_rag.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/synthetic_rag.en.mdx)
- Cited: Dai et al. 2022 PROMPTGATOR https://arxiv.org/abs/2209.11755; ArguAna https://aclanthology.org/P18-1023/; S. Wang AI Engineer; BEIR

---

**Source:** Generating Synthetic Dataset for RAG — Prompt Engineering Guide (DAIR.AI) Applications by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/synthetic_rag.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
