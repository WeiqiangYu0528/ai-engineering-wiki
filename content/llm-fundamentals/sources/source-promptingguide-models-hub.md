---
type: source-summary
title: "Models Hub — ChatGPT, Claude 3, and Gemini Overview"
summary: "Aggregated summary of 3 representative model pages from pages/models (21 models listed: chatgpt, claude-3, code-llama, flan, gemini family, gpt-4, llama variants, mistral, mixtral, olmo, phi-2, sora etc.)."
status: verified
visibility: public
author: "DAIR.AI Prompt Engineering Guide"
source-type: article
url: "https://github.com/dair-ai/Prompt-Engineering-Guide/tree/main/pages/models"
date-published: 2024-01-01
date-ingested: 2026-08-24
tags:
  - llm-fundamentals
  - multimodal
  - agents
key-concepts:
  - "[[llm-models-overview|Models Overview]]"
  - "[[prompt-engineering]]"
  - "[[multimodal-cot]]"
key-entities:
  - "[[openai]]"
  - "[[anthropic]]"
  - "[[google-research]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-models-hub
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Aggregated summary of 3 representative model pages from pages/models (21 models listed: chatgpt, claude-3, code-llama, flan, gemini family, gpt-4, llama variants, mistral, mixtral, olmo, phi-2, sora etc.).</p>
<p class="kb-provenance">DAIR.AI Prompt Engineering Guide, 2024-01-01. <a href="https://github.com/dair-ai/Prompt-Engineering-Guide/tree/main/pages/models">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
Aggregated summary of 3 representative model pages from `pages/models` (21 models listed: chatgpt, claude-3, code-llama, flan, gemini family, gpt-4, llama variants, mistral, mixtral, olmo, phi-2, sora etc.). Sampled: ChatGPT (308 lines, full prompt-engineering guide), Claude 3 (26 lines, family benchmark), and Gemini (246 lines, multimodal). ChatGPT page covers RLHF training, conversation-task review, ChatML message format, and single/multi-turn patterns; Claude 3 reports Opus/Sonnet/Haiku family beating GPT-4 on MMLU/HumanEval, 200K→1M context, NIAH near-perfect recall, and vision/JSON improvements; Gemini details Ultra/Pro/Nano sizes, 32K context + 98% NIAH retrieval, MQA architecture, and multimodal reasoning (text + image/video/audio).

## Key Takeaways
1. **ChatGPT prompting model** — Conversation task defined by intent + identity (technical assistant example); `gpt-3.5-turbo` chat format (system/user/assistant messages, ChatML) preferred over `text-davinci-003` (90% cost reduction); both multi-turn and single-turn QA supported via structured messages.
2. **Claude 3 family** — Opus > GPT-4 on MMLU/HumanEval; Haiku fastest/cheapest, Sonnet 2× faster than prior Claude, Opus ~Claude 2.1 speed with higher quality; 200K window (select 1M), near-perfect NIAH, strong vision (photos/charts/graphs), fewer refusals, better JSON structured outputs.
3. **Gemini architecture** — Ultra (most capable), Pro (balanced), Nano 1.8B/3.25B distilled + 4-bit quantized for on-device; Transformer decoders with multi-query attention; 32K context; trained jointly multimodal+multilingual (web, books, code, image/audio/video); Ultra: 90.0% MMLU (84.0% greedy → 90.0% uncertainty-routed CoT+self-consistency with 32 samples), 94.4% GSM8K, 74.4% HumanEval, 62.4% MMMU.
4. **Multimodal use cases demonstrated** — Summarization prompt (abstract→one sentence), information extraction (model-name extraction), visual QA (screenshot Q&A), all with Google AI Studio temperature 0 screenshots.
5. **Hub scope context** — Full `pages/models` lists 21 `.en.mdx` entries; collection page aggregates others; sampled pages illustrate conversation (ChatGPT), benchmark/quality (Claude 3), and multimodal scale (Gemini) archetypes.

## Detailed Notes
### ChatGPT Deep Dive (pages/models/chatgpt.en.mdx)
- RLHF training noted with limitations caveat; Playground vs API distinction; Snap/Instacart adoption anecdote; worked example: black-hole Q with system → user → assistant → user flow; single-turn QA example (Teplizumab/OKT3 → "Mice.") demonstrates grounding via context.

### Claude 3 (claude-3.en.mdx)
- Vision capability figure; nuanced-request handling and hallucination reduction claim; structured JSON improvement over Claude 2.

### Gemini (gemini.en.mdx)
- Architecture figure (text interleaved with audio/visual → text+image outputs); experimental results table (Gemini3.png); NIAH 98% across 32K; instruction-tuned preference win on creative writing/safety; multimodal figures spanning Gemini-1 through prompt-webqa examples.

## Concepts Introduced or Referenced
- [[llm-models-overview|Models Overview]] — per-model capability + prompting pattern catalog.
- [[prompt-engineering]] / [[role-prompting]] / [[in-context-learning]] — ChatGPT system-message role + few-shot/zero-shot patterns.
- [[inference]] / [[decoding-strategies]] — temperature, top_p, NIAH context-window scaling.
- [[multimodal-cot]] — Gemini vision-language reasoning.
- [[self-consistency]] / [[chain-of-thought]] — Gemini Ultra's 90% MMLU via uncertainty-routed CoT.

## Critical Assessment
Practical snapshot circa early 2024; serves as onboarding to provider-specific prompting rather than rigorous benchmark. Strength: ChatGPT message-format tutorial and Gemini multimodal screenshots are actionable. Limitation: Claude 3/Gemini claims lack independent verification in summary; Gemini 1M context via Claude comparison appears to mix models (Claude 3 1M). Complements [[openai]]/[[anthropic]]/[[google-research]] entity pages and [[inference]] (context length) / [[multimodal-cot]] (vision reasoning). No contradictions; strengthens MMLU/NIAH cross-model comparison thread.

---

**Source:** Models Hub — ChatGPT, Claude 3, and Gemini Overview by DAIR.AI Prompt Engineering Guide — <https://github.com/dair-ai/Prompt-Engineering-Guide/tree/main/pages/models>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
