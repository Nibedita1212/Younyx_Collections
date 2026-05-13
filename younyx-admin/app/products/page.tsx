"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* image helper */
function resolveImageUrl(url?: string | null) {
  if (!url) return "/Younyx_logo.png"; // fallback
  return url.startsWith("http") ? url : `http://localhost:8080${url}`;
}

type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  mainImageUrl?: string | null;
  categoryName?: string | null;
  active: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/admin/products", { credentials: "include" })
      .then((r) => r.json())
      .then((data) =>
        setProducts(
          data.map((p: any) => ({
            ...p,
            active: Boolean(p.active),
          }))
        )
      );
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link
          href="/products/new"
          className="px-5 py-2 rounded-md bg-gradient-to-b from-[#f1d27a] to-[#d4a017] text-black font-semibold shadow hover:opacity-90"
        >
          + Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 border-b text-sm">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            )}

            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b last:border-0 hover:bg-gray-50 transition"
              >
                {/* Product + Image */}
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={resolveImageUrl(p.mainImageUrl)}
                    alt={p.name}
                    className="w-14 h-14 rounded-lg object-cover border bg-white"
                  />
                  <div>
                    <div className="font-semibold text-black">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      SKU: {p.sku}
                    </div>
                  </div>
                </td>

                <td className="p-3 text-sm">
                  {p.categoryName ?? "-"}
                </td>

                <td className="p-3 text-sm font-medium">
                  ₹{p.price}
                </td>

                <td className="p-3 text-sm">
                  {p.stockQuantity}
                </td>

                {/* Status */}
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      p.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {p.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/products/${p.id}`}
                      className="px-3 py-1 rounded-md border text-sm text-black bg-white hover:bg-gray-100"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1 rounded-md border border-red-500 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
