"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, setToken } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const response = await apiRequest<AuthResponse>(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setToken(response.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  return (
    <div className="auth-screen">
      <section className="auth-stage" aria-label="MindPath AI authentication">
        <div className="auth-shape shape-left" aria-hidden="true" />
        <div className="auth-shape shape-right" aria-hidden="true" />
        <div className="auth-wave wave-one" aria-hidden="true" />
        <div className="auth-wave wave-two" aria-hidden="true" />

        <div className="auth-card">
          <div>
            <p className="auth-brand">MindPath AI</p>
            <h1>{mode === "login" ? "Login" : "Register"}</h1>
            <p className="auth-copy">
              {mode === "login"
                ? "Sign in to continue your reflection sessions."
                : "Create your account to start using the workspace."}
            </p>
          </div>

          <div className="auth-mode-switch" aria-label="Authentication mode">
            <button
              className={mode === "login" ? "active" : ""}
              type="button"
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              type="button"
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                placeholder="username@gmail.com"
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                placeholder="Password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <div className="auth-helper-row">
              <span>{mode === "login" ? "Forgot password?" : "Use at least 6 characters."}</span>
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-submit" type="submit">
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="auth-footer">
            {mode === "login" ? "Do not have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Register for free" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
