---
type: concept
title: "LLM Applications Overview"
summary: LLM Applications Overview maps the six high-value use cases in the DAIR Prompt Engineering Guide's Applications section — data generation (synthetic RAG, textbook diversity), code generation, function calling, low-code…
visibility: public
aliases:
  - "Applications of Prompt Engineering"
  - "Applied LLM Use Cases"
tags:
  - prompt-engineering
  - agents
  - rag
  - fine-tuning
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-applications-generating]]"
  - "[[source-promptingguide-applications-synthetic-rag]]"
  - "[[source-promptingguide-applications-generating-textbooks]]"
  - "[[source-promptingguide-applications-coding]]"
  - "[[source-promptingguide-applications-function-calling]]"
  - "[[source-promptingguide-applications-finetuning-gpt4o]]"
  - "[[source-promptingguide-applications-pf]]"
  - "[[source-promptingguide-applications-workplace-casestudy]]"
  - "[[source-promptingguide-applications-context-caching]]"
related:
  - "[[prompt-engineering]]"
  - "[[synthetic-data]]"
  - "[[code-generation]]"
  - "[[prompt-function]]"
  - "[[function-calling]]"
  - "[[tool-use]]"
  - "[[context-caching]]"
  - "[[supervised-fine-tuning]]"
---

# LLM Applications Overview

## Overview
**LLM Applications Overview** maps the six high-value use cases in the DAIR Prompt Engineering Guide's Applications section — **data generation (synthetic RAG, textbook diversity), code generation, function calling, low-code prompt functions, production case studies, and inference caching** — plus the cross-cutting **fine-tuning (GPT-4o)** path. It aggregates 9 source summaries spanning vanilla `Q: A:` sentiment generation, PROMPTGATOR retriever distillation, TinyStories/Phi-1 diversity seeding, ChatGPT system-message-driven coding workflows, OpenAI function calling `get_current_weather` loops, named prompt functions (`trans_word`→`expand_word`→`fix_english`), the Clavié et al. graduate-job classification hill-climb (65.6→91.7 F1), and Gemini 1.5 Flash `CachedContent` for yearly ML-paper QA.

## Key Ideas
- **Generation as application, not just pretraining:** LLMs generate evaluation data (sentiment `Q:/A:`), retriever training data (50k synthetic query-doc pairs ≈ manual), and pretraining data (1B textbook tokens) via distinct prompting patterns — counts, intent-specific few-shots, and randomized entity/topic+ audience seeding.
- **Code ↔ data loop:** [[code-generation]] via `SYSTEM: You are helpful code assistant… Python only` + comment→code + MySQL schema→query→DDL→INSERT→validation shows persona-locked generation needing post-hoc testing (missing `import json`).
- **Tool bridge:** [[function-calling]] [[source-promptingguide-applications-function-calling]] is the app-centric view of [[tool-use]]: define `tools=[{type:function, name, description, parameters:{location, unit: celsius|fahrenheit}}]` → `openai.chat.completions.create(tools)` → JSON args (`{"location":"London","unit":"celsius"}`) → external execution → synthesis. Five sub-uses: agents, NLU extraction, math, API integration, information extraction.
- **Prompt Functions as no-code agents:** `[[prompt-function]]` (`function_name: [Name] input: [...] rule: [...]` meta prompt → `ok` → `trans_word`/`pg(length,…)`) composes workflows via natural-language dispatch `fix_english(expand_word(trans_word(…)))`, precursor to programmatic orchestration but without schema enforcement.
- **Fine-tuning as fallback:** [[source-promptingguide-applications-finetuning-gpt4o]] (`GPT-4o-2024-08-06`, $25/1M train) via JSONL emotion-classification demo shows when prompting hits limits → customize tone/structure/domain.
- **Production hill-climbing matters most:** Workplace case study ablates 14 mods over baseline 65.6 F1 → 91.7; `bothinst` (system+user) + mock+reit+right+info+name+pos each add points; `strict` templating boosts stickiness 98% but hurts F1 — illustrates [[prompt-optimization]] ROI and template-tax tradeoff (GPT-4 fixes).
- **Inference lever:** [[context-caching]] (`caching.CachedContent.create(model="gemini-1.5-flash", ttl="15m")`) keeps yearly ML-paper summaries resident without resending per query — alternative to RAG indexing for moderately sized static corpora.

## How It Works
```
Prompt-engineered idea (sentiment/code/query)  →  LLM generation
        ├─ vanilla: count-constrained Q:A       → 10 eval examples
        ├─ PROMPTGATOR: 2-8 few-shot (doc→query) + intent prompt → 50k pairs → train encoder retriever
        ├─ TinyStories/Phi-1: random entity/topic+audience per prompt → 100k–1B diverse samples → local/pretrain
        └─ Code: system persona + comment→code / schema→SQL → test in sqliteonline.com
                │
                ▼
   Tool/Function layer:  tools schema → model emits {name, args} → developer runs API → observation → final answer
   Context cache layer:  upload once → CachedContent (instruction + file + TTL) → GenerativeModel.from_cached_content → many queries cheap
   Fine-tune layer (when needed): JSONL → dashboard → custom checkpoint → playground/API eval
```

## Practical Implications
- **Start prompt, not data:** Validate ideas via LLM synthesis before months of labeling; use intent-aware few-shots and randomized seeding to avoid diversity collapse (temperature alone insufficient).
- **Test code generations:** Always execute; persona bleed (Python system → SQL apology) and missing imports are systematic.
- **Choose your abstraction:** For robust agents use [[function-calling]] JSON schemas; for non-coder rapid chains use [[prompt-function]] natural dispatch; for static KBs consider [[context-caching]] vs full [[retrieval-augmented-generation]].
- **Budget iteration:** Workplace ablation shows 26-point lifts from micro tweaks (naming +0.6); allocate time for systematic [[prompt-optimization]] sweeps, not just model upgrades.
- **Cost lens:** PROMPTGATOR $55/50k docs vs >$1000 manual; Phi-1 $4k/1B tokens explains why synthetic wins for niche/low-resource domains.

## Connections
- Generalizes [[prompt-engineering]] (specificity, output anchoring, system/user split) across domains.
- Feeds [[synthetic-data]] (quality checklist → practical generation patterns) and [[code-generation]] (PAL-like execution).
- Function calling realizes [[tool-use]] / [[model-context-protocol]] and is deepened in [[function-calling]] (agent loop, debugging via intermediate steps).
- Context caching implements [[inference]] prefix/KV savings alongside Anthropic prompt caching in [[claude-code]].
- Case study refines [[prompt-optimization]] with measured F1/stickiness frontier; complements [[synthetic-data]] and [[retrieval-augmented-generation]].

## Open Questions
- When does synthetic query quality decay enough to harm retriever (hallucinated queries) vs help — what filter thresholds?
- How to auto-select cache vs RAG vs fine-tune per workload size, recency, and cost constraints?

## Sources
- [[source-promptingguide-applications-generating]]
- [[source-promptingguide-applications-synthetic-rag]]
- [[source-promptingguide-applications-generating-textbooks]]
- [[source-promptingguide-applications-coding]]
- [[source-promptingguide-applications-function-calling]]
- [[source-promptingguide-applications-finetuning-gpt4o]]
- [[source-promptingguide-applications-pf]]
- [[source-promptingguide-applications-workplace-casestudy]]
- [[source-promptingguide-applications-context-caching]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
