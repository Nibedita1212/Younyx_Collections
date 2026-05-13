"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserDashboard() {
  const router = useRouter();
  const [user] = useState({
    name: "User Name",
    email: "user@example.com",
    phone: "+91 9876543210",
  });

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden ring-1 ring-black/10">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div>
            <h2 className="text-xl font-bold text-black">Welcome, {user.name}</h2>
            <p className="text-sm text-gray-600">Manage your account & orders</p>
          </div>
          <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            <img
              src="/mnt/data/96dc5f69-0184-4e19-9417-c4fe528d47c7.png"
              alt="profile"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Profile Info */}
          <div className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-black mb-2">Profile</h3>
            <p className="text-sm text-gray-700"><strong>Name:</strong> {user.name}</p>
            <p className="text-sm text-gray-700"><strong>Email:</strong> {user.email}</p>
            <p className="text-sm text-gray-700"><strong>Phone:</strong> {user.phone}</p>

            <button
              className="mt-3 w-full py-2 rounded-md bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)]
                         hover:from-[#b0890e] hover:to-[#c99b10] text-black font-semibold shadow-sm"
            >
              Edit Profile
            </button>
          </div>

          {/* Orders */}
          <div className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-black mb-3">Your Orders</h3>
            <p className="text-sm text-gray-600">Check your order history and delivery updates.</p>

            <button
              className="mt-3 w-full py-2 rounded-md bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)]
                         hover:from-[#b0890e] hover:to-[#c99b10] text-black font-semibold shadow-sm"
            >
              View Orders
            </button>
          </div>

          {/* Address */}
          <div className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-black mb-3">Saved Addresses</h3>
            <p className="text-sm text-gray-600">
              Manage your delivery locations for faster checkout.
            </p>

            <button
              className="mt-3 w-full py-2 rounded-md bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)]
                         hover:from-[#b0890e] hover:to-[#c99b10] text-black font-semibold shadow-sm"
            >
              Manage Addresses
            </button>
          </div>

          {/* Logout */}
          <div className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <h3 className="text-lg font-semibold text-black mb-3">Logout</h3>
            <p className="text-sm text-gray-600">You can log out from your account securely.</p>

            <button
              onClick={() => {
                // clear session later when backend ready
                router.push("/");
              }}
              className="mt-3 w-full py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
