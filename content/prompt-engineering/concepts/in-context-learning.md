---
type: concept
title: "In-Context Learning"
summary: In-Context Learning (ICL) is the capability of large language models to adapt to new tasks, follow novel instructions, and recognize complex patterns at inference time simply by conditioning on natural language…
visibility: public
aliases:
  - ICL
  - Few-Shot Prompting
  - Zero-Shot Prompting
  - Prompt Conditioning
  - wiki/in-context-learning
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
  - "[[source-promptingguide-introduction-examples]]"
related:
  - "[[chain-of-thought]]"
  - "[[self-consistency]]"
  - "[[scaling-laws]]"
  - "[[supervised-fine-tuning]]"
  - "[[hallucination]]"
  - "[[prompt-engineering]]"
  - "[[prompt-elements]]"
  - "[[prompt-design-tips]]"
  - "[[role-prompting]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">In-Context Learning (ICL) is the capability of large language models to adapt to new tasks, follow novel instructions, and recognize complex patterns at inference time simply by conditioning on natural language…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/prompt-engineering/concepts/few-shot-prompting">Few-Shot Prompting</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></li><li><a href="/prompt-engineering/concepts/self-consistency">Self-Consistency</a></li><li><a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></li><li><a href="/fine-tuning/concepts/supervised-fine-tuning">Supervised Fine-Tuning</a></li><li><a href="/eval-safety/concepts/hallucination">Hallucination</a></li><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/prompt-engineering/concepts/prompt-elements">Prompt Elements</a></li><li><a href="/prompt-engineering/concepts/prompt-design-tips">Prompt Design Tips</a></li><li><a href="/prompt-engineering/concepts/role-prompting">Role Prompting</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-chain-of-thought-prompting-elicits-reasoning">Chain-of-Thought Prompting Elicits Reasoning in Large Language Models</a></li><li><a href="/llm-fundamentals/sources/source-language-models-are-few-shot-learners">Language Models are Few-Shot Learners</a></li><li><a href="/llm-fundamentals/sources/source-deep-dive-into-llms-like-chatgpt">Deep Dive into LLMs like ChatGPT</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-introduction-basics">Prompt Engineering Guide — Basics of Prompting</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-introduction-elements">Prompt Engineering Guide — Elements of a Prompt</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-introduction-examples">Prompt Engineering Guide — Examples of Prompts</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**In-Context Learning (ICL)** is the capability of large language models to adapt to new tasks, follow novel instructions, and recognize complex patterns at inference time simply by conditioning on natural language descriptions and input-output demonstrations inside the context window—**without any gradient updates or weight modifications**.

## Key Ideas
- **Meta-Learning via Text Prompts:** During [[pretraining]], models observe diverse problem-solving formats across web text. At inference time, the model uses its internal attention activations as an inner-loop optimizer to recognize the task structure and infer desired completions.
- **The Evaluation Spectrum:**
  - **Zero-Shot (0S):** Model receives only a natural language instruction describing the task (e.g., *"Translate English to French: Cat $\to$"*). In [[source-promptingguide-introduction-basics]] the canonical zero-shot format is `Q: <Question>? A:` or bare `What is prompt engineering?` — the model infers QA intent from the delimiter and instruction alone.
  - **One-Shot (1S):** Model receives an instruction and exactly one exemplar $(x_1, y_1)$ before the target prompt $(x_2)$. Illustrated in [[source-promptingguide-introduction-examples]] where a single `Text: I think the vacation is okay. Sentiment: neutral` exemplar corrects casing `Neutral` → `neutral`.
  - **Few-Shot (FS):** Model receives $K$ exemplars $(x_1, y_1), \dots, (x_K, y_K)$ (typically $K \in [5, 100]$) followed by the query $x_{K+1}$. Guide shows QA variant `Q:/A:` repeated $K$ times and classification with `// Positive` delimiters.
- **Prompt Format as Task Specification:** Per [[source-promptingguide-introduction-basics]] and [[prompt-elements]], the choice of delimiters (`Q:/A:`, `//`, `Sentiment:`) matters less than consistency; the model infers the mapping function from the pattern of demonstrations.
- **Emergence with Scale:** First comprehensively demonstrated at scale by [[openai]] in [[source-language-models-are-few-shot-learners]] (GPT-3). The performance gap between zero-shot and few-shot expands significantly as parameter scale grows. Wei et al. (2022) in [[source-chain-of-thought-prompting-elicits-reasoning]] showed a *second* emergence: **[[chain-of-thought]]** prompting (adding reasoning steps to exemplars) is flat/harmful at small scale but >2× on GSM8K at ~100B+ (PaLM 540B 8-shot SOTA), with robustness to annotators and ability to generalize to longer OOD symbolic tasks.

## How It Works
```
Prompt in Context Window:
[Task Instruction]            ← Instruction element [[prompt-elements]]
Example 1: Input -> Output    ← Context element (demonstration)
Example 2: Input -> Output
...
Example K: Input -> Output
Query: New Input -> [Model Predicts Completion based on In-Context Attention]
Output Indicator:             ← e.g., "Sentiment:", "A:", "Answer:"
```
1. Input tokens and demonstrations are projected into the model's KV activations. The guide's `This is awesome! // Positive` pattern is encoded as tokens including the delimiter.
2. Self-attention layers compute associative matches between the demonstration patterns and the target query (e.g., matching `// ` → label association).
3. The model generates the next tokens matching the inferred output format, respecting the [[prompt-elements]] output indicator.
4. **Format control effect:** Even a single exemplar can override pretraining priors (e.g., correcting label casing or invented labels like `nutral` per [[source-promptingguide-introduction-examples]]), demonstrating that context outweighs parametric bias when explicit.

## Practical Implications
- **Eliminates Need for Fine-Tuning Datasets:** Developers can build complex applications (classification, parsing, extraction, code generation) in seconds simply by writing clear prompts with 3–5 high-quality examples — validated on `gpt-3.5-turbo` across summarization, extraction, QA, and code generation in [[source-promptingguide-introduction-examples]].
- **Format Enforcement Without Regex:** Adding one exemplar fixes casing (`neutral` vs `Neutral`) or structural drift far more reliably than post-processing; invented vocabularies (e.g., `nutral`) require label descriptions or additional exemplars per [[source-promptingguide-introduction-examples]].
- **Grounding Against Hallucination:** Pairing ICL with context-provided passages (grounded QA template: `Context: … Question: … Answer:` with `Unsure` fallback) anchors generation and reduces parametric confabulation.
- **Eliminates Catastrophic Forgetting:** Because model weights remain frozen, serving a single base model can solve thousands of distinct enterprise tasks simultaneously without maintaining task-specific fine-tuned checkpoints.

## Connections
- Validated as a primary capability unlocked by [[scaling-laws]].
- Serves as the operational foundation for modern [[prompt-engineering]] and agent [[tool-use]].
- Decomposes via [[prompt-elements]]: the Context element carries few-shot demonstrations, the Output Indicator cues the answer span.
- Refined by [[prompt-design-tips]] (specificity via examples) and specialized as [[role-prompting]] (persona demos are stylistic few-shot).
- Directly mitigates [[hallucination]] by grounding answers in prompt-provided context (grounded QA pattern from [[source-promptingguide-introduction-examples]]).

## Open Questions
- Is in-context learning executing implicit gradient descent in activation space, or is it Bayesian inference over pretraining concepts?
- What are the limits of in-context learning when tasks contradict pretraining priors?

## Sources
- [[source-language-models-are-few-shot-learners]]
- [[source-deep-dive-into-llms-like-chatgpt]]
- [[source-promptingguide-introduction-basics]]
- [[source-promptingguide-introduction-elements]]
- [[source-promptingguide-introduction-examples]]

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
