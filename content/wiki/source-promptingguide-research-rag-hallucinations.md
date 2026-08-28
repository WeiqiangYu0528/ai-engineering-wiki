---
type: source-summary
title: "Reducing Hallucination in Structured Outputs via RAG"
summary: Summary of a ServiceNow paper (2024) on deploying efficient RAG for structured-output tasks — specifically translating natural language requirements into workflow JSON.
status: draft
visibility: public
author: "ServiceNow Research via DAIR.AI"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/rag_hallucinations.en.mdx"
date-published: 2024-04-01
date-ingested: 2026-08-24
tags:
  - rag
  - eval-safety
  - prompt-engineering
key-concepts:
  - "[[rag-faithfulness]]"
  - "[[retrieval-augmented-generation]]"
  - "[[hallucination]]"
key-entities:
  - "[[openai]]"
---

# Reducing Hallucination in Structured Outputs via RAG

## Summary
Summary of a ServiceNow paper (2024) on deploying efficient RAG for structured-output tasks — specifically translating natural language requirements into workflow JSON. Demonstrates that a small LM combined with a very small retriever can rival larger systems while mitigating hallucination and increasing reliability, enabling deployment in limited-resource settings.

## Key Takeaways
1. **Small + small still wins** — Combining a small language model with a tiny retriever via RAG effectively reduces hallucination on structured outputs, avoiding need for frontier-scale models.
2. **Target task: NL→workflow JSON** — Enterprise-relevant structured generation where hallucinated keys/values break downstream execution; RAG grounding improves reliability.
3. **Resource efficiency** — Approach suitable for constrained inference budgets; hints at further optimization via speculative decoding or YAML-over-JSON (tokenization efficiency).
4. **Practical focus** — Provides actionable insights for real-world RAG deployment beyond academic QA benchmarks.

## Detailed Notes
- Architecture figure shows retrieval-augmented pipeline for structured outputs (retriever → small LM → structured workflow).
- Connects broader RAG faithfulness theme: even when model is small, grounded retrieval compensates.
- Suggestion to prefer YAML over JSON aligns with tokenization analysis (fewer tokens, less brittleness).

## Concepts Introduced or Referenced
- [[retrieval-augmented-generation]] — applied to structured generation, not just open-ended QA.
- [[hallucination]] — structured-output hallucination as schema/field fabrication.
- [[rag-faithfulness]] / [[rag-evaluation]] — faithfulness in constrained output formats.
- [[tokenization]] — JSON vs YAML token efficiency noted.
- [[inference]] — small-model deployment and optimization (speculative decoding).

## Critical Assessment
Practical, enterprise-oriented vignette distinct from the survey-style [[source-promptingguide-research-rag]]. Strength: shows RAG's leverage is not limited to large models. Limitation: summary lacks quantitative results and retriever-size details. Complements [[source-promptingguide-research-rag-faithfulness]] (faithfulness dynamics) by demonstrating a domain where faithfulness is directly verifiable (JSON validity). No contradictions.

---

**Source:** Reducing Hallucination in Structured Outputs via RAG by ServiceNow Research via DAIR.AI — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/rag_hallucinations.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
