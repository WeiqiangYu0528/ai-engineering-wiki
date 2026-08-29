---
type: concept
title: "Self-Consistency"
summary: Self-Consistency (Wang et al. 2022, Google Brain, ICLR 2023) in Self-Consistency Improves Chain of Thought Reasoning in Language Models upgrades Chain-of-Thought Prompting by replacing greedy decoding with sampling…
visibility: public
aliases:
  - Self-Consistency Decoding
  - Universal Self-Consistency
  - SC
  - wiki/self-consistency
tags:
  - prompt-engineering
  - agents
  - inference
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-self-consistency-improves-chain-of-thought-reasoning]]"
  - "[[source-promptingguide-techniques-consistency]]"
  - "[[source-promptingguide-techniques-cot]]"
  - "[[source-chain-of-thought-prompting-elicits-reasoning]]"
related:
  - "[[chain-of-thought]]"
  - "[[decoding-strategies]]"
  - "[[tree-of-thoughts]]"
  - "[[thinking-models]]"
  - "[[few-shot-prompting]]"
  - "[[in-context-learning]]"
  - "[[scaling-laws]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Self-Consistency (Wang et al. 2022, Google Brain, ICLR 2023) in Self-Consistency Improves Chain of Thought Reasoning in Language Models upgrades Chain-of-Thought Prompting by replacing greedy decoding with sampling…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></li><li><a href="/inference/concepts/decoding-strategies">Decoding Strategies</a></li><li><a href="/prompt-engineering/concepts/tree-of-thoughts">Tree of Thoughts (ToT)</a></li><li><a href="/llm-fundamentals/concepts/thinking-models">Thinking Models</a></li><li><a href="/prompt-engineering/concepts/few-shot-prompting">Few-Shot Prompting</a></li><li><a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></li><li><a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-self-consistency-improves-chain-of-thought-reasoning">Self-Consistency Improves Chain of Thought Reasoning in Language Models</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-consistency">Prompt Engineering Guide — Self-Consistency</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-cot">Prompt Engineering Guide — Chain-of-Thought Prompting</a></li><li><a href="/prompt-engineering/sources/source-chain-of-thought-prompting-elicits-reasoning">Chain-of-Thought Prompting Elicits Reasoning in Large Language Models</a></li></ul></nav>
</aside>

## Overview
**Self-Consistency** (Wang et al. 2022, Google Brain, ICLR 2023) in [[source-self-consistency-improves-chain-of-thought-reasoning]] upgrades **[[chain-of-thought]]** by **replacing greedy decoding with sampling**: generate **$m=40$ diverse CoT reasoning paths** from the same few-shot CoT prompt (Wei et al. 8 exemplars), then **select the most consistent answer** by majority vote ($\arg\max_a \sum_i \mathbb{1}[a_i=a]$, marginalizing over $r_i$). Evaluated on **PaLM-540B, GPT-3 175B (Codex), LaMDA-137B, UL2-20B** across 15 reasoning benchmarks, it yields **+17.9% on GSM8K** (56.5→74.4 PaLM, 60.1→78.0 GPT-3), **+11.0% SVAMP**, **+12.2% AQuA**, **+6.4% StrategyQA**, **+3.9% ARC-challenge**, achieving new SOTA without training, verifier, or re-ranker. The DAIR Guide's `When I was 6 my sister was half my age. Now I'm 70…` demo (greedy → `35` wrong; sampled 67/67/35 → majority `67` correct) illustrates the same lift purely via decoding-side ensemble.

## Key Ideas
- **Intuition:** Correct reasoning tends to **converge** to the same answer via different derivations ("$60-20-15=25$" vs "$60-15=45,45-20=25$"); errors scatter (greedy $60-20=40$ wrong) — voting amplifies signal, suppresses noise, analogous to human confidence when multiple reasonings agree.
- **Formal Mechanism:** Sample $m$ paths $(r_i,a_i) \sim P(r,a\mid\text{prompt},q)$ via temperature $T\!=\!0.5$–$0.7$, top-$k\!=\!40$ (or nucleus). Parse $a_i$ after `The answer is`. Aggregate by majority; paper proves **majority (= unweighted sum) ≈ normalized weighted sum** ($\exp(\frac1K\sum\log P)$) and far exceeds unnormalized or averaged variants (Table 1: GSM8K majority 74.4 vs unnormalized 59.9 vs avg 22.1) because model probabilities are **miscalibrated and similarly close** — simple voting is optimal.
- **Gains Scale with Model & Samples:** Larger models benefit more (+3–6% UL2 vs +9–23% LaMDA/GPT-3) where reasoning is emergent; sampling more paths 1→5→10→20→40 monotonically improves (Figure 2) with diminishing returns; even 5–10 paths already beats greedy substantially.
- **Helps When CoT Hurts:** On tasks where CoT greedy *hurts* vs standard prompting (ANLI-R1 69.1→68.8, e-SNLI 85.8→81.0, RTE 84.8→79.1), self-consistency recovers and **exceeds standard**: ANLI-R1 78.5, e-SNLI 88.4, RTE 86.3, BoolQ 78.4 — making CoT reliably beneficial (Table 5).
- **Outperforms Alternatives:** Vs **sample-and-rank** (pick top log-prob) far better with same samples (Figure 3); vs **beam search** (UL2 AQuA beam 10.2% vs SC 26.9%) because beams lack diversity; vs **prompt-order/multi-prompt ensembles** (+1.5–3% vs SC +10.6% on GSM8K LaMDA) and **model ensembles** (Appendix A.1.3).
- **Robustness:** Insensitive to $T/k/p$ sweeps, to imperfect prompts (random numbers in CoT: greedy 17.1→14.9, SC recovers to 23.4), to equation-only reasoning (5.0→6.5) and to **zero-shot CoT** (Kojima: PaLM 43.0→69.2). Consistency % correlates strongly with accuracy (Figure 5) → provides **uncertainty signal** ("knows when it doesn't know").
- **Scope:** Requires fixed answer set with parseable `The answer is` format; extensible to open-ended via consistency metric (agreement/contradiction). Unsupervised, no verifier (Cobbe 2021) or re-ranker (Thoppilan 2022).

## How It Works
```
Prompt: [8 few-shot CoT exemplars (Wei et al.) + target Q: When I was 6… / Henry 60-mile bike… / Albany Georgia?]
  ├─ Sample 1 (T=0.7,k=40): "Henry 60-20-15=25 → 25" / "Albany NY 95k > GA 88k → no"
  ├─ Sample 2 (T=0.7,k=40): "Second stop 60-15=45, 45-20=25 → 25" (different path, same answer)
  └─ Sample 3 (T=0.7,k=40): "60-20=40 → 40" (flawed greedy-like, scattered)
Vote: 25 appears 2/3 (GSM8K/ StrategyQA Table 4) → final answer 25 / no
```
1. Fix the prompt (same Wei et al. 8 CoT exemplars); set [[llm-settings]] to enable diversity — UL2/LaMDA $T=0.5,k=40$, PaLM $T=0.7,k=40$, GPT-3 $T=0.7$ per paper; sample $m=40$ via [[decoding-strategies]] temperature/top-$k$/nucleus.
2. Call `generate` $m$ times; each completion follows a distinct reasoning chain; parse terminal answers after `The answer is` (numeric for arithmetic, string for commonsense) — Table 4 examples show PaLM-540B greedy 40 vs sampled 25/25 convergence.
3. Tally frequencies; majority wins — equivalent to marginalizing $\sum_{r} P(r,a\mid\text{prompt})$; normalized weighted sum is empirically equal, so majority suffices.

**Setup from paper:** 40 paths × 10 runs averaged (std ≤0.5); same prompts as Wei et al. for fair comparison; parsing rule task-dependent; full prompt sets in Appendix A.3.

## Practical Implications
- **Free accuracy on reasoning tasks:** GSM8K +17.9%, SVAMP +11.0%, AQuA +12.2%, StrategyQA +6.4%, ARC-c +3.9% **with zero new prompt engineering** — only extra inference calls; achieves new SOTA unsupervised vs task-specific finetuned models on GSM8K/SVAMP/MAWPS.
- **Cost/latency tradeoff:** $m=40$ × CoT length → major billing/KV-cache impact (PaLM 540B 40×); budget via $m$ tuning (1→5→10→20→40 curve) or early-stop once majority is confident or consistency low (uncertainty signal).
- **Robustness tax saver:** Makes CoT deployable on imperfect prompts and even zero-shot CoT (+26.2% PaLM) without manual correction — greedy would degrade.
- **No guarantee against systematic bias:** If model is systematically biased (all paths reflect same misconception), majority remains wrong — verifier or external tool needed (→ [[tool-use]] / [[retrieval-augmented-generation]]).
- **Reproducibility:** Must log $T,k,m$ and parsing rule; greedy vs sampled distinction must be explicit for benchmarking; beam search is *not* a substitute due to diversity collapse.
- **Relation to thinking models:** Modern [[thinking-models]] (o1/R1) internalize sampling/search via RLVR, partially obviating external SC scaffolding, but SC remains cheapest upgrade for API models and is complementary to verifier re-rankers.

## Connections
- Directly extends [[chain-of-thought]] (Wei et al. 2022 → Wang et al. 2022 is the immediate follow-up using same 8 exemplars); SC without CoT has little diversity to vote over, and CoT's emergent ~100B threshold applies — small models see +3–6% vs +9–23% for larger (Section 3.5 scaling plot).
- Depends on [[decoding-strategies]] (temperature/top-$k$/nucleus) and [[llm-settings]]; paper's settings are the canonical self-consistency sampling recipe, contrasting with greedy and beam search (both inferior due to low diversity / local optimality).
- Contrasts with [[tree-of-thoughts]]: SC votes over *independent* chains without search/backtracking/evaluation; ToT adds BFS/evaluative search over *partial* thoughts and controller.
- Test-time scaling family alongside [[thinking-models]] — SC is the simplest form of **inference-time compute scaling**, foreshadowing RLVR test-time scaling; can be combined with [[generated-knowledge-prompting]] / [[retrieval-augmented-generation]] (sample multiple knowledge-grounded CoTs and vote).

> [!WARNING] Contradiction
> [[source-chain-of-thought-prompting-elicits-reasoning]] uses **greedy decoding** for all CoT evaluations (Figure 4), while [[source-self-consistency-improves-chain-of-thought-reasoning]] explicitly **replaces greedy with sampled marginalization** and shows greedy is suboptimal (up to -17.9% on GSM8K). The two should be read as sequential: Wei's emergent CoT gain is a *lower bound*; Wang's sample-and-marginalize is the strictly dominant decoder for fixed-answer reasoning.

## Open Questions
- How to optimally choose $m$ and temperature for a given task budget (diminishing returns curve 1→40)? Figure 2's 40-path optimum may be task-dependent; can early-exit on high consistency save cost?
- Can weighted scoring incorporating chain confidence outperform raw majority vote? Paper's Table 1 says normalized weighted sum ≈ majority due to miscalibration, but learned verifiers (Cobbe) might break the tie.
- Does SC calibration generalize to non-verifiable/open-ended domains (creative/nuanced) where fixed answer set and `The answer is` parsing don't apply — can consistency metric be defined via contradiction/entailment?
- At what scale does SC's +17.9% saturate vs further RL-based thinking model training?

## Sources
- [[source-self-consistency-improves-chain-of-thought-reasoning]]
- [[source-promptingguide-techniques-consistency]]
- [[source-promptingguide-techniques-cot]]
- [[source-chain-of-thought-prompting-elicits-reasoning]]

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/prompt-engineering/concepts/tree-of-thoughts">Tree of Thoughts (ToT)</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
