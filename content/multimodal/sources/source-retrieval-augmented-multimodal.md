---
type: source-summary
title: "Retrieval Augmented Multimodal Language Modeling (RA-CM3)"
summary: RA-CM3 (ICML 2023, arXiv 2211.12561v2 Jun 2023) is the first retrieval-augmented multimodal model that retrieves and generates both text and images – unifying text-centric RAG (Lewis et al. 2020, Karpukhin 2020 DPR…
status: verified
visibility: public
author: "Michihiro Yasunaga, Armen Aghajanyan, Weijia Shi, Rich James, Jure Leskovec, Percy Liang, Mike Lewis, Luke Zettlemoyer, Wen-tau Yih (Stanford/Meta/UW)"
source-type: paper
url: "https://arxiv.org/abs/2211.12561"
date-published: 2022-11-23
date-ingested: 2026-08-25
tags:
  - multimodal
  - rag
  - llm-fundamentals
key-concepts:
  - "[[multimodal-ai]]"
  - "[[retrieval-augmented-generation]]"
  - "[[image-generation]]"
key-entities:
  - "[[meta]]"
  - "[[stanford-university]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-retrieval-augmented-multimodal
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">RA-CM3 (ICML 2023, arXiv 2211.12561v2 Jun 2023) is the first retrieval-augmented multimodal model that retrieves and generates both text and images – unifying text-centric RAG (Lewis et al. 2020, Karpukhin 2020 DPR…</p>
<p class="kb-provenance">Michihiro Yasunaga, Armen Aghajanyan, Weijia Shi, Rich James, Jure Leskovec, Percy Liang, Mike Lewis, Luke Zettlemoyer, Wen-tau Yih (Stanford/Meta/UW), 2022-11-23. <a href="https://arxiv.org/abs/2211.12561">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
RA-CM3 (ICML 2023, arXiv 2211.12561v2 Jun 2023) is the **first retrieval-augmented multimodal model that retrieves and generates *both* text and images** – unifying text-centric RAG (Lewis et al. 2020, Karpukhin 2020 DPR, Borgeaud RETRO) with multi-modal generation. On top of CM3's causal-masked decoder (Aghajanyan et al. 2022, HTML-formatted ` <img alt=[text] src=[image]> ` sequences with VQGAN 1024 tokens), it adds: (a) **multimodal dense retriever** – frozen CLIP ViT-L/14 bi-encoder (text + image parts averaged, L2-normalized, MIPS via FAISS) + diversity strategy (Avoid Redundancy skip if score >0.9 + 20% Query Dropout), and (b) **retrieval-augmented generator** that prepends K∼Uniform{0,1,2} (train) retrieved multimodal docs as in-context examples and optimizes `L = L_main + α L_retr` (α=0.1) jointly – treating retrieved docs as extra batch without extra compute. Trained from scratch on 150M LAION pairs (watermark/unsafe/resolution filtered) for 5 days on 256 A100s (2.7B params, seq 4096, 3 docs max), RA-CM3 gains **12 FID (29.5→15.7) and 17 CIDEr (71.9→89.1)** over vanilla CM3 on MS-COCO, beats DALL-E 12B (28), Stable Diffusion 12.6, Parti 7.23, and Flamingo-3B 4-shot (85→89) **with <30% parameters/compute** of DALL-E – while unlocking faithful entity knowledge generation and multimodal in-context learning (controlled style, few-shot image classification 0.53→0.78 1-shot).

## Key Takeaways
1. **Unified retrieval is key**: Prior retrieval-multimodal work was single-modality – Re-Imagen (diffusion, text→image only), MuRAG/Flamingo (text generation only). RA-CM3 is first **arbitrary text/image interleave** retrieval+generation (Table1 taxonomy). Ablation (§C.3) shows retrieving **multimodal docs (caption+image) > image-only or text-only** – cross-modal contextualization matters.
2. **Retriever design**: Simple CLIP averaging works: split doc → CLIP_text ⊕ CLIP_image → avg → unit norm. Relevance + modality + diversity. Top-K MIPS candidate list then filtered for redundancy; query dropout (20% tokens dropped) adds regularization and improves PPL 3+ points.
3. **Generator loss joint optimization**: Unlike Lewis et al. RAG (α=0), RA-CM3 adds `α log p(m1..mK)` because transformer already computes logits for prepended docs. With 1024 tokens per image, α=0 wastes image compute. Empirically α=0.1 balances; larger hurts main task. Also retrieves via text *or* image part as query during training to avoid leaking full document → mimics inference (caption→image or image→caption).
4. **Training efficiency**: Fig.2 FID vs A100-hours: RA-CM3 lies well below AR baseline line (CM3, DALL-E, Parti) – better training efficiency due to model learning to *use* docs rather than memorize. Fair comparison controls total info (same 150M memory = training set) – gain is architectural, not data.
5. **Faithfulness & knowledge intensity**: Figs.3–4 show entity-rich captions ("Ming Dynasty vase", "Oriental Pearl tower", "French flag on moon", "Mount Rushmore + Japanese cherry") – RA-CM3 faithfully renders count/shape/painting where SD/vanilla CM3 hallucinates or defaults to common co-occurrence (US flag bias). Retrieval grounds tail entities.
6. **Multimodal in-context learning**: Because generator saw prepended relevant docs during training, at inference manually specifying in-context docs steers generation: controlled style (Fig.7 triangular wooden house + orange leaves → autumn house), image infilling/editing (Figs.5–6 recover skis/red jacket via red-jacket doc), and **k-shot image classification** via in-context labels (0.78 1-shot →0.9 8-shot vs 0.53 baseline, non-semantic "animal X/Y" to avoid prior).
7. **Scaling laws**: Appendix C.2 shows RA-CM3 scaling is steeper than non-retrieval; D.1 fair-compute discussion argues retrieval compute negligible vs generator; D.2 shows finetuning vanilla CM3 with retrieval underperforms training RA-CM3 from scratch; D.3 tunes K=2 as optimal.

## Detailed Notes

### Approach (§3)
- **Preliminaries**: RAG framework (R, G) + CM3 CM3 formatting + causal masking (mask spans → move to end with `<mask>`/`<infill>`) enabling both `Photo of cat:` → image and `Photo of <mask>: [image] <infill>` → caption.
- **Dense retriever**: Eq1 `r(q,m)=E_Q(q)^T E_M(m)` bi-encoder; CLIP ViT-L/14 frozen. Intrinsic eval C.1 shows CLIP retriever precision high on COCO.
- **Strategy**: Relevance (CLIP score), Modality (keep both), Diversity (skip >0.9 + query dropout). Final K=2 docs text+image each (i.e., two modalities' retrieval).
- **Generator**: Prepend `(m1..mK, x)`; loss `L = -log p(x|m) - α log p(m)`. Training uses text-or-image query; inference uses prompt only (no leakage). Retriever frozen, only generator trained.
- **Inference**: Prompt → retrieve → generator decodes continuation; for image generation sample 10, CLIP-rerank top-1; caption generation sample 32, perplexity-rerank.

### Experiments (§4)
- **Data**: LAION subset 150M after filtering (watermark>0.5, unsafe>0.5, <256²). VQGAN 1024 tokens per image. Memory = same 150M. FAISS Flat Index.
- **Impl**: 2.7B transformer, seq 4096 fits 3 docs, batch 16 ×256 GPUs (4096 seq total), model parallel 4 GPUs, Adam β1 0.9 β2 0.98, LR 1e-4 linear decay 1500 warmup, grad clip 1.0, 5 days.
- **Eval**: COCO caption→image FID (30K vs 30K) top-CLIP selection; image→caption CIDEr similarly perplexity-rerank; no finetuning.

### Main Results (§4.3)
- Tables 2/3: FID 15.7 vs vanilla 29.5, retrieval baseline 17.97, KNN-Diffusion 16.66, Parti 7.23 (but 20B vs 2.7B). CIDEr 89.1 vs 71.9, vs Parti 83.9, Flamingo 80B 103 (but 4-shot 80B vs 2-shot 2.7B).
- Fig.2 efficiency Pareto: RA-CM3 extrapolates below PartI line.

### Qualitative (§5)
- Knowledge-intensive, rare compositions, infilling, controlled generation, few-shot classification – all depend on in-context docs.

### Appendices
- C.1 CLIP retriever intrinsic (Recall@K); C.2 scaling laws; C.3 ablations for α, K, diversity, modality; D.1 fair compute accounting (retrieval FAISS <1% vs generator); D.2 finetune vs scratch; ethics/societal impact (A).

## Notable Quotes
> "Recent multimodal models ... store all their knowledge ... in the model parameters, requiring increasingly larger models and training data to capture more knowledge. To integrate knowledge in a more scalable and modular way, we propose a retrieval-augmented multimodal model."

> "Our resulting model, named Retrieval-Augmented CM3 (RA-CM3), is the first multimodal model that can retrieve and generate both text and images."

> "Retrieval augmentation allows the model to focus on learning how to use the retrieved documents in the context rather than fitting all the documents into the parameters of the model, speeding up the training process."

## Concepts Introduced or Referenced
- [[multimodal-ai]] — Reference retrieval-augmented early-fusion backbone later scaled to CM3Leon (adds SFT, licensed data) and contrasted with Transfusion's diffusion loss and LMFusion's sparse adaptation.
- [[retrieval-augmented-generation]] — Extension of RAG/DPR/RETRO to interleaved image-text; `L_main+αL_retr` joint loss, CLIP+MIPS pipeline, diversity via redundancy skip + dropout.
- [[image-generation]] — FID evaluation with CLIP reranking, knowledge-intensive faithfulness, controlled generation via in-context docs.
- [[pretraining]] — LAION filtering, HTML formatting, VQGAN tokenization, long-context (4096) training with multiple docs.
- [[in-context-learning]] — Multimodal ICL for generation and classification – first demonstration for *both* text and image generation.

## Critical Assessment
**Strengths**: Clear first – unifies two retrieval silos; simple yet effective CLIP-average retriever without training; `α` joint loss is elegant compute reuse; fair controls (same data as memory) isolate retrieval gain; demonstrates qualitative capabilities beyond metrics (faithfulness, controllability) that motivate later instruction-tuned CM3Leon; thorough ablations and fair-compute analysis anticipate reviewer concerns.

**Weaknesses**: 1024 tokens per image is heavy (later Transfusion 16–256 patches + U-Net); frozen CLIP retriever not fine-tuned – leaves retrieval quality on table; CLIP/perplexity reranking at eval inflates scores vs single-sample; no safety/ bias eval for retrieval (could retrieve harmful content); limited to 2.7B/150M scale – scaling to 7B/340M licensed left to CM3Leon.

**Contradictions / Synthesis**: Direct precursor to [[source-scaling-autoregressive-multimodal]] – CM3Leon scales RA-CM3 recipe (adds licensed data, SFT, CD-K, larger models) and shows retrieval still wins at 7B. Contrasts with [[source-scaling-laws-mixed-modal]] – retrieval is shortcut to synergy at small scale that law predicts only at 30B. LMFusion later shows sparsity alternative to retrieval for efficiency. Supports Ruder's efficiency argument (retrieval as sample-efficient) and HELM's retrieval-augmentation reading.

## Sources
- https://arxiv.org/abs/2211.12561 (v2 6 Jun 2023, ICML 2023)
- Aghajanyan et al. 2022 CM3, Radford 2021 CLIP, Karpukhin 2020 DPR, Lewis 2020 RAG, Guu 2020 REALM, Borgeaud 2022 RETRO, Schuhmann 2021 LAION, Ramesh 2021 DALL-E, Rombach 2022 Stable Diffusion, Chen 2022 Re-Imagen/MuRAG

---

**Source:** Retrieval Augmented Multimodal Language Modeling (RA-CM3) by Michihiro Yasunaga, Armen Aghajanyan, Weijia Shi, Rich James, Jure Leskovec, Percy Liang, Mike Lewis, Luke Zettlemoyer, Wen-tau Yih (Stanford/Meta/UW) — <https://arxiv.org/abs/2211.12561>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
