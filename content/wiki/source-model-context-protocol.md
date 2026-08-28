---
type: source-summary
title: "Model Context Protocol (MCP) Documentation & Specification"
summary: The official specification and developer documentation for the Model Context Protocol (MCP), an open-standard communication protocol initiated by Anthropic to connect AI applications (clients/hosts) with external tools…
status: draft
visibility: public
author: "Anthropic & The MCP Open Source Community"
source-type: code-doc
url: "https://modelcontextprotocol.io/"
date-published: 2026-07-28
date-ingested: 2026-08-23
tags:
  - agents
  - mlops
  - prompt-engineering
key-concepts:
  - "[[model-context-protocol]]"
  - "[[tool-use]]"
  - "[[claude-code]]"
  - "[[prompt-injection]]"
key-entities:
  - "[[anthropic]]"
---

# Model Context Protocol (MCP) Documentation & Specification

## Summary
The official specification and developer documentation for the **Model Context Protocol (MCP)**, an open-standard communication protocol initiated by [[anthropic]] to connect AI applications (clients/hosts) with external tools, contextual data sources, and services (servers). MCP standardizes how AI agents discover capabilities, execute tools, read resources, instantiate prompt templates, and receive streamed events across local and remote transports using JSON-RPC 2.0.

## Key Takeaways
1. **The $1 \times N$ Universal Standard:** Replaces fragmented, custom $M \times N$ API integrations between $M$ different AI apps and $N$ tool endpoints with a universal open protocol (similar to the Language Server Protocol / LSP in developer IDEs).
2. **Client-Host-Server Topology:**
   - **Host:** The user-facing AI application container (e.g., Claude Desktop, VS Code, Cursor, Claude Code) orchestrating agent sessions and security boundaries.
   - **Client:** The protocol adapter inside the host maintaining 1:1 dedicated connections to specific servers.
   - **Server:** Independent, lightweight services exposing tools, resources, and prompts over standard transports.
3. **Core Protocol Primitives:**
   - **Tools:** Actionable model-executable functions with JSON Schema parameters (`tools/list`, `tools/call`). Require explicit user approval or capability sandboxing.
   - **Resources:** Passive structured data and contextual files identified by URIs (`resources/list`, `resources/read`, `resources/subscribe`).
   - **Prompts:** Reusable parameterized prompt templates and workflows (`prompts/list`, `prompts/get`).
   - **Roots:** Client-provided boundary definitions indicating which filesystem directories or project scopes the server may operate within (`roots/list`).
   - **Sampling:** Allows servers to request LLM generations back through the client (`sampling/createMessage`), enabling multi-agent and human-in-the-loop server workflows.
4. **Transport Layer:**
   - `stdio`: Fast, secure local communication via standard input/output streams for local binary/script execution.
   - `SSE` (Server-Sent Events) / `Streamable HTTP`: Network transport for remote and cloud-hosted MCP servers supporting bidirectional asynchronous JSON-RPC messaging.
5. **Advanced Scaling Patterns:**
   - **Progressive Tool Discovery:** Mitigates context window saturation by dynamically querying tool catalogs on demand rather than loading hundreds of full tool schemas into the system prompt upfront.
   - **Programmatic Tool Calling / Code Mode:** Exposes MCP tool collections as executable APIs/scripts that agents write code against, collapsing multi-step tool calls into single script executions.

## Detailed Notes

### Protocol Lifecycle & Message Sequence
```
Client (Host)                                        MCP Server
     │                                                    │
     ├────────── initialize (capabilities, clientInfo) ──►│
     │◄───────── result (capabilities, serverInfo) ───────┤
     │                                                    │
     ├────────── notifications/initialized ──────────────►│  [Negotiation Complete]
     │                                                    │
     ├────────── tools/list / resources/list ────────────►│
     │◄───────── result (tool schemas, resource URIs) ────┤
     │                                                    │
     ├────────── tools/call (name, arguments) ───────────►│
     │◄───────── result (content: text/image, isError) ───┤
     │                                                    │
     │◄───────── notifications/resources/updated ─────────┤  [Asynchronous Event]
```

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 1 passages in this section could not be located in the stored source ([https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "MCP is designed to be the 'USB-C for AI applications' — an open standard that lets foundation models seamlessly connect to any local or remote data source and developer tool." — Anthropic MCP Specification

## Concepts Introduced or Referenced
- [[model-context-protocol]] — Architectural deep dive into the open protocol.
- [[tool-use]] — Standardization of function calling, JSON schemas, and execution boundaries.
- [[claude-code]] — Terminal harness utilizing local and remote MCP server integrations.
- [[prompt-injection]] — Security boundaries, OAuth 2.1 authorization, and mitigating indirect injection via untrusted MCP server responses.

## Critical Assessment
- **Industry Impact:** Standardized agent tooling across Anthropic, OpenAI, Cursor, Google Antigravity, and Zed, solving the tool ecosystem fragmentation problem.
- **Context Overhead Trade-off:** Large numbers of active MCP servers can bloat system prompts with schemas, necessitating progressive discovery or "Code Mode" execution patterns.

---

**Source:** Model Context Protocol (MCP) Documentation & Specification by Anthropic & The MCP Open Source Community — <https://modelcontextprotocol.io/>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
