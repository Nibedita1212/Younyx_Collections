"use client";

import React, { useEffect, useState } from "react";
import WishlistItemCard from "./WishlistItemCard";
import { useRouter } from "next/navigation";

/* -------------------------
   Helper functions (kept local to this file)
   ------------------------- */

const RAW_API =
  typeof window !== "undefined" && process.env
    ? process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080/api"
    : "http://localhost:8080/api";
const API_BASE = String(RAW_API).replace(/\/api\/?$/i, "").replace(/\/$/, "");

const WISHLIST_KEY = "younyx_wishlist";
const CART_KEY = "younyx_cart";
const USER_ID_KEY = "younyx_user_id";

function showToast(msg: string) {
  try {
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.position = "fixed";
    el.style.right = "16px";
    el.style.bottom = "16px";
    el.style.background = "#111";
    el.style.color = "#fff";
    el.style.padding = "8px 12px";
    el.style.borderRadius = "8px";
    el.style.zIndex = "99999";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  } catch {}
}

function getUserIdFromStorage() {
  try {
    const v = localStorage.getItem(USER_ID_KEY);
    if (!v || v === "null") return undefined;
    return v;
  } catch {
    return undefined;
  }
}
function getWishlistStorageKey() {
  const uid = getUserIdFromStorage();
  return uid ? `${WISHLIST_KEY}_${uid}` : WISHLIST_KEY;
}
function getCartStorageKey() {
  const uid = getUserIdFromStorage();
  return uid ? `${CART_KEY}_${uid}` : CART_KEY;
}

function buildRequestOptions(method = "GET", body?: any, extraHeaders?: Record<string, string>) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...extraHeaders,
  };
  if (method !== "GET") headers["Content-Type"] = "application/json";

  const opts: RequestInit = {
    method,
    headers,
    credentials: "include",
    cache: "no-store",
  };
  if (body != null) opts.body = JSON.stringify(body);
  return opts;
}

/* -------------------------
   Component
   ------------------------- */

export default function WishlistClient() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState<boolean>(true); // assume true until check

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, buildRequestOptions("GET"));
        if (!mounted) return;
        if (res.ok) {
          const body = await res.json().catch(() => null);
          const uid =
            body?.id ??
            body?.userId ??
            (body?.admin && body.admin.id) ??
            (body?.user && body.user.id) ??
            null;
          if (uid) {
            try {
              localStorage.setItem(USER_ID_KEY, String(uid));
            } catch {}
          }
          setLoggedIn(true);
          return;
        } else {
          setLoggedIn(false);
          if (res.status === 401) {
            try { localStorage.removeItem(USER_ID_KEY); } catch {}
          }
        }
      } catch (err) {
        const token = localStorage.getItem("token");
        const uid = localStorage.getItem(USER_ID_KEY);
        setLoggedIn(Boolean(token || uid));
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadFromServer(uid?: string) {
      try {
        const headers: Record<string, string> = {};
        if (uid) headers["X-User-Id"] = uid;
        const res = await fetch(`${API_BASE}/api/wishlist`, buildRequestOptions("GET", undefined, headers));
        if (!mounted) return null;

        if (!res.ok) {
          let bodyText = "";
          try { bodyText = await res.text(); } catch {}
          console.warn("[Wishlist] /api/wishlist non-ok:", res.status, bodyText);
          if (res.status === 401) {
            try { localStorage.removeItem(USER_ID_KEY); } catch {}
            setLoggedIn(false);
          } else {
            showToast("Unable to load wishlist from server");
          }
          return null;
        }

        const json = await res.json().catch(() => null);
        if (!json) return null;

        // If server returned full product objects
        if (Array.isArray(json) && json.length > 0 && typeof json[0] === "object") {
          try {
            const ids = json.map((p: any) => String(p.id ?? p));
            localStorage.setItem(getWishlistStorageKey(), JSON.stringify(ids));
            try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids)); } catch {}
          } catch {}
          return json;
        }

        // If server returned array of primitive ids (strings/numbers), fetch each product
        if (Array.isArray(json) && json.length > 0 && (typeof json[0] === "string" || typeof json[0] === "number")) {
          const ids = json.map((p: any) => String(p));
          try {
            localStorage.setItem(getWishlistStorageKey(), JSON.stringify(ids));
            try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids)); } catch {}
          } catch {}

          const fetched: any[] = [];
          for (const id of ids) {
            try {
              const r = await fetch(`${API_BASE}/api/products/${encodeURIComponent(String(id))}`, buildRequestOptions("GET"));
              if (r.ok) {
                const p = await r.json().catch(() => null);
                if (p) fetched.push(p);
              } else {
                console.warn("[Wishlist] product fetch non-ok", id, r.status);
              }
            } catch (err) {
              console.warn("[Wishlist] failed to fetch product", id, err);
            }
          }
          return fetched;
        }

        // empty array or unknown format
        if (Array.isArray(json) && json.length === 0) {
          try {
            localStorage.setItem(getWishlistStorageKey(), JSON.stringify([]));
            try { localStorage.setItem(WISHLIST_KEY, JSON.stringify([])); } catch {}
          } catch {}
          return [];
        }

        return null;
      } catch (err) {
        console.error("[Wishlist] loadFromServer failed:", err);
        return null;
      }
    }

    async function loadFallbackFromLocal() {
      try {
        const raw = localStorage.getItem(getWishlistStorageKey()) || localStorage.getItem(WISHLIST_KEY) || "[]";
        const ids = Array.isArray(JSON.parse(raw)) ? (JSON.parse(raw) as string[]) : [];
        if (ids.length === 0) return [];
        const fetched: any[] = [];
        for (const id of ids) {
          try {
            const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(String(id))}`, buildRequestOptions("GET"));
            if (res.ok) {
              const p = await res.json();
              fetched.push(p);
            }
          } catch (err) {
            console.warn("[Wishlist] failed to fetch product", id, err);
          }
        }
        return fetched;
      } catch (err) {
        console.error("[Wishlist] loadFallbackFromLocal failed:", err);
        return [];
      }
    }

    async function load() {
      setLoading(true);
      try {
        if (loggedIn) {
          const uid = getUserIdFromStorage();
          const serverList = await loadFromServer(uid);
          console.debug("[Wishlist] loadFromServer returned:", serverList);
          if (serverList !== null) {
            if (mounted) setProducts(serverList);
            return;
          }
        }
        const fallback = await loadFallbackFromLocal();
        if (mounted) setProducts(fallback);
      } catch (err) {
        console.error("Wishlist load failed:", err);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    function onStorage(e: StorageEvent) {
      const myKey = getWishlistStorageKey();
      if (!e.key) return;
      if (e.key === myKey || e.key === WISHLIST_KEY) {
        load();
      }
    }
    function onCustom(e: any) {
      if (e?.detail?.list) {
        load();
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("younyx:wishlist:changed", onCustom as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("younyx:wishlist:changed", onCustom as EventListener);
    };
  }, [loggedIn]);

  async function removeFromWishlist(productId: any) {
    const idKey = String(productId);
    setProducts((prev) => prev.filter((p) => String(p.id) !== idKey));

    try {
      const raw = localStorage.getItem(getWishlistStorageKey()) || localStorage.getItem(WISHLIST_KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      const normalized = Array.isArray(arr) ? arr.map((x: any) => String(x)).filter((id) => id !== idKey) : [];
      localStorage.setItem(getWishlistStorageKey(), JSON.stringify(normalized));
      try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(normalized)); } catch {}
      try { window.dispatchEvent(new CustomEvent("younyx:wishlist:changed", { detail: { list: normalized } })); } catch {}
    } catch (err) {
      console.warn("Failed to update local wishlist storage:", err);
    }

    try {
      const uid = getUserIdFromStorage();
      const headers: Record<string, string> = {};
      if (uid) headers["X-User-Id"] = uid;
      const res = await fetch(`${API_BASE}/api/wishlist/toggle`, buildRequestOptions("POST", { productId: Number(productId) }, headers));
      if (!res.ok) {
        let bodyText = "";
        try { bodyText = await res.text(); } catch {}
        console.warn("[Wishlist] toggle remove non-ok:", res.status, bodyText);
        if (res.status === 401) {
          try { localStorage.removeItem(USER_ID_KEY); } catch {}
          setLoggedIn(false);
        }
      }
    } catch (err) {
      console.warn("Wishlist toggle request failed:", err);
    }
  }

  async function moveToCart(product: any) {
    const idKey = String(product.id);
    try {
      const key = getCartStorageKey();
      const raw = localStorage.getItem(key) || localStorage.getItem(CART_KEY);
      const cart = raw ? (JSON.parse(raw) as any[]) : [];
      const idx = cart.findIndex((it) => String(it.id) === idKey);
      if (idx >= 0) {
        cart[idx].qty = Math.max(1, (cart[idx].qty || 1) + 1);
      } else {
        cart.push({
          id: idKey,
          name: product.name,
          price: Number(product.price ?? product.unitPrice ?? 0),
          qty: 1,
          addedAt: Date.now(),
        });
      }
      localStorage.setItem(key, JSON.stringify(cart));
      try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
      try { window.dispatchEvent(new CustomEvent("younyx:cart:changed", { detail: { cart } })); } catch {}
    } catch (err) {
      console.warn("Local cart update failed:", err);
      const cart = [{ id: idKey, name: product.name, price: Number(product.price ?? 0), qty: 1, addedAt: Date.now() }];
      try { localStorage.setItem(getCartStorageKey(), JSON.stringify(cart)); } catch {}
    }

    removeFromWishlist(product.id);

    try {
      const uid = getUserIdFromStorage();
      const headers: Record<string, string> = {};
      if (uid) headers["X-User-Id"] = uid;
      const res = await fetch(`${API_BASE}/api/cart/add`, buildRequestOptions("POST", { productId: Number(product.id), qty: 1 }, headers));
      if (!res.ok) {
        let bodyText = "";
        try { bodyText = await res.text(); } catch {}
        console.warn("[Wishlist->Cart] /api/cart/add non-ok:", res.status, bodyText);
        if (res.status === 401) {
          try { localStorage.removeItem(USER_ID_KEY); } catch {}
          setLoggedIn(false);
        } else {
          showToast("Unable to add to cart (server error)");
        }
      }
    } catch (err) {
      console.warn("Add to cart request failed:", err);
    }
  }

  if (!loggedIn) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-black/60 to-[#080808] border border-white/6 shadow-xl">
          <h3 className="text-sm text-gray-300 mb-2">Please login to view your wishlist</h3>
          <button onClick={() => router.push("/login?next=/wishlist")} className="px-4 py-2 rounded-full bg-[var(--brand-gold)] text-black font-semibold">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="animate-pulse px-6 py-4 rounded-xl bg-gradient-to-r from-black to-gray-900 border border-white/6 text-gray-300">
            Loading wishlist…
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-[#080808] to-[#0b0b0b] border border-white/6 shadow-xl">
            <div className="text-[18px] font-semibold text-white mb-2">Your wishlist is empty</div>
            <div className="text-sm text-gray-400 mb-4">Find pieces you love and save them here.</div>
            <div className="flex justify-center gap-3">
              <button onClick={() => router.push("/")} className="px-4 py-2 rounded-full bg-[var(--brand-gold)] text-black font-medium">Continue shopping</button>
              <button onClick={() => router.push("/collections")} className="px-4 py-2 rounded-full border border-white/6 text-white/90">Browse collections</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((p) => (
            <WishlistItemCard key={p?.id ?? String(p)} product={p} onMoveToCart={moveToCart} onRemove={removeFromWishlist} />
          ))}
        </div>
      )}
    </div>
  );
}
