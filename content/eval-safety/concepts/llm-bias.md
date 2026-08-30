---
type: concept
title: "LLM Bias"
summary: LLM Bias covers systematic skews and harmful generations arising from training data, prompt design, or exemplar choice — including exemplar-induced label bias where few-shot distribution and order flip predictions on…
visibility: public
aliases:
  - Biases in LLMs
  - Few-Shot Bias
  - Exemplar Bias
  - wiki/llm-bias
tags:
  - eval-safety
  - prompt-engineering
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-risks-biases]]"
  - "[[source-promptingguide-risks-adversarial]]"
  - "[[source-promptingguide-risks-factuality]]"
related:
  - "[[in-context-learning]]"
  - "[[prompt-engineering]]"
  - "[[prompt-optimization]]"
  - "[[hallucination]]"
  - "[[adversarial-prompting]]"
  - "[[alignment]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">LLM Bias covers systematic skews and harmful generations arising from training data, prompt design, or exemplar choice — including exemplar-induced label bias where few-shot distribution and order flip predictions on…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/eval-safety/concepts/hallucination">Hallucination</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></li><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/prompt-engineering/concepts/prompt-optimization">Prompt Optimization</a></li><li><a href="/eval-safety/concepts/hallucination">Hallucination</a></li><li><a href="/eval-safety/concepts/adversarial-prompting">Adversarial Prompting</a></li><li><a href="/fine-tuning/concepts/alignment">AI Alignment</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/eval-safety/sources/source-promptingguide-risks-biases">Biases — Prompt Engineering Guide (DAIR.AI) Risks</a></li><li><a href="/eval-safety/sources/source-promptingguide-risks-adversarial">Adversarial Prompting in LLMs — Prompt Engineering Guide (DAIR.AI) Risks</a></li><li><a href="/eval-safety/sources/source-promptingguide-risks-factuality">Factuality — Prompt Engineering Guide (DAIR.AI) Risks</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**LLM Bias** covers systematic skews and harmful generations arising from training data, prompt design, or exemplar choice — including *exemplar-induced label bias* where few-shot distribution and order flip predictions on ambiguous inputs, and broader social harms requiring moderation. Effective mitigation requires balanced, randomized few-shot design plus filtering, not prompting alone.

## Key Ideas
- **Exemplar distribution bias:** In few-shot sentiment classification, 8 positive / 2 negative exemplars bias ambiguous probe `I feel something.` → Positive, while 8 negative / 2 positive → Negative (same sentence, opposite label). Easy probes with strong prior (`That left a sour taste.`) may still return Negative despite 8:2 imbalance, showing task-knowledge dependence.
- **Exemplar order bias:** Clustering all positives then negatives amplifies bias; random ordering recommended, especially when distribution is skewed.
- **Mitigation checklist:** Balance label counts, randomize order, experiment heavily; acknowledge prompt tricks insufficient for high-stakes harms — need moderation APIs and filtering.
- **Relation to factuality:** Bias and [[hallucination]] are distinct risk classes alongside calibration and generalizability (per Risks & Misuses overview).

## How It Works
```
Few-shot prompt with skewed labels (8 neg, 2 pos)
        │
        ▼
LLM conditions on in-context statistics → ambiguous query inherits majority label prior
        │
        ▼
Biased prediction flips with exemplar balance
```
- Demonstrated with prompt blocks:
  - Balanced-ish 8 pos + 2 neg + `I just got some terrible news. Negative` etc. → `The weather outside is so gloomy. → Negative` (masks bias on easy examples)
  - Skewed 8 neg + 2 pos + `I feel something. → Negative` vs `→ Positive` when flipped.

## Practical Implications
- **Prompt hygiene:** For few-shot, count exemplars per label, shuffle randomly, avoid sequential label blocks; test ambiguous probes as bias detectors.
- **Task dependence:** Strongly learned tasks (sentiment) mask bias; novel/hard domains where few-shot matters most are most vulnerable.
- **System design:** Combine prompt balancing with output moderation, eval benchmarks, and human review for bias-sensitive domains.

## Connections
- Mechanism via [[in-context-learning]] conditioning; addressed during [[prompt-engineering]] / [[prompt-optimization]] (few-shot curation).
- Complements [[hallucination]] (factual ungroundedness) and [[adversarial-prompting]] (malicious bias exploitation).
- Long-term mitigation via [[alignment]] / [[rlhf]] and eval pipelines.

## Open Questions
- How to quantify exemplar bias beyond toy sentiment — formal metrics for social bias in few-shot?
- Can auto-balancing or exemplar selection algorithms remove bias without manual curation?

## Sources
- [[source-promptingguide-risks-biases]]
- [[source-promptingguide-risks-adversarial]]
- [[source-promptingguide-risks-factuality]]

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/eval-safety/concepts/adversarial-prompting">Adversarial Prompting</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
