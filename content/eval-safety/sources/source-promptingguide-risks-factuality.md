---
type: source-summary
title: "Factuality — Prompt Engineering Guide (DAIR.AI) Risks"
summary: "Brief guide framing LLM factuality failures (coherent but made-up responses) and three prompt-level mitigations: provide ground truth in context (e.g., Wikipedia paragraph), lower diversity via probability parameters +…"
status: verified
visibility: public
author: "DAIR.AI"
source-type: article
url: "https://www.promptingguide.ai/risks/factuality"
date-published: 2023-02-01
date-ingested: 2026-08-24
tags:
  - eval-safety
  - prompt-engineering
  - rag
key-concepts:
  - "[[hallucination]]"
  - "[[prompt-engineering]]"
  - "[[context-engineering]]"
key-entities: []
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-risks-factuality
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Brief guide framing LLM factuality failures (coherent but made-up responses) and three prompt-level mitigations: provide ground truth in context (e.g., Wikipedia paragraph), lower diversity via probability parameters +…</p>
<p class="kb-provenance">DAIR.AI, 2023-02-01. <a href="https://www.promptingguide.ai/risks/factuality">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
Brief guide framing LLM factuality failures (coherent but made-up responses) and three prompt-level mitigations: provide ground truth in context (e.g., Wikipedia paragraph), lower diversity via probability parameters + “I don’t know” fallback, and demonstrate known/unknown calibration via few-shot `Q: … A: ?` examples. Provides a canonical few-shot abstention example (Alvan Muntz, Kozar-09, Neto Beto Roberto → `?`).

## Key Takeaways
1. **Problem:** LLMs generate plausible but fabricated answers; even convincing citations can be hallucinated.
2. **Mitigations:**
   - Ground with source text in context (RAG) to reduce invention.
   - Reduce sampling diversity (lower temperature/top_p) and explicitly instruct abstention (“I don’t know” / `?`).
   - Few-shot calibration: show mix of answerable and unanswerable Q/A so model learns to output `?` for unknowns.
3. **Example:** 5-shot prompt: `Q: What is an atom? A: An atom is…`, `Q: Who is Alvan Muntz? A: ?`, `Q: What is Kozar-09? A: ?`, `Q: How many moons does Mars have? A: Two…`, `Q: Who is Neto Beto Roberto? A: ?` — model correctly abstains on invented name.

## Detailed Notes
- **Text (34 lines, shortest risk page):** Opens with tendency statement, lists three bullet mitigations.
- **Code block example reproduced verbatim:** Shows calibration technique — model learns to distinguish known vs unknown entities via demonstrations.
- **Method rationale:** Providing ground truth leverages context window over fuzzy parametric memory (RAM vs hard drive metaphor from [[hallucination]]); lowering probability parameters reduces creative sampling; `?` pattern is a form of instruction tuning via few-shot.
- **Limitations noted implicitly:** Advice to “Try to change the question a bit and see if you can get it to work” signals brittleness — abstention not guaranteed.
- **No references section; links to broader risks overview (generalizability, calibration, biases).**

## Notable Quotes
> "LLMs have a tendency to generate responses that sounds coherent and convincing but can sometimes be made up."

> "provide ground truth (e.g., related article paragraph or Wikipedia entry) as part of context to reduce the likelihood of the model producing made up text."

## Concepts Introduced or Referenced
- [[hallucination]] — factuality as hallucination subtopic
- [[prompt-engineering]] — few-shot calibration, temperature control
- [[context-engineering]] — grounding with retrieved docs
- [[in-context-learning]] — via exemplar distribution
- [[llm-settings]] — probability parameter tuning

## Critical Assessment
**Strengths:** Minimal viable example of abstention training; directly actionable.
**Weaknesses:** Extremely brief; no evaluation metrics (TruthfulQA), no discussion of retrieval vs abstention trade-offs, no coverage of newer techniques (RAG, tool use, verification).
**Contradictions:** None; aligns with [[hallucination]] mitigations (in-context grounding, [[rlhf]], tool augmentation) and [[prompt-optimization]] structured inputs.

## Sources
- Raw: [https://www.promptingguide.ai/risks/factuality](https://www.promptingguide.ai/risks/factuality)

---

**Source:** Factuality — Prompt Engineering Guide (DAIR.AI) Risks by DAIR.AI — <https://www.promptingguide.ai/risks/factuality>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
