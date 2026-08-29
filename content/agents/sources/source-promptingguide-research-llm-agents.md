---
type: source-summary
title: "LLM Agents — Prompt Engineering Guide Research"
summary: Research summary of LLM-based agents from the Prompt Engineering Guide.
status: verified
visibility: public
author: "DAIR.AI (Prompt Engineering Guide)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/llm-agents.en.mdx"
date-published: 2024-02-01
date-ingested: 2026-08-24
tags:
  - agents
  - prompt-engineering
  - rag
key-concepts:
  - "[[ai-agents]]"
  - "[[agent-components]]"
  - "[[tool-use]]"
  - "[[retrieval-augmented-generation]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-research-llm-agents
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Research summary of LLM-based agents from the Prompt Engineering Guide.</p>
<p class="kb-provenance">DAIR.AI (Prompt Engineering Guide), 2024-02-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/llm-agents.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
Research summary of LLM-based agents from the Prompt Engineering Guide. Extends simple LLM or [[retrieval-augmented-generation]] answers to complex multi-step tasks (e.g., decade obesity trends + chart) by centering an LLM as coordinator/brain with planning, memory, and tool-use modules. Outlines a general agent framework (user request → agent/brain → planning/memory/tools → observations) and surveys domain applications from chemistry (ChemCrow) to coding (ChatDev, MetaGPT) and science automation.

## Key Takeaways
1. **LLM as brain + three core modules** — planning, memory, and tools are required for complex tasks that RAG alone cannot solve.
2. **Planning split into without-feedback (Chain-of-Thought, Tree-of-Thoughts) vs with-feedback (ReAct, Reflexion)** — feedback enables long-horizon iterative correction.
3. **Memory duality** — short-term via in-context learning (bounded by window) vs long-term via scaled vector-store retrieval; hybrid memory enables long-range reasoning; formats include natural language, embeddings, DBs, and key-value hybrids (e.g., GITM).
4. **Tool taxonomy** — MRKL, Toolformer, [[function-calling]], and HuggingGPT illustrate distinct tool-integration strategies; tools enable interaction with search APIs, code interpreters, DBs, and specialist models.
5. **Application breadth** — ChemCrow, Generative Agents/AgentSims, Blind Judgement, Horton economic simulation, Boiko lab automation, ChatDev/ToolLLM/MetaGPT coding, D-Bot DBA, and IELLLM oil/gas demonstrate agents generalize across chemistry, simulation, law, and software engineering.

## Detailed Notes
### Motivation
- Simple factual Q&A can be answered by an LLM directly or with RAG. Complex queries requiring trend analysis, data synthesis, and visualization demand decomposition into subtasks with tool orchestration and state tracking — motivating LLM agents.

### Agent Framework
- Four core components: User Request, Agent/Brain (LLM coordinator activated via prompt template with tool specs; optionally profiled/persona via handcrafting, LLM-generated, or data-driven), Planning, Memory. Tools are the execution layer.

### Planning
- **Without feedback:** Task decomposition via [[chain-of-thought]] (single-path) and [[tree-of-thoughts]] (multi-path) — formalized in Wang et al. 2023.
- **With feedback:** Iterative reflection/refinement using environment/human/model feedback; ReAct interleaves Thought→Action→Observation; Reflexion adds critique layer.

### Memory
- Short-term = current context; Long-term = external vector store for past behaviors/thoughts; Hybrid integrates both. Memory formats varied and can be combined.

### Tools
- Surveyed approaches: MRKL (LLM + symbolic experts), Toolformer (fine-tuned tool API use), Function Calling (tool-spec injection), HuggingGPT (LLM as task planner connecting specialist models).

### Applications
- Table of ~15 agent systems spanning mental well-being, economic simulation, social simulation, legal prediction, research assistance, chemistry, lab automation, math education, 3D construction, coding, and database administration.

## Notable Quotes
> "LLM based agents involve LLM applications that can execute complex tasks through the use of an architecture that combines LLMs with key modules like planning and memory."

## Concepts Introduced or Referenced
- [[ai-agents]] — canonical definition and contrast with workflows, expanded with agent-framework detail.
- [[agent-components]] — planning/memory/tools decomposition deepened.
- [[ai-workflows]] — contrasted as fixed-path vs agent dynamic control.
- [[chain-of-thought]] / [[tree-of-thoughts]] / [[react]] / [[reflexion]] — planning primitives.
- [[tool-use]] / [[function-calling]] — tool integration mechanisms.
- [[retrieval-augmented-generation]] — shown insufficient alone for complex multi-step tasks.

## Critical Assessment
Strong conceptual synthesis with health-query motivating example and component diagram. Limitations: survey-style applications list lacks performance numbers; tool section references are brief without trade-off analysis. Complements [[source-promptingguide-agents-introduction]] and [[source-promptingguide-agents-components]] with added tool taxonomy and application coverage. No contradictions with existing wiki; strengthens links between rag, agents, and prompt-engineering.

---

**Source:** LLM Agents — Prompt Engineering Guide Research by DAIR.AI (Prompt Engineering Guide) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/llm-agents.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
