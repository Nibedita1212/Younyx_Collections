"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProtectedPage } from "../lib/useProtected";

type TabKey = "overview" | "addresses" | "orders" | "wishlist";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading } = useProtectedPage("/");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-[var(--brand-gold)]">
        Loading…
      </div>
    );
  }

  if (!user) return null;
  const u: any = user;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#111] to-[#0b0b0b] text-white">

      {/* HEADER */}
      <header className="border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between">
          <div>
            <div className="text-[10px] tracking-[0.25em] text-[var(--brand-gold)]">
              YOUNYX ACCOUNT
            </div>
            <h1 className="text-sm sm:text-lg font-semibold">
              Welcome, {u.name || u.email}
            </h1>
          </div>

          <button
            onClick={() => router.push("/")}
            className="text-xs px-4 py-1.5 rounded-full border border-white/15 hover:border-[var(--brand-gold)]/60"
          >
            Continue shopping
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* LEFT SIDEBAR */}
        <aside className="md:col-span-1 sticky top-20 h-fit space-y-4">

          {/* Profile Card */}
          <div className="rounded-2xl bg-[#101010] border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--brand-bg)] text-black flex items-center justify-center font-semibold">
                {(u.name || u.email).charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-gray-400">{u.email}</div>
              </div>
            </div>
          </div>

          {/* MENU */}
          <div className="rounded-2xl bg-[#101010] border border-white/10 p-2 text-sm">
            {menuBtn("Overview", "overview")}
            {menuBtn("Addresses", "addresses")}
            {menuBtn("Order history", "orders")}
            {menuBtn("Wishlist", "wishlist")}
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="md:col-span-3 space-y-4">
          {activeTab === "overview" && <Overview u={u} router={router} />}
          {activeTab === "addresses" && <Addresses u={u} />}
          {activeTab === "orders" && <Orders />}
          {activeTab === "wishlist" && <WishlistCTA router={router} />}
        </section>
      </main>
    </div>
  );

  function menuBtn(label: string, key: TabKey) {
    return (
      <button
        key={key}
        onClick={() => setActiveTab(key)}
        className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition ${
          activeTab === key
            ? "bg-white/5 border border-[var(--brand-gold)]/40 text-[var(--brand-gold)]"
            : "text-gray-300 hover:bg-white/5"
        }`}
      >
        {label}
      </button>
    );
  }
}

/* ---------- OVERVIEW ---------- */

function Overview({ u, router }: any) {
  return (
    <div className="bg-[#101010] rounded-2xl border border-white/10 shadow-xl p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold">Account Overview</h2>
          <p className="text-xs text-gray-400">Your personal & address information</p>
        </div>

        <button
          onClick={() => router.push("/account/edit-profile")}
          className="text-xs px-4 py-1.5 rounded-full border border-[var(--brand-gold)]/40 text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/10"
        >
          Edit profile
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <Info label="Full name" value={u.name} />
        <Info label="Email" value={u.email} />
        <Info label="Phone" value={u.phone || "Not added"} />
        <Info label="Gender" value={u.gender || "Not specified"} />

        {/* Default Address */}
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-400">
            Default address
          </div>

          {u.flatBuildingArea || u.city || u.pincode ? (
            <div className="text-xs mt-1 leading-relaxed text-gray-100">
              {u.flatBuildingArea && <div>{u.flatBuildingArea}</div>}
              {u.landmark && <div>{u.landmark}</div>}
              <div>
                {u.city && <span>{u.city}</span>}
                {u.district && u.city && ", "}
                {u.district && <span>{u.district}</span>}
              </div>
              <div>
                {u.state && <span>{u.state}</span>}
                {u.pincode && <> - {u.pincode}</>}
              </div>
              {u.country && <div>{u.country}</div>}
            </div>
          ) : (
            <div className="text-xs text-gray-400">No address added yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- ADDRESSES (PREMIUM STYLE) ---------- */

function Addresses({ u }: any) {
  const hasAddress =
    u?.flatBuildingArea ||
    u?.city ||
    u?.pincode;

  function handleAdd() {
    alert("Add Address form coming soon 😊 (Backend ready hone pe integrate karenge)");
  }

  function handleDelete() {
    if (confirm("Are you sure you want to delete this address?")) {
      alert("Delete API integrate karte hi ye delete ho jayega 😊");
    }
  }

  return (
    <div className="bg-[#101010] rounded-2xl border border-white/10 p-5 text-sm">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold">Saved Address</h2>

        <button
          onClick={handleAdd}
          className="px-4 py-1.5 rounded-full bg-[var(--brand-gold)] text-black text-xs font-semibold hover:opacity-90"
        >
          + Add New Address
        </button>
      </div>

      {hasAddress ? (
        <div className="border border-white/20 rounded-xl p-5 bg-[#0b0b0b]">
          <div className="leading-relaxed text-gray-100">
            {u.flatBuildingArea && <div>{u.flatBuildingArea}</div>}
            {u.landmark && <div>{u.landmark}</div>}

            <div>
              {u.city && <span>{u.city}</span>}
              {u.district && u.city && ", "}
              {u.district && <span>{u.district}</span>}
            </div>

            <div>
              {u.state && <span>{u.state}</span>}
              {u.pincode && <> - {u.pincode}</>}
            </div>

            {u.country && <div>{u.country}</div>}
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleDelete}
              className="px-4 py-1.5 rounded-full border border-red-500 text-red-400 text-xs hover:bg-red-500/10"
            >
              Delete Address
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-400 border border-dashed border-white/20 p-6 rounded-xl">
          No saved address.
        </div>
      )}
    </div>
  );
}

/* ---------- ORDERS ---------- */

function Orders() {
  return (
    <div className="bg-[#101010] rounded-2xl border border-white/10 p-5 text-sm text-gray-400">
      You don’t have any orders yet.
    </div>
  );
}

/* ---------- WISHLIST ---------- */

function WishlistCTA({ router }: any) {
  return (
    <div className="bg-[#101010] rounded-2xl border border-white/10 p-5">
      <h2 className="text-lg font-semibold mb-2">Wishlist</h2>

      <button
        onClick={() => router.push("/wishlist")}
        className="px-4 py-2 rounded-full bg-[var(--brand-gold)] text-black text-sm"
      >
        Go to Wishlist
      </button>
    </div>
  );
}

/* ---------- SMALL INFO ---------- */

function Info({ label, value }: any) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className="text-sm font-medium text-gray-100">
        {value || "-"}
      </div>
    </div>
  );
}
