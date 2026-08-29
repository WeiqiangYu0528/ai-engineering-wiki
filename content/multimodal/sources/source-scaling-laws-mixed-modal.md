---
type: source-summary
title: "Scaling Laws for Generative Mixed-Modal Language Models"
summary: FAIR's Jan 2023 paper (arXiv 2301.03728, CS224n Week 9 optional) is the first systematic mixed-modal scaling law study, running >250 experiments across 7 modalities (Text, Image, Image-Text, Speech, Speech-Text, Code…
status: draft
visibility: public
author: "Armen Aghajanyan, Lili Yu, Alexis Conneau, Wei-Ning Hsu, Karen Hambardzumyan, Susan Zhang, Stephen Roller, Naman Goyal, Omer Levy, Luke Zettlemoyer (FAIR, UW, YerevaNN)"
source-type: paper
url: "https://arxiv.org/abs/2301.03728"
date-published: 2023-01-10
date-ingested: 2026-08-25
tags:
  - multimodal
  - llm-fundamentals
key-concepts:
  - "[[multimodal-ai]]"
  - "[[scaling-laws]]"
  - "[[pretraining]]"
key-entities:
  - "[[meta]]"
aliases:
  - wiki/source-scaling-laws-mixed-modal
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">FAIR's Jan 2023 paper (arXiv 2301.03728, CS224n Week 9 optional) is the first systematic mixed-modal scaling law study, running &gt;250 experiments across 7 modalities (Text, Image, Image-Text, Speech, Speech-Text, Code…</p>
<p class="kb-provenance">Armen Aghajanyan, Lili Yu, Alexis Conneau, Wei-Ning Hsu, Karen Hambardzumyan, Susan Zhang, Stephen Roller, Naman Goyal, Omer Levy, Luke Zettlemoyer (FAIR, UW, YerevaNN), 2023-01-10. <a href="https://arxiv.org/abs/2301.03728">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 1 of 7 figures on this page were not found in [https://arxiv.org/abs/2301.03728](https://arxiv.org/abs/2301.03728): `0.99`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

FAIR's Jan 2023 paper (arXiv 2301.03728, CS224n Week 9 optional) is the first systematic **mixed-modal scaling law** study, running **>250 experiments** across **7 modalities** (Text, Image, Image-Text, Speech, Speech-Text, Code, Molecules) and **8M–30B** parameters on 5–100B tokens with a unified discrete token LM (VQ-VAE for images, HuBERT+k-means for speech, BPE for text/code, SMILES for molecules) trained via causal masked objective. Extending Hoffmann et al. (Chinchilla) uni-modal `L = E + A/N^α + B/D^β`, it adds a **competition/synergy interaction term** that predicts when joint training hurts vs helps each modality. It further documents emergent training phenomena (coordinate-ascent alternation, batch-size and stability links) and validates the law by training a **30B speech-text model (45B tokens)** that eliminates predicted competition and outperforms uni-modal controls – establishing the principle that synergy emerges at scale, with direct lessons for [[multimodal-ai]] early-fusion design and [[pretraining]] hyperparameter transfer.

## Key Takeaways
1. **Mixed-modal law = uni-modal + interaction**: `L_j(N,D) = E_j + A_j/N^{α_j} + B_j/|D_j|^{β_j} + C_{i,j}/(...)` – additive term modelling **competition (positive) or synergy (negative)** as function of model size N and data split. With 7 fitted params per uni-modal law (Hoffmann), plus interaction coefficients, R² >0.99 on held-out bi-modal runs. α, β ≤0.5 bound (transformer+GD optimum).
2. **Modality definition is empirical**: σ-membership via perplexity ratio: `D_i∈D_j ⇔ E_{x∼D_i}[L_{D_j}(x)] ≤ σ² E_{x∼D_j}[L_{D_j}(x)]`, σ=3 separates the 7 modalities by source/domain/sensor/language threshold.
3. **Competition dominates small-scale, synergy at scale**: For Image+Text and Speech+Text, small N/D see joint loss **worse** than uni-modal (curse of multilinguality analogue, Conneau 2019; Goyal 2021). As N and |D| grow, interaction term decays → crosses zero → synergy. Speech-Text 30B/45B training hits predicted zero-competition point and beats uni-modal.
4. **Four emergent phenomena explained by law**:
   - **Coordinate-ascent training**: loss traces show model alternately improves one modality while stalling/worsening the other – emerges from competing gradients; frequency dampens as synergy grows.
   - **Stability correlation**: modalities with larger competition coefficient C are more prone to divergence (logit drift); ties to later Chameleon stability work.
   - **Optimal batch/ LR transfer**: mixed-modal optimum ≈ weighted combination of uni-modal optima weighted by interaction; recipe to set hyperparams when uni-modal ones known (Appendix).
   - **Curse vs synergy predicts data/model allocation**: law gives compute-optimal mixture ratios.
5. **Unified tokenization recipe**: All modalities → discrete tokens: Make-A-Scene VQGAN (512²→1024 tokens, 8192 codebook) for images; HuBERT 1000-codebook for speech + ASR/TTS paired; OPT tokenizer for text (180B tokens); InCoder for code; Zinc SMILES for molecules. Single causal-masked transformer (details App A) enables arbitrary permutation/interleaving.
6. **Implication for design**: Naively mixing modalities at small scale hurts; must **scale model + data jointly** or use sparsity (later MoT, LMFusion) to circumvent. Predicts compute regime where sparsity unnecessary.

## Detailed Notes

### Definitions (§3)
- σ-membership formalizes "when is code a different modality from text?" via cross-perplexity; validates 7 chosen modalities.
- Uni-modal law uses Hoffmann et al. 2022 param: minimal loss E, approximation error A/N^α, optimization error B/D^β, 7 params learned per modality; α,β bounded 0.5.

### Empirical Setting (§4)
- **Datasets**: Text 180B (OPT corpus, English-heavy); Image 600M images (LAION+CC subset, NSFW/watermark filtered, 614B tokens only images); Image-Text 690B tokens (same + captions); Speech web-mined podcasts/news + LibriSpeech/CommonVoice/VoxPopuli/Spotify/People's Speech (English-filtered, music removed); Speech-Text MLS+VoxPopuli ASR/TTS; Code InCoder; Molecules Zinc SMILES.
- **Tokenization**: VQGAN spatial reduction 8, perceptual losses on faces/salient objects; HuBERT details App A.3.2; shared vocab with modality-specific ranges.
- **Architecture**: decoder-only transformer with causal masked objective (CM3 style masking spans → infill), variant of Hoffmann/Chinchilla optimization; Appendix A.1 model details.
- **Training**: 8M–2.7B sweep + 30B validation; 5–100B tokens; extensive hyperparam consistency.

### Scaling Laws (§5)
- Uni-modal laws fitted first (R² high, reproduced Kaplan/Hoffmann trends).
- Bi-modal: linear regression on log-interaction term; competition barrier broken at predicted N*/D* – figure shows predicted vs actual loss for Speech+Text crossing.
- Analysis (§5.2.2): intuition – early capacity contention (separate subnetworks compete) → later shared representations become synergistic (e.g., speech phonetics helps text prosody, vision grounding helps language compositionality).

### Emergent Phenomena (§6)
- Coordinate-ascent visualized via per-modality gradient norms alternating peaks.
- Hyperparameter guideline derivation: `η*_mixed ≈ Σ_j (w_j η*_j)` where w_j from interaction term; batch size optimum shifts with competition.
- Stability: larger C correlates with loss spikes; suggests need for QK-Norm/z-loss (Chameleon) and modality-separated towers (MoT/LMFusion).

### Validation (§6-7)
- 30B Speech-Text on 45B tokens: per-modality perplexity lower than uni-modal 30B controls trained on same modality alone, confirming law prediction.

## Notable Quotes
> "We explicitly model the optimal synergy and competition due to data and model size as an additive term to previous uni-modal scaling laws."

> "We have identified a scaling law that reflects the contributions of individual modalities and an additional term that captures the interaction between modalities (whether it be one of competition or synergy)."

> "The curse of multilinguality ... similar competition and scaling phenomenon have been observed for multi-lingual models ... scaling up the model size can improve synergy and alleviate interference. These findings align with our findings in the mixed-modal scenario."

## Concepts Introduced or Referenced
- [[multimodal-ai]] — First principles for early-fusion token mixing; explains why Chameleon needed 34B + stability fixes and why Transfusion/MoT/LMFusion pursue modality-specific capacity.
- [[scaling-laws]] — Direct extension of Kaplan/Chinchilla to 7-modal regime; additive interaction term is core addition to canonical `L(N,D)`.
- [[pretraining]] — Tokenizer unification (VQGAN+HUBERT+BPE), data mixture curation, and hyperparameter transfer recipe for multi-modal pretraining.
- [[inference]] — Competition predicts serving trade-offs (larger patches vs quality) via data side.
- [[evaluation]] — Per-modality perplexity as benchmark; σ-membership as evaluation construct.

## Critical Assessment
**Strengths**: Unprecedented breadth (250 runs, 7 modalities, 30B validation) with clean additive extension that *predicts* out-of-sample synergy point – rare falsifiable scaling claim; bridges multilingual curse literature to multimodality; hyperparameter transfer recipe is practically actionable; emergent phenomena tie loss dynamics to optimization theory.

**Weaknesses**: Discrete token unification lossy for images/speech (later Transfusion shows diffusion superior); σ=3 threshold arbitrary; interaction term parameterization not fully reproduced in truncated HTML (needs PDF for exact C form); 5–100B token regime far below Chameleon/Transfusion's 1–2T scale – extrapolation uncertain; no downstream task eval (FID, WER) – only perplexity; code/molecules modalities less relevant to vision-language focus.

**Contradictions / Synthesis**: Complements [[source-transfusion]]/[[source-mixture-of-transformers]]/[[source-lmfusion]] – its competition prediction motivates MoT's sparse towers and LMFusion's frozen-text strategy as ways to *artificially* achieve synergy at smaller scale. Text-image competition at small scale explains Chameleon's need for 9.2T tokens to reach parity. Speech-text synergy at 30B foreshadows later audio-LLM successes.

## Sources
- https://arxiv.org/abs/2301.03728 (v1 10 Jan 2023)
- Hoffmann et al. 2022 Chinchilla (basis), Kaplan et al. 2020, Conneau et al. 2019 curse of multilinguality, Goyal et al. 2021, Henighan et al. 2020, Droppo & Elibol 2021

---

**Source:** Scaling Laws for Generative Mixed-Modal Language Models by Armen Aghajanyan, Lili Yu, Alexis Conneau, Wei-Ning Hsu, Karen Hambardzumyan, Susan Zhang, Stephen Roller, Naman Goyal, Omer Levy, Luke Zettlemoyer (FAIR, UW, YerevaNN) — <https://arxiv.org/abs/2301.03728>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
