// app/wishlist/page.tsx
"use client";

import React from "react";
import WishlistClient from "../../components/WishlistClient";
import { useProtectedPage } from "../lib/useProtected";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading } = useProtectedPage("/");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-[var(--brand-gold)] px-4">
        <div className="w-full max-w-xs px-4 py-3 rounded-xl border border-[var(--brand-gold)]/40 bg-black/80 shadow-xl text-center">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--brand-gold)]/80 mb-1">Younyx</div>
          <div className="text-sm text-gray-200">Loading your wishlist…</div>
        </div>
      </div>
    );
  }

  if (!user) {
    // if useProtectedPage redirects, this may not show; otherwise safe fallback
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center p-6">
          <h2 className="text-lg font-semibold">Please login</h2>
          <button onClick={() => router.push("/login?next=/wishlist")} className="mt-3 px-4 py-2 rounded-full bg-[var(--brand-gold)] text-black font-medium">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0b0b] to-[#050505] text-white">
      <header className="border-b border-white/6 bg-black/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-bg)] flex items-center justify-center overflow-hidden ring-1 ring-[var(--brand-gold)]/40">
              <img src="/Younyx_logo.png" alt="Younyx" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--brand-gold)]">Wishlist</div>
              <div className="text-xs text-gray-300">Saved by <span className="font-medium text-[var(--brand-gold)]">{user.name || user.email}</span></div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/collections")} className="px-3 py-1.5 rounded-full border border-white/6 hover:border-[var(--brand-gold)] transition">Collections</button>
            <button onClick={() => router.push("/")} className="px-3 py-1.5 rounded-full bg-[var(--brand-gold)] text-black font-semibold">Shop</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Your Wishlist</h1>
            <p className="text-sm text-gray-400 mt-1">A curated list of items you saved.</p>
          </div>
          <div className="text-sm text-gray-400">Total: <span className="text-[var(--brand-gold)] font-semibold">{/* optionally show total count */}</span></div>
        </div>

        <section className="bg-[#0b0b0b] rounded-2xl border border-white/6 shadow-2xl p-5">
          <WishlistClient />
        </section>
      </main>
    </div>
  );
}
