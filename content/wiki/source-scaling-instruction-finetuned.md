---
type: source-summary
title: "Scaling Instruction-Finetuned Language Models"
summary: Chung et al. (Google, arXiv 2210.11416v5, Dec 2022) present FLAN-T5 / FLAN-PaLM — the definitive scaling study of instruction finetuning.
status: draft
visibility: public
author: "Hyung Won Chung, Le Hou, Shayne Longpre, Barret Zoph et al. (Google)"
source-type: paper
url: "https://arxiv.org/abs/2210.11416"
date-published: 2022-12-06
date-ingested: 2026-08-25
tags:
  - fine-tuning
  - prompt-engineering
  - llm-fundamentals
key-concepts:
  - "[[supervised-fine-tuning]]"
  - "[[instruction-tuning]]"
  - "[[chain-of-thought]]"
  - "[[scaling-laws]]"
  - "[[pretraining]]"
key-entities:
  - "[[google-research]]"
---

# Scaling Instruction-Finetuned Language Models

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 1 of 20 figures on this page were not found in [https://arxiv.org/abs/2210.11416](https://arxiv.org/abs/2210.11416): `100B`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

Chung et al. (Google, arXiv 2210.11416v5, Dec 2022) present **FLAN-T5 / FLAN-PaLM** — the definitive scaling study of instruction finetuning. By combining 4 mixtures (Muffin 80 + T0-SF 193 + NIV2 1,554 + CoT 9 = 1,836 tasks, 473 datasets) and finetuning T5 (80M–11B), PaLM (8B/62B/540B), U-PaLM and cont-PaLM with Adafactor and packing, they show instruction finetuning improves held-out MMLU/BBH/TyDiQA/MGSM by +9–15% normalized average at only 0.2–1.6% of pretraining FLOPs (540B: 512 TPU ×37h). Flan-PaLM 540B reaches 75.2% 5-shot MMLU (CoT+SC) and Flan-T5-XL 3B surpasses GPT-3 175B, with strong multilingual and zero-shot gains. Critically, adding just 9 CoT datasets preserves reasoning that otherwise degrades when finetuning only on non-CoT data.

## Key Takeaways
1. **Scales on two axes**: Normalized average rises with both model size (8B +15.5%, 62B +10.4%, 540B +9.4% vs no finetune; larger absolute for small, larger relative error reduction for large) and number of tasks (majority by 282 tasks, diminishing but still positive to 1,836; suggests finetuning teaches expression of pretrained knowledge rather than new knowledge).
2. **Compute efficiency**: Finetuning uses only 1.4B tokens vs 780B pretrain; Table 2 — 0.2% FLOPs for 540B, 0.2% for T5-XXL. JAX T5X with constant LR, packing + EOS + cross-example masking, single checkpoint selected via periodic eval.
3. **CoT finetuning essential**: Non-CoT + CoT joint training outperforms either alone on both CoT and non-CoT held-out; non-CoT-only finetuning severely degrades CoT performance (Figure 5). Prior FLAN/T0 evaluations missed this because they evaluated only non-CoT NLP tasks with sub-CoT-emergent (<100B) models.
4. **Unlocks zero-shot CoT**: "Let's think step-by-step" (Kojima 2022) yields ~0 on PaLM BBH zero-shot but large gain on Flan-PaLM (Figure 6) — explains why Kojima's success used InstructGPT (already instruction-tuned with CoT-like data). Enables reasoning without few-shot exemplars.
5. **Generality across architectures**: Gains hold for encoder-decoder T5 (LM-adapted baseline) and decoder-only PaLM/U-PaLM/cont-PaLM; Flan-U-PaLM (UL2 continued pretrain + FLAN) best overall (59.1 norm avg), showing UL2 and instruction tuning complementary. Open Flan-T5 checkpoints democratize strong zero/few-shot + CoT (11B beats PaLM 62B on some BBH).
6. **Usability**: Human preference on 190 open-ended generations (creativity, planning, explanation, reasoning, with/without CoT trigger): Flan-PaLM preferred 79% over PaLM; CoT trigger adds ~10%; no few-shot regression. PaLM base failures: continuation, repetition, non-termination due to lack of EOS in pretrain.

## Detailed Notes

### Data Mixture (Figure 2-3, Appendices E-F)
- Muffin 80 (62 FLAN +26 dialog/program synthesis: Byrne, Anantha, Dai, Yasunaga, Li), T0-SF 193 (sans FLAN), NIV2 1,554 (Wang 2022c, removed 44 MMLU contamination), CoT 9 (arithmetic Cobbe et al., multi-hop Geva, NLI Camburu, etc., 10 manual templates each). 146 categories, template + few-shot exemplar randomization (Q:/A: delimiters), plus exemplar-only formats à la Min 2022. Data card details owners/risks/distributions.

### Procedure (Section 2.2, Appendix E)
- T5 span-corruption, PaLM causal LM, U-PaLM prefix LM+span corruption (20k steps). Hyperparams per model LR/batch/dropout/steps with constant schedule (cf. Chinchilla cosine but short finetune). Packing multiple examples per sequence separated by EOS, masked attention across boundaries. Evaluation single checkpoint per model.

### Evaluation (2.3, Appendix D)
- Held-out: MMLU 57, BBH 23 (below human avg per Suzgun et al.), TyDiQA 8 langs, MGSM 10 langs (GSM8K multilingual). Metrics: MMLU/BBH direct+CoT, TyDiQA direct, MGSM CoT; 5/3/1/8 shot normalized average (BIG-Bench normalized preferred metric: (raw - random)/(max - random)). Responsible AI Appendices C (RealToxicityPrompts, identity toxicity, WinoGender, translation misgendering).

### Scaling Results (Section 3, Table 3, Figure 4)
- 8B: 6.4→21.9 (+15.5) with 1,836 tasks, detailed breakdown MMLU-D 24.3→49.3, CoT 24.1→41.3, BBH-D 30.8→36.4, CoT 30.1→31.1, TyDiQA 25.0→47.5, MGSM 3.4→8.2. 540B: 49.1→58.5 (+9.4) MMLU 71.3→73.2 (D) 62.9→68.1 (CoT), BBH 49.1→58.8, CoT 63.7→65.6, TyDiQA 52.9→67.4, MGSM 45.9→61.3. CoT-9 alone already lifts CoT metrics (e.g., 540B MGSM 45.9→59.4) but hurts MMLU-D at 62B.

### CoT Ablations (Section 4, Tables 4-5, Figures 5-7)
- Table 4 SOTA push: MMLU 72.2 direct (vs 69.3 PaLM), BBH-nlp 70.0 vs 62.7, BBH-alg 48.2 vs 38.3, MGSM 21.2 vs 18.3; with CoT+SC (Wang) MMLU 75.2 vs prior best Chinchilla 67.6/code-davinci 68.3, MGSM 72.0 vs 57.9, GSM8K 83.9% (training in mixture). TyDiQA SOTA near ByT5. BBH-alg still behind code-davinci.
- Figure 5 left/right stratification proves necessity of both data types. Appendix A FAQs address CoT eval, single-task finetuning, model size gains, CoT mixture size.

### Put Together (Section 5, Table 5)
- T5-XXL -2.9→23.7 (+26.6), T5-XL 3B MMLU 52.4% > GPT-3 43.9%, Flan-PaLM 8B 6.4→21.9 etc. Cont-PaLM and U-PaLM ablations isolate UL2 benefit.

### Usability (Section 6, Figures 8-9, Appendix I)
- 190 prompts 5 categories; sampling temp 0.7 ×5 ranked by logprob with repetition filter (score > 0.5*median → reject). Human win 79% Flan; qualitative appendix shows PaLM looping vs Flan concise answer. No few-shot degradation (N=30).

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 4 of 4 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2210.11416](https://arxiv.org/abs/2210.11416)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Finetuning language models on a collection of datasets phrased as instructions has been shown to improve model performance and generalization to unseen tasks."

> "We only use 0.2% of the pre-training compute to instruction-finetune Flan-PaLM 540B (approximately 512 v4 TPU chips for 37 hours)."

> "Whereas prior instruction finetuning methods that do not include chain-of-thought severely degrade performance on CoT evaluations, adding just nine CoT datasets into the finetuning mixture enables better performance on all evaluations."

> "Flan-PaLM 540B achieves state-of-the-art performance on several benchmarks, such as 75.2% on five-shot MMLU."

## Concepts Introduced or Referenced
- [[supervised-fine-tuning]] — Flan is instruction finetuning paradigm; loss masking on assistant tokens (blue in later work), EOS handling.
- [[instruction-tuning]] — Canonical scaling proof for instruction tuning: tasks + size + CoT; defines Flan procedure vs FLAN (Wei 2021).
- [[chain-of-thought]] — CoT finetuning as preservation mechanism; 9 datasets unlock zero-shot reasoning (Kojima) and SOTA with SC.
- [[pretraining]] — Compute fraction 0.2%, packing regime; relation to Chinchilla/Palm pretrain.
- [[scaling-laws]] — Scaling curves for tasks and params (Figure 4), diminishing returns beyond 282.
- [[evaluation]] — Held-out protocol, normalized average, MMLU/BBH/TyDiQA/MGSM suite.
- [[alignment]] — Usability/human preference axis (79% win), toxicity/bias appendix.

## Critical Assessment
**Strengths:** Landmark scale (540B, 1,836 tasks) with exhaustive ablations and responsible AI suite; delivers public Flan-T5 checkpoints that remain influential; pinpoints CoT data necessity that explains prior failures; compute table and data card transparency exemplary; human eval separates usability from benchmark accuracy.

**Limitations / Gaps:** Evaluates only held-out academic suites (not real user distribution beyond 190 curated); 282→1,836 diminishing returns suggests task diversity not thoroughly controlled (Muffin/T0-SF/NIV2 overlap); GSM8K in mixture contaminates that SOTA claim; CoT ablation uses only 9 datasets (not varied); no RLHF/RLAIF comparison (acknowledged as next step); multilingual gains limited to languages well-represented in UL2/Palm pretrain.

**Contradictions / Notes vs. existing wiki:** Extends [[supervised-fine-tuning]] which previously cited only LIMA hypothesis and dialogue formatting — this source adds large-scale evidence that quality alone insufficient without CoT diversity and that instruction tuning is compute-cheap. Complements [[chain-of-thought]] page's emergence at ~100B (Wei 2022) by showing finetuning can *preserve* that emergent ability whereas non-CoT finetuning destroys it (needs cross-link + WARNING callout). Validates [[pretraining]] compute-optimal vs instruction-tuning efficiency distinction. No conflict with [[lora]] — orthogonal PEFT method could realize same gains cheaper.

---

**Source:** Scaling Instruction-Finetuned Language Models by Hyung Won Chung, Le Hou, Shayne Longpre, Barret Zoph et al. (Google) — <https://arxiv.org/abs/2210.11416>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
