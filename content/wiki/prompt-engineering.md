---
type: concept
title: "Prompt Engineering"
summary: Prompt Engineering is the practice of structuring, refining, and optimizing natural language text inputs to guide a large language model toward desired outputs without altering the underlying model weights.
visibility: public
aliases:
  - "In-Context Conditioning"
  - "Prompting Techniques"
  - "Context Engineering"
tags:
  - prompt-engineering
  - llm-fundamentals
created: 2026-08-23
updated: 2026-08-24
status: draft
sources:
  - "[[source-chain-of-thought-prompting-elicits-reasoning]]"
  - "[[source-language-models-are-few-shot-learners]]"
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
  - "[[source-promptingguide-introduction-basics]]"
  - "[[source-promptingguide-introduction-elements]]"
  - "[[source-promptingguide-introduction-tips]]"
  - "[[source-promptingguide-introduction-examples]]"
  - "[[source-promptingguide-introduction-settings]]"
  - "[[source-promptingguide-guides-optimizing-prompts]]"
  - "[[source-promptingguide-guides-context-engineering-guide]]"
  - "[[source-promptingguide-agents-context-engineering]]"
  - "Prompt Engineering Guide — Prompting Techniques Overview"
related:
  - "[[chain-of-thought]]"
  - "[[in-context-learning]]"
  - "[[hallucination]]"
  - "[[tool-use]]"
  - "[[prompt-elements]]"
  - "[[prompt-design-tips]]"
  - "[[role-prompting]]"
  - "[[llm-settings]]"
  - "[[decoding-strategies]]"
  - "[[context-engineering]]"
  - "[[prompt-optimization]]"
  - "[[ai-agents]]"
  - "[[reasoning-llms]]"
  - "[[adversarial-prompting]]"
  - "[[llm-bias]]"
---

# Prompt Engineering

## Overview
**Prompt Engineering** is the practice of structuring, refining, and optimizing natural language text inputs to guide a large language model toward desired outputs without altering the underlying model weights. It encompasses techniques ranging from zero-shot and few-shot formatting to system prompt design and structured XML/JSON framing.

## Key Ideas
- **Context as Working Memory (RAM):** As framed by [[andrej-karpathy]], the model's parametric weights act as fuzzy long-term storage, while the context window acts as high-fidelity working memory. Prompt engineering ensures that necessary facts, formatting rules, and constraints are explicitly provided in-context to prevent [[hallucination]].
- **Core Prompting Paradigms:**
  - **Zero-Shot & Few-Shot:** Providing clear task descriptions and $K$ input-output demonstrations via [[in-context-learning]]. The introductory guide [[source-promptingguide-introduction-basics]] grounds this in the canonical `Q: … A:` and `// Positive` formats and the distinction that few-shot enables task inference without gradient updates.
  - **Role & Persona Conditioning:** Setting system instructions (`<|im_start|>system`) to establish tone, expertise, and safety boundaries — systematized as [[role-prompting]] with tone-switching demos (technical vs primary-school) in [[source-promptingguide-introduction-examples]].
  - **Chain-of-Thought (CoT):** Encouraging models to emit intermediate reasoning steps before the final answer — introduced as `<input, CoT, output>` triples in Wei et al. (2022) [[source-chain-of-thought-prompting-elicits-reasoning]] where PaLM 540B 8-shot CoT achieves GSM8K SOTA, an **emergent ~100B+** ability. Greedy equation-only or dots ablations fail, while annotator-robust CoT generalizes OOD on symbolic tasks. This prompting ancestor led to automated test-time compute scaling in [[thinking-models]] and is summarized in the guide's parity-reasoning fix (`Solve by breaking the problem into steps…` → `41 odd`).
- **Prompt Structure:** Any prompt decomposes into four [[prompt-elements]] — Instruction, Context, Input Data, Output Indicator — with composition depending on task complexity (see [[source-promptingguide-introduction-elements]] classification example `Sentiment:`).
- **Design Heuristics:** Effective prompts follow [[prompt-design-tips]]: iterate from simple, front-load imperative verbs, anchor output format explicitly, quantify constraints, and phrase directives positively rather than via `DO NOT`.
- **Inference Settings as Companion Lever:** Beyond text, reliability is tuned via [[llm-settings]] (temperature, top_p, max length, stop sequences, frequency/presence penalties) operating on decoding logits during [[inference]] — detailed in [[source-promptingguide-introduction-settings]] and [[decoding-strategies]].
- **From Prompt Engineering to Context Engineering:** As LLM context windows expanded (from 2k tokens in GPT-3 to 128k+ tokens), the field shifted from crafting subtle prompt phrasing to systematically managing what documents, tools, and memory traces occupy the context window (RAG, agent scratchpads). This evolution — now termed [[context-engineering]] — is detailed in [[source-promptingguide-guides-context-engineering-guide]] and [[source-promptingguide-agents-context-engineering]], covering layered context (System/Task/Tool/Memory), date injection, structured schemas, and eval-driven iteration; tactical foundations remain in [[prompt-optimization]] (specificity, delimiters, decomposition, few-shot/CoT/ReAct).
- **Reasoning-Aware Prompting:** For native [[reasoning-llms]] / [[thinking-models]] (o3, Gemini 2.5 Pro, Claude 3.7), avoid manual CoT; instead give explicit constraints and structured I/O (prefer XML), using the hybrid ladder (non-thinking → low→medium→high).
- **Bias & Safety Awareness:** Exemplar distribution/order biases predictions on ambiguous inputs (see [[llm-bias]]: 8:2 skew flips `I feel something.`), and interfaces remain vulnerable to [[adversarial-prompting]] / [[prompt-injection]] (see [[source-promptingguide-risks-adversarial]]).

## Practical Implications
- **Immediate Iteration:** Enables rapid application prototyping without the cost and complexity of [[supervised-fine-tuning]] or [[rlhf]]. The guide validates the playground-first, iterative workflow: start with `The sky is` → add instruction `Complete the sentence:` → adopt `Q:/A:` format → add few-shot exemplars.
- **Application Breadth:** Seven canonical patterns in [[source-promptingguide-introduction-examples]] — summarization, extraction, grounded QA (with `Unsure` fallback to curb [[hallucination]]), classification with casing control, conversation via [[role-prompting]], code generation (comment → JS, schema → SQL), and stepwise reasoning — cover most product surfaces.
- **Vulnerability Surface:** Prompt interfaces are susceptible to adversarial exploits such as direct and indirect [[prompt-injection]]; role prompts and negations (`DO NOT`) are especially fragile, requiring affirmative fallback phrasing per [[prompt-design-tips]].
- **Cost & Latency Co-design:** Prompt length and [[llm-settings]] `max length`/stop sequences jointly determine tokens billed and KV-cache pressure during [[inference]].

## Connections
- Relies directly on the [[in-context-learning]] mechanics validated in [[source-language-models-are-few-shot-learners]] and illustrated via few-shot exemplars in [[source-promptingguide-introduction-basics]].
- Decomposes via [[prompt-elements]] and is refined using [[prompt-design-tips]] and [[prompt-optimization]] (specificity, structure, decomposition, few-shot/CoT/ReAct).
- Evolves into [[context-engineering]] (full-window orchestration for [[ai-agents]] / [[deep-agents]]) with [[function-calling]] and [[model-context-protocol]].
- Persona control realized through [[role-prompting]] (system/user/assistant roles).
- Sampling behavior modulated by [[llm-settings]] and the full taxonomy in [[decoding-strategies]] during [[inference]]; reasoning models add test-time scaling via [[reasoning-llms]] / [[thinking-models]].
- Primary practical lever to eliminate factual [[hallucination]] (grounded context + low temperature + few-shot abstention `?`) but must be balanced against [[llm-bias]] and hardened against [[adversarial-prompting]] / [[prompt-injection]].
- Defines interface protocols for autonomous agent [[tool-use]].

## Open Questions
- To what degree will manual prompt engineering become obsolete as models acquire autonomous search and reflection in [[thinking-models]]?

## Sources
- [[source-language-models-are-few-shot-learners]]
- [[source-deep-dive-into-llms-like-chatgpt]]
- [[source-promptingguide-introduction-basics]]
- [[source-promptingguide-introduction-elements]]
- [[source-promptingguide-introduction-tips]]
- [[source-promptingguide-introduction-examples]]
- [[source-promptingguide-introduction-settings]]
- [[source-promptingguide-guides-optimizing-prompts]]
- [[source-promptingguide-guides-context-engineering-guide]]
- [[source-promptingguide-agents-context-engineering]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
