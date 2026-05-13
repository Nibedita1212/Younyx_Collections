"use client";

import { useRouter } from "next/navigation";
import { useProtectedPage } from "../../lib/useProtected";

export default function ProfileDetailsPage() {
  const router = useRouter();
  const { user, loading } = useProtectedPage("/");

  if (loading) return <Loading />;
  if (!user) return null;

  const u: any = user;

  return (
    <PageShell title="Profile details" back="/account">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Full name" value={u.name} />
        <Field label="Email" value={u.email} />
        <Field label="Phone" value={u.phone || "Not added"} />
        <Field label="Gender" value={u.gender || "Not specified"} />
      </div>

      <ActionBar>
        <button
          onClick={() => router.push("/account/edit")}
          className="gold-btn"
        >
          Edit profile
        </button>
      </ActionBar>
    </PageShell>
  );
}

/* ---------- helpers ---------- */

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center text-[var(--brand-gold)]">
      Loading…
    </div>
  );
}

function PageShell({ title, back, children }: any) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header title={title} back={back} />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

function Header({ title, back }: any) {
  const router = useRouter();
  return (
    <header className="border-b border-white/10 px-4 py-4 flex justify-between">
      <h1 className="text-lg font-semibold">{title}</h1>
      <button onClick={() => router.push(back)} className="text-xs underline">
        ← Back
      </button>
    </header>
  );
}

function Field({ label, value }: any) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-gray-400">
        {label}
      </div>
      <div className="mt-1 text-gray-100">{value}</div>
    </div>
  );
}

function ActionBar({ children }: any) {
  return <div className="mt-8 flex justify-end">{children}</div>;
}
