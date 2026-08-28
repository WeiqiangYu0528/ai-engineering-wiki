---
type: concept
title: "LM-Guided Chain-of-Thought"
summary: LM-Guided Chain-of-Thought (Lee et al., 2024, arXiv 2404.03414) decomposes CoT into small-LM rationale generation plus frozen large-LM answer prediction.
visibility: public
aliases:
  - "Guided CoT"
  - "Small-LM Rationale Generation"
  - "Distilled CoT"
tags:
  - prompt-engineering
  - fine-tuning
  - inference
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-research-guided-cot]]"
related:
  - "[[chain-of-thought]]"
  - "[[self-consistency]]"
  - "[[supervised-fine-tuning]]"
  - "[[reasoning-llms]]"
---

# LM-Guided Chain-of-Thought

## Overview
**LM-Guided Chain-of-Thought** (Lee et al., 2024, arXiv 2404.03414) decomposes CoT into **small-LM rationale generation** plus **frozen large-LM answer prediction**. A small model is distillation-trained on large-model rationales, then RL-optimized with rationale-oriented + task-oriented rewards; at inference it generates the rationale that conditions the large model's answer, outperforming standard and CoT prompting on multi-hop extractive QA without fine-tuning the large model.

## Key Ideas
- **Distill then RL:** Step 1 narrows the reasoning gap by distilling large-LM rationales into the small LM; Step 2 applies RL with dual rewards (rationale quality and answer correctness) to improve rationale utility.
- **Frozen large LM as reader:** Avoids expensive large-model fine-tuning; offloads the reasoning-surface to the lightweight model.
- **Self-consistency amplifies:** Sampling multiple guided rationales and majority-voting further improves accuracy, consistent with prior CoT findings.
- **Efficiency principle:** "Not everything needs to be done by the large models" — targeted optimization of the rationale module yields outsized gains per FLOP.

## How It Works
```
Query
  │
  ▼
[Small LM — KD + RL trained] ──► rationale(s)
  │
  ▼
[Frozen Large LM | rationale + query] ──► answer
  │
  ▼
[Self-Consistency Vote over samples] ──► final
```
Training uses large-LM-generated rationales as distillation supervision; RL rewards combine rationale coherence and downstream QA exact-match/F1.

## Practical Implications
- **Cost-effective reasoning uplift:** Provides a cheaper alternative to training or fine-tuning a full [[reasoning-llms]] model when the bottleneck is rationale quality rather than answer synthesis.
- **Modular debugging:** Failures can be attributed to rationale vs answer stage, enabling focused data collection.
- **QA-specialized evidence:** Proven on multi-hop extractive QA; transfer to open-ended generation and math reasoning remains to be validated.
- **Serving fit:** Small rationale generator is cheap to run and cache; large-model calls remain zero-gradient.

## Connections
- Variant of [[chain-of-thought]] that modularizes CoT; compared to [[self-consistency]] (aggregate over reasoning paths) and [[tree-of-thoughts]]/[[thoughtsculpt]] (search over reasoning).
- Training contrast with [[supervised-fine-tuning]] of the large model and [[direct-preference-optimization]] — here preference/quality signal is routed to the small generator.
- Inferences via [[inference]] (frozen decoding) and [[in-context-learning]] conditioning.

## Open Questions
- Does RL on rationale quality transfer beyond extractive QA to tasks where rationale correctness is harder to score automatically?
- What small-model scale saturates rationale gains, and when does scaling the reader dominate?

## Sources
- [[source-promptingguide-research-guided-cot]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
