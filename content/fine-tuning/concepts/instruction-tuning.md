---
type: concept
title: "Instruction Tuning"
summary: Instruction Tuning is the Supervised Fine-Tuning stage that adapts a pretrained base model (which merely completes documents) into an instruction-following assistant by finetuning on many tasks phrased as natural…
visibility: public
aliases:
  - Instruction Finetuning
  - FLAN
  - SFT with Instructions
  - wiki/instruction-tuning
tags:
  - fine-tuning
  - llm-fundamentals
created: 2026-08-25
updated: 2026-08-25
status: draft
sources:
  - "[[source-scaling-instruction-finetuned]]"
  - "[[source-how-far-can-camels-go]]"
  - "[[source-alpacafarm]]"
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
  - "[[source-training-language-models-to-follow-instructions-with-human-feedback]]"
related:
  - "[[supervised-fine-tuning]]"
  - "[[chain-of-thought]]"
  - "[[pretraining]]"
  - "[[rlhf]]"
  - "[[direct-preference-optimization]]"
  - "[[synthetic-data]]"
  - "[[evaluation]]"
  - "[[alignment]]"
  - "[[lora]]"
  - "[[parameter-efficient-fine-tuning]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Instruction Tuning is the Supervised Fine-Tuning stage that adapts a pretrained base model (which merely completes documents) into an instruction-following assistant by finetuning on many tasks phrased as natural…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/fine-tuning/concepts/supervised-fine-tuning">Supervised Fine-Tuning</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/fine-tuning/concepts/supervised-fine-tuning">Supervised Fine-Tuning</a></li><li><a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/fine-tuning/concepts/rlhf">Reinforcement Learning from Human Feedback</a></li><li><a href="/fine-tuning/concepts/direct-preference-optimization">Direct Preference Optimization</a></li><li><a href="/llm-fundamentals/concepts/synthetic-data">Synthetic Data for Language Models</a></li><li><a href="/eval-safety/concepts/evaluation">Evaluation</a></li><li><a href="/fine-tuning/concepts/alignment">AI Alignment</a></li><li><a href="/fine-tuning/concepts/lora">Low-Rank Adaptation (LoRA)</a></li><li><a href="/fine-tuning/concepts/parameter-efficient-fine-tuning">Parameter-Efficient Fine-Tuning (PEFT)</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/fine-tuning/sources/source-scaling-instruction-finetuned">Scaling Instruction-Finetuned Language Models</a></li><li><a href="/fine-tuning/sources/source-how-far-can-camels-go">How Far Can Camels Go? Exploring the State of Instruction Tuning on Open Resources</a></li><li><a href="/fine-tuning/sources/source-alpacafarm">AlpacaFarm: A Simulation Framework for Methods that Learn from Human Feedback</a></li><li><a href="/llm-fundamentals/sources/source-deep-dive-into-llms-like-chatgpt">Deep Dive into LLMs like ChatGPT</a></li><li><a href="/fine-tuning/sources/source-training-language-models-to-follow-instructions-with-human-feedback">Training language models to follow instructions with human feedback</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**Instruction Tuning** is the [[supervised-fine-tuning]] stage that adapts a pretrained base model (which merely completes documents) into an instruction-following assistant by finetuning on many tasks phrased as natural language instructions. Formalized as **FLAN** (Finetuned Language Net, Wei et al. 2021) and scaled definitively in [[source-scaling-instruction-finetuned]] (Chung et al. 2022, FLAN-T5/FLAN-PaLM: 1,836 tasks, 540B), instruction tuning teaches the model to *express* knowledge acquired in [[pretraining]] rather than acquire new knowledge, at only 0.2–1.6% of pretraining compute. It is distinct from but sequencing before [[rlhf]]/[[direct-preference-optimization]] and underpins modern chat models; [[source-how-far-can-camels-go]] (Wang et al. 2023, Tülu) and [[source-alpacafarm]] (Dubois et al. 2023) show its systematic evaluation requires multi-faceted benchmarks beyond win-rates.

## Key Ideas
- **Not new knowledge but better expression**: FLAN uses 780B pretrain vs 1.4B finetune tokens; gains correlate with task diversity not token count. Interpretation in [[source-scaling-instruction-finetuned]] §3: model learns to follow instruction templates and expose pretrained capabilities.
- **Scaling on tasks + size**: Figure 4 of Chung et al.: normalized average on MMLU/BBH/TyDiQA/MGSM rises with tasks (282→1,836 still positive but diminishing) and with model size (8B +15.5%, 540B +9.4% vs base; small absolute larger, large relative error reduction larger). Single diverse mixture best average but not per-task best (Tülu §5.1).
- **Mixture composition is critical**: FLAN mixes Muffin 80 + T0-SF 193 + NIV2 1,554 + CoT 9 (473 datasets, 146 categories). Tülu evaluates 12 open corpora (SuperNI, Flan V2, CoT, Dolly, OAssistant, Self-Instruct, Unnatural, Alpaca, Code-Alpaca, GPT4-Alpaca, Baize, ShareGPT) and finds domain datasets boost domain skills (CoT→GSM 14.5→40.0, Code-Alpaca→HumanEval) while most hurt others via forgetting (e.g., Self-Instruct degrades MMLU). Human+GPT mixture (Flan V2+CoT+Dolly+OAssistant+GPT4-Alpaca+Code-Alpaca+ShareGPT = Tülu) achieves best average 45.2 but not per-benchmark best — motivating mixing research and MoE.
- **CoT data preservation**: Non-CoT-only finetuning severely degrades CoT reasoning; joint CoT + non-CoT preserves both (Figure 5). Just 9 CoT datasets (~few hundred K examples) unlock zero-shot reasoning via "let's think step-by-step" on BBH (Kojima 2022) where PaLM without CoT finetune scores ~0 (Figure 6). Qualifies [[chain-of-thought]] emergence at ~100B: finetuning can destroy it.
- **Formatting and optimization**: All datasets unified to chatbot schema `<|user|>/<|assistant|>/</s>` with loss masking on assistant tokens only (Tülu Fig.1, FLAN packing with EOS + cross-example masking). T5 encoder-decoder vs PaLM decoder-only both benefit; constant LR with Adafactor (FLAN) suffices for short finetune. Warmly related to [[pretraining]] packing/rope lessons.
- **Base model dominance**: Human+GPT mix on 7B: Pythia 26.2 vs OPT 22.2 vs LLaMA 38.3 vs LLaMA-2 45.7 avg (pretrain tokens 180B→2T). Scaling curves in Wang et al. show 65B vanilla already matches Tülu on MMLU/BBH/TyDiQA (forgetting), while still lagging ChatGPT 72.3 / GPT-4 86.9 (gap 87%/73% per best-per-task).
- **Evaluation beyond win-rate**: AlpacaFarm defines simulated win-rate vs Davinci003 on 805 instructions (13 GPT-4 annotators, 25% flip, $6/1k vs $3000/10k human, Spearman 0.98 with human ranks, replicates overoptimization). Yet Tülu shows AlpacaEval win-rate correlates r=0.96 with avg unique tokens (length bias) and fails to reflect benchmark differences (NLP datasets 4–6% win despite +7 MMLU). Human eval on 332 prompts reveals nuance (65B human-mix higher acceptability despite lower win-rate).

## How It Works
```
Pretrained base (Palm/T5/LLaMA) — next-token or span-corruption
        │
        ▼ Collect instruction tasks (Muffin/T0/NIV2/CoT or 12 open)
Format: instruction + optional exemplars + CoT? → input || target
   Templates: human-written or creator-provided, 10 per CoT, random delimiters
        │
        ▼ Packing: concat examples with EOS, mask cross-attention
Finetune (Adafactor/SFT): CE loss only on assistant tokens (masked)
   Hyper: constant LR, batch packing, dropout per size (Appendix E)
   Compute: 0.2% of pretrain (540B 512 TPU ×37h, T5-XXL 76e19 FLOPs)
        │
        ▼ Select single checkpoint via periodic held-out eval
Instruction-tuned model (Flan-PaLM/Flan-T5/Tülu) — zero/few-shot + CoT capable
        │
        ▼ (Optional) → [[rlhf]]/[[direct-preference-optimization]]/[[alignment]] RL stage
```
1. **Curate mixtures**: Deduplicate contamination (FLAN removes 44 MMLU-related from NIV2); sample Flan V2/CoT to 100K for balance (Tülu Table 1 counts, lengths). Leave contamination audit (MMLU/GSM in pretrain/distill) as open question.
2. **Unify format**: Chatbot schema handles 1–3.2 rounds (ShareGPT/Baize multi-turn). Loss masking ensures model learns to respond not to ask (as in [[supervised-fine-tuning]]).
3. **Train**: Decoder-only vs encoder-decoder both work; U-PaLM UL2 continued pretrain complementary (+8.9 vs +9.3 base).
4. **Evaluate multi-facet**: MMLU (0-shot), GSM/BBH (CoT), TyDiQA (gold-passage), HumanEval (pass@10), ToxiGen/TruthfulQA (safety), AlpacaEval simulated + human preference — need both capability and open-ended.

## Practical Implications
- **Default for open models**: Instruction-tune before deploying chat; use PEFT ( [[lora]] / [[parameter-efficient-fine-tuning]]) to replicate FLAN gains cheaply (Qlora on 65B not tested but cited as future). No need for 540B pretrain — Flan-T5-XL 3B beats GPT-3 175B on MMLU (52.4% vs 43.9%).
- **Dataset choice heuristic**: Match target skills — add CoT for reasoning (GSM/BBH), Code-Alpaca for code, ShareGPT/GPT4-Alpaca for open-ended (AlpacaEval). Avoid Self-Instruct (poor quality) and NLP-only (hurts open-ended). Expect forgetting on underrepresented skills if not included (e.g., most datasets hurt GSM/TyDiQA).
- **Include CoT data always**: At least ~9 CoT datasets (~hundreds of K) even if not targeting reasoning, else reasoning collapses after finetune. Enables zero-shot CoT without few-shot engineering.
- **Prefer strong base**: LLaMA-2 > LLaMA 1 > OPT/Pythia dominates downstream; invest in longer-pretrained base before curating larger instruction mix. For 65B where base already strong, monitor forgetting (evaluate per-benchmark, not just avg).
- **Compute budget**: 0.2–1.6% FLOPs → instruction tuning feasible on single node vs pretrain cluster; checkpoint selection via periodic held-out avoids overfitting.
- **Evaluation discipline**: Don't rely solely on AlpacaEval win-rate (length bias r=0.96); add capability benchmarks (MMLU/GSM) and human acceptability. AlpacaFarm simulator valid for method ranking (0.98) and cheap iteration ($6/1k), but inherits GPT-4 length/list bias — calibrate with human spot checks.

## Connections
- Direct instantiation of [[supervised-fine-tuning]] (SFT Stage 1) with instruction phrasing; shares loss masking, delimiter tokens, LIMA hypothesis (quality > quantity) — FLAN shows diversity also matters.
- Preserves and unlocks [[chain-of-thought]] (Wei 2022) emergent at ~100B; CoT finetuning complements CoT prompting and [[self-consistency]]/[[tree-of-thoughts]]/[[thinking-models]].
- Precedes [[rlhf]] and [[direct-preference-optimization]] (InstructGPT 3-step; PPO vs DPO comparison in AlpacaFarm where PPO wins at 2023 hyperparams).
- Implements [[alignment]] Helpful/Honest/Harmless via curated demonstrations; toxicity appendix links to [[evaluation]].
- Realized efficiently via [[lora]]/[[parameter-efficient-fine-tuning]] (not in FLAN/Tülu full-finetune but orthogonal — 10k× checkpoint reduction).
- Depends on [[pretraining]] scale/token quality (LLaMA-2 upgrade proof) and [[scaling-laws]] (Chinchilla vs instruction scaling).
- Produces ground for [[synthetic-data]] (distilled Alpaca/ShareGPT) and is evaluated by [[evaluation]] multi-metric frameworks (HELM/MMLU + AlpacaEval).
- Contrasts with [[retrieval-augmented-generation]]: instruction tuning internalizes knowledge expression; RAG supplements after.

## Open Questions
- What is optimal instruction diversity vs task deduplication — why 282→1,836 gives diminishing returns? Is Muffin-style dialog/program synthesis enough?
- Can pure synthetic distillation replace human-curated (ShareGPT 70.5% win vs OAssistant 58.1%) without contamination/bias?
- How to prevent forgetting of strong base capabilities at 65B+ without mixing regression — is MoE/modular better than monolithic Human+GPT?
- Does instruction tuning saturate before RL? How does RLHF/DPO interact with already CoT-instruction-tuned checkpoint?
- How to debias model-based evaluation (length correlation 0.96) without losing scalability of AlpacaFarm/AlpacaEval?

## Sources
- [[source-scaling-instruction-finetuned]]
- [[source-how-far-can-camels-go]]
- [[source-alpacafarm]]
- [[source-training-language-models-to-follow-instructions-with-human-feedback]]
- [[source-deep-dive-into-llms-like-chatgpt]]

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/fine-tuning/concepts/rlhf">Reinforcement Learning from Human Feedback</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
