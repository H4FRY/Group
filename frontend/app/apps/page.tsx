"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { apiRequest, getCurrentSession } from "@/lib/api";
import type { MiniAppDefinition } from "@/lib/types";

export default function AppsPage() {
  return (
    <RequireAuth>
      <AppsContent />
    </RequireAuth>
  );
}

function AppsContent() {
  const [apps, setApps] = useState<MiniAppDefinition[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setSessionId(getCurrentSession());
    apiRequest<MiniAppDefinition[]>("/mini-apps")
      .then(setApps)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="container grid">
      <section className="card">
        <p className="eyebrow">Guided tool catalog</p>
        <h1>Guided tools</h1>
        <p>Each guided tool asks four questions and saves a practical result for the session summary.</p>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="grid grid-2">
        {apps.map((app) => (
          <div className="panel app-card" key={app.id}>
            <h2>{app.title}</h2>
            <p>{app.description}</p>
            <ul>
              {app.questions.map((question) => <li key={question}>{question}</li>)}
            </ul>
            <div>
              <Link className="button" href={`/apps/${app.id}${sessionId ? `?session=${sessionId}` : ""}`}>
                Open tool
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
