---
type: source-summary
title: "LM-Guided Chain-of-Thought — Small LM Rationale Generation with RL"
summary: "Summary of Lee et al. (2024, arXiv 2404.03414) proposing LM-Guided CoT: distill reasoning from a large LM into a small LM via rationale-generated knowledge distillation, then optimize the small LM with RL using…"
status: draft
visibility: public
author: "Lee et al. (2024) via DAIR.AI"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/guided-cot.en.mdx"
date-published: 2024-04-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - fine-tuning
  - inference
key-concepts:
  - "[[guided-cot]]"
  - "[[chain-of-thought]]"
  - "[[self-consistency]]"
key-entities:
  - "[[openai]]"
---

# LM-Guided Chain-of-Thought — Small LM Rationale Generation with RL

## Summary
Summary of Lee et al. (2024, arXiv 2404.03414) proposing LM-Guided CoT: distill reasoning from a large LM into a small LM via rationale-generated knowledge distillation, then optimize the small LM with RL using rationale-oriented and task-oriented rewards. At inference, the lightweight LM generates the rationale; the frozen large LM predicts the answer conditioned on it — avoiding large-model fine-tuning while improving multi-hop extractive QA accuracy. Self-consistency further boosts results.

## Key Takeaways
1. **Decomposed CoT** — Rationale generation offloaded to small knowledge-distilled LM; answer prediction left to frozen large LM.
2. **Two-stage optimization** — First distill rationales from large LM to small LM (narrowing reasoning gap), then RL with combined rationale-quality + task-accuracy rewards improves rationale utility.
3. **Results** — Outperforms standard prompting and CoT on multi-hop extractive QA; self-consistency decoding adds further gains.
4. **Efficiency insight** — "Not everything needs to be done by the large models" — targeted fine-tuning of small rationale generator is resource-efficient vs full large-model tuning.

## Detailed Notes
- Architecture figure shows small LM → rationale → frozen large LM → answer.
- RL reward signals are both rationale-oriented (quality) and task-oriented (answer accuracy).
- Self-consistency over sampled rationales enhances performance, consistent with prior CoT literature.

## Concepts Introduced or Referenced
- [[guided-cot]] — small-model-distilled, RL-optimized rationale generation.
- [[chain-of-thought]] — baseline vs guided variant.
- [[self-consistency]] — decoding-time aggregation.
- [[supervised-fine-tuning]] / [[direct-preference-optimization]] — distillation vs preference alignment context.
- [[inference]] / [[in-context-learning]] — inference-time efficiency and modular decomposition.

## Critical Assessment
Insightful efficiency pattern: decompose reasoning by capability boundary. Strength: clear distillation→RL→frozen-prediction pipeline with reported QA wins. Limitation: QA-only evaluation; not shown for open-ended reasoning. Complements [[chain-of-thought]] best practices and [[reasoning-llms]] native-reasoning discussion — offers cheaper alternative to training a full reasoning LLM. No contradictions.

---

**Source:** LM-Guided Chain-of-Thought — Small LM Rationale Generation with RL by Lee et al. (2024) via DAIR.AI — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/guided-cot.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
