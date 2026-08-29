---
type: concept
title: "Supervised Fine-Tuning"
summary: Supervised Fine-Tuning (SFT), also known as Instruction Tuning (see Instruction Tuning for the large-scale FLAN perspective), is the first phase of post-training alignment.
visibility: public
aliases:
  - SFT
  - Instruction Tuning
  - Alignment Phase 1
  - wiki/supervised-fine-tuning
tags:
  - fine-tuning
  - llm-fundamentals
created: 2026-08-23
updated: 2026-08-26
status: draft
sources:
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
  - "[[source-scaling-instruction-finetuned]]"
  - "[[source-how-far-can-camels-go]]"
  - "[[source-alpacafarm]]"
  - "[[source-training-language-models-to-follow-instructions-with-human-feedback]]"
  - "[[source-cs336-lecture15-sft-rlhf]]"
  - "[[source-cs336-lecture16-rlvr]]"
related:
  - "[[pretraining]]"
  - "[[instruction-tuning]]"
  - "[[rlhf]]"
  - "[[direct-preference-optimization]]"
  - "[[tool-use]]"
  - "[[chain-of-thought]]"
  - "[[lora]]"
  - "[[parameter-efficient-fine-tuning]]"
  - "[[alignment]]"
  - "[[evaluation]]"
  - "[[data-curation]]"
  - "[[synthetic-data]]"
  - "[[reasoning-llms]]"
  - "[[post-training-lineage]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Supervised Fine-Tuning (SFT), also known as Instruction Tuning (see Instruction Tuning for the large-scale FLAN perspective), is the first phase of post-training alignment.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/fine-tuning/concepts/alignment">AI Alignment</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/fine-tuning/concepts/instruction-tuning">Instruction Tuning</a></li><li><a href="/fine-tuning/concepts/rlhf">Reinforcement Learning from Human Feedback</a></li><li><a href="/fine-tuning/concepts/direct-preference-optimization">Direct Preference Optimization</a></li><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></li><li><a href="/fine-tuning/concepts/lora">Low-Rank Adaptation (LoRA)</a></li><li><a href="/fine-tuning/concepts/parameter-efficient-fine-tuning">Parameter-Efficient Fine-Tuning (PEFT)</a></li><li><a href="/fine-tuning/concepts/alignment">AI Alignment</a></li><li><a href="/eval-safety/concepts/evaluation">Evaluation</a></li><li><a href="/rag/concepts/data-curation">Data Curation for LLMs</a></li><li><a href="/llm-fundamentals/concepts/synthetic-data">Synthetic Data for Language Models</a></li><li><a href="/agents/concepts/reasoning-llms">Reasoning LLMs</a></li><li><a href="/fine-tuning/concepts/post-training-lineage">Post-Training Lineage: What Actually Replaced What</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/llm-fundamentals/sources/source-deep-dive-into-llms-like-chatgpt">Deep Dive into LLMs like ChatGPT</a></li><li><a href="/fine-tuning/sources/source-scaling-instruction-finetuned">Scaling Instruction-Finetuned Language Models</a></li><li><a href="/fine-tuning/sources/source-how-far-can-camels-go">How Far Can Camels Go? Exploring the State of Instruction Tuning on Open Resources</a></li><li><a href="/fine-tuning/sources/source-alpacafarm">AlpacaFarm: A Simulation Framework for Methods that Learn from Human Feedback</a></li><li><a href="/fine-tuning/sources/source-training-language-models-to-follow-instructions-with-human-feedback">Training language models to follow instructions with human feedback</a></li><li><a href="/fine-tuning/sources/source-cs336-lecture15-sft-rlhf">CS336 Lecture 15 — After Pretraining: Mid/Post-training, SFT and RLHF (Tatsu Hashimoto)</a></li><li><a href="/fine-tuning/sources/source-cs336-lecture16-rlvr">CS336 Lecture 16 — Post-training 2: Reinforcement Learning from Verifiable Rewards (Tatsu Hashimoto)</a></li></ul></nav>
</aside>

## Overview
**Supervised Fine-Tuning (SFT)**, also known as **Instruction Tuning** (see [[instruction-tuning]] for the large-scale FLAN perspective), is the first phase of post-training alignment. It transforms a raw base model (which merely completes documents via [[pretraining]]'s next-token objective) into a structured, helpful, and dialogue-capable assistant by finetuning on instruction-response pairs with cross-entropy loss masked on the assistant tokens only. Modern SFT spans the **LIMA quality regime** (tens of thousands of curated demos) to the **FLAN scale regime** (1,836 tasks, 1.4B tokens at 0.2% pretrain FLOPs per [[source-scaling-instruction-finetuned]]) and underpins usability gains validated in [[source-alpacafarm]] (SFT10k 36.7% win vs Davinci003, foundational for all LPF methods) and [[source-how-far-can-camels-go]] (Tülu full-finetune to 65B). CS336 Lecture 15 [[source-cs336-lecture15-sft-rlhf]] reframes SFT as **extraction, not injection** — eliciting pre-trained behaviors rather than teaching new facts — and documents the 2022–2025 data progression FLAN → Self-Instruct/Alpaca → ShareGPT/Vicuna → OpenAssistant/WizardLM → Tulu 3/Nemotron toward long, detailed, tool-using traces.

## Key Ideas
- **From Simulator to Assistant:** Base models simulate arbitrary internet text. SFT constrains behavior to polite, instruction-following persona via delimiter tokens (`<|im_start|>`, `<|user|>/<|assistant|>/</s>`, Packing with EOS in FLAN, chatbot schema in Tülu) and behavior conditioning (Markdown, JSON schemas for [[tool-use]], refusal boundaries).
- **Dialogue Format & Special Tokens:** Conversations formatted with role separators; FLAN packs multiple examples per sequence separated by EOS with cross-example attention masking (T5X), while Tülu's chatbot schema encodes multi-turn up to 3.2 rounds in one causal sequence (Figure 1, ShareGPT).
- **Loss Masking:** Cross-entropy computed **only on assistant response tokens** (`L = -∑ log p(tj|t<j) * 1[tj∈Y]`), masking user/system tokens so model learns *how to respond* not *how to ask*. Consistent across LIMA, FLAN, Tülu, AlpacaFarm.
- **Data Quality Over Quantity — but Diversity Matters:** LIMA hypothesis (less is more) holds for quality, yet [[source-scaling-instruction-finetuned]] shows scaling tasks 9→282→1,836 improves normalized avg +15.5% (8B) / +9.4% (540B); majority gain by 282 tasks suggests diversity teaches expression of pretrained knowledge rather than new knowledge (780B pretrain vs 1.4B finetune). Tülu confirms no single dataset dominates: SuperNI lifts MMLU 42.3→49.7 but hurts GSM, CoT lifts GSM 14.5→40.0, ShareGPT lifts open-ended 70.5% win.
- **CoT Preservation:** Non-CoT-only SFT degrades [[chain-of-thought]] reasoning; joint CoT+non-CoT (FLAN adds 9 CoT datasets) preserves both and unlocks zero-shot CoT ("let's think step-by-step" on BBH 0 vs large gain for Flan-PaLM). Implication: always include CoT data even if not targeting reasoning (Section 4.2 of FLAN).
- **Base Model & Mixture Interactions:** SFT gains largest for small/under-trained bases (7B +13.3 MMLU for Tülu) and shrink for strong bases (65B vanilla ≈ Tülu on MMLU/BBH due to forgetting) — choosing pretrain length (LLaMA-2 2T vs LLaMA 1T) dominates downstream. Human+GPT mixture best average (Tülu 45.2) but not per-task best, motivating MoE/modular future.
- **Imitation Ceiling and Beyond:** SFT limited to imitating demonstrations; AlpacaFarm shows surrogate-reward methods (PPO +10% win 44→55% over SFT) and best-of-n sampling can exceed imitation, while direct pairwise methods (FeedME, DPO at 2023 hyperparams) barely improve — foreshadowing RL phase necessity.
- **What SFT Actually Teaches — CS336 Taxonomy (L15):** Three visible axes across FLAN (benchmark tasks) → Alpaca (short) → OpenAssistant (long, referenced) → Nemotron OpenCode-v1 (agentic JSON): **chattiness** (valid but non-conversational → polite dialogue), **detail** (terse → citation-heavy; OASST monopsony example with Bivens & Mishel JEP 2013 teaches *citation style*, not the fact), and **tool-use** (plain text → `{"role":"assistant","tool_calls":[...]}` traces). Invisible axes — scale, safety, style — dominate preference evals: length/bullet variance alone drives large win-rate swings (Wang 2023, Dubois 2023 length effect) while benchmarks stay flat [[source-cs336-lecture15-sft-rlhf]].
- **Knowledge Extraction vs Hallucination:** Folklore formalized by Schulman 2023 & Gekhman 2024: fine-tuning on tail facts the base model doesn't know *increases* hallucination — model learns to emit citation-shaped text without grounding. Takeaway in [[source-cs336-lecture15-sft-rlhf]]: curate SFT for known knowledge to teach *extraction*; use RL-style correctness feedback for tail injection. Even factually correct data can hurt if from unknown distribution.
- **Safety Is Few-Shot:** Llama 2 needed ~few thousand safety examples; Anthropic HH shows +500 Alpaca-style safety demos yields significant safety gains via HHH scenario mining — small correct-behavior slices disproportionately shape persona [[source-cs336-lecture15-sft-rlhf]].
- **Two-Phase / Midtraining Scaling:** To avoid catastrophic forgetting when scaling instruct data, industry standard (miniCPM/jetMoE publicized) is **mix instruction data into pretraining → short true SFT** — turning SFT into continued pretraining, letting scale without forgetting [[source-cs336-lecture15-sft-rlhf]].
- **SFT Before RLVR — The 1K Seed:** Lecture 16 [[source-cs336-lecture16-rlvr]] shows even 1K math/science long-CoT traces (Gemini/R1) suffice to bootstrap reasoning before GRPO; R1-Zero without SFT works but mixes languages and is less interpretable — cold-start SFT (600K reasoning + 200K non-reasoning in full R1) remains best practice before reasoning RL.

## How It Works
1. **Dataset Collection:** Curate prompt-response pairs: human expert (Dolly 15k, OAssistant 34k, LIMA few k), synthetic generation (Alpaca 52k Davinci-003, GPT4-Alpaca, ShareGPT 168k, Self-Instruct 82k), or large-scale task mixtures (Muffin/T0-SF/NIV2/CoT →1,836 tasks, 146 categories with 10 templates per CoT). Remove contamination (FLAN removes 44 MMLU-related from NIV2). Sample to balance (Flan V2/CoT 100K each for Tülu). Per L15 [[source-cs336-lecture15-sft-rlhf]], newer Tulu 3/Nemotron add agentic/tool traces and rigorously filtered reasoning data (R1 cold-start: 1K long-CoTs).
2. **Formatting & Packing:** Unify to chat schema: instruction + optional exemplars (±CoT) → tokenize; pack multiple examples per sequence with EOS separator and attention mask across boundaries (Raffel packing). Multiturn: history `<|user|>x1 <|assistant|>y1 ...`. Nemotron agentic variant adds `tool_calls` JSON per turn.
3. **Fine-Tuning Loop:** Update weights with lower LR ($10^{-5}$–$10^{-6}$ for full FT; α/r scaling for [[lora]] adapters, Ta= r first), Adafactor constant schedule in FLAN, AdamW in others; freeze base for PEFT (LoRA 0.01% params, 10kx checkpoint reduction) vs full FT (FLAN/Tülu 65B). Training cost: SFT 10k LLaMA 7B minimal, Flan-PaLM 540B 512 TPU×37h =0.2% pretrain, Tülu 65B full-finetune largest public at time. Single checkpoint selected via periodic held-out eval (2k–10k steps) on MMLU/BBH/TyDiQA/MGSM. For large-scale, use two-phase midtraining: mix instruct into pretraining then short SFT to avoid forgetting (CS336 miniCPM pattern).
4. **Behavior Conditioning:** Model learns formatting, refusal, multi-turn cadence; evaluation via capability benchmarks (MMLU, GSM8K CoT, BBH, TyDiQA, HumanEval) + open-ended win-rate vs Davinci003 (AlpacaFarm/AlpacaEval 805, 13 annotators, 25% noise for training) with human validation (Spearman 0.98). Note length confound: preference win-rates track length strongly (Dubois) while benchmarks do not — monitor both [[source-cs336-lecture15-sft-rlhf]].

## Practical Implications
- **Fast & Accessible:** While pretraining costs millions, SFT can be conducted on few GPUs in hours/days (LIMA 10k) to large but still 0.2% cost (FLAN 540B). Use [[lora]]/QLoRA for domain adaptation (see [[parameter-efficient-fine-tuning]]) to replicate FLAN gains at 10k× checkpoint savings.
- **Domain Adaptation:** Enterprise developers frequently SFT open bases (e.g., [[llama-3]], LLaMA-2) with terminology/workflows and [[tool-use]] JSON schemas; Tülu shows ShareGPT/GPT4-Alpaca best for open-ended, CoT for math — match dataset to target skill, expect forgetting otherwise.
- **Include CoT & Diverse Tasks:** Always add CoT data to preserve reasoning; diverse mixture prevents overfitting to single style (Tülu §5.1: most datasets degrade GSM/TyDiQA if not represented).
- **Choose Base Wisely:** Larger/longer-pretrained base dwarfs instruction data choice (LLaMA-2 7B 45.7 > Pythia 26.2 avg); for 65B where base strong, monitor forgetting per benchmark, not just avg.
- **The Imitation Ceiling — Plan for RL:** SFT good initialization but limited to demonstration quality; AlpacaFarm shows PPO > SFT after, validating sequence SFT → [[rlhf]]/[[direct-preference-optimization]] for superhuman refinement. Pair with [[evaluation]] beyond win-rate (length bias r=0.96) to catch benchmark vs open-ended tradeoffs.
- **Usability Verified:** FLAN human pref 79% Flan-PaLM over PaLM (190 prompts), no few-shot regression; PaLM failures (continuation, repetition, non-termination) resolved by SFT EOS handling.

## Connections
- Takes the base model produced in [[pretraining]] as starting weights; governed by [[scaling-laws]] (Chinchilla 20 tok/param vs SFT 0.2% tokens).
- Serves as essential initialization prior to [[rlhf]] and [[direct-preference-optimization]] (InstructGPT 3-step, PPO-ptx vs DPO; AlpacaFarm ranking PPO > DPO at 2023).
- Teaches syntax for [[tool-use]] function calling and [[model-context-protocol]].
- Generalizes to [[instruction-tuning]] (FLAN large-scale view) and efficient via [[lora]]/[[parameter-efficient-fine-tuning]] (rank vs sparsity via [[lottery-ticket-hypothesis]]).
- Produces [[chain-of-thought]] preservation and unlocks zero-shot reasoning (vs prompting-only CoT).
- Dependent on [[synthetic-data]] (distilled) vs human-curated tradeoffs and evaluated by [[evaluation]]/[[alignment]] metrics (MMLU, AlpacaEval simulated vs human).

## Open Questions
- What is the optimal ratio between human-written vs model-generated synthetic SFT data — does ShareGPT's long-diverse generations overfit GPT-4 eval length bias?
- Can pure RL (e.g. RLVR) replace SFT entirely for reasoning tasks, or is SFT essential for formatting/zero-shot CoT unlock?
- How to scale instruction tasks beyond 282 without diminishing returns — is task quality/diversity metric needed?
- How to mitigate forgetting at 65B+ while instruction-tuning — does forgetting indicate over-tuning or weak regularization?
- When does AlpacaFarm simulated ranking (0.98) diverge from human factuality/safety — need process-level evaluation à la PRM?

## Sources
- [[source-deep-dive-into-llms-like-chatgpt]]
- [[source-scaling-instruction-finetuned]]
- [[source-how-far-can-camels-go]]
- [[source-alpacafarm]]
- [[source-training-language-models-to-follow-instructions-with-human-feedback]]
- [[source-cs336-lecture15-sft-rlhf]]
- [[source-cs336-lecture16-rlvr]]

## Synthesis

- [[post-training-lineage]] — how this stage relates to the RL stages that follow and precede it

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/fine-tuning/concepts/instruction-tuning">Instruction Tuning</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
