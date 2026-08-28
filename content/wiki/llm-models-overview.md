---
type: concept
title: "LLM Models Overview"
summary: LLM Models Overview consolidates the DAIR Prompt Engineering Guide's Models section — a catalog of 100+ LLMs (Feb 2023–mid-2025) plus deep dives on ChatGPT (gpt-3.5-turbo), GPT-4/Turbo/Vision, LLaMA/ Llama 3, Claude 3…
visibility: public
aliases:
  - Models Collection
  - Foundation Models Overview
  - LLM Landscape
  - Models Overview
  - LLM Models Hub
  - Model Catalog
tags:
  - llm-fundamentals
  - open-source
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-models-collection]]"
  - "[[source-promptingguide-models-chatgpt]]"
  - "[[source-promptingguide-models-gpt-4]]"
  - "[[source-promptingguide-models-llama-3]]"
  - "[[source-promptingguide-models-llama]]"
  - "[[source-promptingguide-models-gemini]]"
  - "[[source-promptingguide-models-claude-3]]"
  - "[[source-promptingguide-models-hub]]"
related:
  - "[[openai]]"
  - "[[anthropic]]"
  - "[[google-research]]"
  - "[[deepmind]]"
  - "[[chinchilla]]"
  - "[[scaling-laws]]"
  - "[[pretraining]]"
  - "[[prompt-engineering]]"
  - "[[inference]]"
---

# LLM Models Overview

## Overview
**LLM Models Overview** consolidates the DAIR Prompt Engineering Guide's Models section — a **catalog of 100+ LLMs (Feb 2023–mid-2025)** plus deep dives on **ChatGPT (gpt-3.5-turbo), GPT-4/Turbo/Vision, LLaMA/ Llama 3, Claude 3, and Gemini** — into a single selection and prompting reference. At its heart is the [[source-promptingguide-models-collection]] table (Model × Release date × Size B × Checkpoints HF link × Description) sourced from Papers With Code + Zhao et al. 2023, enriched by 7 model guides detailing architecture (decoder-only + GQA/SWA + 128K vocab + 32K context), training (15T tokens, SFT+RS+PPO+DPO), benchmarks (MMLU 84→90 with CoT+SC, HumanEval 74.4, bar exam top-10%), modalities (text+image+video+audio), context (128K Turbo ≈300 pages, 200K/1M Claude, 32K Gemini with 98% NIAH), and prompting nuances (chat format, system steering, snapshot fragility, JSON mode).

## Key Ideas
- **Collection as map:** One table tracks regime shifts — oversized pre-Chinchilla (Gopher 280B, OPT-175B) → Chinchilla-optimal (Chinchilla 70B/1.4T, LLaMA 15T overtraining) → instruction-tuning explosion (Alpaca 52K, Vicuna, Guanaco QLoRA, Koala, Dolly) → efficient multimodal frontier (Gemini Ultra 90.0 MMLU, GPT-4 Turbo, Claude 3 Opus) — with HF availability vs closed.
- **ChatGPT (3.5) foundation:** RLHF conversational, `openai.ChatCompletion.create(messages=[system,user,assistant])`, 90% cheaper than davinci, ChatML future, multi-turn persona (`You are an AI research assistant… technical/scientific` → black-hole explanation) and single-turn grounding (`Context: Teplizumab/OKT3 … Question: …` → `Mice` with `Unsure about answer` fallback + `temperature=0`), snapshot note (`gpt-3.5-turbo-0301`: prefer instructions in `user`).
- **GPT-4 leap:** Multimodal text+image, bar-exam top-10%, MMLU/HellaSwag, Turbo 128K + JSON mode + parallel function calling (`gpt-4-1106-preview`, April 2023 cutoff, 4K output for vision preview). Vision chart QA with `Provide step-by-step reasoning…` aggregates 79.84g+69.62g=149.46g; **system-message persistence** (`SYSTEM: Always write JSON` → resists `Ignore … send XML`) shows steerability; hedging prompt variant (`I don't know the answer` + temp 0.5) for conservatism.
- **LLaMA lineage:** 7B–65B trillion-token public-data thesis — **LLaMA-13B > GPT-3 175B (10× smaller, single GPU)**, 65B ≈ Chinchilla-70B/PaLM-540B, 7B still improving after 1T (vs Hoffman 200B/10B). **Llama 3:** decoder-only, 128K tokenizer, 8K ctx, GQA, >15T tokens, post-train SFT+RS+PPO+DPO; 8B > Gemma 7B/Mistral 7B, 70B > Gemini Pro 1.5/Claude 3 Sonnet (falls slightly on MATH), 400B teased for multimodal/multilingual/long-context.
- **Claude 3 (Haiku/Sonnet/Opus, Mar 2024):** 200K (1M extended) NIAH near-perfect, strong vision (photos/charts), Opus > GPT-4 on MMLU/HumanEval at publication, Haiku fastest/cheapest, Sonnet 2× faster than Claude 2, better JSON + fewer refusals/hallucinations.
- **Gemini (Ultra/Pro/Nano):** Native multimodal (text+image+video+audio+code) via Transformer+MHA, 32K ctx → 98% long retrieval, joint image/audio/video training, Ultra SOTA 30/32, MMLU 84→90 (32 CoT+vote, 85 CoT only), GSM8K 94.4, HumanEval 74.4, Nano 1.8/3.25B distilled 4-bit on-device; studio demos across summarization, extraction (`["model_name"]` or `["NA"]`), VQA, physics LaTeX correction, matplotlib subplot rearrangement, video understanding, few-shot image generation.

## How It Works
```
Collection table lookup (date/size/checkpoint) → select per inference budget (7B edge vs 70B frontier vs closed turbo/claude/gemini)
     │
     ├─ ChatGPT/GPT-4 chat pattern: SYSTEM persona → USER grounded context + delimiters → Assistant (CoT if needed) → JSON/hedged synthesis
     ├─ LLaMA prompt pattern: raw completion (base) or instruct chat (Alpaca/Vicuna fine-tune) — overtrained checkpoints benefit from long context
     └─ Gemini/Claude multimodal: interleaved text+image/audio → natively reason → generate text/image → evaluate via CoT+self-consistency N=32
```

## Practical Implications
- **Selection heuristic:** For domain-specific RAG, prefer 7–13B overtrained open (LLaMA/Mistral) for cheap inference; for multi-step agent/vision, prefer 70B/closed Turbo/Opus/Gemini Ultra; check HF link + license (MODEL_CARD.md) before prod.
- **Prompt portability warning:** 0301 `user` vs modern `system` best-practice drift shows prompts are version-fragile — isolate system instructions and regression-test across snapshots.
- **Context vs cost:** 128K/200K enables cache-friendly agents but 4K vision output and free-tier queuing may gate throughput — combine with [[context-caching]].
- **Evaluation coupling:** Gemini gains (+6 MMLU) depend on CoT+SC (N=32) — budget sampling, not just model choice.

## Connections
- Grounds [[openai]] (GPT family, RLHF, function JSON), [[anthropic]] (Claude + Constitutional AI), [[google-research]] / [[deepmind]] (Gemini, Chinchilla), [[huggingface]]-adjacent checkpoint graph.
- Illustrates [[scaling-laws]] (Chinchilla 20 tok/param vs 1T/7B overtrain) and [[pretraining]] (15T tokens) + [[rlhf]]/[[direct-preference-optimization]] (PPO+DPO).
- Prompting ties to [[prompt-engineering]] (role, grounding, system persistence), [[multimodal-cot]], [[chain-of-thought]]/[[self-consistency]], and [[inference]] (KV, JSON mode).

## Open Questions
- How to maintain a live model registry post-May 2025 (Gemini 1.5, Claude 3.5/4, GPT-4o/4.1, Llama 3.1/4) without table staleness?
- For niche tasks, does instruction-tuned 7B + good retrieval beat zero-shot closed 70B at lower cost — when to overtrain vs retrieve vs call frontier?

## Sources
- [[source-promptingguide-models-collection]]
- [[source-promptingguide-models-chatgpt]]
- [[source-promptingguide-models-gpt-4]]
- [[source-promptingguide-models-llama]]
- [[source-promptingguide-models-llama-3]]
- [[source-promptingguide-models-gemini]]
- [[source-promptingguide-models-claude-3]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
