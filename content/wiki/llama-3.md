---
type: entity
title: "Llama 3"
summary: Llama 3 / Llama 3.1 is Meta's 2024 open-weight herd of dense decoder-only Transformer language models at 8B, 70B, and 405B parameters, the flagship 405B (126 layers × 16,384 dim × 128 heads, GQA-8, 128K vocab, RoPE…
status: draft
visibility: public
entity-type: model
tags:
  - llm-fundamentals
  - open-source
  - fine-tuning
  - inference
created: 2026-08-25
updated: 2026-08-25
url: "https://llama.meta.com/"
related:
  - "[[pretraining]]"
  - "[[transformer]]"
  - "[[scaling-laws]]"
  - "[[tokenization]]"
  - "[[supervised-fine-tuning]]"
  - "[[direct-preference-optimization]]"
  - "[[bert]]"
  - "[[meta]]"
---

# Llama 3

## Overview
**Llama 3 / Llama 3.1** is [[meta]]'s 2024 open-weight herd of dense decoder-only [[transformer]] language models at **8B, 70B, and 405B parameters**, the flagship 405B (126 layers × 16,384 dim × 128 heads, GQA-8, 128K vocab, RoPE θ=500K, 128K context) trained on **15.6T multilingual tokens** with 3.8×10²⁵ FLOPs — ~50× Llama 2's compute. Detailed in [[source-llama-3-herd-of-models]] (92-page report, July/Nov 2024) and previewed in [[source-promptingguide-models-llama-3]], the herd natively supports multilinguality, coding, reasoning, and tool use, with a post-training stack of **SFT → rejection sampling → DPO** (iterative) plus **Llama Guard 3** safety. 405B Instruct matches GPT-4/4o and Claude 3.5 Sonnet on knowledge/reasoning/code/math benchmarks, while 8B/70B lead their size classes; all are released under the Llama 3 Community License.

## Key Facts
- **Family:** Llama 3 8B / 70B (Apr 2024, 8K context, English-focused) → Llama 3.1 8B / 70B / 405B (July 2024, + multilingual + 128K context + tool use). Base + Instruct variants; `Llama Guard 3` (8B classifier) for I/O safety.
- **Scale:** 15.6T tokens (50% general knowledge, 25% math/reasoning, 17% code, 8% multilingual) vs 1.8T for Llama 2. 405B = 3.8×10²⁵ FLOPs; 8B on 15T tokens ≈ 1,875 tok/param — deliberately **overtrained** far beyond Chinchilla-optimal 20 tok/param to amortize inference cost.
- **Architecture (Table 3, [[source-llama-3-herd-of-models]] §3.2):** Dense Transformer (no MoE for stability), SwiGLU, GQA-8 (KV cache), doc-boundary attention mask (critical for long context), vocab 128K (100K tiktoken + 28K multilingual → 3.17→3.94 chars/token English), RoPE base 500,000. 405B: 126L×16384×53248 FFN, peak LR 8e-5; 70B: 80L×8192; 8B: 32L×4096.
- **Data pipeline (§3.1, longest section):** Custom HTML parser (preserves math/code/alt-text, strips markdown), PII/safety blocklists, URL + MinHash doc + line dedup (lines >6×/30M bucket), n-gram/KL/dirty-word heuristics, fastText + DistilRoberta quality (Wikipedia-referenced + Llama-2-judged), domain-specific code/math DistilRoberta pipelines, per-language fastText LID (176 langs) + multilingual quality ranker. Mix tuned via knowledge classification (downsample arts/entertainment) and scaling-law sweeps; annealing on high-quality code/math (8B GSM8K +24%, MATH +6.4%; 405B negligible).
- **Scaling laws (§3.2.1, Figs 2–4):** IsoFLOPs 6×10¹⁸–1×10²² (40M–16B models) → parabola minima → `N*(C)=A·C^α`, α=0.53, A=0.29 predicting 402B/16.55T at 3.8×10²⁵; two-stage NLL→accuracy forecast (ARC Challenge) accurate across 4 orders; flat IsoFLOP minima justify 405B choice.
- **Infrastructure (§3.3):** Up to 16K H100 (700W, 80GB HBM3) on Grand Teton servers, MAST scheduling, Tectonic 240PB @2 TB/s burst 7 TB/s checkpoints, RoCE (Arista 7800/Minipack2, 400 Gbps, 3-layer Clos 24K GPUs, E-ECMP 16 flows) or InfiniBand (Quantum2), 3D parallelism with topology-aware placement.
- **Training recipe (§3.4):** AdamW, cosine →0.1 peak (2000-step warmup, batch 250K–4M), 3 phases: 8K pre-training → continued pre-training to 128K (RoPE adaptation) → annealing (linear decay on quality data).
- **Post-training (§4):** Chat format with header/tool tokens → reward model (Bradley-Terry) → SFT on high-quality demos → rejection sampling (sample K, keep reward-top) → DPO → model averaging → iterate; preference data human + synthetic (405B as teacher for 8B/70B distillation), specialized for code (execution), math CoT, long-context, tool use (BFCL/Nexus), multilingual, factuality.
- **Results (Table 2, §5):** 405B Instruct bolded best-in-class on MMLU-Pro 73.3, ARC 96.9, MATH 73.8, MGSM 91.6, but GPT-4o leads MMLU 89.1 vs 87.3 and Claude 3.5 89.9; 70B/8B dominate peers (8B HumanEval 72.6 vs Gemma 54.3, Mistral 40.2; 70B MMLU 83.6 vs Mixtral 76.9). Long-context: NIH/multi-needle 98.1 (405B), QuALITY 95.2 tie.
- **Inference (§6) & Multimodal (§7–8):** Pipeline + FP8 quantization for serving; compositional vision/speech adapters (cross-attention, encoder+adapter train, LLM frozen) — competitive but not yet released; Fig 28 overview.

## Significance in AI Engineering
- **Open frontier parity.** First open model credibly matching GPT-4-class on breadth — enables fine-tuning, distillation, and private deployment without closed-API dependence; updated Llama 3 Community License explicitly permits commercial use.
- **Data-curation recipe as artifact.** The 15T pipeline (HTML→PII→dedup→quality→mix→anneal) is the most detailed public recipe for web-scale pre-training data — reusable for custom corpora beyond Llama.
- **Inference-optimal overtraining made explicit.** Demonstrates that Chinchilla-optimal `D≈20N` minimizes *training* FLOPs, but production economics favor training *smaller* models far longer (8B on 15T) to minimize lifetime (training + serving) cost — a post-Chinchilla correction to [[scaling-laws]].
- **Post-training simplicity.** Validates that iterative SFT+RS+DPO can match RLHF PPO with greater stability at 400B scale — a practical template for alignment without complex RL.
- **Small-model dominance → distillation ladder.** Using 405B to annotate data for 8B/70B (synthetic preference/SFT) shows the 405B's second role as teacher — small models inherit frontier quality at edge-deployable cost.
- **Production infra blueprint.** RoCE fabric with E-ECMP, Tectonic checkpointing, and topology-aware 3D parallelism provides a rare public reference for 10K+ GPU training.

## Related Concepts
- [[pretraining]] — 15T pipeline, continued pre-training 8K→128K, annealing, doc masking, overtraining beyond Chinchilla.
- [[transformer]] — Dense Transformer with GQA, RoPE 500K, 128K vocab — the stable alternative to MoE.
- [[scaling-laws]] — `N*(C)=A·C^0.53` IsoFLOPs + two-stage NLL→accuracy forecast; flat minima.
- [[tokenization]] — 128K tiktoken+multilingual vocab, 3.94 chars/token.
- [[supervised-fine-tuning]] — SFT stage of iterative post-training.
- [[direct-preference-optimization]] — DPO as stable PPO replacement.
- [[bert]] — Contrasts as encoder/MLM (512 context, 340M) vs decoder/causal-LM (128K, 405B) pre-training paradigms.
- [[inference]] — FP8, pipeline parallelism, KV-cache with GQA, lifetime-cost amortization.

## Sources
- [[source-llama-3-herd-of-models]]
- [[source-promptingguide-models-llama-3]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
