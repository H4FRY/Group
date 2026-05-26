"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, clearToken, getToken, saveCurrentSession } from "@/lib/api";
import type { Session } from "@/lib/types";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const showAppNav = pathname !== "/" && pathname !== "/login";

  useEffect(() => {
    if (!showAppNav || !getToken()) {
      return;
    }

    apiRequest<Session[]>("/sessions")
      .then(setSessions)
      .catch(() => setSessions([]));
  }, [showAppNav, pathname]);

  useEffect(() => {
    if (!showAppNav) {
      delete document.body.dataset.sidebar;
      return;
    }

    document.body.dataset.sidebar = open ? "open" : "closed";

    return () => {
      delete document.body.dataset.sidebar;
    };
  }, [open, showAppNav]);

  function logout() {
    clearToken();
    router.push("/login");
  }

  if (!showAppNav) {
    return null;
  }

  return (
    <>
      <button
        className="sidebar-toggle"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Hide menu" : "Show menu"}
      >
        {open ? "Hide" : "Menu"}
      </button>

      <aside className={`app-sidebar ${open ? "open" : "closed"}`}>
        <div className="sidebar-top">
          <Link href="/dashboard" className="sidebar-brand">
            <span className="logo-mark">M</span>
            <span>MindPath AI</span>
          </Link>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/chat">Chat</Link>
          <Link href="/sessions">Sessions</Link>
          <Link href="/apps">Mini-apps</Link>
        </nav>

        <div className="sidebar-section">
          <p>Recent sessions</p>
          <div className="sidebar-history">
            {sessions.slice(0, 10).map((session) => (
              <Link
                key={session.id}
                href={`/chat?session=${session.id}`}
                onClick={() => saveCurrentSession(session.id)}
              >
                {session.title}
              </Link>
            ))}
            {sessions.length === 0 && <span>No sessions yet</span>}
          </div>
        </div>

        <div className="sidebar-footer">
          <button type="button" onClick={logout}>Logout</button>
        </div>
      </aside>
    </>
  );
}
