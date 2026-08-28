---
type: source-summary
title: "Self-Consistency Improves Chain of Thought Reasoning in Language Models"
summary: The March 2022 (v4 Mar 2023) Google Research Brain paper by Wang et al. that proposes Self-Consistency — a drop-in replacement for greedy decoding in Chain-of-Thought Prompting prompting.
status: verified
visibility: public
author: "Xuezhi Wang, Jason Wei, Dale Schuurmans, Quoc Le, Ed H. Chi, Sharan Narang, Aakanksha Chowdhery, Denny Zhou (Google Research, Brain Team)"
source-type: paper
url: "https://arxiv.org/abs/2203.11171"
date-published: 2022-03-21
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - agents
  - inference
  - llm-fundamentals
key-concepts:
  - "[[self-consistency]]"
  - "[[chain-of-thought]]"
  - "[[decoding-strategies]]"
  - "[[thinking-models]]"
  - "[[scaling-laws]]"
key-entities:
  - "[[google-research]]"
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
---

# Self-Consistency Improves Chain of Thought Reasoning in Language Models

## Summary
The **March 2022 (v4 Mar 2023) [[google-research]] Brain paper** by Wang et al. that proposes **Self-Consistency** — a drop-in replacement for greedy decoding in [[chain-of-thought]] prompting. Instead of decoding the single most likely reasoning path, the method **samples a diverse set of reasoning paths** (temperature $T\!=\!0.5$–$0.7$, top-$k\!=\!40$, nucleus) and **marginalizes** over them by **majority vote** on final answers ($\arg\max_a \sum_i \mathbb{1}[a_i=a]$). Leveraging the intuition that correct answers are reachable via many distinct reasoning paths while errors diverge, self-consistency is **unsupervised, no training/verifier**, and yields striking gains on PaLM-540B, GPT-3 175B, LaMDA-137B and UL2-20B across arithmetic (GSM8K **+17.9%** to 74.4/78.0%, SVAMP **+11.0%**, AQuA **+12.2%**, MultiArith +23.9%) and commonsense/symbolic (StrategyQA **+6.4%**, ARC-challenge **+3.9%**, coin-flip OOD) benchmarks, achieving new SOTA while outperforming sample-and-rank, beam search and prompt-ensemble alternatives and remaining robust to sampling parameters and imperfect prompts.

## Key Takeaways
1. **Sample-and-Marginalize > Greedy:** Three steps: (1) prompt with Wei et al. CoT exemplars (8 for arithmetic, 4–7 for commonsense/symbolic), (2) sample $m\!=\!40$ reasoning paths $(r_i,a_i)$ via temperature/top-$k$, (3) majority vote over $a_i$. Correct reasoning paths — though linguistically diverse ("$60-20-15=25$" vs "$60-15=45, 45-20=25$") — converge on the same answer; incorrect paths scatter.
2. **Striking Gains Across Scales & Tasks:** On GSM8K, PaLM 540B CoT greedy 56.5% → self-consistency **74.4% (+17.9)**, GPT-3 code-davinci-002 60.1% → **78.0% (+17.9)**, LaMDA-137B 17.1% → **27.7% (+10.6)**, UL2-20B 4.1% → **7.3% (+3.2)**; SVAMP PaLM 79.0 → **86.6 (+7.6)**, AQuA 35.8 → **48.3 (+12.5)**. Commonsense/symbolic show similar lifts even though UL2 is weak absolute (e.g., StrategyQA PaLM 75.3 → 81.6). Sampling more paths (1→5→10→20→40) monotonically improves with diminishing returns.
3. **Helps When CoT Hurts:** On NLP tasks where CoT greedy *hurts* vs standard prompting (Ye & Durrett 2022: ANLI-R1 69.1→68.8, e-SNLI 85.8→81.0, RTE 84.8→79.1), self-consistency **recovers and exceeds standard**: ANLI-R1 **78.5**, e-SNLI **88.4**, RTE **86.3**, BoolQ **78.4**, HotpotQA **33.8/44.6 EM/F1** — making CoT reliably beneficial.
4. **Outperforms Alternative Decoders:** With equal sample budget on GPT-3: **sample-and-rank** (pick top log-prob sequence) improves only marginally, far below self-consistency (Figure 3); **beam search** on UL2-20B is worse and larger beam (40) even degrades (AQuA 10.2% vs self-consistency 26.9%) due to low diversity (Li & Jurafsky 2016); **prompt-order/multi-prompt ensembles** (+1.5–3% on GSM8K) and **model ensembles** underperform self-consistency (+10.6% on GSM8K). Weighted averaging by normalized probability equals majority vote; unnormalized or averaging divided by count is worse (Table 1) because model probabilities are miscalibrated and similarly close across samples.
5. **Robustness:** Insensitive to $T$ (0.5–0.7), $k$ (40), $p$ in nucleus, and to model scale (gain smallest for small models where arithmetic not yet emergent). Works with **imperfect prompts** (random numbers injected → greedy drops 17.1→14.9, self-consistency recovers to **23.4**), **equation-only reasoning** (5.0→6.5) and **zero-shot CoT** (Kojima 2022: PaLM 43.0→**69.2**). Consistency (% agreement) correlates strongly with accuracy, providing an **uncertainty signal** ("knows when it doesn't know").
6. **Simple & General:** No verifier (Cobbe 2021), no re-ranker (Thoppilan 2022), no fine-tuning; only requires fixed-answer tasks (marginalizable via `The answer is X` parsing — numeric for arithmetic, string for commonsense). Extensible to open-ended via consistency metric (agreement/contradiction). Compatible as "self-ensemble" atop any LLM and complementary to sampling+rank (can be combined).

## Detailed Notes

### Formalization
- Latent reasoning $r_i$ → answer $a_i \in \mathbb{A}$, sampled $m$ times. Aggregation: unweighted majority $\arg\max_a \sum_i \mathbb{1}(a_i=a)$ ≈ normalized weighted sum $\sum_{i:a_i=a} P(r_i,a_i|prompt,q)$ normalized by length (Eq.1: $\exp(\frac1K\sum_k \log P(t_k|...))$). Table 1 on PaLM-540B shows majority **74.4/99.3/48.3/86.6/80.7/88.7** vs normalized weighted sum **74.1/99.3/48.0/86.8/80.7/88.7** vs unnormalized 59.9/92.2/38.2 vs averaging 22.1 — so majority is optimal and simpler. Model is poorly calibrated (probabilities close), explaining why weighting doesn't help.

### Experimental Setup Details
- **Models:** UL2 20B (encoder-decoder, mixture-of-denoisers, open-sourced), GPT-3 Codex code-davinci-001/002 (175B), LaMDA 137B, PaLM 540B (780B tokens corpus). Few-shot, no training.
- **Prompts:** Same as Wei et al. 2022 for fair comparison; 8 arithmetic exemplars manual, 4–7 commonsense random train samples with manual CoTs; symbolic 2-letter/2-flip in-context testing 4-letter/4-flip OOD.
- **Sampling:** UL2/LaMDA $T=0.5,k=40$, PaLM $T=0.7,k=40$, GPT-3 $T=0.7$ no truncation; 40 paths × 10 runs averaged (std ≤0.5). Robustness sweeps over $T/k/p$ in Fig 4 / Appendix A.1.1.

### Failure Mode Illustration (Table 4)
- GSM8K example "Henry 60-mile bike trip" — greedy gives $60-20=40$ wrong; two sampled CoTs correctly compute $60-20-15=25$ via different arithmetic orders. Self-consistency picks 25 (majority).
- Commonsense example StrategyQA "Albany, Georgia most populous Albany?" — greedy hallucinates yes; sampled paths correctly recall Albany, NY > GA with population numbers.

### Scaling & Diversity
- Gains larger for larger models (+3–6% on UL2 vs +9–23% on LaMDA/GPT-3) — aligns with emergent reasoning ability threshold.
- Beam search using beam to generate each path performs worse than sampling because beams lack diversity.

## Notable Quotes
> "A complex reasoning problem typically admits multiple different ways of thinking leading to its unique correct answer."

> "Self-consistency leverages the intuition that if multiple different ways of thinking lead to the same answer, one has greater confidence that the final answer is correct."

> "Self-consistency is entirely unsupervised, works off-the-shelf with pre-trained language models, requires no additional human annotation, and avoids any additional training, auxiliary models or fine-tuning."

> "Self-consistency achieves new state-of-the-art levels ... including GSM8K (+17.9%), SVAMP (+11.0%), AQuA (+12.2%), StrategyQA (+6.4%) and ARC-challenge (+3.9%)."

## Concepts Introduced or Referenced
- [[self-consistency]] — Core method: diverse CoT sampling + majority marginalization.
- [[chain-of-thought]] — Base prompting that self-consistency replaces greedy decoding for; Wei et al. 2022 is the direct predecessor.
- [[decoding-strategies]] — Temperature/top-$k$/nucleus sampling vs greedy vs beam search; diversity is key.
- [[thinking-models]] — Anticipates inference-time scaling: sampling many reasoning paths as early test-time compute.
- [[scaling-laws]] — Gain correlates with model scale where reasoning is emergent.

## Critical Assessment
- **Strengths:** Elegant, zero-training, strong empirical sweep (4 models × 15 datasets) with controlled ablations (sampling strategies, prompt robustness, ensemble comparisons). Demonstrates that *decoding strategy* alone can rival training a verifier (Cobbe) or re-ranker (LaMDA). Method is general across natural-language and equation reasoning and zero-shot CoT. Majority vote simplicity is justified via probability comparison (Table 1) and uncertainty correlation.
- **Limitations:** Requires **40× decode cost** (40 samples) — linear latency/compute increase, prohibitive for 540B serving without batching; assumes **fixed answer set** with parseable `The answer is` format — not directly applicable to open-ended generation without consistency metric; gains smallest on already-easy tasks and small models where reasoning not yet emergent; evaluation is accuracy-only, no analysis of calibration after marginalization or of reasoning faithfulness (do correct answers still sometimes stem from flawed CoTs that happen to converge?).
- **Wiki Integration:** Fills the decoding-strategy gap between [[source-chain-of-thought-prompting-elicits-reasoning]] (greedy CoT) and [[decoding-strategies]] (sampling taxonomy). No contradictions; complements [[source-how-to-generate]] which covers Top-$p$/$K$ mechanics. Should be cited alongside chain-of-thought as the second-stage improvement before [[thinking-models]] RL scaling.

---

**Source:** Self-Consistency Improves Chain of Thought Reasoning in Language Models by Xuezhi Wang, Jason Wei, Dale Schuurmans, Quoc Le, Ed H. Chi, Sharan Narang, Aakanksha Chowdhery, Denny Zhou (Google Research, Brain Team) — <https://arxiv.org/abs/2203.11171>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
