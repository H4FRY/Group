"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, clearToken, getToken } from "@/lib/api";
import type { User } from "@/lib/types";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyToken() {
      if (!getToken()) {
        router.push("/login");
        return;
      }

      try {
        await apiRequest<User>("/auth/me");
        if (!cancelled) {
          setReady(true);
        }
      } catch {
        clearToken();
        if (!cancelled) {
          router.push("/login");
        }
      }
    }

    verifyToken();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return <div className="container"><div className="panel">Loading...</div></div>;
  }

  return <>{children}</>;
}
