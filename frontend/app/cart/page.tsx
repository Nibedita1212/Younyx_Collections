// app/cart/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CartClient from "../../components/CartClient"; // adjust path if needed

const RAW_API =
  typeof process !== "undefined" && process.env
    ? process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080/api"
    : "http://localhost:8080/api";

// normalize like CartClient: remove trailing /api or trailing slash
const API_BASE = String(RAW_API).replace(/\/api\/?$/i, "").replace(/\/$/, "");

// Shared helper (same as used in components)
function getUserIdFromStorage() {
  try {
    return localStorage.getItem("younyx_user_id") ?? undefined;
  } catch {
    return undefined;
  }
}
function getCartStorageKey() {
  const uid = getUserIdFromStorage();
  return uid ? `younyx_cart_${uid}` : "younyx_cart";
}

type User = { id: number; name: string; email: string };

export default function CartPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const url = `${API_BASE}/api/auth/me`;
        const res = await fetch(url, {
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 401) {
          // not authed -> redirect
          router.push("/");
          return;
        }

        if (!res.ok) {
          console.warn("[CartPage] /api/auth/me returned", res.status);
          router.push("/");
          return;
        }

        const data = await res.json();

        try {
          const uid =
            data?.id ??
            data?.userId ??
            (data?.admin && data.admin.id) ??
            (data?.user && data.user.id);

          if (uid) localStorage.setItem("younyx_user_id", String(uid));
        } catch {}

        if (mounted) setUser(data);
      } catch (err) {
        console.error("Failed to load cart user:", err);
        router.push("/");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // listen for storage changes (other tabs) -- if user id removed, redirect
    function onStorage(e: StorageEvent) {
      if (e.key === "younyx_user_id" && e.newValue === null) {
        try { router.push("/auth/login"); } catch { router.push("/"); }
      }
    }

    // listen for in-tab logout custom event
    function onAuthLogout() {
      try { router.push("/auth/login"); } catch { router.push("/"); }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("younyx:auth:logout", onAuthLogout as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("younyx:auth:logout", onAuthLogout as EventListener);
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-[var(--brand-gold)] px-4">
        <div className="w-full max-w-xs px-4 py-3 rounded-xl border border-[var(--brand-gold)]/40 bg-black/80 shadow-xl text-center">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--brand-gold)]/80 mb-1">Younyx</div>
          <div className="text-sm text-gray-200">Loading your cart…</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0d0d0d] to-[#040404] text-white">
      {/* Top bar */}
      <header className="border-b border-white/8 bg-black/75 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-bg)] flex items-center justify-center overflow-hidden ring-1 ring-[var(--brand-gold)]/40">
              <img src="/Younyx_logo.png" alt="Younyx" className="h-8 w-8 object-contain" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] uppercase tracking-wider text-[var(--brand-gold)]">SHOPPING CART</div>
              <div className="text-xs text-gray-300">
                Secure bag for <span className="font-medium text-[var(--brand-gold)]">{user.name || user.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center text-xs px-3 py-1.5 rounded-full border border-white/10 hover:border-[var(--brand-gold)]/60 hover:bg-white/3 transition"
            >
              Continue shopping
            </button>

            <button
              onClick={() => router.push("/checkout")}
              className="inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-gradient-to-b from-amber-400 to-amber-500 text-black font-semibold shadow hover:opacity-95 transition"
            >
              Secure Checkout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Your Bag</h1>
            <p className="text-gray-400 mt-2">Review your selected jewellery before checkout.</p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="px-3 py-1 rounded-full border border-[var(--brand-gold)]/60 bg-[var(--brand-gold)]/8 text-[10px] uppercase tracking-[0.18em] text-[var(--brand-gold)]">
              Secure Checkout
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: items list */}
          <section className="lg:col-span-2">
            <CartClient />
          </section>

          {/* Right summary */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-[#0f0f0f] rounded-2xl border border-white/8 p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-white mb-2">Order summary</h2>
                <p className="text-xs text-gray-400 mb-4">Taxes and shipping calculated at checkout.</p>

                <OrderSummaryMirror />

                <div className="mt-4 text-xs text-gray-500">Secure payments • Easy returns • 24/7 support</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ---------------- ORDER SUMMARY MIRROR ---------------- */

function parseCartRaw(raw: string | null) {
  try {
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch {
    return [];
  }
}

function OrderSummaryMirror() {
  const [totals, setTotals] = useState({
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0,
  });

  // compute totals from cart array
  function recalcFromArray(arr: any[]) {
    try {
      let subtotal = 0;
      for (const it of arr) {
        const price = Number(it.price ?? it.unitPrice ?? 0) || 0;
        const qty = Number(it.qty ?? it.quantity ?? it.count ?? 1) || 0;
        subtotal += price * qty;
      }
      const shipping = subtotal > 0 ? 50 : 0;
      const discount = 0;
      const total = subtotal + shipping - discount;
      setTotals({ subtotal, shipping, discount, total });
    } catch {
      setTotals({ subtotal: 0, shipping: 0, discount: 0, total: 0 });
    }
  }

  useEffect(() => {
    // initial read (prefer user-specific key, fallback to generic)
    const key = getCartStorageKey();
    const raw = localStorage.getItem(key) ?? localStorage.getItem("younyx_cart") ?? "[]";
    recalcFromArray(parseCartRaw(raw));

    // handler for custom event dispatched by CartClient (younyx:cart:changed)
    function onCustom(ev: Event) {
      try {
        const e = ev as CustomEvent;
        if (e?.detail?.cart && Array.isArray(e.detail.cart)) {
          recalcFromArray(e.detail.cart);
          return;
        }
      } catch { /* ignore */ }

      // fallback: read current storage (user-specific key)
      const k = getCartStorageKey();
      const r = localStorage.getItem(k) ?? localStorage.getItem("younyx_cart") ?? "[]";
      recalcFromArray(parseCartRaw(r));
    }

    // storage event handler (other tabs)
    function onStorage(e: StorageEvent) {
      const myKey = getCartStorageKey();
      if (e.key === myKey || e.key === "younyx_cart" || e.key === null) {
        const rawNew = localStorage.getItem(myKey) ?? localStorage.getItem("younyx_cart") ?? "[]";
        recalcFromArray(parseCartRaw(rawNew));
      }
    }

    window.addEventListener("younyx:cart:changed", onCustom as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("younyx:cart:changed", onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-gray-300">
        <span>Subtotal</span>
        <span className="text-gray-100">₹{totals.subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-sm text-gray-300">
        <span>Estimated shipping</span>
        <span className="text-gray-100">₹{totals.shipping.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-sm text-gray-300">
        <span>Discount</span>
        <span className="text-gray-100">₹{totals.discount.toFixed(2)}</span>
      </div>

      <div className="h-px bg-white/8 my-3" />

      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-100">Total</div>
          <div className="text-lg font-semibold text-[var(--brand-gold)]">
            ₹{totals.total.toFixed(2)}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => (window.location.href = "/checkout")}
            className="
              px-4 py-2 rounded 
              bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)]
              text-black font-semibold
              transition duration-150 ease-in-out
              hover:opacity-95 hover:shadow-lg hover:scale-[1.02]
            "
          >
            Proceed
          </button>

          <button
            onClick={() => (window.location.href = "/wishlist")}
            className="
              px-4 py-2 rounded border text-sm
              transition duration-150 ease-in-out
              hover:bg-white/10 
              hover:border-[var(--brand-gold)]
              hover:text-[var(--brand-gold)]
              hover:shadow-md 
              hover:scale-[1.02]"
          >
            Move from wishlist
          </button>
        </div>
      </div>
    </div>
  );
}
