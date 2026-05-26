"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function WelcomePage() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("mindpath_theme") as Theme | null;
    const initialTheme = saved === "dark" ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("mindpath_theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }

  return (
    <div className="welcome-screen">
      <section className="welcome-stage" aria-label="MindPath AI welcome">
        <button
          className="welcome-theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
        >
          {theme === "dark" ? "☾" : "☀"}
        </button>

        <div className="welcome-copy">
          <div className="welcome-mark">M</div>
          <p className="eyebrow">MindPath AI</p>
          <h1>Welcome</h1>
          <p>
            Start with a focused reflection workspace, then move through login,
            guided chat, mini-apps, and a final session summary.
          </p>
          <div className="welcome-steps" aria-label="Application flow">
            <span>Welcome</span>
            <span>Login</span>
            <span>Dashboard</span>
          </div>
          <div className="actions">
            <Link className="button" href="/login">Continue to login</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
