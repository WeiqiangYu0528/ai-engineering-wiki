---
type: source-summary
title: "Language Models are Few-Shot Learners"
summary: The landmark 2020 research paper by OpenAI introducing GPT-3 (175 Billion parameters).
status: verified
visibility: public
author: "Tom B. Brown et al. (OpenAI)"
source-type: paper
url: "https://arxiv.org/abs/2005.14165"
date-published: 2020-05-28
date-ingested: 2026-08-23
tags:
  - llm-fundamentals
  - prompt-engineering
key-concepts:
  - "[[in-context-learning]]"
  - "[[scaling-laws]]"
  - "[[pretraining]]"
  - "[[transformer]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-language-models-are-few-shot-learners
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The landmark 2020 research paper by OpenAI introducing GPT-3 (175 Billion parameters).</p>
<p class="kb-provenance">Tom B. Brown et al. (OpenAI), 2020-05-28. <a href="https://arxiv.org/abs/2005.14165">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
The landmark 2020 research paper by [[openai]] introducing **GPT-3 (175 Billion parameters)**. The paper fundamentally altered the paradigm of NLP by showing that scaling autoregressive [[transformer]] language models across parameter count, compute, and dataset scale enables **[[in-context-learning]]** (zero-shot, one-shot, and few-shot task adaptation) without requiring any task-specific fine-tuning or gradient updates.

## Key Takeaways
1. **The Few-Shot In-Context Paradigm:** Instead of updating model weights via fine-tuning, tasks and demonstrations are specified purely via natural language prompts within the model's context window.
2. **Scaling Unlocks Emergent Capabilities:** Scaling from 125M parameters to 175B parameters across 3 orders of magnitude of compute reveals that larger models are dramatically more effective meta-learners.
3. **Competitive with Fine-Tuning:** In the few-shot setting ($K=10$ to $100$ examples), GPT-3 matched or surpassed state-of-the-art fine-tuned models on benchmarks such as TriviaQA (71.2%), LAMBADA (86.4%), and translation.
4. **On-the-Fly Reasoning & Synthetic Generation:** Demonstrated unexpected capabilities in 3-digit arithmetic, unscrambling words, novel word application, and generating news articles indistinguishable from human writing.
5. **Quality-Weighted Pretraining:** Trained on 300 billion tokens with curated dataset weighting (Common Crawl filtered, WebText2, Books, Wikipedia).

## Detailed Notes

### 1. In-Context Learning vs. Fine-Tuning Spectrum
- **Fine-Tuning (FT):** Updates weights; requires large supervised datasets; prone to out-of-distribution failure.
- **Few-Shot (FS):** $K$ demonstrations provided in the context window ($n_{\text{ctx}} = 2048$); no weight updates.
- **One-Shot (1S):** 1 demonstration + prompt.
- **Zero-Shot (0S):** Natural language instructions only.

### 2. Architecture & Dataset Mix
- Decoder-only Transformer with 96 layers, 96 attention heads ($d_{\text{head}} = 128$), $d_{\text{model}} = 12288$.
- Trained on 300B tokens using V100 GPU clusters with tensor and pipeline parallelism.

## Notable Quotes
> "Here we show that scaling up language models greatly improves task-agnostic, few-shot performance, sometimes even reaching competitiveness with prior state-of-the-art fine-tuning approaches." — Brown et al.

> "The gap between zero-, one-, and few-shot performance often grows with model capacity, suggesting that larger models are more proficient meta-learners." — Brown et al.

## Concepts Introduced or Referenced
- [[in-context-learning]] — Conditioning models via text demonstrations without gradient updates.
- [[scaling-laws]] — Predictable power-law improvements in performance with compute and parameters.
- [[pretraining]] — Large-scale self-supervised training on curated web corpora.
- [[transformer]] — The underlying autoregressive neural network architecture.

## Critical Assessment
- **Historical Significance:** Transitioned the AI field from the "pretrain then fine-tune" paradigm (BERT/T5) to the "prompt engineering and in-context learning" era.
- **Limitations Identified:** Autoregressive directionality struggles with bidirectional comparison tasks (e.g., ANLI, reading comprehension lookahead); risk of benchmark data contamination.

---

**Source:** Language Models are Few-Shot Learners by Tom B. Brown et al. (OpenAI) — <https://arxiv.org/abs/2005.14165>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
