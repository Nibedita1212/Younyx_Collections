// components/Footer.tsx
import Link from "next/link";

const RAW_API =
  typeof process !== "undefined" && process.env
    ? process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080/api"
    : "http://localhost:8080/api";

const API_BASE = String(RAW_API)
  .replace(/\/api\/?$/i, "")
  .replace(/\/$/, "");

async function getCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();

    return Array.isArray(data)
      ? data.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug ?? c.name,
        }))
      : [];
  } catch {
    return [];
  }
}

export default async function Footer() {
  const categories = await getCategories();
  return (
    <footer
      aria-labelledby="footer-heading"
      style={{ backgroundColor: "var(--brand-bg)" }}
      className="mt-12"
    >
      <div className="max-w-7xl mx-auto px-12 py-4 sm:py-12">

        {/* 3 equal columns on large screens (Brand | Shop | Policies) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-sm text-white items-start">

          {/* Brand */}
          <div>
            <h3 id="footer-heading" className="text-lg font-semibold" style={{ color: "var(--brand-gold)" }}>
              Younyx Collections
            </h3>

            <p className="mt-2 text-sm text-gray-100">
              Minimal & premium jewellery designed for everyday elegance.
            </p>

            <div className="mt-4 text-sm text-gray-200 space-y-1">
              <div>📍 Mumbai, India</div>
              <div>
                ✉️{" "}
                <a href="mailto:younyx.online@gmail.com" className="underline underline-offset-2" style={{ color: "rgba(255,255,255,0.95)" }}>
                  younyx.online@gmail.com
                </a>
              </div>
              <div>
                📞{" "}
                <a href="tel:+919827685608" className="underline" style={{ color: "rgba(255,255,255,0.95)" }}>
                  +91 9827685608
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-3">
              <a href="https://instagram.com/younyxcollections" target="_blank" rel="noreferrer" aria-label="Instagram" className="inline-flex">
                {/* Instagram SVG */}
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 551.034 551.034"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <linearGradient id="IG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#feda75" />
                    <stop offset="25%" stopColor="#fa7e1e" />
                    <stop offset="50%" stopColor="#d62976" />
                    <stop offset="75%" stopColor="#962fbf" />
                    <stop offset="100%" stopColor="#4f5bd5" />
                  </linearGradient>

                  <path
                    fill="url(#IG)"
                    d="M386.878 0H164.156C73.65 0 0 73.65 0 164.156v222.721C0 477.384 73.65 551.034 164.156 551.034h222.721c90.506 0 164.156-73.65 164.156-164.156V164.156C551.034 73.65 477.384 0 386.878 0zM495.034 386.878c0 59.821-48.334 108.156-108.156 108.156H164.156c-59.821 0-108.156-48.334-108.156-108.156V164.156c0-59.821 48.334-108.156 108.156-108.156h222.721c59.821 0 108.156 48.334 108.156 108.156v222.721z"
                  />

                  <path
                    fill="#fff"
                    d="M275.517 133.06c-78.571 0-142.457 63.886-142.457 142.457S196.946 418 275.517 418s142.457-63.886 142.457-142.457-63.886-142.483-142.457-142.483zm0 234.914c-51.017 0-92.457-41.44-92.457-92.457s41.44-92.457 92.457-92.457 92.457 41.44 92.457 92.457-41.44 92.457-92.457 92.457z"
                  />

                  <circle fill="#fff" cx="418.31" cy="133.06" r="34.15" />
                </svg>
              </a>

              <a href="https://www.facebook.com/profile.php?id=61584111562604" target="_blank" rel="noreferrer" aria-label="Facebook" className="inline-flex">
                {/* Facebook SVG */}
                <svg width="20" height="20" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#1877F2" d="M279.14 288l14.22-92.66h-88.91V127.41c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="text-center lg:text-center">
            <h4 className="text-sm font-semibold" style={{ color: "var(--brand-gold)" }}>Shop</h4>
            <ul className="mt-3 space-y-2 text-gray-200">
              {categories.length > 0 ? (
                categories.map(cat => (
                  <li key={cat.id}>
                    <Link href={`/products?category=${encodeURIComponent(cat.name)}`} className="hover:underline">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>No categories available</li>
              )}
            </ul>

          </div>


          {/* Policies & Info */}
          <div className="text-center lg:text-center">
            <h4 className="text-sm font-semibold" style={{ color: "var(--brand-gold)" }}>Policies & Info</h4>
            <ul className="mt-3 space-y-2 text-gray-200">
              <li><Link href="/policies/shipping" className="hover:underline">Shipping & Delivery</Link></li>
              <li><Link href="/policies/returns" className="hover:underline">Returns & Exchange</Link></li>
              <li><Link href="/policies/care" className="hover:underline">Jewellery Care</Link></li>
              <li><Link href="/policies/terms" className="hover:underline">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom: payments + copyright (compact) */}
        <div className="mt-6 border-t border-white/10 pt-3 text-center text-xs text-gray-300">
          <div className="mb-2 text-sm text-gray-200">Accepted payment methods</div>

          <div className="flex items-center justify-center gap-2 text-gray-200">
            <span className="px-2 py-0.5 border border-white/10 rounded">Visa</span>
            <span className="px-2 py-0.5 border border-white/10 rounded">Mastercard</span>
            <span className="px-2 py-0.5 border border-white/10 rounded">UPI</span>
            <span className="px-2 py-0.5 border border-white/10 rounded">COD</span>
          </div>

          <div className="mt-5 text-xs">
            © {new Date().getFullYear()} <span className="font-medium text-white">Younyx Collections</span> — All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}
