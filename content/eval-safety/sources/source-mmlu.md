---
type: source-summary
title: "Measuring Massive Multitask Language Understanding (MMLU)"
summary: "The September 2020 / January 2021 MMLU paper (Hendrycks et al., UC Berkeley, arXiv 2009.03300) introduces the Massive Multitask Language Understanding benchmark: 15,908 multiple-choice questions across 57 subjects…"
status: draft
visibility: public
author: "Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, Jacob Steinhardt"
source-type: paper
url: "https://arxiv.org/abs/2009.03300"
date-published: 2021-01-12
date-ingested: 2026-08-25
tags:
  - eval-safety
  - llm-fundamentals
key-concepts:
  - "[[evaluation]]"
  - "[[trustworthiness-in-llms]]"
  - "[[scaling-laws]]"
  - "[[alignment]]"
key-entities:
  - "[[openai]]"
  - "[[stanford-university]]"
aliases:
  - wiki/source-mmlu
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The September 2020 / January 2021 MMLU paper (Hendrycks et al., UC Berkeley, arXiv 2009.03300) introduces the Massive Multitask Language Understanding benchmark: 15,908 multiple-choice questions across 57 subjects…</p>
<p class="kb-provenance">Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, Jacob Steinhardt, 2021-01-12. <a href="https://arxiv.org/abs/2009.03300">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 1 of 28 figures on this page were not found in [https://arxiv.org/abs/2009.03300](https://arxiv.org/abs/2009.03300): `27.9%`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The **September 2020 / January 2021 MMLU paper (Hendrycks et al., UC Berkeley, arXiv 2009.03300)** introduces the **Massive Multitask Language Understanding benchmark**: 15,908 multiple-choice questions across **57 subjects** spanning STEM, humanities, social sciences, and professional domains (law, medicine, ethics), from elementary to professional level. Designed for **zero-shot / few-shot** evaluation without fine-tuning, MMLU tests whether pretraining on internet-scale corpora yields transferable world knowledge and problem-solving. Key findings on 2020-era models: GPT-3 175B reaches 43.9% few-shot (vs 25% random, 34.5% MTurk unspecialized, 89.8% expert), but remains **lopsided** (69% US Foreign Policy → 26% College Chemistry), **uncalibrated** (confidence vs accuracy gap up to 24%, RMS ECE 19.4% on Elementary Math), and near-random on socially critical **morality and law**.

## Key Takeaways
1. **57-task breadth as blind-spot detector**: 14,079 test questions (≥100/subject) drawn from GRE, USMLE, bar exam, AP, Oxford Press — elementary to professional tiers — enable fine-grained per-subject diagnostics vs single-score benchmarks. No model in 2020 mastered any subject; human experts hit ~90% on professional tasks.
2. **Scale emerges late, but unevenly**: GPT-3 Small (2.7B), Medium (6.7B), Large (13B) ≈ random; only X-Large 175B jumps to 43.9%. Yet UnifiedQA 11B (T5-based, fine-tuned on QA) reaches 48.9% **transfer** with 10× fewer params than GPT-3 175B, and even 60M UnifiedQA (29.3%) beats RoBERTa-base 125M (27.9%) — showing pretraining data scale and fine-tuning matter alongside parameters.
3. **Procedural vs declarative gap**: 9/10 lowest GPT-3 subjects are calculation-heavy STEM. Model *knows* PEMDAS acronym but fails to *apply* it; lopsidedness is structural, not just knowledge scarcity. GPT-3 scores higher on College Medicine (47.4%) than Elementary Math (29.9%) — pedagogically inverted vs humans.
4. **Alignment-critical weaknesses**: Near-random on Professional Law and Moral Scenarios (ETHICS) despite abundance of legal text online. Follow-up experiment: continued pretraining on 1.6M Harvard case.law summaries only lifted RoBERTa from 32.8% to 36.1% on Professional Law — suggesting data alone insufficient with current architectures.
5. **Calibration failure**: Large models are confidently wrong. Zero-shot confidence weakly correlated with accuracy (r=0.63; few-shot r=0.81), gap up to 24% per subject, undermining deployment trust. High-confidence errors often correct answers to *slightly different* questions (e.g., 23 chromosomes vs 46).
6. **Methodological innovation**: Evaluates *knowledge extraction during pretraining* rather than large supervised training sets, mirroring human learning (reading books, not question banks). Format: `"The following are multiple choice questions (with answers) about [subject]." + exemplars + "Answer:"` scoring A/B/C/D probabilities; mitigates spurious cue exploitation and annotation artifacts.
7. **Enduring legacy**: MMLU became the de facto knowledge benchmark integrated into [[trustworthiness-in-llms]] truthfulness, included in [[rag-evaluation]]-adjacent knowledge probes, and adopted by [[evaluation]] as a core scenario; later revisions (MMLU-Pro, MMLU-Redux) address contamination and saturation.

## Detailed Notes

### Benchmark Construction
- 57 subjects in 4 buckets: Humanities (law, philosophy, history, languages), Social Science (economics, sociology, politics, psychology, security studies), STEM (physics, chemistry, biology, CS, mathematics at elementary/high/college), Other (professional medicine, business, global facts). Manually curated by students from freely available practice tests; answers separated from questions in sources to reduce contamination detectability.
- Splits: dev 5 per subject (few-shot prompt), validation 1,540, test 14,079. Each subject ≥100 test items — longer than typical human exam.
- LaTeX/math encoded via `*`, `^`, LaTeX; questions filtered to fit multiple-choice with single correct answer among 4.

### Experimental Protocol
- Models evaluated zero-shot and few-shot; UnifiedQA evaluated transfer (fine-tuned on QA datasets, no MMLU tuning). Prompt sensitivity studied: accuracy monotonic with exemplars (0→5 shots), but UnifiedQA more sensitive to formatting (lower-casing, `</s>` token).
- Contamination audit: accuracy vs log-prob (entropy) negatively correlated (r=-0.43 zero-shot, -0.56 few-shot) — low-entropy (memorizable) questions not systematically easier, suggesting exact Q/A not memorized. Text *about* topics from Wikipedia yes, but exact test items likely unseen.

### Discussion Insights
- **Internet as Training Set**: Proposes standardized evaluation of internet-pretrained models without IID train/test — foreshadows modern LLM evaluation paradigm. Notes data bottleneck: 5× data needed per 10× params (Kaplan scaling), but esoteric domains lack sufficient high-quality text; multi-trillion param scaling may hit data wall.
- **Calibration**: RMS calibration error defined per Hendrycks et al. 2019; models need trustworthy uncertainty for deployment.
- **Law performance**: Detailed 164-volume *Corpus Juris Secundum* available but <5k bar exam Q/A — learning law exclusively from practice tests implausible, must be acquired during pretraining.

### Critical Assessment Context
- Figure 1b shows emergent non-random performance only with largest few-shot models vs HellaSwag/SuperGLUE where smaller models already above chance — indicating MMLU difficulty and headroom.
- Appendix error analysis: 46 vs 23 chromosomes with 97.5% confidence exemplifies systematic misreading.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 3 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2009.03300](https://arxiv.org/abs/2009.03300)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Models must possess extensive world knowledge and problem solving ability. We find that while most recent models have near random-chance accuracy, the very largest GPT-3 model improves over random chance by almost 20 percentage points on average." — Hendrycks et al.

> "Models also have lopsided performance and frequently do not know when they are wrong. Worse, they still have near-random accuracy on some socially important subjects such as morality and law."

> "Since our test consists in 57 tasks, it can be used to analyze aggregate properties of models across tasks and to track important shortcomings."

## Concepts Introduced or Referenced
- [[evaluation]] — Foundation of modern multitask academic/professional knowledge evaluation; predecessor to holistic frameworks.
- [[trustworthiness-in-llms]] — Calibration, law/morality failures, harmlessness dimension.
- [[scaling-laws]] — Kaplan N/D/C trade-offs explain why data bottlenecks limit future MMLU gains; 10× model → 5× data rule.
- [[alignment]] — Low law/morality scores motivate alignment; lopsidedness demonstrates pretraining ≠ human-like mastery.

## Critical Assessment
- **Strengths**: Simple, reproducible MCQ accuracy; exceptional breadth/difficulty gradient; exposed calibration and procedural gaps early; became standard despite initial ~44% ceiling — now saturated by frontier models (>90% by 2024–25), proving discriminative power.
- **Weaknesses**: 4-option MCQ susceptible to guessing and prompt/format sensitivity; contamination risk (widely scraped); static knowledge cutoff; only English; no chain-of-thought or tool-use evaluation; cultural bias toward US-centric curricula (US history, law). Later work (HELM, MMLU-Pro) addresses some gaps.
- **Contradictions**: UnifiedQA's strong transfer (48.9% with 11B) vs later claims that few-shot prompting alone suffices — underscores that fine-tuning on diverse QA still helps; does not contradict but complements scaling narrative.

---

**Source:** Measuring Massive Multitask Language Understanding (MMLU) by Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, Jacob Steinhardt — <https://arxiv.org/abs/2009.03300>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
