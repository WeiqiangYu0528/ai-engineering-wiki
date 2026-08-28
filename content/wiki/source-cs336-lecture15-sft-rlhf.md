---
type: source-summary
title: "CS336 Lecture 15 — After Pretraining: Mid/Post-training, SFT and RLHF (Tatsu Hashimoto)"
summary: "Lecture 15 (\"After Pretraining\") completes the GPT-3 → InstructGPT/GPT-3.5 arc: pretraining alone yields a document simulator, not an assistant."
status: draft
visibility: public
author: "Tatsu Hashimoto (Stanford CS336, Spring 2026)"
source-type: article
url: "https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_15.pdf"
date-published: 2026-05-18
date-ingested: 2026-08-26
tags:
  - fine-tuning
  - llm-fundamentals
key-concepts:
  - "[[supervised-fine-tuning]]"
  - "[[rlhf]]"
  - "[[direct-preference-optimization]]"
  - "[[synthetic-data]]"
key-entities:
  - "[[stanford-university]]"
---

# CS336 Lecture 15 — After Pretraining: Mid/Post-training, SFT and RLHF (Tatsu Hashimoto)

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 1 of 1 figures on this page were not found in [https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_15.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_15.pdf): `3.5`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

Lecture 15 ("After Pretraining") completes the GPT-3 → InstructGPT/GPT-3.5 arc: pretraining alone yields a document simulator, not an assistant. Tatsu operationalizes post-training as **imitation (SFT) → optimization (RLHF)**, with a candid note that modern data pipelines are "pretty sparse" public info (rich in Stiennon 2020 / Bai 2022 Anthropic HH, secret sauce thereafter). Part 1 dissects SFT data (FLAN → Self-Instruct/Alpaca → ShareGPT/Vicuna → OpenAssistant/WizardLM → Tulu 3/Nemotron/tool-use) down to token-level examples, surfacing style vs knowledge vs safety trade-offs, length biases, the Gekhman/Schulman hallucination nuance (training on unknown facts teaches citation behavior, not facts), and the midtraining/two-phase pretraining trick. Part 2 formalizes RLHF: imitation (`fit p(y|x)≈p*(y|x)`) vs optimization (`max E_p[R]`), the generation-verification (G-V) gap, pairwise data collection (crowdsourcing demographics, expert vs gig, LM-as-judge), PPO theory (policy grads → TRPO → clipped PPO) and DPO derivation (nonparametric closed-form reward → supervised log-loss on good/bad scaled by prediction error), plus overoptimization/mode-collapse warnings.

## Key Takeaways
1. **SFT teaches extraction, not injection.** Best gains come from eliciting pre-trained capabilities (grammar, knowledge, style) with small correct-behavior slices; fine-tuning on tail facts the model doesn't know often *increases* hallucination. Gekhman 2023 + Schulman 2023 folklore formalized via knowledge-extraction vs behavior-imprinting distinction (monopsony citation example: model learns *to cite*, not the cited fact).
2. **Visible SFT shifts: chattiness → detail → tool-use.** FLAN (benchmark tasks) → Alpaca (short instruct) → OpenAssistant (long, referenced) → Nemotron OpenCode (agentic JSON + `tool_calls` traces). Style (length/bullets), detail (references/knowledge), safety, and scale all matter; Dubois 2023 and Wang 2023 show length dominates preference evals but not benchmark scores.
3. **Safety is few-shot.** Llama 2 needed ~few thousand safety SFT; adding 500 Alpaca-style safety demos (Anthropic HH) already yields large safety gains — pattern: scenarios mined from users → HHH annotators → small SFT mix.
4. **Two-phase / midtraining solves SFT scale.** To avoid catastrophic forgetting when scaling instruct data: mix instruct into *pretraining* (phase 1), then short true SFT (phase 2). Common knowledge in industry, publicized via miniCPM/jetMoE — standard by 2025.
5. **RLHF is optimization because demos underrepresent preferences.** Summarization G-V gap (Zhang et al. 2023) — humans write worse summaries than they can choose — motivates `max_R`. Pipeline: SFT → reward model → PPO/DPO. Data: human pairwise (InstructGPT guidelines, Bard annotations, Outlier/ScaleAI modern split with compensation variance), demographic/annotator style skews (Santurkar 2023, Hosking 2024), LM-generated feedback (near-human agreement, rank corr. ≈ perfect; RLAIF/UltraFeedback used in Zephyr/Olmo/Tulu 3), self-training (Constitutional AI). Length effects reappear as RLHF side-effect.
6. **PPO vs DPO is stability vs sample-efficiency trade.** PPO (Ouyang/Stiennon): KL-penalized reward + pretraining mix, on-policy rollouts, clipped ratios — finicky but sometimes stronger (contingent). DPO: nonparametric assumption links `π*` and `r` in closed form (`r = β log π/π_ref + β log Z`, `Z` cancels under Bradley-Terry), yielding `ℒ_DPO = -log σ(β log π(y_w)/π_ref - β log π(y_l)/π_ref)` → pos-grad on good, neg-grad on bad scaled by implied-reward error — no reward model, no rollouts. Variants: SimPO (ref-free), length-normed DPO (Tulu 3). Ever-growing zoo, but conceptual core is MLE on pairwise rewards via policy reparameterization.

## Detailed Notes

### SFT Block (pp. 7–30)
- **Progression:** FLAN 2022 (Raffel — subject lines, AGNews, NLI with instruction framing), Self-Instruct/Alpaca (synthetic 52K from Davinci-003), ShareGPT/Vicuna (168K real user chats, longer), OpenAssistant (34K multilingual human with refs), WizardLM (Evol-Instruct), Tulu 3 (SFT+DPO+PPO mix, decontaminated), Nemotron (OpenCode-v1 agentic with JSON `AGENTS.md` tool traces), tool-use/agentic shift 2024-25.
- **Style experiment:** FLAN chattiness low; OASST detail high; Nemotron tool-use introduces `role: assistant + tool_calls` schema. Length + bullets characteristic; Wang 2023 model-length variance, Dubois 2023 length effect on AlpacaEval; benchmarks (MMLU/GSM) largely length-insensitive unlike preferences.
- **Knowledge & citation:** OASST monopsony example (Bivens & Mishel JEP 2013) illustrates citation as learnable style — model reproduces reference format without grounding.
- **Hallucination folklore:** `Schulman 2023` + `Gekhman+ 2024` (Does Fine-Tuning on New Knowledge Encourage Hallucinations?) — SFT on unknown distribution forces confabulation. Takeaway: curate SFT for *known* knowledge, use RL-style correctness feedback for tail.
- **Safety:** Deployment controls for misinfo/scams; sparse details (# ex Llama 2); pipeline: extract user scenarios → HHH annotation; 500-sample safety tune effective (Alpaca contamination example).
- **Training method:** Naïve SFT = gradient descent with masked loss on assistant tokens; two-phase trick (5-stage OLMo example: Dolmo pretrain → Dolmino mid → Tulu post) lets scale instruction data without forgetting; popular Chinese LMs popularized term "midtraining".

### RLHF Block (pp. 31–65)
- **Motivation:** Imitation fits empirical `p*`; optimization maximizes measurable `R(y,x)` — LM as policy, not distribution model. G-V gap figure (Zhang summarization: human-written vs human-preferred gap).
- **Overview triad:** (1) data — what pairwise feedback, quality concerns; (2) algorithms — PPO vs DPO; (3) side-effects — overoptimization, entropy collapse, calibration loss.
- **Data deep-dive:** Standard pairwise setup (prompt → two completions → preference vs tie); InstructGPT labeler guide (Stiennon Summarize-from-Feedback); Bard case; modern worker distribution (Outlier one platform; BI 2025 comp variance; expert annotation growth). Crowdsourcing pitfalls: quality/verification, AI-use contamination, ethics at scale, demographics shift (Santurkar opinion shift), annotator style heterogeneity (Hosking: some annotators consistent, others not — matters a lot). LM-judges: GPT-4 ≈ human inter-annotator, ρ≈1 system-level (Dubois); Frontier uses AI feedback (Zephyr UltraFeedback, Olmo, Tulu 3 via "thesequence" Lewis). Self-training: Constitutional AI (Bai).
- **Algorithms:** PPO recap (2017 Schulman; Five) — `∇ log π·R`, TRPO linearization, PPO clip `ε=0.2`; LM idealized as token-bandit with dense final reward (Zheng et al. 2023); innocuous Ouyang form `E[r - β KL] + γ pretrain`. DPO motivation (control-token SFT `[GOOD]/[BAD]`, preferred-only, RM→best-of-1024 as ablations → need optimization); derivation via nonparametric `π*` and implied reward → DPO objective; update = pos/neg-grad weighted by error; Llama pattern = DPO + expert iteration; SimPO & length-norm variants; empirical "trickiness" — PPO sometimes better depending on setup.
- **Guardrails:** Overoptimization (different curves for human vs noisy LM vs noiseless LM pref; Goodhart beyond threshold), mode collapse/entropy loss → no longer calibrated probabilistic model. Closing recap mantra.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 3 passages in this section could not be located in the stored source ([https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_15.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_15.pdf)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Instruction following is a remarkable form of control." — Bubeck et al. 2023 exemplar framing

> "Post-training information is pretty sparse! Rich information from the pre-ChatGPT competition... Poor information in modern times — open source: lots of distillation, not too public; closed source: secret sauce." — caveat slide

> "SFT works best when we are just extracting pre-training behaviors, not adding new ones. Adding (factually correct!) data can sometimes hurt."

## Concepts Introduced or Referenced
- [[supervised-fine-tuning]] — FLAN/Alpaca/OASST/Nemotron progression, masked loss, two-phase midtraining, chattiness/detail/tool-use taxonomy.
- [[rlhf]] — full PPO/DPO pipeline, pairwise data collection, G-V gap, annotator demographics, length bias, overoptimization.
- [[direct-preference-optimization]] — derivation from Stiennon RM objective, β-log-ratio reparameterization, SimPO/length variants.
- [[synthetic-data]] — synthetic SFT (Alpaca 52K) vs human (OASST) vs distilled tool traces as data-engineering choices.
- [[pretraining]] — document-simulator baseline vs assistant after SFT/RLHF; midtraining as pretraining+SFT blend.
- [[evaluation]] — preference vs benchmark dissociation (length matters for former, not latter).

## Critical Assessment
Strongest CS336 bridge from "what data exists" (L13/14) to "what behavior we impose" — makes explicit the folklore→mechanism link (citation style vs fact learning) and gives the cleanest whiteboard DPO derivation in the series (nonparametric → Bradley-Terry cancellation). Practical warning: length/preference vs benchmark divergence and reward-overoptimization curves caution against single-metric iteration. Complements [[source-cs336-lecture13-data-sources]]/[[source-cs336-lecture14-data-filtering]] for the pre-training side and sets up [[source-cs336-lecture16-rlvr]] (verifiable rewards as RLHF generalization). Limited reproducibility note per slide: closed-source DPO/PPO recipe details remain underspecified.

---

**Source:** CS336 Lecture 15 — After Pretraining: Mid/Post-training, SFT and RLHF (Tatsu Hashimoto) by Tatsu Hashimoto (Stanford CS336, Spring 2026) — <https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_15.pdf>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
