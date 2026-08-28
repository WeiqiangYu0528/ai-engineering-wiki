---
type: concept
title: "Data Curation for LLMs"
summary: Data curation is the end-to-end process that turns live web/code/paper services into training-ready tokens — live service → raw dump/crawl → transformation → filtering → deduplication → mixing → tokenization.
visibility: public
aliases:
  - "Data Engineering"
  - "Data Pipeline"
  - "Dataset Curation"
tags:
  - rag
  - llm-fundamentals
created: 2026-08-26
updated: 2026-08-26
status: draft
sources:
  - "[[source-cs336-lecture13-data-sources]]"
  - "[[source-cs336-lecture14-data-filtering]]"
  - "[[source-training-compute-optimal-large-language-models]]"
  - "[[source-llama-3-herd-of-models]]"
related:
  - "[[pretraining]]"
  - "[[evaluation]]"
  - "[[synthetic-data]]"
  - "[[tokenization]]"
  - "[[scaling-laws]]"
---

# Data Curation for LLMs

## Overview
**Data curation** is the end-to-end process that turns live web/code/paper services into training-ready tokens — **live service → raw dump/crawl → transformation → filtering → deduplication → mixing → tokenization**. In CS336 Lectures 13–14 [[source-cs336-lecture13-data-sources]] [[source-cs336-lecture14-data-filtering]] this pipeline is presented as the primary differentiator between frontier models: architectures and optimizers are now largely open (Llama 3 discloses fully), while datasets remain secret for competitive and copyright reasons. The pipeline is heuristic, long-tail, and scale-dependent — what works at 10B tokens may overfit or under-filter at 15T.

## Key Ideas
- **Not the Internet, but a filtered view.** Common Crawl (nonprofit 2007, 3–5B pages/month, 300B total, April 2026: 2.19B/372 TB) is a tiny slice of the ≥100 PB Google index. Dynamic apps (Discord, wandb), auth walls (Facebook/X/LinkedIn/NYT), robots.txt/ToS, Cloudflare/CAPTCHA, and the rising "decline of consent" (Longpre 2407.14933) mean most web is inaccessible. Training corpus = crawled subset after selection/politeness/re-visit policies (Apache Nutch) in WARC (raw HTTP) vs lossy WET.
- **Legal layer is license or fair use.** Everything fixed is automatically copyrighted (1709 Statute of Anne → 1976 US Act, $65 to sue, 75-year term); licenses (CC 2001) and bilateral deals (Google↔Reddit, OpenAI↔Shutterstock/StackExchange) or fair-use four-factor test excuse copying. Training has so far been deemed fair use in instance (Authors v. Anthropic/Meta 2025), pirating not (Anthropic $1.5B for Bibliotik copies) — but ToS can forbid even licensed use (YouTube).
- **Transformation is lossy and measurable.** HTML→text (trafilatura, resiliparse, jusText, lynx) and PDF→text (FinePDFs: recrawl+OCR via RolmOCR/VLM, Docling) directly affect downstream accuracy (DCLM WET vs WARC ablation). WARC preferred over pre-converted WET; for Nemotron-CC, jusText yielded more tokens than trafilatura.
- **Filtering = target-vs-raw classifier, must be fast.** Given large raw R and small ideal target T, learn `score(x) ≈ p(T|x)` or `p_T(x)` and keep ≥threshold. Generative (KenLM 5-gram vs Wikipedia in CCNet) vs discriminative fastText; examples: GPT-3 pareto-sampled linear classifier on WebText+Wiki+Books vs CC (`keep iff pareto(9) > 1-score`), LLaMA wiki-reference positives, phi-1 educational-value RF (distilled from GPT-4) lifting 1.3B HumanEval 12→17% in 36K steps. Dolma adds Jigsaw toxicity filtering. Scale-dependent threshold: longer training wants looser filter. Trend is toward model-based filtering (DCLM fastText on 200K OpenHermes-2.5+ELI5 vs 200K RefinedWeb → 240T pool→3.8T baseline beats heuristics), while early C4/Gopher/RefinedWeb/FineWeb/Dolma stayed rule-only to avoid bias.
- **Deduplication saves compute and prevents memorization.** Exact duplicates (forks, mirrors) vs near-duplicates (ToS boilerplate, template prose — C4 case 61,036× repeated wedding spam). Exact: hash-group via MurmurHash MapReduce (C4 3-sentence spans). Near: Jaccard `|A∩B|/|A∪B| ≥ t` approximated by MinHash (`Pr[h(A)=h(B)]=Jaccard` via permutation-min) and sharpened by LSH bands (`n=b·r`, collide if any band all match; `P_coll=1-(1-sim^r)^b`, threshold `(1/b)^{1/r}`; Lee 2021 uses 9000/20/450). Linear-time critical for Bloom-filter or MinHash pipelines.
- **Mixing is epoch-constrained.** Problem: weight sources (Wikipedia, CC, GitHub). Baselines: vibes, uniform, proportional (`p∝tokens`). Scarce HQ overweighted → excessive epoching (example: 10B HQ + 10T low at 0.5/0.5 for 1T train → 50 epochs HQ → overfit). Fixes: UniMax cap `p(s)·D_train ≤ C` (Feng 2304.09151 for multilingual α∈[0,1]) and regression mixing (Yeung 2407.01492 → sample Dirichlet mixtures, train small, fit proxy `p→loss`, optimize, hope small→large transfers). Simulated epoching (Xie 2501.11747) downsamples sources by `D_small/D_large` so small experiments feel large-run epoch pressure.
- **Historical lineage as filter evolution.** BERT BooksCorpus+Wiki (document sequences) → WebText Reddit ≥3 karma (8M/40GB) → CCNet KenLM → C4 heuristics (806GB/156B) → GPT-3 classifier (570GB/400B) → Pile 22 domains 825GB/275B → MassiveWeb manual rules (10.5TB) → LLaMA 1.2T (CCNet refs + C4+GitHub+arXiv+StackExchange) → RefinedWeb 600B/5T (Gopher+MinHash) → FineWeb 15T (95 dumps, URL/langID/PII anon) → Dolma 3T (Bloom) → DCLM 3.8T → Nemotron-CC 6.3T (1.1T HQ, ensemble distilled 340B educational classifier + synthetic rephrase/QA) → Stack v2 (3.1TB permissive, PR linearization, LLVM pairing) → CommonPile 8TB permissive-only probe (hard to compete without more tokens; license laundering ambiguity).

## How It Works
1. **Acquire raw.** Seed hundreds of millions URLs → Nutch crawl → WARC; or GitHub git-clone + GitHub Archive API, arXiv S3 bulk, Wikipedia periodic dumps. Respect polite crawl; handle dynamic/auth walls via shadow-library distinction (legally piracy).
2. **Transform.** WARC→text with chosen extractor (benchmark DCLM: trafilatura vs jusText vs resiliparse); PDFs via recrawl→OCR→cleanup; repos via file concat + metadata linearization. Preserve layout where possible.
3. **Filter.** Define target T (Wikipedia, ELI5, OpenHermes-2.5, or educational prompt with GPT-4) → train fast scorer (KenLM or fastText) → stochastic threshold (`pareto` or fixed). Apply language ID (fastText 176 langs, Dolma `p_en≥0.5`), quality, toxicity (Jigsaw) in one pass over R. Tune threshold per training budget.
4. **Deduplicate.** Exact: `groupby(hash)` keep one. Near: shingle into k-grams → `b·r` MinHashes → LSH band collision → Jaccard check → keep one. Parameter search `b,r` for desired threshold; run MapReduce.
5. **Mix.** Choose candidate `p` (Dirichlet), estimate loss at small scale (or simulated downsampled corpora), fit regressor, solve for `p*` under cap `C`. Validate via continued pretraining probe; for production, deliberately overtrain small models inference-optimal per [[scaling-laws]] (8B on 15T).
6. **Tokenize & pack.** Apply [[tokenization]] (BPE/tiktoken) and document-boundary masking; feed to [[pretraining]] with cosine schedule matched to `D`.

## Practical Implications
- **Invest in data before model tweaks.** At fixed compute, filtering/mixing ROI often exceeds architecture changes; always ablate extractor and classifier threshold before scaling. DCLM and Nemotron-CC show classifier-based filtering beats hand rules at 15T+ scale.
- **Design for scale-dependence.** Keep looser filter for longer trainings; simulate large-run epoching in small sweeps; cap scarce sources explicitly (UniMax) rather than vibes.
- **Measure what you filter out.** Log repetition counts (61K wedding spam in C4), PII, language distribution, and contamination overlap; line-level dedup and URL dedup complement doc-level MinHash.
- **Legal hygiene.** Assume everything copyrighted; prefer licensed dumps (Wikipedia CC-BY-SA, Gutenberg public domain) or negotiated deals; document fair-use rationale per dataset and respect ToS (YouTube) — lawsuits are active.
- **Post-training tie-in.** Curated pretraining data quality determines how much SFT must teach vs extract (see [[supervised-fine-tuning]] hallucination folklore); high-quality midtraining (600B repo-level) bridges pretraining and RLVR.

## Connections
- Feeds [[pretraining]] token budget and [[scaling-laws]] frontier (Chinchilla 20 tok/param vs FineWeb 15T overtraining) and [[evaluation]] (contamination, poisoning — Wikipedia talk-page injection 2302.10149).
- Realized by [[synthetic-data]] rephrasing/QA augmentation (Nemotron-CC) and synthetic SWE tasks in [[source-cs336-lecture14-data-filtering]].
- Uses [[tokenization]] and influences [[inference]] (long-context repo concat 600B).
- Partitioned from [[supervised-fine-tuning]]/[[rlhf]] stages by the pretrain→mid→post quality ramp (OLMo Dolmino/Tulu).

## Open Questions
- Can extractor+filter co-optimization replace separate heuristic stages — e.g., learned HTML linearized jointly with LM objective?
- What is the optimal classifier complexity vs speed trade-off at 36T (Qwen3) scale — does distilled 340B RM remain cost-effective?
- How to detect license laundering in permissive corpora like CommonPile without per-document provenance?
- Does aggressive synthetic rephrasing (Nemotron low-quality rewrite) cause distribution collapse at large synthetic ratios?

## Sources
- [[source-cs336-lecture13-data-sources]]
- [[source-cs336-lecture14-data-filtering]]
- [[source-training-compute-optimal-large-language-models]]
- [[source-llama-3-herd-of-models]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
