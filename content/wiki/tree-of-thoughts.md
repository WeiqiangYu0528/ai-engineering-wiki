---
type: concept
title: "Tree of Thoughts (ToT)"
summary: Tree of Thoughts (ToT) (Yao et al. 2023 https://arxiv.org/abs/2305.10601; Long 2023 https://arxiv.org/abs/2305.08291) generalizes Chain-of-Thought Prompting from a linear chain to a searchable tree where each node is a…
visibility: public
aliases:
  - "Tree of Thought"
  - "ToT"
  - "Tree-of-Thought Prompting"
tags:
  - prompt-engineering
  - agents
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-techniques-tot]]"
  - "[[source-promptingguide-techniques-cot]]"
  - "[[source-promptingguide-techniques-consistency]]"
related:
  - "[[chain-of-thought]]"
  - "[[self-consistency]]"
  - "[[thinking-models]]"
  - "[[prompt-chaining]]"
  - "[[automatic-reasoning-and-tool-use]]"
---

# Tree of Thoughts (ToT)

## Overview
**Tree of Thoughts (ToT)** (Yao et al. 2023 https://arxiv.org/abs/2305.10601; Long 2023 https://arxiv.org/abs/2305.08291) generalizes [[chain-of-thought]] from a linear chain to a **searchable tree** where each node is a **"thought" — a coherent language sequence as an intermediate step** — combined with **LM self-evaluation + search algorithms (BFS/DFS/beam)** to enable systematic exploration, lookahead, and backtracking on strategic tasks. The DAIR Guide centers on **Game of 24** (decompose into 3 intermediate equations, keep b=5 best candidates, evaluate each as `sure/maybe/impossible` sampled 3×), showing ToT substantially outperforming I/O prompting, CoT, and CoT-SC (Fig TOT3), and distinguishes Yao's generic search from Long's RL-trained ToT Controller plus Hulbert's single-prompt "three experts" distillation.

## Key Ideas
- **ToT framework:** Maintain a tree of thoughts; at each step generate candidate thoughts, prompt the LM to evaluate promise, then search (BFS/DFS/beam) to retain the most promising branches.
- **Game of 24 recipe (Yao BFS):** Task requires 3 steps of intermediate equations. At each level keep best b=5 candidates; for each candidate the LM is prompted to emit `sure/maybe/impossible` regarding reaching 24 (aim: promote verifiable correct partials, prune impossible via "too big/small" commonsense, keep `maybe`), sampling **3 values per thought** to reduce variance. Illustrated in `TOT2.png`; code at https://github.com/princeton-nlp/tree-of-thought-llm.
- **Yao vs Long:** Yao uses generic DFS/BFS/beam with no per-problem adaptation. Long trains a **ToT Controller via RL** that learns when to backtrack and by how many levels — potentially evolving with new data/self-play (AlphaGo vs brute-force analogy). Code at https://github.com/jieyilong/tree-of-thought-puzzle-solver.
- **Lightweight prompting form (Hulbert 2023):** Distills ToT into a single prompt:
  ```
  Imagine three different experts are answering this question.
  All experts will write down 1 step of their thinking,
  then share it with the group.
  Then all experts will go on to the next step, etc.
  If any expert realises they're wrong at any point then they leave.
  The question is...
  ```
  Sun 2023 PanelGPT (https://github.com/holarissun/PanelGPT) benchmarks this at scale with panel-discussion generalization.
- **Tasks requiring lookahead:** Math puzzles (Game of 24), crosswords, creative planning — anywhere intermediate decisions need evaluation and recovery from dead ends, unlike linear CoT.

## How It Works
```
Root: task description
  ├─ Generate 5 thoughts at depth 1 (e.g., first equation)
  │    └─ Evaluate each: sure/maybe/impossible (×3 samples) → keep top 5
  ├─ Expand each kept node → depth 2 candidates → evaluate → keep 5
  └─ Depth 3 leaves → evaluate → best leaf = final answer
Search controller decides BFS vs DFS vs beam vs RL-guided backtracking
```
1. **Generation:** Prompt LM to produce b candidate next-thought completions from each retained node.
2. **Evaluation:** Prompt LM (or verifier) to score candidates; Guide uses categorical `sure/maybe/impossible` with few-shot lookahead.
3. **Search:** BFS expands layer-wise; DFS dives then backtracks; beam keeps top-k; RL controller learns adaptive policy.
4. **Termination:** Leaves evaluated for task success (e.g., equations evaluate to 24).

## Practical Implications
- **Substantial accuracy on search-heavy tasks:** TOT3 figure shows large lift over CoT/SC where backtracking matters — linear CoT cannot recover from a wrong intermediate step.
- **Exponential cost:** b=5, depth=3, 3 samples each → ~125+ leaf evaluations × prompt length; token cost far exceeds CoT or [[self-consistency]] — requires long-context models and budget-aware early pruning.
- **Calibration prerequisite:** LM self-evaluation must be reasonably calibrated; mis-scored `sure` on bad partials derails search — verifiers or code execution ([[tool-use]]) improve reliability.
- **When to use vs thinking models:** Modern [[thinking-models]] (o1/R1) natively perform internal search; ToT prompting remains valuable for API models without built-in reasoning loops or when you need custom search control.
- **Composable via prompt chaining:** Each generate/evaluate step can be a [[prompt-chaining]] link; evaluation often benefits from external tools.

## Connections
- Extends [[chain-of-thought]] (CoT = single path) to branching search; contrasts with [[self-consistency]] which votes over independent paths without evaluation/search.
- Prefigures [[thinking-models]] — what ToT scaffolds externally with prompts+search, reasoning models learn as internal test-time search via RLVR.
- Implemented via [[prompt-chaining]] patterns and typically benefits from [[tool-use]] verifiers; search strategy overlaps [[automatic-reasoning-and-tool-use]] but ToT emphasizes search over demonstration retrieval.
- Depends on [[decoding-strategies]] diversity and [[llm-settings]] for candidate generation; Related to [[generated-knowledge-prompting]] when thoughts are knowledge pieces.

## Open Questions
- Can RL-trained controllers like Long's generalize across domains or do they overfit the training puzzle distribution?
- What evaluation rubric (categorical vs scalar, lookahead depth) yields best calibration for self-evaluation?
- How to blend ToT search with retrieval/tool verification to ground thoughts without exploding cost?

## Sources
- [[source-promptingguide-techniques-tot]]
- [[source-promptingguide-techniques-cot]]
- [[source-promptingguide-techniques-consistency]]
- Yao et al. 2023 https://arxiv.org/abs/2305.10601; Long 2023 https://arxiv.org/abs/2305.08291; Hulbert 2023 https://github.com/dave1010/tree-of-thought-prompting; Sun 2023 PanelGPT

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
