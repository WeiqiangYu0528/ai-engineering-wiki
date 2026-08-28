---
type: source-summary
title: "Generating Code — Prompt Engineering Guide (DAIR.AI) Applications"
summary: Application guide to code generation with ChatGPT / gpt-3.5-turbo via Playground Chat Mode.
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/coding.en.mdx"
date-published: 2023-06-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - open-source
key-concepts:
  - "[[code-generation]]"
  - "[[applications-overview]]"
  - "[[prompt-engineering]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
---

# Generating Code — Prompt Engineering Guide (DAIR.AI) Applications

## Summary
Application guide to **code generation with ChatGPT / gpt-3.5-turbo via Playground Chat Mode**. Establishes a `System Message` wrapper (`You are a helpful code assistant that can teach a junior developer… Python. Don't explain, just generate the code block.`) and walks through: basic hello-name generation, comment-to-code (`""" 1. Create list of movies… """` → 10 movies/ratings → json), function completion (`def multiply(` → `a, b): return a*b+75`), MySQL query synthesis from schema (`Table departments/students… SELECT … INNER JOIN … WHERE DepartmentName='Computer Science'`), iterative schema creation, dummy `INSERT` generation (4 rows per table), SQL explanation under a Python-biased system prompt, plus placeholders for editing/debugging/best practices. Ends with a missing-import caution (`import json`).

## Key Takeaways
1. **System-message steering:** Wrapping instructions as code-assistant persona enforces language (Python) and output discipline (code block only); user message then carries the task.
2. **Comment-as-prompt works:** Block comments with numbered steps reliably yield working Python (though subtle bugs like absent imports persist — always test).
3. **Completion & copilot pattern:** Prefix prompting (`def multiply(`) elicits function bodies; same mechanism powers GitHub Copilot.
4. **End-to-end SQL workflow from prompts:** Schema description → `SELECT … JOIN` → `CREATE TABLE` DDL → `INSERT` dummy data (test on sqliteonline.com) → explanation (with persona leakage caveat).
5. **Persona conflict:** System prompt bias (Python) can bleed into other tasks (SQL explanation starts "Sorry, as a code assistant in Python…" but still answers); shows need to relax system constraints for polyglot tasks.

## Detailed Notes
- **Structure:** `under development` callout; Chat Mode screenshots `chat-mode.png`; sections: Basic Example, Turn Comments Into Code, Complete Functions or Next Line, MySQL Query Generation, Explain Code, Editing/Debugging (coming soon), Best practices (coming soon).
- **Examples verbatim:**
  - Basic: `Write code that asks the user for their name and say "Hello"` → `input() + print(f"Hello, {name}!")` pattern (screenshot only).
  - Comment→code: 3-step movies/ratings/json task → generates `movies = ["The Shawshank…" …]`, `ratings = [9.3…]`, `json.dumps(movie_ratings, indent=4)` — flagged missing `import json`.
  - Completion: `# function to multiply two numbers and add 75 … def multiply(` → completes `a, b):\n    result = a * b\n    result += 75\n    return result`.
  - MySQL: schema `Table departments … / Table students …` → `SELECT students.StudentId, … FROM students INNER JOIN departments … WHERE …='Computer Science'`.
  - Schema synthesis: `Create a valid database schema …` → `CREATE TABLE departments/students … FOREIGN KEY`.
  - Test data: feed DDL back → `INSERT INTO departments VALUES (1,'Computer Science')…; INSERT INTO students VALUES (1,101,'John Doe')…` (2 CS students validate query).
  - Explanation: `Explain the above SQL statement.` under Python persona → apology prefix + correct JOIN/WHERE explanationkehrt.
- **Practical tip:** Use `sqliteonline.com` for ephemeral validation; warns not to trust untested generation.

## Notable Quotes
> "You are a helpful code assistant that can teach a junior developer how to code. Your language of choice is Python. Don't explain the code, just generate the code block itself."
> "While these models generate working code, you must pay close attention to small details like this and always make sure to test your code."
> "Sometimes the model refuses to generate what you are instructing because it's designed to follow the System Message."

## Concepts Introduced or Referenced
- [[code-generation]] — Prompt-driven Python/SQL synthesis, completion, and self-test loops.
- [[applications-overview]] — Applied code generation track.
- [[prompt-engineering]] — System vs user role split, comment-driven prompting, and persona leakage.
- [[program-aided-language-models]] — Code as executable reasoning (adjacent technique).
- [[tool-use]] — Achieving working code often needs execution feedback (interpreter).

## Critical Assessment
- **Strengths:** End-to-end, reproducible workflow from schema → query → DDL → inserts → validation; clearly surfaces the missing-import failure mode and persona conflict — honest about brittleness.
- **Weaknesses:** Under development (editing/debugging/best practices stubs empty); examples use deprecated Playground UI; no eval (HumanEval, pass@k), no security warning (injection, SQL concatenation), no discussion of temperature or sampling.
- **Contradictions:** None; complements [[source-promptingguide-applications-generating]] (data gen) by showing code domain transfer; system-prompt advice refined by [[context-engineering]] elsewhere.
- **Gaps:** Needs link to [[program-aided-language-models]] execution grounding, to [[code-generation]] eval benchmarks, and to modern instruction models (GPT-4, Llama) beyond 3.5.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/coding.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/coding.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/coding.en.mdx)

---

**Source:** Generating Code — Prompt Engineering Guide (DAIR.AI) Applications by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/coding.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
