---
type: concept
title: "Context Engineering"
summary: Context Engineering is the evolution of Prompt Engineering into the discipline of curating and maintaining the optimal token set during LLM inference — not just writing system prompts, but continuously selecting what…
visibility: public
aliases:
  - "Context Design"
  - "Prompt System Engineering"
  - "Attention Budget"
tags:
  - agents
  - prompt-engineering
  - rag
  - inference
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-prompt-caching]]"
  - "[[source-effective-context-engineering-for-ai-agents]]"
  - "[[source-context-engineering-for-agents-langchain]]"
  - "[[source-promptingguide-agents-context-engineering]]"
  - "[[source-promptingguide-agents-context-engineering-deep-dive]]"
  - "[[source-promptingguide-guides-context-engineering-guide]]"
  - "[[source-promptingguide-agents-function-calling]]"
  - "[[source-promptingguide-agents-deep-agents]]"
related:
  - "[[prompt-caching]]"
  - "[[prompt-engineering]]"
  - "[[ai-agents]]"
  - "[[deep-agents]]"
  - "[[tool-use]]"
  - "[[function-calling]]"
  - "[[model-context-protocol]]"
  - "[[prompt-optimization]]"
  - "[[reasoning-llms]]"
  - "[[context-caching]]"
  - "[[inference]]"
  - "[[claude-code]]"
  - "[[retrieval-augmented-generation]]"
  - "[[langchain]]"
  - "[[context-engineering-thesis]]"
---

# Context Engineering

## Overview
**Context Engineering** is the evolution of [[prompt-engineering]] into the **discipline of curating and maintaining the optimal token set during LLM inference** — not just writing system prompts, but continuously selecting *what* enters the limited attention budget each turn. Coined as "the art and science" (Karpathy 2025) and canonically defined by [[anthropic]] in [[source-effective-context-engineering-for-ai-agents]] (Sep 29, 2025), it answers: *what configuration of context is most likely to generate desired behavior?* Thinking in context — viewing the holistic state (system, tools/MCP, external data, history) and its likely behaviors — replaces discrete prompt crafting as agents operate over multiple turns and long horizons.

## Key Ideas

### 1. Context as Finite Attention Budget — Context Rot
LLM attention is $n^2$ (every token attends to every other). As $n$ grows, pairwise capture is stretched thin; training sees shorter sequences more often → fewer specialized parameters for long dependencies; position-interpolation helps but degrades position understanding — a gradient, not cliff. Empirically, **context rot** (TryChroma needle-in-haystack) shows monotonic recall degradation as tokens increase, across all models albeit gentler for some. Like human limited working memory (Cowan 2010), LLMs have an **attention budget** depleted by every new token → **diminishing marginal returns**. Guiding principle (Anthropic): **find the smallest possible set of high-signal tokens maximizing likelihood of desired outcome.**

### 2. Context Engineering vs Prompt Engineering
- **Prompt engineering:** discrete methods for writing/organizing instructions (system prompts) for optimal one-shot classification/generation — see Anthropic docs `prompt-engineering/overview`.
- **Context engineering:** iterative curation of the *entire* context state each inference — system + tools/MCP + external data + message history — as agents generate ever more candidate information that must be cyclically refined. Figure in Anthropic blog contrasts discrete prompt task vs iterative pass-each-turn curation.
- Early LLM engineering was prompt-centric; agentic loop (LLMs autonomously using tools — Willison 2025 definition quoted by Anthropic) makes context-level management dominant.

### 3. Anatomy of Effective Context — Smallest High-Signal Set
- **System prompts — Right Altitude:** Goldilocks between brittle hard-coded if-else logic and vague high-level guidance assuming shared context. Optimal: specific enough to guide, flexible enough for heuristics. Organize into distinct sections (`<background_information>`, `<instructions>`, `## Tool guidance`, `## Output description`) via XML/Markdown (formatting less important as models improve). Strive for minimal set fully outlining behavior; test minimal prompt with best model first, then add clarifying instructions/examples per failure mode.
- **Tools — Minimal Viable Contract:** Tools define agent's action space; must be self-contained, robust, clear, minimal overlap; params descriptive, unambiguous, playing to model strengths. Anti-pattern: bloated sets where even human engineer can't decide tool → agent can't. Every tool definition token is billed and contributes to pollution. Return token-efficient info and encourage efficient behavior (see Writing Tools for Agents).
- **Examples — Canonical, Not Laundry List:** Few-shot canonical diverse examples beat exhaustive edge-case lists — "pictures worth a thousand words."
- **Overall:** Keep context informative yet tight across system/tools/examples/history.

### 4. Retrieval & Agentic Search — Just-in-Time vs Pre-Retrieval
- **Pre-retrieval (embedding):** surface all relevant context up front — fast but exhaustive, potentially irrelevant.
- **Just-in-Time (JIT):** maintain lightweight identifiers (file paths, stored queries, links) and **dynamically load via tools at runtime** (Claude Code writes targeted queries, uses `head`/`tail` without loading full objects — mirrors human file systems/bookmarks). **Progressive disclosure:** each interaction yields metadata informing next step (file sizes → complexity, naming → purpose, timestamps → recency). Agents assemble layer-by-layer, keeping working memory small + notes. Hybrid suits less-dynamic domains (legal/finance): **CLAUDE.md naively in context + glob/grep JIT** bypasses stale indexing/syntax trees. Trade-off: JIT slower but more precise; needs thoughtful heuristics to avoid waste/dead-ends. Advice: *do the simplest thing that works*; autonomy boundary depends on task dynamism and model capability.

### 5. Long-Horizon Triad — Beyond Window Limits
Waiting for larger windows won't solve — all windows face pollution/relevance at strongest-performance setting. For tens-of-minutes to hours tasks (migrations, research), three techniques:
- **Compaction:** Near window limit, **summarize and reinitiate new window with high-fidelity compression** preserving decisions/bugs/details, discarding redundant tool outputs, plus **5 most recent files** (Claude Code). Tune on complex traces for max recall then precision. Lightest form: **tool-result clearing** (now Claude Developer Platform feature https://www.anthropic.com/news/context-management).
- **Structured Note-Taking / Agentic Memory:** File-based notes outside window (to-do list, `NOTES.md`, Sonnet 4.5 memory tool beta via file system) persisted and re-read after resets. Pokemon demo: 1,234 steps, Pikachu +8 levels toward 10, maps, strategies maintained across thousands of steps and dungeon resets; enables multi-hour coherence. See Cookbook https://platform.claude.com/cookbook/tool-use-memory-cookbook.
- **Sub-Agent Architectures:** Specialists with clean windows explore extensively (10k+ tokens) and return **1–2k distilled summaries**. Separation of concerns isolates search context; lead synthesizes (see https://www.anthropic.com/engineering/multi-agent-research-system — substantial improvement on research). Choice: compaction (conversational flow), note-taking (milestones), multi-agent (parallel research).

### 6. Prior Dair Guide Contributions Merged
Earlier wiki version (Dair Guide-derived) emphasized failure-driven iteration (silent skipping fixed via `TASK EXECUTION RULES` + spreadsheet ID/query/status/timestamp), 5 design principles (eliminate ambiguity, explicit expectations, observability, iteration, flexibility vs constraints), layered System/Task/Tool/Memory, date injection (`{{ $now.toISO() }}`), tool prose > JSON, and orchestrator/worker split (Gemini Pro planner vs Flash worker). Anthropic's framework provides the **scarcity principle (attention budget)** overarching those tactics, with Claude Code as canonical reference.

### 7. LangChain 4-Bucket Operational Taxonomy — Write / Select / Compress / Isolate (Jul 2, 2025)
[[langchain]] in [[source-context-engineering-for-agents-langchain]] complements Anthropic's scarcity theory with an **operational verbs** framework mapping directly to **LangGraph/LangSmith** primitives and cataloguing failure modes (Breunig: **poisoning, distraction, confusion, clash**; Cognition: "#1 job" quote; Anthropic 15× multi-agent token cost):
- **Write — Save Outside Window:** *Scratchpads* (tool writing to file — Anthropic think tool / MCP filesystem — or LangGraph **state** field / checkpoint persisting per session; Anthropic researcher LeadResearcher saving plan before 200k truncation) and *Memories* (Reflexion post-turn reflection, Generative Agents periodic synthesis → products ChatGPT/Cursor/Windsurf long-term auto-memories; LLM used to update/create memories).
- **Select — Pull Into Window:** *Scratchpad reads* via tool or state exposure (fine-grained node control); *Memory selection* among episodic (few-shot), procedural (instructions), semantic (facts) collections — narrow always-pulled files (`CLAUDE.md`, Cursor rules) vs large semantic collections needing **embeddings + knowledge graphs** (Zep, Graphiti) but hard — Willison anecdote: ChatGPT injected location memory into image, window "no longer belongs to them"; *Tool selection* via **RAG over tool descriptions** (2410.14594 → 3× accuracy, 2505.03275); *Knowledge* via code RAG requiring `grep`/AST chunking + rerank (Windsurf Varun: indexing ≠ retrieval, embedding unreliable at scale).
- **Compress — Retain Only Required Tokens:** *Summarization* (Claude Code **auto-compact at 95%** → recursive/hierarchical trajectory summary; also at search-tool post-process or agent-boundary hand-off via fine-tuned model) and *Trimming* (hard-coded `trim_messages` removing older messages, or trained pruner **Provence** 2501.16214 for QA).
- **Isolate — Split Context:** *Multi-agent* (Swarm separation of concerns, each with tools/instructions/window; Anthropic parallel isolated sub-agents outperformed single-agent, exploring different aspects — at **15× token cost**); *Environments* (Hugging Face CodeAgent → code in **E2B sandbox**, only return values back); *State* (LangGraph state object with schema — only `messages` exposed each turn, other fields isolated).
- **LangGraph/LangSmith Mapping & Virtuous Loop:** Short-term scratchpad via **checkpointing**, long-term via **files/collections** + **LangMem**; per-node state fetch for selection, **Bigtool** semantic tool search, RAG tutorials; low-level node control for summarization/trim; state schema + sandbox + supervisor/swarm for isolation. Foundational loop: **track token-usage via LangSmith tracing/observability → evaluate via LangSmith agent evaluation → implement 4-bucket fix → repeat**.

> [!NOTE] Complementarity
> Anthropic (Sep 2025) and LangChain (Jul 2025) share the Karpathy quote and CodeAgent example but diverge: **Anthropic explains *why* context is scarce (attention $n^2$, rot, training bias)** and prescribes *smallest high-signal set / right altitude / triad*; **LangChain operationalizes *how* with four verbs mapping to LangGraph primitives** and enumerates product-level failure modes. The wiki merges both: Anthropic as principled scarcity theory, LangChain as actionable taxonomy.

## How It Works
```
Context Window Assembly (per inference)
┌─ System prompt: role + GENERAL INSTRUCTIONS + today's date (right altitude)
├─ Tool Layer: minimal viable set, clear prose + JSON schemas (every token = cost)
├─ Task Layer: user_query delimited (<user_query>…</user_query>) + subtask spec
├─ JIT Refs: lightweight identifiers (file paths, queries, links) — not full corpora
├─ Few-shot / Structured output example (canonical, not laundry list)
├─ Memory/State: NOTES.md / memory tool / vector-cache of prior subtasks
└─ Error handling + compaction trigger (near limit → summarize → new window + 5 recent files)
        │
        ▼
 Agent loop: Thought → Tool call → Observation → Progressive disclosure → Update notes → Compaction check → Next inference
        │
        ├──→ JIT: glob/grep/head/tail loads only needed slice
        ├──→ Sub-agent: specialist explores 10k+ tokens → returns 1–2k summary
        └─→ Evaluator: KPIs (completion, consistency, error rate, satisfaction, debug time)
```
Deep-research planner example: orchestrator creates 2–3 subtasks, worker executes searches word-for-word, spreadsheet updated per search, report synthesized — with Anthropic's JIT and compaction patterns layered on.

## Practical Implications
- **Design for scarcity:** Start with minimal prompt on best model, add clarifying instructions/examples only per observed failure; audit every tool and example for token-efficiency; prefer canonical few-shots over exhaustive rules.
- **Choose retrieval mode per dynamism:** JIT (agentic exploration) for code/data analysis with exploration budget; pre-retrieval/hybrid (CLAUDE.md upfront + grep JIT, or Claude [[prompt-caching]] prefix hash) for legal/finance where speed and determinism matter — caching implements the "stable prefix at beginning, breakpoint on last stable block" rule (20-block lookback, 5m/1h TTL, 0.1× hit) from [[source-prompt-caching]].
- **Long-horizon selection:** Compaction for back-and-forth chat, note-taking for milestone-driven dev, sub-agents for parallel research — even as windows grow, coherence remains central; prompt caching complements compaction (exact reuse vs forgetting) and should be used for repeated system+tools+history prefixes.
- **Cost/latency co-design:** Every tool definition token billed; compaction and note-taking reduce repeat tokens and KV-cache pressure; sub-agents isolate cost but add orchestration latency; prompt caching reduces prefill for hits but still counts cached tokens for rate limits — monitor `cache_creation/read` vs `input_tokens`.
- **Hybrid is pragmatic:** Do simplest that works; let smarter models handle more autonomy — Anthropic notes field converging on simple tool-loop with less human curation as models improve.

## Connections
- Generalizes [[prompt-engineering]] and [[prompt-optimization]] to full-system context; powers [[ai-agents]] and [[deep-agents]] via [[tool-use]]/[[function-calling]] and [[model-context-protocol]].
- Contrasts with and complements [[retrieval-augmented-generation|RAG]] and [[context-caching]] (Anthropic blogging distinguishes naive upfront caching vs JIT; both are context-caching primitives under [[inference]] $n^2$ scalability).
- Exemplified by [[claude-code]] (hybrid CLAUDE.md + tools, memory tool, sub-agent research system, Pokémon demo) and discussed as finite resource via [[inference]] and [[scaling-laws]] (attention budget vs window size).
- Overlaps [[retrieval-augmented-generation|RAG]] (vector caching) and [[in-context-learning]] (few-shot curation balanced vs biased per [[llm-bias]]).

## Open Questions
- How to automate compaction recall/precision tuning and stale/relevant filtering without losing subtle critical context whose importance emerges later?
- What eval metric best captures context dilution/rot over long horizons — can we benchmark attention-budget depletion rather than raw recall?
- When should JIT vs pre-retrieval vs hybrid be chosen automatically based on task dynamism and model capability?

## Sources
- [[source-effective-context-engineering-for-ai-agents]]
- [[source-context-engineering-for-agents-langchain]]
- [[source-promptingguide-agents-context-engineering]]
- [[source-promptingguide-agents-context-engineering-deep-dive]]
- [[source-promptingguide-guides-context-engineering-guide]]
- [[source-promptingguide-agents-function-calling]]
- [[source-promptingguide-agents-deep-agents]]

## Synthesis

- [[context-engineering-thesis]] — the same constraint seen from scarcity, operations, and inference arithmetic

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
