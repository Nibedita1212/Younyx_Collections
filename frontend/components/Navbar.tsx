"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import AuthModal from "./AuthModal";

type User = {
  id?: number | string | null;
  name?: string;
  email?: string;
  role?: string | null;
};

const USER_ID_KEY = "younyx_user_id";
const USER_KEY = "younyx_user";
const ROLE_KEY = "younyx_role";
const AUTH_BROADCAST_KEY = "younyx:auth";

function isProtectedPath(path: string | null | undefined) {
  if (!path) return false;
  const p = path.split("?")[0].replace(/\/+$/g, "");
  const protectedRoots = [
    "/account",
    "/cart",
    "/checkout",
    "/wishlist",
    "/orders",
    "/dashboard",
    "/admin",
  ];
  return protectedRoots.some((r) => p === r || p.startsWith(r + "/"));
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signup" | "login">("signup");

  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [role, setRole] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = !!user;

  /* 🔒 logout only on browser/tab close */
  useEffect(() => {
    function handleBeforeUnload() {
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      if (nav?.type === "reload") return;

      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem("younyx_cart");
      localStorage.removeItem("younyx_wishlist");
      localStorage.setItem(AUTH_BROADCAST_KEY, String(Date.now()));
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) setUser(JSON.parse(raw));
      setRole(localStorage.getItem(ROLE_KEY));
    } catch {}
  }, []);

  async function handleLogout() {
    setUser(null);
    setRole(null);

    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem("younyx_cart");
    localStorage.removeItem("younyx_wishlist");

    if (isProtectedPath(pathname)) router.replace("/");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`sticky top-0 z-40 transition-all ${
          scrolled
            ? "bg-[var(--brand-bg)]/95 backdrop-blur shadow-md"
            : "bg-[var(--brand-bg)]/90"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Desktop links */}
          <div className="hidden md:flex gap-6 text-sm text-white">
            <Link href="/">Home</Link>
            <Link href="/products">Products</Link>
            <Link href="/collections">Collections</Link>
            <Link href="/about">About</Link> {/* ✅ RESTORED */}
            <Link href="/contact">Contact</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-md bg-[var(--brand-gold)] text-black text-xl"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link href="/wishlist" className="text-white">
                  <span className="text-red-400">♥</span> Wishlist
                </Link>
                <Link href="/cart" className="text-white">
                  🛒 Cart
                </Link>
                <Link
                  href="/account"
                  className="px-3 py-1 rounded bg-[var(--brand-gold)] text-black"
                >
                  My Account
                </Link>
                <button onClick={handleLogout} className="text-white text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthTab("signup");
                    setAuthOpen(true);
                  }}
                  className="px-3 py-1 rounded bg-[var(--brand-gold)] text-black"
                >
                  Signup
                </button>
                <button
                  onClick={() => {
                    setAuthTab("login");
                    setAuthOpen(true);
                  }}
                  className="px-3 py-1 rounded bg-[var(--brand-gold)] text-black"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>

        {/* ===== PREMIUM MOBILE MENU ===== */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4">
            <div className="mt-3 rounded-xl bg-[#0f2a22] border border-white/10 shadow-xl overflow-hidden">
              {/* Navigation */}
              <div className="flex flex-col divide-y divide-white/10">
                <Link href="/" onClick={closeMenu} className="px-4 py-3 text-white hover:bg-white/5">
                  Home
                </Link>
                <Link href="/products" onClick={closeMenu} className="px-4 py-3 text-white hover:bg-white/5">
                  Products
                </Link>
                <Link href="/collections" onClick={closeMenu} className="px-4 py-3 text-white hover:bg-white/5">
                  Collections
                </Link>
                <Link href="/about" onClick={closeMenu} className="px-4 py-3 text-white hover:bg-white/5">
                  About
                </Link> {/* ✅ RESTORED */}
                <Link href="/contact" onClick={closeMenu} className="px-4 py-3 text-white hover:bg-white/5">
                  Contact
                </Link>
              </div>

              {/* Account section */}
              <div className="border-t border-white/10">
                {isLoggedIn ? (
                  <div className="flex flex-col divide-y divide-white/10">
                    <Link href="/wishlist" onClick={closeMenu} className="px-4 py-3 text-white">
                      ♥ Wishlist
                    </Link>
                    <Link href="/cart" onClick={closeMenu} className="px-4 py-3 text-white">
                      🛒 Cart
                    </Link>
                    <Link href="/account" onClick={closeMenu} className="px-4 py-3 text-white">
                      My Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-3 text-left text-[var(--brand-gold)]"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 p-4">
                    <button
                      onClick={() => {
                        setAuthTab("signup");
                        setAuthOpen(true);
                        closeMenu();
                      }}
                      className="w-full py-2 rounded bg-[var(--brand-gold)] text-black font-medium"
                    >
                      Signup
                    </button>
                    <button
                      onClick={() => {
                        setAuthTab("login");
                        setAuthOpen(true);
                        closeMenu();
                      }}
                      className="w-full py-2 rounded border border-[var(--brand-gold)] text-[var(--brand-gold)]"
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        open={authOpen}
        initialTab={authTab}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={(u) => {
          setUser(u ?? null);
          setRole(u?.role ?? null);
          setAuthOpen(false);
        }}
      />
    </>
  );
}
