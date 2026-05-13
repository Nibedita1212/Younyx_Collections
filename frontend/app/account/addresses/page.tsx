"use client";

import React, { useEffect, useState } from "react";
import { useProtectedPage } from "../../lib/useProtected";

export default function AddressesPage() {
  const { user, loading } = useProtectedPage("/");
  const [data, setData] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const uid = localStorage.getItem("younyx_user_id");
        if (!uid) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/customers/me`,
          {
            headers: { "X-User-Id": uid }
          }
        );

        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("ADDRESS LOAD ERROR", e);
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, []);

  if (loading || fetching) return <Loading />;
  if (!user) return null;

  const hasAddress =
    data?.flatBuildingArea ||
    data?.city ||
    data?.pincode;

  return (
    <PageShell title="Saved address" back="/account">
      {hasAddress ? (
        <div className="border border-white/20 rounded-xl p-5 bg-[#0b0b0b]">
          <p>{data?.flatBuildingArea}</p>
          <p>{data?.city}, {data?.district}</p>
          <p>{data?.state} - {data?.pincode}</p>
          <p>{data?.country}</p>
        </div>
      ) : (
        <Empty text="No address saved yet." />
      )}
    </PageShell>
  );
}

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
      <header className="border-b border-white/10 px-4 py-4 flex justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <a href={back} className="text-xs underline">← Back</a>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

function Empty({ text }: any) {
  return (
    <div className="border border-dashed border-white/20 rounded-xl p-6 text-gray-400">
      {text}
    </div>
  );
}
