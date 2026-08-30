---
type: source-summary
title: "OpenAI 4o Image Generation Guide — Prompt Engineering Guide (DAIR.AI) Guides"
summary: Hands-on user guide to 4o Image Generation (OpenAI's autoregressive image model embedded in ChatGPT, sharing GPT-4o LLM architecture — generates images token-autoregressively like text, enabling text-in-image, granular…
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/guides/4o-image-generation.en.mdx"
date-published: 2025-04-15
date-ingested: 2026-08-24
tags:
  - multimodal
  - prompt-engineering
key-concepts:
  - "[[image-generation]]"
  - "[[prompt-engineering]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-guides-4o-image-generation
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Hands-on user guide to 4o Image Generation (OpenAI's autoregressive image model embedded in ChatGPT, sharing GPT-4o LLM architecture — generates images token-autoregressively like text, enabling text-in-image, granular…</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2025-04-15. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/guides/4o-image-generation.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
Hands-on user guide to **4o Image Generation** (OpenAI's autoregressive image model embedded in ChatGPT, sharing GPT-4o LLM architecture — generates images token-autoregressively like text, enabling text-in-image, granular editing, and image-conditioned generation). Covers **access** (ChatGPT web/mobile "Generate an image …"/"Create an image" tool, Sora, API `gpt-image-1` with `platform.openai.com/docs/guides/images-vision?api-mode=responses`; available via gpt-4o/mini, gpt-4.1/4.1-mini/nano, o3), **capabilities** (aspect ratios 1:1 1024² / 3:2 1536×1024 / 2:3 1024×1536; input PNG/JPEG/WEBP/GIF non-animated; inpainting within chat, prompt-based edits like "what would it look like during winter?", style transfer e.g., Ghiblification, transparent PNG, text-in-image, multi-style teapots, image combination via reference), **prompting tips** (detailed prompts beat vague; define lighting/composition/style/medium/environment/color/mood; specify camera/lens; set ratio explicitly; use reasoning models o3/o4-mini for multi-step iterative edits; single prompt can yield 3 variations but must be explicit), **operational gotchas** (model may rewrite your prompt; chat memory causes style persistence → start fresh chat for independent tasks; ask model to echo back its prompt to diagnose), and **limitations** (yellow tint, dark-image bias, refusals per usage policies, no upscaling, cropping errors, hallucination, many-subjects/graph-data difficulty, non-Latin text weakness, inconsistent multi-component adherence, naming confusion `imagegen/gpt-image-1/4o Image Generation`, free-tier queuing/dynamic quotas).

## Key Takeaways
1. **Architecture = LLM-style autoregression:** Images generated token-by-token like text → strong text rendering, instruction following, reference-image conditioning, and multi-turn consistency (but also chat-memory bleed).
2. **Prompt controls matter asymmetrically:** Vague → model fills details (good for exploration); detailed lighting/composition/camera/lens/mood → precise control. Example Art Deco Starship prompt (golden hour, mirror-polished, cinematic warm) yields photorealistic rocket test image.
3. **Iterative strategy:** For one-off/fast edits use 4o directly; for multi-step creative exploration use reasoning model (o3) as prompt-planner keeping style/fonts/colors "in mind." For consistency, stay in same chat; for independence, new chat.
4. **Multi-image trick:** Reasoning models can emit 3 variations in one prompt if explicitly instructed (`Create three variations… Output the prompt you sent … exactly… After an image is generated, immediately start creating the next one…`) — but not always reliable; link `68496cf8` demo.
5. **Debugging:** `Ask the model to output the prompt that was used in generating the image` then start new chat with revised prompt — catches silent rewriting.

## Detailed Notes
- **Header visuals:** Title frosted-glass image `4o_image_generation.png`; tool-select screenshots, API docs screenshot.
- **Access section screenshots:** `text_prompt_3.JPG`, `tool_select.JPG`, `image_gen_API.JPG`.
- **Capability gallery:** Inpainting before/after `inpainting_combined.png`, text-edit `text_edit_combined.png`, style transfer Sam & Jony Ghiblified `sam_and_jony*.png`, teapot photoreal → Van Gogh `teapot_*.png`, meerkat+T-shirt → combined `combine_images*.png`, Art Deco Starship `art_deco_starship.png`, title text `text_in_images.png` (DAIR.AI Academy).
- **Lighting/composition checklist:** Subject, Medium, Environment, Color, Mood (+camera/lens).
- **Best-practice callouts:** Use o3 to generate 3 optimized 4o prompts from your rough description then pick; Personalization tip to force `image_gen.text2im` over DALL-E 3: add to "What traits should ChatGPT have" settings.
- **Limitations (12 bullets):** Prompt rewriting, dynamic quotas, free-tier queuing, yellow tint, darkness, usage-policy refusals (deletes partial image), no upscale, crop errors, hallucinate, many-concept difficulty, graph precision failure, non-Latin text, typo-edit inefficacy, aspect-ratio drift.
- **API note:** `gpt-image-1` is the API identifier.

## Notable Quotes
> "It can create photorealistic outputs, take images as inputs and transform them, and follow detailed instructions, including generating text into images. … The model essentially generates images in the same way as the LLM generates text."
> "Detailed prompts give you more control. If your prompt is not descriptive, ChatGPT often fills in additional details."
> "If the first few iterations on an image are not even close to what you were going for, ask the model to output the prompt that was used in generating the image, and try to see if you spot the misplaced emphasis."
> "Enforcing strict prompt adherence is difficult — Prompts with multiple components sometimes get changed somewhere between the chat model and the 4o Image Generation model."

## Concepts Introduced or Referenced
- [[image-generation]] — Core: autoregressive text-like image synthesis with reference conditioning.
- [[prompt-engineering]] / [[prompt-optimization]] — Detailed attribute prompting, iterative refinement, multi-variation chaining.
- [[multimodal-cot]] — Visual reasoning overlap (reference understanding).
- [[reasoning-llms]] — o3/o4-mini as prompt planners for multi-step image tasks.

## Critical Assessment
- **Strengths:** Most exhaustive practitioner image guide in corpus — pairs model theory (autoregressive) with 10+ visual demos and actionable prompt/diagnosis recipes; clearly maps Chat vs API vs Sora access.
- **Weaknesses:** Guide is UI-heavy and version-locked (April 2025); quota/tint/refusal reports anecdotal not measured; prompt-rewriting behavior not quantified.
- **Contradictions:** None; complements [[source-promptingguide-models-gpt-4]] vision section (chart reading) with generative counterpart; aligns with [[context-engineering]] fresh-chat advice.
- **Gaps:** Needs link to eval (FID, text-render accuracy) and to [[prompt-engineering]] negative prompting for exclusions.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/guides/4o-image-generation.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/guides/4o-image-generation.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/guides/4o-image-generation.en.mdx)

---

**Source:** OpenAI 4o Image Generation Guide — Prompt Engineering Guide (DAIR.AI) Guides by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/guides/4o-image-generation.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
