"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const RAW_API =
  typeof process !== "undefined" && process.env
    ? process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080/api"
    : "http://localhost:8080/api";

const API_BASE = String(RAW_API).replace(/\/api\/?$/i, "").replace(/\/$/, "");

type Category = {
  id: number | string;
  name: string;
  slug?: string;
  imageUrl?: string | null;
  description?: string | null;
  productCount?: number;
};

function resolveImageUrl(path?: string | null) {
  if (!path) return null;
  const p = String(path).trim();
  if (!p) return null;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  const withoutLeadingSlash = p.startsWith("/") ? p.slice(1) : p;
  return `${API_BASE}/${withoutLeadingSlash}`;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/collections`, {
          cache: "no-store",
        });
        if (!mounted) return;

        if (!res.ok) {
          const t = await res.text();
          throw new Error(`Failed to load categories (${res.status}) ${t}`);
        }

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid categories response");

        const normalized = data.map((c: any) => ({
          id: c.id ?? c.categoryId ?? c.category_id,
          name: c.name ?? c.title ?? c.categoryName ?? "Unnamed",
          slug: c.slug ?? c.name ?? String(c.id),
          imageUrl: c.imageUrl ?? c.image_url ?? c.image ?? null,
          description: c.description ?? null,
          productCount:
            typeof c.productCount === "number"
              ? c.productCount
              : typeof c.count === "number"
              ? c.count
              : undefined,
        })) as Category[];

        setCollections(normalized);
      } catch (err: any) {
        console.error("Load categories error", err);
        if (!mounted) return;
        setError(err.message || "Failed to load categories");
        setCollections([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0b0b] to-[#050505] text-white">
      {/* HERO */}
      <section className="relative py-20 sm:py-28 text-center">
        <h1 className="text-3xl sm:text-5xl font-serif tracking-wide">
          Our Collections
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
          Discover thoughtfully curated jewellery collections crafted to elevate
          every occasion.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {loading ? (
          <div className="rounded-xl border border-white/10 bg-black/40 p-6 text-center text-gray-300">
            Loading collections…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
            {error}
          </div>
        ) : collections.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/40 p-6 text-center text-gray-400">
            No collections found.
          </div>
        ) : (
          <div className="space-y-20">
            {collections.map((cat, index) => {
              const img = resolveImageUrl(cat.imageUrl);
              const to = `/collections/${cat.slug ?? cat.id}`;
              const reverse = index % 2 === 1;

              return (
                <div
                  key={cat.id}
                  className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                    reverse ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* IMAGE (NO FALLBACK) */}
                  {img && (
                    <Link href={to} className={reverse ? "lg:order-2" : ""}>
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
                        <img
                          src={img}
                          alt={cat.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </div>
                    </Link>
                  )}

                  {/* CONTENT */}
                  <div className={reverse ? "lg:order-1" : ""}>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--brand-gold)] mb-2">
                      Collection
                    </div>

                    <h2 className="font-serif text-2xl sm:text-4xl mb-4">
                      {cat.name}
                    </h2>

                    {cat.description && (
                      <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                        {cat.description}
                      </p>
                    )}
{/* 
                    {typeof cat.productCount === "number" && (
                      <p className="text-sm text-gray-400 mb-6">
                        {cat.productCount}{" "}
                        {cat.productCount === 1 ? "piece" : "pieces"}
                      </p>
                    )} */}

                    <Link
                      href={to}
                      className="inline-flex items-center gap-2 rounded-full px-7 py-2.5 bg-[var(--brand-gold)] text-black text-xs uppercase tracking-wider font-semibold hover:brightness-110 transition"
                    >
                      Explore Collection →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="py-20 bg-[#0b0b0b] border-t border-white/10 text-center">
        <h2 className="font-serif text-2xl sm:text-4xl mb-4">
          Can&apos;t Decide?
        </h2>
        <p className="text-gray-300 max-w-lg mx-auto mb-8">
          Explore our complete catalogue and discover jewellery that speaks to
          you.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full px-8 py-3 border border-[var(--brand-gold)] text-[var(--brand-gold)] hover:bg-[var(--brand-gold)] hover:text-black transition"
        >
          Shop All Products →
        </Link>
      </section>
    </div>
  );
}
