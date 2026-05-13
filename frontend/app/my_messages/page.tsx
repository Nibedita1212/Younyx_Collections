// app/my_messages/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useProtectedPage } from "../lib/useProtected";

type Msg = {
  id: number;
  name?: string | null;
  email?: string | null;
  subject: string;
  message: string;
  adminReply?: string | null;
  status?: string | null; // NEW, REPLIED, READ
  createdAt?: string | null; // ISO
  repliedAt?: string | null; // ISO
};

const LOCAL_KEY = "younyx_unread_count";
const BC_NAME = "younyx_unread_channel";

export default function MyMessagesPage() {
  // protection hook: will redirect to "/" if not authenticated
  const { user, loading: authLoading } = useProtectedPage("/");

  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<Msg | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [filter, setFilter] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [savingReply, setSavingReply] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const v = localStorage.getItem(LOCAL_KEY);
    return v ? parseInt(v, 10) || 0 : 0;
  });

  const api = {
    myList: "/api/contact/my",
    get: (id: number) => `/api/contact/${id}`,
    markRead: (id: number) => `/api/contact/${id}/mark-read`,
    // userReply: (id: number) => `/api/contact/${id}/reply-by-user`,
  };

  // simple auth headers helper (harmless if no token)
  function authHeaders(): HeadersInit {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Fetch list only after auth check completes and user is present
  useEffect(() => {
    if (authLoading) return;
    if (!user) return; // useProtectedPage will redirect if unauthenticated
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(api.myList, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
        credentials: "include",
      });

      if (res.status === 401) {
        setError("Please sign in to view your messages.");
        setMessages([]);
        writeUnreadLocal(0);
        setUnreadCount(0);
        return;
      }

      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const data: Msg[] = await res.json();
      setMessages(data || []);

      // compute unread: messages that have adminReply and status !== 'READ'
      const u = (data || []).filter((m) => !!m.adminReply && m.status !== "READ").length;
      setUnreadCount(u);
      writeUnreadLocal(u);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDetail(id: number) {
    setDetailLoading(true);
    setError(null);
    try {
      const res = await fetch(api.get(id), {
        method: "GET",
        headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
        credentials: "include",
      });
      if (res.status === 401) {
        setError("Please sign in to view this message.");
        setSelected(null);
        return;
      }
      if (!res.ok) throw new Error(`Failed to fetch detail (${res.status})`);
      const dto: Msg = await res.json();
      setSelected(dto);
      setReplyText(dto.adminReply || "");
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setDetailLoading(false);
    }
  }

  async function markMessageRead(id: number) {
    try {
      const res = await fetch(api.markRead(id), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
        credentials: "include",
        body: JSON.stringify({}),
      });

      // update client state regardless of server response
      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === id ? { ...m, status: "READ" } : m));
        const u = updated.filter((m) => !!m.adminReply && m.status !== "READ").length;
        setUnreadCount(u);
        writeUnreadLocal(u);
        return updated;
      });

      if (selected && selected.id === id) {
        setSelected((s) => (s ? { ...s, status: "READ" } : s));
      }

      // optionally handle server error (non-ok) silently
      if (!res.ok) {
        console.warn("markRead returned", res.status);
      }
    } catch (e: any) {
      // best-effort client update on error
      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === id ? { ...m, status: "READ" } : m));
        const u = updated.filter((m) => !!m.adminReply && m.status !== "READ").length;
        setUnreadCount(u);
        writeUnreadLocal(u);
        return updated;
      });
      if (selected && selected.id === id) {
        setSelected((s) => (s ? { ...s, status: "READ" } : s));
      }
    }
  }

  async function handleUserReplySend() {
    if (!selected) return;
    setSavingReply(true);
    setError(null);
    try {
      window.alert("Reply sending not implemented on backend. Implement `POST /api/contact/{id}/reply-by-user` to enable.");
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setSavingReply(false);
    }
  }

  function filteredMessages() {
    if (!filter) return messages;
    const q = filter.toLowerCase();
    return messages.filter((m) =>
      [m.name, m.email, m.subject, m.message, m.status].some((v) => (v || "").toLowerCase().includes(q))
    );
  }

  const sortedMessages = useMemo(() => {
    return [...filteredMessages()].sort((a, b) => {
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
      return tb - ta;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, filter]);

  // BroadcastChannel / storage sync for unread
  useEffect(() => {
    writeUnreadLocal(unreadCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadCount]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let bc: BroadcastChannel | null = null;

    function handleStorage(e: StorageEvent) {
      if (e.key === LOCAL_KEY || e.key === "younyx_unread_bump") {
        const v = localStorage.getItem(LOCAL_KEY);
        setUnreadCount(v ? parseInt(v, 10) || 0 : 0);
      }
    }

    if ("BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel(BC_NAME);
        bc.onmessage = (ev) => {
          const payload = ev.data;
          if (payload && typeof payload.unread === "number") {
            setUnreadCount(payload.unread);
          } else {
            const v = localStorage.getItem(LOCAL_KEY);
            setUnreadCount(v ? parseInt(v, 10) || 0 : 0);
          }
        };
      } catch (err) {
        bc = null;
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // When page mounts, optionally clear unread after a short delay (user is viewing page)
  useEffect(() => {
    const t = setTimeout(() => {
      if (unreadCount > 0) {
        writeUnreadLocal(0);
        setUnreadCount(0);
        // Optionally also mark all messages read server-side: implement API if desired
      }
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-[var(--brand-gold)] px-4">
        <div className="w-full max-w-xs px-4 py-3 rounded-xl border border-[var(--brand-gold)]/40 bg-black/80 shadow-xl text-center">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--brand-gold)]/80 mb-1">Younyx</div>
          <div className="text-sm text-gray-200">Loading messages…</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">My Messages</h1>
            <p className="mt-1 text-sm text-black/80">Your messages and replies from admin.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              className="border rounded-md px-3 py-2 w-72 bg-white text-black"
              placeholder="Search by name, email, subject or status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <button onClick={fetchList} className="bg-indigo-600 text-white px-4 py-2 rounded-md">
              Refresh
            </button>

            <div className="px-3 py-1 rounded-full bg-red-600 text-white font-semibold text-sm">
              {unreadCount > 0 ? `${unreadCount} new` : "No new replies"}
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: messages list */}
          <section className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <strong className="text-black">Messages</strong>
                {loading && <span className="ml-3 text-sm text-black/60">loading…</span>}
                {error && <div className="text-red-600 mt-2">{error}</div>}
              </div>

              <div className="p-2">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="p-3 text-black">#</th>
                      <th className="p-3 text-black">Subject</th>
                      <th className="p-3 text-black">Status</th>
                      <th className="p-3 text-black">Received</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedMessages.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-black/60">
                          No messages
                        </td>
                      </tr>
                    )}

                    {sortedMessages.map((m, idx) => (
                      <tr
                        key={m.id}
                        className="border-t hover:bg-gray-50 cursor-pointer"
                        onClick={() => fetchDetail(m.id)}
                      >
                        <td className="p-3 align-top">{idx + 1}</td>
                        <td className="p-3 align-top font-medium text-black">{m.subject}</td>
                        <td className="p-3 align-top">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded ${
                              m.status === "NEW"
                                ? "bg-yellow-100 text-yellow-800"
                                : m.status === "READ"
                                ? "bg-gray-200 text-black"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {m.status ?? "NEW"}
                          </span>
                        </td>
                        <td className="p-3 align-top text-xs text-black/80">
                          {m.createdAt ? new Date(m.createdAt).toLocaleString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* RIGHT: detail & reply panel */}
          <aside className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-black">Details</h2>
                <button
                  onClick={() => {
                    setSelected(null);
                    setReplyText("");
                  }}
                  className="text-sm text-black/70"
                >
                  Clear
                </button>
              </div>

              {detailLoading && <div className="text-sm text-black/70">Loading...</div>}

              {!selected && !detailLoading && <div className="text-sm text-black/70">Select a message to see details</div>}

              {selected && (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-black/60">From</div>
                    <div className="font-medium text-black">
                      {selected.name ?? "—"} &lt;{selected.email ?? "—"}&gt;
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-black/60">Subject</div>
                    <div className="font-medium text-black">{selected.subject}</div>
                  </div>

                  <div>
                    <div className="text-xs text-black/60">Message</div>
                    <div className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded text-black">{selected.message}</div>
                  </div>

                  <div>
                    <div className="text-xs text-black/60 mb-1">Admin reply</div>
                    {selected.adminReply ? (
                      <div className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded text-black">
                        {selected.adminReply}
                      </div>
                    ) : (
                      <div className="text-black/70">No reply yet</div>
                    )}

                    {selected.repliedAt && (
                      <div className="text-xs text-black/60 mt-2">Replied at: {new Date(selected.repliedAt).toLocaleString()}</div>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        if (selected) markMessageRead(selected.id);
                      }}
                      className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-black"
                    >
                      Mark read
                    </button>

                    <button
                      onClick={handleUserReplySend}
                      disabled={savingReply}
                      className="text-sm px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-60"
                    >
                      {savingReply ? "Sending..." : "Send reply"}
                    </button>
                  </div>

                  <div className="text-xs text-black/60 mt-2">
                    Status: <span className="font-semibold">{selected.status ?? "NEW"}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-black/70">
              Tip: Messages are loaded from the `contact_messages` table in the database.
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

/* ----------------- helper: write unread to local and broadcast ----------------- */
function writeUnreadLocal(count: number) {
  try {
    if (typeof window === "undefined") return;
    if (count > 0) localStorage.setItem(LOCAL_KEY, String(count));
    else localStorage.removeItem(LOCAL_KEY);

    if ("BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel(BC_NAME);
        bc.postMessage({ unread: count });
        bc.close();
      } catch (e) {
        try {
          localStorage.setItem("younyx_unread_bump", String(Date.now()));
        } catch {}
      }
    } else {
      try {
        localStorage.setItem("younyx_unread_bump", String(Date.now()));
      } catch {}
    }
  } catch (e) {
    // ignore
  }
}
