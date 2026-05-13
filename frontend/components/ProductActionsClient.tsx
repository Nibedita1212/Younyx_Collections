"use client";

import React, { useEffect, useState, useRef } from "react";

type Props = {
  productId: number | string;
  productName?: string;
  price?: number | string;
  stock?: number | null;
  imageUrl?: string | null;
};

const CART_KEY = "younyx_cart";
const WISHLIST_KEY = "younyx_wishlist";
const USER_ID_KEY = "younyx_user_id";

const MAX_PER_PRODUCT = 2;
const MIN_PER_PRODUCT = 1;

export default function ProductActionsClient({
  productId,
  productName,
  price,
  stock,
  imageUrl,
}: Props) {
  const idKey = String(productId);
  const [busy, setBusy] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const pendingActionRef = useRef<string | null>(null);

  function getUserIdFromStorage() {
    try {
      return localStorage.getItem(USER_ID_KEY) ?? undefined;
    } catch {
      return undefined;
    }
  }
  function getCartStorageKey() {
    const uid = getUserIdFromStorage();
    return uid ? `${CART_KEY}_${uid}` : CART_KEY;
  }

  function showTemp(msg: string, ttl = 1500) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), ttl);
  }

  async function ensureAuthOrRedirect(): Promise<boolean> {
    try {
      const uid = getUserIdFromStorage();
      if (uid) return true;
      // not logged in — open login page (simple redirect)
      const loginUrl = "/auth/login";
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `${loginUrl}?next=${returnTo}`;
      return false;
    } catch {
      return false;
    }
  }

  async function addToCart() {
    const ok = await ensureAuthOrRedirect();
    if (!ok) return;

    const available = (Number(stock ?? 0) || 0) > 0;
    if (!available) {
      showTemp("Out of stock");
      return;
    }

    setBusy(true);
    try {
      const key = getCartStorageKey();
      const raw = localStorage.getItem(key) || localStorage.getItem(CART_KEY) || "[]";
      let cart = Array.isArray(JSON.parse(raw)) ? (JSON.parse(raw) as any[]) : [];

      // upsert
      const idx = cart.findIndex((it) => String(it.id) === idKey || String(it.productId) === idKey);
      if (idx >= 0) {
        const existingQty = Number(cart[idx].qty || 1);
        cart[idx].qty = Math.min(MAX_PER_PRODUCT, Math.max(MIN_PER_PRODUCT, existingQty + 1));
      } else {
        cart.push({
          id: idKey,
          productId,
          name: productName ?? `Product ${productId}`,
          price: Number(price ?? 0),
          qty: 1,
          mainImageUrl: imageUrl ?? null,
          addedAt: Date.now(),
        });
      }

      // persist under user-specific key and also generic fallback
      localStorage.setItem(key, JSON.stringify(cart));
      try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
      try { window.dispatchEvent(new CustomEvent("younyx:cart:changed", { detail: { cart } })); } catch {}

      showTemp("Added to cart");
    } catch (e) {
      console.warn("addToCart error:", e);
      showTemp("Could not add to cart");
    } finally {
      setBusy(false);
    }

    // best-effort: try to sync to backend (so server-side cart also updates)
    (async () => {
      try {
        const uid = localStorage.getItem(USER_ID_KEY);
        await fetch("/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(uid ? { "X-User-Id": uid } : {}),
          },
          credentials: "include",
          body: JSON.stringify({ productId: Number(productId), qty: 1 }),
        });
      } catch (e) {
        // ignore - offline / backend not ready
      }
    })();
  }

  // wishlist toggling (kept minimal)
  function toggleWishlist() {
    try {
      const key = (localStorage.getItem(USER_ID_KEY) ? `${WISHLIST_KEY}_${localStorage.getItem(USER_ID_KEY)}` : WISHLIST_KEY);
      const raw = localStorage.getItem(key) || "[]";
      const arr = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
      const idx = arr.findIndex((it: any) => String(it) === idKey || (it && String(it.productId) === idKey));
      if (idx >= 0) {
        arr.splice(idx, 1);
        setInWishlist(false);
      } else {
        arr.push(idKey);
        setInWishlist(true);
      }
      localStorage.setItem(key, JSON.stringify(arr));
      try { window.dispatchEvent(new CustomEvent("younyx:wishlist:changed", { detail: { wishlist: arr } })); } catch {}
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    // initialize wishlist state from localStorage
    try {
      const key = (localStorage.getItem(USER_ID_KEY) ? `${WISHLIST_KEY}_${localStorage.getItem(USER_ID_KEY)}` : WISHLIST_KEY);
      const raw = localStorage.getItem(key) || "[]";
      const arr = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
      const idx = arr.findIndex((it: any) => String(it) === idKey || (it && String(it.productId) === idKey));
      setInWishlist(idx >= 0);
    } catch {
      setInWishlist(false);
    }
  }, [idKey]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onClick={addToCart} disabled={busy} className="px-4 py-2 bg-emerald-600 rounded text-white">
          {busy ? "Adding…" : "Add to cart"}
        </button>

        <button onClick={toggleWishlist} className="px-3 py-2 border rounded">
          {inWishlist ? "In wishlist" : "Wishlist"}
        </button>
      </div>

      {feedback && <div className="text-sm text-emerald-300">{feedback}</div>}
    </div>
  );
}
