// app/lib/useProtected.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = Record<string, any> | null | undefined;

const AUTH_BROADCAST_KEY = "younyx:auth";
const AUTH_CUSTOM_EVENT = "younyx:auth:changed";
const USER_KEY = "younyx_user";
const USER_ID_KEY = "younyx_user_id";
const ROLE_KEY = "younyx_role";

/**
 * useProtectedPage
 * - fetches /api/auth/me (credentials included)
 * - if /api/auth/me returns minimal data, attempts /api/customers/me to fetch DB fields
 * - redirects to redirectTo (default "/") when unauthenticated (401)
 * - listens to cross-tab logout/login and same-tab custom event and redirects immediately if unauthenticated
 *
 * returns: { user, loading }
 */
export function useProtectedPage(redirectTo: string = "/") {
  const router = useRouter();
  const [user, setUser] = useState<User>(undefined); // undefined = loading, null = not logged in, object = logged in
  const [loading, setLoading] = useState(true);

  // helper to persist user for fast UI
  function persistUser(u: any, role?: string | null) {
    try {
      if (u) {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        if (u.id) localStorage.setItem(USER_ID_KEY, String(u.id));
      } else {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(USER_ID_KEY);
      }
      if (role) localStorage.setItem(ROLE_KEY, role);
    } catch (e) {
      // ignore storage errors
    }
  }

  // Try to fetch /api/customers/me (DB-backed) as a follow-up if auth/me returns minimal info
  async function fetchCustomerMe(fallbackUid?: string | null) {
    try {
      const headers: Record<string, string> = {};
      if (fallbackUid) headers["X-User-Id"] = fallbackUid;
      const res = await fetch("/api/customers/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers,
      });

      if (!res.ok) {
        return null;
      }
      const data = await res.json().catch(() => null);
      return data ?? null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchMe() {
      setLoading(true);
      try {
        // primary call: /api/auth/me (validates cookie/token server-side)
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (cancelled) return;

        // 401 -> unauthenticated: clear and redirect
        if (res.status === 401) {
          setUser(null);
          try {
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(USER_ID_KEY);
            localStorage.removeItem(ROLE_KEY);
            localStorage.setItem(AUTH_BROADCAST_KEY, String(Date.now()));
            window.dispatchEvent(new CustomEvent(AUTH_CUSTOM_EVENT));
          } catch {}
          if (typeof window !== "undefined" && window.location.pathname !== redirectTo) {
            router.replace(redirectTo);
          }
          return;
        }

        if (!res.ok) {
          // treat as anonymous (server error or other): clear and redirect
          setUser(null);
          try {
            // keep behavior consistent: if not authorized, send user to redirect
            if (typeof window !== "undefined" && window.location.pathname !== redirectTo) {
              router.replace(redirectTo);
            }
          } catch {}
          return;
        }

        const data = await res.json().catch(() => null);

        // Normalize primary response — accept many shapes
        let normalized: any = null;
        let normalizedRole: string | null = null;

        if (!data) normalized = null;
        else if (data.user) {
          normalized = data.user;
          normalizedRole = data.role ?? null;
        } else if (data.admin) {
          normalized = data.admin;
          normalizedRole = "admin";
        } else if (data.customer) {
          normalized = data.customer;
          normalizedRole = "customer";
        } else if (data.email && (data.name || data.id)) {
          normalized = { id: data.id ?? null, email: data.email, name: data.name };
          normalizedRole = data.role ?? null;
        } else {
          normalized = data;
        }

        // If normalized is minimal (only email/name) -> attempt /api/customers/me to get DB fields
        const minimal = normalized && (
          (normalized.email || normalized.name) &&
          !normalized.phone && !normalized.city && !normalized.flatBuildingArea && !normalized.pincode
        );

        let finalUser = normalized;

        if (minimal) {
          // try to fetch the richer customer payload
          const fallbackUid = (() => {
            try {
              return localStorage.getItem(USER_ID_KEY);
            } catch {
              return null;
            }
          })();

          const cust = await fetchCustomerMe(fallbackUid);
          if (cust) {
            // /api/customers/me might return { success: true, ...fields } or direct object.
            // Normalize: if cust.success is true and contains id/email -> use it.
            if (cust.success === true && (cust.id || cust.email)) {
              // remove success flag and use the payload fields
              const copy = { ...cust };
              delete copy.success;
              finalUser = copy;
            } else if (cust.id || cust.email) {
              finalUser = cust;
            }
          }
        }

        if (cancelled) return;

        // finalUser may still be null if something odd happened
        setUser(finalUser ?? null);

        // Persist a fast copy for UI
        try {
          persistUser(finalUser, normalizedRole ?? null);
        } catch {}

      } catch (err) {
        // network / unexpected error -> treat as anonymous and redirect
        console.error("useProtectedPage: fetch /api/auth/me failed", err);
        if (!cancelled) {
          setUser(null);
          try {
            if (typeof window !== "undefined" && window.location.pathname !== redirectTo) {
              router.replace(redirectTo);
            }
          } catch {}
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMe();

    // listeners: only trigger a reload/redirect when auth state changes
    function onStorage(e: StorageEvent) {
      if (e.key === AUTH_BROADCAST_KEY) {
        // another tab changed auth — re-check / redirect
        // If we are on the protected page, force a reload to re-run hook (router.replace will re-run useEffect)
        if (typeof window !== "undefined" && window.location.pathname !== redirectTo) {
          router.replace(redirectTo);
        }
      }
      // if the user id was removed in another tab, redirect as well
      if (e.key === USER_ID_KEY && e.newValue === null) {
        if (typeof window !== "undefined" && window.location.pathname !== redirectTo) {
          router.replace(redirectTo);
        }
      }
    }

    function onCustom() {
      // same-tab broadcast (Auth events) — redirect to login/provided redirectTo
      if (typeof window !== "undefined" && window.location.pathname !== redirectTo) {
        router.replace(redirectTo);
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_CUSTOM_EVENT, onCustom as EventListener);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_CUSTOM_EVENT, onCustom as EventListener);
    };
  }, [router, redirectTo]);

  return { user, loading };
}
