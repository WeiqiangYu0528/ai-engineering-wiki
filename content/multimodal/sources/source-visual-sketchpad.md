---
type: source-summary
title: "Visual Sketchpad: Sketching as a Visual Chain of Thought for Multimodal Language Models"
summary: "Hu, Shi, et al. (UW/AI2/UPenn, NeurIPS 2024) give multimodal LMs a visual sketchpad: a ReAct-style loop where the model's intermediate reasoning steps are drawings it generates via code — auxiliary lines in geometry…"
status: draft
visibility: public
author: "Yushi Hu, Weijia Shi, Xingyu Fu, Dan Roth, Mari Ostendorf, Luke Zettlemoyer, Noah A. Smith, Ranjay Krishna"
source-type: paper
url: "https://arxiv.org/abs/2406.09403"
date-published: 2024-06-13
date-ingested: 2026-08-26
tags:
  - multimodal
  - agents
key-concepts:
  - "[[multimodal-cot]]"
  - "[[multimodal-ai]]"
  - "[[chain-of-thought]]"
  - "[[react]]"
aliases:
  - wiki/source-visual-sketchpad
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Hu, Shi, et al. (UW/AI2/UPenn, NeurIPS 2024) give multimodal LMs a visual sketchpad: a ReAct-style loop where the model's intermediate reasoning steps are drawings it generates via code — auxiliary lines in geometry…</p>
<p class="kb-provenance">Yushi Hu, Weijia Shi, Xingyu Fu, Dan Roth, Mari Ostendorf, Luke Zettlemoyer, Noah A. Smith, Ranjay Krishna, 2024-06-13. <a href="https://arxiv.org/abs/2406.09403">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 6 of 19 figures on this page were not found in [https://arxiv.org/abs/2406.09403](https://arxiv.org/abs/2406.09403): `2.4`, `4.2`, `7.7`, `10.3`, `3.5`, `1.0`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

Hu*, Shi*, et al. (UW/AI2/UPenn, NeurIPS 2024) give multimodal LMs a **visual sketchpad**: a ReAct-style loop where the model's intermediate reasoning steps are *drawings* it generates via code — auxiliary lines in geometry, matplotlib function plots, networkx graphs, chess boards — plus specialist vision tools (Grounding-DINO detection, SAM/Semantic-SAM segmentation masks, DepthAnything depth maps, sliding-window search, zoom/crop/overlay). The LM plans and re-plans by inspecting its own visual artifacts. No training required. GPT-4o + Sketchpad averages **+12.7% on math tasks** and **+8.6% on vision tasks**, setting SOTA on all evaluated benchmarks (V*Bench 80.3%, BLINK spatial 83.9%, visual correspondence 80.8%).

## Key Takeaways

1. **Text-only CoT leaves vision on the table**: humans sketch to offload working memory; prior multimodal CoT/tool-use paradigms reason only in text between perception steps.
2. **Sketching via code generation**: matplotlib/networkx/chess plotting for math; specialist vision models wrapped as Python functions for perception-augmented sketches — closer to human diagramming than text-to-image generation.
3. **Adaptive plans beat predefined pipelines**: unlike Visprog/ViperGPT (fixed programs) or SoM (static prompts), the LM revises its plan from observed artifacts → robustness to tool errors; Sketchpad is the only framework improving consistently across all tasks vs those baselines.
4. **Stronger models benefit more**: GPT-4o exploits depth maps better than GPT-4 Turbo (+12.1 vs +2.4 on depth); tool usage is task-adaptive (search-like detection+zoom+sliding-window on V*Bench).
5. **Human-aligned reasoning**: GPT-4o draws the same auxiliary line as human solvers 80% of the time; raters judge its plans valid 92.8%.

## Detailed Notes

- Loop mechanics: Thought (plan p_t) → Action (execute generated Python to draw) → Observation (rendered sketch enters context via `display`); terminates when confident; built on AutoGen.
- Math tasks: Geometry3K geometry (+4.2 GPT-4o), IsoBench parity/convexity (+7.7/+10.3), graph connectivity/max-flow/isomorphism (maxflow 25→66.3, +41.3), chess winner-ID (+3.5).
- Vision tasks: V*Bench (+14.3), MMVP (+1.0), BLINK depth/spatial/jigsaw/visual-correspondence/semantic-correspondence (+9.0 avg).
- Oracle transfer: GPT-4o-generated sketches fed to open-source LLaVA-NeXT improve its math scores too — artifacts, not just prompting, carry value.
- Limitations: extra compute vs token output; future = training natively-multimodal models (Chameleon-style) to sketch.

## Notable Quotes

> "Humans draw to facilitate reasoning... such actions are missing in current multimodal language models."

> "Current chain-of-thought and tool-use paradigms only use text as intermediate reasoning steps."

## Concepts Introduced or Referenced

- [[multimodal-cot]] — generalizes two-stage rationale+answer into interleaved programmatic-visual reasoning chains.
- [[multimodal-ai]] — exemplifies the tool-composition side of multimodality (vs the Week-9 pretraining papers); complements [[source-chameleon]]'s native-generation view.
- [[chain-of-thought]] / [[react]] — direct descendants: same loop scaffolding, multimodal observations/actions added.
- [[tool-use]] — specialist vision models become callable sketching tools.

## Critical Assessment

Strengths: rigorous breadth (11 task types, strong baselines incl. Claude 3/Gemini-Pro), clean ablations isolating why adaptive visual loops win. Weaknesses: API-model-dependent evaluation; compute cost unaddressed at deployment scale; sketches limited to 2D plotting primitives. No contradictions with existing pages — extends [[multimodal-ai]] §Connections beyond generation-centric fusion into agentic visual tool-use.

---

**Source:** Visual Sketchpad: Sketching as a Visual Chain of Thought for Multimodal Language Models by Yushi Hu, Weijia Shi, Xingyu Fu, Dan Roth, Mari Ostendorf, Luke Zettlemoyer, Noah A. Smith, Ranjay Krishna — <https://arxiv.org/abs/2406.09403>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
