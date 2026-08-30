---
type: concept
title: "Multimodal Chain-of-Thought (Multimodal CoT)"
summary: Multimodal Chain-of-Thought (Multimodal CoT) (Zhang et al., 2023) extends chain-of-thought from language-only to vision-and-language.
visibility: public
aliases:
  - Multimodal CoT
  - Multimodal Chain-of-Thought Prompting
  - Vision-Language CoT
  - wiki/multimodal-cot
tags:
  - prompt-engineering
  - multimodal
created: 2026-08-24
updated: 2026-08-26
status: draft
sources:
  - "[[source-promptingguide-techniques-multimodalcot]]"
  - "[[source-visual-sketchpad]]"
related:
  - "[[prompt-engineering]]"
  - "[[thinking-models]]"
  - "[[hallucination]]"
  - "[[multimodal-ai]]"
  - "[[react]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Multimodal Chain-of-Thought (Multimodal CoT) (Zhang et al., 2023) extends chain-of-thought from language-only to vision-and-language.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/llm-fundamentals/concepts/thinking-models">Thinking Models</a></li><li><a href="/eval-safety/concepts/hallucination">Hallucination</a></li><li><a href="/multimodal/concepts/multimodal-ai">Multimodal AI</a></li><li><a href="/prompt-engineering/concepts/react">ReAct (Reasoning + Acting)</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-multimodalcot">Prompt Engineering Guide — Multimodal CoT Prompting</a></li><li><a href="/multimodal/sources/source-visual-sketchpad">Visual Sketchpad: Sketching as a Visual Chain of Thought for Multimodal Language Models</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**Multimodal Chain-of-Thought (Multimodal CoT)** (Zhang et al., 2023) extends chain-of-thought from language-only to vision-and-language. It is a two-stage framework: first generate a rationale grounded in both the image and text, then infer the final answer conditioned on that rationale. As summarized in [[source-promptingguide-techniques-multimodalcot]], a 1B-parameter multimodal CoT model outperforms GPT-3.5 on ScienceQA, demonstrating that visual grounding beats scale alone for diagram-heavy reasoning.

## Key Ideas
- **Modality gap:** Text-only CoT cannot describe spatial, diagrammatic, or perceptual evidence needed for science questions.
- **Two-stage faithfulness:** Decoupling rationale generation from answer inference reduces shortcut hallucination — model must first explain visual evidence, then answer from it.
- **Vision + language fusion:** Image features (e.g., ViT) concatenated with text tokens feed the language decoder at both stages.
- **Small-model leverage:** Parameter-efficient multimodal fine-tuning beats a much larger text-only LLM.
- **From text rationales to drawn rationales ([[source-visual-sketchpad]]):** Visual Sketchpad (Hu, Shi et al., NeurIPS 2024) pushes the rationale itself into visual form — the model *draws* intermediate steps (auxiliary geometry lines, matplotlib function plots, networkx graphs, chess boards) and reasons over its own artifacts in a ReAct loop, optionally via specialist vision tools (detection boxes, segmentation masks, depth maps). GPT-4o + Sketchpad averages +12.7% on math tasks and +8.6% on vision tasks with SOTA on all evaluated benchmarks — evidence that the multimodal-CoT principle ("ground each reasoning step") generalizes beyond two-stage prompting to fully agentic, programmatic sketching.

## How It Works
```
Image + Text Question ──► [Stage 1: Rationale Generation] ──► Rationale (visual grounding)
(Image + Text + Rationale) ──► [Stage 2: Answer Inference] ──► Final answer
```
- **Stage 1 prompt:** Multimodal tokens + instruction “Generate rationale explaining the image and question.”
- **Stage 2 prompt:** Original multimodal input + generated rationale + “Based on rationale, answer: …”
- Training optimizes rationale quality and answer accuracy separately; at inference the same LM (or two heads) runs sequentially. Figure in [[source-promptingguide-techniques-multimodalcot]] illustrates the pipeline.

## Practical Implications
- **Use for:** ScienceQA, chart QA, visual commonsense, geometry, any task where the image contains necessary reasoning evidence.
- **Implementation:** Requires a vision encoder (CLIP-ViT, SigLIP) + vision-language connector; can be fine-tuned (paper’s 1B) or prompted with a VLM like GPT-4o/Claude 3.5 Sonnet.
- **Prompt tip:** Separate rationale and answer steps explicitly — “First describe what you see, then answer” — even with zero-shot VLMs mimics the two-stage benefit.
- **Evaluation:** Check rationale faithfulness, not just answer accuracy; ungrounded rationales still hallucinate.

## Connections
- Extends [[thinking-models]] / textual CoT into the visual domain; same stepwise decomposition, new grounding signal.
- Mitigates [[hallucination]] via image evidence, complementary to text-grounding via retrieval and to execution-grounding via [[program-aided-language-models]].
- Contrasts with [[react]]: both split reasoning into steps, but Multimodal CoT splits across *modalities* rather than *tool turns* — [[source-visual-sketchpad]] fuses the two, making each tool turn produce a visual rationale.
- Relates to [[prompt-engineering]] multimodal prompt design (image + text composition) and to [[multimodal-ai]]'s generation-centric fusion line (Chameleon/Transfusion): Sketchpad is the tool-composition counterpart that needs no training.

## Open Questions
- Does explicit two-stage prompting remain superior when VLMs scale to long chain-of-thought natively, or can a single joint prompt match it?
- How to evaluate rationale faithfulness to the image vs linguistic fluency?
- ~~Can Multimodal CoT be combined with tool use (e.g., crop/zoom actions) for iterative visual reasoning?~~ — **Yes**: [[source-visual-sketchpad]] demonstrates exactly this loop (crop, zoom, draw, segment, depth-estimate as reasoning steps). Remaining question: can sketching be *trained into* natively multimodal models rather than prompted?

## Sources
- [[source-promptingguide-techniques-multimodalcot]]
- [[source-visual-sketchpad]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
