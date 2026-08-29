---
type: concept
title: "Claude Code"
summary: Claude Code is an agentic coding CLI tool developed by Anthropic that operates directly in the developer's terminal.
visibility: public
aliases:
  - Agentic Coding
  - Claude CLI
  - CLAUDE.md
  - wiki/claude-code
tags:
  - agents
  - mlops
  - prompt-engineering
created: 2026-08-23
updated: 2026-08-24
status: draft
sources:
  - "[[source-maximizing-the-value-of-your-claude-code-sessions]]"
  - "System Prompts — Anthropic (Claude Sonnet 4.5 + Claude Code) — x1xhlol/system-prompts-and-models-of-ai-tools"
  - "[[source-effective-context-engineering-for-ai-agents]]"
  - "[[source-prompt-caching]]"
related:
  - "[[tool-use]]"
  - "[[inference]]"
  - "[[prompt-engineering]]"
  - "[[system-prompt]]"
  - "[[context-engineering]]"
  - "[[prompt-caching]]"
  - "[[anthropic]]"
  - "[[adversarial-prompting]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Claude Code is an agentic coding CLI tool developed by Anthropic that operates directly in the developer's terminal.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/prompt-engineering/concepts/system-prompt">System Prompt</a></li><li><a href="/agents/concepts/context-engineering">Context Engineering</a></li><li><a href="/inference/concepts/prompt-caching">Prompt Caching</a></li><li><a href="/llm-fundamentals/entities/anthropic">Anthropic</a></li><li><a href="/eval-safety/concepts/adversarial-prompting">Adversarial Prompting</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-maximizing-the-value-of-your-claude-code-sessions">Maximizing the value of your Claude Code sessions</a></li><li><a href="/agents/sources/source-effective-context-engineering-for-ai-agents">Effective Context Engineering for AI Agents</a></li><li><a href="/inference/sources/source-prompt-caching">Prompt caching — Anthropic Claude Platform</a></li></ul></nav>
</aside>

## Overview
**Claude Code** is an agentic coding CLI tool developed by [[anthropic]] that operates directly in the developer's terminal. It empowers Claude to autonomously navigate repositories, read/edit files, execute shell commands, run tests, and manage multi-turn development workflows using native prompt caching and subagent isolation. Its behavior is governed by a concise **13 KB system prompt** (leaked as `Anthropic/Claude Code/Prompt.txt` in System Prompts — Anthropic (Claude Sonnet 4.5 + Claude Code) — x1xhlol/system-prompts-and-models-of-ai-tools) that enforces terse CLI output, defensive-security scope, and mandatory planning/editing discipline — the OS kernel for the agent loop.

## Key Ideas
- **System Prompt as OS Kernel (from leaked `Claude Code/Prompt.txt`):** The prompt opens *You are an interactive CLI tool that helps users with software engineering tasks* and immediately scopes to **defensive security only** (`Refuse to create, modify, or improve code that may be used maliciously`). It mandates `<4 lines` answers unless detail requested, monospace markdown, and explanation of non-trivial bash commands — a stark contrast to the chat model's 43 KB conversational persona in System Prompts — Anthropic (Claude Sonnet 4.5 + Claude Code) — x1xhlol/system-prompts-and-models-of-ai-tools's Sonnet 4.5 prompt. This terse doctrine is itself a [[system-prompt]] pattern: verbosity control as instruction hierarchy.
- **Tool-Usage Doctrine Codified in Prompt:** The prompt explicitly lists and ranks tools: `TodoWrite` is *compulsory* for planning (`Always use the TodoWrite tool to plan and track tasks`), `Task` tool preferred for file search, `Read/Edit` (`str_replace_editor`) for file ops, `Bash` reserved for system commands, package-manager mandates per language (`npm/pip/cargo/go/gem/composer/dotnet/maven`). It also encodes code-reference conventions (`file_path:line_number`) and *never guess URLs* safety rule (see System Prompts — Anthropic (Claude Sonnet 4.5 + Claude Code) — x1xhlol/system-prompts-and-models-of-ai-tools).
- **Context Accumulation Dynamics:** Unlike traditional stateless chat interfaces, an agentic coding session continually appends tool executions, file contents, and bash stdout into the working context. This makes long sessions progressively more expensive if not actively managed via [[context-engineering]].
- **Prompt Caching Utilization:**
  - Claude Code structures requests with a deterministic prefix: `[Tool Definitions ──► System Prompt ──► CLAUDE.md ──► Conversation History]`.
  - Prefix matching enables **0.1x read costs** for historical turns, dramatically reducing agent loop overhead (see [[prompt-caching]] and [[source-prompt-caching]]).
  - *Cache-Busting Pitfalls:* Changing models (`/model`), toggling effort levels (`/effort`), or modifying system prompts invalidates the entire cached prefix, requiring expensive full-price re-prefills.
  - The leaked prompt's own `<env>` block (`Working directory: ${Working directory}`, `Platform: darwin`, `Today's date: 2025-08-19`) demonstrates the per-turn context injection that constitutes the cache prefix's variable tail.
- **Repository Memory Architecture (`CLAUDE.md`):**
  - Acts as persistent project-level working memory loaded automatically at the start of every session — part of the cached prefix per [[source-effective-context-engineering-for-ai-agents]]'s hybrid `JIT vs persistent` retrieval model.
  - Best practice: Keep `CLAUDE.md` concise with project architecture rules, build/test commands (with quiet flags like `--reporter=dot`), and delegate detailed workflows to modular skills.
  - The prompt encodes this via `memory` sub-page reference (`common-workflows memory (Memory management and CLAUDE.md)`) and directs use of `/help` and `github.com/anthropics/claude-code/issues` for feedback — workload routing via system prompt.
- **Subagent Context Isolation:**
  - Offloads noisy exploratory subtasks (log analysis, large test suites, web scraping) to isolated child contexts.
  - Only the distilled final response returns to the main conversation, preventing context pollution — aligned with the prompt's `Task` tool preference and Sonnet 4.5's attention-budget rationale.

## How It Works
```
Every inference — Claude Code Prompt.txt lineage (System Prompts — Anthropic (Claude Sonnet 4.5 + Claude Code) — x1xhlol/system-prompts-and-models-of-ai-tools)
┌─ Tools (16 schemas: Read, Edit, Bash, TodoWrite, Task, WebFetch...)
├─ System Prompt (13 KB, cached prefix)
│   ├─ Role: "interactive CLI tool … defensive security only, never guess URLs"
│   ├─ Tone: MUST answer <4 lines; no preamble/postamble; one-word answers best
│   ├─ Planning: TodoWrite compulsory; Task for searches; edit via str_replace_editor
│   ├─ Conventions: check codebase before edits; mimic existing patterns
│   └─ Security: refuse malicious code; never log secrets; never auto-commit
├─ CLAUDE.md (project memory, also cached — see [[prompt-caching]])
├─ User Prompt (e.g. "@utils.ts fix test")
└─ History + Tool Results (appended, cached at 0.1x)
        │
        ▼
[ Claude Agent Policy — governed by system prompt above ]
        │
        ├──► File Read / Edit Tool ──────┐
        ├──► Bash Execution Tool ────────┼──► Append result to context history
        └──► Subagent Fork (Haiku) ──────┘    (Cached on subsequent turns)
```

## Practical Implications
- **Task Partitioning:** Running `/clear` between distinct engineering tasks prevents carrying obsolete tokens across sessions — resets the cached history tail while preserving the `Tools → System Prompt → CLAUDE.md` prefix.
- **Token Efficiency:** Using `@-mention` file syntax attaches files directly in the initial request, eliminating a tool invocation turn. Cache-aware ordering (tools+system first) ensures reuse across turns per [[prompt-caching]] and [[source-effective-context-engineering-for-ai-agents]].
- **Prompt-First Customization vs Fine-Tuning:** Claude Code's entire agentic loop is steered by a 13 KB prompt (no weight change from base Sonnet). Contrast with Augment Code's wrapper prompt (System Prompts — Augment Code (claude-4-sonnet-agent-prompts) — x1xhlol/system-prompts-and-models-of-ai-tools) — both prove that vertical specialization is achievable via [[system-prompt]] + [[tool-use]] alone, but at the cost of large per-turn token overhead that [[prompt-caching]] mitigates.
- **Security Scope Is Prompt-Enforced:** The *defensive security only* clause and URL-guessing ban are first-line guardrails; they complement RLHF but, as shown by the leak itself, can be exfiltrated and reverse-engineered — see [[prompt-injection]] leaking discussion.

## Connections
- Instantiates [[system-prompt]] at CLI scale — the leaked prompt is a canonical 13 KB example alongside the 43 KB Sonnet 4.5 chat prompt.
- Demonstrates advanced practical [[tool-use]] in software engineering; tool schemas are partially declared in the system prompt and fully in `Tools.json` (16 tools).
- Relies heavily on the prompt caching mechanics of [[inference]] / [[prompt-caching]] and the context assembly model of [[context-engineering]] (prefix + JIT + compaction).
- Implements persistent context management governed by [[prompt-engineering]] and [[prompt-optimization]] (specificity, structure, decomposition via TodoWrite).
- Created by [[anthropic]]; base lineage is Sonnet via System Prompts — Anthropic (Claude Sonnet 4.5 + Claude Code) — x1xhlol/system-prompts-and-models-of-ai-tools and System Prompts — Augment Code (claude-4-sonnet-agent-prompts) — x1xhlol/system-prompts-and-models-of-ai-tools wrapper contrast.
- Attack surface for [[prompt-injection]] — the prompt's public leak via `x1xhlol/system-prompts-and-models-of-ai-tools` demonstrates bulk exfiltration of 13 KB of proprietary orchestration; hardened only by server-side isolation, not instruction alone.

## Open Questions
- How to automatically optimize the boundary between keeping context in the main session vs. spinning up subagents — the attention-budget trade-off quantified in [[source-effective-context-engineering-for-ai-agents]]?
- At 13 KB, Claude Code's prompt is already 6× the Sonnet chat prefix cost when uncached — will future versions compress via Tool Search / progressive disclosure like OpenAI's approach in [[source-openai-tools-and-agent-capabilities]]?

## Sources
- [[source-maximizing-the-value-of-your-claude-code-sessions]]
- System Prompts — Anthropic (Claude Sonnet 4.5 + Claude Code) — x1xhlol/system-prompts-and-models-of-ai-tools
- [[source-effective-context-engineering-for-ai-agents]]
- [[source-prompt-caching]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
