---
type: source-summary
title: "Introduction to AI Agents — Prompt Engineering Guide (DAIR.AI)"
summary: Introductory guide defining AI agents as LLM-powered systems that autonomously take actions via planning, tool access, and memory.
status: verified
visibility: public
author: "Elvis Saravia / DAIR.AI"
source-type: article
url: "https://www.promptingguide.ai/agents/introduction"
date-published: 2025-03-01
date-ingested: 2026-08-24
tags:
  - agents
  - prompt-engineering
key-concepts:
  - "[[ai-agents]]"
  - "[[agent-components]]"
  - "[[tool-use]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-agents-introduction
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Introductory guide defining AI agents as LLM-powered systems that autonomously take actions via planning, tool access, and memory.</p>
<p class="kb-provenance">Elvis Saravia / DAIR.AI, 2025-03-01. <a href="https://www.promptingguide.ai/agents/introduction">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
Introductory guide defining AI agents as LLM-powered systems that autonomously take actions via planning, tool access, and memory. Contrasts narrow LLM text generation with agentic handling of multi-step, information-seeking tasks (e.g., marketing strategy, customer support). Enumerates industry use cases and positions agents as the bridge between static model knowledge and dynamic real-world execution.

## Key Takeaways
1. **Agent definition:** LLM + planning/reflection + [[tool-use]] + memory — not just text generation.
2. **Why agents:** Standalone LLMs lack real-time data, multi-step planning, and external tool integration required for broad tasks.
3. **Three core capabilities:** Planning & reflection, tool utilization, memory management (detailed in [[agent-components]]).
4. **Representative use cases:** Recommendation, customer support, research, e-commerce, booking, reporting, financial analysis.

## Detailed Notes
- Frame: Agents “revolutionizing” complex-task automation by orchestrating LLMs to work on behalf of users.
- Visual: `agent-components.png` showing planning / tools / memory triad.
- **Limitations of LLMs alone:** Excellent at translation/email generation; fail at workflows requiring sequential reasoning, latest data, and company-internal sources.
- Example contrast: Developing a marketing strategy requires competitor research, trend analysis, and internal data — all beyond parametric knowledge.
- Explicit list of agent capabilities:
  - Planning/reflection: break down problems, adjust based on new information
  - Tool access: databases, APIs, apps
  - Memory: store/retrieve past experience
- Non-exhaustive use-case catalog (7 items) demonstrates breadth across consumer and enterprise domains.
- CTA for DAIR.AI Academy course with PROMPTING20 code — indicates commercial context.

## Notable Quotes
> "In this guide, we refer to an agent as an LLM-powered system designed to take actions and solve complex tasks autonomously." — Prompt Engineering Guide

> "AI agents bridge this gap by combining the capabilities of LLMs with additional features such as memory, planning, and external tools."

## Concepts Introduced or Referenced
- [[ai-agents]] — core definition and motivation
- [[agent-components]] — planning, tools, memory triad previewed
- [[tool-use]] — interaction with external systems as differentiator from pure LLM
- [[prompt-engineering]] — implied need for orchestration beyond prompting

## Critical Assessment
**Strengths:** Crisp definition, clear before/after (LLM vs agent), useful taxonomy of use cases. Good onboarding for later deep dives (components, workflows vs agents).
**Weaknesses:** High-level; no discussion of failure modes, evaluation, or cost/latency. Marketing CTA repeated. No treatment of autonomy risks or [[prompt-injection]].
**Contradictions:** None with existing wiki; aligns with [[tool-use]] (“LLM OS”) and [[model-context-protocol]] framing. Complements [[thinking-models]] on planning.

## Sources
- Raw: [https://www.promptingguide.ai/agents/introduction](https://www.promptingguide.ai/agents/introduction)

---

**Source:** Introduction to AI Agents — Prompt Engineering Guide (DAIR.AI) by Elvis Saravia / DAIR.AI — <https://www.promptingguide.ai/agents/introduction>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
