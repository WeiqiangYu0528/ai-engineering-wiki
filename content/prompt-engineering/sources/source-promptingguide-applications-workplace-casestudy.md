---
type: source-summary
title: "Graduate Job Classification Case Study — Prompt Engineering Guide (DAIR.AI) Applications"
summary: Production case study (Clavié et al. 2023 https://arxiv.org/abs/2303.07142) on prompt engineering for medium-scale entry-level job classification (is this a true graduate job?).
status: verified
visibility: public
author: "Clavié et al., 2023 (via DAIR.AI)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/workplace_casestudy.en.mdx"
date-published: 2023-03-15
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - eval-safety
key-concepts:
  - "[[applications-overview]]"
  - "[[prompt-engineering]]"
  - "[[prompt-optimization]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-applications-workplace-casestudy
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Production case study (Clavié et al. 2023 https://arxiv.org/abs/2303.07142) on prompt engineering for medium-scale entry-level job classification (is this a true graduate job?).</p>
<p class="kb-provenance">Clavié et al., 2023 (via DAIR.AI), 2023-03-15. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/workplace_casestudy.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
Production case study (Clavié et al. 2023 https://arxiv.org/abs/2303.07142) on **prompt engineering for medium-scale entry-level job classification** (`is this a true graduate job?`). Benchmarks GPT-3.5 (`gpt-3.5-turbo`) vs strong DeBERTa-V3 and older GPT-3 variants. Key results: LLM beats all baselines including DeBERTa-V3; 3.5 > GPT-3 family but template adherence drops; prompt iteration lifts F1 from **65.6 → 91.7** (Precision 61.2→86.9, Recall 70.6→97). Ablates 14 prompt mods (CoT, sys/[https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/workplace_casestudy.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/workplace_casestudy.en.mdx) instruction, mock acknowledgment, repetition, strict/loose templates, "right conclusion," extra info, naming, positive feedback) with full precision/recall/F1/stickiness table and notes: few-shot CoT worse than zero-shot on this non-expert task; strict templating hurts accuracy; small tweaks (naming +0.6 F1) compound massively.

## Key Takeaways
1. **Prompt >> model:** 26-point F1 lift (65.6 baseline "classify this job" → 91.7 fully engineered) — biggest driver is *proper instruction + repetition of key points*.
2. **Zero-shot > few-shot CoT here:** On non-expert classification, CoT (F1 78.4) and Zero-CoT (81.4) trail instruction-optimized zero-shot; few-shot examples didn't help.
3. **Instruction placement:** `bothinst` (system role + task in user) > `rawinst` (user only) > `sysinst` (system only); `mock` (fake acknowledgment dialogue) + `reit` (repetition) further boost.
4. **Template strictness trades accuracy:** `strict` template raises stickiness to 98% but drops F1 to 86.3; `loose` (87.1) also hurts vs no-template `89.3`; GPT-4 fixes adherence per paper note.
5. **Micro-optimizations matter:** Adding `info` (common failure explanations) + `name` (human name for model) + `pos` (positive feedback) sequentially pushes 89.6 → 90.3 → 90.9 → **91.7**; naming alone +0.6.

## Detailed Notes
- **Dataset & task:** Binary entry-level suitability; production scale; evaluated across prompt variants with template stickiness (% of responses matching requested format).
- **Full ablated table:**
  | Variant | P | R | F1 | Stick |
  | baseline |61.2|70.6|65.6|79%|
  | CoT 72.6/85.1/78.4/87% | Zero-CoT 75.5/88.3/81.4/65% | +rawinst 80/92.4/85.8/68% | +sysinst 77.7/90.9/83.8/69% | +bothinst 81.9/93.9/87.5/71% | +bothinst+mock 83.3/95.1/88.8/74% | +bothinst+mock+reit 83.8/95.5/89.3/75% | strict 79.9/93.7/86.3/98% | loose 80.5/94.8/87.1/95% | right 84/95.9/89.6/77% | +info 84.9/96.5/90.3/77% | +info+name 85.7/96.8/90.9/79% | +info+name+pos **86.9/97/91.7/81%** |
- **Mod definitions:** rawinst/sysinst/bothinst (where instruction lives), mock (simulate acknowledgment), reit (repeat key elements), strict/loose (template enforcement degree), right (ask to reach right conclusion), info (extra failure info), name, pos.
- **GPT-3.5 quirk:** Worse than GPT-3 at sticking to templates (parsing needed).
- **Reference:** Clavié et al. 2023.

## Notable Quotes
> "The work shows that LLMs outperforms all other models tested, including an extremely strong baseline in DeBERTa-V3."
> "The impact of the prompt on eliciting the correct reasoning is massive. Simply asking the model to classify a given job results in an F1 score of 65.6, whereas the post-prompt engineering model achieves an F1 score of 91.7."
> "Many small modifications have an outsized impact on performance. … Something as simple as giving the model a (human) name and referring to it as such increased F1 score by 0.6pts."
> "Attempting to force the model to stick to a template lowers performance in all cases (this behaviour disappears in early testing with GPT-4)."

## Concepts Introduced or Referenced
- [[applications-overview]] — Applied classification workflow illustrating prompt ROI in production.
- [[prompt-engineering]] — Instruction design, role placement, repetition, naming, templating tradeoffs.
- [[prompt-optimization]] — Iterative hill-climbing over prompt mods with measured F1/stickiness frontier.
- [[in-context-learning]] — Tested but found inferior for this domain.

## Critical Assessment
- **Strengths:** Rare production case with full ablation table and both quality + stickiness metrics; isolates instruction vs CoT vs template effects; quantifies ROI of tiny tweaks.
- **Weaknesses:** Single task (graduate jobs) — generalizability to expert domains unclear (authors note CoT worse only where no expert knowledge needed); no confidence intervals; GPT-4 claim anecdotal.
- **Contradictions:** Finding that strict templating hurts accuracy contrasts with [[function-calling]] `strict:true` needs — domain-dependent; CoT degradation here vs [[chain-of-thought]] success on reasoning tasks — task-type split clarifies when to use CoT.
- **Gaps:** Needs link to [[prompt-optimization]] automated search (APE/OPRO) vs manual hill-climbing here.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/workplace_casestudy.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/workplace_casestudy.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/workplace_casestudy.en.mdx)
- Cited: Clavié et al. 2023 https://arxiv.org/abs/2303.07142

---

**Source:** Graduate Job Classification Case Study — Prompt Engineering Guide (DAIR.AI) Applications by Clavié et al., 2023 (via DAIR.AI) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/workplace_casestudy.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
