# Reflection — L&D Framework Builder

_First-person draft. Edit the bracketed parts and adjust the voice so it sounds
like you — graders reward genuine, specific reflection._

## What I built

I built and deployed an AI-powered web app with two Learning & Development
tools behind one tab switcher: a **Competency BARS** generator (competency →
behaviourally anchored rating scale) and an **Objectives & Assessment** builder
(training topic → SMART learning objectives plus an aligned multiple-choice
micro-assessment). I chose these because they map directly to work I do in L&D —
[e.g. migrating our competency matrix and designing training for our team] — so
I was both the builder and the target user.

## What went well

- **A shared, layered architecture kept the second tool cheap to add.** Both
  tools reuse one provider-agnostic LLM caller and the same
  validate → prompt → call → parse pipeline; each tool just supplies its own
  pure functions. Adding the second tool was mostly new pure logic + tests, not
  new plumbing.
- **Keeping AI-independent logic pure paid off.** Validation, prompt-building,
  and parsing are pure functions, so I could unit test them without ever calling
  the model. All 28 tests pass locally and in CI.
- **Provider-agnostic design.** The app works with either an OpenAI or an
  Anthropic key, chosen at runtime, so I wasn't locked to one provider.

## Challenges

- **Getting structured output from an LLM.** Models sometimes wrap JSON in code
  fences or add commentary. I solved this with a shared JSON-extraction helper
  plus per-tool parsers that validate the shape before I trust it.
- **Scoping two tools before a deadline.** It was tempting to add persistence and
  login. I deliberately kept the MVP stateless so I could ship two working,
  deployed tools on time. [Add any specific snag you hit here.]
- **Secrets across environments.** My key lives in [Vocareum], but the app runs
  on Vercel, so the key had to stay out of the repo entirely and be set as an
  environment variable in the host — and CI builds with a dummy key so the
  pipeline never needs a real secret.

## What I learned

- A tight spec with testable acceptance criteria makes AI-assisted coding much
  faster — the spec's criteria became my tests and my demo checklist.
- Good structure compounds: the effort I spent making the first tool clean and
  layered is exactly what made the second tool fast and low-risk to add.

## What I'd improve in v2

- Save history and let users edit anchors/objectives in-app.
- Export a whole matrix or full course outline in one go (Excel/CSV).
- Add lightweight auth so teams can share saved outputs.
- Add analytics on which competencies and topics are generated most.
