"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type OrderFromApi = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  itemsCount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: string | null;
  paid: boolean;
  createdAt: string; // ISO
};

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  itemsCount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: string | null;
  paid: boolean;
  createdAt: Date;
};

function formatDate(d: Date) {
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(amount: number) {
  if (Number.isNaN(amount)) return "₹0.00";
  return `₹${amount.toFixed(2)}`;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  let label = status.toLowerCase().replace("_", " ");
  label = label.charAt(0).toUpperCase() + label.slice(1);

  let bg = "bg-gray-100";
  let text = "text-gray-700";
  let border = "border-gray-200";

  if (status === "PENDING") {
    bg = "bg-amber-50";
    text = "text-amber-700";
    border = "border-amber-200";
  } else if (status === "PROCESSING") {
    bg = "bg-blue-50";
    text = "text-blue-700";
    border = "border-blue-200";
  } else if (status === "PAID") {
    bg = "bg-emerald-50";
    text = "text-emerald-700";
    border = "border-emerald-200";
  } else if (status === "SHIPPED") {
    bg = "bg-indigo-50";
    text = "text-indigo-700";
    border = "border-indigo-200";
  } else if (status === "DELIVERED") {
    bg = "bg-green-50";
    text = "text-green-700";
    border = "border-green-200";
  } else if (status === "CANCELLED") {
    bg = "bg-red-50";
    text = "text-red-700";
    border = "border-red-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${bg} ${text} ${border}`}
    >
      {label}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      // 🔹 new admin app → relative URL + /api/admin prefix
      const res = await fetch("/api/admin/orders", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Failed to load orders (${res.status})`);
      }
      const data: OrderFromApi[] = await res.json();

      const mapped: Order[] = data.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail ?? null,
        customerPhone: o.customerPhone ?? null,
        itemsCount: o.itemsCount ?? 0,
        totalAmount: Number(o.totalAmount ?? 0),
        status: o.status ?? "PENDING",
        paymentMethod: o.paymentMethod ?? null,
        paid: !!o.paid,
        createdAt: new Date(o.createdAt),
      }));

      setOrders(mapped);
      setFiltered(mapped);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  // search + filter
  useEffect(() => {
    let list = [...orders];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          (o.customerEmail && o.customerEmail.toLowerCase().includes(q))
      );
    }

    if (statusFilter) {
      list = list.filter((o) => o.status === statusFilter);
    }

    setFiltered(list);
  }, [orders, search, statusFilter]);

  async function changeStatus(id: number, status: OrderStatus) {
    try {
      const res = await fetch(
        `/api/admin/orders/${id}/status?status=${status}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      if (!res.ok) {
        console.error(await res.text());
        alert("Failed to update status");
        return;
      }
      const updated: OrderFromApi = await res.json();
      const mapped: Order = {
        id: updated.id,
        orderNumber: updated.orderNumber,
        customerName: updated.customerName,
        customerEmail: updated.customerEmail ?? null,
        customerPhone: updated.customerPhone ?? null,
        itemsCount: updated.itemsCount ?? 0,
        totalAmount: Number(updated.totalAmount ?? 0),
        status: updated.status ?? "PENDING",
        paymentMethod: updated.paymentMethod ?? null,
        paid: !!updated.paid,
        createdAt: new Date(updated.createdAt),
      };

      setOrders((prev) => prev.map((o) => (o.id === id ? mapped : o)));
    } catch (err) {
      console.error(err);
      alert("Status update failed");
    }
  }

  return (
    <div>
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black">Orders</h2>
          <p className="text-sm text-black/80 mt-1">
            View and manage customer orders
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, name, email..."
            className="border px-3 py-2 rounded text-black min-w-[220px]"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value === "" ? "" : (e.target.value as OrderStatus)
              )
            }
            className="border px-3 py-2 rounded bg-white text-black"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="PAID">Paid</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            type="button"
            onClick={fetchOrders}
            className="px-4 py-2 rounded-md bg-white border text-sm text-black hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-black text-sm">
          Loading orders…
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-x-auto border">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50 border-b text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-6 text-center text-sm text-gray-500"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="p-3 text-sm text-black">
                      <div className="font-semibold">#{o.orderNumber}</div>
                      <div className="text-xs text-gray-500">ID: {o.id}</div>
                    </td>

                    <td className="p-3 text-sm text-black">
                      <div>{o.customerName}</div>
                      {o.customerEmail && (
                        <div className="text-xs text-gray-500">
                          {o.customerEmail}
                        </div>
                      )}
                      {o.customerPhone && (
                        <div className="text-xs text-gray-500">
                          {o.customerPhone}
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-sm text-black">
                      {o.itemsCount} item{o.itemsCount === 1 ? "" : "s"}
                    </td>

                    <td className="p-3 text-sm text-black">
                      {formatMoney(o.totalAmount)}
                    </td>

                    <td className="p-3 text-sm">
                      <StatusBadge status={o.status} />
                    </td>

                    <td className="p-3 text-xs text-black">
                      <div className="font-medium">
                        {o.paid ? "Paid" : "Unpaid"}
                      </div>
                      {o.paymentMethod && (
                        <div className="text-gray-500">
                          {o.paymentMethod}
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-xs text-black">
                      {formatDate(o.createdAt)}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/orders/${o.id}`}
                          className="px-3 py-1 rounded border bg-white text-xs text-black hover:bg-gray-50"
                        >
                          View
                        </Link>

                        {/* quick status actions */}
                        {o.status !== "CANCELLED" &&
                          o.status !== "DELIVERED" && (
                            <select
                              className="border px-2 py-1 rounded text-xs bg-white text-black"
                              value={o.status}
                              onChange={(e) =>
                                changeStatus(
                                  o.id,
                                  e.target.value as OrderStatus
                                )
                              }
                            >
                              <option value={o.status}>
                                Change status…
                              </option>
                              <option value="PENDING">Pending</option>
                              <option value="PROCESSING">Processing</option>
                              <option value="PAID">Paid</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
