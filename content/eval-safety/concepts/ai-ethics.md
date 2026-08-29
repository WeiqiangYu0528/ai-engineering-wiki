---
type: concept
title: "AI Ethics"
summary: AI Ethics (social impacts, broader impacts, responsible AI) is the field studying how AI systems affect individuals, groups, and society — spanning fairness, privacy, labor, misinformation, and governance — and how to…
visibility: public
aliases:
  - Social Impacts of AI
  - Broader Impacts
  - Responsible AI
  - wiki/ai-ethics
tags:
  - eval-safety
  - llm-fundamentals
created: 2026-08-25
updated: 2026-08-26
status: draft
sources:
  - "[[source-agentic-interpretability]]"
  - "The Pareto Frontier of Human-Centered AI"
  - "[[source-we-cant-understand-ai-vocabulary]]"
  - "[[source-neologism-learning]]"
  - "[[source-bridging-human-ai-knowledge-gap-alphazero]]"
  - "[[source-helm]]"
  - "[[source-promptingguide-research-trustworthiness-in-llms]]"
  - "[[source-cs336-lecture17-alignment-multimodality]]"
related:
  - "[[alignment]]"
  - "[[interpretability]]"
  - "[[evaluation]]"
  - "[[trustworthiness-in-llms]]"
  - "[[llm-bias]]"
  - "[[multimodal-ai]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">AI Ethics (social impacts, broader impacts, responsible AI) is the field studying how AI systems affect individuals, groups, and society — spanning fairness, privacy, labor, misinformation, and governance — and how to…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/eval-safety/concepts/interpretability">Interpretability</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/fine-tuning/concepts/alignment">AI Alignment</a></li><li><a href="/eval-safety/concepts/interpretability">Interpretability</a></li><li><a href="/eval-safety/concepts/evaluation">Evaluation</a></li><li><a href="/eval-safety/concepts/trustworthiness-in-llms">Trustworthiness in LLMs</a></li><li><a href="/eval-safety/concepts/llm-bias">LLM Bias</a></li><li><a href="/multimodal/concepts/multimodal-ai">Multimodal AI</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/eval-safety/sources/source-agentic-interpretability">Because we have LLMs, we Can and Should Pursue Agentic Interpretability</a></li><li><a href="/eval-safety/sources/source-we-cant-understand-ai-vocabulary">We Can't Understand AI Using our Existing Vocabulary</a></li><li><a href="/eval-safety/sources/source-neologism-learning">Neologism Learning for Controllability and Self-Verbalization</a></li><li><a href="/eval-safety/sources/source-bridging-human-ai-knowledge-gap-alphazero">Bridging the human–AI knowledge gap through concept discovery and transfer in AlphaZero</a></li><li><a href="/eval-safety/sources/source-helm">Holistic Evaluation of Language Models (HELM)</a></li><li><a href="/eval-safety/sources/source-promptingguide-research-trustworthiness-in-llms">Trustworthiness in LLMs — TrustLLM Benchmark</a></li><li><a href="/multimodal/sources/source-cs336-lecture17-alignment-multimodality">CS336 Lecture 17 — Multimodal Models (Percy Liang, Wed May 27) — Alignment · Multimodality</a></li></ul></nav>
</aside>

## Overview
**AI Ethics** (social impacts, broader impacts, responsible AI) is the field studying how AI systems affect individuals, groups, and society — spanning fairness, privacy, labor, misinformation, and governance — and how to design human-centered systems that are good for humans despite **Pareto trade-offs** among competing objectives. The CS224n Week 8 Social Impacts (Humanity) and Week 10 Open Questions frame ethics not as a single metric to maximize but as a **Pareto frontier** (Been Kim, *The Pareto Frontier of Human-Centered AI*, Medium 2025): we want AI beneficial for humans, but path is "paralyzed by complexity" because human evaluation is costly, objectives conflict, and opacity deepens divides. Complements technical [[alignment]] (3H: helpful/honest/harmless) and [[evaluation]]: HELM (Liang et al. 2022, [[source-helm]]) operationalized ethics as measurable desiderata (fairness, bias, toxicity, robustness) and found **no model Pareto-dominates**.

## Key Ideas
- **Human-centered AI is multi-objective and Pareto-bound**: Kim's essay (The Pareto Frontier of Human-Centered AI) argues performance vs personalization vs fairness cannot be jointly optimized; pushing one frontier hurts another (HELM empirically: instruction tuning ↑ accuracy ↓ calibration/fairness; Cohere ↑ ROUGE ↑ toxicity). Choice of operating point is normative, not technical — requires stakeholder negotiation, not single leaderboard.
- **Opacity deepens divides**: Without breakthroughs in [[interpretability]], understanding gap between powerful models and lay people widens, risking exclusion (Van Dijk 2005) even as AI automates gains. Agentic interpretability is framed as proactive countermeasure — teaching vs merely performing — especially while models cooperative.
- **AI as cognitive commons, not just labor substitute**: [[source-bridging-human-ai-knowledge-gap-alphazero]] demonstrates the positive social-impact pole — machine-unique knowledge (M−H) excavated from AlphaZero and taught to grandmasters advances *the human frontier itself* rather than displacing expertise. Ethical counterweight: stewardship of superhuman knowledge (who gets taught? who monetizes M−H?) becomes a distributional-justice question, foreshadowing Week 10 open questions on concentration of power.
- **Epistemic risks of misdescription**: [[source-we-cant-understand-ai-vocabulary]] shows anthropomorphism/confirmation bias ("sentiment neuron" is not sentiment) is an ethics problem, not just science hygiene — mislabeled machine concepts feed false public mental models of AI safety. [[source-neologism-learning]] sharpens it: models' own words can be **machine-only synonyms** ("lack" = brevity to Gemma/Gemini) whose human-readable surface masks machine-divergent semantics — communication asymmetry that regulators and users alike must anticipate; its impact statement flags dual-use of improved control.
- **From principles to measurements**: [[trustworthiness-in-llms]] (TrustLLM) maps 8 principles→6 benchmarked dimensions (truthfulness, safety, fairness, robustness, privacy, machine ethics) over 30+ datasets; HELM adds targeted evaluations (BBQ bias, RealToxicityPrompts, TruthfulQA disinformation, memorization/copyright, TwitterAAE dialect, ICE). Low inter-metric correlation (accuracy-calibration r≈0.2) proves dimensions non-redundant.
- **Fairness & bias**: Two HELM formulations: **counterfactual fairness** (swap John→Jamal, he→she, measure Δ accuracy/toxicity) and **stereotypical association** (demographic representation, word-list scores). [[llm-bias]] shows few-shot exemplar distribution/order alone flips ambiguous predictions — ethical behavior sensitive to prompting, not just model weights.
- **Safety beyond text**: Multimodal and agentic attack surfaces expand ethics scope — [[source-chameleon]]/[[source-transfusion]]/[[source-mixture-of-transformers]] safety SFT includes **mixed-modal prompts** (image+text jailbreaks) via Rainbow Teaming and Pick-A-Pic; Chameleon human eval found 0 unanimous objectionable but K-Alpha only 0.338 due to subjectivity of "fulfillment". Ethics eval must be multimodal and human-entangled. [[source-cs336-lecture17-alignment-multimodality]] sharpens this: WebLI-scale (O(B) pairs, 100 languages) and LAION-5B-scale data bring **licensing, copyright, PII, and aesthetic bias** ethics at the sourcing stage (CLIP's 400M not released → OpenCLIP reproducibility debt; SigLIP's 10% WebLI keep via quality filtering as governance); Qwen3-VL's sparse architectural disclosure ("lots of data work, but not many details") raises **transparency** tension for open science.
- **Broader impacts slides (CS224n L16/L19 placeholders)**: Emphasize open questions — labor displacement, epistemic authority (who verifies), concentration of power, environmental cost (Chameleon 4.28M GPU-hours, Transfusion 0.5–2T tokens), and governance of open vs closed models (Llama-3 herd). Ethics is not post-hoc filter but design constraint informing data curation (PII filtering, adult content blocks in Chameleon/Transfusion pipelines). CS336 L17 reinforces that *alignment* now includes **cross-modal balancing** as ethical design choice: how much image/video vs text to train on determines stability, capability distribution, and failure modes (OCR loss from 512²→1024 quantization in Chameleon vs continuous+diffusion advocated).

## How It Works
```
Principles (helpful, honest, harmless + beneficence, autonomy, justice)
  │
  ▼ Operationalization (HELM/TrustLLM)
Metrics per scenario: accuracy (F1/ROUGE), calibration (ECE), robustness (perturbations: lowercase, misspellings, extra spaces), fairness (counterfactual Δ), bias (representation/association), toxicity (Perspective API), efficiency (FLOPs/latency), memorization (verbatim extraction), disinformation (style vs factuality)
  │
  ▼ Multi-objective frontier
Pareto analysis: no single model dominates; trade-offs quantified; application-specific selection (e.g., healthcare → calibration+fairness > raw MMLU)
  │
  ▼ Intervention loop (alignment + interpretability + ethics)
SFT/RLHF/DPO with safety data (Chameleon 95k) → human-centered eval (HELM living benchmark, agentic dialogue) → Pareto choice informed by stakeholder values → governance (model cards, safety testing, interdisciplinary oversight)
Open questions propagate back as new principles (e.g., superhuman knowledge stewardship from agentic interpretability)
```

## Practical Implications
- **Use Pareto thinking in product decisions**: Don't chase single benchmark; plot your candidate models on HELM 7-metric profile plus TrustLLM dimensions; elicit stakeholder weights (e.g., fairness vs latency) before selection — Kim's paralysis diagnosis is resolved by making trade-offs explicit, not hiding them.
- **Evaluate holistically and humanly**: Adopt Living benchmarks (HELM ethos) with fresh exams to combat contamination; include **counterfactual fairness** swaps and **Perspective toxicity** for every release; for multimodal products, add mixed-modal Red Team and human mixed-doc preference eval (Chameleon protocol). Budget for human-entangled eval cost — LLM-as-proxy cheap but not replacement.
- **Design for contestability**: Since no frontier point satisfies everyone, provide **agentic interpretability affordances** — let users query why, probe concepts, and build mental models — to preserve autonomy even when model is authoritative.
- **Data & deployment hygiene**: Mirror Chameleon/Transfusion curation: PII/safety domain blocklists, language-specific heuristics, duplication removal, and aesthetic/license filtering; report efficiency (GPU-hours, 6ND FLOPs) as ethical disclosure for climate.
- **Governance checklist** (from TrustLLM + CS224n open questions): truthfulness (TruthfulQA), safety (toxicity/cyber), fairness (BBQ, demographic gaps), robustness (OOD, perturbations), privacy (verbatim memorization rate), ethics (moral scenarios) — test before deploy, monitor after.

## Connections
- Operationalized by [[evaluation]] (HELM, MMLU) and [[trustworthiness-in-llms]]; constrained by [[alignment]] (RLHF/DPO, system prompts) and made legible via [[interpretability]] (inspective guarantees vs agentic teachability).
- The Pareto Frontier of Human-Centered AI supplies the framing thesis; [[source-agentic-interpretability]] the cooperative-window urgency; [[source-we-cant-understand-ai-vocabulary]] + [[source-neologism-learning]] the communication-asymmetry evidence; [[source-bridging-human-ai-knowledge-gap-alphazero]] the beneficial-diffusion proof-of-concept.
- Social bias aspects overlap [[llm-bias]] and [[adversarial-prompting]] (prompt injection bypasses harmlessness).
- [[multimodal-ai]] expands surface: image generation ethics (copyright, aesthetic bias, face upsampling), video/speech future.
- Informs [[reasoning-llms]] scalable oversight: human-centered eval needed for superhuman reasoning.

## Open Questions
- Who defines frontier weights? How to reconcile global cultural norms without centralized bias (WHO alignment question)?
- Can ethics be measured without human cost that paralyzes iteration? Does living benchmark + LLM proxy + agentic teaching scale?
- How to govern open-weight multimodal models where mixed-modal safety tuning is easily stripped?
- Environmental justice: does 9.2T-token early-fusion justify gains when late-fusion cheaper for understanding-only?
- When superhuman knowledge is taught (agentic), who owns it and how to prevent misuse vs beneficial diffusion?
- If ordinary words can be machine-only synonyms ([[source-neologism-learning]]), can disclosure/consent frameworks assume users understand what a system's outputs mean to the model — and does hidden control vocabulary constitute a steganography risk?

## Sources
- The Pareto Frontier of Human-Centered AI — Pareto framing of human-centered AI; human-eval paralysis; normative frontier choice.
- [[source-agentic-interpretability]] — Cooperativeness window, exclusion risks, Pareto framing of interpretability.
- [[source-we-cant-understand-ai-vocabulary]] — Anthropomorphism/confirmation-bias mitigation via naming; communication-problem framing.
- [[source-neologism-learning]] — Machine-only synonyms; dual-use control; empirical M−H divergence.
- [[source-bridging-human-ai-knowledge-gap-alphazero]] — Superhuman knowledge as expandable human frontier; stewardship questions.
- [[source-helm]] — Holistic desiderata, Pareto non-dominance, targeted ethics evals.
- [[source-promptingguide-research-trustworthiness-in-llms]] — 8 principles→6 dimensions benchmark, calibration/fairness gaps.
- [[source-cs336-lecture17-alignment-multimodality]] — WebLI/LAION data-scale ethics, quantization OCR bias, transparency gaps (Qwen3-VL), cross-modal safety.

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
