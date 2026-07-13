# spec.md — L&D Framework Builder

## 1. Overview

An AI-powered web app with two Learning & Development tools behind one tab
switcher:

- **Tool A — Competency BARS:** generates a Behaviourally Anchored Rating Scale
  (observable behaviours per proficiency level) from a competency.
- **Tool B — Objectives & Assessment:** generates SMART learning objectives
  (tagged with Bloom's levels) plus an aligned multiple-choice micro-assessment
  from a training topic.

Both tools share one provider-agnostic AI layer and the same
validate → prompt → call → parse pipeline.

---

## 2. AI Module Design

- **Capability type:** structured **generation** (not chat).
- **Provider:** Anthropic Claude *or* OpenAI, chosen at runtime by which API key
  is present (`lib/llm.ts`).
- **System prompts:** tool-specific. BARS enforces *observable* anchors;
  Objectives enforces measurable Bloom's-taxonomy verbs and MCQs aligned to the
  objectives.
- **Output contract:** each tool instructs the model to return **JSON only** in
  a fixed schema; `lib/*/parse.ts` strips fences and validates the shape.

**BARS schema**

```json
{ "competency": "string",
  "levels": [ { "level": 1, "label": "string", "anchors": ["string"] } ] }
```

**Objectives schema**

```json
{ "topic": "string",
  "objectives": [ { "id": 1, "text": "string", "bloomLevel": "string" } ],
  "assessment": [ { "question": "string", "options": ["string"],
                    "answerIndex": 0, "rationale": "string" } ] }
```

---

## 3. Inputs

**Tool A — BARS**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `competency` | string | Yes | 2–120 chars |
| `definition` | string | No | ≤ 1000 chars |
| `roleContext` | string | No | ≤ 200 chars |
| `levels` | integer | No | 3–6 (default 5) |

**Tool B — Objectives**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `topic` | string | Yes | 2–120 chars |
| `audience` | string | No | ≤ 200 chars |
| `objectiveCount` | integer | No | 2–6 (default 4) |
| `questionCount` | integer | No | 2–8 (default 4) |

Validation lives in `lib/bars/validation.ts` and `lib/objectives/validation.ts`
and runs before any model call.

---

## 4. Outputs

- HTTP 200 → JSON matching the tool's schema, rendered as cards.
- HTTP 400 → `{ "error": "..." }` for invalid input (no model call made).
- HTTP 500 → `{ "error": "..." }` safe message for provider/parse failures
  (details logged server-side only).

---

## 5. Acceptance Criteria (testable)

1. BARS: a competency ≥ 2 chars with 5 levels returns 5 levels, each with 1–3
   anchors. *(happy path)*
2. Objectives: a topic ≥ 2 chars returns the requested number of objectives and
   assessment questions; each question has ≥ 2 options and a valid answer index.
3. Empty required input returns HTTP 400 and makes **no** model call.
4. Fenced JSON (```` ```json ````) from the model still parses correctly.
   *(covered by `tests/bars-parse.test.ts`)*
5. No API key value ever appears in a client response or the JS bundle.
6. `npm test` (28 tests) passes and `npm run build` succeeds in CI.

---

## Architecture Notes

**Layers**

- **UI** — `app/page.tsx`: tab switcher + a form/results component per tool;
  loading/error states; copy-to-Markdown.
- **API** — `app/api/bars/route.ts` and `app/api/objectives/route.ts`
  (Node runtime): validate → build prompt → call LLM → parse → respond.
- **AI** — `lib/llm.ts`: the only module that makes network calls; picks the
  provider from env vars; key read server-side at request time.
- **Pure logic** — `lib/bars/*`, `lib/objectives/*`, `lib/json.ts`: no network,
  no secrets, fully unit-tested.

**Data flow (both tools identical in shape)**

```
Browser form
   │  POST /api/{bars|objectives}
   ▼
API route ── validate ──► buildPrompt ──► callLlm ──► [Claude / OpenAI]
                                              │
                                        parseResponse
   ▲                                          │
   └────────────  JSON result  ◄──────────────┘
```

**Security / secrets**

- API key stored as an environment variable in the host (Vercel), never in the
  repo. `.env.local` is git-ignored; `.env.example` documents the shape only.
- All model calls are server-side, so the key never reaches the browser.
- CI builds with a dummy key, so no real secret is needed to build.

**Why no database or auth**

The MVP is deliberately stateless: each request is independent, so there is no
need to store user data. This keeps the app fast to build, cheap to run, and
simple to deploy. Persistence, in-app editing, and auth are v2 improvements.
