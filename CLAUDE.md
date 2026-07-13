# CLAUDE.md — Project Context for AI Coding Assistants

This file gives Claude, Claude Code, and Cursor the context they need to work
on this repository consistently.

## What this project is

**L&D Framework Builder** — an AI-powered web app with two tools for Learning &
Development teams:

- **Competency BARS** — generates Behaviourally Anchored Rating Scales from a
  competency.
- **Objectives & Assessment** — generates SMART learning objectives (with
  Bloom's levels) and an aligned multiple-choice micro-assessment from a topic.

## Tech stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS v3
- **AI:** Anthropic Claude *or* OpenAI, selected at runtime by which API key is
  present (`lib/llm.ts`)
- **Tests:** Vitest (pure-function unit tests in `tests/`)
- **Deploy:** Vercel + GitHub Actions CI

## Architecture

```
UI (app/page.tsx: tab switcher + one component per tool)
  -> POST /api/bars        (app/api/bars/route.ts)
  -> POST /api/objectives  (app/api/objectives/route.ts)
       each route: validate -> buildPrompt -> callLlm -> parse -> JSON

lib/
  llm.ts        shared, provider-agnostic LLM caller (ONLY file that hits network)
  json.ts       shared JSON extraction helper
  bars/         validation.ts, prompt.ts, parse.ts   (Tool A)
  objectives/   validation.ts, prompt.ts, parse.ts   (Tool B)
```

## Conventions

- **Keep AI-independent logic pure and testable.** Validation, prompt building,
  and response parsing are pure functions in `lib/` with no network calls. Only
  `lib/llm.ts` touches the network.
- **Never hardcode secrets.** API keys are read from environment variables at
  request time. `.env.local` is git-ignored.
- **Never expose the API key to the client.** All LLM calls happen server-side.
- **Validate all input** before it reaches the model.
- **The model must return JSON only**; parsers defensively strip code fences and
  validate shape.
- **Mirror the pattern across tools:** each tool has its own
  `validation.ts` / `prompt.ts` / `parse.ts` and matching tests.

## Commands

- `npm run dev` — local dev server
- `npm test` — run unit tests
- `npm run build` — production build
- `npm run lint` — lint

## When adding a new tool

1. Create `lib/<tool>/{validation,prompt,parse}.ts` as pure functions.
2. Add `app/api/<tool>/route.ts` following the existing route shape.
3. Add a tab and component in `app/page.tsx`.
4. Add matching tests in `tests/`.
5. Update `spec.md`.
