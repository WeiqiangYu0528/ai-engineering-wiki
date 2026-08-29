---
type: concept
title: "Image Generation with LLMs"
summary: Image Generation with autoregressive LLM-image models — exemplified by OpenAI 4o Image Generation (gpt-image-1 / image_gen.text2im, embedded in ChatGPT/Sora/API via gpt-4o/mini, gpt-4.1/mini/nano, o3) — generates images…
visibility: public
aliases:
  - 4o Image Generation
  - Autoregressive Image Generation
  - GPT Image Generation
  - wiki/image-generation
tags:
  - multimodal
  - prompt-engineering
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-guides-4o-image-generation]]"
  - "[[source-promptingguide-models-gpt-4]]"
related:
  - "[[multimodal-cot]]"
  - "[[prompt-engineering]]"
  - "[[prompt-optimization]]"
  - "[[reasoning-llms]]"
  - "[[applications-overview]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Image Generation with autoregressive LLM-image models — exemplified by OpenAI 4o Image Generation (gpt-image-1 / image_gen.text2im, embedded in ChatGPT/Sora/API via gpt-4o/mini, gpt-4.1/mini/nano, o3) — generates images…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/multimodal-cot">Multimodal Chain-of-Thought (Multimodal CoT)</a></li><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/prompt-engineering/concepts/prompt-optimization">Prompt Optimization</a></li><li><a href="/agents/concepts/reasoning-llms">Reasoning LLMs</a></li><li><a href="/prompt-engineering/concepts/applications-overview">LLM Applications Overview</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/multimodal/sources/source-promptingguide-guides-4o-image-generation">OpenAI 4o Image Generation Guide — Prompt Engineering Guide (DAIR.AI) Guides</a></li><li><a href="/llm-fundamentals/sources/source-promptingguide-models-gpt-4">GPT-4 — Prompt Engineering Guide (DAIR.AI) Models</a></li></ul></nav>
</aside>

## Overview
**Image Generation** with autoregressive LLM-image models — exemplified by **OpenAI 4o Image Generation** (`gpt-image-1` / `image_gen.text2im`, embedded in ChatGPT/Sora/API via gpt-4o/mini, gpt-4.1/mini/nano, o3) — generates images token-by-token like text, enabling photorealistic synthesis, reference-image conditioning, precise in-image text, and multi-turn editing. The DAIR guide pairs architecture (autoregressive → strong text rendering, style transfer e.g., Ghiblification, transparent PNG, 1:1 1024² / 3:2 1536×1024 / 2:3 1024×1536, PNG/JPEG/WEBP/GIF inputs) with practitioner prompt recipes (detailed lighting/composition/style/medium/environment/color/mood + camera/lens, aspect-ratio explicit, reasoning-model o3 as prompt planner, 3-variation single prompt, prompt echo debugging) and limits (prompt rewriting, yellow tint, darkness bias, cropping, hallucination, non-Latin text, many-subject/graph difficulty, dynamic quotas, free-tier queuing).

## Key Ideas
- **Model shape:** Same autoregressive loop as LLM: text + reference images → token stream → pixels; inpainting (within-chat) vs prompt-edit ("what would it look like during winter?") vs style transfer (Sam&Jony → Ghibli) vs combination (meerkat+T-shirt) vs text-in-image (DAIR Academy title).
- **Access routes:** ChatGPT "Generate an image …" / toolbox "Create an image" / Sora / API `platform.openai.com/docs/guides/images-vision?api-mode=responses`.
- **Prompt controls:** Vague → model invents details (good for exploration); detailed `lighting/composition/style/medium/environment/color/mood + camera/lens` → precise control. Example Art Deco Starship golden-hour cinematic prompt yields photorealistic rocket (`art_deco_starship.png`). For iterative creative chains, use reasoning model (o3/o4-mini) to keep style/fonts/colors persistent; for independent tasks start fresh chat to avoid memory bleed.
- **Multi-image pattern (reasoning models):**
  ```
  Create three variations with a different subject, but the same rules. After an image is generated, immediately start creating the next one…
  Rules: - Use aspect ratio 3:2 - Output the prompt you sent exactly between generations
  ```
  (link `68496cf8` demo; not always reliable).
- **Diagnostics:** "Ask the model to output the prompt that was used in generating the image" then revise in new chat — catches silent ChatGPT rewriting between chat and image model.
- **Personalization hack:** Add "always use 4o Image Generation / image_gen.text2im, not DALL-E 3" to ChatGPT traits to force path.

## How It Works
```
User prompt (detailed + aspect ratio + style + lighting + subject)  [+ reference images]
        │
        ▼
Chat model (may rewrite) → 4o Image Generation (autoregressive image tokens) → raster image (1024–1536)
        │
        ├── iterative in same chat → retains prior images/style
        └── fresh chat → independent generation; reasoning planner can chain 3 variations
        │
        ▼
[Inspect → echo prompt → refine → regenerate]
```

## Practical Implications
- **Briefing discipline:** Quantify everything (ratio, lens, light, mood) — assume vague = random fill; copy the generated prompt back to correct drift.
- **Workflow split:** One-off fast edits → 4o directly; multi-step brand-consistent explorations → o3 planner; independent concepts → fresh chat per task.
- **Quality gates:** Check for tint/darkness/crop/text artifacts; refusals under usage policies delete partial image — keep backup prompts.
- **Evaluation blind spot:** Guide offers visual gallery but no FID/text-accuracy scores — prod needs human A/B or VLM judge.

## Connections
- Extends [[source-promptingguide-models-gpt-4]] vision (image→text) with generative inverse (text→image) in same family.
- Realizes [[multimodal-cot]] visual planning and [[reasoning-llms]] planner role.
- Prompt tactics are specialization of [[prompt-engineering]] / [[prompt-optimization]] (specificity, structure, decomposition) to pixel domain.

## Open Questions
- Can prompt rewriting be made deterministic (strict echo mode) to enable eval without drift?
- What text-render accuracy metric correlates with human preference for in-image typography, especially non-Latin?

## Sources
- [[source-promptingguide-guides-4o-image-generation]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
