"use client";
import React, { useEffect, useState } from "react";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string | null;
  status: string;
  adminReply?: string;
  repliedAt?: string | null;
}

export default function ContactsAdminPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savingReply, setSavingReply] = useState(false);

  const api = {
    list: "/api/admin/contacts",
    get: (id: number) => `/api/admin/contacts/${id}`,
    reply: (id: number) => `/api/admin/contacts/${id}/reply`,
  };

  function authHeaders(): HeadersInit {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(api.list, {
        headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
      });
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const data: ContactMessage[] = await res.json();
      setMessages(data);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDetail(id: number) {
    setDetailLoading(true);
    setError(null);
    try {
      const res = await fetch(api.get(id), {
        headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
      });
      if (!res.ok) throw new Error(`Failed to fetch detail (${res.status})`);
      const dto: ContactMessage = await res.json();
      setSelected(dto);
      setReplyText(dto.adminReply || "");
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setDetailLoading(false);
    }
  }

  function filteredMessages() {
    if (!filter) return messages;
    const q = filter.toLowerCase();
    return messages.filter((m) =>
      [m.name, m.email, m.subject, m.message, m.status].some((v) => v && v.toLowerCase().includes(q))
    );
  }

  async function handleReplySend() {
    if (!selected) return;
    setSavingReply(true);
    setError(null);

    try {
      const res = await fetch(api.reply(selected.id), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
        body: JSON.stringify({ reply: replyText }),
      });

      if (!res.ok) throw new Error(`Failed to save reply (${res.status})`);
      const updated: ContactMessage = await res.json();
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setSelected(updated);
      window.alert("Reply saved");
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setSavingReply(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Contact Messages (Admin)</h1>
          <div className="flex items-center gap-2">
            <input
              className="border rounded-md px-3 py-2 w-64 bg-white"
              placeholder="Search by name, email, subject or status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <button onClick={fetchList} className="bg-indigo-600 text-white px-4 py-2 rounded-md">
              Refresh
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <strong>Messages</strong>
                {loading && <span className="ml-3 text-sm text-gray-500">loading…</span>}
                {error && <div className="text-red-600 mt-2">{error}</div>}
              </div>

              <div className="p-2">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-gray-600">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMessages().length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-500">
                          No messages
                        </td>
                      </tr>
                    )}

                    {filteredMessages().map((m, idx) => (
                      <tr key={m.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => fetchDetail(m.id)}>
                        <td className="p-3 align-top">{idx + 1}</td>
                        <td className="p-3 align-top font-medium">{m.name}</td>
                        <td className="p-3 align-top text-xs">{m.email}</td>
                        <td className="p-3 align-top">{m.subject}</td>
                        <td className="p-3 align-top">
                          <span className={`inline-block px-2 py-1 text-xs rounded ${m.status === "NEW" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="p-3 align-top text-xs">{m.createdAt ? new Date(m.createdAt).toLocaleString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium">Details</h2>
                <button
                  onClick={() => {
                    setSelected(null);
                    setReplyText("");
                  }}
                  className="text-sm text-gray-500"
                >
                  Clear
                </button>
              </div>

              {detailLoading && <div className="text-sm text-gray-500">Loading...</div>}

              {!selected && !detailLoading && <div className="text-sm text-gray-500">Select a message to see details</div>}

              {selected && (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-400">From</div>
                    <div className="font-medium">{selected.name} &lt;{selected.email}&gt;</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400">Subject</div>
                    <div className="font-medium">{selected.subject}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400">Message</div>
                    <div className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{selected.message}</div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Admin reply</label>
                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={6} className="w-full border rounded-md p-2 text-sm" placeholder="Write a reply to save for this user..." />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button onClick={handleReplySend} disabled={savingReply} className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-60">
                      {savingReply ? "Saving..." : "Save Reply"}
                    </button>
                  </div>

                  <div className="text-xs text-gray-400 mt-2">Replied at: {selected.repliedAt ? new Date(selected.repliedAt).toLocaleString() : "-"}</div>
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-500">Tip: Protect this UI with your admin auth mechanism.</div>
          </aside>
        </main>
      </div>
    </div>
  );
}
