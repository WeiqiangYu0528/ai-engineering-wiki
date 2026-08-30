---
type: concept
title: "Few-Shot Prompting"
summary: Few-Shot Prompting enables In-Context Learning by prepending K input-output demonstrations to the prompt so the frozen LLM infers the task mapping via attention over context, without gradient updates.
visibility: public
aliases:
  - Few-Shot
  - In-Context Learning Demonstrations
  - K-Shot Prompting
  - wiki/few-shot-prompting
tags:
  - prompt-engineering
  - llm-fundamentals
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-techniques-fewshot]]"
  - "[[source-promptingguide-techniques-zeroshot]]"
  - "[[source-language-models-are-few-shot-learners]]"
related:
  - "[[zero-shot-prompting]]"
  - "[[in-context-learning]]"
  - "[[chain-of-thought]]"
  - "[[self-consistency]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Few-Shot Prompting enables In-Context Learning by prepending K input-output demonstrations to the prompt so the frozen LLM infers the task mapping via attention over context, without gradient updates.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/prompt-engineering/concepts/zero-shot-prompting">Zero-Shot Prompting</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/zero-shot-prompting">Zero-Shot Prompting</a></li><li><a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></li><li><a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></li><li><a href="/prompt-engineering/concepts/self-consistency">Self-Consistency</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-fewshot">Prompt Engineering Guide — Few-Shot Prompting</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-zeroshot">Prompt Engineering Guide — Zero-Shot Prompting</a></li><li><a href="/llm-fundamentals/sources/source-language-models-are-few-shot-learners">Language Models are Few-Shot Learners</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**Few-Shot Prompting** enables **[[in-context-learning]]** by prepending **K input-output demonstrations** to the prompt so the frozen LLM infers the task mapping via attention over context, without gradient updates. First systematically scaled in Brown et al. 2020 GPT-3, it ranges from **1-shot** (single exemplar) to **10+/few dozen-shot**, with capability **emerging only at sufficient model scale** (Kaplan 2020; LLaMA). The DAIR Guide shows the 1-shot nonce-word success (`whatpu/farduddle`) alongside the subtle findings from Min et al. 2022 that format and label distribution often outweigh per-example label correctness.

## Key Ideas
- **Conditioning substrate:** Demonstrations occupy the [[prompt-elements]] Context slot; the model performs meta-learning via forward-pass attention rather than weight updates.
- **Emergence with scale:** Few-shot properties first appear when parameters/compute cross a threshold — larger models are disproportionately better meta-learners (gap zero→few widens with scale per [[scaling-laws]]).
- **Label space + distribution + format > label correctness (Min 2022):**
  - Input distribution and label space specified by demos both matter even if individual labels are wrong.
  - Consistent format (e.g., `//` or `Q:/A:`) is critical — even random labels >> no labels if format and true label distribution are preserved.
  - Uniform random label sampling underperforms sampling from the true distribution.
  - Newer GPT models are increasingly **format-robust** (shuffled `Positive This is awesome!` still yields correct `Negative`) but verification remains task-dependent.
- **Canonical successes and failure:**
  - Success (Brown 2020): 1-shot `whatpu → farduddle` nonce generalization.
  - Failure: parity reasoning `15,32,5,13,82,7,1` still errs even with 4 few-shot QA labels (`True/False` only) — demonstrating the ceiling of label-only few-shot without [[chain-of-thought]].
- **K selection:** Easy tasks need K=1–3; harder tasks up to 10–100; beyond that, context cost and diminishing returns favor fine-tuning or advanced prompting.

## How It Works
```
[Instruction] (optional, often implicit)
[Context: K demonstrations — exemplars]
Example 1: Input → Output   ← e.g., This is awesome! // Positive
Example 2: Input → Output
...
Example K: Input → Output
[Input Data: Query instance]
[Output Indicator: Sentiment: / A: / //]  → model completes
```
1. Demonstrations are tokenized together with the query; delimiters (`//`, `Q:/A:`, `Sentiment:`) create consistent slot patterns.
2. Self-attention computes associative matches between demonstration input→label mappings and the query (e.g., `// ` → label association).
3. Model samples continuation matching inferred output distribution — a single exemplar can override casing drift (`neutral` vs `Neutral`/`nutral`) that [[prompt-design-tips]] warns about.
4. [[decoding-strategies]] (greedy vs sampling) and [[llm-settings]] modulate continuation; few-shot reduces variance vs zero-shot.

## Practical Implications
- **No fine-tuning needed for many tasks:** Classification, extraction, parsing, code generation prototypes achievable in seconds with 3–5 high-quality exemplars (cf. [[source-promptingguide-introduction-examples]]'s `gpt-3.5-turbo` demos).
- **Design for distribution, not perfection:** Curate exemplars that reflect expected input diversity and true label prior; don't over-invest in per-example label perfection at expense of format consistency.
- **Delimiter discipline:** Pick one delimiter (`//`, `Q:/A:`, `Sentiment:`) and hold it constant — per [[prompt-elements]] output indicator advice; inconsistency historically degraded older models.
- **Know the ceiling:** Multi-step arithmetic/commonsense tasks with mere label supervision still hallucinate; switch to [[chain-of-thought]] (stepwise derivations per exemplar) or [[self-consistency]] (sample many) or [[prompt-chaining]].
- **Cost/latency trade-off:** Each exemplar costs tokens; many-shot is whole-document prompting — prefix caching can mitigate but monitor [[inference]] KV-cache pressure.

## Connections
- Zero→few escalation from [[zero-shot-prompting]]; both are realizations of [[in-context-learning]] and [[prompt-engineering]] core pattern.
- Output control via [[prompt-elements]] (Context carries demos, Output Indicator cues answer).
- Enriched by [[chain-of-thought]] (demos carry derivations), ensembled by [[self-consistency]] (sample diverse chains), branched by [[tree-of-thoughts]].
- Related to [[generated-knowledge-prompting]] where context is model-generated knowledge rather than human labels.
- When exemplars insufficient, add grounding via [[retrieval-augmented-generation]] or decomposition via [[prompt-chaining]].
- Versus [[supervised-fine-tuning]]/[[rlhf]]: frozen weights handle many tasks concurrently without catastrophic forgetting.

## Open Questions
- Does few-shot implement implicit gradient descent in activation space or Bayesian inference over pretraining concepts?
- How to optimally select K exemplars (retrieval, diversity, nearest-neighbor) for a given query at inference time?
- Can automated optimizers (DSPy, prompt tuning) discover exemplar sets that beat hand-crafted curations for invented vocabularies?

## Sources
- [[source-promptingguide-techniques-fewshot]]
- [[source-promptingguide-techniques-zeroshot]]
- [[source-language-models-are-few-shot-learners]]
- [[source-promptingguide-introduction-basics]]

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
