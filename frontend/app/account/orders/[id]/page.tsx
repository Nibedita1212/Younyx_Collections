"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type OrderDetails = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  totalAmount: number;
  status: OrderStatus;
  paid: boolean;

  shippingPartner?: string | null;
  trackingNumber?: string | null;

  returnRequested?: boolean;
  replacementRequested?: boolean;

  refundStatus?: "NONE" | "PENDING" | "REFUNDED";
};

type Note = {
  id: number;
  note: string;
  createdAt: string;
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const [shippingPartner, setShippingPartner] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [refundStatus, setRefundStatus] =
    useState<"NONE" | "PENDING" | "REFUNDED">("NONE");
  const [newNote, setNewNote] = useState("");

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          credentials: "include",
        });
        const data = await res.json();
        setOrder(data);
        setShippingPartner(data.shippingPartner || "");
        setTrackingNumber(data.trackingNumber || "");
        setRefundStatus(data.refundStatus || "NONE");

        const notesRes = await fetch(
          `/api/admin/orders/${orderId}/notes`,
          { credentials: "include" }
        );
        if (notesRes.ok) setNotes(await notesRes.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-gray-500">
        Loading order details…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center text-sm text-gray-500">
        Order not found
      </div>
    );
  }

  /* ---------------- ACTIONS ---------------- */

  async function saveShipping() {
    await fetch(`/api/admin/orders/${orderId}/shipping`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ shippingPartner, trackingNumber }),
    });
    alert("Shipping updated");
  }

  async function saveRefund() {
    await fetch(`/api/admin/orders/${orderId}/refund`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ refundStatus }),
    });
    alert("Refund updated");
  }

  async function approveReturn() {
    await fetch(`/api/admin/orders/${orderId}/return/approve`, {
      method: "PUT",
      credentials: "include",
    });
    alert("Return approved");
  }

  async function approveReplacement() {
    await fetch(`/api/admin/orders/${orderId}/replacement/approve`, {
      method: "PUT",
      credentials: "include",
    });
    alert("Replacement approved");
  }

  async function addNote() {
    if (!newNote.trim()) return;
    const res = await fetch(`/api/admin/orders/${orderId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ note: newNote }),
    });
    const saved = await res.json();
    setNotes((p) => [saved, ...p]);
    setNewNote("");
  }

  function downloadInvoice() {
    window.open(`/api/admin/orders/${orderId}/invoice`, "_blank");
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="text-2xl font-bold text-black">
          Order #{order.orderNumber}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {order.customerName} • ₹{order.totalAmount.toFixed(2)}
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHIPPING */}
        <section className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Shipping</h3>

          <label className="text-xs text-gray-500">Shipping Partner</label>
          <select
            className="border rounded px-3 py-2 w-full mb-3"
            value={shippingPartner}
            onChange={(e) => setShippingPartner(e.target.value)}
          >
            <option value="">Select partner</option>
            <option value="Shiprocket">Shiprocket</option>
            <option value="Delhivery">Delhivery</option>
            <option value="BlueDart">BlueDart</option>
          </select>

          <label className="text-xs text-gray-500">Tracking Number</label>
          <input
            className="border rounded px-3 py-2 w-full mb-4"
            placeholder="Enter tracking ID"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />

          <button
            onClick={saveShipping}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
          >
            Save Shipping
          </button>
        </section>

        {/* INVOICE */}
        <section className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Invoice</h3>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadInvoice}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
            >
              Generate Invoice PDF
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
            >
              Print Invoice
            </button>
          </div>
        </section>

        {/* RETURN / REPLACEMENT */}
        {(order.returnRequested || order.replacementRequested) && (
          <section className="bg-white border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Return / Replacement</h3>

            <div className="flex gap-3 flex-wrap">
              {order.returnRequested && (
                <button
                  onClick={approveReturn}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
                >
                  Approve Return
                </button>
              )}
              {order.replacementRequested && (
                <button
                  onClick={approveReplacement}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
                >
                  Approve Replacement
                </button>
              )}
            </div>
          </section>
        )}

        {/* REFUND */}
        <section className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Refund</h3>

          <select
            className="border rounded px-3 py-2 w-full mb-3"
            value={refundStatus}
            onChange={(e) =>
              setRefundStatus(e.target.value as any)
            }
          >
            <option value="NONE">No refund</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <button
            onClick={saveRefund}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
          >
            Save Refund
          </button>
        </section>
      </div>

      {/* NOTES */}
      <section className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold mb-4">Internal Notes</h3>

        <textarea
          className="border rounded px-3 py-2 w-full mb-3"
          rows={3}
          placeholder="Write internal note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />

        <button
          onClick={addNote}
          className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
        >
          Add Note
        </button>

        <div className="mt-4 space-y-2">
          {notes.map((n) => (
            <div
              key={n.id}
              className="text-sm bg-gray-50 border rounded-md p-3"
            >
              {n.note}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
