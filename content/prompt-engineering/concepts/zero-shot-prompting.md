---
type: concept
title: "Zero-Shot Prompting"
summary: Zero-Shot Prompting is the prompting paradigm where a frozen LLM is instructed to perform a task with no input-output demonstrations — only a natural-language instruction, the query input, and an output indicator.
visibility: public
aliases:
  - Zero-Shot
  - 0-Shot Prompting
  - Instruction-Only Prompting
  - wiki/zero-shot-prompting
tags:
  - prompt-engineering
  - llm-fundamentals
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-techniques-zeroshot]]"
  - "[[source-promptingguide-techniques-fewshot]]"
  - "[[source-language-models-are-few-shot-learners]]"
related:
  - "[[few-shot-prompting]]"
  - "[[in-context-learning]]"
  - "[[prompt-engineering]]"
  - "[[chain-of-thought]]"
  - "[[retrieval-augmented-generation]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Zero-Shot Prompting is the prompting paradigm where a frozen LLM is instructed to perform a task with no input-output demonstrations — only a natural-language instruction, the query input, and an output indicator.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/prompt-engineering/concepts/prompt-elements">Prompt Elements</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/few-shot-prompting">Few-Shot Prompting</a></li><li><a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></li><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></li><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-zeroshot">Prompt Engineering Guide — Zero-Shot Prompting</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-fewshot">Prompt Engineering Guide — Few-Shot Prompting</a></li><li><a href="/llm-fundamentals/sources/source-language-models-are-few-shot-learners">Language Models are Few-Shot Learners</a></li></ul></nav>
</aside>

## Overview
**Zero-Shot Prompting** is the prompting paradigm where a frozen LLM is instructed to perform a task with **no input-output demonstrations** — only a natural-language instruction, the query input, and an output indicator. Success depends on large-scale [[pretraining]] plus instruction tuning / [[rlhf]] that teaches the model to map directives like *Classify sentiment* to the underlying task distribution, as formalized in the DAIR Guide's `Classify → Text → Sentiment:` pattern.

## Key Ideas
- **Exemplar-free baseline:** Prompt contains Instruction + Input Data + Output Indicator per [[prompt-elements]]; the Context slot is empty. Example from [[source-promptingguide-techniques-zeroshot]]:
  ```
  Classify the text into neutral, negative or positive.
  Text: I think the vacation is okay.
  Sentiment:
  → Neutral
  ```
  No labeled exemplars precede the query; `Sentiment:` cues the answer format.
- **Enabled by post-training, not pretraining alone:** Wei et al. 2022 instruction tuning (finetuning on instruction-described datasets) + RLHF alignment make modern models (GPT-3.5 Turbo, GPT-4, Claude 3) follow directives zero-shot; base autoregressive models without this step perform poorly.
- **Evaluation spectrum anchor:** The 0-shot endpoint of [[in-context-learning]]'s 0S → 1S → FS continuum defined in [[source-language-models-are-few-shot-learners]]; the gap between zero and few often widens with scale.
- **When to use vs escalate:** Recommended first attempt for any task well-represented in pretraining; when it fails or yields unstable formatting, escalate to [[few-shot-prompting]] before considering richer methods like [[chain-of-thought]].

## How It Works
```
[Instruction: Classify the text into neutral, negative or positive.]
[Input Data: Text: I think the vacation is okay.]
[Output Indicator: Sentiment:]  ← colonization-trigger for completion
```
1. Tokenizer encodes instruction + input + indicator contiguously into the context window (working memory).
2. Instruction-tuned self-attention matches the instruction against patterns seen during instruction tuning / RLHF and against the output-indicator token `Sentiment:`.
3. Model continues autoregressively after the indicator, sampling the next tokens as the label. Controlled by [[llm-settings]] temperature/top_p and [[decoding-strategies]] (greedy vs sampled).
4. Role mapping in chat APIs: Instruction → `system` (personality/constraints), Input Data → `user`, per [[role-prompting]].

## Practical Implications
- **Fastest iteration:** No exemplar curation; token cost minimal — ideal for playground prototyping per [[prompt-design-tips]] start-simple guidance.
- **Brittle on novel or reasoning-heavy tasks:** For parity reasoning `The odd numbers in this group add up to an even number: 15,32,5,13,82,7,1` zero- and even few-shot fail without [[chain-of-thought]] — zero-shot alone miscomputes (→ `Yes, 107 even`, actually 41 false). Need stepwise prompting.
- **Format sensitivity:** Casing and delimiter choice (`Sentiment:` vs `Label:`) directly affect output; one exemplar often fixes drift more cheaply than regex.
- **Grounding deficiency:** Without retrieved context, zero-shot is most prone to [[hallucination]]; pair with [[retrieval-augmented-generation]] for factual tasks (insert docs into Context slot).

## Connections
- Generalizes to [[prompt-engineering]] as the minimal instruction-only pattern; decomposes via [[prompt-elements]].
- 0-shot extreme of [[in-context-learning]] (no demonstrations, weights frozen).
- Upgrades to [[few-shot-prompting]] by populating Context with exemplars, then to [[chain-of-thought]] by requiring intermediate steps.
- Mitigated by [[retrieval-augmented-generation]] / [[generated-knowledge-prompting]] adding knowledge to Context when parametric memory insufficient.
- Contrasted with [[supervised-fine-tuning]]/[[rlhf]] which bake task knowledge into weights vs prompting which leaves them frozen.

## Open Questions
- Which instruction phrasings are most robust across model families, or is optimal wording model-specific?
- How much does zero-shot performance benefit from explicitly including label descriptions vs bare label names?
- At what context-window scale does instruction-only prompting get eclipsed by retrieval-grounded prompting as the default?

## Sources
- [[source-promptingguide-techniques-zeroshot]]
- [[source-promptingguide-techniques-fewshot]]
- [[source-language-models-are-few-shot-learners]]
- [[source-promptingguide-introduction-basics]]

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/prompt-engineering/concepts/few-shot-prompting">Few-Shot Prompting</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
