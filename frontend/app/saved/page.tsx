"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const SAVED_KEY = "younyx_saved";
const USER_ID_KEY = "younyx_user_id";

function getSavedStorageKey() {
  try {
    const uid = localStorage.getItem(USER_ID_KEY);
    return uid ? `${SAVED_KEY}_${uid}` : SAVED_KEY;
  } catch {
    return SAVED_KEY;
  }
}

export default function SavedPage() {
  const [saved, setSaved] = useState<any[]>([]);

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem(getSavedStorageKey()) || localStorage.getItem(SAVED_KEY) || "[]";
        const arr = Array.isArray(JSON.parse(raw)) ? (JSON.parse(raw) as any[]) : [];
        setSaved(arr);
      } catch { setSaved([]); }
    }
    load();
    function onStorage(e: StorageEvent) {
      if (!e.key) return;
      if (e.key === getSavedStorageKey() || e.key === SAVED_KEY) {
        load();
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function moveToCart(item: any) {
    try {
      const key = (localStorage.getItem("younyx_user_id") ? `younyx_cart_${localStorage.getItem("younyx_user_id")}` : "younyx_cart");
      const raw = localStorage.getItem(key) || localStorage.getItem("younyx_cart") || "[]";
      const cart = Array.isArray(JSON.parse(raw)) ? (JSON.parse(raw) as any[]) : [];
      const pid = String(item.productId ?? item.id);
      const idx = cart.findIndex((it) => String(it.id) === pid);
      if (idx >= 0) {
        cart[idx].qty = Math.min(2, (cart[idx].qty || 1) + 1);
      } else {
        cart.push({ id: pid, name: item.name, price: Number(item.price ?? 0), qty: 1, mainImageUrl: item.mainImageUrl ?? null });
      }
      localStorage.setItem(key, JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent("younyx:cart:changed", { detail: { cart } }));
      // remove from saved
      const next = saved.filter((s) => String(s.productId ?? s.id) !== pid);
      setSaved(next);
      localStorage.setItem(getSavedStorageKey(), JSON.stringify(next));
    } catch { /* ignore */ }
  }

  if (!saved || saved.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 text-center">
        <h2 className="text-2xl font-semibold">Saved for later</h2>
        <p className="text-gray-600 mt-4">You don't have any saved items.</p>
        <div className="mt-6">
          <Link href="/products" className="px-6 py-2 rounded bg-amber-500 text-black">Browse products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <h2 className="text-2xl font-bold mb-6">Saved for later</h2>
      <div className="space-y-3">
        {saved.map((s) => (
          <div key={String(s.productId ?? s.id)} className="bg-white rounded-lg p-3 flex items-center gap-3">
            <img src={(s.mainImageUrl ? s.mainImageUrl : "/demo/prod-fallback.jpg")} className="w-20 h-20 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-gray-600">₹{s.price}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => moveToCart(s)} className="px-3 py-1 rounded bg-black text-white">Move to cart</button>
              <button onClick={() => {
                const next = saved.filter((x) => String(x.productId ?? x.id) !== String(s.productId ?? s.id));
                setSaved(next);
                localStorage.setItem(getSavedStorageKey(), JSON.stringify(next));
              }} className="px-3 py-1 rounded border text-sm">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
