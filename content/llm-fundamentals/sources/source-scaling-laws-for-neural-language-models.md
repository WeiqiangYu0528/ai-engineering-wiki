---
type: source-summary
title: "Scaling Laws for Neural Language Models"
summary: The seminal January 2020 OpenAI research paper by Jared Kaplan et al. that established empirical power-law scaling laws governing autoregressive Transformer language models.
status: verified
visibility: public
author: "Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B. Brown, Benjamin Chess, Rewon Child, Scott Gray, Alec Radford, Jeffrey Wu, Dario Amodei (OpenAI)"
source-type: paper
url: "https://arxiv.org/abs/2001.08361"
date-published: 2020-01-23
date-ingested: 2026-08-24
tags:
  - llm-fundamentals
  - inference
key-concepts:
  - "[[scaling-laws]]"
  - "[[pretraining]]"
  - "[[transformer]]"
  - "[[in-context-learning]]"
key-entities:
  - "[[openai]]"
  - "[[anthropic]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-scaling-laws-for-neural-language-models
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The seminal January 2020 OpenAI research paper by Jared Kaplan et al. that established empirical power-law scaling laws governing autoregressive Transformer language models.</p>
<p class="kb-provenance">Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B. Brown, Benjamin Chess, Rewon Child, Scott Gray, Alec Radford, Jeffrey Wu, Dario Amodei (OpenAI), 2020-01-23. <a href="https://arxiv.org/abs/2001.08361">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
The seminal January 2020 [[openai]] research paper by Jared Kaplan et al. that established empirical **power-law scaling laws** governing autoregressive [[transformer]] language models. Spanning over six orders of magnitude in parameters, dataset tokens, and compute, the paper demonstrated that cross-entropy loss drops predictably as a power-law function of scale ($N, D, C$), while architectural details (width vs. depth, number of heads) exert negligible influence.

## Key Takeaways
1. **Three Fundamental Power Laws:**
   When not bottlenecked by other factors, test loss $L$ scales as a power-law:
   - **Model Size ($N$):** $L(N) \approx \left(\frac{N_c}{N}\right)^{\alpha_N}$ with $\alpha_N \approx 0.076, N_c \approx 8.8 \times 10^{13}$
   - **Dataset Size ($D$):** $L(D) \approx \left(\frac{D_c}{D}\right)^{\alpha_D}$ with $\alpha_D \approx 0.095, D_c \approx 5.4 \times 10^{13}$
   - **Training Compute ($C$):** $L(C) \approx \left(\frac{C_c}{C}\right)^{\alpha_C}$ with $\alpha_C \approx 0.050, C_c \approx 3.1 \times 10^8 \text{ PF-days}$
2. **Architectural Independence (Scale Over Shape):**
   - Performance depends primarily on scale ($N, D, C$).
   - Varying network depth vs. width, feed-forward dimension ratios, or attention heads within reasonable ranges produces minimal variance compared to parameter count.
3. **Sample Efficiency of Large Models:**
   - Larger models are vastly more sample-efficient than small models: they require fewer optimization steps and fewer data tokens to reach the same level of cross-entropy loss.
4. **Compute Allocation & "Convergence is Inefficient":**
   - Kaplan et al. initially proposed that given a fixed compute budget $C$, the optimal strategy is to scale model size aggressively ($N \propto C^{0.73}$) while scaling training tokens slowly ($D \propto C^{0.27}$), stopping significantly before convergence.
   - *(Note: This allocation was later refined by DeepMind's Chinchilla paper, which showed equal $1:1$ scaling $N \propto C^{0.5}, D \propto C^{0.5}$ due to suboptimal cosine learning rate schedule decay in Kaplan et al.).*
5. **Critical Batch Size ($B_{\text{crit}}$):**
   - The ideal training batch size scales as a power of the loss ($B_{\text{crit}}(L) \propto L^{-1/\alpha_B}$), allowing massive data parallelization (up to 1–2 million tokens per batch for frontier models) without diminishing returns.

## Detailed Notes

### Unified Scaling Equation
$$L(N, D) = \left[\left(\frac{N_c}{N}\right)^{\frac{\alpha_N}{\alpha_D}} + \frac{D_c}{D}\right]^{\alpha_D}$$
- Governs the trade-off between model parameters and dataset size.
- Overfitting penalty depends predictably on the ratio $N^{0.74} / D$: an $8\times$ increase in parameters requires only a $\approx 5\times$ increase in dataset tokens to maintain equivalent generalization.

## Notable Quotes
> "Language modeling performance improves smoothly and predictably as we appropriately scale up model size, data, and compute... We observe no signs of deviation from these trends." — Kaplan et al.

> "Within wide ranges, performance depends very weakly on other architectural hyperparameters such as depth vs. width." — Kaplan et al.

## Concepts Introduced or Referenced
- [[scaling-laws]] — Foundational power-law formulations across parameters, data, and compute.
- [[pretraining]] — Compute-optimal token and parameter allocation.
- [[transformer]] — Architecture scaling invariants and depth/width trade-offs.
- [[in-context-learning]] — Direct theoretical foundation that motivated training GPT-3 (175B).

## Critical Assessment
- **Historical Milestone:** Provided the scientific and empirical justification for the massive capital expenditure required to scale from GPT-2 (1.5B) to GPT-3 (175B).
- **The Chinchilla Revision:** The finding that $N$ should scale faster than $D$ ($N \propto C^{0.73}, D \propto C^{0.27}$) arose because Kaplan et al. held the learning rate schedule constant rather than tuning the cosine decay to the exact budget, leading to model undertraining.

---

**Source:** Scaling Laws for Neural Language Models by Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B. Brown, Benjamin Chess, Rewon Child, Scott Gray, Alec Radford, Jeffrey Wu, Dario Amodei (OpenAI) — <https://arxiv.org/abs/2001.08361>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
