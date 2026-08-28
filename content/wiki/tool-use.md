---
type: concept
title: "Tool Use"
summary: Tool Use (or Function Calling) is the capability of a language model to recognize when external computation, data retrieval, or real-world actions are required, emit structured invocation calls (JSON payloads or…
visibility: public
aliases:
  - "Function Calling"
  - "Tool Augmentation"
  - "Structured Outputs"
  - "Programmatic Tool Calling"
  - "LLM OS"
tags:
  - agents
  - prompt-engineering
  - llm-fundamentals
  - mlops
created: 2026-08-23
updated: 2026-08-25
status: draft
sources:
  - "[[source-toolformer]]"
  - "[[source-structured-outputs]]"
  - "[[source-openai-tools-and-agent-capabilities]]"
  - "[[source-model-context-protocol]]"
  - "[[source-maximizing-the-value-of-your-claude-code-sessions]]"
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
  - "[[source-promptingguide-agents-function-calling]]"
  - "[[source-promptingguide-agents-context-engineering-deep-dive]]"
related:
  - "[[structured-outputs]]"
  - "[[model-context-protocol]]"
  - "[[claude-code]]"
  - "[[supervised-fine-tuning]]"
  - "[[parameter-efficient-fine-tuning]]"
  - "[[lora]]"
  - "[[hallucination]]"
  - "[[prompt-injection]]"
  - "[[function-calling]]"
  - "[[ai-agents]]"
  - "[[agent-components]]"
  - "[[context-engineering]]"
  - "[[adversarial-prompting]]"
  - "[[retrieval-augmented-generation]]"
---

# Tool Use

## Overview

**Tool Use** (or **Function Calling**) is the capability of a language model to recognize when external computation, data retrieval, or real-world actions are required, emit structured invocation calls (JSON payloads or executable code), receive execution results back into its context window, and synthesize grounded responses. Conceptualized by [[andrej-karpathy]] as the core primitive of the "LLM OS", tool use transforms static neural pattern matchers into autonomous software agents. Its modern lineage includes both **hand-annotated** tool-use finetuning (OpenAI/MCP era) and **self-supervised bootstrapping** (Toolformer, [[source-toolformer]]) where the model itself labels when APIs help.

## Key Ideas

### 1. The Modern Tool Taxonomy
Modern AI architectures classify tools into four distinct operational categories (formalized in [[source-openai-tools-and-agent-capabilities]]):
1. **Hosted Built-in Tools:** Executed directly in provider cloud sandboxes:
   - *Code Interpreter:* Isolated Python runtime for deterministic math, data analysis, and chart generation.
   - *Web Search:* Real-time live web indexing and citation retrieval (bypassing model knowledge cutoffs).
   - *File Search:* Managed semantic chunking, vector embeddings, and hybrid retrieval (see [[retrieval-augmented-generation]]).
   - *Computer Use:* Direct GUI interaction (screen capture, mouse coordinates, keyboard inputs).
2. **Custom Function Calling (Client-Side):**
   - The developer provides JSON Schema definitions of local functions. The model emits argument payloads; the developer's client executes the logic and returns results.
3. **Standardized Protocol Connectors ([[model-context-protocol]]):**
   - Universal open protocol standardizing tool discovery, resource streaming, and prompt workflows across local and remote servers.
4. **Agent Skills & Custom Extensions:**
   - Modular, reusable skill packages containing system prompts, tool bindings, and operational scripts attached dynamically to agent sessions.

### 2. Structured Outputs & Schema Enforcement (`strict: true`)
- Early function calling suffered from JSON syntax errors, missing parameters, and hallucinations.
- **Constrained Decoding (Grammar Masking):** Modern inference engines enforce 100% schema compliance by converting JSON schemas into Context-Free Grammars (CFGs). At each step of autoregressive decoding in [[inference]], the model's output logits are masked so only mathematically valid JSON tokens matching the schema can be sampled. Two wirings exist per [[source-structured-outputs]]: **function calling** (`tools` schema — model calls your function) and **direct answer structuring** (`text.format: {type:"json_schema", strict:true}` — model answer itself, e.g., CalendarEvent, MathReasoning, UI recursion) — see [[structured-outputs]] for 7-language SDK samples (Pydantic/Zod) and 4 patterns.

### 3. Scaling Tool Context: Progressive Discovery vs. Programmatic Calling
- **The Context Bloat Problem:** Loading 50+ tool schemas directly into system prompts consumes tens of thousands of tokens per turn and causes attention dilution.
- **Tool Search (Progressive Tool Discovery):** Namespaces tools into indexed catalogs. The model dynamically searches and activates only the relevant tool schemas on demand.
- **Programmatic Tool Calling (Code Mode):** The model writes Python scripts that invoke tool APIs inside a sandbox, enabling loops, branching, and multi-step data processing in a single execution step without multiple LLM turns.
- **Relation to [[lora]] / [[parameter-efficient-fine-tuning]]:** Tool-use skills can be injected via lightweight LoRA modules (swapable A,B) rather than full finetuning.

### 4. Self-Supervised Bootstrapping — Toolformer (Schick et al. 2023, [[source-toolformer]])
- **Paradigm shift:** Instead of massive human annotations (Komeili 2022; Thoppilan 2022) or task-specific TALM, Toolformer learns tool use from **few-shot demos + model feedback** on the same pretraining corpus (CCNet). Requirements: APIs with text in/out, handful of usage prompts $P(x)$.
- **Loop (§2):** (i) **Sample** candidates where $p_M(\texttt{<API>}|P(x),x_{<i})>\tau_s$ (top-$k$ positions, sample $m$ calls $c=(a_c,i_c)$ as `<API>a(i)</API>`); (ii) **Execute** (Atlas QA, calculator $27+4*2\to35$, BM25 Wikipedia on KILT, NLLB translation, calendar → "Today is..."); (iii) **Filter** by weighted next-token loss $L_i(z)=-\sum w_{j-i}\log p_M(x_j|z,x_{<j})$, $w_t\propto\max(0,1-0.2t)$, keep if $L_i^- - L_i^+ \ge \tau_f$ where $L_i^+=L_i(e(c,r))$, $L_i^-=\min(L_i(\epsilon),L_i(e(c,\epsilon)))$ — i.e., call+result helps more than no call; (iv) **Finetune** on $C^*$ = $C$ with $e(c,r)$ inserted as $x_{1:i-1} e(c,r) x_{i:n}$ via standard LM loss — same content as $C$, zero perplexity cost when disabled (WikiText 10.3 → 10.3).
- **Results (zero-shot, $k=10$ trick — emit <API> if in top-10, ≤1 call):** GPT-J 6.7B LAMA T-REx 33.2→**53.5** (beats GPT-3 39.8, 98.1% QA use), ASDiv 9.6→**40.4** (97.9% calculator), WebQS 18.4→**26.3** (99.3% Wiki, though still behind GPT-3 due to BM25), Dateset 2.9→**27.3** (54.8% calendar), MLQA 63–95% MT use. Toolformer-disabled already 14.8 on ASDiv (finetune on API results improves own reasoning). **Emergence at ~775M** (scaling over GPT-2 124M–1.6B). At $k=1$ calibrated (non-calling subset performs better), but $k=10$ maximizes use (40%→98% on T-REx).
- **Significance.** Proves LM can **self-decide** when/how/which tool via loss delta — predecessor to modern [[function-calling]] instruction tuning and [[model-context-protocol]]'s explicit tool choice. Limitation: single non-interactive call, weak BM25, no chaining (e.g., calendar+QA not learnable), translation-CCNet shift.
- **Connection to [[retrieval-augmented-generation]]:** WikiSearch is literal RAG; QA tool is Atlas-based RAG; shows retrieval tool value can be discovered self-supervised.

## How It Works
```
User Prompt (e.g. "Plot Apple stock price")
       │
       ▼
[ Tool Search / Discovery ] ──► Dynamically load 'stock_api' schema
       │                         (Toolformer: p(<API>) sampled via P(x) demos)
       ▼
[ LLM Agent with Strict Decoding ] ──► Emits valid JSON or Python script
       │    (or Toolformer e(c,r): <API>calc(735/499) → 1.47</API>)
       ▼
[ Execution Sandbox / MCP Server ] ──► Runs API & executes Python analysis
       │                               (Filtering: keep only if L⁻-L⁺ ≥ τ_f)
       ▼
[ Grounded In-Context Synthesis ] ──► Returns final analysis & chart (0% Hallucination)
       │
       └─► (Training loop for Toolformer: wrap surviving e(c,r) into C* and SFT)
```

## Practical Implications

- **Eliminating Hallucination:** Deterministic arithmetic and live data lookups eliminate entire classes of factual [[hallucination]] (see [[source-toolformer]] Toolformer factuality 42.7% vs 7.1% BART on Jeopardy in RAG paper; calculator doubling on math).
- **Security Boundaries:** Exposing write operations (shell, file write, database updates) creates severe attack vectors for indirect [[prompt-injection]] and [[adversarial-prompting]]. Must require explicit human approvals or containerized sandboxing. Toolformer's filtering hints at calibration — at $k=1$ non-calling accuracy 44.3 > overall 34.9, suggesting learned self-awareness of need.
- **Function Calling Detail:** As detailed in [[function-calling]], tool definitions are the sole contract — precise descriptions, enums, and system-prompt duplication drive selection accuracy and debuggability via intermediate steps (tools called, args, observations, token usage).
- **Finetuning strategy.** Toolformer shows you can bootstrap tool skills without large human labels by finetuning on self-labeled $C^*$; modern stacks do SFT on JSON tool traces (often via [[lora]] for cheap multi-tool) plus constrained decoding.

## Connections

- Standardized at the protocol level by the [[model-context-protocol]] and implemented concretely via [[function-calling]] (context assembly, agent loop, observations). Toolformer is the self-supervised origin of that loop.
- Core engine driving [[ai-agents]] and autonomous CLI agents like [[claude-code]]; componentized in [[agent-components]] and orchestrated via [[context-engineering]] (tool layer, status enums, date injection).
- Trained into models during [[supervised-fine-tuning]] (Toolformer is SFT on $C^*$) and potentially via [[parameter-efficient-fine-tuning]]/[[lora]] and reinforced via [[rlhf]].
- Mitigates factual [[hallucination]] while creating attack vectors for [[prompt-injection]] / [[adversarial-prompting]].
- Grounded in [[retrieval-augmented-generation]] (RAG tools) and generalizes beyond retrieval to compute/time/translation.

## Sources

- [[source-toolformer]]
- [[source-openai-tools-and-agent-capabilities]]
- [[source-model-context-protocol]]
- [[source-maximizing-the-value-of-your-claude-code-sessions]]
- [[source-deep-dive-into-llms-like-chatgpt]]
- [[source-promptingguide-agents-function-calling]]
- [[source-promptingguide-agents-context-engineering-deep-dive]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
