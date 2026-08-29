---
title: "Reading path: Fine-tuning & Alignment"
---

# Reading path: Fine-tuning & Alignment

> 8 pages in order, about 45 minutes of reading · content as of 2026-08-27

Each entry assumes the ones above it, which is the only claim this page makes — it is a route in, not a table of contents. The [Fine-tuning & Alignment map](/fine-tuning/) has the full list.

1. [AI Alignment](/fine-tuning/concepts/alignment) — states the gap between the pretraining objective and the user's; every later entry is one answer to it
2. [Supervised Fine-Tuning](/fine-tuning/concepts/supervised-fine-tuning) — the first and cheapest answer: imitate demonstrations you can write
3. [Instruction Tuning](/fine-tuning/concepts/instruction-tuning) — the same stage scaled across thousands of tasks, which is what turns a base model into an assistant
4. [Reinforcement Learning from Human Feedback](/fine-tuning/concepts/rlhf) — what to do when you cannot write the demonstration but can rank two candidates
5. [Direct Preference Optimization](/fine-tuning/concepts/direct-preference-optimization) — the same preference signal without the reward model or the RL loop, so it only reads as a simplification of step 4
6. [Parameter-Efficient Fine-Tuning (PEFT)](/fine-tuning/concepts/parameter-efficient-fine-tuning) — the cost axis, orthogonal to 2–5, which all quietly assume you can afford full updates
7. [Low-Rank Adaptation (LoRA)](/fine-tuning/concepts/lora) — the PEFT method that actually gets used, and the one whose rank you have to choose
8. [Post-Training Lineage: What Actually Replaced What](/fine-tuning/concepts/post-training-lineage) — the synthesis: these stages compose rather than supersede, and the selector is whether you have a verifier

Every page here names the one before it in its header and links the one after it at the foot of its body, so the order can be followed without coming back to this page.
