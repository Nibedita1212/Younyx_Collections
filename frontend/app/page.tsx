import Link from "next/link";
import ProductCard from "../components/ProductCard";

// ---------- TYPES ----------
type Category = {
  id: number | string;
  name: string;
  slug?: string;
  imageUrl?: string | null;
  productCount?: number;
};

type ProductFromApi = {
  id: number;
  name: string;
  price?: number | null;
  stockQuantity?: number | null;
  mainImageUrl?: string | null;
  image2Url?: string | null;
  image3Url?: string | null;
  image4Url?: string | null;
  description?: string | null;
};

// ---------- API BASE ----------
const RAW_API =
  typeof process !== "undefined" && process.env
    ? process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api"
    : "http://localhost:8080/api";

const API_BASE = String(RAW_API).replace(/\/api\/?$/i, "").replace(/\/$/, "");

// ---------- IMAGE RESOLVER ----------
function buildImageUrl(path?: string | null): string {
  if (!path) return "";
  let p = String(path).trim();
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  p = p.replace(/^\/?api\//, "");
  if (p.startsWith("/")) p = p.slice(1);
  return `${API_BASE}/${p}`;
}

// ---------- LOAD CATEGORIES ----------
async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug ?? c.name,
      imageUrl: c.imageUrl ?? c.image_url ?? c.image ?? null,
      productCount: c.productCount ?? c.count ?? undefined,
    }));
  } catch {
    return [];
  }
}

// ---------- LOAD PRODUCTS (preserve backend fields) ----------
async function getFeaturedProducts(): Promise<ProductFromApi[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.slice(0, 10).map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price ?? null,
      stockQuantity: p.stockQuantity ?? p.stock ?? null,
      mainImageUrl: p.mainImageUrl ?? p.main_image_url ?? p.main_image ?? null,
      image2Url: p.image2Url ?? p.image2url ?? null,
      image3Url: p.image3Url ?? p.image3url ?? null,
      image4Url: p.image4Url ?? p.image4url ?? null,
      description: p.description ?? p.shortDescription ?? null,
    }));
  } catch (err) {
    console.error("Failed fetching products:", err);
    return [];
  }
}

// ---------- PAGE ----------
export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([getCategories(), getFeaturedProducts()]);

  const heroBg = `/heropage.png`;
  const storyImg1 = `/Necklace_Section.png`;
  const storyImg2 = `/earring_section.png`;

  return (
    <div className="pb-1">
      {/* ================= HERO ================= */}
      <section
        className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url("${heroBg}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative z-10 px-4 text-center max-w-4xl">
          <h1 className="hero-title-premium">Elevate Your Look</h1>
          <h1 className="hero-title-premium">With Minimal Jewellery</h1>

          <p className="hero-sub-premium mt-4">
            Elegant • Everyday • Trendy — Earrings, Pendants & Sets
          </p>


          <Link
            href="/products"
            className="inline-block mt-6 px-8 py-3 rounded-full bg-[var(--brand-gold)] text-black font-semibold shadow-lg hover:scale-105 transition"
          >
            Shop Now
          </Link>
        </div>

        <style>{`
          .hero-title-premium {
            font-family: "Playfair Display", serif;
            font-size: 3rem;
            font-weight: 700;
            color: white;
            text-shadow: 0 10px 35px rgba(0,0,0,0.45);
            line-height: 1.1;
          }
          @media (min-width: 640px) {
            .hero-title-premium { font-size: 4rem; }
          }
          .hero-sub-premium {
            font-size: 1.2rem;
            color: #fff;
            text-shadow: 0 6px 22px rgba(0,0,0,0.4);
          }
        `}</style>
      </section>

      {/* ================= SHOP BY CATEGORY ================= */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <h2 className="text-3xl font-semibold text-center text-black">Shop by Category</h2>
        <p className="text-center text-gray-600 mb-8">Explore our curated jewelry collections</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const img = buildImageUrl(cat.imageUrl);
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug ?? cat.id}`}
                className="h-56 rounded-3xl overflow-hidden shadow-lg group relative"
              >
                {img ? (
                  <img src={img} className="w-full h-full object-cover" alt={cat.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">No Image</div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="font-semibold text-lg">{cat.name}</span>
                  {cat.productCount !== undefined && (
                    <span className="text-xs bg-white/10 px-2 py-1 mt-1 rounded-full">{cat.productCount} products</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS (compact, square images, 5 across on laptops) ================= */}
      <section className="max-w-7xl mx-auto px-6 mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-black">Featured Products</h2>
          <Link href="/products" className="text-sm text-amber-600">View all</Link>
        </div>

        <div className="featured-grid">
          {featuredProducts.map((p) => (
            <div key={p.id} className="product-slot">
              <ProductCard
                product={{
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  stockQuantity: p.stockQuantity,
                  mainImageUrl: p.mainImageUrl,
                  image2Url: p.image2Url,
                  image3Url: p.image3Url,
                  image4Url: p.image4Url,
                  description: p.description,
                }}
              />
            </div>
          ))}
        </div>

        <style>{`
          /* responsive grid: 5 columns at >=1024px so laptops show 5 */
          .featured-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 0.75rem;
            align-items: start;
          }
          @media (min-width: 640px) {
            .featured-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (min-width: 768px) {
            .featured-grid { grid-template-columns: repeat(3, 1fr); }
          }
          @media (min-width: 1024px) {
            .featured-grid { grid-template-columns: repeat(5, 1fr); } /* 5 across on laptops/desktops */
          }

          /* center compact cards and avoid extra vertical gaps */
          .product-slot {
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }

          /* ensure the card occupies full slot width */
          .product-slot article { width: 100%; max-width: 100%; }
        `}</style>
      </section>

      {/* ================= OUR STORY ================= */}
      <section className="w-full mt-20" style={{ backgroundColor: "#d6aa2f" }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-serif text-[#0b0b0b] mb-6">Our Story</h2>
              <p className="text-lg text-[#111827] mb-6 leading-relaxed">
                At Younyx Collections, we believe that elegance should be accessible to everyone. Our journey began with a simple vision: to create premium artificial jewelry that rivals the beauty of fine jewelry.
              </p>
              <p className="text-lg text-[#111827] mb-8 leading-relaxed">
                Each piece in our collection is thoughtfully designed and meticulously crafted to bring joy and confidence to those who wear it.
              </p>

              <Link href="/about" className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#e6c24a]/95 text-black font-medium shadow-md hover:opacity-90 transition">
                Learn More →
              </Link>
            </div>

            <div className="flex items-start justify-center gap-8 w-full">
              <div className="rounded-xl overflow-hidden bg-white border-4 border-white/80" style={{ width: "100%", maxWidth: 380, aspectRatio: "4/5", boxShadow: "0 18px 40px rgba(0,0,0,0.12)", transform: "translateY(-18px)" }}>
                <img src={storyImg1} className="w-full h-full object-cover" alt="Necklace" />
              </div>

              <div className="rounded-xl overflow-hidden bg-white border-4 border-white/80" style={{ width: "100%", maxWidth: 380, aspectRatio: "4/5", boxShadow: "0 18px 40px rgba(0,0,0,0.12)", transform: "translateY(8px)" }}>
                <img src={storyImg2} className="w-full h-full object-cover" alt="Earring" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="mt-20 bg-[var(--brand-bg)] text-white py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-xl font-semibold" style={{ color: "var(--brand-gold)" }}>
            Minimal Designs • Premium Finish • Fast Delivery
          </h3>
          <p className="text-gray-200 mt-2">Discover jewellery that matches your vibe.</p>
          <Link href="/products" className="inline-block mt-5 bg-white text-black px-6 py-2 rounded shadow">Explore All Products</Link>
        </div>
      </section>
    </div>
  );
}
