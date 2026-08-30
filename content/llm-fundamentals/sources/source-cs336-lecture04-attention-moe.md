---
type: source-summary
title: CS336 Lecture 04 — Attention Alternatives and Mixture of Experts
summary: Lecture 04 (60-page PDF, Tatsu) tackles the $O(n^2 d)$ attention wall at long context and the MoE scale-out.
status: draft
visibility: public
author: "Tatsu Hashimoto"
source-type: article
url: "https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_04.pdf"
date-published: 2026-04-08
date-ingested: 2026-08-26
tags:
  - llm-fundamentals
  - inference
  - mlops
key-concepts:
  - "[[self-attention]]"
  - "[[transformer]]"
  - "[[mixture-of-experts]]"
  - "[[inference]]"
key-entities:
  - "[[stanford-university]]"
aliases:
  - wiki/source-cs336-lecture04-attention-moe
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Lecture 04 (60-page PDF, Tatsu) tackles the $O(n^2 d)$ attention wall at long context and the MoE scale-out.</p>
<p class="kb-provenance">Tatsu Hashimoto, 2026-04-08. <a href="https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_04.pdf">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
Lecture 04 (60-page PDF, Tatsu) tackles the **$O(n^2 d)$ attention wall** at long context and the **MoE scale-out**. Part 1 taxonomizes attention cost reducers: from "basic toolkit" (local+global, systems engineering) to **radical linear-time recurrences** (Linear Attention → RetNet → Mamba-2 → Gated DeltaNet) and their **hybrid attention** deployments (Minimax M1 7:1, Nemotron-3 3:1, Qwen3/Qwen-Next 3:1 GDN), plus **sparse adaption** (DeepSeek Sparse Attention DSA, post-hoc). Part 2 systematizes **Mixture of Experts**: why MoEs now dominate frontier (same FLOPs, more params → better loss; faster training; infrastructure parallelism), routing families (token-choice top-k dominant, expert-choice, global assignment), and recent fine-grained + shared-expert recipes (DeepSeek v3 256 experts/8 active + 1 shared, OlMoE, Mixtral, Grok). Saved to [https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_04.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_04.pdf) with text in [https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_04.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_04.pdf).

## Key Takeaways
1. **The linear-attention duality is the seed.** $\text{Attn}(Q,K,V)=\rho(QK^T)V$ costs $n^2 d$ via $QK^T$; setting $\rho=I$ gives $Q(K^T V)$ at $2 n d^2$ and RNN form $S_t = S_{t-1}+k_t v_t^T$, $y_t = q_t^T S_t$ — parallel-train ($n^2$) + recurrent-infer ($n$) duality. RetNet adds decay $γ S_{t-1}$; this is the conceptual parent of all SSMs below.
2. **Mamba-2 and Gated DeltaNet are data-dependent generalizations.** Mamba-2: $S_t = γ_t S_{t-1} + k_t v_t^T$, $γ_t=f(x_t)$; GDN: $S_t = γ_t(I-β_t k_t k_t^T)S_{t-1}+β_t k_t v_t^T$, adding no-input gate $β$ and key-directional erasure — links to fast-weight programmers / test-time training.
3. **Hybrids, not pure linear, win in practice (so far).** Empirical: 7:1 (Minimax M1), 3:1 (Nemotron-3), 3:1 GDN (Qwen3.5/Next) linear:full ratios show strong pref with linear context scaling; pure linear still trails full attention on recall-heavy tasks, but sparse adaption (DSA) can be *post-hoc* adapted after dense pretraining.
4. **MoEs are now frontier-default for scale.** Motivation: Shazeer MoE (2017) → Fedus Switch/GShard → DeepSeek v3: same training FLOPs, 4–8× more params, continuous loss improvement; competitive on dense-equivalent quality while training faster and sharding experts across devices.
5. **Routing is largely solved as token-choice top-k with engineering variants.** Dominant: top-k token-choice (Switch k=1, GShard/Grok/Mixtral k=2, DBRX/Qwen k=4, DeepSeek k=7); alternatives (expert-choice, RL routing, linear-assignment) remain niche. Recent pareto: many small fine-grained experts ($d_{expert}=d_{ff}/r$, $r=4$–$14$) + 1–2 always-on shared experts (DeepSeek/Qwen origin from DeepSpeed-MoE); ablations show fine-grained helps consistently, shared helps sometimes (DeepSeek positive, OlMoE null).
6. **Infrastructure cost is the remaining MoE barrier.** Complex multi-node all-to-all, heuristic/unstable load-balancing losses (aux-free in DeepSeek v3, aux-loss in Switch), and objective tuning keep dense attractive at smaller scale.

## Detailed Notes

### Attention alternatives

#### Why the wall matters
- Slide `understanding-the-impact-of-increasing-llm-context-windows` shows sub-quadratic needed beyond 32K—128K.

#### Basic toolkit (light coverage)
- Local+global patterns, systems tricks (FlashAttention-style tiling) — necessary but not "radical."

#### Linear attention → Mamba-2 → GDN progression
- **Linear attention (Shen 2018, Katharopoulos 2020):** identity $\rho$ reordering; duality noted as "very silly but surprisingly important."
- **Minimax M1:** 7 linear + 1 full per block, linear scaling demonstrated.
- **Mamba-2 generalization:** per-position $γ_t$ gating inside state — text: "a lot more words to justify, but mechanics is gating is good," preserves parallelizability (compute $γ$ in parallel via scan).
- **Gated DeltaNet:** hypothesis "selectively erase state in key direction," two gates $γ,β$; Qwen Next as shipping hybrid.

#### Hybrid performance & sparse adaption
- Controlled ablations scarce but hybrids show lower loss at small hybrid ratios than pure dense at same context.
- **DSA (DeepSeek Sparse Attention, v3.2/GLM-5):** lightweight indexer, post-hoc — attend sparsely, not to every token; significant gains with very light indexer.

### Mixture of Experts

#### What is a MoE
- Replace dense FFN with $E$ parallel FFNs + selector; FLOPs independent of $E$ (active $k$ experts per token). Fig from Fedus 2022.

#### Why popular now (four evidence slides)
1. Same FLOP → better loss (Fedus).
2. Faster training convergence (OlMoE curves).
3. Competitive vs dense at scale (frontier model tables: Qwen, DeepSeek, Mixtral parity).
4. Parallelizable across devices (expert parallelism).

#### What MoEs look like & what varies
- Common: MoE at FFN (attention-MoE rare: JetMoE, ModuleFormer). Axes: routing function, expert sizes, training objectives.
- **Routing overview:** token-chooses-expert vs expert-chooses-token vs global optimization matching.
- **Top-k detail:** Dai et al. 2024 reference for gating $g = \text{LogisticRegressor}(x)$ (DeepSeek V1/V2, Grok, Qwen) vs post-TopK softmax (Mixtral/DBRX/v3).
- **Alternative routing:** hashing baseline, RL-learned (Bengio 2013, now rare), linear assignment (Clark 2022) — covered as historical/niche.
- **Recent Chinese MoE recipes:** many small experts + shared — DeepSeek v1 64/6+2 $1/4$, Qwen1.5 60/4+4 $1/8$, DeepSeek v3 256/8+1 $1/14$ — tables shown; Llama 4 Maverick 128/1+1 $1/2$ outlier.

#### Ablations
- DeepSeek: more experts + shared → generally helps (small monotonic gains).
- OlMoE: fine-grained helps, shared null — disagreement flagged, model-dependent.

#### Expert routing setups table (key rows preserved)
- GShard 2048/2, Switch 64/1, Mixtral 8/2, DBRX 16/4, Grok 8/2, DeepSeek v1 64/6+2, Qwen1.5 60/4+4, DeepSeek v3 256/8+1, OlMoE 64/8, MiniMax 32/2, Llama4 128/1+1 — fine-grained ratio column.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 3 passages in this section could not be located in the stored source ([https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_04.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_04.pdf)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "$QK^TV = Q(K^TV)$ — This is very silly, but surprisingly important. We get from $n^2 d_k + n^2 d_v$ to $2 n d_v d_k$." — Linear attention slide

> "If one weights $S_{t-1}$ by $γ$, you get a RetNet." — linear attention footnote

> "You can increase the # experts without affecting FLOPs." — MoE definition (Fedus et al. 2022)

## Concepts Introduced or Referenced
- [[self-attention]] — $O(n^2)$ wall, linear/SSM alternatives, hybrid + sparse adaption, inference duality (train parallel / infer recurrent).
- [[mixture-of-experts]] — Central concept: definition, motivation, routing families, fine-grained/shared, load-balancing, expert parallelism.
- [[transformer]] — Dense baseline that attention alternatives and MoE FFN replace.
- [[inference]] — Recurrent inference mode for linear attention/Mamba (linear decode) and MoE expert parallelism for serving.
- [[pretraining]] — MoE trained with aux-free vs aux-loss balancing, same FLOP-better-loss trade-off.

## Critical Assessment
- **Strength:** Blends principled duality derivation with *shipping* hybrid ratios (7:1, 3:1) and a concrete routing table — rare for MoE surveys that are often purely conceptual.
- **Wiki gap it fills:** [[self-attention]] page lacks linear→Mamba→GDN progression and hybrid evidence; MoE has no dedicated concept page in prior wiki (only scattered mentions in Chinchilla/diagnostic) — this lecture provides the canonical survey to anchor both.
- **Limitations:** Slides admit "not many controlled ablations" for hybrids; MoE ablation conflict (DeepSeek vs OlMoE on shared experts) unresolved — signals recipe sensitivity rather than universal law. Stability/training heuristic coverage light vs Fedus/Zoph auxiliary-loss discussion.
- **Bridge:** Directly motivates Lecture 05's tiling/roofline (why hybrids help memory-bound decode) and Lecture 08+ parallelism (expert-parallel all-to-all).

---

**Source:** CS336 Lecture 04 — Attention Alternatives and Mixture of Experts by Tatsu Hashimoto — <https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_04.pdf>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
