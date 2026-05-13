"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AuthModal from "./AuthModal";
import { useRouter } from "next/navigation";

/* ---------- API base ---------- */
const RAW_API =
  typeof window !== "undefined" && process.env
    ? process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080/api"
    : "http://localhost:8080/api";
const API_BASE = String(RAW_API).replace(/\/api\/?$/i, "").replace(/\/$/, "");

/* ---------- constants ---------- */
const MAX_PER_PRODUCT = 2;

/* ---------- Icons ---------- */
function HeartOutline() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 8.3c0 5.2-8.8 11.4-8.8 11.4S3.2 13.5 3.2 8.3A4.4 4.4 0 0 1 7.6 3.9c1.6 0 3 0.9 3.7 2.2.7-1.3 2.1-2.2 3.7-2.2a4.4 4.4 0 0 1 4.1 4.4z" />
    </svg>
  );
}
function HeartFilled() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M12 21s-8.8-6.2-8.8-11.4A4.4 4.4 0 0 1 7.6 3.9c1.6 0 3 0.9 3.7 2.2.7-1.3 2.1-2.2 3.7-2.2a4.4 4.4 0 0 1 4.1 4.4C20.8 14.8 12 21 12 21z" />
    </svg>
  );
}

/* ---------- helpers ---------- */
function resolveImageUrl(path?: string | null) {
  if (!path) return null;
  const p = String(path).trim();
  if (!p) return null;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  const withoutApi = p.replace(/^\/api\/?/, "");
  const withoutLeadingSlash = withoutApi.startsWith("/") ? withoutApi.slice(1) : withoutApi;
  return `${API_BASE}/${withoutLeadingSlash}`;
}

function getStockLabel(raw: unknown) {
  const n = Number(raw) || 0;
  if (n > 5) return "In stock";
  if (n >= 2 && n <= 5) return "Limited stock left";
  if (n === 1) return "Only 1 left";
  return "Out of stock";
}

function showToast(msg: string) {
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
  setTimeout(() => el.remove(), 1200);
}

const SVG_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'><rect fill='#f3f4f6' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial, Helvetica, sans-serif' font-size='28'>Image</text></svg>`
  );

/* ======================= COMPONENT ======================= */
export default function ProductCard({ product }: { product: any }) {
  const router = useRouter();

  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingWish, setLoadingWish] = useState(false);
  const [wishState, setWishState] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const pendingActionRef = useRef<null | "addToCart" | "toggleWishlist">(null);

  const idKey = String(product.id);

  const rawImages = [
    product?.mainImageUrl ?? product?.main_image_url ?? product?.main_image,
    product?.imageUrl,
    product?.image2Url ?? product?.image2url,
    product?.image3Url ?? product?.image3url,
    product?.image4Url ?? product?.image4url,
  ].filter(Boolean);

  const images = rawImages.map((p: string) => resolveImageUrl(p)).filter(Boolean) as string[];
  const primary = images[0] ?? SVG_PLACEHOLDER;

  const stockLabel = getStockLabel(product.stockQuantity ?? product.stock ?? 0);
  const availableQty = Number(product.availableQty ?? product.stockQuantity ?? product.stock ?? 0) || 0;
  const [singleStockAdded, setSingleStockAdded] = useState(false);

  /* ---------- basic cart localStorage for now ----------
     allow richer local objects so we can store productId, name, price, image etc.
  */
  function readCart(): any[] {
    try {
      const raw = localStorage.getItem("younyx_cart") || "[]";
      return Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function writeCart(arr: any[]) {
    try {
      localStorage.setItem("younyx_cart", JSON.stringify(arr));
    } catch {}
  }

  useEffect(() => {
    try {
      if (availableQty < 2) {
        const raw = localStorage.getItem("younyx_cart");
        const arr = Array.isArray(JSON.parse(raw || "[]")) ? (JSON.parse(raw || "[]") as any[]) : [];
        const found = arr.find((it: any) => {
          try {
            const a = it?.id ?? it?.productId ?? it;
            return String(a) === idKey;
          } catch {
            return false;
          }
        });
        if (found && Number(found.qty || 1) >= 1) {
          setSingleStockAdded(true);
        }
      }
    } catch {}
  }, [idKey, availableQty]);

  /* ---------- auth check ---------- */
  function isLoggedIn(): boolean {
    try {
      const tokenKeys = ["younyx_token", "token", "auth_token", "access_token", "authToken"];
      for (const k of tokenKeys) {
        const v = localStorage.getItem(k);
        if (v && v.length > 0) return true;
      }
      const userRaw =
        localStorage.getItem("user") ||
        localStorage.getItem("currentUser") ||
        localStorage.getItem("younyx_user");
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw);
          if (u && (u.id || u.email || u.username)) return true;
        } catch {
          if (userRaw.length > 8) return true;
        }
      }
      if (typeof document !== "undefined" && document.cookie) {
        const ck = document.cookie;
        const names = ["younyx_token", "JSESSIONID", "connect.sid", "session"];
        for (const n of names) {
          if (ck.includes(n + "=")) return true;
        }
      }
    } catch {}
    return false;
  }

  /* ---------- handlers ---------- */

  // MINIMAL safe add-to-cart + server sync but with MAX and stock checks
  async function handleAddToCart(e?: React.MouseEvent) {
    e?.preventDefault();

    if (!isLoggedIn()) {
      pendingActionRef.current = "addToCart";
      setShowAuth(true);
      return;
    }

    const arrNow = readCart();
    const foundNow = arrNow.find((it: any) => String(it.id) === idKey || String(it.productId) === idKey);
    const currentQty = foundNow ? Number(foundNow.qty || 1) : 0;

    // safe available stock read (prefer explicit availableQty)
    const stockAvailableRaw = product.availableQty ?? product.stockQuantity ?? product.stock ?? 0;
    const stockAvailable = stockAvailableRaw != null ? Number(stockAvailableRaw) || 0 : 0;

    if (currentQty >= MAX_PER_PRODUCT) {
      showToast(`You can only add up to ${MAX_PER_PRODUCT} pieces of this product`);
      return;
    }

    if (stockAvailable <= 0) {
      showToast("Out of stock");
      return;
    }
    if (currentQty + 1 > stockAvailable) {
      showToast("Not enough stock available");
      return;
    }

    setLoadingCart(true);
    try {
      const arr = arrNow;
      if (foundNow) {
        foundNow.qty = Math.min(MAX_PER_PRODUCT, Number(foundNow.qty || 1) + 1);
      } else {
        arr.push({
          id: idKey,
          productId: product.id,
          qty: 1,
          name: product.name,
          price: Number(product.price ?? 0),
          mainImageUrl: product.mainImageUrl ?? null,
        } as any);
      }
      writeCart(arr);
      setSingleStockAdded((s) => s || availableQty <= 1);
      showToast("Added to cart");

      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("younyx_token") ||
          localStorage.getItem("auth_token") ||
          localStorage.getItem("access_token") ||
          "";
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const uid = localStorage.getItem("younyx_user_id") || localStorage.getItem("user_id") || undefined;
        if (uid) headers["X-User-Id"] = String(uid);

        const desiredQty = Math.min(MAX_PER_PRODUCT, currentQty + 1);
        const resp = await fetch(`${API_BASE}/api/cart/add`, {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify({ productId: Number(product.id), qty: desiredQty }),
        });

        if (resp.status === 401) {
          pendingActionRef.current = "addToCart";
          setShowAuth(true);
          showToast("Please login to save cart to server");
          return;
        }

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          console.error("[Cart sync] failed:", resp.status, txt);
          showToast("Added locally, failed to sync to server");
        } else {
          const json = await resp.json().catch(() => null);
          try {
            window.dispatchEvent(new CustomEvent("younyx:cart:changed", { detail: { cart: arr, serverItem: json } }));
          } catch {}
        }
      } catch (syncErr) {
        console.warn("[Cart sync] network error:", syncErr);
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      showToast("Failed to add to cart");
    } finally {
      setLoadingCart(false);
      pendingActionRef.current = null;
    }
  }

  // PURE server-based wishlist toggle (DB main source)
  async function handleToggleWishlist(e?: React.MouseEvent) {
    e?.preventDefault();

    if (!isLoggedIn()) {
      pendingActionRef.current = "toggleWishlist";
      setShowAuth(true);
      return;
    }

    setLoadingWish(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("younyx_token") || "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const resp = await fetch(`${API_BASE}/api/wishlist/toggle`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ productId: Number(idKey) }),
      });

      if (resp.status === 401) {
        pendingActionRef.current = "toggleWishlist";
        setShowAuth(true);
        return;
      }

      if (!resp.ok) {
        console.error("Wishlist toggle failed, status:", resp.status);
        showToast("Wishlist update failed");
        return;
      }

      const data: any = await resp.json().catch(() => ({}));
      const added = Boolean(data?.added);
      setWishState(added);
      showToast(added ? "Added to wishlist" : "Removed from wishlist");
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      showToast("Wishlist update failed");
    } finally {
      setLoadingWish(false);
      pendingActionRef.current = null;
    }
  }

  // AuthModal se success callback
  function handleAuthSuccess() {
    setShowAuth(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    if (action === "addToCart") {
      handleAddToCart();
    } else if (action === "toggleWishlist") {
      handleToggleWishlist();
    }
  }

  /* ---------- render ---------- */
  return (
    <>
      <article className="group relative bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 w-full">
        {/* square image */}
        <div className="relative w-full h-0 pb-[100%] bg-gray-50 overflow-hidden">
          <Link href={`/products/${product.id}`} className="absolute inset-0">
            <img
              src={String(primary)}
              alt={product.name ?? "Product image"}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = SVG_PLACEHOLDER;
              }}
            />
          </Link>

          {/* price badge */}
          <div className="absolute left-2 top-2 bg-black/90 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
            ₹{product.price}
          </div>

          {/* hover actions */}
          <div className="absolute left-0 right-0 bottom-0 p-2 flex items-center gap-2 justify-between opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-200">
            <button
              onClick={handleAddToCart}
              disabled={loadingCart || singleStockAdded}
              className="flex-1 inline-flex items-center gap-2 justify-center px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium shadow-sm disabled:opacity-60"
            >
              <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none">
                <path d="M6 6h15l-1.5 9h-12z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              <span className="text-xs text-gray-800">
                {loadingCart ? "Adding" : singleStockAdded ? "Added" : "Add"}
              </span>
            </button>

            <button
              onClick={handleToggleWishlist}
              disabled={loadingWish}
              aria-pressed={wishState}
              title={wishState ? "Remove from wishlist" : "Add to wishlist"}
              className={`w-8 h-8 flex items-center justify-center rounded-md border ${
                wishState
                  ? "bg-rose-50 border-rose-400 text-rose-600"
                  : "bg-white border-gray-200 text-gray-700"
              } shadow-sm`}
            >
              {wishState ? <HeartFilled /> : <HeartOutline />}
            </button>
          </div>
        </div>

        {/* body */}
        <div className="px-2 py-2">
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-serif text-sm text-gray-900 group-hover:text-amber-600 transition-colors duration-200 truncate">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center justify-between mt-1 gap-2">
            <div>
              <div className="text-sm font-semibold text-gray-900">₹{product.price}</div>
              {product.compareAtPrice ? (
                <div className="text-xs text-gray-400 line-through">₹{product.compareAtPrice}</div>
              ) : null}
            </div>

            <div className="text-xs text-gray-600 text-right">
              <div>{stockLabel}</div>
            </div>
          </div>
        </div>
      </article>

      <AuthModal
        open={showAuth}
        initialTab="login"
        onClose={() => {
          setShowAuth(false);
          pendingActionRef.current = null;
          setLoadingCart(false);
          setLoadingWish(false);
        }}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}
