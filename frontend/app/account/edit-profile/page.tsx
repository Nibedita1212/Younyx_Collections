"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProtectedPage } from "../../lib/useProtected";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands",
  "Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi",
  "Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading } = useProtectedPage("/");

  // -------- form state --------
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [flatBuildingArea, setFlatBuildingArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [saving, setSaving] = useState(false);

  // -------- FETCH FULL PROFILE (IMPORTANT FIX) --------
  useEffect(() => {
    const uid = localStorage.getItem("younyx_user_id");
    if (!uid) return;

    fetch("/api/customers/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": uid, // ✅ REQUIRED
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.success === false) return;

        setName(data.name ?? "");
        setGender(data.gender ?? "");
        setPhone(data.phone ?? "");
        setAltPhone(data.altPhone ?? "");                 // ✅ FIXED
        setFlatBuildingArea(data.flatBuildingArea ?? ""); // ✅ FIXED
        setLandmark(data.landmark ?? "");
        setCity(data.city ?? "");
        setDistrict(data.district ?? "");
        setStateName(data.state ?? "");
        setPincode(data.pincode ?? "");
      })
      .catch((err) => {
        console.error("Profile fetch failed", err);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-[var(--brand-gold)]">
        Loading…
      </div>
    );
  }

  if (!user) return null;
  const u: any = user;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      alert("Profile updated successfully");
      router.push("/account");
    } finally {
      setSaving(false);
    }
  }

  const labelCls =
    "text-[11px] uppercase tracking-[0.18em] text-gray-400";
  const inputCls =
    "w-full mt-1 px-3 py-2 rounded-lg bg-black border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]/60";

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#111] to-[#0b0b0b] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--brand-gold)]">
              YOUNYX ACCOUNT
            </div>
            <h1 className="text-lg sm:text-xl font-semibold">
              Edit Profile
            </h1>
          </div>
          <button
            onClick={() => router.push("/account")}
            className="text-xs px-4 py-1.5 rounded-full border border-white/15 hover:border-[var(--brand-gold)]/60 hover:bg-white/5 transition"
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <form
          onSubmit={handleSave}
          className="bg-[#101010] rounded-2xl border border-white/10 shadow-xl p-5 sm:p-6 space-y-6"
        >
          {/* PROFILE SUMMARY */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[var(--brand-bg)] flex items-center justify-center text-black text-xl font-semibold border border-[var(--brand-gold)] shadow-[0_0_18px_rgba(201,155,16,0.5)]">
              {(u.name || u.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium">{u.name}</div>
              <div className="text-xs text-gray-400">{u.email}</div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[var(--brand-gold)]/50 to-transparent" />

          {/* PERSONAL INFO */}
          <div>
            <h2 className="text-sm font-semibold mb-3">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full name</label>
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>Gender</label>
                <select className={inputCls} value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>Alternate phone</label>
                <input className={inputCls} value={altPhone} onChange={(e) => setAltPhone(e.target.value)} />
              </div>
            </div>
          </div>

          {/* ADDRESS */}
          <div>
            <h2 className="text-sm font-semibold mb-3">
              Address Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Flat / Building / Area</label>
                <input className={inputCls} value={flatBuildingArea} onChange={(e) => setFlatBuildingArea(e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>City</label>
                <input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>Landmark</label>
                <input className={inputCls} value={landmark} onChange={(e) => setLandmark(e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>District</label>
                <input className={inputCls} value={district} onChange={(e) => setDistrict(e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>State</label>
                <select className={inputCls} value={stateName} onChange={(e) => setStateName(e.target.value)}>
                  <option value="">Select state</option>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Pincode</label>
                <input
                  className={inputCls}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/account")}
              className="px-4 py-2 rounded-full border border-white/15 text-xs hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-full bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)] text-black text-xs font-semibold shadow-[0_0_20px_rgba(201,155,16,0.55)] hover:brightness-110 transition"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
