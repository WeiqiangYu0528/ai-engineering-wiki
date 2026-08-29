---
type: source-summary
title: "Prompt Engineering Guide — Active-Prompt"
summary: This micro-chapter summarizes Diao et al. (2023) Active Prompting with Chain-of-Thought.
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.) — based on Diao et al. (2023)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/activeprompt.en.mdx"
date-published: 2023-02-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - inference
key-concepts:
  - "[[active-prompt]]"
  - "[[prompt-engineering]]"
  - "[[in-context-learning]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-techniques-activeprompt
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This micro-chapter summarizes Diao et al. (2023) Active Prompting with Chain-of-Thought.</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.) — based on Diao et al. (2023), 2023-02-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/activeprompt.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
This micro-chapter summarizes Diao et al. (2023) *Active Prompting with Chain-of-Thought*. It argues that standard chain-of-thought relies on a fixed, human-chosen set of exemplars that are not necessarily optimal per task. Active-Prompt introduces an uncertainty-driven selection loop: query the LLM k times per training question (with or without CoT), compute disagreement-based uncertainty, select the most uncertain questions for human CoT annotation, and use those newly annotated exemplars as the few-shot prompt for inference.

## Key Takeaways
1. **Fixed CoT exemplars are suboptimal:** Human-annotated few-shot chains may not cover the model’s weaknesses for a given task.
2. **Uncertainty as selector:** Generating k answers and measuring disagreement/entropy identifies questions the model is least confident on — precisely where a human rationale helps most.
3. **Human-in-the-loop, but targeted:** Instead of annotating randomly, budget is spent on high-uncertainty instances, improving exemplar efficiency.
4. **Task-adaptive prompting:** Resulting prompts are tailored per dataset/task, not a one-size-fits-all CoT set.
5. **Metric matters:** Paper uses disagreement (and alternatives like entropy/variance) over k sampled completions.

## Detailed Notes

### Motivation
- Chain-of-thought (Wei et al. 2022) improves reasoning but depends on carefully curated few-shot exemplars.
- Problem: exemplars are static, hand-picked, and may not be the most *informative* for the model/task.

### Active-Prompt Pipeline (Figure active-prompt.png)
1. **Candidate querying:** For each training question, query LLM k times (with/without CoT), obtaining k answers.
2. **Uncertainty estimation:** Compute metric (disagreement = fraction not matching majority; also entropy of answer distribution) across k outputs.
3. **Selection:** Rank questions by uncertainty descending; top-n most uncertain selected for annotation.
4. **Annotation:** Humans write CoT reasoning for selected questions only.
5. **Inference:** New exemplars serve as few-shot CoT prompt for test questions.

### Illustration
- Figure shows training pool → k samples → uncertainty scoring → human annotation of uncertain subset → inference pool with enriched prompts.

### What’s Missing in Guide
- No quantitative results, ablation over k, metrics, or cost; no prompt example before/after; no discussion of when to stop selecting.

## Notable Quotes
> "Chain-of-thought (CoT) methods rely on a fixed set of human-annotated exemplars. The problem with this is that the exemplars might not be the most effective examples for the different tasks."

> "An uncertainty metric is calculated based on the k answers (disagreement used). The most uncertain questions are selected for annotation by humans."

## Concepts Introduced or Referenced
- [[active-prompt]] — Uncertainty-based exemplar selection for CoT.
- [[prompt-engineering]] — Moves prompt design from intuition to data-driven selection.
- [[in-context-learning]] — Few-shot CoT as in-context conditioning; Active-Prompt optimizes which exemplars fill the context.
- [[thinking-models]] — Shares motivation: eliciting better intermediate reasoning, but via exemplar selection rather than longer traces.

## Critical Assessment
- **Strengths:** Clearly articulates the “fixed exemplars are not optimal” insight and the elegant active-learning analogy; pipeline diagram makes loop intuitive.
- **Weaknesses:** Ultra-brief (no results, no guidance on k, pooling, or human cost); fails to distinguish disagreement vs entropy trade-offs; no comparison to alternatives like [[automatic-prompt-engineer]] (instruction search) or retrieval-based exemplar selection (e.g., KATE). “More coming soon” never added.
- **Contradictions:** None; complements [[automatic-prompt-engineer]] — APE searches instruction space, Active-Prompt searches exemplar space.
- **Extensions:** Could be combined with self-consistency (sample k then vote) already; quantify annotation efficiency vs random baseline.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/activeprompt.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/activeprompt.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/activeprompt.en.mdx)
- Primary paper: Diao et al. (2023) — https://arxiv.org/pdf/2302.12246.pdf

---

**Source:** Prompt Engineering Guide — Active-Prompt by DAIR.AI (Elvis Saravia et al.) — based on Diao et al. (2023) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/activeprompt.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
