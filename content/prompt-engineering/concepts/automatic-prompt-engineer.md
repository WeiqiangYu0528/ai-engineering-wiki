---
type: concept
title: "Automatic Prompt Engineer (APE)"
summary: Automatic Prompt Engineer (APE) (Zhou et al., 2022) is a black-box framework that uses a large language model itself to generate and search over natural-language instructions.
visibility: public
aliases:
  - APE
  - Automatic Prompt Engineering
  - LLM-Automated Instruction Generation
  - wiki/automatic-prompt-engineer
tags:
  - prompt-engineering
  - inference
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-techniques-ape]]"
related:
  - "[[prompt-engineering]]"
  - "[[prompt-design-tips]]"
  - "[[active-prompt]]"
  - "[[directional-stimulus-prompting]]"
  - "[[thinking-models]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Automatic Prompt Engineer (APE) (Zhou et al., 2022) is a black-box framework that uses a large language model itself to generate and search over natural-language instructions.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/prompt-engineering/concepts/prompt-design-tips">Prompt Design Tips</a></li><li><a href="/prompt-engineering/concepts/active-prompt">Active-Prompt</a></li><li><a href="/prompt-engineering/concepts/directional-stimulus-prompting">Directional Stimulus Prompting</a></li><li><a href="/llm-fundamentals/concepts/thinking-models">Thinking Models</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-ape">Prompt Engineering Guide — Automatic Prompt Engineer (APE)</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**Automatic Prompt Engineer (APE)** (Zhou et al., 2022) is a black-box framework that uses a large language model itself to *generate and search* over natural-language instructions. Given output demonstrations, an inference LLM proposes candidate prompts, a target LLM executes them, and evaluation scores select the best — automating what was manual [[prompt-engineering]]. APE famously discovered “Let’s work this out in a step by step way to be sure we have the right answer.” as a stronger zero-shot chain-of-thought elicitor than “Let’s think step by step.”

## Key Ideas
- **Instructions as optimizable objects:** Prompt generation is framed as natural-language synthesis / black-box optimization, not gradient descent.
- **LLM as generator and evaluator:** The same model family proposes and scores prompts; no weight updates required, compatible with API-only models.
- **Zero-shot CoT discovery:** Demonstrates that phrasing matters quantitatively (MultiArith/GSM8K lift) and that search can beat human intuition.
- **Family of methods:** APE sits alongside OPRO (LLM-as-optimizer), Prompt-OIRL (inverse RL), AutoPrompt (gradient-guided discrete search), and continuous methods (Prefix Tuning, Prompt Tuning).

## How It Works
```
Demos ──► [Inference LLM: generate candidates] ──► Candidate pool {p1…pk}
                                    │
                                    ▼
                          [Target LLM executes pi on task] ──► Score(pi)
                                    │
                                    ▼
                          Select argmax Score (optional iterative resampling)
```
1. **Generation:** Inference LLM conditioned on few output demonstrations samples diverse instruction candidates.
2. **Execution:** Each candidate is run on the target LLM (same or different model) over a validation split.
3. **Selection:** Ranked by accuracy / log-probability; top instruction kept. Search can iterate (mutate top candidates, resample) akin to evolutionary optimization.
4. **Deployment:** Best instruction used zero-shot (no exemplars) at inference.

Example discovered prompt vs human baseline:
- Human: `Let’s think step by step.`
- APE: `Let’s work this out in a step by step way to be sure we have the right answer.` → +accuracy on MultiArith/GSM8K per [[source-promptingguide-techniques-ape]] figure.

## Practical Implications
- **Automate prompt tuning:** Replace manual trial-and-error (see [[prompt-design-tips]]) with systematic search when evaluation set is available.
- **API-compatible optimization:** No gradients or fine-tuning; works with frozen proprietary models.
- **Cost/latency trade-off:** Search requires many LLM calls; amortize if prompt is reused at scale.
- **Tooling path:** Implement with DSPy, OPRO loops, or simple generate-filter pipelines; pair with [[llm-settings]] temperature=0 for stable scoring.

## Connections
- Automates [[prompt-engineering]] and complements manual heuristics in [[prompt-design-tips]] (APE searches specificity/format automatically).
- Contrasts with [[active-prompt]]: APE searches *instruction* space, Active-Prompt searches *exemplar* space.
- Contrasts with [[directional-stimulus-prompting]]: APE is black-box search over discrete prompts; DSP is RL-trained small policy LM generating input-conditioned hints.
- Enables better elicitation for [[thinking-models]] / chain-of-thought without hand-crafting.
- Relates to [[prompt-elements]] instruction slot optimization.

## Open Questions
- How well do APE-discovered prompts transfer across model families and sizes vs overfitting to the scorer model?
- What search budget and selection metric (accuracy vs model likelihood vs LLM-judge) yields most robust prompts?
- Can APE be combined with soft-prompt methods (Prompt Tuning) for hybrid discrete+continuous optimization?

## Sources
- [[source-promptingguide-techniques-ape]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
