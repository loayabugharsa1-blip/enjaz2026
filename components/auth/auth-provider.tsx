"use client";
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { getSession, logout as doLogout } from "@/lib/auth/storage";
import type { Session } from "@/types/auth";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  refresh: () => void;
  logout: () => void;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function initSession(): Session | null {
  if (typeof window === "undefined") return null;
  return getSession();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(initSession);
  const [loading] = useState(false);

  const refresh = useCallback(() => {
    setSession(getSession());
  }, []);

  const logout = useCallback(() => {
    doLogout();
    setSession(null);
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === "injaz_session") {
        setSession(getSession());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value: AuthContextValue = {
    session,
    loading,
    refresh,
    logout,
    isAdmin: session?.role === "admin",
    isStaff: session?.role === "staff",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
