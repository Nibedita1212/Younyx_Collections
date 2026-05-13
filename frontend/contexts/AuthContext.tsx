// frontend/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";

export type User = {
  id: string | number | null;
  name?: string;
  email?: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = "younyx_user";
const USER_ID_KEY = "younyx_user_id";
const CART_CHANGED = "younyx:cart:changed";
const AUTH_CHANGED = "younyx:auth:changed";

/** persist or remove user in localStorage */
function persistUser(userObj: User | null) {
  try {
    if (!userObj) {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(USER_ID_KEY);
      return;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(userObj));
    if (userObj.id !== null && userObj.id !== undefined) {
      localStorage.setItem(USER_ID_KEY, String(userObj.id));
    }
  } catch {
    // ignore storage errors
  }
}

/**
 * migrate anonymous cart -> user-specific key if necessary.
 * accepts undefined too to avoid TS complaints when caller has optional id.
 */
function migrateCart(uid?: string | number | null) {
  try {
    if (!uid) {
      // no user id -> nothing to migrate
      return;
    }
    const anon = localStorage.getItem("younyx_cart");
    const userKey = `younyx_cart_${uid}`;
    const existing = localStorage.getItem(userKey);

    // if anonymous cart present and user-specific missing or empty, migrate
    if (anon && (!existing || existing === "[]")) {
      localStorage.setItem(userKey, anon);
    }

    // remove generic anon key (app expects user-specific storage when logged in)
    localStorage.removeItem("younyx_cart");

    // notify listeners
    try {
      const detail = { cart: JSON.parse(localStorage.getItem(userKey) || "[]") };
      window.dispatchEvent(new CustomEvent(CART_CHANGED, { detail }));
    } catch {
      // if parse fails, still dispatch simple event
      window.dispatchEvent(new CustomEvent(CART_CHANGED));
    }
  } catch {
    // ignore storage errors
  }
}

/** normalize different backend shapes into a small user object or null */
function normalizeUser(data: any): User {
  if (!data) return null;
  // backend might return { user }, { customer }, { admin } or plain object
  let d = data;
  if (d.user) d = d.user;
  if (d.customer) d = d.customer;
  if (d.admin) d = d.admin;

  return {
    id: d.id ?? null,
    name: d.name ?? d.fullName ?? d.username ?? "",
    email: d.email ?? "",
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch /api/auth/me and return normalized user or null
  async function refresh(): Promise<User | null> {
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/me", { method: "GET" });

      if (!res.ok) {
        setUser(null);
        persistUser(null);
        setLoading(false);
        return null;
      }

      const normalized = normalizeUser(res.data);
      setUser(normalized);
      persistUser(normalized);
      migrateCart(normalized?.id);
      setLoading(false);
      return normalized;
    } catch (err) {
      setUser(null);
      persistUser(null);
      setLoading(false);
      return null;
    }
  }

  // on mount attempt to refresh session
  useEffect(() => {
    (async () => {
      await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // login (POST /api/auth/login). backend sets auth cookie; we then refresh profile.
  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = res.data?.message ?? `Login failed (${res.status})`;
        throw new Error(msg);
      }

      // backend may return user or token; refresh canonical profile
      const prof = await refresh();
      if (!prof) {
        // still consider login failed if /me didn't return a user
        throw new Error("Could not load profile after login");
      }

      window.dispatchEvent(new CustomEvent(AUTH_CHANGED));
    } finally {
      setLoading(false);
    }
  }

  // signup then refresh session
  async function register(payload: any) {
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(res.data?.message ?? `Signup failed (${res.status})`);
      }

      // after signup backend commonly returns created user or sets cookie; refresh
      await refresh();
      window.dispatchEvent(new CustomEvent(AUTH_CHANGED));
    } finally {
      setLoading(false);
    }
  }

  // logout: call API then clear client state
  async function logout() {
    setLoading(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore network error on logout
    } finally {
      setUser(null);
      persistUser(null);
      try {
        window.dispatchEvent(new CustomEvent(AUTH_CHANGED));
      } catch {}
      try {
        router.push("/");
      } catch {}
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
