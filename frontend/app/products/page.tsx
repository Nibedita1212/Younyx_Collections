// app/products/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useSearchParams } from "next/navigation";

/* --------------------- Adjust to your env if needed --------------------- */
const RAW_API =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api"
    : "http://localhost:8080/api";
const API_BASE = String(RAW_API).replace(/\/api\/?$/i, "").replace(/\/$/, "");

/* -------------------------------------------------------------------------- */
/*                                Types                                        */
/* -------------------------------------------------------------------------- */
type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
  mainImageUrl?: string | null;
  image2Url?: string | null;
  image3Url?: string | null;
  image4Url?: string | null;
  category?: string | null;
  collection?: string | null;
  stockQuantity?: number | null;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  createdAt?: string;
  compareAtPrice?: number;
};

type Category = {
  id: number;
  name: string;
};

type Collection = {
  id: number;
  name: string;
};

/* -------------------------------------------------------------------------- */
/*                              Price buckets                                  */
/* -------------------------------------------------------------------------- */
const PRICE_BUCKETS = [
  { id: "under499", label: "Under ₹499", min: 0, max: 499 },
  { id: "500to999", label: "₹500 - ₹999", min: 500, max: 999 },
  { id: "1000to1999", label: "₹1000 - ₹1999", min: 1000, max: 1999 },
  { id: "2000plus", label: "₹2000+", min: 2000, max: Infinity },
] as const;

/* -------------------------------------------------------------------------- */
/*                                   Page                                      */
/* -------------------------------------------------------------------------- */
export default function ProductsPageClient() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters state
  const [categoryFilter, setCategoryFilter] = useState<Record<string, boolean>>({});
  const [collectionFilter, setCollectionFilter] = useState<Record<string, boolean>>({});
  const [priceFilter, setPriceFilter] = useState<Record<string, boolean>>(
    Object.fromEntries(PRICE_BUCKETS.map((b) => [b.id, false]))
  );

  const [sortKey, setSortKey] = useState<string>("featured");

  /* ---------------------------- fetch products ---------------------------- */
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/api/products`, { cache: "no-store" })
      .then((res) => res.json())
      .then((arr: Product[]) => {
        if (!mounted) return;
        setProducts(Array.isArray(arr) ? arr : []);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err?.message ?? "Failed to fetch products"));
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------------------- fetch categories (DB) ---------------------------- */
  useEffect(() => {
    fetch(`${API_BASE}/api/categories`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data: Category[]) => {
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
        setCategoryFilter(Object.fromEntries(list.map((c) => [c.name, false])));
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!categoryFromUrl || categories.length === 0) return;

    setCategoryFilter(
      Object.fromEntries(
        categories.map((c) => [
          c.name,
          c.name.trim().toLowerCase() === categoryFromUrl.trim().toLowerCase(),
        ])
      )
    );
  }, [categoryFromUrl, categories]);


  /* ---------------------------- fetch collections (DB) ---------------------------- */
  useEffect(() => {
    fetch(`${API_BASE}/api/collections`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data: Collection[]) => {
        const list = Array.isArray(data) ? data : [];
        setCollections(list);
        setCollectionFilter(Object.fromEntries(list.map((c) => [c.name, false])));
      })
      .catch(() => { });
  }, []);

  /* ---------------------------- Filtering logic --------------------------- */
  const filteredProducts = useMemo(() => {
    let out = [...products];

    const activeCats = Object.keys(categoryFilter).filter((k) => categoryFilter[k]);
    if (activeCats.length > 0) {
      out = out.filter((p) => activeCats.includes((p.category ?? "").trim()));
    }

    const activeCols = Object.keys(collectionFilter).filter((k) => collectionFilter[k]);
    if (activeCols.length > 0) {
      out = out.filter((p) => activeCols.includes((p.collection ?? "").trim()));
    }

    const activePriceIds = Object.keys(priceFilter).filter((k) => priceFilter[k]);
    if (activePriceIds.length > 0) {
      out = out.filter((p) => {
        const price = Number(p.price || 0);
        return activePriceIds.some((id) => {
          const b = PRICE_BUCKETS.find((bb) => bb.id === id);
          return b ? price >= b.min && price <= b.max : false;
        });
      });
    }

    switch (sortKey) {
      case "price_asc":
        out.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        out.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        out.sort(
          (a, b) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        );
        break;
      default:
        out.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return out;
  }, [products, categoryFilter, collectionFilter, priceFilter, sortKey]);

  /* ---------------------------- helpers ---------------------------- */
  const toggleCategory = (name: string) =>
    setCategoryFilter((s) => ({ ...s, [name]: !s[name] }));
  const toggleCollection = (name: string) =>
    setCollectionFilter((s) => ({ ...s, [name]: !s[name] }));
  const togglePrice = (id: string) =>
    setPriceFilter((s) => ({ ...s, [id]: !s[id] }));

  const clearAllFilters = () => {
    setCategoryFilter(Object.fromEntries(Object.keys(categoryFilter).map((k) => [k, false])));
    setCollectionFilter(Object.fromEntries(Object.keys(collectionFilter).map((k) => [k, false])));
    setPriceFilter(Object.fromEntries(PRICE_BUCKETS.map((b) => [b.id, false])));
  };

  /* ----------------------------- Render UI ---------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* HERO */}
      <div className="bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 py-14 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Shop All Jewelry
          </h1>
          <p className="text-gray-500 dark:text-gray-300 text-lg mt-3">
            Discover our complete collection of premium artificial jewelry
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-72">
            <div className="sticky top-24 p-6 bg-white dark:bg-neutral-900 rounded-xl shadow border dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Filters
                </h2>
                <button onClick={clearAllFilters} className="text-sm text-amber-600">
                  Clear
                </button>
              </div>

              <details open className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-800 dark:text-gray-200">
                  Category
                </summary>
                <div className="mt-3 space-y-3">
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={categoryFilter[c.name] || false}
                        onChange={() => toggleCategory(c.name)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        {c.name}
                      </span>
                    </label>
                  ))}
                </div>
              </details>

              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-800 dark:text-gray-200">
                  Collection
                </summary>
                <div className="mt-3 space-y-3">
                  {collections.map((c) => (
                    <label key={c.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={collectionFilter[c.name] || false}
                        onChange={() => toggleCollection(c.name)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        {c.name}
                      </span>
                    </label>
                  ))}
                </div>
              </details>

              <details>
                <summary className="cursor-pointer text-sm font-medium text-gray-800 dark:text-gray-200">
                  Price Range
                </summary>
                <div className="mt-3 space-y-3">
                  {PRICE_BUCKETS.map((b) => (
                    <label key={b.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={priceFilter[b.id]}
                        onChange={() => togglePrice(b.id)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        {b.label}
                      </span>
                    </label>
                  ))}
                </div>
              </details>
            </div>
          </aside>

          {/* Products */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {filteredProducts.length} products
              </span>

              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="border px-3 py-2 rounded-md bg-white dark:bg-neutral-900"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-72 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 bg-white dark:bg-neutral-900 rounded shadow text-red-500">
                Error loading products: {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 bg-white dark:bg-neutral-900 rounded shadow text-gray-600 dark:text-gray-300 text-center">
                Coming with elegance soon.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
