"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, clearToken, getToken } from "@/lib/api";

type Theme = "light" | "dark";
type AiProviderOption = {
  id: string;
  label: string;
  configured: boolean;
  models: string[];
};
type AiSettings = {
  provider: string;
  model: string | null;
  configured: boolean;
  options: AiProviderOption[];
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [theme, setTheme] = useState<Theme>("light");
  const [aiSettings, setAiSettings] = useState<AiSettings | null>(null);
  const [aiError, setAiError] = useState("");
  const showAppNav = pathname !== "/" && pathname !== "/login";

  useEffect(() => {
    if (!showAppNav || !getToken()) {
      return;
    }

    apiRequest<AiSettings>("/settings/ai")
      .then(setAiSettings)
      .catch(() => setAiSettings(null));
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

  useEffect(() => {
    const saved = localStorage.getItem("mindpath_theme") as Theme | null;
    const initialTheme = saved === "dark" ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  function logout() {
    clearToken();
    router.push("/login");
  }

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("mindpath_theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }

  async function updateAiSettings(provider: string, model?: string | null) {
    setAiError("");
    try {
      const option = aiSettings?.options.find((item) => item.id === provider);
      const selectedModel = model || option?.models[0] || "";
      const updated = await apiRequest<AiSettings>("/settings/ai", {
        method: "PUT",
        body: JSON.stringify({ provider, model: selectedModel })
      });
      setAiSettings(updated);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Could not update AI settings");
    }
  }

  const modelButtons = aiSettings?.options.flatMap((option) =>
    option.models.map((model) => ({
      provider: option.id,
      label: option.label,
      model,
      configured: option.configured,
      active: option.id === aiSettings.provider && model === aiSettings.model
    }))
  ).sort((a, b) => {
    if (a.active !== b.active) {
      return a.active ? -1 : 1;
    }
    if (a.configured !== b.configured) {
      return a.configured ? -1 : 1;
    }
    return a.label.localeCompare(b.label) || a.model.localeCompare(b.model);
  }) || [];

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
      <button
        className="app-theme-toggle"
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle color theme"
      >
        {theme === "dark" ? "☾" : "☀"}
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
          <Link href="/apps">Guided tools</Link>
        </nav>

        <div className="sidebar-status">
          <span>Models</span>
          <div className="model-list">
            {modelButtons.map((item) => (
              <button
                key={`${item.provider}:${item.model}`}
                className={`model-button ${item.active ? "active" : ""}`}
                type="button"
                onClick={() => updateAiSettings(item.provider, item.model)}
                disabled={!item.configured}
              >
                <span className={`model-dot ${item.configured ? "online" : "offline"}`} />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.model}</small>
                </span>
              </button>
            ))}
          </div>
          {aiError && <p>{aiError}</p>}
        </div>

        <div className="sidebar-footer">
          <button type="button" onClick={logout}>Logout</button>
        </div>
      </aside>
    </>
  );
}
