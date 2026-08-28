---
type: concept
title: "Hallucination"
summary: Hallucination (more accurately described as confabulation) refers to instances where a language model generates plausible-sounding statements, factual claims, or citations that are factually false, ungrounded, or…
visibility: public
aliases:
  - "Confabulation"
  - "Parametric Hallucination"
tags:
  - eval-safety
  - prompt-engineering
  - rag
created: 2026-08-23
updated: 2026-08-24
status: draft
sources:
  - "[[source-training-language-models-to-follow-instructions-with-human-feedback]]"
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
  - "[[source-promptingguide-risks-factuality]]"
  - "[[source-promptingguide-risks-biases]]"
related:
  - "[[alignment]]"
  - "[[rlhf]]"
  - "[[pretraining]]"
  - "[[tool-use]]"
  - "[[thinking-models]]"
  - "[[reasoning-llms]]"
  - "[[context-engineering]]"
  - "[[prompt-optimization]]"
  - "[[llm-bias]]"
  - "[[adversarial-prompting]]"
  - "[[rag-faithfulness]]"
  - "[[trustworthiness-in-llms]]"
  - "[[synthetic-data]]"
---

# Hallucination

## Overview
**Hallucination** (more accurately described as *confabulation*) refers to instances where a language model generates plausible-sounding statements, factual claims, or citations that are factually false, ungrounded, or completely fabricated. 

## Key Ideas
- **Memory Metaphor (RAM vs. Hard Drive):** As highlighted by [[andrej-karpathy]]:
  - *Context Window (RAM):* High-fidelity, highly accessible, working memory.
  - *Model Weights (Hard Drive):* Fuzzy, lossy, statistical compression formed during [[pretraining]].
- **Root Cause:** When an LLM is asked to recall specific factual details without providing the relevant source text inside the context window, it samples from its fuzzy lossy parametric memory. Because next-token prediction optimizes for plausible fluent continuation, it naturally confabulates plausible tokens rather than declining to answer.
- **Empirical Mitigations:**
  1. **Preference Alignment via [[rlhf]]:** In [[source-training-language-models-to-follow-instructions-with-human-feedback]] (InstructGPT), training with human feedback halved closed-domain hallucination rates from **41% down to 21%** and doubled truthfulness on the TruthfulQA benchmark.
  2. **In-Context Grounding (RAG):** Supplying verified source documents directly inside the context window — e.g., Wikipedia paragraphs as in [[source-promptingguide-risks-factuality]] — leverages high-fidelity working memory over fuzzy weights.
  3. **Prompt-Level Calibration:** From [[source-promptingguide-risks-factuality]]: lower temperature/top_p for determinism and few-shot `Q: … A: ?` demonstrations teaching abstention on unknowns (Alvan Muntz / Kozar-09 / Neto Beto Roberto → `?`).
  4. **Tool Augmentation:** Enabling the model to execute web searches, calculator calls, or code execution via [[tool-use]] / [[function-calling]].
  5. **Internal Reasoning Chains:** Using [[thinking-models]] / [[reasoning-llms]] to verify and cross-check claims before emitting final outputs.

## How It Works
```
User Prompt (No Context) ──► LLM Fuzzy Parametric Weights ──► High Risk of Hallucination (41%)
                                                                (Confabulation)

User Prompt + RLHF Alignment ───────────────────────────────► Halved Hallucination Risk (21%)

User Prompt + Retrieved Docs (RAG) ──► In-Context Attention ──► Grounded, Verified Output (<2%)
```

## Practical Implications
- **Mission-Critical Systems:** Direct parametric question-answering cannot be trusted for legal, medical, or financial production systems without strict grounding and verification — combine [[context-engineering]] (ground truth injection, calibration) with retrieval.
- **Evaluation:** Benchmarking hallucination rates (e.g., via TruthfulQA, HaluEval, and LLM-as-a-judge) is a cornerstone of production AI engineering.
- **Calibration Need:** As shown in [[llm-bias]] / factuality guides, abstention (`?` / “I don’t know”) must be few-shot taught; without it models confabulate.

## Connections
- Arises directly from the lossy statistical nature of [[pretraining]].
- Significantly reduced by preference optimization in [[alignment]] and [[rlhf]].
- Mitigated by retrieving facts into working context ([[context-engineering]], RAG) or invoking external [[tool-use]] / [[function-calling]]; faithfulness nuance via [[rag-faithfulness]] (reciting false retrieved context as hallucination).
- Reduced on multi-step reasoning tasks by [[thinking-models]] / [[reasoning-llms]] and verified via [[deep-agents]] LLM-as-a-Judge pipelines.
- Contrasts with [[llm-bias]] (systematic skew) and [[adversarial-prompting]] (malicious hijack) as distinct failure classes.
- Maps to [[trustworthiness-in-llms]] truthfulness dimension; [[synthetic-data]] quality failures propagate hallucination into weights.

## Open Questions
- Can intrinsic calibration metrics reliably allow LLMs to quantify their own uncertainty and decline answering?
- How much hallucination is inherent to next-token prediction objectives vs. alignment artifacts?

## Sources
- [[source-training-language-models-to-follow-instructions-with-human-feedback]]
- [[source-deep-dive-into-llms-like-chatgpt]]
- [[source-promptingguide-risks-factuality]]
- [[source-promptingguide-risks-biases]]
- [[source-promptingguide-research-rag-faithfulness]]
- [[source-promptingguide-research-rag-hallucinations]]
- [[source-promptingguide-research-trustworthiness-in-llms]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
