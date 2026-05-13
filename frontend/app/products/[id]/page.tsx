// app/products/[id]/page.tsx
import React from "react";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

/**
 * Product detail (server component). IMPORTANT: await params & searchParams before reading.
 */
export default async function ProductDetailPage(props: {
  params: any;
  searchParams?: any;
}) {
  // --- SAFELY RESOLVE params (may be Promise) ---
  let resolvedParams: any = {};
  try {
    resolvedParams = await props.params;
  } catch {
    resolvedParams = props.params ?? {};
  }

  // --- SAFELY RESOLVE searchParams (may be Promise) ---
  let resolvedSearchParams: any = {};
  try {
    resolvedSearchParams = await props.searchParams;
  } catch {
    resolvedSearchParams = props.searchParams ?? {};
  }

  // Extract id safely
  const idRaw = resolvedParams?.id ?? "";
  const id = String(idRaw);

  // Validate numeric id (your backend expects numeric id)
  const numericId = Number(id);
  if (Number.isNaN(numericId) || !Number.isFinite(numericId)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-gray-200 opacity-60">
            Invalid product id
          </h2>
          <p className="mt-4 text-gray-700">Product id must be a number.</p>
        </div>
      </div>
    );
  }

  // Build backend base URL (strip trailing /api)
  const base = String(API_BASE).replace(/\/api\/?$/i, "").replace(/\/$/, "");

  // --- Fetch product from backend ---
  let product: any = null;
  try {
    const res = await fetch(`${base}/api/products/${encodeURIComponent(String(numericId))}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Failed to fetch product", res.status);
    } else {
      product = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch product", err);
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600">Product not found</h2>
          <p className="mt-2 text-gray-600">Check that the product id exists and backend is running.</p>
        </div>
      </div>
    );
  }

  // --- Resolve image URLs from DB paths like "/uploads/..." ---
  function resolveImage(p?: string | null) {
    if (!p) return null;
    const s = String(p).trim();
    if (s.startsWith("/uploads/")) return `${base}${s}`;
    if (s.startsWith("uploads/")) return `${base}/${s}`;
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    return s;
  }

  const rawImages = [
    product.mainImageUrl ?? product.main_image_url ?? product.main_image ?? null,
    product.image2Url ?? product.image2url ?? null,
    product.image3Url ?? product.image3url ?? null,
    product.image4Url ?? product.image4url ?? null,
  ];

  const images = rawImages.map(resolveImage).filter(Boolean) as string[];

  // Choose main image index from searchParams ?img=
  let mainIndex = 0;
  try {
    const sp = resolvedSearchParams ?? {};
    const imgVal = Array.isArray(sp?.img) ? sp.img[0] : sp?.img;
    const n = Number(imgVal);
    if (!Number.isNaN(n) && Number.isFinite(n) && n >= 0 && n < images.length) mainIndex = Math.floor(n);
  } catch {
    mainIndex = 0;
  }
  const mainImage = images[mainIndex] ?? null;

  // compute stock value
  const rawStock = product.stockQuantity ?? product.stock ?? 0;
  const stock = Number(rawStock) || 0;

  // stock label logic:
  let stockLabel = "";
  if (stock > 5) {
    stockLabel = "In stock";
  } else if (stock >= 2 && stock <= 5) {
    stockLabel = "Limited stock left";
  } else if (stock === 1) {
    stockLabel = "Only 1 left";
  } else {
    stockLabel = "Out of stock";
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted py-8">
        <div className="mx-auto max-w-7xl px-6">
          {/* Keep a small breadcrumb-like title (visual) */}
          <div className="text-sm text-muted-foreground">Products / {product.name}</div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Gallery */}
          <div className="w-full lg:w-[560px] flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="w-full aspect-square bg-gray-50 flex items-center justify-center">
                {mainImage ? (
                  <img src={mainImage} alt={product.name ?? "Product image"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto">
                {images.map((img, i) => (
                  <Link
                    key={i}
                    href={`/products/${numericId}?img=${i}`}
                    className={`w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg transition transform hover:-translate-y-0.5 ${i === mainIndex ? "ring-2 ring-amber-400 shadow-lg" : "border border-gray-100"} `}
                  >
                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{product.name}</h1>

            <div className="mt-3 flex items-center gap-4">
              <div className="text-2xl md:text-3xl font-semibold text-gray-800">₹{product.price ?? product.price}</div>
              <div className="px-2 py-1 rounded-full bg-gray-100 text-sm text-gray-600">{product.category ?? product.categoryName ?? "—"}</div>
            </div>

            <div className="mt-6">
              <div
                className="prose max-w-none text-gray-700"
                style={{
                  maxHeight: "340px",
                  overflow: "auto",
                  whiteSpace: "pre-line",
                }}
              >
                {product.description ?? product.desc ?? "No description available."}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <button className="px-6 py-3 rounded-lg bg-foreground text-foreground-foreground font-semibold hover:brightness-95 transition-shadow shadow">
                Add to cart
              </button>
              <button className="px-5 py-3 rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 transition">
                ♡ Wishlist
              </button>

              <div className="ml-auto text-sm text-gray-600 self-center">
                <strong className="text-gray-800">{stockLabel}</strong>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">SKU</span>
                <div className="text-gray-800 font-medium">{product.sku ?? product.sku}</div>
              </div>
              <div>
                <span className="text-gray-500">Product ID</span>
                <div className="text-gray-800 font-medium">{product.id ?? numericId}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
