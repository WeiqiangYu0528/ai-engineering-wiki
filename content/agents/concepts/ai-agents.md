---
type: concept
title: "AI Agents"
summary: AI Agents are LLM-powered systems defined by Anthropic in Effective Context Engineering for AI Agents as LLMs autonomously using tools in a loop, generating more and more candidate context that must be cyclically…
visibility: public
aliases:
  - LLM Agents
  - Autonomous Agents
  - Agentic Systems
  - wiki/ai-agents
tags:
  - agents
  - prompt-engineering
created: 2026-08-24
updated: 2026-08-26
status: draft
sources:
  - "[[source-building-effective-agents]]"
  - "[[source-effective-context-engineering-for-ai-agents]]"
  - "[[source-promptingguide-agents-introduction]]"
  - "[[source-promptingguide-agents-components]]"
  - "[[source-promptingguide-agents-ai-workflows-vs-ai-agents]]"
  - "[[source-promptingguide-agents-context-engineering]]"
  - "[[source-promptingguide-agents-deep-agents]]"
  - "[[source-promptingguide-research-llm-agents]]"
  - "[[source-promptingguide-research-thoughtsculpt]]"
  - "[[source-language-agents-foundations-prospects-risks]]"
related:
  - "[[react]]"
  - "[[context-engineering]]"
  - "[[context-caching]]"
  - "[[deep-agents]]"
  - "[[agent-components]]"
  - "[[ai-workflows]]"
  - "[[tool-use]]"
  - "[[function-calling]]"
  - "[[model-context-protocol]]"
  - "[[reasoning-llms]]"
  - "[[claude-code]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">AI Agents are LLM-powered systems defined by Anthropic in Effective Context Engineering for AI Agents as LLMs autonomously using tools in a loop, generating more and more candidate context that must be cyclically…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/react">ReAct (Reasoning + Acting)</a></li><li><a href="/agents/concepts/context-engineering">Context Engineering</a></li><li><a href="/inference/concepts/context-caching">Context Caching</a></li><li><a href="/agents/concepts/deep-agents">Deep Agents</a></li><li><a href="/agents/concepts/agent-components">Agent Components</a></li><li><a href="/agents/concepts/ai-workflows">AI Workflows</a></li><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/agents/concepts/function-calling">Function Calling</a></li><li><a href="/agents/concepts/model-context-protocol">Model Context Protocol</a></li><li><a href="/agents/concepts/reasoning-llms">Reasoning LLMs</a></li><li><a href="/agents/concepts/claude-code">Claude Code</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/agents/sources/source-building-effective-agents">Building effective agents</a></li><li><a href="/agents/sources/source-effective-context-engineering-for-ai-agents">Effective Context Engineering for AI Agents</a></li><li><a href="/agents/sources/source-promptingguide-agents-introduction">Introduction to AI Agents — Prompt Engineering Guide (DAIR.AI)</a></li><li><a href="/agents/sources/source-promptingguide-agents-components">Agent Components — Prompt Engineering Guide (DAIR.AI)</a></li><li><a href="/agents/sources/source-promptingguide-agents-ai-workflows-vs-ai-agents">AI Workflows vs. AI Agents — Prompt Engineering Guide (DAIR.AI)</a></li><li><a href="/agents/sources/source-promptingguide-agents-context-engineering">Why Context Engineering? — Prompt Engineering Guide (DAIR.AI)</a></li><li><a href="/agents/sources/source-promptingguide-agents-deep-agents">Deep Agents — Prompt Engineering Guide (DAIR.AI)</a></li><li><a href="/agents/sources/source-promptingguide-research-llm-agents">LLM Agents — Prompt Engineering Guide Research</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-research-thoughtsculpt">THOUGHTSCULPT — Reasoning with Intermediate Revision and Search</a></li><li><a href="/agents/sources/source-language-agents-foundations-prospects-risks">Language Agents: Foundations, Prospects, and Risks (EMNLP 2024 Tutorial)</a></li></ul></nav>
</aside>

## Overview
**AI Agents** are LLM-powered systems defined by [[anthropic]] in [[source-effective-context-engineering-for-ai-agents]] as **LLMs autonomously using tools in a loop**, generating more and more candidate context that must be cyclically curated — and taxonomized in [[source-building-effective-agents]] (Dec 19, 2024) as the **autonomous pole** opposite **workflows** (LLMs/tools orchestrated via predefined code paths) within a unified *agentic systems* spectrum. Going beyond static text generation via planning & reflection, [[tool-use]]/[[function-calling]], and memory, they handle multi-turn, long-horizon tasks requiring real-time data, tool orchestration, and adaptive decision-making (e.g., research, customer support, financial analysis, Claude Code migrations) that standalone LLMs cannot. Anthropic notes the field has now converged on this simple tool-loop definition.

## Key Ideas
- **Definition (Anthropic 2025):** *LLMs autonomously using tools in a loop* — the loop generates ever more candidate context that must be **cyclically refined** via [[context-engineering]] (finite attention budget, context rot). Earlier three-pillars view (planning, tools, memory) from [[agent-components]] is subsumed under this loop.
- **Why agents vs LLMs alone:** LLMs excel at narrow tasks (translation, email) but lack access to latest info, company data, and sequential reasoning; agents bridge this via external tools and iterative planning — and with smarter models, autonomy can scale (more nuanced navigation, error recovery).
- **Agents vs [[ai-workflows]]:** Agents dynamically direct their own processes and tool usage (LLM-driven reasoning, self-selected tools, flexible execution); workflows use predefined code paths for predictable, well-bounded tasks. Hybrids are common: workflow routes to specialized agents (e.g., deep research orchestrator → sub-agents).
- **Context retrieval spectrum:** Pre-retrieval (embedding upfront, fast) vs **just-in-time (JIT)** (lightweight refs like file paths/queries loaded via tools at runtime, e.g., Claude Code using `head`/`tail` and glob/grep) vs hybrid (CLAUDE.md upfront + grep JIT) — with progressive disclosure via metadata (naming, hierarchy, timestamps) — central to [[context-engineering]].
- **Long-horizon coherence triad:** For tasks exceeding window limits (migrations, research), agents rely on **compaction** (summarize + reinit + 5 recent files), **structured note-taking / agentic memory** (file-based NOTES.md, Sonnet 4.5 memory tool, Pokémon 1,234-step demo), and **sub-agent architectures** (specialists with clean windows returning 1–2k summaries) — all detailed in [[source-effective-context-engineering-for-ai-agents]].
- **Canonical prompting paradigm — ReAct:** **[[react]]** (Yao et al., 2022) formalizes the Thought-Act-Obs loop as $\hat{\mathcal{A}}=\mathcal{A}\cup\mathcal{L}$ (dense for HotpotQA/Fever with Wikipedia `search`/`lookup`/`finish`, sparse for ALFWorld/WebShop) and shows PaLM-540B 71% ALFWorld (vs Act 45%, BUTLER 37%) and WebShop 40.0 SR (vs IL+RL 28.7) with only 1–6 examples — grounding hallucinations (14%→6% false-positive) while finetuning ReAct on 3k trajectories makes PaLM-8B > all 62B prompting.
- **"Language agents" framing ([[source-language-agents-foundations-prospects-risks]]):** Su, Yang, Yao & Yu's EMNLP 2024 tutorial argues contemporary agents are qualitatively new because integrating LLMs gives them *language as a vehicle for reasoning and communication* — improving expressiveness and adaptivity vs logical/neural agent generations — hence "language agents," not thin wrappers. Its foundations triad (reasoning + memory + planning) maps onto the pillars above, and it treats safety/social impact as first-class alongside capabilities; presented by ReAct's author ([[react]]) and CS224n co-instructor Diyi Yang.
- **Use-case spectrum:** Recommendation, customer support, deep research, e-commerce, booking, reporting, financial analysis, agentic RAG, coding agents, data analysis.

## How It Works
```
User request (e.g., "Add meeting with John tomorrow 2PM")
        │
        ▼
[ Reasoning Engine (LLM) — plans, reflects, critiques progress ]
        │
        ├──→ [ Memory — short-term buffer + long-term vector store ]
        │
        └──→ [ Tool Access — web search, DB, sheets, APIs via function calling / MCP ]
                  │
                  ▼
        Observation → Decision loop (Action → Observation → Decide)
                  │
                  ▼
        Final grounded response / side-effect
```
- Agent loop retains full conversation context; each tool observation feeds next decision (see [[function-calling]]).
- Planning enables breaking complex goals into subtasks and adjusting based on tool outputs.

## Practical Implications
- **Design choice:** Use agents for open-ended, variable-path problems where flexibility > predictability; prefer [[ai-workflows]] when reliability, explicit control, and debuggability dominate. Choose per component.
- **Reliability levers:** Success hinges on [[context-engineering]] (system prompts, constraints, tool descriptions), observability, and guardrails — not just model choice.
- **Risk amplification:** Autonomous tool access magnifies [[prompt-injection]] / [[adversarial-prompting]] impact — require sandboxing, approvals, verification.

## Connections
- Decomposed via [[agent-components]] (planning, tools, memory); framework from [[source-promptingguide-research-llm-agents]] adds MRKL/Toolformer/HuggingGPT tool taxonomy and 15-system application survey (ChemCrow, AgentSims, MetaGPT etc.).
- Contrasted with [[ai-workflows]] (prompt chaining, routing, parallelization); extended to [[deep-agents]] (planning + orchestrator/sub-agents + persistent memory).
- Powered by [[tool-use]] / [[function-calling]] and standardized via [[model-context-protocol]].
- Planning increasingly uses [[reasoning-llms]] / [[thinking-models]] and graph search via [[thoughtsculpt]] for deliberation.
- Field-level synthesis from [[source-language-agents-foundations-prospects-risks]]; engineering-level complements are [[source-building-effective-agents]] and [[source-effective-context-engineering-for-ai-agents]].

## Open Questions
- How to formally guarantee task completion without silent skipping (strict vs flexible execution rules)?
- What eval harness best captures long-horizon agent reliability beyond per-step accuracy?

## Sources
- [[source-react-synergizing-reasoning-and-acting]]
- [[source-promptingguide-agents-introduction]]
- [[source-promptingguide-agents-components]]
- [[source-promptingguide-agents-ai-workflows-vs-ai-agents]]
- [[source-promptingguide-agents-context-engineering]]
- [[source-promptingguide-agents-deep-agents]]
- [[source-promptingguide-research-llm-agents]]
- [[source-promptingguide-research-thoughtsculpt]]
- [[source-language-agents-foundations-prospects-risks]] — EMNLP 2024 tutorial defining "language agents" and systematizing foundations, applications, risks.

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/agents/concepts/agent-components">Agent Components</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
