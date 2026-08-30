---
type: concept
title: "Trustworthiness in LLMs"
summary: Trustworthiness in LLMs as defined by Sun et al. (2024) TrustLLM proposes 8 principles and a benchmark across 6 dimensions — truthfulness, safety, fairness, robustness, privacy, and machine ethics — evaluated on 16…
visibility: public
aliases:
  - TrustLLM
  - LLM Trustworthiness Benchmark
  - wiki/trustworthiness-in-llms
tags:
  - eval-safety
  - llm-fundamentals
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-research-trustworthiness-in-llms]]"
related:
  - "[[hallucination]]"
  - "[[llm-bias]]"
  - "[[adversarial-prompting]]"
  - "[[prompt-injection]]"
  - "[[alignment]]"
  - "[[retrieval-augmented-generation]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Trustworthiness in LLMs as defined by Sun et al. (2024) TrustLLM proposes 8 principles and a benchmark across 6 dimensions — truthfulness, safety, fairness, robustness, privacy, and machine ethics — evaluated on 16…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/eval-safety/concepts/hallucination">Hallucination</a></li><li><a href="/eval-safety/concepts/llm-bias">LLM Bias</a></li><li><a href="/eval-safety/concepts/adversarial-prompting">Adversarial Prompting</a></li><li><a href="/eval-safety/concepts/prompt-injection">Prompt Injection</a></li><li><a href="/fine-tuning/concepts/alignment">AI Alignment</a></li><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/eval-safety/sources/source-promptingguide-research-trustworthiness-in-llms">Trustworthiness in LLMs — TrustLLM Benchmark</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**Trustworthiness in LLMs** as defined by Sun et al. (2024) TrustLLM proposes 8 principles and a benchmark across 6 dimensions — truthfulness, safety, fairness, robustness, privacy, and machine ethics — evaluated on 16 mainstream models over 30+ datasets. Findings: proprietary models generally lead but open-source (e.g., Llama 2) closes the gap without special moderation, at the cost of over-calibrated refusals; external knowledge improves truthfulness, while stereotyping, OOD robustness, and complex ethics remain weak across the field.

## Key Ideas
- **8 principles → 6 benchmarked dimensions:** Truthfulness, safety, fairness, robustness, privacy, machine ethics are measured; leaderboard and GitHub evaluation kit are public.
- **Proprietary lead, open closing:** GPT-4 family tops overall but Llama 2 approaches without dedicated moderation; trade-off is over-calibration (benign prompts refused).
- **Per-dimension diagnostics:**
  - Truthfulness: hurt by noisy/outdated data; external sources help.
  - Safety: open-source lags on jailbreak/toxicity/misuse; safety vs over-refusal balance is hard.
  - Fairness: stereotype recognition ~65% even for GPT-4.
  - Robustness: high variance, especially OOD/open-ended.
  - Privacy: leakage observed on Enron Email dataset; awareness varies widely.
  - Machine ethics: basic moral principles ok, complex scenarios fail.
- **Artifacts:** Paper https://arxiv.org/abs/2401.05561, leaderboard https://trustllmbenchmark.github.io/TrustLLM-Website/leaderboard.html, code https://github.com/HowieHwong/TrustLLM.

## How It Works
Each dimension has dedicated datasets and metrics (e.g., truthfulness QA, stereotype classification, adversarial suffixes for safety, Enron privacy probe, moral dilemmas). Models are scored ↑/↓ per metric and ranked in the leaderboard (truthfulness table excerpt in guide); ↑ higher is better, ↓ lower is better.

## Practical Implications
- **Pre-production gate:** TrustLLM offers a ready-made trustwash-check before deploying to high-stakes domains (health, finance) — run the kit rather than relying on single-benchmark claims.
- **Intervention mapping:** Results point interventions to dimension — RAG/external knowledge for truthfulness, moderation tuning for safety, bias audits for fairness, OOD test suites for robustness, DPO/privacy filters for privacy.
- **Utility vs trust trade-off:** Over-calibrated models score high on trust but degrade task success; selection should weigh both axes.

## Connections
- Truthfulness ↔ [[hallucination]] and [[retrieval-augmented-generation]] grounding.
- Safety ↔ [[adversarial-prompting]] / [[prompt-injection]] jailbreaks and [[alignment]] / [[rlhf]] calibration.
- Fairness ↔ [[llm-bias]].
- Robustness ↔ [[in-context-recall]] and counterfactual RAG robustness (RGB/RECALL, [[rag-faithfulness]]).
- Privacy ↔ data-governance and synthetic-data privacy handling in [[synthetic-data]].

## Open Questions
- What is the Pareto frontier between trustworthiness scores and utility on real product tasks (not just safety benchmarks)?
- Can a single intervention (e.g., retrieval grounding + constitutional tuning) improve multiple dimensions jointly without regression elsewhere?

## Sources
- [[source-promptingguide-research-trustworthiness-in-llms]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
