---
type: source-summary
title: "How Faithful are RAG Models? — Tug-of-War Between RAG and LLM Prior"
summary: Summary of Wu et al. (2024) "How Faithful are RAG Models?" studying the tension between retrieved context and LLM parametric prior on question answering (focused on GPT-4 family).
status: verified
visibility: public
author: "Wu et al. (2024) via DAIR.AI"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/rag-faithfulness.en.mdx"
date-published: 2024-04-01
date-ingested: 2026-08-24
tags:
  - rag
  - eval-safety
  - prompt-engineering
key-concepts:
  - "[[rag-faithfulness]]"
  - "[[retrieval-augmented-generation]]"
  - "[[hallucination]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-research-rag-faithfulness
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Summary of Wu et al. (2024) "How Faithful are RAG Models?" studying the tension between retrieved context and LLM parametric prior on question answering (focused on GPT-4 family).</p>
<p class="kb-provenance">Wu et al. (2024) via DAIR.AI, 2024-04-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/rag-faithfulness.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
Summary of Wu et al. (2024) "How Faithful are RAG Models?" studying the tension between retrieved context and LLM parametric prior on question answering (focused on GPT-4 family). Finds correct retrieval fixes 94% of model mistakes, but as documents contain more incorrect values and when the model's internal prior is weak, the model tends to recite incorrect context; stronger priors confer resistance. The larger the deviation of modified information from prior, the less likely the model adopts it.

## Key Takeaways
1. **Correct context is highly effective** — providing accurate retrieved documents corrects 94% of errors.
2. **Incorrect context vulnerability scales with amount of noise** — more incorrect values in documents increase recitation of falsehoods, especially when prior is weak.
3. **Prior strength matters** — stronger internal priors make the model more resistant to adopting contradicting retrieved information.
4. **Deviation effect** — "the more the modified information deviates from the model's prior, the less likely the model is to prefer it."
5. **Production implication** — RAG systems must assess risk by context type (supporting vs contradicting vs wholly incorrect), not just retrieval hit rate.

## Detailed Notes
- Study design: QA evaluation across GPT-4 and other LLMs with systematically varied retrieved document correctness and model prior strength.
- Figure illustrates faithfulness under supporting vs contradicting contexts.
- Practical emphasis: many production RAG deployments assume retrieved = trusted; paper shows trust calibration must account for prior-context interaction.

## Notable Quotes
> "The more the modified information deviates from the model's prior, the less likely the model is to prefer it." — Wu et al. (2024)

## Concepts Introduced or Referenced
- [[rag-faithfulness]] — faithfulness as measured adherence to retrieved context vs prior.
- [[retrieval-augmented-generation]] — grounding quality not just retrieval relevance.
- [[hallucination]] — failure mode when model follows noisy context; also when it ignores correct context due to strong prior.
- [[rag-evaluation]] — complementary to context-relevance/answer-faithfulness metrics (RAGAS etc.).

## Critical Assessment
Compact but important empirical nuance: adds prior-strength variable missing from naive RAG narratives that "retrieval fixes hallucination." Strength: quantifies 94% correction ceiling and deviation effect. Limitation: summary omits dataset scale and exact faithfulness metrics. Aligns with [[source-promptingguide-risks-factuality]] grounding theme and strengthens case for [[rag-evaluation]] robustness testing. No contradictions — adds conditionality to "RAG reduces hallucination" claim.

---

**Source:** How Faithful are RAG Models? — Tug-of-War Between RAG and LLM Prior by Wu et al. (2024) via DAIR.AI — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/rag-faithfulness.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
