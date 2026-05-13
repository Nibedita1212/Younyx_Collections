"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Reset Password page
 * - Expects query param: ?temp=<tempToken>
 * - Submits new password to backend: POST /api/auth/reset-password { tempToken, newPassword }
 */

export default function ResetPasswordPage() {
  const router = useRouter();
  const search = useSearchParams();
  const tempFromQuery = search.get("temp") ?? "";

  // hooks
  const [tempToken, setTempToken] = useState(tempFromQuery);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setTempToken(tempFromQuery);
  }, [tempFromQuery]);

  async function handleReset(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!tempToken) {
      setError("Missing temporary token. Please verify OTP first.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to reset password.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Password reset successful — redirecting to login…");
      setTimeout(() => {
        router.push("/"); // or route to login page
      }, 900);
    } catch (err) {
      console.error(err);
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg ring-1 ring-black/10 overflow-hidden">
        <div className="p-5 border-b">
          <div className="text-sm font-semibold text-black">Reset password</div>
          <div className="text-xs text-black/85">Enter a new password for your account</div>
        </div>

        <div className="p-6">
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Temporary token</label>
              <input
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-black placeholder-gray-600"
                value={tempToken}
                onChange={(e) => setTempToken(e.target.value)}
                placeholder="temp token (auto-filled from verify step)"
              />
              <div className="text-xs text-gray-500 mt-1">This token is short-lived and only used to authorize the reset.</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">New password</label>
              <input
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-black"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Confirm new password</label>
              <input
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-black"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
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
                {loading ? "Saving…" : "Set new password"}
              </button>
            </div>

            <div className="text-sm text-gray-600 text-center">
              If the link expired, go back to request a new OTP.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
