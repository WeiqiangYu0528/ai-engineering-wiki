---
type: source-summary
title: "Biases — Prompt Engineering Guide (DAIR.AI) Risks"
summary: Focused factuality-adjacent guide demonstrating how few-shot exemplar distribution and order can bias LLM sentiment predictions.
status: verified
visibility: public
author: "DAIR.AI"
source-type: article
url: "https://www.promptingguide.ai/risks/biases"
date-published: 2023-02-20
date-ingested: 2026-08-24
tags:
  - eval-safety
  - prompt-engineering
key-concepts:
  - "[[llm-bias]]"
  - "[[in-context-learning]]"
  - "[[hallucination]]"
key-entities: []
verified-by: agent
verified-on: 2026-08-27
---

# Biases — Prompt Engineering Guide (DAIR.AI) Risks

## Summary
Focused factuality-adjacent guide demonstrating how few-shot exemplar distribution and order can bias LLM sentiment predictions. Shows that imbalanced labels and skewed ordering push the model toward the majority label for ambiguous inputs (“I feel something.”), while balanced, randomly ordered exemplars mitigate bias — but mitigation is task-dependent and requires moderation/filtering for high-stakes use.

## Key Takeaways
1. **Distribution matters:** 8 negative / 2 positive exemplars → model predicts “Negative” for ambiguous “I feel something.”; flipping to 8 positive / 2 negative → predicts “Positive” — same sentence, opposite label based solely on exemplar balance.
2. **Order matters:** Clustering all positives then negatives amplifies bias; random ordering recommended.
3. **Mitigation advice:** Provide balanced label counts and randomize order; note that strong prior knowledge (sentiment) can mask bias on easy examples (8 pos/2 neg still returned “Negative” for “That left a sour taste.”), but hard/ambiguous tasks reveal skew.
4. **Broader caveat:** Prompt tricks alone insufficient — harmful generations may require moderation APIs and filtering.

## Detailed Notes
- **Structure (97 lines):** Two sections: Distribution of Exemplars, Order of Exemplars.
- **Experiment 1 — Balanced-looking but tested:** 8× Positive + 2× Negative then query `That left a sour taste. → Negative` (correct despite imbalance — suggests model’s strong sentiment prior). Then `I feel something. → Negative` (biased).
- **Experiment 2 — Skewed negative:** 8× Negative + 2× Positive then same `I feel something. → Negative` (consistent) — but author notes flipping distribution to 8 pos/2 neg flips prediction to Positive for same ambiguous input (second claim without full block but described).
- **Experiment 2 details:** Lists 10 examples: 2 pos, 8 neg (including “The food here is delicious! Positive” vs many negatives).
- **Advice verbatim:** “avoid skewing the distribution and instead provide a more balanced number of examples for each label. For harder tasks that the model doesn't have too much knowledge of, it will likely struggle more.”
- **Order advice:** Brief, prescriptive — always randomize; exacerbated when distribution already skewed; “Always ensure to experiment a lot.”
- **No quantitative bias metrics; qualitative demonstration only.**

## Notable Quotes
> "LLMs can produce problematic generations that can potentially be harmful and display biases that could deteriorate the performance of the model on downstream tasks."

> "The advice here is to avoid skewing the distribution and instead provide a more balanced number of examples for each label."

> "The advice is to randomly order exemplars. … This issue is further amplified if the distribution of labels is skewed."

## Concepts Introduced or Referenced
- [[llm-bias]] — exemplar-induced label bias
- [[in-context-learning]] — few-shot conditioning mechanics
- [[prompt-engineering]] — exemplar design as bias lever
- [[hallucination]] — as broader risk category

## Critical Assessment
**Strengths:** Concrete, reproducible demonstration of subtle prompt-induced bias; memorable ambiguous probe “I feel something.”
**Weaknesses:** Limited to sentiment toy task; no discussion of social biases, systemic harms, or formal bias benchmarks; order effect not quantitatively shown.
**Contradictions:** None with [[alignment]] or [[prompt-injection]]; complements [[hallucination]] and [[in-context-learning]] on context sensitivity.

## Sources
- Raw: [https://www.promptingguide.ai/risks/biases](https://www.promptingguide.ai/risks/biases)

---

**Source:** Biases — Prompt Engineering Guide (DAIR.AI) Risks by DAIR.AI — <https://www.promptingguide.ai/risks/biases>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
