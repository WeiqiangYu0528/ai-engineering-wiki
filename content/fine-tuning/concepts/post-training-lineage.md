---
type: synthesis
title: "Post-Training Lineage: What Actually Replaced What"
summary: "SFT, RLHF, DPO and RLVR are usually told as a succession, but the frontier recipes compose them; the real selector is whether you have a verifier."
visibility: public
status: draft
tags:
  - fine-tuning
  - eval-safety
created: 2026-08-27
updated: 2026-08-27
sources:
  - "[[source-training-language-models-to-follow-instructions-with-human-feedback]]"
  - "[[source-direct-preference-optimization]]"
  - "[[source-cs336-lecture15-sft-rlhf]]"
  - "[[source-cs336-lecture16-rlvr]]"
  - "[[source-deepseek-r1]]"
  - "[[source-scaling-instruction-finetuned]]"
  - "[[source-how-far-can-camels-go]]"
  - "[[source-lets-verify-step-by-step]]"
  - "[[source-alpacafarm]]"
related:
  - "[[supervised-fine-tuning]]"
  - "[[rlhf]]"
  - "[[direct-preference-optimization]]"
  - "[[reasoning-llms]]"
  - "[[alignment]]"
  - "[[evaluation]]"
aliases:
  - wiki/post-training-lineage
---

<aside class="kb-header kb-type-synthesis" aria-label="Page information">
<p class="kb-type">Synthesis</p>
<p class="kb-summary">SFT, RLHF, DPO and RLVR are usually told as a succession, but the frontier recipes compose them; the real selector is whether you have a verifier.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/fine-tuning/concepts/lora">Low-Rank Adaptation (LoRA)</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/fine-tuning/concepts/supervised-fine-tuning">Supervised Fine-Tuning</a></li><li><a href="/fine-tuning/concepts/rlhf">Reinforcement Learning from Human Feedback</a></li><li><a href="/fine-tuning/concepts/direct-preference-optimization">Direct Preference Optimization</a></li><li><a href="/agents/concepts/reasoning-llms">Reasoning LLMs</a></li><li><a href="/fine-tuning/concepts/alignment">AI Alignment</a></li><li><a href="/eval-safety/concepts/evaluation">Evaluation</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/fine-tuning/sources/source-training-language-models-to-follow-instructions-with-human-feedback">Training language models to follow instructions with human feedback</a></li><li><a href="/fine-tuning/sources/source-direct-preference-optimization">Direct Preference Optimization: Your Language Model is Secretly a Reward Model</a></li><li><a href="/fine-tuning/sources/source-cs336-lecture15-sft-rlhf">CS336 Lecture 15 — After Pretraining: Mid/Post-training, SFT and RLHF (Tatsu Hashimoto)</a></li><li><a href="/fine-tuning/sources/source-cs336-lecture16-rlvr">CS336 Lecture 16 — Post-training 2: Reinforcement Learning from Verifiable Rewards (Tatsu Hashimoto)</a></li><li><a href="/llm-fundamentals/sources/source-deepseek-r1">DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning</a></li><li><a href="/fine-tuning/sources/source-scaling-instruction-finetuned">Scaling Instruction-Finetuned Language Models</a></li><li><a href="/fine-tuning/sources/source-how-far-can-camels-go">How Far Can Camels Go? Exploring the State of Instruction Tuning on Open Resources</a></li><li><a href="/eval-safety/sources/source-lets-verify-step-by-step">Let's Verify Step by Step</a></li><li><a href="/fine-tuning/sources/source-alpacafarm">AlpacaFarm: A Simulation Framework for Methods that Learn from Human Feedback</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Thesis

The usual telling is a relay race: instruction tuning hands off to RLHF, RLHF is
superseded by DPO because DPO is simpler, and DPO is superseded by RLVR because reasoning
models need reinforcement learning again. **That story is wrong, and the evidence against
it is inside this wiki.** The frontier recipes do not pick one rung; they stack several,
often revisiting an earlier one after a later one. What actually changed across the four
techniques is not quality but *what supplies the training signal* — a human writing an
answer, a human ranking two answers, a closed-form preference objective, or a program that
checks whether the answer is right. Once framed that way, the selection rule is not
chronological. It is: **do you have a verifier?**

## The four signals, not four eras

| Stage | Signal | Cost per example | Ceiling |
| --- | --- | --- | --- |
| [[supervised-fine-tuning]] | a human writes the target output | highest | the annotator's own ability |
| [[rlhf]] | a human ranks two outputs | lower | the reward model's fidelity |
| [[direct-preference-optimization]] | the same rankings, no reward model or rollouts | lower still | the fixed preference dataset |
| RLVR (see [[reasoning-llms]]) | a program verifies the answer | near zero once built | what is mechanically checkable |

The progression is driven by cost and ceiling, and each step trades one for the other.
[[rlhf]] exists because of an asymmetry recorded on that page: ranking two responses is
far easier than authoring a flawless one, and — per Zhang's summarization result cited
there — humans *prefer* model summaries over the ones humans wrote. That is the moment
imitation stops being the ceiling and optimization becomes worth its complexity.

## Where the succession story breaks

Three pieces of evidence in this vault contradict "each replaced the last":

**DeepSeek-R1 goes back and forth.** [[source-deepseek-r1]] runs SFT → GRPO → SFT/RLHF.
Reinforcement learning does not replace supervised fine-tuning there; SFT is used again
*after* RL, to fold the RL-discovered behaviour back into a well-behaved assistant. The
same pattern appears in the recipes summarized on [[rlhf]] for Kimi and Qwen3.

**DPO's simplicity is conditional.** [[source-direct-preference-optimization]] removes the
reward model and the rollouts, which is a real reduction in machinery. But it is offline:
it can only express preferences present in a fixed dataset, and it cannot discover
behaviour by exploration. [[source-alpacafarm]] reports DPO unfavourably at 7B, and the
page notes that later work with better hyperparameters reversed that finding — which is
itself the lesson. A result about an *algorithm* was really a result about a *tuning
budget*.

**Instruction tuning never left.** [[source-scaling-instruction-finetuned]] (FLAN) shows
task-count scaling to 1.8K tasks, and [[source-how-far-can-camels-go]] shows that
instruction-tuning data choice dominates outcomes — including that evaluation win rates
correlate strongly with response *length*, a confound rather than a capability. Neither
finding is obsoleted by RLHF; both constrain what SFT stage you feed into it.

## The verifier is the real axis

RLVR is not "RL, again". It is the discovery that when a program can check the answer, the
expensive part of RLHF — modelling human judgement — disappears.
[[source-cs336-lecture16-rlvr]] frames the ascent from RLHF-era assistants to
reasoning-era models in exactly these terms, and [[source-lets-verify-step-by-step]]
supplies the sharper version: process supervision beats outcome supervision (78.2% vs
72.4% on that page's comparison), because checking each step is a stronger verifier than
checking the final answer.

This gives a practical rule that the chronological story cannot:

- **Verifiable domain** (maths, code, formal tasks) → build the verifier, use RLVR. The
  signal is cheap and the ceiling is high.
- **Judgement domain** (tone, helpfulness, safety, taste) → you are stuck modelling human
  preference. Use rankings, via [[rlhf]] if you can afford exploration, [[direct-preference-optimization]] if you cannot.
- **Neither** → you are still in imitation. Improve the data before touching the
  algorithm, which is what [[source-how-far-can-camels-go]] measured.

## What follows for reading this wiki

[[alignment]] and [[reasoning-llms]] are usually filed as separate topics, and that split
is an artifact of the literature rather than of the problem: both are post-training with
different verifiers. [[evaluation]] is not a downstream concern either — the length
confound above means a weak evaluator silently rewrites what your post-training optimises
for.

## Open questions

- Does the SFT → RL → SFT cycle converge, or is the second SFT pass simply repairing
  damage the RL stage caused? [[source-deepseek-r1]] reports the recipe but not the
  ablation that would answer this.
- How far do verifiers generalise past mathematics and code? Every RLVR result in this
  vault lives in a domain with a cheap checker.
- Does process supervision remain worth its annotation cost as base models get stronger,
  or does the gap in [[source-lets-verify-step-by-step]] shrink with scale? Not tested here.

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
