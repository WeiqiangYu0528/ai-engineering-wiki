---
type: entity
title: "Groq"
summary: Groq is an LLM inference hardware and cloud provider whose LPU™ Inference Engine and custom Language Processing Units (LPUs) accelerate autoregressive decoding by reducing time-per-word.
status: draft
visibility: public
entity-type: organization
tags:
  - inference
  - open-source
created: 2026-08-24
updated: 2026-08-24
url: "https://groq.com"
related:
  - "[[inference]]"
  - "[[decoding-strategies]]"
  - "[[infini-attention]]"
---

# Groq

## Overview
**Groq** is an LLM inference hardware and cloud provider whose **LPU™ Inference Engine** and custom **Language Processing Units (LPUs)** accelerate autoregressive decoding by reducing time-per-word. At the time of the Prompt Engineering Guide summary (Feb 2024) it claimed **18× faster throughput** vs top cloud providers on Anyscale's LLMPerf Leaderboard (Llama 2 70B, 150-request mean) and leading time-to-first-token (TTFT) for streaming.

## Key Facts
- **Hardware:** Purpose-built LPUs; architecture detailed in ISCA 2020 and 2022 award papers.
- **Models served (at publication):** Llama 2 70B and Mixtral 8x7B via Groq API.
- **Metrics charted:** Mean output tokens/sec throughput and TTFT (seconds) per provider on Llama 2 70B; both from Anyscale LLMPerf leaderboard.
- **Leadership claim:** 18× throughput advantage at time of measurement; TTFT also best-in-class — relevant for streaming UX.

## Significance in AI Engineering
Groq represents the **hardware-track alternative** to software serving optimizations (vLLM PagedAttention, TensorRT-LLM, quantization, GQA/MQA). For latency-sensitive agentic and RAG pipelines where decoding is memory-bandwidth bound, LPUs offer a drop-in speed lever without model changes. Evaluation should compare both throughput and TTFT against cost, not throughput alone.

## Related Concepts
- [[inference]] — prefill vs decode bottleneck; KV-cache pressure.
- [[infini-attention]] — orthogonal long-context memory optimization; both aim to reduce long-context serving cost.

## Sources
- [[source-promptingguide-research-groq]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
