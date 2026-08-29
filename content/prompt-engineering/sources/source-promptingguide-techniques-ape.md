---
type: source-summary
title: "Prompt Engineering Guide — Automatic Prompt Engineer (APE)"
summary: This short chapter of the DAIR.AI Prompt Engineering Guide summarizes Zhou et al. (2022) Large Language Models Are Human-Level Prompt Engineers (APE).
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.) — based on Zhou et al. (2022)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/ape.en.mdx"
date-published: 2022-11-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - inference
key-concepts:
  - "[[automatic-prompt-engineer]]"
  - "[[prompt-engineering]]"
  - "[[in-context-learning]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-techniques-ape
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This short chapter of the DAIR.AI Prompt Engineering Guide summarizes Zhou et al. (2022) Large Language Models Are Human-Level Prompt Engineers (APE).</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.) — based on Zhou et al. (2022), 2022-11-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/ape.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
This short chapter of the DAIR.AI Prompt Engineering Guide summarizes Zhou et al. (2022) *Large Language Models Are Human-Level Prompt Engineers* (APE). It frames automatic instruction generation as a black-box natural-language optimization problem: an inference LLM generates candidate instructions from output demonstrations, a target LLM executes them, and the highest-scoring instruction is selected. The guide highlights that APE discovered a stronger zero-shot chain-of-thought prompt than the hand-crafted “Let’s think step by step” — namely “Let’s work this out in a step by step way to be sure we have the right answer.” — improving MultiArith and GSM8K, and surveys related optimization work.

## Key Takeaways
1. **APE = generate → execute → select:** An LLM proposes instruction candidates from demos; a (possibly different) target model scores them; search selects the best — no gradients, purely black-box optimization.
2. **LLM as prompt engineer:** The same model family that needs prompting can itself synthesize and search over prompt space, outperforming human intuition.
3. **Better zero-shot CoT found automatically:** APE’s discovered prompt beats Kojima et al.’s “Let’s think step by step” on MultiArith/GSM8K, proving prompt wording matters measurably.
4. **Survey of prompt optimization lineage:** Positions APE alongside Prompt-OIRL (offline inverse RL for query-dependent prompts), OPRO (LLMs as optimizers — “Take a deep breath”), AutoPrompt (gradient-guided discrete search), Prefix Tuning and Prompt Tuning (continuous/soft prompts via backprop).
5. **Practical signal:** Automatic optimization is viable even with frozen black-box APIs; iterative search + evaluation is the core loop.

## Detailed Notes

### APE Framework (Zhou et al., 2022)
- **Problem framing:** Instruction generation = natural language synthesis; treated as black-box optimization over strings using LLMs as generators/searchers.
- **Three steps:**
  1. *Generation:* An inference LLM conditioned on output demonstrations produces diverse instruction candidates.
  2. *Execution:* Candidates are run on a target LLM over task data.
  3. *Selection:* Computed evaluation scores (accuracy/logprob) rank candidates; best is kept. Search can be iterative (e.g., resampling around top candidates, akin to evolutionary search — figure shows feedback loop).
- **Models can be same or different:** Inference vs target may be same family or separated (e.g., larger proposer, cheaper scorer).
- **Figure (APE.png):** Illustrates propose-score-filter loop.

### Result: Improved Zero-Shot CoT
- Human baseline: Kojima et al. 2022 “Let’s think step by step”.
- APE-discovered: “Let’s work this out in a step by step way to be sure we have the right answer.”
- Benchmark lift on MultiArith and GSM8K (screenshot APECOT) — demonstration that small phrasing changes move accuracy.
- Implication: zero-shot CoT is not a single magic phrase; prompt space is searchable.

### Related Work Surveyed
- **Prompt-OIRL (2309.06553):** Offline inverse RL to generate query-dependent prompts.
- **OPRO (2309.03409):** “Optimization by PROmpting” — LLM iteratively proposes and refines prompts given optimization history; example “Take a deep breath and work on this problem step-by-step.”
- **AutoPrompt (Shin et al., 2020):** Gradient-guided search over discrete trigger tokens for diverse tasks.
- **Prefix Tuning (Li & Liang, 2021):** Lightweight alternative to fine-tuning; learns continuous prefix vectors prepended at every layer.
- **Prompt Tuning (Lester et al., 2021):** Learns soft prompts via backpropagation, frozen backbone; scales with model size.

## Notable Quotes
> "The instruction generation problem is framed as natural language synthesis addressed as a black-box optimization problem using LLMs to generate and search over candidate solutions."

> "APE discovers a better zero-shot CoT prompt than the human engineered 'Let's think step by step' prompt."

## Concepts Introduced or Referenced
- [[automatic-prompt-engineer]] — Core framework: LLM-generated instruction search via generate-execute-select.
- [[prompt-engineering]] — APE automates what was manual prompt crafting.
- [[in-context-learning]] — Zero-shot CoT as instruction-only steering vs few-shot exemplars.
- [[thinking-models]] — Antecedent to test-time reasoning scaling; APE optimizes the CoT elicitor itself.

## Critical Assessment
- **Strengths:** Crisp 2-paragraph distillation of APE’s loop; concrete payoff (named improved prompt + benchmarks) makes abstract optimization tangible; valuable mini-survey links discrete, continuous, and LLM-as-optimizer families in one place.
- **Weaknesses:** Extremely brief — no details on search strategy (e.g., filtering, iterative resampling, budget), scoring metric, or cost; figure captions without explanation; no discussion of variance, transferability across models, or overfitting to evaluation set. “Full example coming soon!” never materializes.
- **Contradictions/Overlaps:** Complements [[prompt-design-tips]] (manual heuristics) as its automated counterpart; aligns with [[thinking-models]] and [[inference]] (test-time compute). No contradictions with existing wiki, but continuous-prompt methods (Prefix/Prompt Tuning) blur line between prompting and [[supervised-fine-tuning]] — worth flagging as parameter-efficient tuning, not pure prompting.
- **Next steps:** Link to DSPy/OPRO implementations for programmatic optimization; evaluate discovered prompts’ robustness across models and temperatures.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/ape.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/ape.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/ape.en.mdx)
- Primary paper: Zhou et al. (2022) — https://arxiv.org/abs/2211.01910

---

**Source:** Prompt Engineering Guide — Automatic Prompt Engineer (APE) by DAIR.AI (Elvis Saravia et al.) — based on Zhou et al. (2022) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/ape.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
