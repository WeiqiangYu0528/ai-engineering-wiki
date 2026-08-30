---
type: concept
title: "LLM Settings"
summary: LLM Settings are the API-level inference controls that shape generation alongside the prompt text itself.
visibility: public
aliases:
  - Inference Parameters
  - Generation Settings
  - Sampling Parameters
  - API Controls
  - wiki/llm-settings
tags:
  - inference
  - prompt-engineering
  - llm-fundamentals
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-introduction-settings]]"
  - "[[source-how-to-generate]]"
  - "[[source-promptingguide-introduction-examples]]"
related:
  - "[[inference]]"
  - "[[decoding-strategies]]"
  - "[[prompt-engineering]]"
  - "[[prompt-elements]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">LLM Settings are the API-level inference controls that shape generation alongside the prompt text itself.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/inference/concepts/decoding-strategies">Decoding Strategies</a></li><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/prompt-engineering/concepts/prompt-elements">Prompt Elements</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-promptingguide-introduction-settings">Prompt Engineering Guide — LLM Settings</a></li><li><a href="/llm-fundamentals/sources/source-how-to-generate">How to generate text: using different decoding methods for language generation with Transformers</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-introduction-examples">Prompt Engineering Guide — Examples of Prompts</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**LLM Settings** are the API-level inference controls that shape generation alongside the prompt text itself. The six settings surveyed in the DAIR.AI Prompt Engineering Guide — **Temperature**, **Top P (nucleus)**, **Max Length**, **Stop Sequences**, **Frequency Penalty**, and **Presence Penalty** — all operate on the logits produced during the [[inference]] decoding phase and are complementary to prompt wording.

## Key Ideas
- **Temperature (`T`)** — Rescales logits before softmax: $P_i \propto \exp(z_i / T)$. $T \to 0$ → greedy/argmax (deterministic, best for factual QA, code, extraction); $T=1$ → original distribution; $T \in [0.8,1.2]$ → flatter, diverse/creative. Detailed math in [[decoding-strategies]].
- **Top P (nucleus sampling)** — Keeps the smallest token set with cumulative $\sum P \ge p$, renormalizes, then samples. Low $p$ (~0.2) → narrow, high-confidence pool; high $p$ (~0.95) → broad pool including rarer tokens. Adapts to entropy per step, unlike fixed Top K.
- **Max Length / `max_new_tokens`** — Caps generated tokens; controls cost, latency, and prevents runaway continuations. Provider may expose as `max_tokens` (total context+completion) or `max_new_tokens`.
- **Stop Sequences** — Literal strings (e.g., `"\n\n"`, `"11"`, `"</json>"`) that force termination upon generation; used to bound list length or enforce field structure paired with [[prompt-elements]] output indicators (`Sentiment:`).
- **Frequency Penalty** — Penalty proportional to `count(token)` in prompt+completion; suppresses verbatim repetition proportionally (OpenAI range typically $[-2,2]$).
- **Presence Penalty** — Binary penalty if `count(token)>0`; penalizes any repetition equally, discouraging topic loops (also $[-2,2]$).
- **Heuristic from [[source-promptingguide-introduction-settings]]:** Vary temperature *or* top_p, not both; vary frequency *or* presence penalty, not both — to avoid compounding stochasticity (practitioners often relax this, e.g., `T=0.7, p=0.95`).

## How It Works
```
Prompt tokens → [Prefill] → Logits z → (z / T) → softmax → (Top P filter → renormalize)
               → (Frequency/Presence penalty adjust logits) → sample → check Stop Sequence / Max Length → KV-cache loop
```
1. **Logits** from the Transformer LM head are divided by $T$.
2. **Top P** truncates the tail before sampling; **frequency/presence** penalties subtract from logits of repeated tokens.
3. Sampling draws the next token; if the generated suffix matches a **stop sequence** or token count reaches **max length**, generation halts (analogous to `EOS`).
- In Hugging Face `transformers` this maps to `model.generate(temperature=…, top_p=…, max_new_tokens=…, …)` flags documented in [[source-how-to-generate]].

## Practical Implications
- **Factual vs creative task tuning:** Use $T\in[0.1,0.3],\ p\in[0.1,0.3]$ for extraction/QA/classification where [[hallucination]] risk is high; use $T\in[0.8,1.2],\ p\in[0.9,1.0]$ for brainstorming/story/code diversity.
- **Cost & latency:** `max length` directly controls tokens billed; stop sequences avoid paying for trailing boilerplate. Both interact with KV-cache memory (longer = larger cache) noted in [[inference]].
- **Repetition cures:** Prefer `frequency_penalty` for verbatim n-gram loops (e.g., greedy dog-walk loop in [[decoding-strategies]]), `presence_penalty` for topical staleness. Start with one at $0.1$–$0.6$ and ablate.
- **Experimentation mandatory:** Optimal values vary by model version (as guide notes), prompt composition, and whether [[prompt-elements]] already constrain output via examples.

## Connections
- Operates inside the **decoding phase** of [[inference]] (memory-bandwidth-bound, KV-cache-assisted loop).
- Realizes the stochastic side of [[decoding-strategies]] alongside greedy/beam search; this page is the API-facing complement to that paper's `generate()` taxonomy.
- Complements [[prompt-engineering]] text levers; settings are the other half of reliability after prompt crafting.
- Interacts with [[prompt-elements]]: output indicator + stop sequence jointly define structure; exemplars in context reduce need for high penalties.
- Low $T$/low $p$ is a lightweight mitigation for [[hallucination]] alongside grounding and [[rlhf]] alignment (alternative: grounded context in [[prompt-elements]]).

## Open Questions
- When does joint tuning of $T$ and $p$ (e.g., `T=0.7, p=0.95`) outperform single-knob tuning across diverse workloads?
- Can penalty scheduling (high early, low later) adaptively balance focus vs diversity without manual per-task tuning?
- How do structured decoding constraints (JSON mode, grammar-guided generation) compose with nucleus sampling and penalties without breaking distributional guarantees?

## Sources
- [[source-promptingguide-introduction-settings]]
- [[source-how-to-generate]]
- [[source-promptingguide-introduction-examples]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
