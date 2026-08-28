---
type: source-summary
title: "Prompt Engineering Guide — Prompt Chaining"
summary: This chapter defines Prompt Chaining — decomposing a complex task into subtasks where each LLM prompt's output feeds the next prompt — to improve reliability, transparency, controllability, and debuggability over…
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/prompt_chaining.en.mdx"
date-published: 2023-01-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - agents
key-concepts:
  - "[[prompt-chaining]]"
  - "[[retrieval-augmented-generation]]"
  - "[[tool-use]]"
  - "[[chain-of-thought]]"
key-entities:
  - "[[openai]]"
  - "[[anthropic]]"
verified-by: agent
verified-on: 2026-08-27
---

# Prompt Engineering Guide — Prompt Chaining

## Summary
This chapter defines **Prompt Chaining** — decomposing a complex task into subtasks where each LLM prompt's output feeds the next prompt — to improve reliability, transparency, controllability, and debuggability over monolithic prompting. It provides a full end-to-end **Document QA** case study on a Wikipedia article for prompt engineering using `gpt-4-1106-preview`: Prompt 1 extracts relevant quotes into `<quotes>` tags (delimited document via `####`, emits `No relevant quotes found!` fallback), Prompt 2 synthesizes the quotes + document into a friendly, accurate answer (enumerating 12 techniques: CoT, generated knowledge, least-to-most, self-consistency, complexity-based, self-refine, tree-of-thought, maieutic, directional-stimulus, textual inversion, gradient search, prompt injection).

## Key Takeaways
1. **Chain = sequential transforms:** Break task → identify subtasks → prompt LLM per subtask → transform response before next step; final output emerges from chain.
2. **Three operational benefits:** Better performance on tasks too complex for a single detailed prompt; increased transparency (inspect per-step outputs); easier debugging and per-stage performance analysis.
3. **Key use case — Document QA at scale:** Extract-then-synthesize pattern handles large documents exceeding naive single-pass QA fidelity.
4. **Two-prompt pattern demonstrated:**
   - Prompt 1 (extraction): `You are a helpful assistant… extract quotes relevant to the question … output <quotes></quotes> … Respond with "No relevant quotes found!" if none … #### {{document}} ####` → returns 12 technique bullets with citations `[27]…[67]`.
   - Prompt 2 (synthesis): `Given quotes … and original document …, compose an answer … Ensure accurate, friendly, helpful tone.` → numbered list preserving technique names.
5. **Extensibility:** Citation stripping `[27]` could be an additional chain step; Anthropic docs (https://docs.anthropic.com/claude/docs/prompt-chaining) referenced as canonical reference with more examples.

## Detailed Notes
### Definition and Motivation
- Video embed `CKZC5RigYEc` overview; image `prompt-chaining-1.png` shows chained workflow.
- Quote: "chain prompts perform transformations or additional processes on the generated responses before reaching a final desired state."
- Useful when building LLM-powered conversational assistants and improving personalization / UX; also aids reliability and performance.

### Use Case — Prompt Chaining for Document QA
- Placeholder `{{document}}` for large Wikipedia text; model `gpt-4-1106-preview` (long-context) also transferable to Claude.
- Prompt 1 screenshot plus verbatim template; emphasizes delimiters (`####` for doc, `<quotes>` for output) per [[prompt-design-tips]] separator guidance; fallback sentence prevents hallucination when no quotes found.
- Output of Prompt 1:
```
<quotes>
- Chain-of-thought (CoT) prompting[27]
- Generated knowledge prompting[37]
- Least-to-most prompting[38]
- Self-consistency decoding[39]
- Complexity-based prompting[41]
- Self-refine[42]
- Tree-of-thought prompting[43]
- Maieutic prompting[45]
- Directional-stimulus prompting[46]
- Textual inversion and embeddings[59]
- Using gradient descent to search for prompts[61][62][63][64]
- Prompt injection[65][66][67]
</quotes>
```
- Offered refinement: clean citations or route them to another chain prompt.

### Prompt 2 and Output
- Full template concatenating `#### {{document}} ####` + `<quotes>…</quotes>`; instruction to be accurate/friendly/helpful.
- Output of Prompt 2: numbered 12-item list mirroring extraction, with closing sentence about unique strategies enhancing LLM interactions.
- Shows that splitting enables format control and tone control separately.

### References and Exercises
- Adaptation from Anthropic prompt chaining documentation; exercise: design a prompt that removes citations `[27]` before final user-facing response.

## Notable Quotes
> "To improve the reliability and performance of LLMs, one of the important prompt engineering techniques is to break tasks into its subtasks. Once those subtasks have been identified, the LLM is prompted with a subtask and then its response is used as input to another prompt."
> "Besides achieving better performance, prompt chaining helps to boost the transparency of your LLM application, increases controllability, and reliability."
> "Simplifying and creating prompt chains is a useful prompting approach where the responses need to undergo several operations or transformations."

## Concepts Introduced or Referenced
- [[prompt-chaining]] — Sequential LLM calls with inter-step transforms; extract-then-answer pattern.
- [[retrieval-augmented-generation]] — Prompt 1 is effectively retrieval via LLM extraction (quote selection) prior to grounded generation in Prompt 2.
- [[tool-use]] / [[model-context-protocol]] — Chaining often interleaves tool outputs between steps; operational precursor to agentic workflows.
- [[chain-of-thought]] / [[tree-of-thoughts]] — Related decomposition strategies; chaining is explicit multi-call decomposition vs intra-prompt reasoning.
- [[prompt-elements]] — Delimiter design (`####`, `<quotes>`) as system signals; instruction-context separation.
- [[prompt-design-tips]] — Separator advice (`###` / `####` / XML tags) directly applied.
- [[hallucination]] — `No relevant quotes found!` fallback and quote-grounded synthesis as anti-hallucination guard.
- [[inference]] / [[llm-settings]] — Multi-call cost/latency trade-off; temperature and stop sequences per stage.

## Critical Assessment
- **Strengths:** Only chapter with a fully runnable multi-step trace including exact prompt templates, model identifier, delimiters, and verbatim outputs — extremely copy-pasteable for practitioner adoption; correctly motivates chaining beyond performance (transparency/control/debugging).
- **Weaknesses:** Single use case (document QA); does not quantify latency/cost doubling or context-window duplication (`{{document}}` appears in both prompts → 2× input tokens). No error-propagation analysis (extraction miss → synthesis failure) or retry/repair pattern.
- **Contradictions:** None with [[tool-use]] or [[retrieval-augmented-generation]] — but overlap should be explicit: chaining with extraction is a poor-man's RAG; production should prefer vector retrieval over LLM extraction when docs are very large.
- **Gaps:** Should link to [[automatic-reasoning-and-tool-use]] (ART) as automated chaining, [[generated-knowledge-prompting]] as 2-step knowledge chain, and agent frameworks per [[source-promptingguide-agents-introduction]].

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/prompt_chaining.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/prompt_chaining.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/prompt_chaining.en.mdx)
- Cited: Anthropic Prompt Chaining docs https://docs.anthropic.com/claude/docs/prompt-chaining; OpenAI gpt-4-1106-preview

---

**Source:** Prompt Engineering Guide — Prompt Chaining by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/prompt_chaining.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
