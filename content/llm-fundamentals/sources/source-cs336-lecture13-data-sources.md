---
type: source-summary
title: "CS336 Lecture 13 — Data I: Sources, Datasets (Percy Liang)"
summary: Lecture 13 opens the CS336 data block (the "what data should we train on?" half after mechanics/systems/scaling) with a systematic inventory of where LLM data comes from and what legally/technically constrains it.
status: verified
visibility: public
author: "Percy Liang (Stanford CS336, Spring 2026)"
source-type: article
url: "https://cs336.stanford.edu/lectures/?trace=lecture_13"
date-published: 2026-05-11
date-ingested: 2026-08-26
tags:
  - llm-fundamentals
  - rag
key-concepts:
  - "[[pretraining]]"
  - "[[data-curation]]"
  - "[[synthetic-data]]"
  - "[[evaluation]]"
key-entities:
  - "[[stanford-university]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-cs336-lecture13-data-sources
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Lecture 13 opens the CS336 data block (the "what data should we train on?" half after mechanics/systems/scaling) with a systematic inventory of where LLM data comes from and what legally/technically constrains it.</p>
<p class="kb-provenance">Percy Liang (Stanford CS336, Spring 2026), 2026-05-11. <a href="https://cs336.stanford.edu/lectures/?trace=lecture_13">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
Lecture 13 opens the CS336 data block (the "what data should we train on?" half after mechanics/systems/scaling) with a systematic inventory of **where LLM data comes from and what legally/technically constrains it**. Motivation: data is the chief differentiator between models (architecture/training are now open — Llama 3 discloses fully — but datasets remain secret for competition/copyright reasons), and curation is long-tail human work unlike systems. Percy frames the three-stage pipeline — **pretraining → mid-training → post-training** — as a quality ramp (60T low-quality → small high-quality → chat/RL), illustrated with OLMo 2 / Dolmino / Tülu and the base-model vs instruct-model distinction (Qwen 3.5-397B now ships instruct-only). The rest traces **live web → crawl/dump → processed data**, then walks the historical dataset lineage from 2019 BERT/BooksCorpus through GPT-2 WebText, CCNet/C4, GPT-3, The Pile, MassiveText, LLaMA/RedPajama, RefinedWeb/FineWeb (15T), Dolma (3T), DCLM, Nemotron-CC (6.3T), The Stack (v1/v2), to the permissive-only CommonPile (8TB).

## Key Takeaways
1. **Live-service → raw dump → processed data is the canonical pipeline.** Raw HTML/PDF/repos are not training-ready; every dataset is a filtered view of Common Crawl, Wikipedia, GitHub, arXiv or curated corpora with explicit transformation→filtering→deduplication steps.
2. **Access is heavily constrained.** Technical blocks (dynamic JS apps, auth walls, robots.txt, Cloudflare, rate limits) plus rising ToS/robots.txt restrictions (the "decline of consent" arXiv:2407.14933) and copyright (everything fixed is copyrighted; threshold extremely low) make "train on the Internet" inaccurate — ~2.2B pages/372 TB per April 2026 crawl is a filtered subset of the ≥100 PB Google index.
3. **Legal path is license or fair use, but both are thin.** Licenses (Creative Commons 2001), bilateral deals (Google↔Reddit, OpenAI↔StackExchange/Shutterstock), and fair-use four-factor test (purpose, nature, amount, market effect — Authors Guild v. Google; NYT v. OpenAI 2023; Authors v. Anthropic/Meta 2024-25 summary judgements: training = fair use, pirating ≠). Terms-of-service can still forbid use even if copyright permits (YouTube).
4. **Dataset history is a filter-evolution story.** WebText (Reddit ≥3 karma, 8M pages/40 GB) → CCNet (KenLM vs Wikipedia) → C4 (heuristic rules, 806 GB/156B) → GPT-3 classifier (WebText+Wiki+Books vs CC) → The Pile (22 domains, 825 GB/275B, grass-roots Discord) → Gopher/MassiveWeb (manual rules + SafeSearch) → LLaMA (CCNet on Wiki references + Books3/arXiv/StackExchange, 1.2T) → RefinedWeb (trafilatura on WARC + Gopher rules + MinHash, 600B/5T) → FineWeb (95 dumps, 15T, URL/langID/heuristic + MinHash + PII anon) → Dolma (fastText lang, Gopher/C4, Jigsaw toxicity, Bloom-filter dedup, 3T) → DCLM (DCLM-pool 240T → 3.8T via fastText on OpenHermes-2.5/ELI5 vs RefinedWeb) → Nemotron-CC (jusText, ensemble distilled 340B educational classifier + DCLM, synthetic rephrasing/QA, 6.3T with 1.1T HQ).
5. **Code and permissive data remain open challenges.** The Stack (137M repos → 3.1 TB permissive via go-license-detector + MinHash/Jaccard; v2 adds issues/PRs/Software Heritage/LLVM pairing/PR linearization) and CommonPile (8TB permissive-only; 2025 Comma results show decent but hard-to-compete) probe whether permissive-only training can match unrestricted scale — license laundering and collection-license subtleties complicate the answer.

## Detailed Notes

### Motivation & Stages
- Data > architecture as moat; pre-foundation-model data work = heavy labeled annotation; now curation/cleaning with long-tail effort. Stages: 1 pretraining (raw web docs), 2 mid-training (high-quality enhance, e.g., 600B repo-level coding + long-context), 3 post-training (chat transcripts / RL). Trend: decreasing volume, increasing quality across stages.

### Raw Sources & Constraints
- Crawler (Apache Nutch → seed hundreds of Ms URLs → queue → fetch → hyperlink expansion; policies: selection/politeness (robots.txt)/re-visit). Crawls 3–5B pages/month, 300B so far. WARC (raw HTTP) vs WET (lossy text). HTML→text via trafilatura/resiliparse/jusText — conversion quality materially affects LM accuracy (DCLM Fig). FinePDFs (FineWeb): recrawl truncated PDFs, OCR via RolmOCR/VLM or Docling, heavy cleanup, layout loss.
- Constraints: dynamic content (Discord/wandb), auth (FB/X/LinkedIn/NYT paywalls), technical/legal. Shadow libraries: LibGen ~4M books, Sci-Hub ~88M papers — technically web, legally piracy/takedowns.
- Decline of consent (Longpre et al. 2407.14933): systematic rise in robots.txt/ToS blocks for C4/RefinedWeb/Dolma URLs.

### Intellectual Property
- 1709 Statute of Anne → 1976 US Copyright Act; original fixed work automatically copyrighted, $65 registration required to sue, 75-year term (Gutenberg public domain). Collections not original unless creative arrangement; expression vs idea (quicksort).
- Licenses = promise not to sue; CC, licensed deals. Fair use §107 four factors; Google Books snippets = fair use; Harry Potter plots/characters copyrightable despite no verbatim. For LMs: copying is already violation, training should be transformative (general wizard vs Harry Potter expression), market effect real for writers/artists.
- Lawsuits: NYT v. OpenAI (reproduction), Bartz/Graeber v. Anthropic ($1.5B pirating ≠ fair use even if training is, buying/scanning = fair use but too late), Kadrey/Silverman v. Meta (training = fair use in instance, torrenting pending).

### Specialized Sources
- **Common Crawl:** nonprofit 2007; selection/politeness/re-visit policies; dynamic URL duplication.
- **Wikipedia:** 2001, 67M articles/361 languages (May 2026), random-article, no original thought/notability, anyone edits (Steven Pruitt 5M edits), periodic dumps, poisoning vulnerability (2302.10149: inject pre-dump to bias iPhone sentiment 2010.12563).
- **GitHub:** 2008→MS 2018, 420M repos (28M public), git-clone + GitHub Archive API; Software Heritage aggregator 28.8M files; duplicates/forks, permissive-license training allowed.
- **arXiv:** 1991, ~3M submissions, light approval, author choice all-rights vs CC-BY, metadata CC0, bulk S3.

### Historical Datasets
- **BERT (1810.04805):** Wikipedia + BooksCorpus (Smashwords $0 books, 7K/985M words, taken down for ToS breach) — document sequences, not Billion-Word sentences.
- **GPT-2 WebText:** Reddit ≥3 karma outgoing links, 8M pages/40 GB; OpenWebText replica via Reddit dataset + fastText lang + near-dup removal.
- **CCNet (1911.00359):** paragraph dedup (light norm), fastText langID, KenLM-5g vs Wikipedia keep; tool+dataset, beats Wikipedia for low-resource (Urdu).
- **C4 (1910.10683):** April 2019 CC 1.4T → 806 GB/156B via heuristics (lines end punct ≥5 words, ≥3 sentences, dirty-word list, no `{`/`lorem ipsum`/terms-of-use, langdetect ≥0.99 English); 17 GB WebText-like bonus (+12 dumps).
- **GPT-3 (2005.14165):** CC + WebText2 + Books1/2 (mysterious) + Wiki = 570 GB/400B; CC quality classifier, fuzzy doc dedup incl. benchmarks.
- **The Pile (2101.00027):** 22 domains 825 GB/275B; Pile-CC via WARC+jusText, PubMed Central 5M NIH-mandated, arXiv LaTeX, Enron 500K emails, Gutenberg PG-19 (75K books), Books3 (196K Bibliotik, taken down), StackExchange 28 sites + metadata.
- **Gopher/MassiveText (DeepMind):** MassiveWeb + C4 + Books/News/GitHub/Wiki; manual quality rules (80% words alphabetic), SafeSearch toxicity; 10.5 TB total, trained 12% (300B).
- **LLaMA (2302.13971):** CommonCrawl+CCNet(Wiki references), C4, GitHub (permissive + manual), Wiki 20 langs, Gutenberg+Books3, arXiv (strip comments/macros), StackExchange (28 largest, score-sorted); 1.2T; RedPajama-v1 repro, SlimPajama 627B MinHashLSH.
- **RefinedWeb (2306.01116):** Falcon; web-only, trafilatura on WARC, Gopher rules, avoid ML filter, MinHash-5gram; 600B/5T pool.
- **FineWeb (HF):** 95 dumps replication→improvement, URL + langID p(en)>0.65, Gopher/C4/manual, MinHash, PII anon; **15T tokens**.
- **Dolma (2402.00159):** Reddit Pushshift 05-23 + PeS2o 40M S2 + C4/Gutenberg/Wiki; fastText (≥0.5), Gopher/C4, Jigsaw+rules toxicity, Bloom dedup; **3T**.
- **DCLM/DataComp-LM:** 240T pool → baseline 3.8T via fastText on 200K pos (OpenHermes-2.5/Eli5) vs 200K neg (RefinedWeb); outperforms prior filters.
- **Nemotron-CC (2412.x):** FineWeb/DCLM too aggressive (drop 90%); jusText > trafilatura for tokens; ensemble (340B-instruct educational scores distilled + DCLM) + LM rephrase low-quality / QA-generation high-quality; 6.3T (1.1T HQ) vs Llama 3 15T / Qwen3 36T.
- **The Stack (2211.15533):** 137M repos → 51B files (5B unique) → permissive + MinHash/Jaccard → 3.1 TB; Stack v2 adds issues/comments/PRs, Software Heritage, docs (PyPI/npm/devdocs), LLVM pairing for Nim, include GSM8K/Code contests/SO/arXiv/OpenWebMath. PR linearization with inline diff context.
- **CommonPile (2506.05209):** 8TB permissive probe; subtleties: license laundering, ODC-By ≠ per-item, synthetic-from-unlicensed ambiguous; Comma eval shows gap without more tokens.

## Notable Quotes
> "Data is the most important thing to get right in training language models." — motivation slide

> "Basically everything on the Internet are copyrighted." — threshold slide

> "Data does not fall from the sky. You have to work to get it. Live service → raw data → processed data." — summary

## Concepts Introduced or Referenced
- [[pretraining]] — dataset scale/quality determines base-model capability; L13 enumerates its source corpora.
- [[data-curation]] — live→dump→transform→filter→dedup→mix pipeline systematized here.
- [[synthetic-data]] — Nemotron-CC rephrasing/QA and CommonPile synthetic ambiguity preview [[synthetic-data]].
- [[evaluation]] — data poisoning, filtering ablations (DCLM WET, OpenHermes) tie to benchmark validity.
- [[tokenization]] — HTML→text lossiness parallels tokenization as early curation.

## Critical Assessment
Strongest CS336 lecture for data lineage: single trace connects legal theory (1709–2025 case law) to concrete processing knobs (trafilatura vs jusText, MinHash params, classifier positives). Caveat per slide: DCLM/Nemotron figures are from cited papers, not reproduced; CommonPile HQ vs scale trade-off remains unresolved and actively litigated, so fair-use guidance is instance-specific. Complements [[pretraining]] (token/mix context) and anticipates [[source-cs336-lecture14-data-filtering]] for pipeline formalism.

---

**Source:** CS336 Lecture 13 — Data I: Sources, Datasets (Percy Liang) by Percy Liang (Stanford CS336, Spring 2026) — <https://cs336.stanford.edu/lectures/?trace=lecture_13>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
