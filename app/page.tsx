"use client";

import { useState } from "react";
import type { BarsResult } from "@/lib/bars/parse";
import type { ObjectivesResult } from "@/lib/objectives/parse";

type Mode = "bars" | "objectives";

export default function Home() {
  const [mode, setMode] = useState<Mode>("bars");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-brand">
            L&amp;D Framework Builder
          </h1>
          <p className="mt-2 text-slate-600">
            AI helpers for competency and learning design. Pick a tool below.
          </p>
        </header>

        <div className="mb-8 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setMode("bars")}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              mode === "bars" ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Competency BARS
          </button>
          <button
            onClick={() => setMode("objectives")}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              mode === "objectives" ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Objectives &amp; Assessment
          </button>
        </div>

        {mode === "bars" ? <BarsTool /> : <ObjectivesTool />}

        <footer className="mt-12 text-center text-xs text-slate-400">
          AI-generated content — review before use in formal assessments.
        </footer>
      </div>
    </main>
  );
}

/* ---------------------------------------------------------------- */
/* Shared bits                                                       */
/* ---------------------------------------------------------------- */

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(getText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
    >
      {copied ? "Copied!" : "Copy as Markdown"}
    </button>
  );
}

/* ---------------------------------------------------------------- */
/* Tool 1: Competency BARS                                           */
/* ---------------------------------------------------------------- */

function BarsTool() {
  const [competency, setCompetency] = useState("");
  const [definition, setDefinition] = useState("");
  const [roleContext, setRoleContext] = useState("");
  const [levels, setLevels] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BarsResult | null>(null);

  async function handleGenerate() {
    setError("");
    setResult(null);
    if (competency.trim().length < 2) {
      setError("Please enter a competency name (at least 2 characters).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bars", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ competency, definition, roleContext, levels }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong.");
      else setResult(data as BarsResult);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toMarkdown(r: BarsResult): string {
    const rows = r.levels
      .slice()
      .sort((a, b) => a.level - b.level)
      .map(
        (lvl) =>
          `### Level ${lvl.level} — ${lvl.label}\n` + lvl.anchors.map((a) => `- ${a}`).join("\n")
      )
      .join("\n\n");
    return `# BARS: ${r.competency}\n\n${rows}\n`;
  }

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">
          Competency name <span className="text-red-500">*</span>
          <input
            type="text"
            value={competency}
            onChange={(e) => setCompetency(e.target.value)}
            placeholder="e.g. Quality Control Review"
            maxLength={120}
            className={inputClass}
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Definition / context (optional)
          <textarea
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="What does this competency mean in your organisation?"
            rows={3}
            maxLength={1000}
            className={inputClass}
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Role / context (optional)
            <input
              type="text"
              value={roleContext}
              onChange={(e) => setRoleContext(e.target.value)}
              placeholder="e.g. QC Lead, Fibre Network Design"
              maxLength={200}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Number of levels
            <select value={levels} onChange={(e) => setLevels(Number(e.target.value))} className={inputClass}>
              {[3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} levels
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 w-full rounded-md bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate rating scale"}
        </button>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
      </section>

      {result && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{result.competency || competency}</h2>
            <CopyButton getText={() => toMarkdown(result)} />
          </div>
          <div className="space-y-4">
            {result.levels
              .slice()
              .sort((a, b) => a.level - b.level)
              .map((lvl) => (
                <article key={lvl.level} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      {lvl.level}
                    </span>
                    <h3 className="text-lg font-semibold">{lvl.label}</h3>
                  </div>
                  <ul className="ml-11 list-disc space-y-1 text-slate-700">
                    {lvl.anchors.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </article>
              ))}
          </div>
        </section>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- */
/* Tool 2: Learning Objectives & Micro-Assessment                    */
/* ---------------------------------------------------------------- */

function ObjectivesTool() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [objectiveCount, setObjectiveCount] = useState(4);
  const [questionCount, setQuestionCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ObjectivesResult | null>(null);

  async function handleGenerate() {
    setError("");
    setResult(null);
    if (topic.trim().length < 2) {
      setError("Please enter a training topic (at least 2 characters).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/objectives", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic, audience, objectiveCount, questionCount }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong.");
      else setResult(data as ObjectivesResult);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toMarkdown(r: ObjectivesResult): string {
    const obj = r.objectives
      .map((o, i) => `${i + 1}. ${o.text}${o.bloomLevel ? ` _(${o.bloomLevel})_` : ""}`)
      .join("\n");
    const quiz = r.assessment
      .map((q, i) => {
        const opts = q.options
          .map((opt, oi) => `   ${String.fromCharCode(65 + oi)}. ${opt}${oi === q.answerIndex ? " ✅" : ""}`)
          .join("\n");
        return `**Q${i + 1}. ${q.question}**\n${opts}${q.rationale ? `\n   _Why: ${q.rationale}_` : ""}`;
      })
      .join("\n\n");
    return `# ${r.topic}\n\n## Learning Objectives\n${obj}\n\n## Micro-Assessment\n${quiz}\n`;
  }

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">
          Training topic <span className="text-red-500">*</span>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Introduction to PON fibre architecture"
            maxLength={120}
            className={inputClass}
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Audience (optional)
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. New fibre network designers"
            maxLength={200}
            className={inputClass}
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Number of objectives
            <select
              value={objectiveCount}
              onChange={(e) => setObjectiveCount(Number(e.target.value))}
              className={inputClass}
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} objectives
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Number of questions
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className={inputClass}
            >
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} questions
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 w-full rounded-md bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate objectives & assessment"}
        </button>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
      </section>

      {result && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{result.topic || topic}</h2>
            <CopyButton getText={() => toMarkdown(result)} />
          </div>

          <article className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold">Learning Objectives</h3>
            <ol className="list-decimal space-y-2 pl-5 text-slate-700">
              {result.objectives.map((o) => (
                <li key={o.id}>
                  {o.text}
                  {o.bloomLevel && (
                    <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-brand">
                      {o.bloomLevel}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold">Micro-Assessment</h3>
            <div className="space-y-5">
              {result.assessment.map((q, qi) => (
                <div key={qi}>
                  <p className="font-medium text-slate-800">
                    {qi + 1}. {q.question}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {q.options.map((opt, oi) => (
                      <li
                        key={oi}
                        className={`rounded-md px-3 py-1.5 text-sm ${
                          oi === q.answerIndex
                            ? "bg-green-50 font-medium text-green-800"
                            : "text-slate-700"
                        }`}
                      >
                        {String.fromCharCode(65 + oi)}. {opt}
                        {oi === q.answerIndex && " ✓"}
                      </li>
                    ))}
                  </ul>
                  {q.rationale && (
                    <p className="mt-1 pl-3 text-xs italic text-slate-500">Why: {q.rationale}</p>
                  )}
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
    </>
  );
}
