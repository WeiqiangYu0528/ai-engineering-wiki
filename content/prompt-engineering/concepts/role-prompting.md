---
type: concept
title: "Role Prompting"
summary: Role Prompting (also called persona or system prompting) is the practice of instructing an LLM how to behave, what identity to assume, and what tone or constraints to obey, so that subsequent responses adhere to that…
visibility: public
aliases:
  - Persona Prompting
  - System Prompting
  - Identity Prompting
  - wiki/role-prompting
tags:
  - prompt-engineering
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-introduction-examples]]"
  - "[[source-promptingguide-introduction-basics]]"
  - "[[source-promptingguide-introduction-tips]]"
related:
  - "[[prompt-engineering]]"
  - "[[prompt-elements]]"
  - "[[prompt-design-tips]]"
  - "[[in-context-learning]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Role Prompting (also called persona or system prompting) is the practice of instructing an LLM how to behave, what identity to assume, and what tone or constraints to obey, so that subsequent responses adhere to that…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/prompt-engineering/concepts/prompt-elements">Prompt Elements</a></li><li><a href="/prompt-engineering/concepts/prompt-design-tips">Prompt Design Tips</a></li><li><a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-promptingguide-introduction-examples">Prompt Engineering Guide — Examples of Prompts</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-introduction-basics">Prompt Engineering Guide — Basics of Prompting</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-introduction-tips">Prompt Engineering Guide — General Tips for Designing Prompts</a></li></ul></nav>
</aside>

## Overview
**Role Prompting** (also called persona or system prompting) is the practice of instructing an LLM how to behave, what identity to assume, and what tone or constraints to obey, so that subsequent responses adhere to that role. In chat models it is realized via the `system` role or a leading persona instruction in the `user` message. The DAIR.AI guide demonstrates it as the key technique for building conversational agents such as research assistants and customer-service bots.

## Key Ideas
- **Behavior as instruction:** A preamble like `The following is a conversation with an AI research assistant. The assistant tone is technical and scientific.` conditions the model's next-token distribution toward domain-specific vocabulary, style, and answer structure.
- **Tone control:** Swapping the persona clause toggles output style on the same query. Technical variant (`tone is technical and scientific`) for `Can you tell me about the creation of blackholes?` yields `singularity of infinite density…`; accessible variant (`answers should be easy to understand even by primary school students`) yields `very massive star runs out of fuel and collapses…` ([[source-promptingguide-introduction-examples]]).
- **System vs user placement:** In `gpt-3.5-turbo`/`gpt-4` chat APIs, role directives belong in `system` for highest priority; the guide's examples embed them in the `user` message for simplicity (`The following is a conversation… Human: … AI:`) but note the three-role structure in [[source-promptingguide-introduction-basics]].
- **Identity + constraints:** Roles often bundle tone with task scope and safety bounds (e.g., movie agent: `The agent is responsible to recommend from top global trending movies. It should refrain from asking for personal information.`), merging identity with positive-framing constraints from [[prompt-design-tips]].
- **Exemplars reinforce roles:** Adding a few `Human: … AI: …` demonstration turns in the role preamble strengthens adherence via [[in-context-learning]]; more examples → stronger persona persistence.

## How It Works
```
System (or leading User): "The following is a conversation with an AI research assistant.
                          The assistant tone is technical and scientific."
User: Hello, who are you?
Assistant: Greeting! I am an AI research assistant…   ← few-shot persona demo (optional but stabilizing)
User: Can you tell me about the creation of blackholes?
→ Assistant continues in the established technical register
```
1. Role text is encoded into the context window ahead of the query, biasing self-attention toward role-consistent completions seen during [[pretraining]] and instruction tuning.
2. At each decoding step, the prior over stylistic tokens (e.g., `singularity`, `spacetime`) is elevated relative to colloquial alternatives.
3. The effect persists across turns because the role remains in the prefix; long conversations may need role re-injection if context compresses or truncates.

## Practical Implications
- **Chatbot scaffolding:** Role prompting is the minimal viable scaffold for customer-service, tutoring, or research-assistant bots before adding tools or RAG. Start with a concise system prompt defining audience, tone, scope, and fallback.
- **Avoid negation-only constraints:** `DO NOT ASK FOR INTERESTS` often fails; pair role with affirmative duties and verbatim fallback utterances (`If none, respond "Sorry, couldn't find a movie…"`), as shown in [[prompt-design-tips]] movie-agent fix.
- **Evaluation:** Test role robustness with adversarial paraphrases and with both low/high [[llm-settings]] temperature — high temperature can drift from persona.
- **Hierarchy awareness:** Modern APIs enforce `system` > `developer` > `user` > `tool` priority; user-embedded role claims (`I am a…`) are weaker and more injectable (cf. [[prompt-injection]]).

## Connections
- Specialized subtype of [[prompt-engineering]] and of the **Instruction** element in [[prompt-elements]]; represents the Instruction slot when the instruction is "behave as X."
- Relies on [[in-context-learning]] mechanics — persona demos are few-shot examples for style.
- Complements [[prompt-design-tips]]: specificity (audience, tone), separator conventions (`###`), and positive framing all apply to role prompts.
- Security-relevant: role prompts are the attack surface for [[prompt-injection]] (direct/indirect jailbreaks that attempt to override the system role).
- Grounding roles with retrieved context in [[prompt-elements]] Context slot reduces [[hallucination]] while preserving persona.

## Open Questions
- How persistent are role prompts over 100k+ token contexts, and do they degrade faster than task instructions?
- Can role prompting be made robust without fine-tuning — e.g., via constitutional or self-critique loops — against strong prompt-injection?
- What is the trade-off between overly specific persona descriptions (brittle, high token cost) and underspecified ones (easy to drift)?

## Sources
- [[source-promptingguide-introduction-examples]]
- [[source-promptingguide-introduction-basics]]
- [[source-promptingguide-introduction-tips]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
