---
type: concept
title: "Model Context Protocol"
summary: The Model Context Protocol (MCP) is an open-standard communication protocol initiated by Anthropic that enables AI models and agentic harnesses (such as Claude Code, Cursor, and Antigravity) to securely discover and…
visibility: public
aliases:
  - MCP
  - Model Context Protocol Specification
  - MCP Specification
  - wiki/model-context-protocol
tags:
  - agents
  - mlops
  - prompt-engineering
created: 2026-08-23
updated: 2026-08-23
status: draft
sources:
  - "[[source-model-context-protocol]]"
  - "[[source-maximizing-the-value-of-your-claude-code-sessions]]"
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
related:
  - "[[tool-use]]"
  - "[[claude-code]]"
  - "[[prompt-injection]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">The Model Context Protocol (MCP) is an open-standard communication protocol initiated by Anthropic that enables AI models and agentic harnesses (such as Claude Code, Cursor, and Antigravity) to securely discover and…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/agents/concepts/function-calling">Function Calling</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/agents/concepts/claude-code">Claude Code</a></li><li><a href="/eval-safety/concepts/prompt-injection">Prompt Injection</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/agents/sources/source-model-context-protocol">Model Context Protocol (MCP) Documentation &amp; Specification</a></li><li><a href="/prompt-engineering/sources/source-maximizing-the-value-of-your-claude-code-sessions">Maximizing the value of your Claude Code sessions</a></li><li><a href="/llm-fundamentals/sources/source-deep-dive-into-llms-like-chatgpt">Deep Dive into LLMs like ChatGPT</a></li></ul></nav>
</aside>

## Overview
The **Model Context Protocol (MCP)** is an open-standard communication protocol initiated by [[anthropic]] that enables AI models and agentic harnesses (such as [[claude-code]], Cursor, and Antigravity) to securely discover and interface with external tools, contextual resources, and prompt templates. Analogous to the *Language Server Protocol (LSP)* in software engineering, MCP standardizes the connectivity layer between AI clients and external systems over JSON-RPC 2.0.

## Key Ideas
- **Elimination of the $M \times N$ Integration Problem:**
  Before MCP, connecting $M$ different AI developer tools to $N$ data sources (databases, GitHub, Slack, local filesystems) required writing $M \times N$ custom integrations. MCP creates a universal protocol surface ($M + N$).
- **Architecture: Host, Client, and Server:**
  - **Host Application:** The coordinator managing the LLM lifecycle, user approvals, and UI (e.g. Claude Desktop, VS Code, Claude Code).
  - **MCP Client:** The protocol implementation within the host maintaining an isolated 1:1 session with an individual server.
  - **MCP Server:** A lightweight, modular program exposing specific tools and data over standard transport channels.
- **Transports:**
  - `stdio`: Standard input/output stream transport for running local subprocesses securely without network exposure.
  - `SSE` / `Streamable HTTP`: Server-Sent Events over HTTP for remote and distributed cloud services with bidirectional asynchronous messaging.
- **Core Primitives:**
  1. **Tools (`tools/list`, `tools/call`):** Model-controlled executable functions with strict JSON Schema definitions.
  2. **Resources (`resources/list`, `resources/read`, `resources/subscribe`):** Application-controlled passive data (files, database records, API responses) addressed by URI schemes (`file://`, `postgres://`).
  3. **Prompts (`prompts/list`, `prompts/get`):** User-controlled structured prompt templates and interactive workflows.
  4. **Roots (`roots/list`):** Informs servers of permitted workspace boundaries (e.g. allowed local filesystem directories).
  5. **Sampling (`sampling/createMessage`):** Inverted agentic capability allowing servers to request LLM generation back through the client host.
- **Scalability & Context Engineering:**
  - *Progressive Tool Discovery:* Dynamically querying tool indexes rather than injecting hundreds of full tool schemas into the system prompt at startup.
  - *Code Mode / Programmatic Tool Calling:* Exposing tools as executable script modules to let agents batch operations in a sandbox.

## How It Works
```
┌────────────────────────────────────────────────────────┐
│                   HOST APPLICATION                     │
│  (e.g., Claude Code, Cursor, Claude Desktop, Antigravity)│
│                                                        │
│   ┌──────────────┐                  ┌──────────────┐   │
│   │  MCP Client  │                  │  MCP Client  │   │
│   └──────┬───────┘                  └──────┬───────┘   │
└──────────┼─────────────────────────────────┼───────────┘
           │ (stdio JSON-RPC)                │ (SSE / HTTP JSON-RPC)
           ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────┐
│  Local MCP Server    │          │  Remote MCP Server   │
│  - Filesystem Tools  │          │  - Postgres Database │
│  - Git Repository    │          │  - GitHub API        │
└──────────────────────┘          └──────────────────────┘
```

## Practical Implications
- **Decoupled Security Boundaries:** Tool execution occurs in independent server runtimes, enabling granular OAuth 2.1 authorization, audit logging, and per-tool user confirmation prompts.
- **Standardized Developer Tooling:** Tools like the *MCP Inspector* enable developers to inspect, test, and fuzz JSON-RPC message exchanges in real time across TUI, CLI, and Web interfaces.

## Connections
- Foundational standard for enterprise [[tool-use]] and autonomous agents.
- Natively integrated into agentic coding environments like [[claude-code]].
- Introduces new security considerations regarding indirect [[prompt-injection]] via untrusted server tool outputs.

## Open Questions
- How to standardize cross-server transaction rollbacks when multi-agent workflows execute dependent tool calls across disparate MCP servers?
- How to establish cryptographically verifiable provenance for MCP server tools in open registries?

## Sources
- [[source-model-context-protocol]]
- [[source-maximizing-the-value-of-your-claude-code-sessions]]
- [[source-deep-dive-into-llms-like-chatgpt]]

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/agents/concepts/ai-workflows">AI Workflows</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
