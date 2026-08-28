---
type: source-summary
title: "What is Groq? — LPU Inference Performance"
summary: Overview of Groq's LPU™ Inference Engine and Language Processing Units (LPUs) as a fast LLM inference solution (claimed 18× faster than top cloud providers on Anyscale LLMPerf Leaderboard at publication).
status: verified
visibility: public
author: "DAIR.AI Prompt Engineering Guide"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/groq.en.mdx"
date-published: 2024-02-01
date-ingested: 2026-08-24
tags:
  - inference
  - open-source
key-concepts:
  - "[[groq]]"
  - "[[inference]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
---

# What is Groq? — LPU Inference Performance

## Summary
Overview of Groq's LPU™ Inference Engine and Language Processing Units (LPUs) as a fast LLM inference solution (claimed 18× faster than top cloud providers on Anyscale LLMPerf Leaderboard at publication). Covers served models (Llama 2 70B, Mixtral 8x7B), latency metrics (output tokens/sec throughput and time-to-first-token TTFT, both mean over 150 requests on Llama 2 70B), pricing chart, and ISCA papers (2020, 2022) detailing LPU architecture.

## Key Takeaways
1. **18× claim** — On Anyscale's LLMPerf Leaderboard for Llama 2 70B mean output tokens/s across 150 requests; also TTFT advantage for streaming.
2. **LPU hardware** — Custom Language Processing Units designed to reduce time-per-word; details in ISCA 2020/2022 papers.
3. **Metrics distinguished** — TTFT (first-token latency for streaming UX) vs throughput (tokens/s) — both charted.
4. **Model availability at time** — Llama 2 70B and Mixtral 8x7B via Groq API.

## Detailed Notes
- Two benchmark charts: output tokens throughput and TTFT per provider.
- References Groq FAQs and leaderboard announcement post.

## Concepts Introduced or Referenced
- [[inference]] — prefill vs decode, memory-bandwidth bottleneck; Groq attacks decode latency at hardware level.
- [[decoding-strategies]] — throughput directly impacts sampling latency.
- [[scaling-laws]] / [[chinchilla]] — inference economics context.

## Critical Assessment
Useful hardware-contrast to software-level inference optimizations covered elsewhere (vLLM, quantization, GQA). Strength: concrete leaderboard metrics and LPU paper pointers. Limitation: performance claims are point-in-time (Feb 2024) and may not reflect current leaderboard; pricing chart not transcribed. Complements [[inference]] page's serving-economics discussion; no contradictions. Suggests [[groq]] entity/page for hardware-tracked inference.

---

**Source:** What is Groq? — LPU Inference Performance by DAIR.AI Prompt Engineering Guide — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/groq.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
