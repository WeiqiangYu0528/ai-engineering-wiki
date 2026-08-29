---
type: source-summary
title: "The Llama 3 Herd of Models"
summary: The July 2024 (v3 Nov 2024) 92-page technical report from Meta introducing Llama 3 / Llama 3.1 — a herd of dense decoder-only Transformers at 8B, 70B, and 405B parameters (126 layers, 16,384 dim, 128 heads, GQA-8)…
status: draft
visibility: public
author: "Llama Team, AI @ Meta"
source-type: paper
url: "https://arxiv.org/abs/2407.21783"
date-published: 2024-07-23
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
  - open-source
  - fine-tuning
key-concepts:
  - "[[pretraining]]"
  - "[[transformer]]"
  - "[[scaling-laws]]"
  - "[[tokenization]]"
  - "[[supervised-fine-tuning]]"
  - "[[direct-preference-optimization]]"
  - "[[llama-3]]"
key-entities:
  - "[[meta]]"
aliases:
  - wiki/source-llama-3-herd-of-models
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The July 2024 (v3 Nov 2024) 92-page technical report from Meta introducing Llama 3 / Llama 3.1 — a herd of dense decoder-only Transformers at 8B, 70B, and 405B parameters (126 layers, 16,384 dim, 128 heads, GQA-8)…</p>
<p class="kb-provenance">Llama Team, AI @ Meta, 2024-07-23. <a href="https://arxiv.org/abs/2407.21783">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 2 of 47 figures on this page were not found in [https://arxiv.org/abs/2407.21783](https://arxiv.org/abs/2407.21783): `1×10`, `16384×128`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The July 2024 (v3 Nov 2024) 92-page technical report from [[meta]] introducing **Llama 3 / Llama 3.1** — a herd of dense decoder-only [[transformer]]s at 8B, 70B, and **405B parameters** (126 layers, 16,384 dim, 128 heads, GQA-8) trained on **15.6T tokens** with a 128K-token context. Significantly larger than Llama 2 (1.8T → 15.6T, ~50× FLOPs for 405B: 3.8×10²⁵). Pre-training innovations span web-scale curation (URL/doc/line dedup, PII/safety filters, code/math/multilingual pipelines, annealing), architecture (GQA, 128K vocab, RoPE θ=500K, doc-masking), and infrastructure (16K H100, 3D parallelism, RoCE). Post-training uses iterative SFT → rejection sampling → [[direct-preference-optimization|DPO]] rounds plus reward modeling and model averaging, with tool use, long-context, multilingual, code/reasoning/factuality specialization. Results: **405B Instruct matches GPT-4/4o and Claude 3.5 Sonnet** on MMLU (87.3 vs 85.1 GPT-4, 89.1 GPT-4o), MATH 73.8, GSM8K 96.8, HumanEval 89.0, MGSM 91.6; Llama 3.1 8B/70B are best-in-class at their scale. The report also details vision/speech compositional adapters, safety (Llama Guard 3), and FP8 inference.

## Key Takeaways
1. **15.6T-token pre-training at 405B scale — the new open frontier.** 15.6T multilingual tokens (≈50% general, 25% math/reasoning, 17% code, 8% multilingual), vs Llama 2's 1.8T. 405B trained with 3.8×10²⁵ FLOPs (≈50× Llama 2 largest). Two-stage pre-training: 8K context standard → continued pre-training to 128K. 8B/70B are **overtrained** (far past Chinchilla-optimal 20 tok/param; 8B on 15T ≈ 1875 tok/param) to minimize inference cost — deliberate post-Chinchilla strategy.
2. **Data curation is the paper's longest section — four complementary levers.** (a) **Web curation:** custom HTML parser (preserves math/code/alt-text, removes markdown), PII/safety domain blocklists, MinHash doc dedup + line dedup (lines >6× per 30M bucket), n-gram repetition + dirty-word + KL heuristics, DistilRoberta quality classifiers (Wikipedia-referenced + Llama-2-judged) plus domain-specific code/math classifiers with prompt tuning. (b) **Data mix via knowledge classification & scaling-law sweeps:** downsample over-represented arts/entertainment; final mix 50/25/17/8 as above. (c) **Annealing:** upsample high-quality code/math at LR decay; 8B gains +24% GSM8K / +6.4% MATH from annealing alone; doubles as data-valuation probe (30% new data on 40B anneal window). (d) **Multilingual:** fastText LID 176 languages, per-language dedup/filtering, Llama-2 multilingual quality ranker.
3. **Scaling laws — two-stage NLL→accuracy forecasting with ~4 orders extrapolation.** IsoFLOPs 6×10¹⁸–1×10²², 40M–16B models, cosine schedule → fit parabola minima → `N*(C)=A·C^α` with (α,A)=(0.53,0.29) predicting 402B/16.55T at 3.8×10²⁵ (chosen 405B robust to flat IsoFLOP minima). Second, correlate normalized NLL on benchmarks with FLOPs, then sigmoidal NLL→accuracy using Llama 2 + scaling models — ARC Challenge forecast accurately predicts 405B before training.
4. **Minimal architecture changes — scale via data/infra, not MoE.** Dense Transformer (no MoE for stability). Deltas vs Llama 2: GQA-8 (KV cache), doc-boundary attention mask (critical for long context), vocab 128K (100K tiktoken + 28K multilingual; 3.17→3.94 chars/token English), RoPE base 500K (32K context). 405B: 126L×16384×128 heads×53248 FFN, peak LR 8e-5, SwiGLU, RoPE 500K, Table 3.
5. **Post-training as iterative SFT→RS→DPO rounds with synthetic & preference data.** Chat dialog format with system/user/tool tokens; reward modeling (Bradley-Terry) → SFT on high-quality demonstrations → rejection sampling (sample K, keep reward-top) → DPO → model averaging → repeat. Preference data from human + synthetic (405B annotates smaller models — distillation), stringent quality filtering; SFT data emphasizes code (execution feedback), multilingual, math chain-of-thought, long-context, tool use (BFCL, Nexus), factuality/steerability. Pipeline simpler than RLHF PPO for stability.
6. **Infrastructure at 16K H100 scale — new production fabric.** Grand Teton 8×H100 (700W, 80GB HBM3) per server; up to 16K GPUs; MAST scheduler; Tectonic 240PB/7.5K SSDs @2 TB/s (burst 7 TB/s) for checkpointing; RoCE (Arista 7800/Minipack2, 400 Gbps, 3-layer Clos, 24K GPUs, E-ECMP 16 flows + deep-buffer spines, no DCQCN) or InfiniBand (Quantum2) per cluster; 3D parallelism (FSDP + tensor + pipeline) with topology-aware placement to minimize cross-pod traffic. Reliability: checkpoint per-GPU 1MB–4GB, frequent saves, failure recovery playbooks.
7. **Results — open frontier parity + small-model dominance.** Pre-trained and post-trained evaluations (§5) vs GPT-3.5/4/4o, Claude 3.5, Gemini, Mistral, Gemma, Nemotron (Table 2): 405B Instruct bolded best-in-class on MMLU-Pro 73.3, MATH 73.8, MGSM 91.6 (tie), QuALITY 95.2 (tie), while GPT-4o leads MMLU 89.1 vs 87.3 and Claude 3.5 leads 89.9; 70B/8B beat size peers (e.g., 8B HumanEval 72.6 vs Gemma 54.3, Mistral 40.2). Safety (§5.4) via Llama Guard 3, red-teaming, system-level mitigations; inference (§6) via pipeline parallelism + FP8 quantization.

## Detailed Notes

### Pre-training Data (§3.1) — the paper's centerpiece
- **Web Data Curation (§3.1.1):** PII/safety filtering (Meta safety standards, adult/PII domains), custom HTML parser vs third-party (human-evaluated precision/recall, preserves math/code), markdown stripping (hurts vs plain text), de-dup trilogy (URL keep-latest, MinHash global doc, ccNet-style line >6×/30M), heuristics (dup n-gram ratio for logs/errors, dirty-word adult filter, KL token-distribution outliers), model-based quality (fastText Wikipedia-referenced, RoBERTa/DistilRoberta Llama-2-judged), code/math pipelines (DistilRoberta classifiers trained on Llama-2-annotated web, prompt-tuned for STEM/code interleaved, domain-specific HTML features), multilingual (fastText LID 176 langs, per-lang dedup/heuristics/filters, multilingual DistilRoberta quality rank, language-ratio tuning).
- **Determining Data Mix (§3.1.2):** Classifier for web knowledge categories → downsample arts/entertainment; scaling-law mix sweeps: train small models on candidate mix → predict large model performance, iterate, validate with larger model on key benchmarks.
- **Annealing Data (§3.1.3):** High-quality code/math upsampled at LR anneal; no benchmark training sets in anneal (clean few-shot eval); GSM8K/MATH training-set anneal probe per OpenAI 2023; annealing as data-valuation probe (50%-trained 8B, linear LR→0 on 40B, 30% new data).

### Model Architecture (§3.2) & Scaling Laws (§3.2.1)
- GQA-8, doc mask, vocab 128K (tiktoken + multilingual), RoPE 500K; Table 3 hyperparameters; Fig 1 architecture.
- Scaling laws: compute-optimal `N*(C) = A·C^α`, Fig 2 IsoFLOPs parabolas, Fig 3 `N*(C)` vs FLOPs (α=0.53), Fig 4 ARC Challenge NLL & accuracy forecast — accurate across 4 orders; flat IsoFLOP minima justify 405B choice; details: 2000-step warmup, cosine →0.1 peak, WD=0.1·LR, batch 250K–4M tokens.

### Infrastructure (§3.3)
- Tectonic checkpoint burst challenge; 3-layer Clos topology (rack 16 GPUs/TOR → 192 racks/3K pod full bisection → 8 pods/24K cluster 1:7 oversubscribed at aggregation); parallelism strategies (4D in §3.3.2), collective communication (NCCL-like with 16-flow E-ECMP), reliability (failures at 16K scale, recovery).

### Training Recipe (§3.4)
- AdamW, cosine, SwiGLU; Initial pre-training 8K → Long-context continued pre-training (RoPE adaptation, doc masking) → Annealing (linear decay, quality data). Hyperparameters per model size in Table 3; 15.6T token count includes continued + annealing.

### Post-training (§4)
- **Modeling (§4.1):** Chat format (`<|begin_of_text|>`, `<|header|> ...`), reward modeling (pairwise, Bradley-Terry, 2-stage), SFT (high-quality demos, careful LR, regularization), DPO (beta-tuned, iterative), model averaging (weight soup), iterative rounds.
- **Data (§4.2):** Preference data (human + synthetic, 405B as judge/teacher), SFT data (code with execution, multilingual, math, long-context docs, tool traces), processing (dedup, quality filters, PII scrubbing, decontamination).
- **Capabilities (§4.3):** Code (HumanEval, MBPP, execution -agentic), Multilingual (MGSM, Flores), Math/Reasoning (GSM8K, MATH, ARC, GPQA, MMLU-Pro), Long context (NIH/multi-needle, InfiniteBench, QuALITY/ZeroSCROLLS), Tool use (BFCL, Nexus), Factuality (TruthfulQA-like), Steerability.

### Results (§5), Inference (§6), Multimodal (§7–8)
- **§5.1 Pre-trained:** Standard benchmarks (MMLU etc.), robustness, adversarial, contamination analysis (n-gram overlap).
- **§5.2 Post-trained:** Table 2 headline (see Key Takeaways #7), plus proficiency exams, coding, multilingual, math, long-context, tool use — 405B competitive with GPT-4.
- **§5.4 Safety:** Benchmark construction, safety pre-training (filtered data), safety fine-tuning (refusals, Llama Guard 3 — 8B classifier), human evals, cyber/CBRN, red teaming, system-level safety, limitations.
- **§6 Inference:** Pipeline parallelism, FP8 quantization — enables 405B serving on fewer nodes.
- **§7 Vision / §8 Speech:** Compositional approach — frozen LLM + image/speech encoders (image: contrastive on image-text pairs; speech: masked discrete-token reconstruction) + cross-attention adapters (vision: multi-layer cross-attention, train adapter+encoder only; video: on top of image) — competitive with SOTA but not yet released; Fig 28 overview.

### Novelty vs prior Llama
- 15K+ character/token compression gain, 28K multilingual tokens, doc masking, 15T+ tokens, iterative DPO vs single-round RLHF, 405B dense vs MoE, production RoCE fabric.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 5 of 8 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2407.21783](https://arxiv.org/abs/2407.21783)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Our largest model is a dense Transformer with 405B parameters and a context window of up to 128K tokens ... Llama 3 delivers comparable quality to leading language models such as GPT-4 on a plethora of tasks." — Abstract

> "We pre-train Llama 3 on a corpus of about 15T multilingual tokens, compared to 1.8T tokens for Llama 2." — §1

> "Our flagship model was pre-trained using 3.8×10²⁵ FLOPs, almost 50× more than the largest version of Llama 2." — §1

> "We opt for a standard dense Transformer ... rather than for a mixture-of-experts ... to maximize training stability." — §1

> "We adopt a relatively simple post-training procedure based on SFT, rejection sampling, and DPO as opposed to more complex RL algorithms that tend to be less stable and harder to scale." — §1

> "We use grouped query attention (GQA) with 8 key-value heads ... We use a vocabulary with 128K tokens ... We increase the RoPE base frequency ... to 500,000." — §3.2

> "The resulting scaling law ... suggests training a 402B parameter model on 16.55T tokens." — §3.2.1

> "Annealing ... improved the performance of a pre-trained Llama 3 8B model on GSM8K and MATH validation by 24.0% and 6.4% ... the improvements on the 405B model are negligible." — §3.1.3

## Concepts Introduced or Referenced
- [[pretraining]] — 15T data pipeline, annealing, continued pre-training (8K→128K), doc masking, inference-optimal overtraining beyond Chinchilla.
- [[transformer]] — Dense Transformer with GQA, RoPE 500K, 128K vocab; 126L×16384×128H 405B config.
- [[scaling-laws]] — IsoFLOPs → `N*(C)=A·C^α` and two-stage NLL→accuracy forecasting; flat IsoFLOP minima.
- [[tokenization]] — tiktoken-based 128K vocab (+28K multilingual), 3.94 chars/token.
- [[supervised-fine-tuning]] — Iterative SFT stage of post-training on high-quality demos.
- [[direct-preference-optimization]] — DPO as primary preference optimization (vs PPO), iterative with RS.
- [[llama-3]] — The model family itself (8B/70B/405B, base + Instruct, Llama Guard 3).
- [[inference]] — H100 clusters, 3D parallelism, RoCE fabric, pipeline + FP8.
- [[rlhf]] — Reward modeling + preference data; DPO as stable RLHF alternative.

## Critical Assessment
**Strengths:** Most exhaustive open-model report to date (92 pages, data→scaling→infra→recipe→post-training→safety→multimodal); transparent about data curation heuristics that others keep proprietary; scaling-law forecast validated pre-training is a methodological contribution; infrastructure section is rare production detail; honest about 405B annealing saturation vs 8B gains.

**Limitations / Gaps:** Herd size limited to 3 (no MoE exploration, despite admitting flat IsoFLOP); vision/speech (§7–8) are preliminary and not released — evaluation suites incomplete; safety (§5.4) acknowledges system-level limits and red-team gaps; contamination analysis (§5.1.4) via n-grams is coarse; 15T token quality vs quantity tradeoff under-specified (how much is truly high-quality vs filtered web?).

**Contradictions / Notes vs. existing wiki:** Extends/complements [[source-promptingguide-models-llama-3]] (which previewed 8B/70B/400B on 15T) with full 405B numbers, architecture Table 3, and post-training details missing from the brief. For [[pretraining]] / [[scaling-laws]], it validates Chinchilla equal scaling but shows **overtraining** (8B on 15T ≈94× Chinchilla-optimal) is optimal for inference cost — an explicit post-Chinchilla nuance to add to the scaling-laws page. No direct contradiction with [[source-training-compute-optimal-large-language-models]] — it builds on it.

## Sources
- Paper PDF: https://arxiv.org/pdf/2407.21783.pdf
- Saved raw: [https://arxiv.org/abs/2407.21783](https://arxiv.org/abs/2407.21783)
- Project: https://llama.meta.com/ | https://github.com/meta-llama/llama3

---

**Source:** The Llama 3 Herd of Models by Llama Team, AI @ Meta — <https://arxiv.org/abs/2407.21783>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
