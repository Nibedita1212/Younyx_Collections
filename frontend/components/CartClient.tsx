// components/CartClient.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const RAW_API =
  typeof process !== "undefined" && process.env
    ? process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080/api"
    : "http://localhost:8080/api";
const API_BASE = String(RAW_API).replace(/\/api\/?$/i, "").replace(/\/$/, "");

const CART_KEY = "younyx_cart";
const USER_ID_KEY = "younyx_user_id";
const MAX_PER_PRODUCT = 2;

type CartItemLocal = {
  id: string | number;
  productId?: string | number;
  name?: string;
  price?: number;
  qty?: number;
  mainImageUrl?: string | null;
  addedAt?: number;
  availableQty?: number | null;
};

/* ---------- helper: resolve image ---------- */
function resolveImageUrl(path?: string | null) {
  if (!path) return null;
  try {
    const p = String(path).trim();
    if (!p) return null;
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    const withoutApi = p.replace(/^\/api\/?/, "");
    const withoutLeadingSlash = withoutApi.startsWith("/") ? withoutApi.slice(1) : withoutApi;
    return `${API_BASE}/${withoutLeadingSlash}`;
  } catch {
    return null;
  }
}

/* small inline toast */
function showLocalToast(msg: string) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.position = "fixed";
  el.style.right = "16px";
  el.style.bottom = "16px";
  el.style.background = "rgba(16,16,16,0.95)";
  el.style.color = "#fff";
  el.style.padding = "8px 12px";
  el.style.borderRadius = "8px";
  el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.45)";
  el.style.zIndex = "99999";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

export default function CartClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [items, setItems] = useState<CartItemLocal[]>([]);
  const mountedRef = useRef(true);

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

  function readCartFromLocalStorage(): CartItemLocal[] {
    try {
      const key = getCartStorageKey();
      const raw = localStorage.getItem(key) || localStorage.getItem(CART_KEY) || "[]";
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.map((it: any) => {
        const copy: CartItemLocal = { ...(it || {}) };
        copy.mainImageUrl = resolveImageUrl(copy.mainImageUrl ?? null) ?? copy.mainImageUrl ?? null;
        copy.availableQty = (() => {
          const candidate = it?.availableQty ?? it?.stockQuantity ?? it?.stock ?? null;
          if (candidate == null) return null;
          const n = Number(candidate);
          return Number.isFinite(n) ? n : null;
        })();
        return copy;
      });
    } catch {
      return [];
    }
  }

  function writeCartToLocalStorage(arr: CartItemLocal[]) {
    try {
      const key = getCartStorageKey();
      localStorage.setItem(key, JSON.stringify(arr));
      try { localStorage.setItem(CART_KEY, JSON.stringify(arr)); } catch {}
      try { window.dispatchEvent(new CustomEvent("younyx:cart:changed", { detail: { cart: arr } })); } catch {}
    } catch {}
  }

  // Fetch backend cart (normalize to include availableQty and resolved image)
  async function fetchCartFromBackend(): Promise<CartItemLocal[] | null> {
    try {
      const headers: any = { "Content-Type": "application/json" };
      const uid = localStorage.getItem(USER_ID_KEY);
      if (uid) headers["X-User-Id"] = uid;
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: "GET",
        headers,
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        if (res.status === 401) {
          try { localStorage.removeItem(USER_ID_KEY); } catch {}
          setUser(null);
        }
        return null;
      }
      const json = await res.json();
      if (!Array.isArray(json)) return null;

      const normalized = json.map((it: any) => {
        const product = it.product ?? {};
        const productId = it.productId ?? product.id ?? null;
        const price = Number(it.price ?? product.price ?? 0) || 0;

        const availableRaw = it.availableQty ?? it.stockQuantity ?? product.stockQuantity ?? product.stock ?? it.available ?? null;
        const available = availableRaw != null ? (() => {
          const n = Number(availableRaw);
          return Number.isFinite(n) ? n : null;
        })() : null;

        const rawImg =
          it.mainImageUrl ??
          it.imageUrl ??
          product.mainImageUrl ??
          product.imageUrl ??
          product.image ??
          null;
        const resolved = resolveImageUrl(rawImg) ?? (typeof rawImg === "string" ? rawImg : null);

        return {
          id: it.id ?? productId ?? `${productId}`,
          productId,
          name: it.name ?? product.name ?? product.title ?? `Product ${productId}`,
          price,
          qty: Number(it.qty ?? it.quantity ?? 1) || 1,
          mainImageUrl: resolved,
          addedAt: it.addedAt ?? Date.now(),
          availableQty: available,
        } as CartItemLocal;
      });

      return normalized;
    } catch (err) {
      console.warn("[CartClient] fetchCartFromBackend error:", err);
      return null;
    }
  }

  // If availableQty is missing for some items, fetch product details for those ids
  async function fillMissingStocks(itemsArr: CartItemLocal[]) {
    const needIds = Array.from(new Set(
      itemsArr
        .filter((it) => (it.availableQty === null || it.availableQty === undefined) && it.productId)
        .map((it) => String(it.productId))
    ));
    if (needIds.length === 0) return itemsArr;

    const resultsMap: Record<string, number | null> = {};
    await Promise.all(
      needIds.map(async (pidStr) => {
        try {
          const pid = Number(pidStr);
          if (!Number.isFinite(pid)) {
            resultsMap[pidStr] = null;
            return;
          }
          const res = await fetch(`${API_BASE}/api/products/${pid}`, { cache: "no-store" });
          if (!res.ok) {
            resultsMap[pidStr] = null;
            return;
          }
          const json = await res.json();
          const candidate = json?.stockQuantity ?? json?.stock ?? json?.availableQty ?? null;
          const n = candidate == null ? null : Number(candidate);
          resultsMap[pidStr] = Number.isFinite(n) ? n : null;
        } catch (e) {
          resultsMap[pidStr] = null;
        }
      })
    );

    const out = itemsArr.map((it) => {
      const pidKey = String(it.productId ?? it.id ?? "");
      if ((it.availableQty === null || it.availableQty === undefined) && resultsMap.hasOwnProperty(pidKey)) {
        const v = resultsMap[pidKey];
        return { ...it, availableQty: v };
      }
      return it;
    });

    try { writeCartToLocalStorage(out); } catch {}
    return out;
  }

  // Sync local items to backend best-effort (not blocking)
  async function syncLocalToBackendIfNeeded(localItems: CartItemLocal[]) {
    if (!Array.isArray(localItems) || localItems.length === 0) return;
    try {
      const uid = localStorage.getItem(USER_ID_KEY);
      if (!uid) return;
      for (const it of localItems) {
        try {
          await fetch(`${API_BASE}/api/cart/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(uid ? { "X-User-Id": uid } : {}),
            },
            credentials: "include",
            body: JSON.stringify({ productId: Number(it.productId ?? it.id), qty: Number(it.qty ?? 1) }),
          });
        } catch (e) {}
      }
    } catch (e) {}
  }

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      setLoading(true);
      const uid = getUserIdFromStorage();
      setUser(uid ? { id: uid } : null);

      const backend = await fetchCartFromBackend();
      if (backend && backend.length > 0) {
        if (!mountedRef.current) return;
        const enriched = await fillMissingStocks(backend);
        setItems(enriched);
        writeCartToLocalStorage(enriched);
      } else {
        const local = readCartFromLocalStorage();
        if (local.length > 0 && uid) syncLocalToBackendIfNeeded(local).catch(() => {});
        const enrichedLocal = await fillMissingStocks(local);
        setItems(enrichedLocal);
      }
      setLoading(false);
    })();

    function onCartChanged(e: any) {
      try {
        const cart = (e?.detail?.cart ?? readCartFromLocalStorage()) as CartItemLocal[];
        const normalized = Array.isArray(cart)
          ? cart.map((it) => ({
              ...it,
              mainImageUrl: resolveImageUrl(it.mainImageUrl ?? null) ?? it.mainImageUrl ?? null,
              availableQty: it.availableQty ?? (it as any).stockQuantity ?? (it as any).stock ?? null,
            }))
          : [];
        fillMissingStocks(normalized).then((en) => {
          setItems(en);
        }).catch(() => setItems(normalized));
      } catch {
        setItems(readCartFromLocalStorage());
      }
    }

    function onStorage(e: StorageEvent) {
      if (!e.key) return;
      const key = getCartStorageKey();
      if (e.key === key || e.key === CART_KEY || (e.key || "").startsWith(`${key}_bump`)) {
        const arr = readCartFromLocalStorage().map((it) => ({
          ...it,
          mainImageUrl: resolveImageUrl(it.mainImageUrl ?? null) ?? it.mainImageUrl ?? null,
        }));
        fillMissingStocks(arr).then((en) => setItems(en)).catch(() => setItems(arr));
      }
    }

    window.addEventListener("younyx:cart:changed", onCartChanged as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("younyx:cart:changed", onCartChanged as EventListener);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // remove an item locally + backend best-effort
  async function removeItem(idOrPid: string | number) {
    try {
      const next = items.filter((it) => String(it.id) !== String(idOrPid) && String(it.productId) !== String(idOrPid));
      setItems(next);
      writeCartToLocalStorage(next);
      try {
        const uid = localStorage.getItem(USER_ID_KEY);
        await fetch(`${API_BASE}/api/cart/remove`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(uid ? { "X-User-Id": uid } : {}),
          },
          credentials: "include",
          body: JSON.stringify({ productId: Number(idOrPid) }),
        });
      } catch (e) {}
    } catch (e) {
      console.warn("[CartClient] removeItem error:", e);
    }
  }

  // updateQty with clamp and server sync
  async function updateQty(idOrPid: string | number, desiredQty: number) {
    try {
      desiredQty = Math.max(1, Math.floor(desiredQty));

      const item = items.find((it) => String(it.id) === String(idOrPid) || String(it.productId) === String(idOrPid));
      const avail = item?.availableQty ?? null;
      const currentQty = item ? Number(item.qty || 1) : 0;

      // **CLAMP**: if product stock known, clamp to min(avail, MAX_PER_PRODUCT)
      const maxAllowed = avail !== null ? Math.min(MAX_PER_PRODUCT, Math.max(0, Number(avail))) : MAX_PER_PRODUCT;

      if (desiredQty > maxAllowed) {
        showLocalToast(`For larger orders, kindly contact us on Instagram.`);
        desiredQty = maxAllowed;
      }

      if (desiredQty === currentQty) return;

      const next = items.map((it) => {
        if (String(it.id) === String(idOrPid) || String(it.productId) === String(idOrPid)) {
          return { ...it, qty: desiredQty };
        }
        return it;
      }).map((it) => ({ ...it, mainImageUrl: resolveImageUrl(it.mainImageUrl ?? null) ?? it.mainImageUrl ?? null }));
      setItems(next);
      writeCartToLocalStorage(next);

      try {
        const uid = localStorage.getItem(USER_ID_KEY);
        await fetch(`${API_BASE}/api/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(uid ? { "X-User-Id": uid } : {}),
          },
          credentials: "include",
          body: JSON.stringify({ productId: Number(idOrPid), qty: desiredQty }),
        });
      } catch (e) {}
    } catch (e) {
      console.warn("[CartClient] updateQty error:", e);
    }
  }

  const total = useMemo(() => items.reduce((s, it) => s + (Number(it.qty || 1) * Number(it.price || 0)), 0), [items]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div>
          <div className="text-lg font-semibold">Loading cart…</div>
          <div className="text-sm text-gray-200">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/0 text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Your cart</h1>

        {items.length === 0 ? (
          <div className="p-6 bg-white/5 rounded text-gray-300">
            Your cart is empty. <Link href="/">Continue shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((it) => {
              const qty = Number(it.qty || 1);
              const avail = it.availableQty !== null && it.availableQty !== undefined ? Number(it.availableQty) : null;

              // ===== FIXED disableInc logic as requested =====
              // If avail known:
              //  - avail < 2 (i.e. 1) => disable increment (Only 1 left)
              //  - if qty >= avail => disable
              // Else fallback to MAX_PER_PRODUCT
              const disableInc =
                avail !== null
                  ? qty >= avail || avail < 2
                  : qty >= MAX_PER_PRODUCT;

              return (
                <div key={String(it.id ?? it.productId)} className="flex gap-4 items-center bg-white/5 rounded p-3">
                  <div className="w-20 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    {it.mainImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={String(resolveImageUrl(it.mainImageUrl ?? null) ?? it.mainImageUrl ?? "")} alt={it.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-400">₹{Number(it.price || 0).toFixed(2)}</div>

                    {/* show availability message when stock < 2 */}
                    {avail !== null && avail < 2 && (
                      <div className="text-xs text-rose-400 mt-1">Only 1 left</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(it.productId ?? it.id ?? "", Math.max(1, qty - 1))}
                      className="px-2 py-1 bg-white/7 rounded"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>

                    <div className="px-3">{qty}</div>

                    <button
                      onClick={() => {
                        // if disabled, show message as requested (premium english)
                        if (disableInc) {
                          if (avail !== null) {
                            if (avail < 2) {
                              showLocalToast("Only 1 left");
                            } else {
                              showLocalToast(`Only ${avail} available`);
                            }
                          } else {
                            showLocalToast("For larger orders, kindly contact us on Instagram.");
                          }
                          return;
                        }
                        updateQty(it.productId ?? it.id ?? "", qty + 1);
                      }}
                      className={`px-2 py-1 rounded ${disableInc ? "bg-white/8 cursor-not-allowed opacity-60" : "bg-white/7"}`}
                      aria-label="Increase quantity"
                      disabled={disableInc}
                    >
                      +
                    </button>
                  </div>

                  <div className="ml-4">
                    <button onClick={() => removeItem(it.productId ?? it.id ?? "")} className="text-sm text-red-400">Remove</button>
                  </div>
                </div>
              );
            })}

            {/* bottom total/proceed intentionally removed per earlier request */}
          </div>
        )}
      </div>
    </div>
  );
}
