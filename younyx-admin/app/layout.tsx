"use client";

import "./globals.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Sirf login page public hai
  const PUBLIC_PATHS = ["/login"];

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname || "")) {
      setChecking(false);
      setIsAdmin(false);
      return;
    }

    let mounted = true;

    async function verify() {
      setChecking(true);
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (!mounted) return;

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && (data.id || data.email)) {
            setIsAdmin(true);
            setChecking(false);
            return;
          }
        }

        setIsAdmin(false);
        setChecking(false);
        router.push(`/login?from=${encodeURIComponent(pathname || "/")}`);
      } catch (err) {
        console.error(err);
        setIsAdmin(false);
        setChecking(false);
        router.push(`/login?from=${encodeURIComponent(pathname || "/")}`);
      }
    }

    verify();
    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  // ✅ ONLY CHANGE IS HERE
  const menu = [
    { name: "Dashboard", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Categories", href: "/categories" },

    // ✅ ADDED
    { name: "Collections", href: "/collections" },

    { name: "Conversations", href: "/contacts" },
    { name: "Orders", href: "/orders" },
  ];

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-gold)] mx-auto" />
          <div className="mt-3 text-sm text-black">Verifying session…</div>
        </div>
      </div>
    );
  }

  if (PUBLIC_PATHS.includes(pathname || "")) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 border-r border-gray-200">
        <div className="mb-8 flex items-center gap-3">
          <img src="/Younyx_logo.png" alt="Younyx" className="w-10 h-10 rounded" />
          <div>
            <div className="text-lg font-semibold text-black">Younyx Admin</div>
            <div className="text-xs text-black/80">Administrator</div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {menu.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm transition-all flex items-center justify-between ${
                  active
                    ? "bg-gradient-to-r from-[#c99b10] to-[var(--brand-gold)] text-black font-semibold"
                    : "text-black hover:bg-gray-200"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", {
                  method: "POST",
                  credentials: "include",
                });
              } catch {}
              router.push("/login");
            }}
            className="w-full mt-2 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 text-black bg-white">{children}</main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
