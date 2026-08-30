---
type: source-summary
title: "Trustworthiness in LLMs — TrustLLM Benchmark"
summary: "Overview of Sun et al. (2024) \"TrustLLM: Trustworthiness in Large Language Models\" — a comprehensive trustworthiness survey and benchmark spanning 8 principles and evaluating 6 dimensions (truthfulness, safety…"
status: verified
visibility: public
author: "Sun et al. (2024) via DAIR.AI"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/trustworthiness-in-llms.en.mdx"
date-published: 2024-01-10
date-ingested: 2026-08-24
tags:
  - eval-safety
  - llm-fundamentals
key-concepts:
  - "[[trustworthiness-in-llms]]"
  - "[[hallucination]]"
  - "[[llm-bias]]"
key-entities:
  - "[[openai]]"
  - "[[anthropic]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-research-trustworthiness-in-llms
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Overview of Sun et al. (2024) "TrustLLM: Trustworthiness in Large Language Models" — a comprehensive trustworthiness survey and benchmark spanning 8 principles and evaluating 6 dimensions (truthfulness, safety…</p>
<p class="kb-provenance">Sun et al. (2024) via DAIR.AI, 2024-01-10. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/trustworthiness-in-llms.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
Overview of Sun et al. (2024) "TrustLLM: Trustworthiness in Large Language Models" — a comprehensive trustworthiness survey and benchmark spanning 8 principles and evaluating 6 dimensions (truthfulness, safety, fairness, robustness, privacy, machine ethics) across 16 mainstream LLMs over 30+ datasets. Reports proprietary vs open-source gaps, over-calibration trade-offs, and per-dimension key insights, plus a public leaderboard and evaluation kit.

## Key Takeaways
1. **8 dimensions, 6 benchmarked** — Principles cover truthfulness, safety, fairness, robustness, privacy, machine ethics (+2 additional); benchmark evaluates 6 with 30+ datasets.
2. **Proprietary leads but gap closing** — GPT-4 family generally outperforms open-source on trustworthiness; Llama 2 close without special moderation, though some open models are overly calibrated (reject benign prompts).
3. **Per-dimension insights:**
   - Truthfulness: hampered by noisy/outdated training data; external knowledge helps.
   - Safety: open-source lags on jailbreak/toxicity/misuse; balancing safety without over-refusal is hard.
   - Fairness: unsatisfactory stereotype recognition (GPT-4 ~65% accuracy).
   - Robustness: highly variable, especially out-of-distribution.
   - Privacy: awareness of norms varies; leakage observed on Enron Email dataset.
   - Machine ethics: basic moral understanding but fails on complex scenarios.
4. **Artifacts** — Public leaderboard (truthfulness table shown) and GitHub evaluation kit (https://github.com/HowieHwong/TrustLLM).

## Detailed Notes
### Benchmark Design
- TRUSTLLM figure shows overall benchmark; two companion screenshots define 8 dimensions and show truthfulness leaderboard.

### Findings (16 LLMs)
- GPT-4 and Llama 2 strong on stereotype rejection and adversarial resilience; open-source without moderation can approach proprietary.
- Over-calibration: some models sacrifice utility to maximize trustworthiness scores.

### Six-Dimension Insights
- Detailed per-dimension failure modes and improvement vectors (external knowledge for truthfulness, moderation tuning for safety, etc.).

### Resources
- Paper: arXiv 2401.05561; Leaderboard: trustllmbenchmark.github.io; Code: HowieHwong/TrustLLM.

## Concepts Introduced or Referenced
- [[trustworthiness-in-llms]] — multi-dimensional evaluation framework.
- [[hallucination]] (truthfulness) / [[prompt-injection]] / [[adversarial-prompting]] (safety) / [[llm-bias]] (fairness).
- [[retrieval-augmented-generation]] — external knowledge improves truthfulness.
- [[alignment]] / [[rlhf]] — over-calibration vs utility trade-off.

## Critical Assessment
Most comprehensive production-readiness evaluation source in the guide; bridges technical prompting with deployment risk. Strength: 30+ datasets and concrete leaderboard; identifies actionable gaps per dimension. Limitation: summary does not report aggregate trustworthiness ranking or per-model scores beyond qualitative notes. Complements [[hallucination]], [[llm-bias]], [[adversarial-prompting]], and [[alignment]] pages; introduces need for [[trustworthiness-in-llms]] dedicated concept and aligns with [[in-context-recall]] robustness concerns. No contradictions.

---

**Source:** Trustworthiness in LLMs — TrustLLM Benchmark by Sun et al. (2024) via DAIR.AI — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/trustworthiness-in-llms.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
