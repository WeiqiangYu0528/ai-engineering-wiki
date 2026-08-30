---
type: source-summary
title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
summary: Lewis et al. (FAIR, NeurIPS 2020, arXiv 2005.11401v4) introduce the general-purpose fine-tuning recipe for Retrieval-Augmented Generation (RAG) — a probabilistic hybrid that pairs a pre-trained seq2seq parametric memory…
status: draft
visibility: public
author: "Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela (Facebook AI Research; UCL; NYU)"
source-type: paper
url: "https://arxiv.org/abs/2005.11401"
date-published: 2021-04-12
date-ingested: 2026-08-25
tags:
  - rag
  - llm-fundamentals
  - prompt-engineering
key-concepts:
  - "[[retrieval-augmented-generation]]"
  - "[[embeddings]]"
  - "[[hallucination]]"
  - "[[tool-use]]"
key-entities:
  - "[[huggingface]]"
aliases:
  - wiki/source-retrieval-augmented-generation-rag
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Lewis et al. (FAIR, NeurIPS 2020, arXiv 2005.11401v4) introduce the general-purpose fine-tuning recipe for Retrieval-Augmented Generation (RAG) — a probabilistic hybrid that pairs a pre-trained seq2seq parametric memory…</p>
<p class="kb-provenance">Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela (Facebook AI Research; UCL; NYU), 2021-04-12. <a href="https://arxiv.org/abs/2005.11401">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 3 of 48 figures on this page were not found in [https://arxiv.org/abs/2005.11401](https://arxiv.org/abs/2005.11401): `41.2`, `44.9`, `41.8`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

Lewis et al. (FAIR, NeurIPS 2020, arXiv 2005.11401v4) introduce the **general-purpose fine-tuning recipe for Retrieval-Augmented Generation (RAG)** — a probabilistic hybrid that pairs a pre-trained seq2seq parametric memory (**BART-large 400M**) with a pre-trained dense non-parametric memory (**21M Wikipedia 100-word chunks, FAISS HNSW, DPR BERT bi-encoder**). Two variants marginalize latent documents: **RAG-Sequence** (one doc per whole output) and **RAG-Token** (different doc per token), jointly fine-tuned end-to-end by maximizing marginal likelihood (document encoder frozen, query encoder + generator trained). Without salient-span pre-training or retrieval supervision, RAG sets **SOTA on 3/4 open-domain QA** (NQ 44.5, WQ 68.0 EM), beats parametric-only BART by +2.6 BLEU on MS-MARCO NLG, is preferred for factuality (42.7% vs 7.1%) and specificity on Jeopardy question generation, and reaches within 4.3%/2.7% of pipeline SOTA on FEVER, while enabling **index hot-swap** (70% correct after reindex vs 12% mismatched) to update world knowledge without retraining — the foundational paper that established RAG as a standard architecture.

## Key Takeaways

1. **Two memories formalism (§2).** Retriever $p_\eta(z|x)\propto\exp(d(z)^Tdq(x))$, generator $p_\theta(y_i|x,z,y_{<i})$; marginalize top-K via MIPS: RAG-Sequence $p(y|x)\approx\sum_z p_\eta(z|x)\prod_i p_\theta(y_i|...)$, RAG-Token $\prod_i\sum_z p_\eta(z|x)p_\theta(y_i|...)$. End-to-end training via $-\sum\log p(y|x)$ without document supervision. Document encoder frozen (avoid index rebuild as in REALM). Decoding: Token via standard beam over $p'_\theta$, Sequence via per-doc beams + Thorough/Fast marginal.

2. **Strong QA results without specialized pre-training (§4.1, Table 1).** Open QA test EM: T5-11B+SSM 36.6/60.5, REALM 40.4, DPR 41.5, **RAG-Seq 44.5/68.0** (NQ/WQ), **RAG-Tok 44.1/66.1**. Shows generation (even extractive QA) beats extractive reader: benefits from docs that clue answer without verbatim span and can be correct when no doc contains answer (11.8% NQ). RAG-Tok vs Seq tradeoff: Seq better QA, Tok better Jeopardy (combining docs).

3. **Generation gains in factuality/diversity (§4.2–4.5).** MS-MARCO NLG (open, no gold): BART 38.2/41.6 → RAG-Tok 40.1/41.5, RAG-Seq **40.8/44.2** (+2.6). Jeopardy QGen Q-BLEU-1: BART 19.7 → RAG-Tok **22.2**; human factuality RAG 42.7% > BART 7.1%. Diversity distinct/total trigrams: Gold 89.6, BART 70.7/32.4, **RAG-Seq 83.5/53.8**. Hot-swap demo (82 leaders 2016↔2018): matched index **70%/68%** correct vs mismatched 12%/4% — non-parametric update without retraining.

4. **Retrieval ablations matter (§4.5 Table 6).** Learned retrieval >> frozen: NQ RAG-Seq 44.0 vs frozen 41.2 vs BM25 31.8; WQ 44.9 vs 41.8 vs 36.6. Exception FEVER where BM25 wins (entity-centric). More docs at test helps Seq monotonically (NQ) but Token peaks at 10. Documents are interpretable/provenance and human-writable (memory as raw text vs embeddings).

5. **FEVER (§4.4).** 3-way 72.5 vs SOTA 76.8* (with gold), 2-way 89.5 vs 92.2* (RoBERTa+gold) — close despite no evidence supervision; top-1 retrieved is gold article 71%, top-10 90%.

## Detailed Notes

### Architecture Details
- Pre-training: DPR retriever from Karpukhin 2020 trained on NQ+TriviaQA; BART pre-trained denoising; both loaded with knowledge, no extra pre-training needed.
- Index: Dec 2018 Wikipedia, 21M passages, DPR doc encoder embeddings, FAISS HNSW MIPS. $k\in{5,10}$ train, dev-tuned test.

### Experiments
- Open QA: NQ, TriviaQA, WQ, CuratedTrec, splits following Lee/Karpukhin, EM. WQ/CT init from NQ model.
- Abstractive QA: MS-MARCO NLG; Jeopardy: SearchQA 100k/14k/27k, Q-BLEU-1 + human (pairwise comparative, 452 pairs); FEVER: label accuracy.

### Decoding etc.
- Retrieval only via query encoder; Thorough decoding extra forward passes vs Fast approx $p_\theta(y|x,z_i)\approx0$ if not in beam.
- Analysis Fig2: per-token posterior shifts — $p(z_i|x,y_i,y_{-i})$ high for doc containing the generated entity phrase, but flattens after first token as parametric memory completes title.

### Related Work (§5)
- Unifies single-task retrieval successes; contrasts general-purpose seq2seq (T5/BART), learned retrieval (search/RL/latent REALM/ORQA), memory networks/entity embeddings (concurrent Févry), retrieve-and-edit (MT/semantic parsing).

### Broader Impact
- Positive: grounding, provenance, control, medical etc.; negatives: Wikipedia bias, misuse like GPT-2, job automation — countermeasures suggested.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 3 of 4 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2005.11401](https://arxiv.org/abs/2005.11401)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "We explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG) — models which combine pre-trained parametric and non-parametric memory for language generation."

> "RAG models set the state of the art on three open domain QA tasks, outperforming parametric seq2seq models and task-specific retrieve-and-extract architectures."

> "The non-parametric memory can be replaced to update the models' knowledge as the world changes."

> "Documents with clues about the answer but do not contain the answer verbatim can still contribute towards a correct answer being generated, which is not possible with standard extractive approaches."

## Concepts Introduced or Referenced

- [[retrieval-augmented-generation]] — Foundational definition: parametric (BART) + non-parametric (Wikipedia index + DPR), joint fine-tuning, Sequence vs Token formulations, marginalization.
- [[retrieval-augmented-generation|RAG]] — Alias for same; this is the canonical Lewis et al. 2021 paper.
- [[embeddings]] — DPR bi-encoder dense representations $d(z),q(x)$, FAISS MIPS index — early dense retrieval at scale.
- [[hallucination]] — Mitigation via grounding; RAG generates more factual/diverse language than parametric-only BART.
- [[tool-use]] — Retriever as tool; evidence aggregation vs edit; interpretable memory.
- [[in-context-learning]] — Contrasts with parametric-only; retrieval puts facts in context rather than weights.

## Critical Assessment

**Strengths:** Landmark unification — first to show a **single end-to-end recipe** works across QA, abstractive QA, QGen, and fact verification without task-specific pre-training or retrieval supervision. Careful ablations (frozen vs learned, BM25 vs dense, hot-swap, more docs) and diversity/human evals are exemplary. Code/demo via HuggingFace accelerated adoption into production RAG.

**Limitations / Gaps:** DPR doc encoder frozen → not fully end-to-end; document chunks are static 100-word — no chunking study (later “Advanced RAG” addresses). BM25 weak search, single FAISS index, no reranker. BART 400M is small vs modern LLMs; results predate long-context vs retrieval debates. No joint pre-training of retriever+generator from scratch (mentioned future work, later REALM/RETRO/Atlas).

**Contradictions / Notes vs. existing wiki:** Expands [[retrieval-augmented-generation]] which was draft-based on DAIR synthetic summary — this primary source replaces survey citations (Gao 2023) with the original probabilistic model. No contradictions; complements [[source-promptingguide-techniques-rag]] and [[source-promptingguide-research-rag]] but more authoritative. Hot-swap result directly informs [[rag-evaluation]] / [[rag-faithfulness]] freshness claims. Should be cited as primary source for RAG architecture figure (Lewis Fig.1).

---

**Source:** Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks by Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela (Facebook AI Research; UCL; NYU) — <https://arxiv.org/abs/2005.11401>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
