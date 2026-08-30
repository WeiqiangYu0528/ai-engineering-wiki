---
type: source-summary
title: "Prompt Engineering Guide — LLM Settings"
summary: "This chapter surveys the API-level inference parameters that modulate LLM output alongside the prompt itself: Temperature, Top P (nucleus), Max Length, Stop Sequences, Frequency Penalty, and Presence Penalty."
status: draft
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/settings.en.mdx"
date-published: 2023-01-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - inference
  - llm-fundamentals
key-concepts:
  - "[[llm-settings]]"
  - "[[inference]]"
  - "[[decoding-strategies]]"
  - "[[prompt-engineering]]"
key-entities:
  - "[[openai]]"
aliases:
  - wiki/source-promptingguide-introduction-settings
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This chapter surveys the API-level inference parameters that modulate LLM output alongside the prompt itself: Temperature, Top P (nucleus), Max Length, Stop Sequences, Frequency Penalty, and Presence Penalty.</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2023-01-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/settings.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 6 of 6 figures on this page were not found in [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/settings.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/settings.en.mdx): `0.8`, `1.2`, `0.1`, `0.3`, `0.9`, `1.0`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

This chapter surveys the API-level inference parameters that modulate LLM output alongside the prompt itself: **Temperature**, **Top P (nucleus)**, **Max Length**, **Stop Sequences**, **Frequency Penalty**, and **Presence Penalty**. It frames tuning these knobs as essential for reliability and cost control, offers task-specific heuristics (low temperature/top_p for factual QA, high for creative generation), and notes the practical advice to vary temperature *or* top_p — and frequency *or* presence penalty — but not both simultaneously.

## Key Takeaways
1. **Temperature controls determinism:** Lower `T` (→0) collapses to greedy/argmax (factual, concise); higher `T` (≈0.8–1.2) flattens the distribution for diversity/creativity.
2. **Top P is dynamic truncation:** Nucleus sampling keeps the smallest token set with cumulative probability ≥ `p`; low `p` (≈0.1–0.3) narrows to confident tokens, high `p` (≈0.9–1.0) admits diverse tails. Guide advises tuning temperature *or* top_p, not both.
3. **Length and structure via Max Length & Stop Sequences:** `max length` caps generated tokens (cost/latency control); `stop sequence` (e.g., `"11"` to cap a 10-item list) halts generation at a literal string.
4. **Repetition control via penalties:** `frequency penalty` scales with token count (proportional suppression), `presence penalty` is binary per token (appear-once vs appear-many penalized equally). Guide advises tuning one, not both.
5. **Empirical tuning required:** No universal setting; results vary across model versions, so experimentation across prompts and providers is mandatory.

## Detailed Notes

### Temperature
- Definition: softmax rescaling `P_i ∝ exp(logit_i / T)`.
- Low `T`: sharp, near-deterministic; suitable for fact-based QA, code, structured extraction.
- High `T`: softer, samples lower-rank tokens; suitable for poem, story, brainstorming.
- Trades off against [[decoding-strategies]] greedy vs sampling continuum.

### Top P (Nucleus Sampling)
- With `top_p`, only tokens comprising the top `p` probability mass are considered before sampling.
- Low `top_p`: most confident responses; high `top_p`: broader vocabulary including less likely words.
- Overlaps with [[decoding-strategies]] `top_p` section; guide's "alter T or top_p but not both" is a heuristic to avoid compounding stochasticity (not a hard constraint in modern APIs).

### Max Length
- Manages number of generated tokens; prevents overly long/irrelevant outputs and controls billing (per-token pricing).

### Stop Sequences
- String that forces `EOS`-like termination; another mechanism alongside `max length` to bound output length/shape (list of 10 items example with stop `"11"`).

### Frequency vs Presence Penalty
- **Frequency:** `penalty ∝ count(token)` — higher reduces verbatim repetition, proportional to frequency.
- **Presence:** `penalty = c if count>0 else 0` — flat penalty per distinct token, discourages topic repetition regardless of count.
- Use higher presence penalty for diverse/creative text; lower to keep model focused. Often exposed as `frequency_penalty ∈ [-2,2]`, `presence_penalty ∈ [-2,2]` in OpenAI API.
- Guide notes: tune one or the other, mirroring the T/top_p advice.

### Caveat
- Results vary by model version; the guide's examples were validated on `gpt-3.5-turbo`.

## Notable Quotes
> "The lower the temperature, the more deterministic the results in the sense that the highest probable next token is always picked."

> "If you use Top P it means that only the tokens comprising the top_p probability mass are considered for responses, so a low top_p value selects the most confident responses."

> "The general recommendation is to alter temperature or Top P but not both."

## Concepts Introduced or Referenced
- [[llm-settings]] — Core concept: six API inference controls and their interaction with prompting.
- [[inference]] — Prefill/decoding phases and KV-cache context where temperature/top_p operate on logits.
- [[decoding-strategies]] — Greedy, beam, temperature, Top-K/Top-p sampling taxonomy; this guide's T/top_p map directly to stochastic decoding.
- [[prompt-engineering]] — Settings as complementary lever to prompt text for reliability/desirability.
- [[hallucination]] — Implicit: low T/top_p recommended to reduce confabulation on factual tasks.

## Critical Assessment
- **Strengths:** Concise operational checklist for practitioners first approaching LLM APIs; correctly identifies the six most common knobs across providers (OpenAI, Cohere, Anthropic); practical heuristics (factual vs creative) are actionable.
- **Weaknesses:** Lacks mathematical formulation (softmax equation) and concrete value ranges; "don't tune both" is oversimplified — modern practice often tunes `temperature=0.7, top_p=0.95` jointly. No coverage of `seed`, `logit_bias`, `response_format`/`structured outputs`, or beam-width equivalents. Stop-sequence example (`"11"`) is simplistic and could mislead about list generation.
- **Contradictions:** None, but detail level is far shallower than [[inference]] and [[decoding-strategies]] which provide softmax math, Transformer Explainer visuals, and `transformers` `generate()` flags. This source is best treated as introductory checklist, not canonical reference.
- **Integration note:** Should cross-link to [[decoding-strategies]] for sampling maths and [[inference]] for cost/KV-cache implications of `max length`.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/settings.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/settings.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/settings.en.mdx)

---

**Source:** Prompt Engineering Guide — LLM Settings by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/settings.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
