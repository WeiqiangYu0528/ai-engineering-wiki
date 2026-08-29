---
type: source-summary
title: "Scaling Autoregressive Multi-Modal Models: Pretraining and Instruction Tuning (CM3Leon)"
summary: CM3Leon (pronounced Chameleon, FAIR Sep 2023, arXiv 2309.02591, 7B/760M/350M, 2.4T tokens) is the retrieval-augmented, token-based decoder-only multi-modal LM that proved autoregressive image generation can beat…
status: draft
visibility: public
author: "Lili Yu, Bowen Shi, Ramakanth Pasunuru et al. (FAIR, YerevaNN)"
source-type: paper
url: "https://arxiv.org/abs/2309.02591"
date-published: 2023-09-05
date-ingested: 2026-08-25
tags:
  - multimodal
  - llm-fundamentals
  - fine-tuning
key-concepts:
  - "[[multimodal-ai]]"
  - "[[image-generation]]"
  - "[[instruction-tuning]]"
key-entities:
  - "[[meta]]"
aliases:
  - wiki/source-scaling-autoregressive-multimodal
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">CM3Leon (pronounced Chameleon, FAIR Sep 2023, arXiv 2309.02591, 7B/760M/350M, 2.4T tokens) is the retrieval-augmented, token-based decoder-only multi-modal LM that proved autoregressive image generation can beat…</p>
<p class="kb-provenance">Lili Yu, Bowen Shi, Ramakanth Pasunuru et al. (FAIR, YerevaNN), 2023-09-05. <a href="https://arxiv.org/abs/2309.02591">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary
CM3Leon (pronounced Chameleon, FAIR Sep 2023, arXiv 2309.02591, 7B/760M/350M, 2.4T tokens) is the **retrieval-augmented, token-based decoder-only** multi-modal LM that proved autoregressive image generation can beat diffusion when scaled with **text-LM recipes**: large-scale **retrieval-augmented CM3 pretraining** on licensed **340M Shutterstock** image-text pairs plus **multi-task SFT instruction tuning** on diverse interleaved tasks. Using Make-A-Scene VQ tokenizer (256²→1024 tokens, 8192 codebook, BPE 56k + `<break>` modality token) and CM3 causal-masked infilling objective (with retrieval docs prepended, no loss up-weighting, masking barred across `<break>`), CM3Leon-7B reaches **SOTA zero-shot MS-COCO FID 4.88** (with 2 retrieved docs; 10.82 zero-retrieval, 5.78 with 1) – outperforming Parti (7.23), Stable Diffusion (12.6), RE-IMAGEN (5.25), DALL·E with **5× less compute**, and scales log-linearly vs A100 hours (Fig.2). Post-SFT it shows unprecedented controllability (text-guided edit, ControlNet-grounded, spatially-grounded, how-to-write) and competitive **image→text (CIDEr 61.6, VQAv2 47.6, VizWiz 37.6 > Flamingo-9B)** despite only ~3B text tokens. A self-contained **contrastive decoding CD-K** (k-th-max relaxation of Li et al. 2022) complementary to CFG yields further FID gains. It is the licensed-data, retrieval-efficient, instruction-tuned predecessor to Chameleon/Transfusion in [[multimodal-ai]].

## Key Takeaways
1. **Retrieval-augmented pretraining is the efficiency lever**: Dense CLIP ViT-B-32 retriever (text+image averaged) fetches 2 relevant diverse multimodal docs per sample (filtered relevance ≤0.9 + 20% query dropout to avoid duplicates); 3 retrieved per pair → 4× tokens. Training over retrieval-augmented context lets model *use* world knowledge rather than memorize it – explains 5× compute advantage over Parti/DALL·E; ablations show diversity matters more than relevance alone. Inference can also retrieve (0/1/2 docs sweep shows monotonic FID drop).
2. **Architecture & objective refinements over RA-CM3**: Simplified CM3: `<break>` modality switch token, masking barred across `<break>` (prevents mid-image start), remove RA-CM3's up-weighting of main pair (hurts zero-shot), decoder-only Llama-like (no bias, no dropout, no learned LN, seq 4096, truncated normal init σ0.006). Trained 350M/1.4T, 760M/1.9T, 7B/2.4T tokens (Fig.3 PPL steadily drops, no saturation; 760M/7B resumed after epoch with small LR rise).
3. **Decoding matters as much as pretraining**: Compares temperature vs TopP + CFG vs **CD-K** (contrastive `log p_exp/p_ama` where exp=text-conditioned, ama=mask-conditioned, with `V = {w: p_exp(w) ≥ α·kmax_k p_exp}` – k-th largest relaxes strict α·max). Fig.4: CD-K competitive with CFG, **complementary** – combined CFG+CD-K + CLIP rerank (8 samples/prompt) minimizes FID while each alone stagnates; optimal CFG weight invariant across scales.
4. **SFT instruction tuning unlocks controllability**: Follows OPT-IML multi-task tuning (Iyer et al. 2022) – interleave any text/image tokens in input/output, same CM3 objective. Tasks: image generation – text-guided editing (600k InstructPix2Pix filtered), image-to-image grounding (7M ControlNet canny/hed/sketch/pose), spatial grounding (3M COCO/OpenImages/Object365 boxes → tokens), how-to-write (200k OCR); conditional text generation – 8 VQA/caption tasks (COCO, Flickr30k, Paragraph, Localized Narratives, VQAv2, VizWiz, OKVQA, ScienceQA multi-templates). Prefix per task (e.g., "Edit the image..."). Results: SOTA control (Fig.6 pose-faithful diverse prompts), long-form captioning & reasoning (Fig.7).
5. **Quantitative SOTA**: Table1 zero-shot COCO FID-30K (CLIP rerank top-1 of 8): CM3Leon-7B 4.88 (2 docs) vs Parti-20B 7.23, Re-Imagen-3.6B 5.25, Muse-3B 7.88, SD 12.6; Table2 zero-shot VQA/caption vs Flamingo-9B/OpenFlamingo – notably **VizWiz 37.6 >28.8** despite 30× less text data, showing retrieval compensates. Latency/throughput appendix shows generation cost dominated by 1024 image tokens vs diffusion's iterative steps.
6. **Responsible licensed data**: Entirely Shutterstock-licensed (340M images) – avoids attribution/ownership debate while still beating 400M–5B web-scraped baselines, proving data quality > quantity when coupled with retrieval.

## Detailed Notes

### Pretraining (§2)
- **Tokenizer**: Make-A-Scene (Gafni et al. 2022a) 8192-code, plus BPE 56k trained on Zhang et al. 2022 OPT data, `<break>` modality delimiter visualized Fig.8. Retrieval: CLIP averaging (Wang et  al. 2023? Actually Yasunaga pipeline).
- **Objective**: CM3 masked infilling (e.g., `"Image of <mask>: [image] <infill> a chameleon"`) with standard NLL; retrieval docs prepended as context (Fig.9). No weighting → better zero-shot continuation from `<eos> text <break>`.
- **Model**: Metaseq, Aim tracking, Adam, LR/batch from Aghajanyan scaling laws – stable smooth PPL (Fig.3).
- **Compute**: Fig.2 log-FID vs log-GPU hours – slope steeper than diffusion/parti lines, showing better scaling coefficient.

### Text→Image Results (§3)
- **CFG**: `logits_cf = logits_uncond + α_c (logits_cond - logits_uncond)`, unconditional = `<mask>` token stream (benefit of CM3 training, no finetune needed).
- **CD-K**: adaptation where `p_exp = p(·|text)`, `p_ama = p(·|<mask>)`, constraint `V` relaxed to k-th max to avoid greedy collapse; `α` threshold tuned.
- **Ablation**: TopP+CFG and CD-K similar alone, combined continues dropping FID as samples increase (important for reranking efficiency).

### SFT (§4)
- **Data breakdown**: App E2 Table 5 templates; image tasks need task prefixes; text tasks need multi-template robustness.
- **Decoding during SFT**: separate CFGs – image 1.5, text 7.5 for editing to preserve source fidelity; single 3 for pose.
- **VQA results**: SFT-CM3Leon 7B zero-shot CIDEr 61.6 vs Flamingo 79.4 (gap due to 3B vs 100B text tokens), but VizWiz win and competitive VQA2 47.6 vs 51.8 shows instruction tuning sample efficiency.

### Related Work (§5)
- Positions against diffusion (Saharia, Rombach), retrieval-diffusion (Chen 2022 Re-Imagen), AR token (Ramesh, Yu PartI), non-AR Muse (Chang), and RA-AR Yasunaga – CM3Leon is first retrieval+s scale+SFT.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 3 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2309.02591](https://arxiv.org/abs/2309.02591)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "CM3Leon is the first multi-modal model trained with a recipe adapted from text-only language models, including a large-scale retrieval-augmented pretraining stage and a second multi-task supervised fine-tuning (SFT) stage."

> "CM3Leon achieves state-of-the-art performance in text-to-image generation with 5x less training compute than comparable methods (zero-shot MS-COCO FID of 4.88)."

> "Retrieval augmentation allows the model to focus on learning how to use the retrieved documents in the context rather than fitting all the documents into the parameters of the model."

## Concepts Introduced or Referenced
- [[multimodal-ai]] — Retrieval-augmented early-fusion token baseline; licensed-data viability proof; CM3 infilling objective evolution toward Chameleon/Transfusion.
- [[image-generation]] — CLIP rerank, CFG/CD-K, VQ token decoding, FID/throughput trade-offs vs diffusion.
- [[instruction-tuning]] — Multi-task SFT across 8 vision-language tasks; instruction controllability for editing/grounding – extends OPT-IML to interleaved vision.
- [[pretraining]] — Retrieval-augmented pretraining, query dropout diversity, sequence 4096, batch/LR from scaling laws.
- [[retrieval-augmented-generation]] — Multimodal retrieval (CLIP + MIPS) prepended as in-context docs; RA-CM3 lineage.

## Critical Assessment
**Strengths**: Strong systems contribution – proves AR can be *more* compute-efficient than diffusion when retrieval+SFT transfer text-LM best practices; clean ablations isolating retrieval and decoding contributions; responsible licensed-data narrative without performance sacrifice; SFT controllability demos (editing/grounding) go beyond FID toward practical product tasks; decoding innovation CD-K is self-contained (no external scorer).

**Weaknesses**: Zero-shot FID still relies on CLIP reranking 8 candidates – inflates vs pure single-sample reporting; retrieval at inference requires memory bank (150M LAION-like) – not detailed for licensed-only reproduction; comparison FID-30K mixes retrieval vs non-retrieval and licensed vs web data – not strictly apples-to-apples; SFT 7B not evaluated on held-out harmful/bias slices (safety omitted); no comparison to Transfusion's diffusion loss which later shows 3× efficiency over this quantization.

**Contradictions / Synthesis**: Builds on [[source-retrieval-augmented-multimodal]] (RA-CM3) and scaling laws from [[source-scaling-laws-mixed-modal]] – retrieval is the practical antidote to the competition barrier at modest scale. PS. Later [[source-chameleon]] shows retrieval-free token models can match with 9.2T tokens – CM3Leon shows retrieval short-circuits need for that scale. Its licensed-data success challenges "scale web data at all costs" – quality + retrieval > quantity. Prefigures Chameleon/Transfusion SFT balancing lessons and LMFusion's frozen-text efficiency.

## Sources
- https://arxiv.org/abs/2309.02591 (v1 5 Sep 2023, 31 pages + appendices)
- Yasunaga et al. 2022 RA-CM3, Aghajanyan 2023 scaling laws, Gafni 2022 Make-A-Scene, Li et al. 2022 Contrastive Decoding, Iyer et al. 2022 OPT-IML, Schuhmann 2022 LAION (but Shutterstock used)

---

**Source:** Scaling Autoregressive Multi-Modal Models: Pretraining and Instruction Tuning (CM3Leon) by Lili Yu, Bowen Shi, Ramakanth Pasunuru et al. (FAIR, YerevaNN) — <https://arxiv.org/abs/2309.02591>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
