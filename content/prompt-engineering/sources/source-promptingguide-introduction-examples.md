---
type: source-summary
title: "Prompt Engineering Guide — Examples of Prompts"
summary: This capstone of the introduction section walks through seven canonical prompt-engineering use cases on gpt-3.5-turbo — Text Summarization, Information Extraction, Question Answering, Text Classification, Conversation…
status: draft
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/examples.en.mdx"
date-published: 2023-01-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - llm-fundamentals
key-concepts:
  - "[[prompt-engineering]]"
  - "[[in-context-learning]]"
  - "[[prompt-elements]]"
  - "[[role-prompting]]"
  - "[[prompt-design-tips]]"
key-entities:
  - "[[openai]]"
aliases:
  - wiki/source-promptingguide-introduction-examples
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This capstone of the introduction section walks through seven canonical prompt-engineering use cases on gpt-3.5-turbo — Text Summarization, Information Extraction, Question Answering, Text Classification, Conversation…</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2023-01-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/examples.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 1 of 3 figures on this page were not found in [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/examples.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/examples.en.mdx): `3.5`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

This capstone of the introduction section walks through seven canonical prompt-engineering use cases on `gpt-3.5-turbo` — **Text Summarization**, **Information Extraction**, **Question Answering**, **Text Classification**, **Conversation (role prompting)**, **Code Generation**, and **Reasoning** — each with a prompt, output, and commentary on why element composition and specificity matter. It demonstrates progressive refinement (one-sentence summarization, context-grounded QA with fallback, few-shot casing control, role-conditioned tone, and step-by-step arithmetic) and explicitly introduces role prompting and the need for stepwise reasoning scaffolds.

## Key Takeaways
1. **Summarization & extraction via instruction + format cue:** Simple imperatives (`Explain antibiotics / A:`, `Mention the LLM product…`) suffice for well-scoped tasks; adding `Explain the above in one sentence:` reliably compresses output.
2. **Grounded QA beats open-ended QA:** Structured prompts (`Answer based on context below. Keep short. Respond "Unsure…" if not sure. Context: … Question: … Answer:`) sharply reduce hallucination compared to free-form questioning — the OKT3/mice example illustrates context-as-grounding.
3. **Classification requires casing/format control:** Instruction alone (`Classify … Sentiment:` → `Neutral`) often mismatches desired casing; adding a single few-shot exemplar (`Sentiment: neutral`) fixes it, while invented labels (`nutral`) are ignored without descriptions or more examples.
4. **Role prompting sets tone/identity:** Prefix `The following is a conversation with an AI research assistant. The assistant tone is technical and scientific…` vs `…easy to understand even by primary school students` toggles technical vs accessible black-hole explanations.
5. **Reasoning needs decomposition:** Direct arithmetic (`What is 9,000*9,000?` → `81,000,000`) works, but parity reasoning fails until prompted to `Solve by breaking the problem into steps. First, identify the odd numbers…` → `15,5,13,7,1 sum 41 odd` — foreshadowing chain-of-thought.

## Detailed Notes

### Text Summarization
- NLG staple; LLMs promise quick readable summaries.
- Prompt `Explain antibiotics / A:` → paragraph about bactericidal/bacteriostatic, oral/IV, not for viruses, resistance risk. `A:` is explicit QA format cue.
- Refinement: paste paragraph + `Explain the above in one sentence:` → one-sentence compression.
- Guide notes accuracy not evaluated; invites experimentation.

### Information Extraction
- LLMs as classifiers/extractors beyond generation.
- Paragraph on author-contribution statements mentioning `ChatGPT`; prompt `Mention the LLM based product…` → `ChatGPT`. Source: Nature 2023.

### Question Answering (Context-Grounded)
- Best practice: combine instruction + context + input + output indicator.
- Template:
  ```
  Answer the question based on the context below. Keep the answer short and concise. Respond "Unsure about answer" if not sure.

  Context: Teplizumab … OKT3 … Originally sourced from mice …
  Question: What was OKT3 originally sourced from?
  Answer:
  ```
  → `Mice.`  Context from Nature 2023. Pattern directly mitigates [[hallucination]] via grounding.

### Text Classification (Specificity & Few-Shot)
- Minimal: `Classify … Text: I think the food was okay. Sentiment:` → `Neutral` (capitalized).
- Casing fix via one exemplar:
  ```
  Text: I think the vacation is okay. Sentiment: neutral
  Text: I think the food was okay. Sentiment: → neutral
  ```
- Failure mode: invented label `nutral` ignored → `Neutral` due to pretraining prior; fix via label descriptions or more examples.

### Conversation / Role Prompting
- Role prompting = telling the model how to behave/its identity — key for chatbots.
- Technical assistant prompt → technical black-hole definition (singularity, infinite density).
- Accessible variant (`even by primary school students`) → simplified fuel-collapse explanation. More examples further improve.

### Code Generation
- Comment-to-code: `/* Ask the user… say "Hello" */` → `let name = prompt… console.log(\`Hello, ${name}!\`)` without specifying language.
- Schema-to-SQL: provide `departments`/`students` tables + `Create MySQL query for all students in Computer Science` → `SELECT … WHERE DepartmentId IN (SELECT … WHERE DepartmentName='Computer Science')`.

### Reasoning (Arithmetic)
- Simple: `What is 9,000*9,000?` → `81,000,000` (correct).
- Hard parity: `The odd numbers in this group add up to an even number: 15,32,5,13,82,7,1. A:` → model hallucinates `119 odd` vs claim, then corrects when asked to break into steps. Foreshadows advanced prompting needed for reasoning.

### Notebook
- Links to `pe-lecture.ipynb` for hands-on Python replication.

## Notable Quotes
> "By now it should be obvious that you can ask the model to perform different tasks by simply instructing it what to do."

> "This is sometimes referred to as *role prompting*."

> "Solve by breaking the problem into steps. First, identify the odd numbers, add them, and indicate whether the result is odd or even."

## Concepts Introduced or Referenced
- [[prompt-engineering]] — Survey of canonical applications, showing prompt variations per task domain.
- [[prompt-elements]] — Each example maps instruction/context/input/output indicator concretely (e.g., grounded QA template).
- [[in-context-learning]] — Few-shot casing control as in-context adaptation.
- [[role-prompting]] — Conversation section as explicit introduction to persona/tone conditioning.
- [[prompt-design-tips]] — Specificity, format, and stepwise decomposition applied across tasks.
- [[hallucination]] — Context-grounded QA with fallback `Unsure` as hallucination mitigation.
- [[inference]] / [[llm-settings]] — Implicit: temperature/top_p and max length influence summarization length and code determinism.

## Critical Assessment
- **Strengths:** Broadest coverage in the intro section; each task pairs a minimal prompt with an improved variant, making cause-effect explicit. Grounded QA template and role-prompting tone switch are immediately reusable. Parity reasoning failure → stepwise fix cleanly motivates chain-of-thought.
- **Weaknesses:** Outputs are presented as single samples at `T=1` without variance discussion; no evaluation metrics (accuracy, ROUGE, pass@k). `nutral` label discussion identifies bias but stops short of solution. Role prompting examples conflate system instruction with user-prefixed persona — modern chat APIs would use `system` role.
- **Contradictions:** None. Supplements [[prompt-engineering]] and [[in-context-learning]] with applied examples; aligns with [[hallucination]] grounding advice and [[inference]] decoding context. Tone-switching complements [[role-prompting]] which previously lacked concrete pairs.
- **Future bridge:** Sets up advanced chapters (few-shot, chain-of-thought, zero-shot prototypes) and connects to tool-use/agents via code-generation scaffolding.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/examples.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/examples.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/examples.en.mdx)

---

**Source:** Prompt Engineering Guide — Examples of Prompts by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/examples.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
