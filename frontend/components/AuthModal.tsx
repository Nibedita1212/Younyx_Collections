// components/AuthModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import districtsData from "../data/districts.json";

type Props = {
  open: boolean;
  initialTab?: "login" | "signup" | "forgot";
  onClose: () => void;
  onAuthSuccess?: (user?: any) => void;
};

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands",
  "Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi",
  "Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const USER_ID_KEY = "younyx_user_id";
const USER_KEY = "younyx_user";
const ROLE_KEY = "younyx_role";
const CART_KEY = "younyx_cart";
const WISHLIST_KEY = "younyx_wishlist";

/**
 * AuthModal: after successful login/signup we:
 *  - persist user to localStorage
 *  - migrate anonymous cart (younyx_cart) -> user-specific key (younyx_cart_{uid}) if needed
 *  - broadcast cart/auth changes
 */

export default function AuthModal({ open, initialTab = "signup", onClose, onAuthSuccess }: Props) {
  const router = useRouter();

  const [tab, setTab] = useState<"login" | "signup" | "forgot">(initialTab);
  const [loading, setLoading] = useState(false);

  // signup fields
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");

  // address
  const [pincode, setPincode] = useState("");
  const [stateName, setStateName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [cityName, setCityName] = useState("");
  const [flatBuildingArea, setFlatBuildingArea] = useState("");
  const [landmark, setLandmark] = useState("");

  const [identifier, setIdentifier] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const inputCls = "w-full border border-gray-400 px-3 py-2 rounded-md text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]";
  const labelCls = "block text-sm font-medium text-black mb-1";
  const fieldCls = (field?: string) => (field ? `${inputCls} ${errors[field] ? "border-red-600" : ""}` : inputCls);

  // ----------------- helper utilities -----------------
  function persistUserToLocal(userObj: any, role?: string | null) {
    try {
      if (!userObj) return;
      const uid = userObj?.id ?? userObj?.userId ?? (userObj?.customer && userObj.customer.id) ?? null;
      const toStore = userObj;
      try { localStorage.setItem(USER_KEY, JSON.stringify(toStore)); } catch {}
      if (uid) {
        try { localStorage.setItem(USER_ID_KEY, String(uid)); } catch {}
      }
      if (role) {
        try { localStorage.setItem(ROLE_KEY, role); } catch {}
      } else if (userObj?.role) {
        try { localStorage.setItem(ROLE_KEY, userObj.role); } catch {}
      }
    } catch (err) {
      console.warn("persistUserToLocal failed", err);
    }
  }

  // new helper: determine if a stored value is "empty array" or blank
  function isEmptyArrayString(val: string | null | undefined) {
    if (val == null) return true;
    const trimmed = val.trim();
    if (trimmed === "" || trimmed === "null") return true;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length === 0) return true;
    } catch { /* ignore */ }
    return false;
  }

  function migrateAnonCartToUser(uid: string | number) {
    try {
      const anon = localStorage.getItem(CART_KEY);
      const userKey = `${CART_KEY}_${uid}`;
      const existing = localStorage.getItem(userKey);

      // migrate if anon exists AND (userKey missing OR userKey empty array)
      const shouldOverwrite = !existing || isEmptyArrayString(existing);
      if (anon && anon.trim() !== "" && shouldOverwrite) {
        localStorage.setItem(userKey, anon);
        // remove generic anon key so other tabs read the user-key
        try { localStorage.removeItem(CART_KEY); } catch {}
      }
    } catch (e) {
      console.warn("cart migration failed", e);
    }
  }

  function migrateAnonWishlistToUser(uid: string | number) {
    try {
      const anonWL = localStorage.getItem(WISHLIST_KEY);
      const userWL = `${WISHLIST_KEY}_${uid}`;
      const existingWL = localStorage.getItem(userWL);
      const shouldOverwrite = !existingWL || isEmptyArrayString(existingWL);
      if (anonWL && anonWL.trim() !== "" && shouldOverwrite) {
        localStorage.setItem(userWL, anonWL);
        try { localStorage.removeItem(WISHLIST_KEY); } catch {}
      }
    } catch (e) {
      console.warn("wishlist migration failed", e);
    }
  }

  // call after login/signup success with the server response "data"
  function finalizeAuthSuccess(serverData: any) {
    let userObj: any = null;
    if (!serverData) userObj = null;
    else if (serverData.user) userObj = serverData.user;
    else if (serverData.customer) userObj = serverData.customer;
    else if (serverData.admin) userObj = serverData.admin;
    else userObj = serverData;

    persistUserToLocal(userObj, serverData?.role ?? null);

    const uid = userObj?.id ?? userObj?.userId ?? null;
    if (uid) {
      migrateAnonCartToUser(uid);
      migrateAnonWishlistToUser(uid);
    }

    try { window.dispatchEvent(new CustomEvent("younyx:auth:changed")); } catch {}
    try { window.dispatchEvent(new CustomEvent("younyx:cart:changed")); } catch {}
    try { window.dispatchEvent(new CustomEvent("younyx:wishlist:changed")); } catch {}
  }

  // ----------------- signup -----------------
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!gender) newErrors.gender = "Please select gender";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!/^\d{6}$/.test(pincode)) newErrors.pincode = "Enter valid 6-digit pincode";
    if (!stateName) newErrors.stateName = "Please select state";
    if (!districtName) newErrors.districtName = "Please select or enter district";
    if (!cityName.trim()) newErrors.cityName = "City is required";
    if (!flatBuildingArea.trim()) newErrors.flatBuildingArea = "Address is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    const payload = {
      name,
      gender,
      email,
      password,
      phone,
      altPhone,
      address: {
        flatBuildingArea,
        landmark,
        city: cityName,
        district: districtName,
        state: stateName,
        pincode,
        country: "India",
      },
    };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Signup failed");
        setLoading(false);
        return;
      }

      const data = await res.json().catch(() => ({}));
      try {
        let savedUser = null;
        if (data?.id || data?.email || data?.name) savedUser = data;
        else if (data?.user) savedUser = data.user;
        else savedUser = { id: data?.id ?? null, email: data?.email ?? email, name: data?.name ?? name };

        finalizeAuthSuccess(savedUser);
      } catch (e) {
        finalizeAuthSuccess(data);
      }

      alert("Account created successfully");

      if (typeof onAuthSuccess === "function") {
        try { onAuthSuccess(data ?? undefined); } catch {}
      }

      onClose();
    } catch (err) {
      console.error("Signup error:", err);
      alert("Something went wrong while creating account");
    } finally {
      setLoading(false);
    }
  }

  // ----------------- login -----------------
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { email, password };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || `Invalid login credentials (status ${res.status})`);
        setLoading(false);
        return;
      }

      const data = await res.json().catch(() => null);

      let userObj: any = null;
      let role: string | null = null;

      if (!data) userObj = null;
      else if (data.user) { userObj = data.user; role = data.role ?? (data.admin ? "admin" : data.customer ? "customer" : null); }
      else if (data.admin) { userObj = data.admin; role = "admin"; }
      else if (data.customer) { userObj = data.customer; role = "customer"; }
      else if (data.id && (data.email || data.name)) { userObj = { id: data.id, email: data.email, name: data.name, phone: data.phone }; }
      else if (data.token && (data.user == null && data.customer == null && data.admin == null)) {
        try {
          const meRes = await fetch("/api/auth/me", { credentials: "include" });
          if (meRes.ok) {
            const meData = await meRes.json().catch(() => null);
            if (meData) {
              userObj = meData.user ?? { id: meData.id ?? null, email: meData.email, name: meData.name, phone: meData.phone };
              role = meData.role ?? null;
            }
          }
        } catch (xx) {}
      } else {
        userObj = data;
      }

      try {
        if (userObj) {
          persistUserToLocal(userObj, role);
          const uid = userObj?.id ?? userObj?.userId ?? null;
          if (uid) {
            migrateAnonCartToUser(uid);
            migrateAnonWishlistToUser(uid);
          }
        }
      } catch (err) {
        console.warn("Could not persist user to localStorage", err);
      }

      if (typeof onAuthSuccess === "function") {
        try { onAuthSuccess(userObj ? { ...userObj, role } : undefined); } catch {}
      }

      onClose();
      try { window.dispatchEvent(new CustomEvent("younyx:auth:changed")); } catch {}
      try { window.dispatchEvent(new CustomEvent("younyx:cart:changed")); } catch {}
      try { window.dispatchEvent(new CustomEvent("younyx:wishlist:changed")); } catch {}
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong while logging in");
    } finally {
      setLoading(false);
    }
  }

  // ----------------- forgot / OTP -----------------
  async function handleRequestOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setErrors({});
    const newErrors: Record<string, string> = {};
    if (!identifier.trim()) newErrors.identifier = "Email or phone is required";
    else if (identifier.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) {
      newErrors.identifier = "Enter a valid email";
    } else if (!identifier.includes("@")) {
      const digits = identifier.replace(/\D/g, "");
      if (digits.length < 8) newErrors.identifier = "Enter a valid phone number";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setForgotLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setForgotLoading(false);
    onClose();
    router.push(`/auth/verify-otp?identifier=${encodeURIComponent(identifier.trim())}`);
  }

  // ----------------- UI -----------------
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/10">
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-[var(--brand-bg)] flex items-center justify-center overflow-hidden">
                <img src="/Younyx_logo.png" alt="logo" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <div className="text-sm font-semibold text-black">
                  {tab === "signup" ? "Create your account" : tab === "login" ? "Login" : "Forgot password"}
                </div>
                <div className="text-xs text-black/85">
                  {tab === "signup" ? "Sign up to continue" : tab === "login" ? "Sign in to your account" : "Enter email or phone — we'll send an OTP"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex rounded-full bg-[var(--brand-gold)]/10 px-3 py-1 text-xs text-[var(--brand-gold)]">Secure</div>
              <button aria-label="Close" onClick={onClose} className="text-black hover:font-bold rounded p-1">✕</button>
            </div>
          </div>

          <div className="px-6 py-4 max-h-[75vh] overflow-y-auto">
            {tab === "signup" ? (
              <form onSubmit={handleSignup} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Full name</label>
                    <input className={fieldCls("name")} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                    {errors.name && <div className="text-sm text-red-600 mt-1">{errors.name}</div>}
                  </div>
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select className={fieldCls("gender")} value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="">Select gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <div className="text-sm text-red-600 mt-1">{errors.gender}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Email</label>
                    <input className={fieldCls("email")} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
                    {errors.email && <div className="text-sm text-red-600 mt-1">{errors.email}</div>}
                  </div>
                  <div>
                    <label className={labelCls}>Password</label>
                    <input className={fieldCls("password")} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Choose a password" />
                    {errors.password && <div className="text-sm text-red-600 mt-1">{errors.password}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Phone number</label>
                    <input className={fieldCls("phone")} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                    {errors.phone && <div className="text-sm text-red-600 mt-1">{errors.phone}</div>}
                  </div>
                  <div>
                    <label className={labelCls}>Alternate phone (optional)</label>
                    <input className={inputCls} value={altPhone} onChange={(e) => setAltPhone(e.target.value)} placeholder="+91 91234 56780" />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Flat / Building / Area</label>
                  <input className={fieldCls("flatBuildingArea")} value={flatBuildingArea} onChange={(e) => setFlatBuildingArea(e.target.value)} placeholder="Flat no., Building name, Area / Colony" />
                  {errors.flatBuildingArea && <div className="text-sm text-red-600 mt-1">{errors.flatBuildingArea}</div>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>City</label>
                    <input className={fieldCls("cityName")} value={cityName} onChange={(e) => setCityName(e.target.value)} placeholder="City / Division" />
                    {errors.cityName && <div className="text-sm text-red-600 mt-1">{errors.cityName}</div>}
                  </div>
                  <div>
                    <label className={labelCls}>Landmark (optional)</label>
                    <input className={inputCls} value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Nearby landmark" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>State</label>
                    <select className={fieldCls("stateName")} value={stateName} onChange={(e) => { setStateName(e.target.value); setDistrictName(""); }}>
                      <option value="">Select state</option>
                      {STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                    {errors.stateName && <div className="text-sm text-red-600 mt-1">{errors.stateName}</div>}
                  </div>

                  <div>
                    <label className={labelCls}>District</label>
                    {stateName && Array.isArray((districtsData as any)[stateName]) && (districtsData as any)[stateName].length > 0 ? (
                      <select className={fieldCls("districtName")} value={districtName} onChange={(e) => setDistrictName(e.target.value)}>
                        <option value="">Select district</option>
                        {(districtsData as any)[stateName].map((d: string) => (<option key={d} value={d}>{d}</option>))}
                      </select>
                    ) : (
                      <input className={fieldCls("districtName")} value={districtName} onChange={(e) => setDistrictName(e.target.value)} placeholder="Enter district" />
                    )}
                    {errors.districtName && <div className="text-sm text-red-600 mt-1">{errors.districtName}</div>}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Pincode</label>
                  <input className={fieldCls("pincode") + " w-28"} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0,6))} placeholder="6-digit pincode" />
                  {errors.pincode && <div className="text-sm text-red-600 mt-1">{errors.pincode}</div>}
                </div>

                <div>
                  <button type="submit" className="w-full py-2 rounded-md bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)] hover:from-[#b0890e] hover:to-[#c99b10] text-black font-semibold shadow-sm" disabled={loading}>
                    {loading ? "Creating account…" : "Create account"}
                  </button>
                </div>

                <div className="text-center text-sm text-black mt-2">If you already have an account? <button type="button" onClick={() => setTab("login")} className="underline hover:font-bold">Login</button></div>
              </form>
            ) : tab === "login" ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Email</label>
                  <input className={fieldCls("email")} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <input className={fieldCls("password")} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Your password" />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-black"><input type="checkbox" className="h-4 w-4" /><span className="text-sm">Remember me</span></label>
                  <button type="button" onClick={() => setTab("forgot")} className="text-sm text-blue-600 hover:font-bold">Forgot?</button>
                </div>

                <div>
                  <button type="submit" className="w-full py-2 rounded-md bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)] hover:from-[#b0890e] hover:to-[#c99b10] text-black font-semibold shadow-sm transition-all duration-200" disabled={loading}>
                    {loading ? "Signing in…" : "Sign in"}
                  </button>
                </div>

                <div className="text-center text-sm text-black mt-2">Don’t have an account? <button type="button" onClick={() => setTab("signup")} className="underline hover:font-bold">Signup</button></div>
              </form>
            ) : (
              <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Email or phone</label>
                  <input className={fieldCls("identifier")} value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@example.com or +919876543210" />
                  {errors.identifier && <div className="text-sm text-red-600 mt-1">{errors.identifier}</div>}
                </div>
                <div>
                  <button type="submit" className="w-full py-2 rounded-md bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)] hover:from-[#b0890e] hover:to-[#c99b10] text-black font-semibold shadow-sm" disabled={forgotLoading}>
                    {forgotLoading ? "Sending…" : "Send OTP"}
                  </button>
                </div>
                <div className="text-center text-sm text-black mt-2">Remembered your password? <button type="button" onClick={() => setTab("login")} className="underline hover:font-bold">Back to Login</button></div>
              </form>
            )}
          </div>

          <div className="px-6 py-3 border-t bg-white/60 flex items-center justify-between">
            <div className="text-xs text-gray-600">We respect your privacy — your data is secure.</div>
            <div><button onClick={onClose} className="text-sm text-black hover:font-bold">Close</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}
