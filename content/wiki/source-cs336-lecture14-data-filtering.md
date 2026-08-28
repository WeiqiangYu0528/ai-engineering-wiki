---
type: source-summary
title: "CS336 Lecture 14 — Data II: Filtering, Deduplication, Mixing, Synthetic Data (Percy Liang)"
summary: Lecture 14 operationalizes Lecture 13's pipeline into implementable algorithms for transformation, filtering, deduplication, data mixing, and post-training synthetic generation — the implementation-heavy core of CS336's…
status: draft
visibility: public
author: "Percy Liang (Stanford CS336, Spring 2026)"
source-type: article
url: "https://cs336.stanford.edu/lectures/?trace=lecture_14"
date-published: 2026-05-13
date-ingested: 2026-08-26
tags:
  - llm-fundamentals
  - rag
key-concepts:
  - "[[data-curation]]"
  - "[[synthetic-data]]"
  - "[[pretraining]]"
  - "[[supervised-fine-tuning]]"
key-entities:
  - "[[stanford-university]]"
---

# CS336 Lecture 14 — Data II: Filtering, Deduplication, Mixing, Synthetic Data (Percy Liang)

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 2 of 23 figures on this page were not found in [https://cs336.stanford.edu/lectures/?trace=lecture_14](https://cs336.stanford.edu/lectures/?trace=lecture_14): `12.2`, `17.7%`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

Lecture 14 operationalizes Lecture 13's pipeline into implementable algorithms for **transformation, filtering, deduplication, data mixing, and post-training synthetic generation** — the implementation-heavy core of CS336's data unit. Percy poses raw vs target framing (given abundant raw R and small ideal target T, find T'⊂R ≈T) and instantiates it via fast classifiers (generative KenLM vs fastText), hash-based dedup (MurmurHash → MinHash/Jaccard → LSH bands), and mixture search (vibes/uniform/proportional → UniMax caps → regression-based RegMix → epoch-aware simulated epoching). Scale-dependence (longer trains want more lower-quality data) is emphasized. The second half showcases **mid-training and post-training synthetic pipelines** — OpenThoughts (1.2M QwQ-32B traces), SWE-smith/ZERO/rebench (50K–12M agentic coding tasks), Qwen 3 mid-training (600B repo-level, joint text+code, synthetic QA/trajectories) — arguing prompting capable teachers + careful task construction now drives coding/mid-training.

## Key Takeaways
1. **Transformation is lossy and matters.** HTML (trafilatura/resiliparse/jusText/lynx) vs WARC and DCLM WET vs WARC results show extractor choice changes downstream accuracy; FinePDFs rescrape→OCR (RolmOCR/VLM, Docling) but loses layout — same lesson as [[tokenization]].
2. **Filtering = target-vs-raw classifier, must be fast.** Framework: learn scoring from T vs R → threshold. Generative (p_T via KenLM n-gram) vs discriminative fastText p(T|x). Instances: CCNet (KenLM vs Wiki), GPT-3 (pareto-sampled linear classifier on WebText/Wiki/Books vs CC: `pareto(9) > 1-score`), LLaMA wiki-reference classifier, phi-1 educational-value RF on codegen embeddings (1.3B HumanEval 12.2→17.7% in 36K vs 96K steps). Model-based filtering trend (GPT-3/LLaMA/DCLM) vs deliberate rule-only (C4/Gopher/RefinedWeb/FineWeb/Dolma). Scale-dependent threshold — more training wants lower bar.
3. **Deduplication saves compute and memorization.** C4 product description repeated 61,036× exemplifies template boilerplate. Exact 3-sentence span dedup (MapReduce via MurmurHash grouping) handles mirrors/forks, but near-dup (ToS, formulaic, formatting) needs Jaccard (`|A∩B|/|A∪B|`) + MinHash (`Pr[h(A)=h(B)]=Jaccard`; permutation-min) + LSH sharpening (`b` bands × `r` rows; `P_coll = 1-(1-sim^r)^b`; threshold ≈(1/b)^{1/r}, Lee et al. 21 uses 9000/20/450). Linear-time critical.
4. **Mixing is epoch-constrained optimization.** Naive proportional/vibes overweights scarce HQ → 50× epoching and overfit (10B HQ vs 10T low in example: 0.5/0.5 → 50 epochs HQ). Fixes: UniMax (cap C epochs: `p(s)·D_train ≤ C`, α-interpolates uniform↔proportional for multilingual) and regression mixing (sample Dirichlet mixtures → train small → fit proxy → optimize → hope for transfer), with simulated epoching (downsample sources by `D_small/D_large` to make small runs see large-run epoching pressure).
5. **Post-training data = environment + task + teacher.** OpenThoughts 1.2M (27 sources, 16 samples/prompt, QwQ-32B teacher > R1), SWE-smith (LM-bug → 50K tasks/128 repos), SWE-Zero (no-exec world-model 300K/150K PRs → 12M with mini-coder pass@100=50.4, no-exec vs Hero exec), SWE-rebench (21K interactive/3.4K repos via 72B installer/rater, 450K PRs, 32K exec+120K non-exec). Stronger model ≠ better teacher; 16 samples/prompt helps, answer filtering didn't; filtering HQ small > large diverse.

## Detailed Notes

### Transformation
- Raw: HTML/PDF/directories → text; tools rule-based, WARC preferred over pre-converted WET; DCLM Fig shows extractor → LM accuracy delta.

### Filtering Formalism
- Raw R huge, target T small ideal. Score → keep ≥threshold. Types: generative (KenLM p_T), simple classifier (fastText). Apps: langID (176 langs, Wikipedia+Tatoeba+SETimes; Dolma p_en≥0.5), quality, toxicity (Jigsaw 2018 Wikipedia talk).
- Cases: OpenMathText (contains LaTeX, KenLM <15000 ppl or fastText 0.17/0.8 → 14.7B, 1.4B beats 20× data); phi-1 distilled RF; Dolma Jigsaw; scale-dependent filtering curve.
- Desiderata: generalize beyond T, run on R fast. Survey 2402.16827.

### Deduplication Deep Dive
- Two duplicate types, examples (Gutenberg mirrors, MIT license ToS, formulaic). Product-desc horror case (Amazon graffiti gas-mask). dedup benefits per Lee 2107.06499.
- Design space: item granularity (sentence/para/doc), matching (exact vs ≥k common shingles vs Jaccard≥t), action (rm all vs keep one). Linear-time via hashing.
- Hash tradeoff: SHA-256 (crypto, slow) vs DJB2/Murmur/CityHash (fast, collision-prone) — Murmur used.
- Exact: hash-group with `mmh3.hash`, MapReduce.
- Jaccard + MinHash permutation proof; estimation via 100 hashes (error <0.01).
- LSH: `n=b·r`, collide if any band all-r match; parameter sensitivity: ↑r sharpens right, ↑b shifts left; threshold derivation 20/450 → ~0.8+; collision ≈1-1/e at threshold.

### Data Mixing
- Viewer: marin token viewer; Pile 22 domains pie chart; desiderata: quality vs diversity vs epoching.
- Baselines: vibes, uniform (∝1), proportional (∝tokens). High-quality scarce → epoching trap demo.
- UniMax (Feng+ 2304.09151): uniform + cap C (from multilingual α=0 vs 1).
- Regression (Yeung+ 2407.01492 / 2602.12237): Dirichlet → eval loss → regression (linear/GBT) → optimum → transfer. Two hopes: accurate near optimum, small→large transfer.
- Scale-dependent subtlety + simulated epoching (Xie+ 2501.11747): small=10B/large=1T → ratio 1/100 downsampling to emulate.

### Post-training / Synthetic
- Recipe: 1 envs 2 tasks/prompts 3 teacher responses. OpenThoughts sources (StackExchange/NuminaMath/Chemistry etc.), pipeline figure; better teacher nuance.
- SWE family: SWE-smith bug-generation (Allen AI 2504.21798), SWE-Zero (AlienKevin 2604.01496, no-exec world-model, contamination guard removing future commits, mini-swe-agent), SWE-rebench-Qwen72B installer/rater (2505.20411), SWE-ZERO-12M (HF AlienKevin/SWE-ZERO-12M-trajectories).
- Qwen 3 mid-training preview (lecture keeps brief): GitHub 600B repo-level concat + PRs with RAG context, CommonCrawl joint text+code via LLM HTML parsing, synthetic (LM QA on web coding docs, agent trajectories), instruct/FIM data — bridges to Lecture 16 reasoning RL.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 2 passages in this section could not be located in the stored source ([https://cs336.stanford.edu/lectures/?trace=lecture_14](https://cs336.stanford.edu/lectures/?trace=lecture_14)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Filtering: train classifier (language id, quality, toxicity) for what good looks like. Deduplication: hashing scales to large datasets for fuzzy matching. Mixing: try mixtures at small scale, extrapolate to optimal." — summary slide

> "A lot of data work is domain-specific, looking at examples." — closing caution

## Concepts Introduced or Referenced
- [[data-curation]] — canonical pipeline chapter; L14 is its implementation reference.
- [[pretraining]] — filtering/mixing directly control pretraining token frontier (15T FineWeb vs 6.3T Nemotron).
- [[synthetic-data]] — SWE/OpenThoughts/Qwen mid-training pipelines instantiate the synthetic-data generation patterns in [[synthetic-data]].
- [[supervised-fine-tuning]] / [[evaluation]] — post-training data construction parallels SFT data and evaluation distribution design.
- [[embeddings]] — fastText/Jigsaw classifiers and KenLM n-grams as data-selection embeddings.

## Critical Assessment
Most algorithmic CS336 lecture: provides runnable Murmur/MinHash/LSH/RegMix arithmetic and scale-aware mixing insight missing from survey papers. Limitation explicit: regression mixing transfers poorly ("hope"), and synthetic SWE tasks still infrastructure-heavy (Docker, PR install). Connects cleanly to [[source-cs336-lecture13-data-sources]] (what to filter) and anticipates Assignment 4 (Common Crawl HTML→text, classifiers, MinHash leaderboard). For practitioners, simulated epoching and scale-dependent thresholds are immediately actionable; for researchers, LSH threshold calibration and teacher-quality vs student-accuracy remain open.

---

**Source:** CS336 Lecture 14 — Data II: Filtering, Deduplication, Mixing, Synthetic Data (Percy Liang) by Percy Liang (Stanford CS336, Spring 2026) — <https://cs336.stanford.edu/lectures/?trace=lecture_14>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
