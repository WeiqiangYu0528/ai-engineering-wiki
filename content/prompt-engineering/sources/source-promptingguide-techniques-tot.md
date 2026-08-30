---
type: source-summary
title: "Prompt Engineering Guide — Tree of Thoughts (ToT)"
summary: This chapter introduces Tree of Thoughts (ToT) (Yao et al. 2023 https://arxiv.org/abs/2305.10601; Long 2023 https://arxiv.org/abs/2305.08291) as the generalization of Chain-of-Thought Prompting that maintains a tree of…
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/tot.en.mdx"
date-published: 2023-01-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - agents
key-concepts:
  - "[[tree-of-thoughts]]"
  - "[[chain-of-thought]]"
  - "[[self-consistency]]"
  - "[[thinking-models]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-techniques-tot
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This chapter introduces Tree of Thoughts (ToT) (Yao et al. 2023 https://arxiv.org/abs/2305.10601; Long 2023 https://arxiv.org/abs/2305.08291) as the generalization of Chain-of-Thought Prompting that maintains a tree of…</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2023-01-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/tot.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
This chapter introduces **Tree of Thoughts (ToT)** (Yao et al. 2023 https://arxiv.org/abs/2305.10601; Long 2023 https://arxiv.org/abs/2305.08291) as the generalization of [[chain-of-thought]] that maintains a tree of intermediate "thoughts" as coherent language sequences, combined with search (BFS/DFS/beam) and LM self-evaluation to enable exploration, lookahead, and backtracking for strategic problem solving. Using **Game of 24** (decompose into 3 intermediate equations, keep b=5 best candidates, evaluate each as sure/maybe/impossible sampled 3×), it shows ToT substantially outperforming other prompt methods (Fig TOT3), distinguishes Yao's generic search vs Long's RL-trained ToT Controller, and notes lightweight **Tree-of-Thought Prompting** (Hulbert 2023 "three experts" single prompt) and PanelGPT benchmarking (Sun 2023).

## Key Takeaways
1. **CoT → ToT:** CoT is a linear chain; ToT is a branching tree where each node is a thought (partial solution) that can be generated, evaluated, and searched.
2. **Search + self-evaluation:** LM generates candidate thoughts and evaluates their promise (sure/maybe/impossible) with lookahead; search algorithms (BFS/DFS/beam) systematically explore the tree.
3. **Game of 24 recipe:** Decompose into 3 steps (intermediate equations), keep top b=5 candidates per step, value each thought 3× to reduce variance — aiming to promote correct partial solutions and prune impossible ones via commonsense size checks.
4. **Two variants compared:** Yao et al. — generic DFS/BFS/beam with no per-problem adaptation; Long — ToT Controller trained via RL that learns when/how far to backtrack, potentially evolving with data/self-play (AlphaGo vs brute force analogy).
5. **Single-prompt approximation:** Hulbert's Tree-of-Thought Prompting (`Imagine three different experts are answering… share 1 step, leave if wrong`) distills the framework into one prompt; Sun's PanelGPT benchmarks it at scale.

## Detailed Notes
### Core Framework (Yao et al. 2023)
- Images `TOT.png` (framework overview), `TOT2.png` (BFS evaluation process), `TOT3.png` (performance vs baselines) from paper.
- Definition: thoughts = coherent language sequences serving as intermediate steps; LM ability to generate + evaluate combined with search to enable systematic exploration with lookahead/backtracking.
- Task-dependent parameterization: number of candidates and steps must be defined per task.

### BFS for Game of 24 (worked illustration)
- Math reasoning task requires 3 steps each involving intermediate equation.
- At each step, best b=5 candidates kept.
- LM prompted to evaluate each candidate as `sure/maybe/impossible` w.r.t. reaching 24. Sampling 3 values per thought; rubric: promote verifiable correct partials, eliminate impossible based on "too big/small" commonsense, keep maybe.
- Figure TOT2 shows this evaluation loop; TOT3 shows ToT substantially outperforming I/O prompting, CoT, and CoT-SC.

### Long 2023 Variant
- Similar high-level multi-round conversation with tree search.
- Key difference: search strategy driven by RL-trained ToT Controller (when to backtrack, how many levels) vs generic DFS/BFS/beam.
- Advantage: controller can learn from new datasets or self-play, continuing to evolve even with frozen LLM — compared to generic search with no adaptation.

### Lightweight Prompting Form
- Hulbert 2023 Tree-of-Thought Prompting: single prompt encoding expert deliberation:
```
Imagine three different experts are answering this question.
All experts will write down 1 step of their thinking,
then share it with the group.
Then all experts will go on to the next step, etc.
If any expert realises they're wrong at any point then they leave.
The question is...
```
- Sun 2023 PanelGPT: large-scale benchmarking of this prompting form; introduced panel-discussion generalization.

### Resources
- Code: https://github.com/princeton-nlp/tree-of-thought-llm and https://github.com/jieyilong/tree-of-thought-puzzle-solver
- References: Hulbert https://github.com/dave1010/tree-of-thought-prompting; Sun https://github.com/holarissun/PanelGPT

## Notable Quotes
> "ToT maintains a tree of thoughts, where thoughts represent coherent language sequences that serve as intermediate steps toward solving a problem. This approach enables an LM to self-evaluate the progress through intermediate thoughts … combined with search algorithms (e.g., breadth-first search and depth-first search) to enable systematic exploration of thoughts with lookahead and backtracking."
> "the aim is to promote correct partial solutions that can be verdicted within few lookahead trials, and eliminate impossible partial solutions based on 'too big/small' commonsense, and keep the rest 'maybe'"
> "DFS/BFS/Beam search are generic solution search strategies with no adaptation to specific problems. In comparison, a ToT Controller trained through RL might be able learn from new data set or through self-play … and hence the RL-based ToT system can continue to evolve"

## Concepts Introduced or Referenced
- [[tree-of-thoughts]] — Branching search over thoughts with generative evaluation and backtracking.
- [[chain-of-thought]] — Linear precursor that ToT generalizes; ToT's nodes are CoT steps with branching.
- [[self-consistency]] — Alternative sampling strategy that votes over independent chains without search/backtracking; ToT's BFS evaluation refines this.
- [[thinking-models]] — Trained test-time search (o1/R1) operationalizes ToT-like exploration natively; this prompting framework is the zero-training predecessor.
- [[prompt-chaining]] — ToT can be implemented as chained prompts (generate → evaluate → select) similar to chaining.
- [[decoding-strategies]] — Branching requires controlled sampling per node.
- [[tool-use]] — Achieving verifiable evaluation often benefits from external verifiers / code execution interleaved in the search.

## Critical Assessment
- **Strengths:** Concise yet faithful synthesis of two primary papers plus two community extensions, with exact Game of 24 hyperparameters (3 steps, b=5, 3 samples, sure/maybe/impossible rubric); correctly distinguishes generic search vs RL controller with AlphaGo analogy; provides single-prompt distillation for practitioners without infrastructure.
- **Weaknesses:** Performance claim ("substantially outperforms") shown only via screenshot figure without tabular numbers; does not discuss exponential cost of BFS (5^3=125 leaf evaluations × 3 samples) or token budget vs CoT-SC. No failure analysis when LM's self-evaluation is poorly calibrated.
- **Contradictions:** None with [[chain-of-thought]] or [[self-consistency]]; but tension with [[thinking-models]] page should be explicit: trained reasoning models now internalize search, reducing need for hand-built ToT scaffolding.
- **Gaps to fill:** Link to [[automatic-reasoning-and-tool-use]] (programmatic tool-interleaved reasoning), [[prompt-chaining]] implementation pattern, and [[inference]] cost model for search.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/tot.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/tot.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/tot.en.mdx)
- Cited: Yao et al. 2023 https://arxiv.org/abs/2305.10601; Long 2023 https://arxiv.org/abs/2305.08291; Hulbert 2023 https://github.com/dave1010/tree-of-thought-prompting; Sun 2023 https://github.com/holarissun/PanelGPT

---

**Source:** Prompt Engineering Guide — Tree of Thoughts (ToT) by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/tot.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
