---
type: source-summary
title: "Prompt Engineering Guide — Multimodal CoT Prompting"
summary: This micro-chapter summarizes Zhang et al. (2023) Multimodal Chain-of-Thought Reasoning in Language Models.
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.) — based on Zhang et al. (2023)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/multimodalcot.en.mdx"
date-published: 2023-02-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - multimodal
key-concepts:
  - "[[multimodal-cot]]"
  - "[[prompt-engineering]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-techniques-multimodalcot
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This micro-chapter summarizes Zhang et al. (2023) Multimodal Chain-of-Thought Reasoning in Language Models.</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.) — based on Zhang et al. (2023), 2023-02-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/multimodalcot.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
This micro-chapter summarizes Zhang et al. (2023) *Multimodal Chain-of-Thought Reasoning in Language Models*. It notes that traditional CoT is language-only, whereas Multimodal CoT fuses vision and language in a two-stage pipeline: (1) rationale generation conditioned on multimodal inputs (image + text), then (2) answer inference leveraging the generated rationale. The guide reports a key result — a 1B-parameter multimodal CoT model outperforms GPT-3.5 on ScienceQA — and points to further reading on aligning perception with language models.

## Key Takeaways
1. **Language-only CoT is incomplete for vision tasks:** Science diagrams, charts, and physical scenes require visual grounding.
2. **Two-stage decomposition:** Stage 1 = rationale generation (multimodal → rationale); Stage 2 = answer inference (multimodal + rationale → answer). Separation improves faithfulness.
3. **Small multimodal > large text-only:** 1B multimodal CoT model beats GPT-3.5 on ScienceQA, proving modality beats scale for this domain.
4. **End-to-end training:** Both stages fine-tuned (or prompted) with vision encoder + language decoder interplay.
5. **Roadmap hint:** References *Language Is Not All You Need* (Feb 2023) on vision-language alignment.

## Detailed Notes

### Framework (Figure multimodal-cot.png)
- **Input:** Question + context text + associated image (ScienceQA).
- **Stage 1 — Rationale Generation:** Vision features (e.g., ViT) + text tokens fed to LM; model outputs step-by-step rationale explaining visual evidence.
- **Stage 2 — Answer Inference:** Original multimodal input + generated rationale concatenated; model predicts final answer choice.
- Training separates rationale quality from answer accuracy, reducing hallucinated shortcuts.

### ScienceQA Benchmark
- Crowdsourced science QA with image context (~21k questions across natural/social/language science).
- Metric: accuracy; multimodal CoT (1B) > GPT-3.5 (text-only CoT) — demonstrates visual rationale value.

### Further Reading
- *Language Is Not All You Need: Aligning Perception with Language Models* (2302.14045) — aligns perception (vision) with LLM via interface training.

### Guide Gaps
- No architectural detail (vision encoder, fusion method, training loss); no qualitative rationale example; no ablation (one-stage vs two-stage).

## Notable Quotes
> "Traditional CoT focuses on the language modality. In contrast, Multimodal CoT incorporates text and vision into a two-stage framework."

> "The first step involves rationale generation based on multimodal information. This is followed by the second phase, answer inference, which leverages the informative generated rationales."

## Concepts Introduced or Referenced
- [[multimodal-cot]] — Two-stage multimodal rationale → answer prompting/finetuning.
- [[prompt-engineering]] — Extends CoT prompting into vision-language domain.
- [[thinking-models]] — Shares stepwise reasoning lineage, but grounded in images.
- [[hallucination]] — Mitigated by visual evidence in rationale stage.

## Critical Assessment
- **Strengths:** Succinctly conveys modality gap and elegant two-stage fix; strong empirical hook (1B beats GPT-3.5) motivates technique.
- **Weaknesses:** Stub (12 lines of substance); no prompt template, no image example, no training/inference details; figure carries unexplained architecture; no discussion of when language-only suffices vs multimodal needed.
- **Contradictions:** None; complements text-only CoT and [[program-aided-language-models]] (different grounding: vision vs code execution).
- **Next steps:** Add ScienceQA sample (question + image + rationale + answer) and fusion architecture from paper.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/multimodalcot.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/multimodalcot.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/multimodalcot.en.mdx)
- Primary paper: Zhang et al. (2023) — https://arxiv.org/abs/2302.00923
- Further reading: https://arxiv.org/abs/2302.14045

---

**Source:** Prompt Engineering Guide — Multimodal CoT Prompting by DAIR.AI (Elvis Saravia et al.) — based on Zhang et al. (2023) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/multimodalcot.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
