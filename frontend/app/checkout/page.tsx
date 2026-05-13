"use client";

import React from "react";
import { useProtectedPage } from "../lib/useProtected";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading } = useProtectedPage("/");

  React.useEffect(() => {
    try {
      const uid = localStorage.getItem("younyx_user_id");
      const raw = uid
        ? localStorage.getItem(`younyx_cart_${uid}`) || "[]"
        : localStorage.getItem("younyx_cart") || "[]";

      const arr = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];

      if (!arr || arr.length === 0) {
        setTimeout(() => router.push("/cart"), 250);
      }
    } catch {}
  }, [router]);

  // 👉 ALWAYS CALL HOOKS BEFORE ANY RETURN
  const totals = React.useMemo(() => {
    try {
      const uid = localStorage.getItem("younyx_user_id");
      const raw = uid
        ? localStorage.getItem(`younyx_cart_${uid}`) || "[]"
        : localStorage.getItem("younyx_cart") || "[]";

      const arr = Array.isArray(JSON.parse(raw)) ? (JSON.parse(raw) as any[]) : [];

      let subtotal = 0;
      for (const it of arr)
        subtotal += Number(it.price || 0) * (Number(it.qty || it.quantity || 1));

      const shipping = subtotal > 0 ? 50 : 0;
      const discount = 0;
      const total = subtotal + shipping - discount;

      return { subtotal, shipping, discount, total, items: arr };
    } catch {
      return { subtotal: 0, shipping: 0, discount: 0, total: 0, items: [] };
    }
  }, []);

  // Now it's safe 👇
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-[var(--brand-gold)] px-4">
        <div className="w-full max-w-xs px-4 py-3 rounded-xl border border-[var(--brand-gold)]/40 bg-black/80 shadow-xl text-center">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--brand-gold)]/80 mb-1">
            Younyx
          </div>
          <div className="text-sm text-gray-200">Preparing checkout…</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#111111] to-[#050505] text-white">
      <header className="border-b border-white/10 bg-black/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[var(--brand-gold)]">Checkout</div>
            <div className="text-xs sm:text-sm text-gray-200">Complete your order</div>
          </div>
          <button onClick={() => router.push("/cart")} className="inline-flex text-xs px-3 py-1.5 rounded-full border border-white/10 hover:border-[var(--brand-gold)]/60 hover:bg-white/5 transition">Back to cart</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-5 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-[#101010] rounded-2xl border border-white/10 p-4">
            <h2 className="text-lg font-semibold mb-3">Shipping details</h2>
            <div className="text-sm text-gray-300 mb-4">We'll use your saved address. You can edit it on account page.</div>
            <div className="text-sm text-gray-300"><div><strong>Full name:</strong> {user.name || user.email}</div></div>
            <div className="mt-6">
              <h3 className="text-base font-semibold mb-2">Payment</h3>
              <p className="text-sm text-gray-400">We support UPI, cards and netbanking. (Payment integration not included in this demo.)</p>
            </div>
            <div className="mt-6">
              <button onClick={() => alert("Proceed to payment (integration required)")} className="px-4 py-2 rounded bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)] text-black font-semibold">Pay ₹{totals.total.toFixed(2)}</button>
            </div>
          </section>

          <aside className="bg-[#101010] rounded-2xl border border-white/10 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Order summary</h3>
            <div className="text-sm text-gray-300 flex justify-between"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
            <div className="text-sm text-gray-300 flex justify-between"><span>Shipping</span><span>₹{totals.shipping.toFixed(2)}</span></div>
            <div className="text-sm text-gray-300 flex justify-between"><span>Discount</span><span>₹{totals.discount.toFixed(2)}</span></div>
            <div className="h-px bg-white/10 my-3" />
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-100">Total</div>
                <div className="text-lg font-semibold text-[var(--brand-gold)]">₹{totals.total.toFixed(2)}</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
