---
type: source-summary
title: "Getting Started with Gemini — Prompt Engineering Guide (DAIR.AI) Models"
summary: Primer on Google DeepMind Gemini (Ultra/Pro/Nano) as natively multimodal (text+image+video+audio+code) via Transformer decoders + multi-query attention, 32K context, 98% needle-retrieval across length, joint multimodal…
status: draft
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/gemini.en.mdx"
date-published: 2024-01-15
date-ingested: 2026-08-24
tags:
  - llm-fundamentals
  - multimodal
key-concepts:
  - "[[llm-models-overview]]"
  - "[[multimodal-cot]]"
key-entities:
  - "[[google-research]]"
  - "[[deepmind]]"
aliases:
  - wiki/source-promptingguide-models-gemini
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Primer on Google DeepMind Gemini (Ultra/Pro/Nano) as natively multimodal (text+image+video+audio+code) via Transformer decoders + multi-query attention, 32K context, 98% needle-retrieval across length, joint multimodal…</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2024-01-15. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/gemini.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
Primer on **Google DeepMind Gemini (Ultra/Pro/Nano)** as natively multimodal (text+image+video+audio+code) via Transformer decoders + multi-query attention, 32K context, 98% needle-retrieval across length, joint multimodal training (web/books/code + images/audio/video). Reports **Ultra SOTA 30/32 benchmarks**, **MMLU 90.0%** (first human-expert), **MMMU 62.4%**, with **CoT+self-consistency** lifts (MMLU 84→90 with 32 CoT + voting, 85 with CoT alone; GSM8K 94.4%; HumanEval 74.4%), Nano factuality/reasoning/multilingual strength, 32K-sequence retrieval at 98%. Then extensive capability tour via Google AI Studio (temperature 0): summarization (`Antibiotics…` → one-sentence), extraction (models array `["LLMs","ChatGPT","GPT-4","Chinese LLaMA","Alpaca"]` or `["NA"]`), VQA (guide snapshot title), physics error-correction (LaTeX), subplot rearrangement via matplotlib generation, video understanding, few-shot image generation, modality combination (audio+image sequence), plus Gemini Generalist Coding Agent. Screenshots `gemini/gemini-*.png` + tech report link https://storage.googleapis.com/deepmind-media/gemini/gemini_1_report.pdf.

## Key Takeaways
1. **Family:** Ultra (most capable), Pro (balanced scale), Nano 1.8/3.25B distilled + 4-bit quantized for on-device.
2. **Evaluation + prompting interaction:** Gains stacked via CoT + self-consistency (uncertainty-routed) — MMLU +6 pts with 32 samples, GSM8K 94.4, HumanEval 74.4 — shows inference strategy matters as much as model.
3. **Multimodal reasoning depth:** Not just captioning: table/chart extraction, cross-space/time aggregation, few-shot image generation, video QA, and code-mediated subplot rearrangement (recognize → generate matplotlib → render).
4. **Zero-shot extraction pattern:** Array output schema `["model_name"]` or `["NA"]` as fallback — canonical structured extraction via prompt.
5. **Operational note:** 32K training length → 98% long-context retrieval; human-preferred instruct tuning on creativity/safety.

## Detailed Notes
- **Architecture figure:** `gemini-architecture.png` (Transformer decoders + efficient attention).
- **Results table:** `gemini-result.png` vs GPT-4/Claude comparators.
- **Prompt examples:**
  - Summarization: `Your task is to summarize an abstract into one sentence. Avoid technical jargon. Abstract: Antibiotics…` → `Antibiotics are medicines… but they don't work against viruses.`
  - Extraction: `Extract model names … If you don't find … return ["NA"] Abstract: LLMs such as ChatGPT and GPT-4… Chinese LLaMA and Alpaca…` → `["LLMs","ChatGPT","GPT-4","Chinese LLaMA","Alpaca"]`
  - VQA: image of guide + question → `The title of the website is "Prompt Engineering Guide".`
  - Physics: teacher solution left, student error right — model spots fault and solves with LaTeX (screenshot `gemini-1.png`).
- **Sections:** Intro, Experimental Results, Multimodal Reasoning (Text Summarization, Information Extraction, VQA, Verifying/Correcting, Rearranging Figures, Video/Image Understanding, Modality Combination, Coding Agent).
- **Training data:** Web/books/code + image/audio/video jointly — crossmodal reasoning emerges from co-training.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 3 passages in this section could not be located in the stored source ([https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/gemini.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/gemini.en.mdx)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Gemini is the newest most capable AI model from Google Deepmind. It's built with multimodal capabilities from the ground up and can showcase impressive crossmodal reasoning across texts, images, video, audio, and code."
> "Gemini advances state of the art in 30 of 32 benchmarks … It is the first model to achieve human-expert performance on MMLU."
> "The Gemini models are trained to support 32k context length and … retrieve correct values with 98% accuracy when queried across the context length."

## Concepts Introduced or Referenced
- [[llm-models-overview]] — Gemini entry; DeepMind/ Google Research lineage.
- [[multimodal-cot]] — Crossmodal CoT + verification + code generation.
- [[in-context-learning]] — Few-shot image generation via interleaved image+text.
- [[context-caching]] — 32K retrieval relates to caching (app: Gemini 1.5 Flash caching).
- [[inference]] — Self-consistency sampling, N=32.

## Critical Assessment
- **Strengths:** Pairs SOTA claims with concrete Studio prompts/outputs across 7 modalities; quantifies CoT+SC lift; links architecture to measured retrieval (98%).
- **Weaknesses:** Heavy screenshot dependence; Nano/Ultra/Pro details mix Gemini 1.0 and later 1.5; no cost/latency or API code (UI-centric); benchmarks snapshot without variance.
- **Contradictions:** None; extends [[source-promptingguide-models-collection]] Gemini row with depth; aligns with [[multimodal-cot]] visual reasoning.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/gemini.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/gemini.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/gemini.en.mdx)
- Cited: https://storage.googleapis.com/deepmind-media/gemini/gemini_1_report.pdf

---

**Source:** Getting Started with Gemini — Prompt Engineering Guide (DAIR.AI) Models by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/gemini.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
