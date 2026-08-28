---
type: concept
title: "Directional Stimulus Prompting"
summary: Directional Stimulus Prompting (DSP) (Li et al., 2023) is a learned prompting technique where a small, tunable policy LM generates a short input-conditioned hint (directional stimulus — often keywords) that steers a…
visibility: public
aliases:
  - "DSP"
  - "Directional Stimulus"
  - "Stimulus Prompting"
tags:
  - prompt-engineering
  - fine-tuning
  - agents
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-techniques-dsp]]"
related:
  - "[[prompt-engineering]]"
  - "[[automatic-prompt-engineer]]"
  - "[[rlhf]]"
  - "[[tool-use]]"
---

# Directional Stimulus Prompting

## Overview
**Directional Stimulus Prompting (DSP)** (Li et al., 2023) is a learned prompting technique where a small, tunable *policy LM* generates a short input-conditioned hint (directional stimulus — often keywords) that steers a large, frozen black-box LLM. The policy LM is trained with reinforcement learning (reward = quality of the frozen LLM’s output), keeping the large model untouched. Demonstrated for summarization, DSP exemplifies the shift from hand-crafted prompts to RL-optimized prompting.

## Key Ideas
- **Two-model decomposition:** Small policy LM (trainable, e.g., T5-small) + large LLM (frozen, API-only). Only the small model is updated, preserving black-box compatibility.
- **Stimulus as control signal:** Discrete hint tokens (e.g., `Keywords: revenue, Q3, guidance`) are prepended/appended to the input, acting as a learned intermediate prompt.
- **RL fine-tuning of prompter:** Policy gradient optimization where reward derives from downstream LLM output quality (ROUGE, LLM-judge, etc.).
- **Input-conditioned:** Unlike global instructions, stimuli are generated per-input, adapting guidance to content.

## How It Works
```
Input x ──► [Policy LM (trainable)] ──► Stimulus s (keywords/hint)
(x , s) ──► [Frozen LLM] ──► Output y
Reward R(y) ──► RL update to Policy LM
```
- **Standard prompting:** x → LLM → y.
- **DSP:** x → Policy LM → s; (x,s) → LLM → y. Figure in [[source-promptingguide-techniques-dsp]] contrasts the two.
- Training uses policy-gradient (e.g., REINFORCE/PPO) to maximize E[R(y)] over policy samples.

## Practical Implications
- **API-friendly learning:** Improves outputs from proprietary models without fine-tuning them — train only a cheap side model.
- **Summarization control:** Guide notes application to constraining summaries; generalizes to any generation where keywords/style anchors help.
- **Cost:** Requires RL training data (input + reward signal) and reward design; inference adds small-model latency.
- **Design choices:** Discrete stimuli stay interpretable but are non-differentiable (hence RL); continuous variants collapse to prefix tuning.
- **Security:** Policy LM outputs become part of prompt — validate stimuli to avoid prompt injection.

## Connections
- Learnable alternative to manual [[prompt-engineering]] and [[prompt-design-tips]] (specificity via hand-written keywords).
- Contrasts with [[automatic-prompt-engineer]] (black-box search over global instructions) — DSP is per-input and RL-trained.
- Shares RL optimization with [[rlhf]] but optimizes *prompts*, not model weights; complements [[supervised-fine-tuning]] as a lighter intervention.
- Foreshadows programmatic tool use: stimulus = precursor to [[tool-use]] routing hints.

## Open Questions
- What stimulus representation (keywords vs sentences vs structured tags) gives best controllability vs fluency?
- How does reward choice (ROUGE vs model-based judge) affect generalization and reward hacking?
- Can DSP be extended to multi-turn agents where stimuli become per-step subgoals?

## Sources
- [[source-promptingguide-techniques-dsp]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
