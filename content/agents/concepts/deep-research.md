---
type: concept
title: "Deep Research Agent"
summary: Deep Research Agent (OpenAI Deep Research, launched with proprietary o3 — RL-trained to browse, reason, plan, backtrack, adapt — plus Python and web browsing tools, lightweight o4-mini variant, Apr 2025 quotas) is an…
visibility: public
aliases:
  - Deep Research
  - OpenAI Deep Research
  - Agentic Research System
  - wiki/deep-research
tags:
  - agents
  - rag
  - prompt-engineering
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-guides-deep-research]]"
related:
  - "[[ai-agents]]"
  - "[[deep-agents]]"
  - "[[reasoning-llms]]"
  - "[[retrieval-augmented-generation]]"
  - "[[context-engineering]]"
  - "[[tool-use]]"
  - "[[inference]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Deep Research Agent (OpenAI Deep Research, launched with proprietary o3 — RL-trained to browse, reason, plan, backtrack, adapt — plus Python and web browsing tools, lightweight o4-mini variant, Apr 2025 quotas) is an…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/agents/concepts/ai-agents">AI Agents</a></li><li><a href="/agents/concepts/deep-agents">Deep Agents</a></li><li><a href="/agents/concepts/reasoning-llms">Reasoning LLMs</a></li><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li><li><a href="/agents/concepts/context-engineering">Context Engineering</a></li><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/agents/sources/source-promptingguide-guides-deep-research">OpenAI Deep Research Guide — Prompt Engineering Guide (DAIR.AI) Guides</a></li></ul></nav>
</aside>

## Overview
**Deep Research Agent** (OpenAI Deep Research, launched with proprietary **o3** — RL-trained to browse, reason, plan, backtrack, adapt — plus **Python** and **web browsing** tools, lightweight **o4-mini** variant, Apr 2025 quotas) is an **agentic Search → Analyze → Synthesize → Report/Insights/Action-Plan system** over hundreds of live sources. It supports file uploads, plot generation, and citation embedding (graph embed pending), completes multi-hour human research in minutes, and exposes quotas (Pro 250/mo, Plus/Team/Enterprise/Edu 25/mo, Free 5 lightweight, fallback to lightweight) via the flow chart `deep_research_flowchart.JPG` and YouTube `wovjVUnYfic`. The DAIR guide distills when/how to prompt it (dense keywords, action verbs, explicit formats), 10 live share reports, and DIY alternatives (Gemini Deep Research, Flowise/LlamaIndex/crewAI/n8n/LangGraph) with benchmark pointer (Humanity's Last Exam vs o3-mini-high).

## Key Ideas
- **Training & tools:** RL for effective browsing + complex-information reasoning + multi-step planning/execution/backtracking; tools Python (plots) + browsing; user files as context; citations.
- **Flow:** Search (keyword-driven queries) → reasoning → analysis → synthesis → report/insights/action plan. Image flow: plan → iterative search/browse → reason → plot → synthesize.
- **Access tiers:** Pro 250/mo (was 120), Plus/Team/Enterprise/Edu 25/mo (was 10), Free 5 lightweight (o4-mini) — Apr 24 2025 expansion; once capped, queries auto-fallback to lightweight. Not yet API-exposed proprietary o3 variant.
- **Use-case map:** Professional (market/competitive/policy/engineering), Consumer (product recommendations/comparisons), Academic (literature review, gap finding, trends, source verification), Knowledge Work (complex QA, file augmentation, reports/docs, feasibility studies, synthesis) — word cloud artifact `769190…`, 10 shares (GitHub repos analysis 2025-05-08, Top AI Agent Frameworks, AI-Driven Scientific Discovery, OpenAI vs Gemini, AI Education trends, YC startup ideas, DeepSeek-R1 Guide, CrewAI Study Plan, LLM Pricing Trends, Recent Papers on o1/DeepSeek-R1 via `chatgpt.com/share/...`).
- **Decision rule:** Use Deep Research for **multi-faceted, domain-specific, real-time, reasoning-heavy** research; else **o1-mini** for decomposed reasoning sketches, **GPT-4o** for simple one-offs.
- **Prompting recipe:** Clear specific plan; answer its clarification questions (`deep_research_clarify.JPG`); keyword-dense search terms (brands, technical terms); precise verbs (`compare/suggest/recommend/report`); explicit report/table format (sections, columns/headers); upload PDFs for niche domains; **always verify sources** (can confuse authority vs speculation).
- **Alternatives:** Gemini Deep Research (dedicated agentic), or DIY stacks (Flowise, LlamaIndex, crewAI, n8n, LangGraph) with o1/o3-mini may be cheaper/integrable but lack proprietary o3 reasoning.

## How It Works
```
User prompt (specific plan + keywords + verbs + output format + files)
   │
   ▼
Deep Research (o3) — clarifies if uncertain → plans subtasks/search queries
   │
   ├── Browse (iterative web search + read) → reasoning → adapt/backtrack → Python plots
   │
   ▼
Synthesize hundreds of sources → generate citations + graphs → report/insights/action plan
   │
   ▼
[Human verifies citations + reruns with refined format if needed]
```

## Practical Implications
- **Prompt economics:** Vague plans waste expensive deep-research calls — invest upfront in keyword lists and format specs; treat clarification answers as mandatory.
- **Verification layer:** Citations assist but not guarantee authority; intellectual-property/legal/medical claims need human source audit.
- **Build vs buy:** For embedded workflows needing custom tools or cost control, lean DIY orchestration; for maximal reasoning quality, use hosted Deep Research despite opaque proprietary o3.
- **File-augmentation loop:** Uploading a draft doc then asking to "augment and fill gaps" is a high-leverage pattern (guide notes ChatGPT-4o file context helps steer).

## Connections
- Instantiates [[ai-agents]] / [[deep-agents]] orchestrator-worker pattern with reasoning planner.
- Powered by [[reasoning-llms]] (o3/o4-mini; cf. [[thinking-models]] test-time scaling) and implements web-scale [[retrieval-augmented-generation]] + [[tool-use]] (browsing, code).
- Context design follows [[context-engineering]] (keyword placement, file-augmented context, format schemas).
- Cost/latency governed by [[inference]] reasoning tokens.

## Open Questions
- Can citation accuracy be auto-scored at scale to gate human verification load?
- How does o4-mini lightweight quality degrade on citation fidelity vs full o3 — when is fallback acceptable?

## Sources
- [[source-promptingguide-guides-deep-research]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
