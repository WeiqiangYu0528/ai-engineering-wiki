---
type: concept
title: "Direct Preference Optimization"
summary: Direct Preference Optimization (DPO) is an algorithm for aligning large language models with human preferences without explicit reward modeling or reinforcement learning.
visibility: public
aliases:
  - DPO
  - Implicit Reward Modeling
  - RL-Free Alignment
  - wiki/direct-preference-optimization
tags:
  - fine-tuning
  - eval-safety
created: 2026-08-23
updated: 2026-08-26
status: draft
sources:
  - "[[source-direct-preference-optimization]]"
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
  - "[[source-cs336-lecture15-sft-rlhf]]"
  - "[[source-cs336-lecture16-rlvr]]"
related:
  - "[[rlhf]]"
  - "[[alignment]]"
  - "[[supervised-fine-tuning]]"
  - "[[reasoning-llms]]"
  - "[[evaluation]]"
  - "[[data-curation]]"
  - "[[post-training-lineage]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Direct Preference Optimization (DPO) is an algorithm for aligning large language models with human preferences without explicit reward modeling or reinforcement learning.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/fine-tuning/concepts/rlhf">Reinforcement Learning from Human Feedback</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/fine-tuning/concepts/rlhf">Reinforcement Learning from Human Feedback</a></li><li><a href="/fine-tuning/concepts/alignment">AI Alignment</a></li><li><a href="/fine-tuning/concepts/supervised-fine-tuning">Supervised Fine-Tuning</a></li><li><a href="/agents/concepts/reasoning-llms">Reasoning LLMs</a></li><li><a href="/eval-safety/concepts/evaluation">Evaluation</a></li><li><a href="/rag/concepts/data-curation">Data Curation for LLMs</a></li><li><a href="/fine-tuning/concepts/post-training-lineage">Post-Training Lineage: What Actually Replaced What</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/fine-tuning/sources/source-direct-preference-optimization">Direct Preference Optimization: Your Language Model is Secretly a Reward Model</a></li><li><a href="/llm-fundamentals/sources/source-deep-dive-into-llms-like-chatgpt">Deep Dive into LLMs like ChatGPT</a></li><li><a href="/fine-tuning/sources/source-cs336-lecture15-sft-rlhf">CS336 Lecture 15 — After Pretraining: Mid/Post-training, SFT and RLHF (Tatsu Hashimoto)</a></li><li><a href="/fine-tuning/sources/source-cs336-lecture16-rlvr">CS336 Lecture 16 — Post-training 2: Reinforcement Learning from Verifiable Rewards (Tatsu Hashimoto)</a></li></ul></nav>
</aside>

## Overview
**Direct Preference Optimization (DPO)** is an algorithm for aligning large language models with human preferences without explicit reward modeling or reinforcement learning. Introduced by Rafailov et al. (2023) at [[stanford-university]] in [[source-direct-preference-optimization]], DPO reformulates the standard KL-constrained [[rlhf]] objective into a closed-form binary cross-entropy loss applied directly to the policy network $\pi_\theta$. CS336 Lecture 15 [[source-cs336-lecture15-sft-rlhf]] provides the cleanest whiteboard derivation (nonparametric → Bradley-Terry cancellation) and situates DPO as one control-token alternative among many (preferred-only SFT, RM+rejection sampling), while Lecture 16 [[source-cs336-lecture16-rlvr]] contrasts it with GRPO and shows its squared-loss generalization in Kimi K1.5.

## Key Ideas
- **Implicit Reward Parameterization:** The optimal policy $\pi^*(y \mid x)$ under a KL-regularized reward maximization objective is mathematically related to the reward $r(x, y)$ by:
  $$r(x, y) = \beta \log \frac{\pi^*(y \mid x)}{\pi_{\text{ref}}(y \mid x)} + \beta \log Z(x)$$
  where $Z(x)$ is the partition function and $\pi_{\text{ref}}$ is the frozen reference policy (usually the [[supervised-fine-tuning|SFT]] model).
- **The DPO Loss Function:**
  Under the Bradley-Terry preference model, the partition function $Z(x)$ cancels out entirely, yielding the exact optimization objective:
  $$\mathcal{L}_{\text{DPO}}(\theta; \pi_{\text{ref}}) = -\mathbb{E}_{(x, y_w, y_l) \sim \mathcal{D}} \left[ \log \sigma\left( \beta \log \frac{\pi_\theta(y_w \mid x)}{\pi_{\text{ref}}(y_w \mid x)} - \beta \log \frac{\pi_\theta(y_l \mid x)}{\pi_{\text{ref}}(y_l \mid x)} \right) \right]$$
  Lecture 15 [[source-cs336-lecture15-sft-rlhf]] emphasizes the three-step derivation: (1) nonparametric assumption links `π` and `r` in closed form, (2) reparameterize `r` via policy, (3) MLE on Stiennon pairwise RM loss — conceptually pos-grad on `y_w`, neg-grad on `y_l` scaled by implied-reward prediction error.
- **Comparison: PPO vs. DPO vs. GRPO (CS336 update):**

| Dimension | PPO-Based RLHF | Direct Preference Optimization (DPO) | GRPO (RLVR) |
|---|---|---|---|
| **Models in Memory** | 4 (Policy, Reference, Reward Model, Value Critic) | **2** (Policy $\pi_\theta$, Reference $\pi_{\text{ref}}$) | **2** (Policy + Reference; no value) |
| **Training Paradigm** | Complex RL loop with online rollouts | **Standard supervised classification** | Group z-score PG (online rollouts, no critic) |
| **GPU Memory & Compute** | Very high (dynamic generation rollouts) | **Low (batch forward-backward passes)** | Medium (rollouts but no value) |
| **Hyperparameter Sensitivity** | Extremely delicate (critic learning rates, clipping, GAE) | **Stable** (single primary hyperparameter $\beta$) | Moderate (clip, KL, group std 1e-4) |
| **Data Nature** | On-policy active generation | **Offline static pairwise preference dataset** | **Verifiable** (math/code) or preference |
- **Variants — Tulu 3 and Kimi (L15–16):** SimPO (reference-free), length-normalized DPO, and Kimi's reference-regularized squared-loss (`ℒ = (r - baseline)^2` with baselined PG) as DPO-inspired RL generalization — showing DPO derivation extends beyond Bradley-Terry to generic policy-gradient via nonparametric solve-for-`r` [[source-cs336-lecture16-rlvr]].
- **Why Not Just SFT on Preferred?** Lecture 15 lists ablations that underperform DPO/PPO: control-token SFT (`[GOOD]/[BAD]` prepend), preferred-only SFT, RM-filtered rejection sampling, or best-of-1024 selection — all lack the contrastive negative gradient that DPO provides [[source-cs336-lecture15-sft-rlhf]].

## How It Works
1. **Dataset Preparation:** Construct or load an offline dataset $\mathcal{D} = \{(x, y_w, y_l)\}$ of prompts $x$, preferred completions $y_w$, and dispreferred completions $y_l$. In Tulu 3/LLaMA pattern, preference comes from UltraFeedback or human pairwise; consider length-normalization to counter verbosity bias [[source-cs336-lecture15-sft-rlhf]].
2. **Forward Passes:** For each batch, compute log-probabilities of $y_w$ and $y_l$ under both the active policy $\pi_\theta$ and the frozen reference model $\pi_{\text{ref}}$. For reference-free SimPO, skip `π_ref`.
3. **Loss Computation:** Evaluate $\mathcal{L}_{\text{DPO}}$ (or squared-loss variant per Kimi: `‖r - target‖²`) and compute gradients — scaled by how surprised the implied RM is.
4. **Parameter Update:** Update $\theta$ via standard AdamW optimizer. For iterative/online DPO (to reduce offline drift), regenerate rollouts mid-training as in RLVR loops.
5. **Expert Iteration Bridge:** LLaMA post-training interleaves DPO with rejection-sampling expert iteration (RFT) — RL without gradients vs with [[source-cs336-lecture15-sft-rlhf]].

## Practical Implications
- **Democratized Alignment:** DPO enabled resource-constrained open-source teams and researchers to perform post-training alignment without massive GPU clusters or RL infrastructure (2 vs 4 models, no rollouts).
- **Widespread Adoption:** Forms the backbone of high-performing open-source model releases (e.g. Zephyr, Mistral-Instruct, Llama-3-Instruct post-training recipes) and Tulu 3/LLaMA DPO + expert iteration.
- **Hyperparameter $\beta$:** Typically set between $0.1$ and $0.5$. Lower $\beta$ allows larger deviation from the reference policy; higher $\beta$ strictly anchors the model to the reference distribution. Length-normalized DPO further debiases verbosity [[source-cs336-lecture15-sft-rlhf]].
- **When DPO Insufficient:** For verifiable math/code, GRPO outperforms DPO (Lecture 16: RFT vs GRPO) — switch when ground truth exists; for subjective tasks, stay with DPO/PPO. Kimi squared-loss shows DPO math extends to RL with references [[source-cs336-lecture16-rlvr]].
- **Contingent Rankings:** PPO sometimes beats DPO depending on setup (hyperparams, RM quality) — per L15, RL empirical work is highly contingent; sweep both [[source-cs336-lecture15-sft-rlhf]].

## Connections
- Direct algebraic simplification of the [[rlhf]] objective; GRPO and Kimi's squared-loss are its verifiable-domain cousins.
- Essential method for implementing [[alignment]] (Helpful, Honest, Harmless) and [[reasoning-llms]] (RLVR via DPO→GRPO lineage).
- Applied directly after [[supervised-fine-tuning]]; often interleaved with rejection sampling / expert iteration (LLaMA).
- Data source is [[data-curation]] and [[evaluation]] pipelines (UltraFeedback, AlpacaEval) — quality of pairwise data dominates DPO gains.

## Open Questions
- *Offline vs. Online Drift:* Since DPO trains on fixed offline pairs, does policy drift necessitate iterative / online DPO where the model generates new responses on each epoch? Kimi and RLVR loops suggest yes — iterative regeneration closes the gap [[source-cs336-lecture16-rlvr]].
- *Length Bias:* Does DPO exhibit an inherent bias toward favoring longer responses over shorter, more concise ones? Tulu 3 length-normalized DPO and SimPO address this; Kimi's late length penalty `λ` offers online alternative [[source-cs336-lecture15-sft-rlhf]].
- *Generality:* Does squared-loss DPO² (Kimi) work for subjective tasks or only verifiable? How to choose between BT cross-entropy vs squared loss?

## Sources
- [[source-direct-preference-optimization]]
- [[source-deep-dive-into-llms-like-chatgpt]]
- [[source-cs336-lecture15-sft-rlhf]]
- [[source-cs336-lecture16-rlvr]]

## Synthesis

- [[post-training-lineage]] — when the offline objective is the right trade and when it is not

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/fine-tuning/concepts/parameter-efficient-fine-tuning">Parameter-Efficient Fine-Tuning (PEFT)</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
