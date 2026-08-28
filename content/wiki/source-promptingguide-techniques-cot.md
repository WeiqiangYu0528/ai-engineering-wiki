---
type: source-summary
title: "Prompt Engineering Guide — Chain-of-Thought Prompting"
summary: This flagship techniques chapter introduces Chain-of-Thought (CoT) prompting (Wei et al. 2022) as the method to unlock complex reasoning by forcing the model to emit intermediate steps before the final answer, then…
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/cot.en.mdx"
date-published: 2023-01-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - llm-fundamentals
  - agents
key-concepts:
  - "[[chain-of-thought]]"
  - "[[self-consistency]]"
  - "[[tree-of-thoughts]]"
  - "[[thinking-models]]"
key-entities:
  - "[[openai]]"
  - "[[anthropic]]"
verified-by: agent
verified-on: 2026-08-27
---

# Prompt Engineering Guide — Chain-of-Thought Prompting

## Summary
This flagship techniques chapter introduces **Chain-of-Thought (CoT) prompting** (Wei et al. 2022) as the method to unlock complex reasoning by forcing the model to emit intermediate steps before the final answer, then extends it to **Zero-shot CoT** ("Let's think step by step" — Kojima et al. 2022) and **Automatic CoT (Auto-CoT)** (Zhang et al. 2022) which auto-clusters questions and samples diverse demonstrations to eliminate hand-crafting. Using the parity-sum failure from prior pages (odd numbers summing to 41 → False), it shows few-shot CoT fixing the answer where vanilla few-shot failed, quantifies the "1 example is enough" effect, and details Auto-CoT's two-stage pipeline (question clustering → demonstration sampling with heuristics like 60 tokens / 5 steps).

## Key Takeaways
1. **Intermediate steps unlock reasoning:** Adding explicit reasoning traces (`Adding all the odd numbers (9,15,1) gives 25. The answer is False`) transforms arithmetic/commonsense/symbolic tasks from failure to perfect accuracy.
2. **CoT + few-shot is the standard recipe:** The canonical pattern is few-shot CoT: each exemplar shows its derivation, not just the label; the model then mimics the derivation for the query.
3. **Zero-shot CoT is a free lunch:** Appending `Let's think step by step.` to the apple arithmetic story (`10 -2 -2 +5 -1`) fixes the answer from `11` to correct `10` without any exemplars — especially valuable when few-shot budget is limited.
4. **Auto-CoT automates demonstration engineering:** Cluster questions → pick a representative per cluster → generate its chain via zero-shot CoT with heuristics (length, step count) → use as diverse demonstrations; mitigates manual effort and suboptimal hand-crafted chains.
5. **Emergent with scale:** Authors claim CoT is an emergent ability arising only with sufficiently large LLMs — smaller models do not benefit similarly.

## Detailed Notes
### Few-Shot CoT (Wei et al. 2022)
- Image `cot.png` from Wei paper; prompt skeleton:
```
Q: The odd numbers in this group add up to an even number: 4,8,9,15,12,2,1.
A: Adding all the odd numbers (9,15,1) gives 25. The answer is False.
... (4 exemplars)
Q: 15,32,5,13,82,7,1
A: → Adding all the odd numbers (15,5,13,7,1) gives 41. The answer is False. ✓
```
- Single-exemplar variant also succeeds — demonstrates high sample efficiency once reasoning format is shown.
- Tasks emphasized: arithmetic, commonsense, symbolic reasoning.

### Zero-Shot CoT (Kojima et al. 2022)
- Image `zero-cot.png`; technique: append `Let's think step by step.` to original prompt.
- Demo: apple count `10-2-2+5-1`:
  - Without: → `11 apples` (wrong)
  - With: model unfolds `10→6→11→10` step-by-step → `10 apples` (correct)
- Useful when you don't have many examples to craft few-shot CoT.

### Automatic CoT (Zhang et al. 2022)
- Motivation: manual hand-crafting of diverse, effective chains is labor-intensive and suboptimal.
- Proposes leveraging LLM itself with "Let's think step by step" to generate chains per demonstration automatically.
- Addresses generation errors via **diversity of demonstrations** — sampling varied questions matters.
- Two stages:
  1. Question clustering: partition dataset questions into clusters.
  2. Demonstration sampling: pick representative per cluster; generate chain via Zero-Shot-CoT with simple heuristics (e.g., question length ≈60 tokens, rationale ≈5 steps) to favor simple, accurate demos.
- Illustration `auto-cot.png`; code at https://github.com/amazon-science/auto-cot.

## Notable Quotes
> "chain-of-thought (CoT) prompting enables complex reasoning capabilities through intermediate reasoning steps. You can combine it with few-shot prompting to get better results on more complex tasks that require reasoning before responding."
> "Keep in mind that the authors claim that this is an emergent ability that arises with sufficiently large language models."
> "Auto-CoT, which samples questions with diversity and generates reasoning chains to construct the demonstrations."

## Concepts Introduced or Referenced
- [[chain-of-thought]] — Core: stepwise reasoning prior to answer; few-shot, zero-shot, and auto variants.
- [[self-consistency]] — Foreshadowed as next-stage sampling over CoT paths (Wang 2022).
- [[tree-of-thoughts]] — Generalization explored later (search over thoughts).
- [[thinking-models]] — Historical precursor to o1/R1 test-time scaling; this guide documents the prompting precursor to trained reasoning models.
- [[few-shot-prompting]] / [[zero-shot-prompting]] — CoT combines with both; format conditioning remains key.
- [[in-context-learning]] — CoT demonstrations as a richer form of ICL where the context carries derivations.
- [[decoding-strategies]] — Implicit: CoT interacts with sampling/greedy decoding (self-consistency exploits this).

## Critical Assessment
- **Strengths:** Clear before/after parity demo proves CoT value in one page; excellent progressive disclosure 1) few-shot CoT → 2) zero-shot CoT → 3) Auto-CoT automation, matching research chronology; correctly cites emergence and provides runnable GitHub links (Auto-CoT).
- **Weaknesses:** Does not quantify performance lifts (e.g., GSM8K numbers from Wei paper); zero-shot CoT example is anecdotal single-run with no variance. Auto-CoT heuristics (60 tokens / 5 steps) presented without empirical justification. No discussion of CoT downsides: longer context, higher cost/latency, potential for plausible-but-wrong chains.
- **Contradictions:** None with [[thinking-models]] page — complements it by showing prompting-time reasoning that later became trained deliberation; but should note trained [[thinking-models]] now outperform prompt-only CoT.
- **Next steps:** Cross-link to [[self-consistency]] (sampling multiple CoTs), [[tree-of-thoughts]] (search), [[prompt-chaining]] (chaining CoT steps), and [[retrieval-augmented-generation]] (ground each step).

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/cot.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/cot.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/cot.en.mdx)
- Cited: Wei et al. 2022 CoT https://arxiv.org/abs/2201.11903; Kojima et al. 2022 Zero-shot CoT https://arxiv.org/abs/2205.11916; Zhang et al. 2022 Auto-CoT https://arxiv.org/abs/2210.03493

---

**Source:** Prompt Engineering Guide — Chain-of-Thought Prompting by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/cot.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
