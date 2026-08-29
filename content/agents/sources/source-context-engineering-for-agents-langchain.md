---
type: source-summary
title: "Context Engineering for Agents"
summary: "The July 2, 2025 LangChain Blog (14-min) that complements Anthropic's attention-budget view with an operational 4-bucket taxonomy for building agents on LangGraph/LangSmith: write, select, compress, and isolate context."
status: draft
visibility: public
author: "LangChain Team"
source-type: article
url: "https://www.langchain.com/blog/context-engineering-for-agents"
date-published: 2025-07-02
date-ingested: 2026-08-24
tags:
  - agents
  - rag
  - inference
  - mlops
key-concepts:
  - "[[context-engineering]]"
  - "[[ai-agents]]"
  - "[[context-caching]]"
  - "[[retrieval-augmented-generation]]"
  - "[[tool-use]]"
key-entities:
  - "[[langchain]]"
  - "[[anthropic]]"
aliases:
  - wiki/source-context-engineering-for-agents-langchain
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The July 2, 2025 LangChain Blog (14-min) that complements Anthropic's attention-budget view with an operational 4-bucket taxonomy for building agents on LangGraph/LangSmith: write, select, compress, and isolate context.</p>
<p class="kb-provenance">LangChain Team, 2025-07-02. <a href="https://www.langchain.com/blog/context-engineering-for-agents">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary
The **July 2, 2025 [[langchain]] Blog** (14-min) that complements [[anthropic]]'s attention-budget view with an **operational 4-bucket taxonomy** for building agents on **LangGraph/LangSmith**: **write, select, compress, and isolate** context. Framing LLMs as CPU and context window as RAM (Karpathy OS analogy, capacity per Lilian Weng), the post argues agentic loops interleaving LLM and tool calls quickly accumulate **hundreds of turns** of tool feedback, causing window overflow, cost/latency blowup and performance degradation via four failure modes from Drew Breunig — **poisoning, distraction, confusion, clash**. Reviewing popular agents/papers and LangChain products, it maps **write** (scratchpads to files/state, Reflexion/Generative Agents memories → ChatGPT/Cursor/Windsurf long-term memories), **select** (scratchpad reads, memory retrieval via embeddings/knowledge graphs, RAG over tool descriptions +3× accuracy, RAG for code via grep+AST+rerank), **compress** (Claude Code 95% auto-compact, recursive/hierarchical summarization, agent-boundary summarization via fine-tuned model, trimming older messages/Provence pruner), and **isolate** (multi-agent Swarm sub-agents with 15× token cost but parallel exploration, CodeAgent sandboxes/E2B/Pyodide, state-schema field isolation) to concrete LangGraph constructs (checkpointed short-term scratchpad, long-term collections/LangMem, Bigtool semantic tool search, summarization/trim nodes, state schema, sandbox, supervisor/swarm) and the **LangSmith virtuous loop** (trace token-usage → evaluate → iterate).

## Key Takeaways
1. **OS Analogy & Failure Modes:** LLM = CPU, context = RAM (limited capacity). Long-running agents (ambient agents) accumulate tool outputs → overflow, cost, and Breunig's 4 failures: **poisoning** (hallucination poisons future context), **distraction** (context overwhelms training), **confusion** (superfluous influences response), **clash** (parts disagree). Anthropic quote: "Agents often engage in conversations spanning hundreds of turns, requiring careful context management"; Cognition: "#1 job is context engineering."
2. **Write — Save Outside Window:** 
   - *Scratchpads:* tool writing to file (Anthropic think tool / MCP filesystem) or LangGraph **state** field persisting per session; Anthropic researcher: LeadResearcher saves plan to Memory before 200k truncation.
   - *Memories:* Reflexion post-turn reflection, Generative Agents periodic synthesis → products: ChatGPT/Cursor/Windsurf auto-generate long-term memories persisting across sessions; LLM used to update/create memories.
3. **Select — Pull Into Window:** 
   - *Scratchpad:* read via tool or state exposure (fine-grained node control).
   - *Memories:* episodic (few-shot), procedural (instructions), semantic (facts) via collections; popular code agents always pull narrow rules files (`CLAUDE.md`, Cursor rules); large semantic collections need **embedding + knowledge-graph** (Zep, Graphiti) but hard — Willison example: ChatGPT fetched location memory and injected into image, making window "no longer belong to them."
   - *Tools:* Too many → confusion; **RAG over tool descriptions** (2410.14594) fetches relevant subset → **3× tool selection accuracy** (2505.03275).
   - *Knowledge:* Code RAG: indexing ≠ retrieval; Windsurf's Varun notes embedding unreliable at scale → need `grep`/file search + AST chunking + knowledge-graph + rerank step.
4. **Compress — Retain Only Required Tokens:** 
   - *Summarization:* Claude Code **auto-compact at 95%** → recursive/hierarchical summarization of trajectory; also at specific points (post-search tool, agent-boundary hand-off). Cognition fine-tuned model for hand-off summarization.
   - *Trimming:* Hard-coded heuristics (LangChain `trim_messages` removing older messages) or trained pruner **Provence** (2501.16214) for QA.
5. **Isolate — Split Context:** 
   - *Multi-agent:* Swarm separation of concerns, each with tools/instructions/window; Anthropic multi-agent researcher: parallel isolated sub-agents outperformed single-agent by exploring different aspects simultaneously — cost up to **15× tokens**, needs careful prompt + coordination.
   - *Environments:* Hugging Face CodeAgent → code in **sandbox** (E2B), only return values back to LLM → isolates token-heavy objects (assign image/audio as variable).
   - *State:* LangGraph state object with schema — only `messages` exposed each turn, other fields isolated until needed.
6. **LangGraph/LangSmith Implementation Mapping & Virtuous Loop:** *Foundational:* track token-usage via LangSmith tracing/observability + test via LangSmith agent evaluation. LangGraph provides: short-term scratchpad via **checkpointing**, long-term memory via **files/collections** + LangMem; per-node state fetch for selection, embedding tool (Bigtool), RAG tutorials; low-level node control for summarization/trim at configurable points; state schema + sandbox + supervisor/swarm for isolation (with videos). Emphasizes *identify via tracing → implement → evaluate → repeat*.

## Detailed Notes

### Framing
- TL;DR: four categories.
- OS/RAM analogy with Karpathy tweet https://x.com/karpathy/status/1937902205765607626 ("delicate art... next step") and Weng post on agent capacity; umbrella for instructions/knowledge/tools context types.

### Write / Select / Compress / Isolate Sections
- Detailed examples, citations, and figures (General categories diagram, scratchpad/memory diagrams, filtering diagram, sandbox diagram).
- Products cited: ChatGPT, Cursor, Windsurf, Claude Code, Anthropic multi-agent, Hugging Face CodeAgent, OpenAI Swarm, Provence.

### LangSmith / LangGraph Section
- Short-term vs long-term memory docs: https://langchain-ai.github.io/langgraph/concepts/memory/, Deeplearning.ai course on long-term agentic memory, Ambient Agents course for email.
- Tool selection: Bigtool https://github.com/langchain-ai/langgraph-bigtool
- Compression: low-level orchestration https://blog.langchain.com/how-to-think-about-agent-frameworks/, summarize/trim utilities https://langchain-ai.github.io/langgraph/how-tos/memory/add-memory/#manage-short-term-memory
- Isolation: state low_level https://langchain-ai.github.io/langgraph/concepts/low_level/#state, sandbox mini-chat https://github.com/jacoblee93/mini-chat-langchain, Pyodide video.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 4 of 7 passages in this section could not be located in the stored source ([https://www.langchain.com/blog/context-engineering-for-agents](https://www.langchain.com/blog/context-engineering-for-agents)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Agents need context to perform tasks. Context engineering is the art and science of filling the context window with just the right information at each step of an agent's trajectory."

> "Context engineering is the 'delicate art and science of filling the context window with just the right information for the next step.'" — Karpathy

> "Context engineering is effectively the #1 job of engineers building AI agents." — Cognition

> "Agents often engage in conversations spanning hundreds of turns, requiring careful context management strategies." — Anthropic

> "Context Poisoning: When a hallucination makes it into the context" / "Distraction: When the context overwhelms the training" / "Confusion: When superfluous context influences the response" / "Clash: When parts of the context disagree" — Drew Breunig

> "[Subagents operate] in parallel with their own context windows, exploring different aspects of the question simultaneously." — Anthropic

> "[Code Agents allow for] a better handling of state … Need to store this image / audio / other for later use? Just assign it as a variable in your state and you use it later." — Hugging Face

## Concepts Introduced or Referenced
- [[context-engineering]] — Central 4-bucket taxonomy: write/select/compress/isolate with write→select→compress→isolate workflow, failure modes (poisoning/distraction/confusion/clash), and LangGraph/LangSmith mapping.
- [[ai-agents]] — Agentic loops accumulating tool feedback over hundreds of turns; multi-agent vs single-agent trade-offs (15× tokens, coordination).
- [[context-caching]] — Implicitly: naive always-pulled files (CLAUDE.md, rules) vs selective JIT; trimming/summarization as cache management.
- [[retrieval-augmented-generation]] — RAG for knowledge (code AST + grep + rerank) and for tool selection (RAG over descriptions 3× gain).
- [[tool-use]] — Tool overload, RAG over tools, sandboxed execution isolating context.

## Critical Assessment
- **Strengths:** Most **operationally actionable** context-engineering taxonomy to date — four verbs map cleanly to LangGraph primitives (state, memory, summarization/trim, sandbox/supervisor) with concrete code pointers (Bigtool, `trim_messages`, `CachedContent` parallels) and candid trade-offs (15× multi-agent cost, selection gone wrong via Willison anecdote). Systematically covers both *what* to store (memories: episodic/procedural/semantic) and *how* to manage lifecycle, with tracing→eval virtuous loop via LangSmith — complementing Anthropic's principled attention-budget paper (Sep 2025) which dates just after this (Jul 2 2025) and shares the same Karpathy quote but adds scarcity/rot theory.
- **Limitations:** LangChain-advocacy heavy — every bucket routes to LangGraph/LangSmith (academy courses, videos) without independent benchmarks for write/select/compress/isolate efficacy; failure-mode citations (Breunig blog) are informal; no discussion of Anthropic's *right altitude*, *attention budget*, or *compaction* vs trimming nuance; token-cost analysis (e.g., compaction fine-tuned model cost) not quantified beyond 15× claim. Should be cross-referenced with Anthropic for theory.
- **Wiki Integration:** Directly extends [[source-effective-context-engineering-for-ai-agents]] (Anthropic scarcity/right-altitude/triad) with the LangChain **write-select-compress-isolate** framework and product mapping. No contradictions; the two should be merged in [[context-engineering]] as complementary (Anthropic: *why* context is scarce; LangChain: *how* to operate with 4 verbs). Complements [[retrieval-augmented-generation]] (RAG for tools/knowledge) and [[context-caching]] (select is caching strategy).

---

**Source:** Context Engineering for Agents by LangChain Team — <https://www.langchain.com/blog/context-engineering-for-agents>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
