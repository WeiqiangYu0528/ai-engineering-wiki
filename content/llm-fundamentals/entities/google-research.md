---
type: entity
title: "Google Research"
summary: Google Research (and its former division Google Brain, now unified as Google DeepMind) is one of the world's premier artificial intelligence research organizations.
status: draft
visibility: public
entity-type: organization
tags:
  - llm-fundamentals
  - open-source
created: 2026-08-23
updated: 2026-08-24
url: "https://research.google"
related:
  - "[[transformer]]"
  - "[[self-attention]]"
  - "[[chain-of-thought]]"
  - "[[openai]]"
aliases:
  - wiki/google-research
---

<aside class="kb-header kb-type-entity" aria-label="Page information">
<p class="kb-type">Entity</p>
<p class="kb-summary">Google Research (and its former division Google Brain, now unified as Google DeepMind) is one of the world's premier artificial intelligence research organizations.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/self-attention">Self-Attention Mechanism</a></li><li><a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></li><li><a href="/llm-fundamentals/entities/openai">OpenAI</a></li></ul></nav>
</aside>

## Overview
**Google Research** (and its former division Google Brain, now unified as Google DeepMind) is one of the world's premier artificial intelligence research organizations. Google Research originated the **[[transformer]]** architecture in 2017, which catalyzed the modern revolution in natural language processing and generative AI.

## Key Facts
- **Invention of the Transformer (2017):** Authors Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan Gomez, Łukasz Kaiser, and Illia Polosukhin published [[source-attention-is-all-you-need]], introducing self-attention and replacing recurrence.
- **Chain-of-Thought Prompting (2022):** Jason Wei et al. at Brain Team introduced CoT in [[source-chain-of-thought-prompting-elicits-reasoning]] — PaLM 540B 8-shot CoT reaches GSM8K SOTA, demonstrating emergent reasoning at ~100B scale with robustness ablations and symbolic OOD generalization.
- **BERT & Bidirectional Encoders (2018):** Released BERT (Bidirectional Encoder Representations from Transformers), revolutionizing search ranking and NLP embeddings.
- **T5 & PaLM / Gemini Series:** Pioneered sequence-to-sequence unified frameworks (T5) and frontier multimodal models (PaLM, Gemini).
- **Core Open-Source Contributions:** Created TensorFlow, JAX, Tensor2Tensor, and foundational distributed training frameworks.

## Significance in AI Engineering
- The birthplace of modern self-attention mechanisms and foundational transformer scaling.
- Continues to drive research in frontier multimodal modeling, long-context inference (1M-2M+ tokens), and TPU hardware accelerators.

## Related Concepts
- [[transformer]]
- [[self-attention]]
- [[chain-of-thought]]
- [[positional-encoding]]
- [[pretraining]]

## Sources
- [[source-chain-of-thought-prompting-elicits-reasoning]]
- [[source-attention-is-all-you-need]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
