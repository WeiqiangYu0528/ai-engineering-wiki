---
type: source-summary
title: "ChatGPT Prompt Engineering — Prompt Engineering Guide (DAIR.AI) Models"
summary: Model guide to ChatGPT / gpt-3.5-turbo chat completion prompting.
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/chatgpt.en.mdx"
date-published: 2023-02-15
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - llm-fundamentals
key-concepts:
  - "[[llm-models-overview]]"
  - "[[prompt-engineering]]"
  - "[[role-prompting]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
---

# ChatGPT Prompt Engineering — Prompt Engineering Guide (DAIR.AI) Models

## Summary
Model guide to **ChatGPT / gpt-3.5-turbo chat completion** prompting. Covers RLHF-trained ChatGPT's conversational capabilities/limitations, recaps conversation task (intent + identity → technical assistant), and details **chat format vs classic completion**: multi-turn (`SYSTEM: You are an AI research assistant… technical/scientific` + `USER/ASSISTANT` history + black-hole creation explanation) and single-turn QA (`Context: Teplizumab/OKT3 … Question: What was OKT3 originally sourced from? → Mice`, with `Unsure about answer` fallback). Includes `openai.ChatCompletion.create()` Python traces, `gpt-3.5-turbo-0301` snapshot guidance (prefer instructions in `user` vs `system` for that snapshot), ChatML forward-look, Playground screenshots, notebook cards (`pe-chatgpt-intro.ipynb`, `pe-chatgpt-langchain.ipynb`), and 100+ paper reference list (Feb–June 2023) spanning evaluation, bias, healthcare, multilingual, and code.

## Key Takeaways
1. **Chat vs completion:** `text-davinci-003` single-string vs `gpt-3.5-turbo` message array (`system/user/assistant`); ChatML will be the developer interface; cost down 90% vs davinci (noted as driver for Snap/Instacart adoption).
2. **Role control persists:** `SYSTEM` persona ("technical and scientific") reliably shapes multi-turn style; alternative persona examples localize to same mechanism.
3. **Single-turn via chat:** QA possible by packing `Context → Question → Answer:` into a single `user` message; `temperature=0` and `Unsure` hedging recommended.
4. **Versioning matters:** `gpt-3.5-turbo-0301` best practice was `user`-placed instructions (evolves per snapshot) — signals prompt brittleness across releases.
5. **Ecosystem depth:** Notebook bridge + extensive reference set shows 2023 research pivot to ChatGPT; list includes e.g., Column Type Annotation, Systematic Evaluation on Benchmarks, Fairness, Health, MULTILINGUAL hate speech, Zero-shot Clinical NER, and more.

## Detailed Notes
- **Sections:** ChatGPT Introduction (RLHF, capabilities/limitations) → Reviewing The Conversation Task (intent + identity, `Human:/AI:` example) → Conversations with ChatGPT (Multi-turn, Single-turn tasks, Instructing Chat Models) → Notebooks → References.
- **Multi-turn example:** Input `SYSTEM: You are an AI research assistant…` / `USER: Hello…` / `ASSISTANT: Greeting!…` / `USER: Can you tell me about creation of black holes?` → assistant explains stellar collapse + event horizon; screenshot `chatgpt-1.png`.
- **API snippet:**
  ```python
  openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=[
    {"role":"system","content":"You are an AI research assistant…"},
    {"role":"user","content":"Hello, who are you?"},
    {"role":"assistant","content":"Greeting!…"},
    {"role":"user","content":"Can you tell me about the creation of black holes?"}
  ])
  ```
- **Single-turn content:** Teplizumab context (Ortho Pharmaceutical → OKT3 from mice, 1986 kidney transplant first therapeutic antibody) → QA shows grounding; playground `chatgpt-classic.png`.
- **Instructing note:** "snapshots … best practices may change … 0301 is to add instructions in the user message as opposed to system message."
- **References:** 80+ entries (sampling: Reviews of ChatGPT in Construction, Medicine, Translation, Evaluation, etc.) — extensive but undigested.

## Notable Quotes
> "ChatGPT is a new model trained by OpenAI that has the capability to interact in a conversational way. This model is trained to follow instructions in a prompt to provide appropriate responses in the context of a dialogue."
> "The chat format enables multi-turn conversations but it also supports single-turn tasks similar to what we used with text-davinci-003."
> "The current recommendation for gpt-3.5-turbo-0301 is to add instructions in the user message as opposed to the available system message."

## Concepts Introduced or Referenced
- [[llm-models-overview]] — ChatGPT as canonical chat-tuned LLM entry in model collection.
- [[prompt-engineering]] — Conversation task design and chat-format prompting.
- [[role-prompting]] — System persona + identity/intent pattern.
- [[in-context-learning]] — Single-turn QA grounded via context packing.
- [[hallucination]] — Mitigated by grounding context + `Unsure` fallback.
- [[rlhf]] — ChatGPT training basis (not detailed but named).
- [[tool-use]] — Forward link to LangChain notebook integration.

## Critical Assessment
- **Strengths:** Clear delta between completion and chat APIs with runnable code; single-turn grounding pattern (`Unsure`) is production-relevant; notebook + reference list support deeper study.
- **Weaknesses:** Snapshot advice now dated (system-message usage has changed); no tool/function calling (predates function calling); reference list is sheer bibliography without synthesis; Playground UI references aging.
- **Contradictions:** None; complements [[source-promptingguide-models-gpt-4]] (successor) and [[prompt-engineering]] conversation grounding.
- **Gaps:** Needs [[function-calling]] integration and modern `gpt-3.5-turbo` system-message best practice.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/chatgpt.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/chatgpt.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/chatgpt.en.mdx)
- Cited: https://openai.com/blog/chatgpt ; https://openai.com/blog/introducing-chatgpt-and-whisper-apis ; https://github.com/openai/openai-python/blob/main/chatml.md ; notebooks pe-chatgpt-intro.ipynb / pe-chatgpt-langchain.ipynb

---

**Source:** ChatGPT Prompt Engineering — Prompt Engineering Guide (DAIR.AI) Models by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/chatgpt.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
