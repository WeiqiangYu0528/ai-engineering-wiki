---
type: concept
title: "Chain-of-Thought Prompting"
summary: Chain-of-Thought (CoT) Prompting (Wei et al. 2022, Google Brain) in Chain-of-Thought Prompting Elicits Reasoning in Large Language Models is the technique of prompting a frozen LLM to emit intermediate reasoning steps…
visibility: public
aliases:
  - CoT
  - CoT Prompting
  - Zero-Shot CoT
  - Auto-CoT
  - wiki/chain-of-thought
tags:
  - prompt-engineering
  - llm-fundamentals
  - agents
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-chain-of-thought-prompting-elicits-reasoning]]"
  - "[[source-promptingguide-techniques-cot]]"
  - "[[source-promptingguide-techniques-fewshot]]"
  - "[[source-promptingguide-techniques-consistency]]"
related:
  - "[[self-consistency]]"
  - "[[tree-of-thoughts]]"
  - "[[few-shot-prompting]]"
  - "[[zero-shot-prompting]]"
  - "[[thinking-models]]"
  - "[[prompt-chaining]]"
  - "[[in-context-learning]]"
  - "[[scaling-laws]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Chain-of-Thought (CoT) Prompting (Wei et al. 2022, Google Brain) in Chain-of-Thought Prompting Elicits Reasoning in Large Language Models is the technique of prompting a frozen LLM to emit intermediate reasoning steps…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/self-consistency">Self-Consistency</a></li><li><a href="/prompt-engineering/concepts/tree-of-thoughts">Tree of Thoughts (ToT)</a></li><li><a href="/prompt-engineering/concepts/few-shot-prompting">Few-Shot Prompting</a></li><li><a href="/prompt-engineering/concepts/zero-shot-prompting">Zero-Shot Prompting</a></li><li><a href="/llm-fundamentals/concepts/thinking-models">Thinking Models</a></li><li><a href="/prompt-engineering/concepts/prompt-chaining">Prompt Chaining</a></li><li><a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></li><li><a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-chain-of-thought-prompting-elicits-reasoning">Chain-of-Thought Prompting Elicits Reasoning in Large Language Models</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-cot">Prompt Engineering Guide — Chain-of-Thought Prompting</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-fewshot">Prompt Engineering Guide — Few-Shot Prompting</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-consistency">Prompt Engineering Guide — Self-Consistency</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**Chain-of-Thought (CoT) Prompting** (Wei et al. 2022, Google Brain) in [[source-chain-of-thought-prompting-elicits-reasoning]] is the technique of prompting a frozen LLM to **emit intermediate reasoning steps before the final answer** by showing a few `<input, chain of thought, output>` triples. With just **8 exemplars**, PaLM 540B achieves **new SOTA on GSM8K** surpassing finetuned GPT-3+verifier, and similar emergent lifts appear on SVAMP, MAWPS, StrategyQA and symbolic OOD tasks. CoT is an **emergent ability of scale (~100B+ parameters)** — smaller models produce fluent but illogical chains and underperform standard prompting. The DAIR Guide's parity demo (`Adding all the odd numbers (9,15,1) gives 25. The answer is False.` fixes `15,32,5,13,82,7,1 → 41 → False`) and its **Zero-shot CoT** (`Let's think step by step.` — Kojima 2022) and **Automatic CoT / Auto-CoT** (Zhang 2022: cluster → sample diverse demos) extend the original idea.

## Key Ideas
- **Few-shot CoT (Wei et al. 2022) — Original Formulation:** Each exemplar is `<input, CoT, output>` as in [[source-chain-of-thought-prompting-elicits-reasoning]] Figure 1 (math word problem triple). A *single* prompt set of **8 manually-written CoTs** is used for **all arithmetic benchmarks** (GSM8K, SVAMP, ASDiv, MAWPS) and 4 for AQuA (multiple-choice). Commonsense (CSQA/StrategyQA use train-sampled chains; BIG-bench Date/Sports use first 10 eval examples; SayCan 6 examples) and symbolic (2-word names / 2-flip exemplars testing OOD to 3–4) follow the same pattern (full prompts in Appendix G). Even **K=1** CoT exemplar suffices for the parity demo `15,32,5,13,82,7,1` — proving sample efficiency once the scaffold is shown.
- **Emergence at ~100B (Core Discovery):** CoT is flat/harmful for ≤10B models (PaLM 8B, LaMDA 422M–8B, GPT-3 350M–6.7B), sharply beneficial at 68B–137B LaMDA, 62B–540B PaLM and 175B GPT-3 (Figure 4). Smaller models generate illogical chains. Paper's manual analysis: on LaMDA 137B GSM8K, of 50 correct answers 48 CoTs are correct (2 lucky guesses); of 50 incorrect, 46% are *almost-correct* (calculator/symbol/one-step-missing) and 54% major semantic errors — scaling PaLM 62B→540B fixes most one-step-missing and semantic errors.
- **Largest Gains on Hard Problems:** GSM8K (hardest) >2× gain (PaLM 540B standard ~17% → CoT ~58% SOTA, Figure 2 surpassing finetuned GPT-3 175B + verifier); SingleOp (MAWPS one-step) 0 or negative — CoT helps where stepwise composition is required.
- **Ablations Exclude Trivial Explanations:** *Equation-only* helps only 1–2 step problems, fails on GSM8K semantics; *variable compute only* (dots `…` matching equation length) and *CoT after answer* both match baseline — proving benefit is **sequential linguistic reasoning before the answer**, not just more tokens or knowledge activation (Figure 5, Table 6/7).
- **Robust to Prompt Variation:** Chains by Annotators B/C, a concise solutions-style variant (`"5*4=20 new computers..."`), three random GSM8K-sampled exemplar sets, varied orders/counts — all outperform standard by large margin (Figure 6, Appendix H). Prompt engineering variance exists (cf. Zhao 2021 SST-2 54–93%) but CoT is not brittle.
- **Broad Applicability:** Commonsense: PaLM 540B CoT → StrategyQA 75.6% vs prior SOTA 69.4%, Sports Understanding 95.4% vs 84% human enthusiast (CSQA gains minimal); Symbolic: PaLM 540B CoT → ~100% in-domain on last-letter-2 and coin-flip-2, with upward OOD scaling to length 4 where standard collapses (Figure 7–8).
- **Zero-shot CoT (Kojima 2022) & Auto-CoT (Zhang 2022) — Extensions Beyond Original:** Append `Let's think step by step.` for zero-shot; Auto-CoT automates hand-crafted CoT via clustering → zero-shot CoT per cluster with heuristics (question ~60 tokens, rationale ~5 steps) for diversity/correctness. Both build on the original emergent phenomenon.

## How It Works
```
[Instruction + Task]
[Few-shot CoT demonstrations: Q → CoT rationale → A: <final label>]  (Wei et al. 8 exemplars, Appendix G)
[Query Q_target]
[Output Indicator: A:]  → model mimics derivation format before label (greedy decoding in paper; later self-consistency samples many)
```
1. Tokenized CoT demonstrations encode the *process* pattern (identify odds → sum → parity → answer; or "There were 9 computers... 5*4=20... 9+20=29" for GSM8K) into context via [[in-context-learning]].
2. Self-attention matches query structure to demonstration derivations, conditioning generation to follow the stepwise template and allocate variable compute (more intermediate tokens for harder problems) — ablations prove this linguistic sequentiality matters, not just token count.
3. The model emits its own reasoning trace then the terminal label; downstream ensembling via [[self-consistency]] (Wang et al.: majority vote over many sampled CoTs) and search via [[tree-of-thoughts]] further improve.
4. Zero-shot variant conditions on the trigger phrase `Let's think step by step.` rather than exemplars, leveraging instruction-tuning's compliance.

**Paper's Experimental Setup (for reproducibility):** Models: GPT-3 350M–175B (text-ada-001 → text-davinci-002), LaMDA 422M–137B (5 seeds averaged), PaLM 8B/62B/540B, UL2 20B, Codex code-davinci-002; decoding greedy; exemplars formatted as `Q: ... A: <CoT> The answer is ...` (Figure 3). One prompt set per reasoning family; see Appendix G Table 20–21 for full prompts.

## Practical Implications
- **Largest single lift for reasoning tasks:** GSM8K >2×, StrategyQA +6%, Sports 11% absolute; should be default for any task requiring >1 inference step where model scale ≥100B. For one-step tasks (MAWPS SingleOp, CSQA) CoT may not help — consider skipping.
- **Cost/latency increase:** CoT traces are 5–20× longer than label-only outputs; amplifies token billing and [[inference]] KV-cache load (but enables prefix caching across 8 exemplars). At 540B scale, serving is expensive — smaller instruction-tuned models with Auto-CoT/Zero-shot CoT can be cheaper fallback.
- **Trace verifiability:** Plausible-but-wrong chains remain possible (46% almost-correct errors on LaMDA 137B); pair with verifiers ([[tool-use]] code execution), retrieval ([[retrieval-augmented-generation]] per step), or ensembling ([[self-consistency]] majority vote / [[tree-of-thoughts]] BFS) — Wang et al. shows sampling many CoTs improves over greedy.
- **No training required:** Purely prompting-side in Wei et al. — no [[supervised-fine-tuning]] needed, though [[thinking-models]] (o1/R1) show RL with verifiable rewards (RLVR) on CoT further scales test-time compute and fixes one-step-missing errors via scale.
- **Prompt engineering light-touch:** Don't over-optimize chains — independent annotators, concise solutions-style, and random GSM8K exemplars all work (Figure 6). Focus on correct, stepwise linguistic reasoning before the answer, not just equations.
- **Safety:** Long traces increase prompt-injection surface via [[prompt-injection]] in demonstrated reasoning; no guarantee of correct path — FAQ A.3: evaluate on your task, don't assume benefit.

## Connections
- Builds directly on [[in-context-learning]] / [[few-shot-prompting]] / [[zero-shot-prompting]] (CoT is "few/zero-shot with reasoning slots") and underpins [[self-consistency]] (sample many CoTs) and [[tree-of-thoughts]] (search over CoT thoughts). Emergence is a [[scaling-laws]] phenomenon — standard prompting has flat scaling curves, CoT has rising curves (Figure 4).
- Precursor to [[thinking-models]] and [[reasoning-llms]]: what was prompted is now *trained* via RLVR/RL on CoT (Wei's discussion anticipates costly serving at large scale → later RLVR work). Improves planning in [[tool-use]]/[[agent-components]] and is combined with [[program-aided-language-models]] for executable reasoning.
- Decomposable via [[prompt-chaining]]: multi-step CoT can be split into generate-step / verify-step chains.
- Ground each step via [[retrieval-augmented-generation]] or [[generated-knowledge-prompting]] to reduce hallucinated premises; see [[rag-faithfulness]].
- Extensible to [[automatic-reasoning-and-tool-use]] where CoT is interleaved with tool calls via a retrieved library, and to [[self-consistency]] which the paper notes as follow-up (majority vote over CoTs).

> [!WARNING] Contradiction
> The original [[source-promptingguide-techniques-cot]] summary (Dair Guide) presents CoT as broadly effective, while [[source-chain-of-thought-prompting-elicits-reasoning]] qualifies that **CoT only helps at ~100B+ scale and on multi-step tasks** — for small models and one-step problems (e.g., MAWPS SingleOp, CSQA minimal gain) it can be flat or harmful. Needs resolution per task complexity and model scale.

## Open Questions
- Is CoT's benefit primarily from extended test-time compute (more tokens to think) or from structured decomposition? Paper's variable-compute-only ablation (dots) suggests decomposition matters.
- Can we automatically verify CoT premises (fact-check, arithmetic execution) without human step supervision? Scaling 62B→540B fixes semantic errors but not all.
- How to distill CoT into shorter traces without losing accuracy (cost vs quality frontier)?
- Does stepwise language reflect true model computation or post-hoc rationalization? Wei et al. leave "is the network actually reasoning?" open.

## Sources
- [[source-chain-of-thought-prompting-elicits-reasoning]]
- [[source-promptingguide-techniques-cot]]
- [[source-promptingguide-techniques-fewshot]]
- [[source-promptingguide-techniques-consistency]]

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/prompt-engineering/concepts/self-consistency">Self-Consistency</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
