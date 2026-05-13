"use client";

import React from "react";
import Link from "next/link";

type Props = {
  product: any;
  onMoveToCart: (p: any) => void;
  onRemove: (id: any) => void;
};

/* Local image resolver (keeps same logic as WishlistClient.resolveImageUrl) */
const RAW_API =
  typeof window !== "undefined" && process.env
    ? process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080/api"
    : "http://localhost:8080/api";
const API_BASE = String(RAW_API).replace(/\/api\/?$/i, "").replace(/\/$/, "");

function resolveImageUrlLocal(path?: string | null) {
  if (!path) return null;
  const p = String(path).trim();
  if (!p) return null;
  if (p.startsWith("/uploads/")) return `${API_BASE}${p}`;
  if (p.startsWith("uploads/")) return `${API_BASE}/${p}`;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return p;
}

export default function WishlistItemCard({ product, onMoveToCart, onRemove }: Props) {
  const rawImg = (product && (product.mainImageUrl ?? product.imageUrl)) ?? null;
  const img = resolveImageUrlLocal(rawImg) || "/demo/prod-fallback.jpg";
  const price = product?.price ?? product?.unitPrice ?? 0;
  const desc = product?.description ?? "";
  const category = product?.category ?? product?.categoryName ?? "";

  return (
    <div className="relative bg-gradient-to-br from-[#070707] to-[#0f0f0f] border border-white/6 rounded-2xl p-4 flex gap-4 items-center shadow-lg hover:shadow-2xl transition">
      {/* left image */}
      <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden ring-1 ring-white/6 bg-gradient-to-tr from-gray-900 to-gray-800">
        <img
          src={img}
          alt={product?.name ?? "Product"}
          className="w-full h-full object-cover transform transition group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = "/demo/prod-fallback.jpg"; }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/products/${product?.id}`} className="block">
              <h3 className="text-sm sm:text-base font-semibold text-white truncate">{product?.name}</h3>
            </Link>
            <div className="text-xs text-gray-300 mt-1 line-clamp-2">{desc}</div>

            <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
              {category && <span className="px-2 py-0.5 rounded bg-white/3 border border-white/6">{category}</span>}
              <span className="text-[0.85rem] font-medium text-[var(--brand-gold)]">₹{price}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-xs text-gray-400">Qty: {product?.qty ?? product?.quantity ?? 1}</div>
            <div className="flex gap-2">
              <button
                onClick={() => onMoveToCart(product)}
                className="px-3 py-1 rounded-full bg-[var(--brand-gold)]/95 text-black text-xs font-semibold shadow-sm hover:brightness-95 transition"
                aria-label="Move to cart"
              >
                Move to cart
              </button>

              <button
                onClick={() => onRemove(product?.id)}
                className="px-3 py-1 rounded-full bg-white/5 border border-red-400/20 text-red-300 text-xs hover:bg-white/6 transition"
                aria-label="Remove from wishlist"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* bottom meta */}
        <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[var(--brand-gold)]" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 21s-7-4.35-9-7a6.5 6.5 0 0 1 3-10 6.5 6.5 0 0 1 12 0 6.5 6.5 0 0 1 3 10c-2 2.65-9 7-9 7z" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round" />
            </svg>
            <span>Saved</span>
          </div>
          <div className="border-l border-white/6 pl-2">{/* placeholder for other meta */}</div>
        </div>
      </div>
    </div>
  );
}
