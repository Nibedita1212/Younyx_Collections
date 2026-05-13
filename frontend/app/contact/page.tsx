// app/contact/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const RAW_API =
  typeof process !== "undefined" && process.env
    ? process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080/api"
    : "http://localhost:8080/api";

// Normalize base (remove trailing /api or slash) — call endpoints with `${API_BASE}/api/...`
const API_BASE = String(RAW_API).replace(/\/api\/?$/i, "").replace(/\/$/, "");

type MeDto = {
  email?: string | null;
  name?: string | null;
};

export default function ContactPage() {
  const router = useRouter();

  // me: undefined = loading, null = not signed in, object = signed in
  const [me, setMe] = useState<MeDto | null | undefined>(undefined);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [showSigninPrompt, setShowSigninPrompt] = useState(false);

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Public page: do NOT redirect anywhere. Just detect auth state for convenience (prefill).
  async function fetchMe() {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (res.status === 401) {
        // Not signed in — keep page public. We'll set me = null so submit shows signin prompt.
        setMe(null);
        return;
      }

      if (!res.ok) {
        // treat as not signed in (but remain on page)
        setMe(null);
        return;
      }

      const dto: MeDto = await res.json().catch(() => null);
      setMe(dto || null);
      if (dto) {
        if (dto.name) setName(dto.name);
        if (dto.email) setEmail(dto.email);
      }
    } catch (err) {
      console.error("fetchMe error", err);
      setMe(null);
    }
  }

  function validate() {
    if (!name.trim()) return "Please enter your name.";
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Please enter a valid email.";
    if (!message.trim()) return "Please write a short message.";
    return null;
  }

  // Submit: if user is not signed in, show modal prompt (no redirect). If signed in, send to backend.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    // If still checking login
    if (me === undefined) {
      setFeedback("Checking authentication, please try again.");
      return;
    }

    // If not logged in → show modal (do NOT redirect away)
    if (me === null) {
      setShowSigninPrompt(true);
      return;
    }

    // Logged in → validate + send
    const err = validate();
    if (err) {
      setFeedback(err);
      return;
    }

    setSending(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
      };

      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        // session expired or unauthorized -> set as logged out and show prompt (no redirect)
        setMe(null);
        setShowSigninPrompt(true);
        return;
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => res.statusText);
        setFeedback(`Failed to send message: ${txt || res.status}`);
      } else {
        setFeedback("Message sent — we will get back to you soon.");
        setSubject("");
        setMessage("");
        setPhone("");
      }
    } catch (err) {
      console.error(err);
      setFeedback("Network error. Please try again later.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-black mb-2">Contact Us</h1>

      <p className="text-sm text-black mb-6">
        For any queries, DM us on Instagram:{" "}
        <a
          href="https://instagram.com/younyxcollections"
          target="_blank"
          rel="noreferrer"
          className="underline font-medium"
        >
          @younyxcollections
        </a>
        <br />
        You can also reach us by phone or email.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow border border-black/10">
          <h2 className="font-medium text-black mb-2">Support</h2>
          <p className="text-sm text-black">
            Phone:{" "}
            <a href="tel:9827685608" className="underline">
              9827685608
            </a>
            <br />
            Email:{" "}
            <a href="mailto:younyx.online@gmail.com" className="underline">
              younyx.online@gmail.com
            </a>
          </p>

          <p className="text-sm text-black mt-3">
            DM anytime:{" "}
            <a
              href="https://instagram.com/younyxcollections"
              target="_blank"
              rel="noreferrer"
              className="underline font-medium"
            >
              @younyxcollections
            </a>
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow border border-black/10">
          <h2 className="font-medium text-black mb-2">Quick Response</h2>
          <p className="text-sm text-black">
            We reply fastest on Instagram DM. Email responses may take a few hours.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow border border-black/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-black rounded text-black placeholder-gray-400"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-black rounded text-black placeholder-gray-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Phone (optional)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-black rounded text-black placeholder-gray-400"
              placeholder="+91 9XXXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Subject (optional)</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border border-black rounded text-black placeholder-gray-400"
              placeholder="Subject"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-black mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full p-2 border border-black rounded text-black placeholder-gray-400"
            placeholder="Write your message here..."
          />
        </div>

        {feedback && <div className="mt-4 text-sm text-black">{feedback}</div>}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 rounded bg-black text-white font-semibold disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send message"}
          </button>

          <button
            type="button"
            onClick={() => {
              setName("");
              setEmail("");
              setPhone("");
              setSubject("");
              setMessage("");
              setFeedback(null);
            }}
            className="px-3 py-2 rounded border border-black text-black"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Sign in Prompt Modal (shown only on submit if not signed in) */}
      {showSigninPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowSigninPrompt(false)}
          />

          <div className="relative bg-white rounded-lg shadow-lg p-6 w-96 border border-gray-200">
            <h3 className="text-xl font-semibold text-black mb-3">Please sign in</h3>

            <p className="text-sm text-gray-700 mb-5">
              You must be signed in to send messages and view replies. Please sign in to continue.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSigninPrompt(false)}
                className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowSigninPrompt(false);
                  router.push(`/login?next=${encodeURIComponent("/contact")}`);
                }}
                className="px-4 py-2 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-700"
              >
                Sign in
              </button>

              <button
                onClick={() => {
                  setShowSigninPrompt(false);
                  router.push("/register");
                }}
                className="px-3 py-2 rounded border border-black text-black hover:bg-gray-100"
              >
                Create account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
