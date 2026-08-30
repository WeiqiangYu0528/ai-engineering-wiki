---
type: source-summary
title: "Language Agents: Foundations, Prospects, and Risks (EMNLP 2024 Tutorial)"
summary: "An EMNLP 2024 (Miami, Nov 15) tutorial by Yu Su (OSU), Diyi Yang (Stanford), Shunyu Yao (OpenAI), and Tao Yu (HKU) that defines and systematizes language agents: AI agents whose distinct trait is using language as a…"
status: draft
visibility: public
author: "Yu Su, Diyi Yang, Shunyu Yao, Tao Yu"
source-type: transcript
url: "https://language-agent-tutorial.github.io/"
date-published: 2024-11-15
date-ingested: 2026-08-26
tags:
  - agents
key-concepts:
  - "[[ai-agents]]"
  - "[[react]]"
  - "[[tool-use]]"
  - "[[agent-components]]"
aliases:
  - wiki/source-language-agents-foundations-prospects-risks
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">An EMNLP 2024 (Miami, Nov 15) tutorial by Yu Su (OSU), Diyi Yang (Stanford), Shunyu Yao (OpenAI), and Tao Yu (HKU) that defines and systematizes language agents: AI agents whose distinct trait is using language as a…</p>
<p class="kb-provenance">Yu Su, Diyi Yang, Shunyu Yao, Tao Yu, 2024-11-15. <a href="https://language-agent-tutorial.github.io/">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary

An EMNLP 2024 (Miami, Nov 15) tutorial by Yu Su (OSU), Diyi Yang (Stanford), Shunyu Yao (OpenAI), and Tao Yu (HKU) that defines and systematizes **language agents**: AI agents whose distinct trait is *using language as a vehicle for reasoning and communication* via integrated LLMs. It reconciles "next big thing" vs "thin wrapper" camps, situates language agents against prior generations (logical, neural agents), and covers foundations (reasoning, memory, planning), applications/data/evaluation, and emerging topics (multi-agent systems, safety, social impact).

## Key Takeaways

1. **Definitional thesis**: contemporary LLM agents are qualitatively new because natural language is their interface for both reasoning and communication — hence "language agents," not just "LLM wrappers."
2. **Foundations triad**: reasoning + memory + planning form the core capability stack (Part II), mirroring the planning/tools/memory decomposition in [[agent-components]].
3. **Historical contextualization**: positions the current wave within AI's broader agent lineage rather than treating it ahistorically.
4. **Risks are first-class**: safety and social impact get a dedicated part alongside capabilities — an explicit stance that prospects and risks must be studied together.

## Detailed Notes

- Five-part schedule: I Introduction (Su); II Foundations — Reasoning/Memory + Planning (Yao, Su); III Applications, Data, Evaluation (Yu); IV Emerging Topics — Multi-Agent Systems, Safety, Social Impact (Yang); V Final Remarks & Outlook (Yang). Slide PDFs linked per section; full deck at tinyurl.com/language-agent-tutorial-2024; recording at tinyurl.com/agent-tutorial-recording-2024.
- Published as tutorial abstracts: EMNLP 2024, ACL, pages 17–24.
- Explicitly not a survey or code-framework practitioner guide — conceptual synthesis instead.
- Lineage notes: Yao is ReAct's author ([[react]]); Yang is CS224n co-instructor, tying this directly into the CS224n syllabus.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 2 passages in this section could not be located in the stored source ([https://language-agent-tutorial.github.io/](https://language-agent-tutorial.github.io/)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "...they gain a new capability of *using language as a vehicle for reasoning and communication*, which substantially improves their expressiveness and adaptivity. Therefore, they are best called **language agents**, for language being their most distinct trait."

> "Some think it's the next big thing, while others think these agents are just thin wrappers around LLMs."

## Concepts Introduced or Referenced

- [[ai-agents]] — supplies the field-level framing behind Anthropic's tool-loop definition; canonical citation for the term "language agents."
- [[react]] — Thought→Act→Observe loop is the tutorial's foundational mechanism, presented by its creator.
- [[tool-use]] / [[function-calling]] — the action space through which language agents ground in environments.
- [[deep-agents]] / [[reasoning-llms]] — natural extensions of its foundations→frontier arc.

## Critical Assessment

Strength: authoritative multi-perspective synthesis by the subfield's core contributors; balanced hype-vs-skepticism framing. Limitation (self-declared): not exhaustive nor implementation-focused — pair with [[source-building-effective-agents]] and [[source-effective-context-engineering-for-ai-agents]] for engineering guidance. No contradictions with existing wiki content.

---

**Source:** Language Agents: Foundations, Prospects, and Risks (EMNLP 2024 Tutorial) by Yu Su, Diyi Yang, Shunyu Yao, Tao Yu — <https://language-agent-tutorial.github.io/>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
