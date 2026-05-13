"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search?.get("from") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError((data as any)?.message || "Login failed. Check credentials.");
        setLoading(false);
        return;
      }

      router.push(from || "/");
    } catch (err) {
      console.error("network error", err);
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg ring-1 ring-black/10 overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <img
              src="/Younyx_logo.png"
              alt="logo"
              className="w-12 h-12 rounded"
            />
            <div>
              <div className="text-lg font-semibold text-gray-900">
                Admin sign in
              </div>
              <div className="text-xs text-gray-700">
                Use your admin credentials to continue
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="p-6 flex flex-col gap-4 text-gray-900"
          noValidate
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]"
              type="email"
              name="email"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]"
              type="password"
              name="password"
              placeholder="Your password"
              required
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)] hover:from-[#b0890e] hover:to-[#c99b10] text-black font-semibold shadow-sm"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
