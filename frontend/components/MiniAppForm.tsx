"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiRequest, getCurrentSession } from "@/lib/api";
import type { MiniAppDefinition, MiniAppInsight, MiniAppResult } from "@/lib/types";

export default function MiniAppForm({ appId }: { appId: string }) {
  const [app, setApp] = useState<MiniAppDefinition | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MiniAppResult | null>(null);
  const [insight, setInsight] = useState<MiniAppInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [error, setError] = useState("");

  const summaryLink = useMemo(() => {
    return sessionId ? `/summary?session=${sessionId}` : "/summary";
  }, [sessionId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const querySession = Number(params.get("session"));
    const savedSession = getCurrentSession();
    const nextSessionId = Number.isFinite(querySession) && querySession > 0 ? querySession : savedSession;
    setSessionId(nextSessionId);

    const request = nextSessionId
      ? apiRequest<MiniAppDefinition>(`/mini-apps/${appId}/start`, {
          method: "POST",
          body: JSON.stringify({ session_id: nextSessionId })
        })
      : apiRequest<MiniAppDefinition>(`/mini-apps/${appId}`);

    request.then(setApp).catch((err: Error) => setError(err.message));
  }, [appId]);

  function updateAnswer(index: number, value: string) {
    setAnswers((current) => ({ ...current, [`q${index + 1}`]: value }));
  }

  async function requestInsight() {
    if (!sessionId) {
      setError("Create or open a session first.");
      return;
    }

    const hasAnswer = Object.values(answers).some((value) => value.trim());
    if (!hasAnswer) {
      setError("Fill in at least one answer to get an AI insight.");
      return;
    }

    setError("");
    setInsightLoading(true);
    try {
      const response = await apiRequest<MiniAppInsight>(`/mini-apps/${appId}/insight`, {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, answers })
      });
      setInsight(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not get AI insight");
    } finally {
      setInsightLoading(false);
    }
  }

  async function submitAnswers(event: FormEvent) {
    event.preventDefault();
    if (!sessionId) {
      setError("Create or open a session first.");
      return;
    }

    setError("");
    try {
      const saved = await apiRequest<MiniAppResult>(`/mini-apps/${appId}/answer`, {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, answers })
      });
      setResult(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save mini-app result");
    }
  }

  return (
    <RequireMiniAppLayout
      title={app?.title || "Mini-app"}
      description={app?.description || "Loading guided tool..."}
    >
      {!sessionId && (
        <div className="notice">
          Open this mini-app from a chat session. You can create a new session on the dashboard.
        </div>
      )}

      {app ? (
        <form className="form" onSubmit={submitAnswers}>
          {app.questions.map((question, index) => (
            <label key={question}>
              {question}
              <textarea
                rows={3}
                value={answers[`q${index + 1}`] || ""}
                onChange={(event) => updateAnswer(index, event.target.value)}
                required
              />
            </label>
          ))}
          {error && <p className="error">{error}</p>}
          <div className="actions">
            <button
              className="secondary-button"
              type="button"
              onClick={requestInsight}
              disabled={insightLoading}
            >
              {insightLoading ? "Getting insight..." : "Get AI insight"}
            </button>
            <button className="button" type="submit">Save result</button>
            <Link className="secondary-button" href={summaryLink}>Open summary</Link>
          </div>
        </form>
      ) : (
        <div className="panel">Loading...</div>
      )}

      {insight && (
        <div className="panel">
          <h3>AI insight{insight.llm_used ? "" : " (offline mode)"}</h3>
          <p>{insight.insight}</p>
          <p className="eyebrow">
            Insight is a preview — save the form when you are ready for the final result.
          </p>
        </div>
      )}

      {result && (
        <div className="panel">
          <h3>Saved result</h3>
          <p>{result.result_text}</p>
          <Link className="button" href={summaryLink}>Go to final summary</Link>
        </div>
      )}
    </RequireMiniAppLayout>
  );
}

function RequireMiniAppLayout({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container grid">
      <div className="card">
        <p className="eyebrow">Mini-app</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="panel grid">{children}</div>
    </div>
  );
}
