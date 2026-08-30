---
type: source-summary
title: "Agent Components — Prompt Engineering Guide (DAIR.AI)"
summary: "Concise decomposition of AI agents into three pillars: planning (the brain), tool utilization, and memory systems (short-term/working vs long-term/vector-store)."
status: verified
visibility: public
author: "Elvis Saravia / DAIR.AI"
source-type: article
url: "https://www.promptingguide.ai/agents/components"
date-published: 2025-03-01
date-ingested: 2026-08-24
tags:
  - agents
key-concepts:
  - "[[agent-components]]"
  - "[[ai-agents]]"
  - "[[tool-use]]"
  - "[[context-engineering]]"
key-entities: []
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-agents-components
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Concise decomposition of AI agents into three pillars: planning (the brain), tool utilization, and memory systems (short-term/working vs long-term/vector-store).</p>
<p class="kb-provenance">Elvis Saravia / DAIR.AI, 2025-03-01. <a href="https://www.promptingguide.ai/agents/components">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
Concise decomposition of AI agents into three pillars: planning (the brain), tool utilization, and memory systems (short-term/working vs long-term/vector-store). Details modern LLM planning functions (task decomposition, self-reflection, adaptive learning) and enumerates tool classes and memory roles, stressing that synergy among the three underpins functional agents despite current limitations.

## Key Takeaways
1. **Planning = Brain:** LLMs enable chain-of-thought decomposition, self-reflection, adaptive learning, and progress critique — essential for automation; without it agents cannot complete complex tasks.
2. **Tool utilization:** Agents must know *when and how* to select tools (code interpreters, web search/scraping, calculators, image generation); selection/timing is a core LLM capability.
3. **Memory duality:** Short-term (working) memory acts as in-context buffer for continuity; long-term memory via external vector stores enables fast retrieval of historical information, less common but increasingly important.
4. **Synergy view:** Effective agents emerge from interplay of all three components, not any single one.

## Detailed Notes
- Frame: “Three fundamental capabilities” diagram (`agent-components.png`) reused from introduction.
- **Planning details:**
  - Task decomposition via CoT
  - Self-reflection on past actions
  - Adaptive learning for future decisions
  - Critical analysis of current progress
  - Caveat: “planning capabilities aren't perfect, they're essential”
- **Tool utilization:**
  - Emphasis on *appropriateness* of use, not mere access
  - Four exemplars: code interpreters/environments, web search/scraping, calculators, image generation
  - Planning→tools bridge: tools turn abstract strategies into concrete results
- **Memory systems:**
  - Short-term: buffer for immediate context, enables [[in-context-learning]], sufficient for most tasks, maintains iteration continuity
  - Long-term: external vector stores, fast retrieval, valuable for future tasks, “less commonly implemented but potentially crucial”
  - Memory enables storage/retrieval of tool outputs for iterative improvement
- Closing: Acknowledges limitations per component, predicts three pillars will remain fundamental even as new memory types emerge.

## Notable Quotes
> "AI agents require three fundamental capabilities to effectively tackle complex tasks: planning abilities, tool utilization, and memory management."

> "The synergy between planning capabilities, tool utilization, and memory systems forms the foundation of effective AI agents."

## Concepts Introduced or Referenced
- [[agent-components]] — central concept detailed
- [[ai-agents]] — parent system context
- [[tool-use]] / [[function-calling]] — external capability extension
- [[context-engineering]] — implicit memory/window management
- [[thinking-models]] — planning via CoT/reflection

## Critical Assessment
**Strengths:** Minimal, memorable triad; clearly separates working vs long-term memory; ties planning explicitly to CoT.
**Weaknesses:** Very brief (54 lines); no concrete architecture diagram beyond image, no evaluation metrics, no discussion of [[model-context-protocol]] or persistent storage trade-offs covered later in deep-agents.
**Contradictions:** None; consistent with [[source-promptingguide-agents-introduction]] and later [[deep-agents]] which expands memory to files/vectors/DBs.

## Sources
- Raw: [https://www.promptingguide.ai/agents/components](https://www.promptingguide.ai/agents/components)

---

**Source:** Agent Components — Prompt Engineering Guide (DAIR.AI) by Elvis Saravia / DAIR.AI — <https://www.promptingguide.ai/agents/components>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
