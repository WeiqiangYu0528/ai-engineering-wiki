---
type: source-summary
title: "LLaMA: Open and Efficient Foundation Language Models — Prompt Engineering Guide (DAIR.AI) Models"
summary: Brief on Meta LLaMA 7B–65B open efficient foundations (Feb 2023).
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.) / Meta AI"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/llama.en.mdx"
date-published: 2023-03-01
date-ingested: 2026-08-24
tags:
  - open-source
  - llm-fundamentals
key-concepts:
  - "[[llm-models-overview]]"
  - "[[pretraining]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-models-llama
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Brief on Meta LLaMA 7B–65B open efficient foundations (Feb 2023).</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.) / Meta AI, 2023-03-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/llama.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
Brief on **Meta LLaMA 7B–65B** open efficient foundations (Feb 2023). Core claim: train **smaller models on more tokens** for best inference-budget performance — contrary to Kaplan-scale larger-is-better. Notes trillion-token public-data training, reports **LLaMA-13B > GPT-3 175B on many benchmarks (10× smaller, single-GPU viable)** and **LLaMA-65B ≈ Chinchilla-70B / PaLM-540B**, citing Hoffman et al. 2022 (200B tokens for 10B model) but observing LLaMA-7B keeps improving past 1T tokens. Figure `llama-1.png` shows scaling vs tokens. Links paper https://arxiv.org/abs/2302.13971 and code https://github.com/facebookresearch/llama, plus reference list (Koala, Baize, Vicuna, LLaMA-Adapter, GPT4All, ChatDoctor, Alpaca).

## Key Takeaways
1. **Efficiency thesis:** Inference-budget optimal = smaller + longer training (1T+ tokens for 7B), not just larger params — validated by 13B beating 175B GPT-3.
2. **Scale:** 7B–65B family, public datasets, trillion-scale — enables open replication + fine-tune wave (Alpaca, Vicuna, etc.).
3. **Evidence:** Figure shows 7B still climbing after 1T (contrasts Hoffman 200B/10B recommendation at that time).

## Detailed Notes
- **Header:** `under heavy development`; imports `llama-1.png`.
- **What's new (3 bullets):** foundation range 7–65B, trillion tokens public, 7B still improving after 1T (vs Hoffman).
- **Capabilities:** 13B > GPT-3 175B; 65B competitive with Chinchilla 70B / PaLM 540B.
- **Refs:** 6 ecosystem fine-tunes (Koala BAIR, Baize, Vicuna 90% ChatGPT quality claim, LLaMA-Adapter, GPT4All, ChatDoctor, Alpaca).

## Notable Quotes
> "This work focuses on training models (LLaMA) that achieve the best possible performance at various inference budgets, by training on more tokens."
> "The work by (Hoffman et al. 2022) shows that given a compute budget smaller models trained on a lot more data can achieve better performance than the larger counterparts."
> "LLaMA-13B outperform GPT-3(175B) on many benchmarks despite being 10x smaller and possible to run a single GPU."

## Concepts Introduced or Referenced
- [[llm-models-overview]] — LLaMA foundation family origin.
- [[pretraining]] / [[scaling-laws]] — Chinchilla-optimal overtraining demonstration.
- [[inference]] — Inference-budget framing (FLOPs → tokens choice).
- [[supervised-fine-tuning]] — Downstream Alpaca/Vicuna fine-tunes enabled.

## Critical Assessment
- **Strengths:** Crisp articulation of overtraining thesis with clear benchmark anchors vs GPT-3/Chinchilla/PaLM; seeds open ecosystem story.
- **Weaknesses:** Stub page (no architecture detail, no prompting guidance); figure only qualitative.
- **Contradictions:** None; precursor to [[source-promptingguide-models-llama-3]] (15T continuation) and [[source-promptingguide-models-collection]].

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/llama.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/llama.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/llama.en.mdx)
- Cited: https://arxiv.org/abs/2302.13971 ; https://github.com/facebookresearch/llama

---

**Source:** LLaMA: Open and Efficient Foundation Language Models — Prompt Engineering Guide (DAIR.AI) Models by DAIR.AI (Elvis Saravia et al.) / Meta AI — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/llama.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
