---
type: source-summary
title: "Generating Data — Prompt Engineering Guide (DAIR.AI) Applications"
summary: Micro-chapter showing how prompt strategies steer LLMs to produce coherent, consistent, factual text and to generate synthetic evaluation/training data on demand.
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/generating.en.mdx"
date-published: 2023-08-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
key-concepts:
  - "[[synthetic-data|Synthetic Data Generation]]"
  - "[[applications-overview]]"
  - "[[in-context-learning]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
---

# Generating Data — Prompt Engineering Guide (DAIR.AI) Applications

## Summary
Micro-chapter showing how prompt strategies steer LLMs to produce coherent, consistent, factual text and to **generate synthetic evaluation/training data** on demand. Demonstrates a sentiment-classifier exemplar generator (10 exemplars, 2 negative / 8 positive, `Q: <sentence> A: <sentiment>` format) and frames data generation as a core application bridging [[prompt-engineering]] and [[synthetic-data|Synthetic Data Generation]] for experiments and classifier bootstrapping.

## Key Takeaways
1. **Data-on-demand:** LLMs can generate formatted labeled exemplars (e.g., sentiment `Q:/A:` pairs) with controlled class balance via explicit numeric constraints in the prompt.
2. **Prompt controls distribution:** Specifying counts (2 negative, 8 positive) and strict output format yields predictable, parseable synthetic datasets.
3. **Evaluation shortcut:** Synthetic exemplars enable rapid prototyping and hypothesis testing before costly manual annotation.
4. **Reusable pattern:** The `Q: <sentence> A: <sentiment>` template generalizes to any classification task with categorical labels.

## Detailed Notes
- **Structure:** Single-section page (`# Generating Data`, 52 lines) with import `Callout` and one prompt→output block. No benchmarks, model pinned to general LLM capability claim.
- **Prompt shown:**
  ```
  Produce 10 exemplars for sentiment analysis. Examples are categorized as either positive or negative. Produce 2 negative examples and 8 positive examples. Use this format for the examples:
  Q: <sentence>
  A: <sentiment>
  ```
  Output lists 10 `Q:/A:` pairs matching the requested 8:2 split, including "The weather outside is so gloomy." → Negative.
- **Utility note:** "We actually use this example for a different test in another section" — points to cross-chapter reuse for systematic testing.
- **Context:** Could be extended with temperature control, diversity injection, or label-conditioned generation (see [[source-promptingguide-applications-generating-textbooks]] and [[source-promptingguide-applications-synthetic-rag]] for scaled patterns).

## Notable Quotes
> "LLMs have strong capabilities to generate coherent text. Using effective prompt strategies can steer the model to produce better, consistent, and more factual responses."
> "LLMs can also be especially useful for generating data which is really useful to run all sorts of experiments and evaluations."

## Concepts Introduced or Referenced
- [[synthetic-data|Synthetic Data Generation]] — Core application: label-conditioned exemplar synthesis with prompt-controlled distribution.
- [[applications-overview]] — One of the canonical LLM applications alongside code, RAG, and function calling.
- [[in-context-learning]] — Format (`Q:/A:`) follows few-shot exemplar conventions without weight updates.
- [[prompt-engineering]] — Specificity and output-format anchoring drive consistent generations.

## Critical Assessment
- **Strengths:** Minimal, copy-pasteable demonstration of synthetic data prompting; clear link between prompt specificity and usable output structure.
- **Weaknesses:** Toy example (10 samples) with no diversity, quality, or factuality evaluation; no discussion of temperature, de-duplication, or bias in generated exemplars; callout is promotional.
- **Contradictions:** None; complements [[source-promptingguide-applications-synthetic-rag]] (retriever training) and [[source-promptingguide-applications-generating-textbooks]] (diversity + scale).
- **Gaps:** Needs guidance on scaling to thousands of samples, filtering, and using synthetic data for fine-tuning vs evaluation split.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/generating.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/generating.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/generating.en.mdx)

---

**Source:** Generating Data — Prompt Engineering Guide (DAIR.AI) Applications by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/generating.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
