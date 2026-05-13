"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CART_KEY = "younyx_cart";
const USER_ID_KEY = "younyx_user_id";

function getUserIdFromStorage() {
  try {
    return localStorage.getItem(USER_ID_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}
function getCartStorageKey() {
  const uid = getUserIdFromStorage();
  return uid ? `${CART_KEY}_${uid}` : CART_KEY;
}

export default function CartProceed() {
  const router = useRouter();
  const [hasItems, setHasItems] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function read() {
      try {
        const key = getCartStorageKey();
        const raw = localStorage.getItem(key) ?? localStorage.getItem(CART_KEY) ?? "[]";
        const arr = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
        setHasItems(arr.length > 0);
      } catch {
        setHasItems(false);
      }
    }

    read();

    function onCustom(e: Event) {
      // respond to cart changes from other components
      read();
    }
    function onStorage(e: StorageEvent) {
      const key = getCartStorageKey();
      if (!e.key) return;
      if (e.key === key || e.key === CART_KEY) read();
    }

    window.addEventListener("younyx:cart:changed", onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("younyx:cart:changed", onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  function handleProceed() {
    setLoading(true);
    // navigate
    router.push("/checkout");
  }

  return (
    <div className="mt-6 flex justify-end gap-2">
      <button disabled={!hasItems || loading} onClick={handleProceed} className={`px-6 py-3 rounded font-semibold transition text-black ${!hasItems ? "bg-gray-300 cursor-not-allowed" : "bg-yellow-300 hover:bg-yellow-400"}`}>
        {loading ? "Loading…" : "Proceed to checkout"}
      </button>
    </div>
  );
}
