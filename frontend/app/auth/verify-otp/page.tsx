"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Verify OTP page
 * - Expects query param: ?identifier=you@example.com OR ?identifier=%2B919876...
 * - On success: backend returns { tempToken } -> redirect to /auth/reset-password?temp=...
 *
 * Replace relative fetch URLs if your backend differs.
 */

export default function VerifyOtpPage() {
  const router = useRouter();
  const search = useSearchParams();
  const initialIdentifier = search.get("identifier") ?? "";

  // Hooks at top
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // keep local identifier in sync with query param if it changes
    setIdentifier(initialIdentifier);
  }, [initialIdentifier]);

  async function handleVerify(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setError("Missing identifier (email or phone).");
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      // Replace this URL if your Spring Boot API is hosted on another base URL.
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), otp: otp.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        // show server message or generic
        setError(data?.message || "OTP verification failed.");
        setLoading(false);
        return;
      }

      // expect data.tempToken
      const tempToken = data?.tempToken;
      if (!tempToken) {
        setError("Server did not return a temporary token.");
        setLoading(false);
        return;
      }

      // Option A: pass tempToken via query to reset page (short-lived)
      // Note: tempToken is short-lived — that's fine for this redirect flow.
      setSuccessMsg("OTP verified — redirecting to reset password…");
      setTimeout(() => {
        router.push(`/auth/reset-password?temp=${encodeURIComponent(tempToken)}`);
      }, 700);
    } catch (err) {
      console.error(err);
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleBackToRequest() {
    router.push("/"); // or wherever your forgot request lives (e.g., root modal)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg ring-1 ring-black/10 overflow-hidden">
        <div className="p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-[var(--brand-bg)] flex items-center justify-center overflow-hidden">
              <img src="/Younyx_logo.png" alt="reference" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <div className="text-sm font-semibold text-black">Verify OTP</div>
              <div className="text-xs text-black/85">Enter the 6-digit code we sent to your email or phone</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Identifier (email or phone)</label>
              <input
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or +919876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">OTP</label>
              <input
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                inputMode="numeric"
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
            {successMsg && <div className="text-sm text-green-600">{successMsg}</div>}

            <div>
              <button
                type="submit"
                className="w-full py-2 rounded-md bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)]
                           hover:from-[#b0890e] hover:to-[#c99b10] text-black font-semibold shadow-sm transition-all duration-200"
                disabled={loading}
              >
                {loading ? "Verifying…" : "Verify OTP"}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <button
                type="button"
                onClick={() => router.back()}
                className="underline hover:font-bold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  // optional: allow re-request by redirecting to request page
                  router.push("/auth/forgot"); // adjust if your request page route differs
                }}
                className="underline hover:font-bold"
              >
                Request new OTP
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
