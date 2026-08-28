---
type: concept
title: "AI Alignment"
summary: AI Alignment is the discipline and practice of steering artificial intelligence models to act in accordance with human intentions, values, and safety goals.
visibility: public
aliases:
  - "Alignment"
  - "LLM Alignment"
  - "3H Criteria"
  - "Alignment Tax"
tags:
  - fine-tuning
  - eval-safety
created: 2026-08-23
updated: 2026-08-26
status: draft
sources:
  - "[[source-training-language-models-to-follow-instructions-with-human-feedback]]"
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
  - "System Prompts — Cursor (Agent Prompt v1.2, 2.0 & Chat Prompt) — leaked via x1xhlol/system-prompts-and-models-of-ai-tools"
  - "System Prompts — Windsurf Cascade Wave 11 (Prompt + Tools) — leaked via x1xhlol/system-prompts-and-models-of-ai-tools"
  - "System Prompts — Trae Builder & Chat (ByteDance) — leaked via x1xhlol/system-prompts-and-models-of-ai-tools"
  - "System Prompts — VSCode Agent (GitHub Copilot) — leaked via x1xhlol/system-prompts-and-models-of-ai-tools"
  - "[[source-cs336-lecture15-sft-rlhf]]"
  - "[[source-cs336-lecture16-rlvr]]"
  - "[[source-cs336-lecture17-alignment-multimodality]]"
related:
  - "[[rlhf]]"
  - "[[supervised-fine-tuning]]"
  - "[[direct-preference-optimization]]"
  - "[[reasoning-llms]]"
  - "[[prompt-injection]]"
  - "[[hallucination]]"
  - "[[system-prompt]]"
  - "[[context-engineering]]"
  - "[[adversarial-prompting]]"
  - "[[multimodal-ai]]"
  - "[[ai-ethics]]"
---

# AI Alignment

## Overview
**AI Alignment** is the discipline and practice of steering artificial intelligence models to act in accordance with human intentions, values, and safety goals. In the context of LLMs, alignment bridges the gap between the raw pretraining objective (predicting the statistical next token on web text) and the user's objective (producing safe, truthful, and helpful completions).

## Key Ideas
- **The Misalignment Problem:** Base models trained on internet text learn to mimic toxic commentary, propagate conspiracies, make up facts, and ignore explicit instructions because next-token prediction treats all internet text equally.
- **The 3H Framework (Askell et al., 2021 / OpenAI):**
  - **Helpful:** The model actively assists the user in solving their task, follows explicit formatting constraints, and infers user intent.
  - **Honest (Truthful):** The model avoids fabricating facts, expresses appropriate uncertainty, and does not mislead.
  - **Harmless:** The model refuses dangerous, illegal, or discriminatory requests without being overly sensitive or evasive.
- **Alignment Beats Scale:** As proved by [[openai]] in [[source-training-language-models-to-follow-instructions-with-human-feedback]] (InstructGPT), aligning a 1.3B parameter model with human feedback made it outperform a 100x larger 175B base model on human preference benchmarks.
- **The "Alignment Tax":** The observed phenomenon where fine-tuning a model to be safe and agreeable can cause performance regressions on standard academic NLP benchmarks (e.g., SQuAD, translation, mathematical reasoning). Mitigated by techniques like PPO-ptx (pretraining loss mixing) and DPO.

## How It Works
```
Pretrained Base Model (Raw Simulator)
             │
             ▼ [Phase 1: SFT]
Instruction-Following Policy (Learns Dialogue & Formatting)
             │
             ▼ [Phase 2 & 3: RLHF / DPO]
Preference-Aligned Assistant (Optimized for Helpful, Honest, Harmless Behavior)
```

## Practical Implications
- **Production Usability:** Raw base models cannot be safely deployed directly to consumers. Alignment is the critical transformation that enables consumer products like ChatGPT, Claude, and Gemini.
- **Jailbreak Defenses:** Alignment defines the behavioral boundaries that protect systems against adversarial [[prompt-injection]].
- **System prompts as alignment artifact:** Leaked IDE prompts (Cursor/Windsurf/Trae/VSCode, System Prompts — Cursor (Agent Prompt v1.2, 2.0 & Chat Prompt) — leaked via x1xhlol/system-prompts-and-models-of-ai-tools–System Prompts — VSCode Agent (GitHub Copilot) — leaked via x1xhlol/system-prompts-and-models-of-ai-tools) show how alignment is operationalized as [[system-prompt]] identity constraints: VSCode's `GitHub Copilot / Microsoft content policies / Sorry, I can't assist` (harmless), Trae's `NEVER lie` + confidentiality refusal (honest), Windsurf's `say GPT 4.1 if asked` (honesty tension), and Cursor's `keep going until resolved` (helpfulness persistence). Prompt leaking itself is an alignment failure — extraction bypasses intended harmless/honest boundaries and exposes IP.
- **CS336 post-training pipeline (Lectures 15-16):** [[source-cs336-lecture15-sft-rlhf]] dissects the **SFT→RLHF** ladder — “SFT extracts, not injects” (training on unknown facts increases [[hallucination]] per Gekhman/Schulman), style/length biases (Dubois 2023), and two-phase midtraining to scale instruct data without forgetting. [[source-cs336-lecture16-rlvr]] upgrades RL to **RLVR** (verifiable rewards for math/code) to escape Goodhart: DeepSeek-R1 (GRPO + accuracy/format), Kimi K1.5 (reference-regularized squared-loss PG + late length compression `λ∈[-0.5,0.5]`), Qwen 3 (3,995-example GRPO) — each demonstrating distillation > RL for small bases.
- **Multimodal alignment frontier (Lecture 17):** [[source-cs336-lecture17-alignment-multimodality]] reframes the 3H criteria for **omni models** — image/video tokens have lower information density than text, so naive mixing destabilizes training (text low-entropy vs image high-entropy → norm growth/logit drift, fixed by QK-Norm + z-loss). Alignment now requires *mixed-modal* safety data and loss balancing (e.g., Qwen3-VL sqrt-normalized per-token loss to prevent long video domination, Chameleon's 80/20 unsupervised→high-quality mixture). Text-only harmlessness does not cover image jailbreaks; frontier SFT must include **mixed-modal red-team**.

## Connections
- Implemented technically via [[supervised-fine-tuning]] and [[rlhf]], with [[direct-preference-optimization]] as simpler pairwise alternative and [[reasoning-llms]]/RLVR as verifiable generalization.
- Directly reduces factual [[hallucination]] and toxic outputs.
- Represents the defense boundary tested by [[prompt-injection]] and [[adversarial-prompting]].
- Concretized in [[system-prompt]] governance and [[context-engineering]] (server-side isolation, Tool Search) as architectural complements to model-level alignment.
- Extended to [[multimodal-ai]]: CLIP/SigLIP understanding and Chameleon omni generation create new cross-modal attack surfaces; alignment extends from text 3H to **any→any** harmlessness.
- Ethics layer in [[ai-ethics]]: Pareto trade-offs among helpful/honest/harmless now operate across modalities — no single operating point satisfies image faithfulness vs safety vs latency.

## Open Questions
- *Who are we aligning to?* How to reconcile conflicting cultural and ethical norms across global user bases without centralized bias.
- *Scalable Oversight:* How will human alignment techniques scale to evaluate superhuman reasoning in advanced [[thinking-models]]?
- *Cross-modal scalable oversight:* How to evaluate/align omni models when image/video outputs require human visual judgment at scale? Can verifiable rewards (unit tests for code, exact-match for math) be ported to image faithfulness (FID/CLIP) without human bottleneck?
- *Guest frontiers (TBD):* Lectures 18-19 (Daniel Selsam, Dan Fu — CS336 Lecture 18 — Guest Lecture: Daniel Selsam (Mon June 1) — TBD, CS336 Lecture 19 — Guest Lecture: Dan Fu (Wed June 3) — TBD) are expected to supply formal-verification and systems perspectives on scalable oversight — update this section when materials publish.

## Sources
- [[source-training-language-models-to-follow-instructions-with-human-feedback]]
- [[source-deep-dive-into-llms-like-chatgpt]]
- System Prompts — Cursor (Agent Prompt v1.2, 2.0 & Chat Prompt) — leaked via x1xhlol/system-prompts-and-models-of-ai-tools
- System Prompts — Windsurf Cascade Wave 11 (Prompt + Tools) — leaked via x1xhlol/system-prompts-and-models-of-ai-tools
- System Prompts — Trae Builder & Chat (ByteDance) — leaked via x1xhlol/system-prompts-and-models-of-ai-tools
- System Prompts — VSCode Agent (GitHub Copilot) — leaked via x1xhlol/system-prompts-and-models-of-ai-tools
- [[source-cs336-lecture15-sft-rlhf]] — SFT/RLHF/DPO ladder; SFT extracts vs injects; overoptimization curves.
- [[source-cs336-lecture16-rlvr]] — GRPO/RLVR case studies (R1, Kimi, Qwen 3); length biases; distillation.
- [[source-cs336-lecture17-alignment-multimodality]] — multimodal frontier; stability (QK-Norm/z-loss), loss balancing.
- CS336 Lecture 18 — Guest Lecture: Daniel Selsam (Mon June 1) — TBD — placeholder (TBD, expected reasoning/formal-verification).
- CS336 Lecture 19 — Guest Lecture: Dan Fu (Wed June 3) — TBD — placeholder (TBD, expected systems/data).

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
