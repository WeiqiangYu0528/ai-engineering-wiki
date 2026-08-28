---
type: entity
title: "DeepMind"
summary: DeepMind (now part of Google DeepMind) is the London-based AI research lab known for AlphaGo, AlphaFold, and foundational large language model scaling research.
status: draft
visibility: public
entity-type: organization
tags:
  - llm-fundamentals
  - open-source
created: 2026-08-24
updated: 2026-08-24
url: "https://deepmind.google"
related:
  - "[[chinchilla]]"
  - "[[gopher]]"
  - "[[scaling-laws]]"
  - "[[google-research]]"
---

# DeepMind

## Overview
**DeepMind** (now part of Google DeepMind) is the London-based AI research lab known for AlphaGo, AlphaFold, and foundational large language model scaling research. In the LLM era, DeepMind contributed **Gopher (280B, Rae et al. 2021)** and, critically, the **Chinchilla scaling laws** via Hoffmann et al. (2022) in [[source-training-compute-optimal-large-language-models]] — the paper that corrected Kaplan scaling and established equal $N/D$ scaling as the compute-optimal paradigm for [[pretraining]].

## Key Facts
- **LLM Milestones:**
  - **Gopher (Dec 2021):** 280B dense decoder-only [[transformer]] on MassiveText (300B tokens), the flagship pre-Chinchilla model and the baseline for scaling analysis.
  - **Chinchilla (Mar 2022):** 70B/1.4T tokens at Gopher-matched FLOPs ($5.76×10^{23}$), proving compute-optimal training requires $\approx 20$ tok/param and $N_{opt} \propto C^{0.5}$ — uniformly beating Gopher, GPT-3, Jurassic-1, and MT-NLG.
  - **Methodology:** Trained 400+ models (70M–16B, 5B–500B tokens) to fit $\hat{L}(N,D)=E+A/N^{\alpha}+B/D^{\beta}$ and derive the efficient frontier; three independent estimation methods (envelope, IsoFLOP, parametric) converged.
  - **Other contributions:** RETRO (retrieval-augmented LM, 10× effective data), the MassiveText dataset, and early MoE scaling analysis (Clark et al. 2022) contextualized in the Chinchilla related work.
- **Infrastructure:** TPU v3/v4 + JAX + Haiku; bfloat16 compute with float32 sharded optimizer state; research on cosine schedule tuning and AdamW.
- **Post-Chinchilla Impact:** The Chinchilla rule ($D \approx 20N$) has been adopted (and often exceeded via overtraining) by all frontier labs for models like Llama 2/3, Falcon, and Gemma.

## Significance in AI Engineering
- **Corrected Scaling Science:** Identified the methodological artifact (fixed LR schedule) that biased Kaplan et al. toward oversized models, redirecting billions of dollars of compute toward data scaling rather than parameter scaling.
- **Inference Economics:** Demonstrated that lifetime cost is dominated by serving, not training — a 4× smaller compute-optimal model (Chinchilla) slashes per-token memory/FLOPs and enables single-node deployment, a principle now central to [[inference]] and edge serving.
- **Data-Centric Shift:** Elevated dataset construction (MassiveText rebalancing, quality filtering, C4/GitHub validation) to a first-class scaling axis alongside model engineering.
- **Bridge to Google:** After merging with Google Research (now Google DeepMind), the lab's scaling insights directly inform Gemini and Gemma model families.

## Related Concepts
- [[chinchilla]] — The flagship compute-optimal model and its 70B/1.4T recipe.
- [[gopher]] — The 280B baseline that defined the pre-Chinchilla oversized regime.
- [[scaling-laws]] — DeepMind's revision: Kaplan → Chinchilla $C^{0.5}$ frontier and the three estimation approaches.
- [[pretraining]] — MassiveText, AdamW, horizon-matched cosine schedule methodology.
- [[inference]] — Amortization argument: smaller optimal models minimize serving cost.

## Sources
- [[source-training-compute-optimal-large-language-models]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
