"use client";

import { useProtectedPage } from "../../lib/useProtected";

export default function OrdersPage() {
  const { loading } = useProtectedPage("/");

  if (loading) return <Loading />;

  return (
    <PageShell title="Order history" back="/account">
      <div className="border border-dashed border-white/20 rounded-xl p-6 text-gray-400">
        You don’t have any orders yet.
      </div>
    </PageShell>
  );
}

function Loading() {
  return <div className="min-h-screen flex items-center justify-center text-gold">Loading…</div>;
}

function PageShell({ title, back, children }: any) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-4 py-4 flex justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <a href={back} className="text-xs underline">← Back</a>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
