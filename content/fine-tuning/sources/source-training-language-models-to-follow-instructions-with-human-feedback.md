---
type: source-summary
title: "Training language models to follow instructions with human feedback"
summary: The foundational 2022 research paper by OpenAI introducing InstructGPT, the direct technological predecessor to ChatGPT.
status: verified
visibility: public
author: "Long Ouyang, Jeff Wu, et al. (OpenAI)"
source-type: paper
url: "https://arxiv.org/abs/2203.02155"
date-published: 2022-03-04
date-ingested: 2026-08-23
tags:
  - fine-tuning
  - eval-safety
  - prompt-engineering
key-concepts:
  - "[[alignment]]"
  - "[[rlhf]]"
  - "[[supervised-fine-tuning]]"
  - "[[hallucination]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-training-language-models-to-follow-instructions-with-human-feedback
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The foundational 2022 research paper by OpenAI introducing InstructGPT, the direct technological predecessor to ChatGPT.</p>
<p class="kb-provenance">Long Ouyang, Jeff Wu, et al. (OpenAI), 2022-03-04. <a href="https://arxiv.org/abs/2203.02155">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
The foundational 2022 research paper by [[openai]] introducing **InstructGPT**, the direct technological predecessor to ChatGPT. The paper addresses the **[[alignment]] problem**—the mismatch between the pretraining objective (predicting the next internet token) and user intention (following instructions helpfully and safely). By deploying a 3-step [[rlhf]] pipeline (SFT $\to$ Reward Model $\to$ PPO-ptx), OpenAI demonstrated that a **1.3B parameter InstructGPT model is preferred over the 175B base GPT-3 model**, proving that alignment produces massive capability gains independent of raw parameter scaling.

## Key Takeaways
1. **Alignment Beats Scale:** A 1.3B aligned InstructGPT model outperforms a 100x larger 175B unaligned GPT-3 model on human preference ratings.
2. **The 3-Step RLHF Blueprint:** Established the standard alignment methodology used across frontier models:
   - Step 1: Collect demonstration data for [[supervised-fine-tuning|SFT]].
   - Step 2: Collect comparison rankings $(y_w \succ y_l)$ to train a **Reward Model (RM)**.
   - Step 3: Optimize the policy via **PPO** with a KL divergence penalty to prevent reward hacking.
3. **Halving Hallucination Rates:** Reduced closed-domain factual [[hallucination]] rates from 41% (GPT-3) to 21% (InstructGPT) and doubled truthfulness scores on TruthfulQA.
4. **Solving the "Alignment Tax" with PPO-ptx:** Mixing pretraining log-likelihood loss ($\gamma \mathbb{E}[\log \pi(x)]$) into PPO updates prevented regressions on public academic NLP benchmarks (SQuAD, DROP).
5. **Generalization Beyond RLHF Distribution:** InstructGPT successfully generalized instruction-following to code and multilingual tasks with minimal direct training data.

## Detailed Notes

### 1. Reward Model Formulation
Trained on $\binom{K}{2}$ comparisons per prompt with pairwise cross-entropy loss:
$$\text{loss}(\theta) = -\frac{1}{\binom{K}{2}} \mathbb{E}_{(x, y_w, y_l) \sim D} \left[ \log \sigma\left(r_\theta(x, y_w) - r_\theta(x, y_l)\right) \right]$$

### 2. PPO-ptx Reinforcement Learning Objective
$$\text{obj}(\phi) = \mathbb{E}_{(x, y) \sim D_{\pi_\phi^{\text{RL}}}} \left[ r_\theta(x, y) - \beta D_{\text{KL}}\left(\pi_\phi^{\text{RL}}(y|x) \,\|\, \pi^{\text{SFT}}(y|x)\right) \right] + \gamma \mathbb{E}_{x \sim D_{\text{pretrain}}} \left[ \log \pi_\phi^{\text{RL}}(x) \right]$$

## Notable Quotes
> "Making language models bigger does not inherently make them better at following a user's intent. Large language models can generate outputs that are untruthful, toxic, or simply not helpful to the user." — Ouyang et al.

> "In human evaluations, outputs from the 1.3B parameter InstructGPT model are preferred to outputs from the 175B GPT-3, despite having 100x fewer parameters." — Ouyang et al.

## Concepts Introduced or Referenced
- [[alignment]] — Aligning language models with human intent (Helpful, Honest, Harmless).
- [[rlhf]] — The 3-step pipeline combining SFT, Reward Modeling, and PPO.
- [[supervised-fine-tuning]] — Demonstration-based instruction tuning.
- [[hallucination]] — Reducing confabulation via human preference optimization.

## Critical Assessment
- **Transformative Impact:** The single paper that proved alignment could turn unpredictable text predictors into reliable, commercial chat assistants, directly paving the way for ChatGPT.
- **Limitations:** Susceptible to simple adversarial jailbreaks, and dependent on contractor demographics for preference modeling.

---

**Source:** Training language models to follow instructions with human feedback by Long Ouyang, Jeff Wu, et al. (OpenAI) — <https://arxiv.org/abs/2203.02155>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
