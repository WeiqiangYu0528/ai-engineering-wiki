---
type: source-summary
title: "LLM In-Context Recall is Prompt Dependent — Needle-in-a-Haystack Analysis"
summary: Summary of Machlab and Battle (2024) analyzing in-context recall across LLMs via needle-in-a-haystack (NIAH) tests.
status: verified
visibility: public
author: "Machlab and Battle (2024) via DAIR.AI"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/llm-recall.en.mdx"
date-published: 2024-04-01
date-ingested: 2026-08-24
tags:
  - llm-fundamentals
  - prompt-engineering
  - eval-safety
key-concepts:
  - "[[in-context-recall]]"
  - "[[prompt-engineering]]"
  - "[[inference]]"
key-entities:
  - "[[anthropic]]"
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-research-llm-recall
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Summary of Machlab and Battle (2024) analyzing in-context recall across LLMs via needle-in-a-haystack (NIAH) tests.</p>
<p class="kb-provenance">Machlab and Battle (2024) via DAIR.AI, 2024-04-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/llm-recall.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
Summary of Machlab and Battle (2024) analyzing in-context recall across LLMs via needle-in-a-haystack (NIAH) tests. Finds recall varies by model, context length, and needle placement depth, and is significantly affected by small prompt changes; prompt-training-data interplay can degrade quality. Larger size, attention enhancements, training strategies, and fine-tuning improve recall.

## Key Takeaways
1. **Recall is not uniform** — models recall facts differently by length and depth (beginning/middle/end; cf. lost-in-the-middle effect).
2. **Prompt sensitivity** — small changes in prompt wording materially affect NIAH recall performance; prompt design is a first-class variable, not just model choice.
3. **Training-data interplay** — interaction between prompt content and training distribution can degrade response quality.
4. **Scaling & architectural levers** — larger models, enhanced attention mechanisms, training-strategy tweaks, and fine-tuning all improve recall ability.
5. **Practical tip** — "Continued evaluation will further inform the selection of LLMs for individual use cases, maximizing their impact and efficiency in real-world applications as the technology continues to evolve."

## Detailed Notes
- Benchmark: needle-in-a-haystack with varied haystack lengths and insertion depths; heatmap figure shows performance across depths.
- Implication for RAG/long-context use: retrieval placement and prompt framing affect whether retrieved facts are actually used.
- Connects to [[context-engineering]] — where relevant context is positioned (edges vs middle) matters, echoing RAG post-retrieval reranking advice.

## Notable Quotes
> "Continued evaluation will further inform the selection of LLMs for individual use cases, maximizing their impact and efficiency in real-world applications as the technology continues to evolve." — Machlab and Battle (2024)

## Concepts Introduced or Referenced
- [[in-context-recall]] — NIAH recall across length/depth dimensions.
- [[prompt-engineering]] — prompt sensitivity as controllable lever.
- [[context-engineering]] / [[retrieval-augmented-generation]] — retrieval utility depends on recall capability, not just retrieval hit rate.
- [[inference]] — context window utilization and attention behavior at scale.
- [[scaling-laws]] — size correlates with recall robustness.

## Critical Assessment
Useful empirical caution: recall is not a binary capability but a prompt-and-position-dependent distribution. Strong practical relevance for RAG placement strategy (cf. Lost-in-the-Middle). Limitation: summary does not name which models were compared or report absolute scores; lacks mitigation recipe beyond "try enhancements." Complements [[source-promptingguide-research-rag]] (retrieval quality) by adding generator-side recall bottleneck and aligns with TrustLLM robustness concerns.

---

**Source:** LLM In-Context Recall is Prompt Dependent — Needle-in-a-Haystack Analysis by Machlab and Battle (2024) via DAIR.AI — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/llm-recall.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
