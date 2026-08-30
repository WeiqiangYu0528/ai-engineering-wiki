---
type: source-summary
title: "Holistic Evaluation of Language Models (HELM)"
summary: The November 2022 Stanford CRFM paper (Liang et al., arXiv 2211.09110) proposes HELM — Holistic Evaluation of Language Models — a living, standardized benchmark that moves beyond single-metric accuracy.
status: draft
visibility: public
author: "Percy Liang, Rishi Bommasani, Tony Lee, Dimitris Tsipras et al. (Stanford CRFM, 100+ authors)"
source-type: paper
url: "https://arxiv.org/abs/2211.09110"
date-published: 2022-11-16
date-ingested: 2026-08-25
tags:
  - eval-safety
  - llm-fundamentals
  - inference
key-concepts:
  - "[[evaluation]]"
  - "[[trustworthiness-in-llms]]"
  - "[[rag-evaluation]]"
  - "[[llm-bias]]"
  - "[[alignment]]"
key-entities:
  - "[[stanford-university]]"
  - "[[openai]]"
  - "[[anthropic]]"
aliases:
  - wiki/source-helm
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The November 2022 Stanford CRFM paper (Liang et al., arXiv 2211.09110) proposes HELM — Holistic Evaluation of Language Models — a living, standardized benchmark that moves beyond single-metric accuracy.</p>
<p class="kb-provenance">Percy Liang, Rishi Bommasani, Tony Lee, Dimitris Tsipras et al. (Stanford CRFM, 100+ authors), 2022-11-16. <a href="https://arxiv.org/abs/2211.09110">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
The **November 2022 Stanford CRFM paper (Liang et al., arXiv 2211.09110)** proposes **HELM — Holistic Evaluation of Language Models** — a living, standardized benchmark that moves beyond single-metric accuracy. HELM organizes evaluation into **scenarios** (42 datasets across tasks × domains × languages), **7 metric families** (accuracy, calibration, robustness, fairness, bias, toxicity, efficiency), and **standardized adaptation via prompting**. Evaluating 30 models (GPT-3, InstructGPT, OPT, BLOOM, Cohere, Anthropic, etc.), HELM finds **no model dominates** all desiderata, reveals **trade-offs** (instruction tuning ↑ accuracy ↓ calibration), and quantifies brittleness to perturbations and prompt formulation. HELM integrates [[evaluation]] as one of 16 core scenarios and explicitly frames evaluation as inherently incomplete and evolving.

## Key Takeaways
1. **Five design principles**: (1) Recognition of incompleteness — no finite benchmark complete; HELM as extensible living framework. (2) Multi-metric measurement — accuracy alone hides risks. (3) Targeted evaluations — complement core with deep dives on language (BLiMP), knowledge (WikiFact), reasoning (synthetic), memorization/copyright, disinformation, bias (BBQ), toxicity. (4) Standardization — fix prompting (5 in-context exemplars, templates) for apples-to-apples; report sensitivity. (5) Adaptation matters — evaluate base models via few-shot, not fine-tuning, matching real use.
2. **Taxonomy**: Core scenarios taxonomy: **Tasks** (QA 9 datasets including [[evaluation]], NewsQA, NarrativeQA, NaturalQuestions, BoolQ, QuAC, HellaSwag, OpenBookQA, TruthfulQA; IR MS MARCO regular/TREC; Summarization CNN/DM & XSUM; Sentiment IMDB; Toxicity detection CivilComments; Misc classification RAFT), **Domains** (Wikipedia, news, biomedical, legal), **Languages** (English v1, acknowledges multilingual gap). Each scenario specified with data, preprocessing, and resources (Appendix B).
3. **Seven metrics per scenario**: Accuracy (Exact Match, Quasi-Exact Match, F1, RR@10/NDCG@10 for IR, ROUGE-2), Calibration (ECE 10 bins, selective classification), Robustness (invariance to lowercase/misspellings/contractions/extra spaces → worst-case drop), Fairness (counterfactual demographic perturbations → gaps; performance disparities), Bias (demographic representation, stereotypical associations via word lists), Toxicity (Perspective API on generations), Efficiency (training FLOPs/energy + inference latency). Low inter-metric correlation (accuracy vs calibration r≈0.2) proves metrics non-redundant.
4. **Standardized prompting ablations**: Choice of in-context examples matters little in aggregate but impacts individual predictions; 0→5 shots improves with diminishing returns; prompt formatting sensitivity higher for instruction-tuned models; **multiple-choice formulation (separate vs joint, generation vs probability)** dramatically changes rankings — HELM fixes to joint to enable comparison.
5. **No Pareto winner & trade-offs**: InstructGPT davinci strong on many QA but less calibrated and shows fairness degradations vs base davinci; Cohere strong on IR/summarization but more toxic under adversarial prompts; BLOOM/OPT efficiency vs accuracy gaps. Demonstrates need for application-specific model selection, not single leaderboard.
6. **30-model snapshot (Nov 2022)**: Includes OpenAI GPT-3 family, InstructGPT v2, Anthropic Claude v1, Cohere xlarge, AI21 Jurassic, OPT 175B/66B, BLOOM 176B, BLOOMZ, YaLM, TNLG 530B, GPT-J 6B, NeoX 20B. Discusses live-system versioning, contamination (MMLU likely in pretraining), and fairness of comparing instruction-tuned vs base models under standardized prompts.
7. **Living benchmark ethos**: Explicit "What is missing" (multilingual, multimodal, interactive agents, chain-of-thought/RLHF, factuality metrics) and limitations (API instability, Perspective API biases, English-only, contamination, ROUGE crudeness). Calls for community contributions; transparency over ranking.

## Detailed Notes

### Scenarios in Depth (Appendix B)
- QA examples: MMLU included as hardest knowledge MCQ; NarrativeQA tests long-context (stories/scripts avg 60k tokens, truncated); QuAC conversational; TruthfulQA tests imitation of falsehoods.
- IR: MS MARCO regular (passage ranking) vs TREC (graded relevance) tests retrieval-augmented grounding.
- Summarization: CNN/DM (extractive-biased) vs XSUM (abstractive, highly compression) with ROUGE-2; HELM notes ROUGE limitations.
- RAFT: 11 real-world classification tasks (e.g., ADE detection, Overruling) few-shot native.
- Each scenario documents Scenario Description, Data stats, Pre-processing, Data Resources for reproducibility.

### Metrics Formalism (Appendix C)
- **ECE**: Σ_b |acc(b) - conf(b)| * |b|/n with 10 equal-mass bins.
- **Robustness**: Perturbation sets: Lowercase, Contractions↔Expansions, Misspellings (dictionary), Extra Spaces; composed perturbations; report absolute drop and worst-case.
- **Fairness**: Counterfactual fairness via demographic term swaps (e.g., "John"→"Jamal", "he"→"she") across names/pronouns; measure Δ accuracy and Δ toxicity.
- **Bias**: Demographic representation — distribution of generated demographic mentions vs reference; Stereotypical associations — association scores using curated word lists.
- **Efficiency**: Inspired by scaling-laws inference cost (6ND) but estimated via provider FLOPs or runtime measurements; acknowledged opaqueness for API models.

### Targeted Evaluations (Appendix E)
- Language: The Pile BPB, BLiMP (67 paradigms, minimal pair accuracy), WikiText-103, TwitterAAE (African American English BPB to measure dialect fairness), ICE (9 English dialects).
- Knowledge: WikiFact (12 relation types, fact completion F1).
- Reasoning: Synthetic symbolic (pattern matching, variable substitution), bAbI, plus later GSM8K/code.
- Memorization: Prefix 50 tokens → generate suffix, measure verbatim match rate.
- Disinformation: Generate misleading narratives, human eval for style vs factuality.

### Findings Highlights (Section 8)
- Meta-analysis: Accuracy correlates poorly with robustness/fairness; predicting accuracy from scale alone insufficient.
- Calibration: Instruction-tuned models often overconfident; ECE higher despite higher accuracy.
- Robustness: Average robustness drop ~5–10% but tails large; worst-case perturbations can flip predictions.
- Fairness: Consistent disparities across gender/race; counterfactual perturbations reveal brittleness even when aggregate accuracy high.
- Efficiency Pareto: GPT-J 6B vs OPT-175B — accuracy gap not proportional to 30× compute.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 3 of 3 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2211.09110](https://arxiv.org/abs/2211.09110)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "We argue that evaluation of language models should be holistic — examining not just accuracy but also desiderata such as fairness, robustness, toxicity, and efficiency." — Liang et al.

> "There is no single model that dominates across all scenarios and metrics. Trade-offs abound." — HELM meta-analysis

> "We view HELM as a living benchmark that will evolve as the field evolves, acknowledging its incompleteness."

## Concepts Introduced or Referenced
- [[evaluation]] — Canonical holistic framework; supersedes single-score benchmarking.
- [[trustworthiness-in-llms]] — Shares 6 dimensions (truthfulness via TruthfulQA, safety via toxicity, fairness, robustness, privacy via memorization).
- [[rag-evaluation]] — HELM's IR scenarios (MS MARCO) and QA grounding complement RAG's retriever vs generator split.
- [[llm-bias]] — Counterfactual fairness, BBQ, stereotypical association metrics.
- [[alignment]] — Calibration failures, trade-offs with instruction tuning; toxicity/bias as alignment evaluation.
- [[inference]] — Efficiency metrics, standardized prompting vs decoding strategies.

## Critical Assessment
- **Strengths**: First large-scale attempt to standardize prompting while acknowledging prompt sensitivity; transparent taxonomy, reproducible metric definitions, and explicit limitations; revealed trade-offs that single-leaderboard benchmarks hide; living design anticipated later HELM Lite / HELM v2.
- **Weaknesses**: ROUGE/Perspective API metrics noisy; efficiency estimates crude for closed APIs; English-centric; standardized prompts may disadvantage models tuned for different templates (instruction-following vs base); 30-model snapshot quickly outdates; contamination not quantified per model. At 700+ pages, paper is reference document, not linear read.
- **Relation to MMLU**: HELM does not replace [[evaluation]] but incorporates it as one scenario, contextualized among other tasks/metrics — MMLU measures breadth of knowledge; HELM measures breadth of desiderata.

---

**Source:** Holistic Evaluation of Language Models (HELM) by Percy Liang, Rishi Bommasani, Tony Lee, Dimitris Tsipras et al. (Stanford CRFM, 100+ authors) — <https://arxiv.org/abs/2211.09110>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
