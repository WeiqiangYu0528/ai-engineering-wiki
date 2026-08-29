---
type: entity
title: "OpenAI"
summary: OpenAI is an AI research and deployment company that spearheaded the modern generative AI revolution.
status: draft
visibility: public
entity-type: organization
tags:
  - llm-fundamentals
  - fine-tuning
  - agents
created: 2026-08-23
updated: 2026-08-24
url: "https://openai.com"
related:
  - "[[structured-outputs]]"
  - "[[andrej-karpathy]]"
  - "[[transformer]]"
  - "[[scaling-laws]]"
  - "[[in-context-learning]]"
  - "[[alignment]]"
  - "[[rlhf]]"
  - "[[tool-use]]"
  - "[[model-context-protocol]]"
aliases:
  - wiki/openai
---

<aside class="kb-header kb-type-entity" aria-label="Page information">
<p class="kb-type">Entity</p>
<p class="kb-summary">OpenAI is an AI research and deployment company that spearheaded the modern generative AI revolution.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/inference/concepts/structured-outputs">Structured Outputs</a></li><li><a href="/llm-fundamentals/entities/andrej-karpathy">Andrej Karpathy</a></li><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></li><li><a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></li><li><a href="/fine-tuning/concepts/alignment">AI Alignment</a></li><li><a href="/fine-tuning/concepts/rlhf">Reinforcement Learning from Human Feedback</a></li><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/agents/concepts/model-context-protocol">Model Context Protocol</a></li></ul></nav>
</aside>

## Overview
**OpenAI** is an AI research and deployment company that spearheaded the modern generative AI revolution. Founded in 2015, OpenAI proved the viability of generative pretraining with Transformers, introduced [[in-context-learning]] with GPT-3, pioneered human preference [[alignment]] with InstructGPT, launched ChatGPT, and developed deliberate reasoning architectures with the OpenAI o-series (o1, o3).

## Key Facts
- **GPT Series & In-Context Learning:** 
  - GPT-1 (2018) & GPT-2 (2019): Demonstrated generative pretraining and zero-shot transfer.
  - GPT-3 (2020, [[source-language-models-are-few-shot-learners]]): Scaled decoder-only transformers to 175 billion parameters, proving that massive scaling unlocks few-shot [[in-context-learning]] without fine-tuning.
  - GPT-4 (2023): Frontier multimodal model setting global benchmarks across complex reasoning, law, and coding.
- **Pioneered Alignment (InstructGPT & RLHF):**
  - Published [[source-training-language-models-to-follow-instructions-with-human-feedback]] (2022), creating **InstructGPT** via a 3-step [[rlhf]] pipeline (SFT $\to$ Reward Modeling $\to$ PPO-ptx).
  - Proved that a 1.3B aligned InstructGPT model is preferred over a 175B base model, directly powering the launch of ChatGPT in November 2022.
- **Tools Infrastructure & Developer APIs:**
  - Established the global standard for function calling, Structured Outputs (`strict: true` — now split into **tool-calling** vs **direct-answer `text.format`** per [[source-structured-outputs]] with 7-language SDK samples and 4 patterns), hosted sandboxes (Code Interpreter, Web Search), Agent Skills, and the OpenAI Agents SDK as documented in [[source-openai-tools-and-agent-capabilities]] and `developers.openai.com/api/llms.txt` (LLM-friendly `.md` + index, recommend `gpt-5.6`).
  - Adopted the [[model-context-protocol]] for remote tool and connector integrations.
- **Inference-Time Reasoning:** Introduced the paradigm of test-time compute scaling and deliberate reasoning with the o1/o3 series of [[thinking-models]] in 2024.

## Significance in AI Engineering
- Established the de facto API standard for LLM integration, function calling ([[tool-use]]), Structured Outputs, and conversational interfaces.
- Drove commercial and open-source convergence in transformer architectures, tokenizer designs (`tiktoken`), [[scaling-laws]], preference [[alignment]], and safety red-teaming methodologies.

## Related Concepts
- [[structured-outputs]]
- [[transformer]]
- [[pretraining]]
- [[scaling-laws]]
- [[in-context-learning]]
- [[alignment]]
- [[supervised-fine-tuning]]
- [[rlhf]]
- [[thinking-models]]
- [[tool-use]]
- [[model-context-protocol]]

## Sources
- [[source-structured-outputs]]
- [[source-openai-tools-and-agent-capabilities]]
- [[source-training-language-models-to-follow-instructions-with-human-feedback]]
- [[source-language-models-are-few-shot-learners]]
- [[source-deep-dive-into-llms-like-chatgpt]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
