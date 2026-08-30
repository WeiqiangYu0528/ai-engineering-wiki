---
type: source-summary
title: "Claude 3 — Prompt Engineering Guide (DAIR.AI) Models"
summary: Snapshot of Anthropic Claude 3 family (Haiku / Sonnet / Opus, Mar 2024).
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.) / Anthropic"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/claude-3.en.mdx"
date-published: 2024-03-10
date-ingested: 2026-08-24
tags:
  - llm-fundamentals
  - open-source
key-concepts:
  - "[[llm-models-overview]]"
  - "[[prompt-engineering]]"
key-entities:
  - "[[anthropic]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-models-claude-3
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Snapshot of Anthropic Claude 3 family (Haiku / Sonnet / Opus, Mar 2024).</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.) / Anthropic, 2024-03-10. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/claude-3.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
Snapshot of **Anthropic Claude 3 family (Haiku / Sonnet / Opus, Mar 2024)**. Opus is strongest — reported to outperform GPT-4 on MMLU/HumanEval and other reasoning/math/analysis/extraction/forecasting/creative/code/multilingual benchmarks (figure `claude-benchmark.png`; `claude-vision.png` for vision). Notes **200K context (1M for select)**, **near-perfect NIAH recall**, **vision** (photos/charts/graphs), **efficiency** (Haiku fastest/cheapest, Sonnet 2× faster than Claude 2, Opus as fast as 2.1 but superior), **steerability/factuality** (more nuanced, fewer refusals, reduced hallucination, better JSON). Refs: Anthropic news https://www.anthropic.com/news/claude-3-family and model card https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model_Card_Claude_3.pdf.

## Key Takeaways
1. **Lineup:** Haiku (speed/cost) < Sonnet (balanced, 2× faster than 2) < Opus (top, GPT-4-beating on MMLU/HumanEval at publication).
2. **Long context + vision:** 200K default (1M extended), NIAH near-perfect, multimodal chart/photo understanding.
3. **Production traits:** Better JSON, lower hallucination, fewer refusals, nuanced instruction following.

## Detailed Notes
- **Structure:** 3 paragraphs + two images; benchmarks table placeholder; vision figure; references.
- **No prompting examples** — purely model brief.

## Notable Quotes
> "Claude 3 Opus (the strongest model) is reported to outperform GPT-4 and all other models on common benchmarks like MMLU and HumanEval."
> "Claude 3 Opus achieved near-perfect recall on the Needle In A Haystack (NIAH) evaluation."
> "Opus also shows significant improvements in factual question answering … while reducing incorrect answers or hallucinations."

## Concepts Introduced or Referenced
- [[llm-models-overview]] — Claude 3 generation entry; Anthropic lineage.
- [[anthropic]] — Entity linkage.
- [[context-engineering]] / [[inference]] — 200K/1M context implications.

## Critical Assessment
- **Strengths:** Quick capability/benchmark framing with primary sources.
- **Weaknesses:** Brief (26 lines), no prompting guidance, claim-heavy without numbers extracted.
- **Contradictions:** None; complements [[anthropic]] and contrasts with [[source-promptingguide-models-gpt-4]].

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/claude-3.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/claude-3.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/claude-3.en.mdx)
- Cited: https://www.anthropic.com/news/claude-3-family ; Model Card PDF above

---

**Source:** Claude 3 — Prompt Engineering Guide (DAIR.AI) Models by DAIR.AI (Elvis Saravia et al.) / Anthropic — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/claude-3.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
