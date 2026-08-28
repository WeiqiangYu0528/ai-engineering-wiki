---
type: source-summary
title: "ReAct: Synergizing Reasoning and Acting in Language Models"
summary: The October 2022 (v3 Mar 2023) Google Research/Princeton paper by Yao et al. (ICLR 2023) that introduces ReAct — a prompting paradigm that synergizes reasoning traces ($\mathcal{L}$) and task actions ($\mathcal{A}$) in…
status: draft
visibility: public
author: "Shunyu Yao, Jeffrey Zhao, Dian Yu, Nan Du, Izhak Shafran, Karthik Narasimhan, Yuan Cao (Princeton & Google Research)"
source-type: paper
url: "https://arxiv.org/abs/2210.03629"
date-published: 2022-10-06
date-ingested: 2026-08-24
tags:
  - agents
  - prompt-engineering
  - rag
  - llm-fundamentals
key-concepts:
  - "[[react]]"
  - "[[chain-of-thought]]"
  - "[[self-consistency]]"
  - "[[tool-use]]"
  - "[[retrieval-augmented-generation]]"
key-entities:
  - "[[google-research]]"
---

# ReAct: Synergizing Reasoning and Acting in Language Models

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 1 of 47 figures on this page were not found in [https://arxiv.org/abs/2210.03629](https://arxiv.org/abs/2210.03629): `10.6%`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The **October 2022 (v3 Mar 2023) [[google-research]]/Princeton paper** by Yao et al. (ICLR 2023) that introduces **ReAct** — a prompting paradigm that **synergizes reasoning traces ($\mathcal{L}$) and task actions ($\mathcal{A}$) in an interleaved manner** by augmenting the action space to $\hat{\mathcal{A}}=\mathcal{A}\cup\mathcal{L}$ (thoughts don't affect environment, only context). Evaluated on **knowledge-intensive reasoning** (HotpotQA multi-hop QA, Fever fact verification with a simple Wikipedia API: `search[entity]`→5 sentences/suggestions, `lookup[string]`→next sentence, `finish[answer]`) and **decision-making** (ALFWorld text-game 6 task types >50 steps, WebShop 1.18M products/12k instructions), ReAct with **PaLM-540B** (also GPT-3, LaMDA, UL2) using only **1–6 in-context examples** outperforms **CoT (reason-only)** and **Act (act-only)** baselines and **imitation/RL** methods trained on $10^3$–$10^5$ trajectories, while improving interpretability (distinguishable internal vs external knowledge) and enabling **finetuning** (PaLM-8B finetuned ReAct > all PaLM-62B prompting; PaLM-62B ReAct > all 540B prompting). The best overall prompting is **ReAct→CoT-SC** and **CoT-SC→ReAct** hybrid (back-off when one fails), and ablations show reasoning helps acting (10.6% gain) and acting grounds reasoning (hallucination 14%→6% false-positive).

## Key Takeaways
1. **Augmented Action Space $\hat{\mathcal{A}}$:** At step $t$, context $c_t=(o_1,a_1,\dots,o_t)$ maps to $a_t\in\mathcal{A}$ (tool) or $\hat{a}_t\in\mathcal{L}$ (thought). Thoughts decompose goals, inject commonsense, track progress, handle exceptions, guide search reformulation — dense for QA (thought-action-observation alternation) vs **sparse** for decision tasks (model decides when to think).
2. **Knowledge-Intensive Setup (PaLM-540B, same 8 HotpotQA / 3 Fever CoT exemplars):** Wikipedia API is intentionally weak (exact-entity 5-sentence windows vs neural retriever) to force explicit reasoning-to-retrieve synergy. Baselines: Standard, CoT, CoT-SC (21 samples, temp 0.7, majority vote), Act (ReAct without thoughts, like WebGPT).
3. **HotpotQA/Fever Results (Table 1 EM/Acc):** PaLM-540B prompting — Standard 28.7/57.1, CoT 29.4/56.3, CoT-SC 33.4/60.4, Act 25.7/58.9, ReAct 27.4/60.9, **CoT-SC→ReAct 34.2/64.6, ReAct→CoT-SC 35.1/62.0** vs supervised SOTA 67.5/89.5. ReAct consistently > Act (+10.6% on HotpotQA via reasoning guidance), and hallucination false-positive halved (CoT 14% vs ReAct 6%) with grounding, though ReAct introduces **repetitive loop** reasoning errors (47% of failures) and **non-informative search** (23%).
4. **Hybrid Internal+External Knowledge Wins:** CoT excels at reasoning structure but hallucinates facts (56% of CoT failures are hallucinations); ReAct is factual but less flexible. Combined heuristics (fall back when ReAct hits step limit 7/5 steps, or CoT-SC majority < n/2) yields best prompting and reaches CoT-SC-21 performance with only 3–5 CoT-SC samples.
5. **Finetuning Scales ReAct Further:** With 3k bootstrapped correct ReAct trajectories (Zelikman-style), **PaLM-8B finetuned ReAct > all PaLM-62B prompting**, **PaLM-62B ReAct > all 540B prompting** — teaching to *act+reason* generalizes better than memorizing facts (Standard/CoT finetuning far worse). Suggests prompting is lower bound; multi-task finetuning could unlock more.
6. **Decision Tasks — Outperforming Trained Agents with Few-Shot:** 
   - **ALFWorld** (134 unseen games, 6 task types, >50 steps): ReAct **71% avg success (best-of-6, 57% avg)** vs Act 45%, ReAct-IM (dense Inner Monologue) 53%, BUTLER (IL on 100k) 37%, BUTLERg 22%. Advantage over Act 33–90% (avg 62%) across 6 trials; sparse thoughts crucial vs IM's state-feedback only (ReAct 71 vs IM 53 due to goal decomposition & commonsense location reasoning).
   - **WebShop** (500 test, score/SR): ReAct 66.6/40.0 vs Act 62.3/30.1 vs IL 59.9/29.1 vs IL+RL 62.4/28.7 vs human 82.1/59.6 — **+10% absolute SR** over best trained, bridging noisy product descriptions via reasoning.
7. **Design & Limitations:** Prompting is intuitive (humans just write thoughts atop actions, no format tuning), general (QA/WebShop/text-game), robust (one-to-six examples), interpretable/controllable (thought editing in ALFWorld Figure 5). Limitations: limited support for reasoning/acting behaviors under prompting (needs finetuning for complex action spaces), repetitive loops due to greedy decoding, knowledge retrieval via weak API may miss info.

## Detailed Notes

### Motivation (Section 1)
- Human inner speech (Vygotsky, Luria, Alderson-Day) for self-regulation/working memory — analogy to cooking: plan, handle exceptions, search recipe. CoT alone is static black-box (hallucination/error propagation Fig1 1b), Act alone lacks reasoning for planning (Fig1 2a hallucinated peppershaker). ReAct interleaves Figure1 1d/2b.

### Method (Section 2)
- Formalism $c_t\mapsto a_t$, thought $\hat{a}_t$ updates $c_{t+1}=(c_t,\hat{a}_t)$; examples of thought types listed; PaLM-540B prompted with human trajectories (Appendix C), GPT-3 in A.1 also; easy prompt design, no ad-hoc format.

### Experiments Detail (Section 3–4 + Appendix)
- **HotpotQA/Fever:** question-only (no paragraphs), Wikipedia API details, 6/3 exemplars, CoT-SC 21 samples temp 0.7, sampling T=0.5–0.7 top-k40 for ReAct; finetuning B.1; results Table1/2 failure mode human analysis 50 samples each; Figure2/3 scaling.
- **ALFWorld:** 6 prompts per task type (permutations of 3 annotated→2), BUTLER IL 100k, WebShop IL 1,012 + RL 10,587; prompts in C.3/C.4, trajectories D.2/D.3, analysis E.1 success/failure, human-in-the-loop correction A.3, GPT-3 A.1 shows also >PaLM.

### Related Work
- Reasoning: CoT, least-to-most, zero-shot-CoT, self-consistency, selection-inference, STaR, faithful reasoning, scratchpad.
- Decision: WebGPT, BlenderBot/Sparrow, SimpleTOD, SayCan/Inner Monologue, generalist agents Reed 2022 — ReAct cheaper than RL/human feedback, closed-loop first.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 5 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2210.03629](https://arxiv.org/abs/2210.03629)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "ReAct prompts LLMs to generate both verbal reasoning traces and actions pertaining to a task in an interleaved manner, which allows the model to perform dynamic reasoning to create, maintain, and adjust high-level plans for acting (reason to act), while also interact with the external environments to incorporate additional information into reasoning (act to reason)."

> "The best approach overall is a combination of ReAct and CoT that allows for the use of both internal knowledge and externally obtained information during reasoning."

> "With just 3,000 finetuning examples, PaLM-8B ReAct outperforms all PaLM-62B prompting methods, and PaLM-62B ReAct outperforms all 540B prompting methods."

> "On ALFWorld and WebShop, two or even one-shot ReAct prompting is able to outperform imitation or reinforcement learning methods trained with $10^3$–$10^5$ task instances, with an absolute improvement of 34% and 10% in success rates respectively."

> "ReAct substantially outperforms IM-style prompting (71 vs 53 overall success rate), with consistent advantages on five out of six tasks."

## Concepts Introduced or Referenced
- [[react]] — Core paradigm: $\hat{\mathcal{A}}$, dense vs sparse thoughts, synergy reason↔act, interpretability, human-in-the-loop editing.
- [[chain-of-thought]] — Reasoning-only baseline; ReAct vs CoT table (ReAct more grounded, CoT more flexible); least-to-most/zero-shot-CoT/self-consistency discussed.
- [[tool-use]] — Wikipedia API (search/lookup/finish), WebShop/ALFWorld text actions, sandboxed execution vs language-prior planning.
- [[retrieval-augmented-generation]] — Wikipedia retrieval as external knowledge to curb hallucination (vs CoT internal knowledge).
- [[self-consistency]] — CoT-SC baseline (21 samples, majority vote) used throughout; hybrid ReAct+CoT-SC best.

## Critical Assessment
- **Strengths:** Landmark unification — first to show **prompting alone** can beat $10^5$-trajectory IL/RL on decision tasks while also grounding QA, with systematic ablations (ReAct vs Act vs CoT vs CoT-SC vs IM), hybrid internal/external combination, and finetuning scaling that hints prompting is lower bound. Interpretability via distinguishable $r$ vs $obs$ is compelling for trustworthiness. Project page with code and replicable Wikipedia API is unusually complete. CC-BY 4.0.
- **Limitations:** Few-shot prompting's context-length ceiling limits demonstrations for large action spaces (ALFWorld needs 3 per type, still fails on Pick2 41%); repetitive loop errors (47% ReAct failures) suggest greedy decoding suboptimal — beam search might help; Wikipedia API is artificially weak (exact-entity) vs modern retrievers; HotpotQA labels sometimes outdated (Figure4); finetuning uses only 3k bootstrapped trajectories — not scaled to multi-task. No direct comparison to program-aided (PAL) or tool-use RAG pipelines.
- **Wiki Integration:** Fills the **origins** of [[react]] — the PromptingGuide bulk had only the Dair summary (Wei-adjacent, tool-loop definition); this is the primary source with full ablations, API, and finetuning scaling. No contradictions; complements [[source-chain-of-thought-prompting-elicits-reasoning]] (reason-only) and [[source-self-consistency-improves-chain-of-thought-reasoning]] (greedy vs sampling) by adding *acting*. Should be cited alongside [[tool-use]] and [[ai-agents]] as the canonical ReAct paper.

---

**Source:** ReAct: Synergizing Reasoning and Acting in Language Models by Shunyu Yao, Jeffrey Zhao, Dian Yu, Nan Du, Izhak Shafran, Karthik Narasimhan, Yuan Cao (Princeton & Google Research) — <https://arxiv.org/abs/2210.03629>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
