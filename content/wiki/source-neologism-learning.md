---
type: source-summary
title: "Neologism Learning for Controllability and Self-Verbalization"
summary: The Oct 2025 paper by Hewitt, Tafjord, Geirhos & Kim (Google DeepMind, arXiv 2510.08506, CS224n Week 8 Tue — Interpretability remaining) provides the first in-depth empirical evaluation of neologism learning (the Feb…
status: draft
visibility: public
author: "John Hewitt, Oyvind Tafjord, Robert Geirhos, Been Kim"
source-type: paper
url: "https://arxiv.org/abs/2510.08506"
date-published: 2025-10-09
date-ingested: 2026-08-25
tags:
  - eval-safety
  - llm-fundamentals
key-concepts:
  - "[[interpretability]]"
  - "[[alignment]]"
  - "[[evaluation]]"
  - "[[ai-ethics]]"
key-entities:
  - "[[google-research]]"
---

# Neologism Learning for Controllability and Self-Verbalization

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 1 of 27 figures on this page were not found in [https://arxiv.org/abs/2510.08506](https://arxiv.org/abs/2510.08506): `2.00`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The Oct 2025 paper by Hewitt, Tafjord, Geirhos & Kim (Google DeepMind, arXiv 2510.08506, CS224n Week 8 Tue — Interpretability remaining) provides the **first in-depth empirical evaluation** of [[source-we-cant-understand-ai-vocabulary|neologism learning]] (the Feb 2025 position paper): freeze an LLM entirely, expand its vocabulary with new word embeddings, and train *only* those embeddings on examples exhibiting a target concept. On Gemma-3-4B-IT, neologisms robustly steer seven simple concepts (text length, single-sentence, "like"-usage, flattery, refusal, wrong answers) plus complex AxBench concepts, closing **92% of the base→training-data behavior gap** on average. Two discoveries go beyond control: (1) **self-verbalization** — models can describe in natural language what a learned neologism means to them (e.g., wrong-answer token = "a lack of complete, coherent, or meaningful answers… a digital shrug"), validated by **plug-in evaluation** (substituting the verbalization for the token and measuring whether steering persists); and (2) **machine-only synonyms** — ordinary English words that look unrelated to humans yet reliably trigger the concept across models ("lack" shortens Gemma responses 42.9→15.8 sentences and Gemini-2.5-Flash 37→4 median). Joint learning of multiple neologisms (short, numerical, likely-under-Gemini) outperforms few-shot prompting, especially for the complex "likely" concept (0.667 vs 0.281 success).

## Key Takeaways
1. **Method scales the position-paper proof-of-concept**: k new tokens c₁…c_k ∉ V, expanded embeddings E′ ∈ ℝ^{d×(|V|+k)} initialized from semantically neutral words (" accurate", " single"), model θ fully frozen, output distribution still over original V (neologisms never generated). Data: LIMA instructions + strong-LLM (Gemini-2.5-Pro/Flash) responses exhibiting the concept; rejected = default behavior. Loss: **APO-up** (D'Oosterlinck 2025 DPO variant) beats plain NLL, adding absolute-likelihood term for chosen response. Distributional-hypothesis framing (Firth): meaning of new word = its co-occurring contexts.
2. **Control is strong and cheap**: 700 LIMA questions ×3 samples = 2,100 instances per concept. Gap-closure vs base→training delta: short-text 105%, single-sentence 98%, use-like 103%, flattery 103%, refusal 95%, wrong-answer 103%, long-text 36% (avg **92%**). Works for AxBench complex concepts too (4/5 concepts at-or-above training-data quality; concept score 2.00/2, overall up to 1.92). In-context alternative (10 examples in prompt) falls far short for Gemma despite Gemini-2.5-Pro succeeding — embedding learning ≠ prompting.
3. **Self-verbalization**: asking the *unchanged* model about its neologism ("List 10 synonyms for {neologism}"; 12-question questionnaire: "describe what {neologism} responses are…") yields usable meta-descriptions — a form of out-of-context generalization (cf. Betley et al. 2025a "LLMs are aware of their learned behaviors"). Questionnaire verbalizations synthesized by Gemini-2.5-Flash close 83% of the gap on average (short 110%, wrong 127%, flattery 100%) — sometimes matching the trained token itself.
4. **Machine-only synonyms**: plug-in-evaluated synonyms causally reproduce neologism behavior though they seem unrelated to humans — "lack" (brevity), "unrivaled"/"unmatched" (flattery), "nonfunctional" (wrong-answer, 44%), "identical"/"precise" (short, 57%/48%). Best-synonym average 39%. Implication: model-internal word semantics diverge systematically from human semantics — direct empirical support for the M−H conceptualization gap; also transfers cross-model (Gemma-trained synonym works on Gemini-2.5-Flash), suggesting shared machine dialect.
5. **Compositionality under tension**: jointly trained neologisms for short + numerical + **likely** (response higher-probability under stronger Gemini, ≥0.03 nats) — few-shot fails on likely alone (0.281 vs neologism 0.667); all-three harmonic mean 0.482 vs 0.387. Neologisms learn part of "likely"'s meaning from co-occurring examples without collapsing into shortcut behaviors (asking for likely+numerical yields only 4% short responses).
6. **Practical knobs**: hinge loss bounding embedding norms ≈1 slightly boosts performance; multiple prompt templates improve composition/negation handling ("single sentence and flattery").

## Detailed Notes

### Relation to the position paper
- Extends [[source-we-cant-understand-ai-vocabulary]] (Hewitt, Geirhos, Kim 2025) which argued *why* neologisms; this paper delivers the *how-well* evaluation across concepts, models, and compositions. Same frozen-model guarantee: unused token ⇒ bit-identical original model behavior.
- Contrast with mechanistic steering machinery (SAEs Cunningham 2023, steering vectors Zou/Turner, probes Burns): neologism learning requires **no forward-pass surgery**, integrates into natural language, user chooses when/how to invoke.

### Self-verbalization protocol detail
- Synonym elicitation: forced-prefix prompt ("Ok, here's a list of 5 synonyms for {neologism}:") then free completion; each synonym plugged back in as "Give me a {synonym} answer."
- Questionnaire: 12 open-ended questions asked twice (with and without neologism); transcripts fed to Gemini-2.5-Flash to synthesize one steering prompt. Caveat found: synthesis may pick up surface behaviors (e.g., literal "like" usage) rather than meta-description — verbalization quality varies by concept.
- Plug-in evaluation metric: % of base→training-data concept gap closed — turns fuzzy "does the model understand its own word?" into measurable steering transfer.

### Machine-only synonym implications
- "Lack" shares no subwords/morphology with brevity-related words (laconic…) yet behaves as one — evidence embeddings encode task-contextual meaning beyond human lexical fields.
- Cross-family transfer (Gemma→Gemini-2.5-Flash) raises question of whether co-trained model families converge on similar latent vocabularies — connects to subliminal learning (Cloud et al. 2025) where hidden signals transmit traits between models.
- Safety angle: a benign-looking English word acting as a hidden control token is a mild steganography/backdoor concern if neologism-style training were applied maliciously (paper does not explore this).

### Related-work mapping (Sec 7)
- Concept discovery (Ghorbani, Bau, Schut, Goh) — neologisms complement by naming discovered features for reuse.
- Out-of-context reasoning/generalization: Berglund 2023 situational awareness; Betley 2025a behavioral self-awareness; Betley 2025b emergent misalignment; Cloud 2025 subliminal learning — self-verbalization extends this line to free-text descriptions.
- Steering: Rimsky/Tan activation steering, representation engineering, Chen 2024 transparency dashboard — all require internal access; neologisms need only embedding-matrix write access.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 4 of 4 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2510.08506](https://arxiv.org/abs/2510.08506)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "{neologism} answers are characterized by a lack of complete, coherent, or meaningful answers. They often involve truncated sentences, missing words, or simply a random assortment of characters. They're like a digital shrug, a refusal to engage fully with the question."

> "In some self-verbalizations, we find machine-only synonyms: words that seem unrelated to humans but cause similar behavior in machines."

> "Humans invent new words when there is a rising demand for a new useful concept (e.g., doomscrolling)."

> "Most mechanistic methods … build new machinery to operate on neural computation … Contrastively, when humans attempt to align with each other, considerable effort goes into developing a shared vocabulary for complex concepts."

## Concepts Introduced or Referenced
- [[interpretability]] — Delivers the empirical leg of the neologism agenda: mid-level abstraction concepts made referenceable, controllable, and now *self-describable*; complements inspective probing with a language-native interface.
- [[alignment]] — H→M direction operationalized at scale (flattery/refusal/wrong-answer control without weight drift); M→H direction gives models a channel to report their own learned behaviors — relevant to introspection limits discussed in [[source-agentic-interpretability]].
- [[evaluation]] — Plug-in evaluation = behavioral validation of explanations (steering-transfer test), paralleling simulatability/control-success criteria; AxBench integration shows compatibility with standardized steering benchmarks.
- [[ai-ethics]] — Dual-use control (impact statement: better control enables beneficial and harmful use); epistemic risk that human-readable verbalizations may mask machine-divergent semantics (machine-only synonyms); stewardship questions for taught/learned concepts.
- [[in-context-learning]] — Direct comparison: few-shot definition of concepts loses to embedding learning on Gemma-scale models, especially for complex "likely".
- [[source-bridging-human-ai-knowledge-gap-alphazero]] — Chess prototypes taught concepts without names; neologisms supply the naming layer for domains lacking shareable puzzle media.

## Critical Assessment
**Strengths**: Converts a philosophical position into a benchmarked method (92% average gap closure, AxBench-validated); frozen-model guarantee makes deployment-safe (no regression when unused); self-verbalization + plug-in evaluation is a genuinely novel, quantifiable introspection probe; machine-only synonyms are a striking, replicable phenomenon with cross-model transfer; honest ablations (APO-up vs NLL, template count, norm hinge, ICL baseline).

**Weaknesses**: Single representative open model (Gemma-3-4B-IT) for main tables; LLM-judged concepts (flattery/wrong) inherit judge bias (Gemini judging Gemini-generated data); "likely" defined via Gemini likelihood — circular teacher dependence; long-text control notably weaker (36%) suggesting length priors resist single-token overrides; no human-subject study of how *people* use neologisms in practice (usability untested); safety/steganography implications of machine-only synonyms acknowledged implicitly but not analyzed.

**Contradiction check**: No contradiction with existing wiki. Reinforces [[interpretability]]'s agentic-vs-inspective complementarity (language-native control sits between them) and empirically substantiates the M−H gap claimed in [[source-we-cant-understand-ai-vocabulary]]; extends [[source-agentic-interpretability]]'s neologism-teaching opportunity with working mechanics.

**Gaps / Links**: Future work named by authors — distilling inter-model transmitted concepts (Cloud 2025) into neologisms; natural extension: combine with [[source-agentic-interpretability]] dialogue so the model explains, human probes, token gets refined. Missing: cost comparison vs LoRA steering at matched control quality; effect of RLHF post-training on neologism stability over model versions.

---

**Source:** Neologism Learning for Controllability and Self-Verbalization by John Hewitt, Oyvind Tafjord, Robert Geirhos, Been Kim — <https://arxiv.org/abs/2510.08506>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
