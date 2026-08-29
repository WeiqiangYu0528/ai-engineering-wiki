---
type: source-summary
title: "Prompt Engineering Guide — Self-Consistency"
summary: This chapter presents Self-Consistency (Wang et al. 2022) as the technique that replaces naive greedy decoding in Chain-of-Thought Prompting prompting by sampling multiple diverse reasoning paths via few-shot CoT and…
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/consistency.en.mdx"
date-published: 2023-01-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - agents
key-concepts:
  - "[[self-consistency]]"
  - "[[chain-of-thought]]"
  - "[[decoding-strategies]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-techniques-consistency
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This chapter presents Self-Consistency (Wang et al. 2022) as the technique that replaces naive greedy decoding in Chain-of-Thought Prompting prompting by sampling multiple diverse reasoning paths via few-shot CoT and…</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2023-01-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/consistency.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
This chapter presents **Self-Consistency** (Wang et al. 2022) as the technique that replaces naive greedy decoding in [[chain-of-thought]] prompting by sampling multiple diverse reasoning paths via few-shot CoT and marginalizing to the most consistent answer. Using the canonical failure `When I was 6 my sister was half my age. Now I'm 70…` (greedy → `35` wrong) and replicating Wang Table 17's 8-exemplar few-shot CoT prompt, it shows three sampled decodings (67, 67, 35) where majority vote (67) resolves to the correct answer, with noted lifts on arithmetic and commonsense reasoning.

## Key Takeaways
1. **From greedy to sampling:** Standard CoT uses greedy decoding; self-consistency samples diverse reasoning chains (temperature/top-p) through the same few-shot CoT prompt.
2. **Majority vote = robust answer:** Generate N completions (e.g., 3–40), extract final answers, select the most frequent — exploits the intuition that correct reasoning converges while errors diverge.
3. **Boosts CoT on reasoning-heavy tasks:** Reported gains on arithmetic (GSM8K) and commonsense benchmarks without any new prompting — purely decoding-side ensembling.
4. **Few-shot CoT is prerequisite:** Requires well-crafted intermediate-step demonstrations (borrowed from Wang Table 17: trees, cars, chocolates, lollipops, toys, computers, golf balls, bagels) to steer diverse yet plausible chains.
5. **Sister-age illustration:** Three outputs for the sibling problem (67/67/35) already show majority emerging even at N=3; paper aggregates more samples with weighted voting details.

## Detailed Notes
### Problem Setup
- Prompt without self-consistency:
```
When I was 6 my sister was half my age. Now I'm 70 how old is my sister?
→ 35 (wrong; halves 70 instead of computing offset 3 and adding to 70-6)
```
- Error type: mis-applied arithmetic despite simple steps.

### Few-Shot CoT Exemplars (Wang Table 17)
- 8 Q/A pairs with full derivations:
  - Trees 15→21 (+6), Cars 3+2 (=5), Chocolates (32+42)-35 (=39), Lollipops 20-12 (=8), Toys 5+2+2 (=9), Computers 9+4*5 (=29), Golf balls 58-23-2 (=33), Bagels 23-5*3 (=8 remaining)
- Each follows `Q: … A: <step-by-step> The answer is <N>.`

### Sampling & Aggregation
- Generate with sampling (not greedy) using same prompt → diverse chains:
  - Output 1: `3 → 70-3=67`
  - Output 2: elaborated `70-3=67`
  - Output 3: flawed `70/2=35` (same error as greedy)
- Final answer by majority: `67` wins 2-1.
- Paper details: computing final answer involves weighting / marginalizing over reasoning paths (refer to paper for full scoring).

### Scope
- Image-free page; links to Wang et al. https://arxiv.org/abs/2203.11171; emphasizes arithmetic + commonsense lift.

## Notable Quotes
> "self-consistency aims 'to replace the naive greedy decoding used in chain-of-thought prompting'. The idea is to sample multiple, diverse reasoning paths through few-shot CoT, and use the generations to select the most consistent answer."
> "We can see that there is already a majority answer emerging so that would essentially become the final answer."

## Concepts Introduced or Referenced
- [[self-consistency]] — Primary: sample-many + vote; decoding-strategy ensemble over CoT.
- [[chain-of-thought]] — Required base; self-consistency is CoT's decoding extension.
- [[decoding-strategies]] — Directly invokes sampling vs greedy (temperature, top-p, top-k) and its effect on reasoning diversity.
- [[few-shot-prompting]] — Few-shot CoT conditioning as the prompt substrate.
- [[thinking-models]] — Historical forerunner to test-time compute scaling (sampling is a cheap form of inference-time scaling).
- [[in-context-learning]] — Few-shot exemplars as in-context program.

## Critical Assessment
- **Strengths:** Minimal, memorable 3-sample demo that makes majority voting intuitive; correctly attributes to Wang et al. and reuses authoritative Table 17 exemplars rather than ad-hoc prompts; clearly positions improvement as complementary to CoT, not a replacement.
- **Weaknesses:** Does not specify decoding hyperparameters (temperature, N samples, aggregation beyond majority) enough to reproduce; shows only 3 samples (paper uses up to 40) — undersells that gains scale with N and cost. No discussion of latency/cost (N× tokens) or failure when model systematically biased (majority can be consistently wrong).
- **Contradictions:** None with [[chain-of-thought]] or [[decoding-strategies]] pages; but should note greedy CoT already covered there — this page upgrades it. No conflict with [[thinking-models]] which now natively samples internally.
- **Gaps:** Needs link to [[llm-settings]] (how to set temperature for diversity without drifting), [[tool-use]] (verifiers can replace voting), and cost/latency trade-offs during [[inference]].

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/consistency.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/consistency.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/consistency.en.mdx)
- Cited: Wang et al. 2022 Self-Consistency https://arxiv.org/abs/2203.11171

---

**Source:** Prompt Engineering Guide — Self-Consistency by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/consistency.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
