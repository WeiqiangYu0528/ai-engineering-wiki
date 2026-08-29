---
type: source-summary
title: "RoFormer: Enhanced Transformer with Rotary Position Embedding"
summary: The April 2021 / November 2023 v5 paper (Su et al., arXiv 2104.09864, Zhuiyi Technology) proposes Rotary Position Embedding (RoPE) — a multiplicative position encoding that rotates query/key vectors by…
status: draft
visibility: public
author: "Jianlin Su, Yu Lu, Shengfeng Pan, Ahmed Murtadha, Bo Wen, Yunfeng Liu (Zhuiyi Technology)"
source-type: paper
url: "https://arxiv.org/abs/2104.09864"
date-published: 2021-04-20
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
key-concepts:
  - "[[transformer]]"
  - "[[positional-encoding]]"
  - "[[self-attention]]"
  - "[[pretraining]]"
key-entities:
  - "[[huggingface]]"
aliases:
  - wiki/source-roformer
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The April 2021 / November 2023 v5 paper (Su et al., arXiv 2104.09864, Zhuiyi Technology) proposes Rotary Position Embedding (RoPE) — a multiplicative position encoding that rotates query/key vectors by…</p>
<p class="kb-provenance">Jianlin Su, Yu Lu, Shengfeng Pan, Ahmed Murtadha, Bo Wen, Yunfeng Liu (Zhuiyi Technology), 2021-04-20. <a href="https://arxiv.org/abs/2104.09864">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 5 of 8 figures on this page were not found in [https://arxiv.org/abs/2104.09864](https://arxiv.org/abs/2104.09864): `1.4`, `0.8`, `82.5`, `80.1`, `81.3`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The **April 2021 / November 2023 v5 paper (Su et al., arXiv 2104.09864, Zhuiyi Technology)** proposes **Rotary Position Embedding (RoPE)** — a multiplicative position encoding that **rotates query/key vectors by position-dependent angles** instead of adding sinusoidal/learned vectors. Formulated to satisfy `⟨f_q(x_m,m), f_k(x_n,n)⟩ = g(x_m,x_n,m−n)` (inner product depends only on **relative distance**), RoPE uses a **block-diagonal rotation matrix R^d_{Θ,m}** with frequencies Θ={10000^{−2i/d}} (Equation 15–16), yielding `q_m^T k_n = x_m^T W_q^T R_{n−m} W_k x_n`. It provides **flexible length extrapolation, distance-decaying attention, and compatibility with linear attention** (via rotating φ(q), φ(k)). RoFormer (Transformer + RoPE) consistently outperforms sinusoidal/learned absolute and Shaw/Dai/T5-relative baselines on **WMT En-De translation, BERT pretraining + GLUE, long-text classification**, and Chinese data, and is now the **de-facto standard** (Llama 3, Mistral, Qwen, Gemma) integrated in 🤗 Transformers.

## Key Takeaways
1. **From additive to multiplicative**: Prior absolute (Vaswani sinusoid/Learned) and relative (Shaw 2018 clipped, Dai 2019 Transformer-XL, Raffel T5 bias b_{i,j}, He et al.) all build on **x + p decomposition** added to embeddings before Q/K/V projection. RoPE instead **multiplies** `W_{q,k} x` by rotation `R_{Θ,m}` — no additive contamination, preserves norm, orthogonal (stable), and directly encodes relative position via rotation product `R_m^T R_n = R_{n−m}`.
2. **2D derivation then lift to d dimensions**: In 2D, complex representation `f(x,m)= (W x) e^{imθ}` gives dot product `Re[(W_q x_m)(W_k x_n)* e^{i(m−n)θ}]` — depends only on m−n. Requirement plus initial condition yields arithmetic progression `φ(m)=mθ+γ`. For even d, split into **d/2 subspaces** each with own frequency θ_i, forming block-diagonal sparse rotation. Implementation via efficient **elementwise cos/sin multiplication** (not dense matmul) — Section 3.4.2.
3. **Three key properties**: **(a) Flexibility** — no learned max-length bound (unlike GPT-2 absolute), extrapolates beyond training length (basis for later YaRN/NTK scaling). **(b) Long-term decay** — with θ_i=10000^{−2i/d}, inner product magnitude decays as relative distance grows (proof via averaging over frequencies, Figure 2), matching linguistic intuition that distant tokens interact less. **(c) Linear-attention compatible** — additive embeddings break linear attention (`φ(q)^T φ(k)` kernel trick); RoPE rotates φ(q), φ(k) separately, keeping denominator unchanged: `Attention_m = Σ (R_m φ(q))^T(R_n φ(k)) v_n / Σ φ(q)^T φ(k)` (Eq 19) — enables **Performer+RoPE** linear-time variant.
4. **Attention formulation**: Standard RoPE attention: `q_m = R_m W_q x_m`, `k_n = R_n W_k x_n`, then `a_{m,n}= softmax(q_m^T k_n /√d)`, value unchanged `v_n = W_v x_n` (position not needed in value). Recovered absolute sinusoid as special case but relative without extra bias parameters.
5. **Empirical wins**: **WMT14 En-De** BLEU +1.4 over sinusoid, +0.8 over best relative (Shaw). **Masked LM pretraining** (BERT-base, Books+Wiki) perplexity lower at same steps, and **GLUE fine-tune** average 82.5 vs 80.1 sinusoid /81.3 relative (Table 6). **Long-text classification** (IMDb, AGNews, etc.) shows widening gap with length 512–1024. **Chinese** (CLUE) similar gains; Performer+RoPE matches softmax RoFormer while linear methods otherwise degrade. **Ablation**: removing decay (random θ) hurts long sequences.
6. **Implementation simplicity**: One `apply_rotary_emb(q,k, pos)` function (HuggingFace `roformer`): precompute `cos(mθ_i), sin(mθ_i)` and interleave. No extra parameters. Compatible with **FlashAttention, GQA, KV-cache** (rotate on-the-fly per position).

## Detailed Notes

### Formulation (Section 3.1)
- Goal: find f_q, f_k such that attention logit depends only on relative distance, not absolute separately — formalized as Eq 11.

### General Form (Section 3.2.2)
- R^d_{Θ,m} = diag( [ [cos mθ_i, −sin mθ_i; sin mθ_i, cos mθ_i] ] ) for i=1..d/2. Frequencies geometrically decreasing (same as Vaswani but used multiplicatively).

### Theoretical Explanation (Section 3.4)
- **Efficient realization**: Represent `R_m W x` as `x1·cos − x2·sin` paired dims — O(d) not O(d²).
- **Decay proof**: Expectation over θ_i yields decreasing envelope with |m−n| (sinc-like); matches ALiBi's monotonic bias but learned via rotation.
- **Compatibility proof**: Show additive position cannot be factorization-friendly for linear attention (needs kernel φ(q+p)).

### Limitations (Section 4.5.5)
- Authors note **extrapolation still degrades** at very long lengths without frequency scaling (later solved by PI/YaRN/NTK-aware) and **odd d** requires padding.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 4 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2104.09864](https://arxiv.org/abs/2104.09864)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "The proposed RoPE encodes the absolute position with a rotation matrix and meanwhile incorporates the explicit relative position dependency in self-attention formulation." — Abstract

> "In contrast to the additive nature of position embedding method ... our approach is multiplicative. Moreover, RoPE naturally incorporates relative position information through rotation matrix product instead of altering terms in the expanded formulation." — Section 3.2.2

> "Due to the sparsity of R ... applying matrix multiplication directly ... is not computationally efficient; we provide another realization." — Section 3.2.2

> "RoPE with linear attention ... keeps the norm of hidden representations unchanged, we can combine RoPE with linear attention by multiplying the rotation matrix with the outputs of the non-negative functions." — Section 3.3

## Concepts Introduced or Referenced
- [[transformer]] — Enhances encoder (BERT) and decoder (GPT) variants; modern decoder-only standard.
- [[positional-encoding]] — Evolution: sinusoid → learned → relative bias → **RoPE as unification** (absolute yet relative via rotation).
- [[self-attention]] — Modifies Q/K only; preserves scaled dot-product core, adds extrapolation and decay.
- [[pretraining]] — MLM pretraining gains translate to GLUE; Chinese pretraining.
- [[inference]] — KV-cache friendly, FlashAttention compatible, linear attention path for long context.

## Critical Assessment
- **Strengths**: Mathematically principled, single unified mechanism achieving both absolute and relative with zero parameters, provable decay, linear-attention ready — rare triple win; extremely influential (adopted by all open LLMs since 2022 via HuggingFace).
- **Weaknesses**: Decay derived under uniform frequency averaging, not per-head learned — empirical but not strongly tunable; extrapolation claims optimistic pre-2023 (later work shows need for base-frequency scaling YaRN, NTK); comparison baselines use 2018–2020 relative variants, not later ALiBi/KERPLE; linear-attention RoPE keeps denominator unchanged → weights not strictly probabilistic (authors acknowledge).
- **Relation to Image/Music Transformers**: RoPE's 1D rotation contrasts with **Image Transformer's 2D coordinate sinusoid/learned** (Section 3.1) and **Music Transformer's relative-distance embeddings via skewing** — later music uses RoPE-like relative logic but with memory-efficient global skew; RoPE supersedes those for sequence length generalization.
- **No contradiction**: Builds on [[source-attention-is-all-you-need]] sinusoid (same frequencies, new usage) and complements [[source-transformer-explainer]] visualization — can be visualized as rotating token vectors in 2D planes.

---

**Source:** RoFormer: Enhanced Transformer with Rotary Position Embedding by Jianlin Su, Yu Lu, Shengfeng Pan, Ahmed Murtadha, Bo Wen, Yunfeng Liu (Zhuiyi Technology) — <https://arxiv.org/abs/2104.09864>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
