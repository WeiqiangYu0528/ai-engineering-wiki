---
type: entity
title: "Anthropic"
summary: Anthropic is an AI safety and research company founded in 2021 by former OpenAI researchers (including Dario Amodei, Daniela Amodei, and Amanda Askell).
status: draft
visibility: public
entity-type: organization
tags:
  - llm-fundamentals
  - fine-tuning
  - agents
  - eval-safety
created: 2026-08-23
updated: 2026-08-24
url: "https://anthropic.com"
related:
  - "[[alignment]]"
  - "[[ai-agents]]"
  - "[[ai-workflows]]"
  - "[[claude-code]]"
  - "[[inference]]"
  - "[[tool-use]]"
  - "[[context-engineering]]"
aliases:
  - wiki/anthropic
---

<aside class="kb-header kb-type-entity" aria-label="Page information">
<p class="kb-type">Entity</p>
<p class="kb-summary">Anthropic is an AI safety and research company founded in 2021 by former OpenAI researchers (including Dario Amodei, Daniela Amodei, and Amanda Askell).</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/fine-tuning/concepts/alignment">AI Alignment</a></li><li><a href="/agents/concepts/ai-agents">AI Agents</a></li><li><a href="/agents/concepts/ai-workflows">AI Workflows</a></li><li><a href="/agents/concepts/claude-code">Claude Code</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/agents/concepts/context-engineering">Context Engineering</a></li></ul></nav>
</aside>

## Overview
**Anthropic** is an AI safety and research company founded in 2021 by former OpenAI researchers (including Dario Amodei, Daniela Amodei, and Amanda Askell). Anthropic is the creator of the **Claude** family (including Sonnet 4.5), pioneered **Constitutional AI (RLAIF)**, established the Model Context Protocol (MCP), and developed the **Claude Code** agentic development environment. In Sep 2025 it authored the canonical post on **context engineering** [[source-effective-context-engineering-for-ai-agents]] defining the attention-budget / context-rot mental model for [[ai-agents]].

## Key Facts
- **Claude Model Series:** Includes Claude 3, 3.5, and 3.7 (Opus, Sonnet, Haiku) and Sonnet 4.5, leading global benchmarks in coding, reasoning, and multi-turn tool use.
- **Constitutional AI & Alignment:** Pioneered RL from AI Feedback (RLAIF) and the 3H alignment framework (Helpful, Honest, Harmless), using a written set of principles (a "constitution") to guide self-critique and reward modeling.
- **Claude Code & Agentic Workflows:** Developed [[claude-code]], an autonomous CLI agent incorporating prompt caching, subagent dispatch, and repository-level context engineering — including hybrid CLAUDE.md JIT, compaction, and file-based memory tool (Sonnet 4.5 beta) showcased in the Effective Context Engineering blog.
- **Model Context Protocol (MCP):** Open-standard protocol enabling LLM agents to securely interact with local filesystems, developer tools, database connections, and external APIs — part of the context state per the blog.
- **Prompt Caching & Context Management:** Introduced server-side prompt caching (90% cost reduction) and, with Sonnet 4.5, a memory tool + context-management / tool-result clearing features for long-horizon agents (see https://platform.claude.com/cookbook/tool-use-memory-cookbook).
- **Context Engineering Canon (Sep 2025):** Published *Effective context engineering for AI agents* defining context rot, attention budget ($n^2$), right altitude, smallest high-signal set, JIT vs hybrid retrieval, and compaction/note-taking/sub-agent triad.
- **Agentic Systems Taxonomy (Dec 2024):** Published *Building effective agents* defining workflows (prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer) vs agents, augmented LLM building block via MCP, three core principles (simplicity, transparency, ACI), and when to use frameworks vs direct LLM APIs.

## Significance in AI Engineering
- Leading pioneer in frontier agentic coding capabilities (Sonnet 3.5/3.7) and structured multi-agent systems.
- Created foundational open standards (MCP) and cost-saving serving primitives (Prompt Caching) widely adopted across the industry.

## Related Concepts
- [[context-engineering]]
- [[ai-agents]]
- [[alignment]]
- [[claude-code]]
- [[tool-use]]
- [[inference]]
- [[prompt-engineering]]

## Sources
- [[source-building-effective-agents]]
- [[source-prompt-caching]]
- [[source-effective-context-engineering-for-ai-agents]]
- [[source-maximizing-the-value-of-your-claude-code-sessions]]
- [[source-training-language-models-to-follow-instructions-with-human-feedback]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
