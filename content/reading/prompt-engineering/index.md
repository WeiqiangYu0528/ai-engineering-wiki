---
title: "Reading path: Prompt Engineering"
---

> 9 pages in order, about 45 minutes of reading · content as of 2026-08-24

Each entry assumes the ones above it, which is the only claim this page makes — it is a route in, not a table of contents. The [Prompt Engineering map](/prompt-engineering/) has the full list.

1. [Prompt Engineering](/prompt-engineering/concepts/prompt-engineering) — the frame, including where prompting stops and fine-tuning starts
2. [Prompt Elements](/prompt-engineering/concepts/prompt-elements) — instruction, context, input data, output format: the four parts every technique below rearranges
3. [Zero-Shot Prompting](/prompt-engineering/concepts/zero-shot-prompting) — the baseline to beat; if it holds, nothing else in this path is needed
4. [Few-Shot Prompting](/prompt-engineering/concepts/few-shot-prompting) — demonstrations as the first real lever, and the sensitivities they introduce
5. [In-Context Learning](/prompt-engineering/concepts/in-context-learning) — the mechanism behind step 4, and the source of its emergence-with-scale claim
6. [Chain-of-Thought Prompting](/prompt-engineering/concepts/chain-of-thought) — asks for the reasoning instead of the answer; its emergence claim rests on step 5
7. [Self-Consistency](/prompt-engineering/concepts/self-consistency) — samples step 6 repeatedly and votes, treating a chain as a distribution rather than an answer
8. [Tree of Thoughts (ToT)](/prompt-engineering/concepts/tree-of-thoughts) — generalizes the chain into a search tree, so it presumes both 6 and 7
9. [ReAct (Reasoning + Acting)](/prompt-engineering/concepts/react) — interleaves reasoning with acting, which is where this path hands off to `agents`

Every page here names the one before it in its header and links the one after it at the foot of its body, so the order can be followed without coming back to this page.
