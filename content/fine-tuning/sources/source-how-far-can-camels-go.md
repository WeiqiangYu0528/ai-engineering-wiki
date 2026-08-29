---
type: source-summary
title: "How Far Can Camels Go? Exploring the State of Instruction Tuning on Open Resources"
summary: Wang et al. (AI2/UW, arXiv 2306.04751v2, Oct 2023) systematically evaluate instruction tuning on 12 open datasets across LLaMA/LLaMA-2/OPT/Pythia 6.7B–65B.
status: draft
visibility: public
author: "Yizhong Wang, Hamish Ivison, Pradeep Dasigi, Jack Hessel et al. (AI2, UW)"
source-type: paper
url: "https://arxiv.org/abs/2306.04751"
date-published: 2023-10-30
date-ingested: 2026-08-25
tags:
  - fine-tuning
  - eval-safety
  - open-source
  - llm-fundamentals
key-concepts:
  - "[[supervised-fine-tuning]]"
  - "[[instruction-tuning]]"
  - "[[synthetic-data]]"
  - "[[evaluation]]"
  - "[[pretraining]]"
key-entities:
  - "[[huggingface]]"
aliases:
  - wiki/source-how-far-can-camels-go
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Wang et al. (AI2/UW, arXiv 2306.04751v2, Oct 2023) systematically evaluate instruction tuning on 12 open datasets across LLaMA/LLaMA-2/OPT/Pythia 6.7B–65B.</p>
<p class="kb-provenance">Yizhong Wang, Hamish Ivison, Pradeep Dasigi, Jack Hessel et al. (AI2, UW), 2023-10-30. <a href="https://arxiv.org/abs/2306.04751">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 3 of 35 figures on this page were not found in [https://arxiv.org/abs/2306.04751](https://arxiv.org/abs/2306.04751): `28.6`, `34.2`, `0.05`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

Wang et al. (AI2/UW, arXiv 2306.04751v2, Oct 2023) systematically evaluate **instruction tuning on 12 open datasets** across **LLaMA/LLaMA-2/OPT/Pythia 6.7B–65B**. Datasets span human-curated (Dolly, OpenAssistant), NLP-derived (SuperNI, Flan V2, CoT) and synthetic/distilled (Alpaca, Self-Instruct, Unnatural Instructions, Code-Alpaca, GPT4-Alpaca, Baize, ShareGPT). Formatted in unified chatbot schema ( `<|user|>/<|assistant|>/</s>` with loss masking on assistant tokens only) and finetuned as decoder-only SFT, models are evaluated multi-facetedly on MMLU, GSM8K (CoT), BBH (CoT), TyDiQA, HumanEval (Codex-Eval), ToxiGen, TruthfulQA, plus **AlpacaEval (GPT-4 win-rate vs Davinci003 on 805 instructions)** and human pairwise comparisons (332 prompts, 18 experts). Key finding: **no single dataset dominates** — different corpora enhance specific skills (CoT for GSM, Code-Alpaca for HumanEval, ShareGPT/GPT4-Alpaca for AlpacaEval), mixtures yield best average (Human+GPT = Tülu), larger/longer-pretrained bases dominate (LLaMA-2 7B avg 45.7 vs Pythia 26.2), and model-preference scores strongly correlate with generation length/diversity (r=0.96), masking capability differences. Even Tülu 65B (largest public fully finetuned LLaMA at time) reaches only ~87% ChatGPT and 73% GPT-4 on average, arguing for better base models and data. Release includes Tülu 7B–65B checkpoints, code, data, eval at open-instruct.

## Key Takeaways
1. **No universal best dataset**: Table 3 (LLaMA 13B per dataset): SuperNI boosts MMLU 42.3→49.7 but GSM 14.5→4.0; CoT boosts GSM→40.0 & BBH→41.9; Code-Alpaca boosts HumanEval 28.6→34.2; Open Assistant 58.1% AlpacaEval; GPT4-Alpaca 63.1%, ShareGPT 70.5% open-ended — but each may hurt other axes (most degrade GSM/TyDiQA via forgetting). Highlights need for task-diverse corpora.
2. **Mixtures best average, not per-task**: Human mixture (Flan V2+CoT+Dolly+OAssistant) avg 39.2, Human+GPT (adding GPT4-Alpaca+Code-Alpaca+ShareGPT) avg 45.2 — best overall but best on only 2/6 benchmarks. Suggests future mixing strategies or modular MoE.
3. **Base model paramount**: Table 4 Human+GPT on 7B: Pythia 26.2, OPT 22.2, LLaMA 7B 38.3, LLaMA-2 7B 45.7 — correlates with pretraining tokens (180B→2T). Table 5: instruction gains largest for small models (7B +13.3 MMLU) and shrink for 65B where vanilla matches Tülu on MMLU/BBH/TyDiQA (forgetting).
4. **Gap to proprietary remains**: Tülu 65B avg 56.7 vs ChatGPT 72.3 vs GPT-4 86.9 across 6 capability benchmarks; even best per-task open model averages 87% ChatGPT /73% GPT-4.
5. **Model-based evaluation biased**: Figure 2 — 13B models' AlpacaEval win-rate vs avg unique tokens Pearson r=0.96 (p≪0.05). NLP datasets (CoT/FLAN/SuperNI 4–6%) score poorly on AlpacaEval despite benchmark gains, while long-response distilled datasets dominate. Human eval (332 prompts) largely mirrors this but shows nuance: 65B human-mix higher acceptability than 7B Tülu despite lower pairwise win-rate.
6. **Safety**: ToxiGen toxicity almost eliminated by GPT-distilled finetuning (Tülu 0.1% vs ChatGPT 27.7% → over-refusal); TruthfulQA improves with distillation but doesn't scale with size (larger models hedge more).

## Detailed Notes

### Datasets & Formatting (Sections 2–3)
- Table 1 counts, rounds, lengths: SuperNI 96,913 (1.0 round, 291/38.7), CoT 100K sampled (266/53.2), Flan V2 100K (355/31.2), Dolly 15,011 (118/91.3), OAssistant 34,795 (1.6 rounds 34.8/212.5), Self-Instruct 82,439 (41.5/29.3, vanilla GPT-3), Unnatural 68,478 (107.8/23.6, Davinci-002), Alpaca 52,002 (27.8/64.6, Davinci-003), Code-Alpaca 20,022 (35.6/67.8), GPT4-Alpaca 52,002 (28/161.8), Baize 210K (3.1 rounds), ShareGPT 168K (3.2 rounds 71/357.8, cleaned from sharegpt.com Vicuna unfiltered). Unified chatbot schema Figure 1 with special tokens and teacher-forcing loss masking: L = -∑ log p(tj|t<j) iff tj∈Y (assistant tokens).

### Training (3.2, Appendix D)
- Decoder-only causal LM even for T5-derived data; hyperparameters (LR, batch, epochs) per size; DeepSpeed; compute detailed.

### Evaluation Suite (Section 4)
- Capability: MMLU 0-shot, GSM 8-shot CoT, BBH 3-shot CoT, TyDiQA 1-shot gold-passage F1, HumanEval 0-shot pass@10, ToxiGen % toxic, TruthfulQA % truthful+informative.
- Open-ended: AlpacaEval 805 (252 Self-Instruct +188 OASST +129 Anthropic Helpful +80 Vicuna +156 Koala) GPT-4 win-rate vs Davinci003 randomized order; Human 332 (Self-Instruct+Vicuna) expert 18 AI2/UW binary acceptability + 5-way pairwise preference (Appendix G).

### Results Details (Section 5, Tables 3–7)
- **Per-dataset Table 3**: blue = improves over vanilla LLaMA 13B, orange = degrades. Notable degradations: Self-Instruct worst (30.4 MMLU -11.9), Unnatural/GSM 8.0 etc. CoT best reasoning; Flan V2 best MMLU 50.6.
- **Base Table 4**: confirms token count ranking.
- **Scale Table 5**: Vanilla LLaMA 7B 31.5 MMLU → Tülu 44.8 (+13.3); 65B vanilla 58.7→59.2 (+0.5) with GSM +9 but BBH -2.3 etc. Tülu-1.1 (LLaMA-2) 7B 49.2 MMLU > LLaMA 65B vanilla 58.7 → base > scale. Alternate 65B ShareGPT alone 61.3 MMLU +2.6 vs Tülu, 73.6 AlpacaEval vs 61.8 → single distilled dataset can beat mixture on open-ended.
- **Safety Table 6**: CoT/FLAN moderate toxicity reduction 85→63, OAssistant/GPT4-Alpaca/ShareGPT dramatic 3.9/5.5; hedging note for TruthfulQA.
- **AlpacaEval Table 7**: SuperNI 4.2, CoT 6.0, Flan 3.2 (poor) vs OAssistant 58.1, GPT4-Alpaca 63.1, ShareGPT 70.5 → distilled wins.
- **Human Figures 3–4**: acceptance rates (Tülu 65B > human-mix 65B > 7B Tülu > 7B human-mix) and preference rates (Tülu 65B beats ChatGPT? Actually still below but closer) with inter-annotator agreement G.2.

### Analysis
- **Bias**: Scatter win-rate vs unique tokens r=0.96 suggests GPT-4 prefers length/diversity not just correctness; not merely counting but strong confounder.
- **Diversity/size**: ShareGPT diversity, size, long targets explain win.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 5 of 5 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2306.04751](https://arxiv.org/abs/2306.04751)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Despite recent claims that open models can be on par with state-of-the-art proprietary models, these claims are often accompanied by limited evaluation."

> "We find that different instruction-tuning datasets can uncover or enhance specific skills, while no single dataset (or combination) provides the best performance across all evaluations."

> "Model and human preference-based evaluations fail to reflect differences in model capabilities exposed by benchmark-based evaluations."

> "The best model in any given evaluation reaches on average 87% of ChatGPT performance, and 73% of GPT-4 performance."

> "We introduce Tülu, our best performing instruction-tuned model suite finetuned on a combination of high-quality open resources."

## Concepts Introduced or Referenced
- [[supervised-fine-tuning]] — SFT with chatbot formatting and assistant-only loss; empirical study of 12 corpora and forgetting.
- [[instruction-tuning]] — Central subject: open-resource instruction tuning systematic comparison; complements Flan scaling.
- [[synthetic-data]] — Synthetic/distilled (Alpaca, ShareGPT, Baize, GPT4-Alpaca) vs human-curated (Dolly, OAssistant) efficacy analysis; distilled often stronger per benchmark bias.
- [[evaluation]] — Multi-faceted eval design (capability vs open-ended vs safety) and critique of model-based preference bias (length correlation).
- [[pretraining]] — Base model quality/token count as dominant factor; LLaMA-2 upgrade proof.
- [[parameter-efficient-fine-tuning]] — Not direct but full finetuning vs LoRA context noted in related work (QLoRA).

## Critical Assessment
**Strengths:** First comprehensive open-resource study at scale (65B full finetune, 12 datasets, 6 capability + 2 safety + 2 open-ended evaluations with human validation); releases largest public fully tuned checkpoints + framework (open-instruct); exposes complementarity and forgetting; quantifies GPT-4 eval length bias (r=0.96) important for interpreting AlpacaFarm/AlpacaEval; clear Tülu recipe and ablations across model sizes and base families.

**Limitations / Gaps:** Full finetuning only (no PEFT/LoRA comparison at 65B beyond citing QLoRA); RLHF/RLAIF not explored (supervised-only); evaluation contamination risk for MMLU/GSM in distilled data not fully excluded (potential ChatGPT/GPT-4 training on eval); human eval limited to 332 prompts and 7B models (LLaMA-1 period); safety evaluation limited to ToxiGen/TruthfulQA not adversarial; ShareGPT reproduced dataset not exact Vicuna provenance.

**Contradictions / Notes vs. existing wiki:** Complements [[source-scaling-instruction-finetuned]] (FLAN 1,836 tasks) by testing open datasets at smaller 12-mix scale — shows even diverse open mixture insufficient vs FLAN; should cross-link per dataset. Aligns with [[supervised-fine-tuning]] LIMA hypothesis: quality matters but quantity/diversity also needed. Challenges [[evaluation]]/[[source-alpacafarm]] reliance on AlpacaEval by exposing length bias — needs WARNING callout when citing win-rates. Contrasts with [[synthetic-data]] optimism by showing synthetic helps specific skills but not universally; no conflict with [[pretraining]] Chinchilla but reinforces pretrain dominance. Provides context for [[lora]]/[[parameter-efficient-fine-tuning]] as cheaper alternative to full 65B tuning explored here.

---

**Source:** How Far Can Camels Go? Exploring the State of Instruction Tuning on Open Resources by Yizhong Wang, Hamish Ivison, Pradeep Dasigi, Jack Hessel et al. (AI2, UW) — <https://arxiv.org/abs/2306.04751>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
