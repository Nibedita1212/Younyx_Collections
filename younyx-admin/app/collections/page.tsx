"use client";

import React, { useEffect, useState } from "react";

/* ================= API BASE ================= */
const RAW_API =
  typeof process !== "undefined" && process.env
    ? process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080/api"
    : "http://localhost:8080/api";

const API_BASE = String(RAW_API)
  .replace(/\/api\/?$/i, "")
  .replace(/\/$/, "");

/* ================= IMAGE RESOLVER ================= */
function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

/* ================= TYPES ================= */
type Collection = {
  id: number | string;
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  status?: string | null;
};

/* ================= PAGE ================= */
export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [imageFile, setImageFile] = useState<File | null>(null);

  /* ================= LOAD ================= */
  async function loadCollections() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/collections`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load collections");
      const data = await res.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load collections");
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCollections();
  }, []);

  /* ================= OPEN ================= */
  function openCreate() {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setStatus("ACTIVE");
    setImageFile(null);
    setOpenForm(true);
  }

  function openEdit(c: Collection) {
    setEditing(c);
    setName(c.name);
    setSlug(c.slug || "");
    setDescription(c.description || "");
    setStatus(c.status || "ACTIVE");
    setImageFile(null);
    setOpenForm(true);
  }

  /* ================= SAVE ================= */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const finalSlug =
      slug || name.toLowerCase().trim().replace(/\s+/g, "-");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", finalSlug);
    formData.append("description", description);
    formData.append("status", status);
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(
        editing
          ? `${API_BASE}/api/admin/collections/${editing.id}`
          : `${API_BASE}/api/admin/collections`,
        {
          method: editing ? "PUT" : "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Save failed");

      setOpenForm(false);
      loadCollections();
    } catch (e: any) {
      alert(e?.message || "Error saving collection");
    }
  }

  /* ================= DELETE ================= */
  async function handleDelete(id: number | string) {
    if (!confirm("Delete this collection?")) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/collections/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Delete failed");
      setCollections((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      alert(e?.message || "Error deleting collection");
    }
  }

  /* ================= UI ================= */
  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Collections</h2>
        <button
          onClick={openCreate}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-[#c99b10] to-[var(--brand-gold)] text-black font-semibold shadow"
        >
          + Add Collection
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-white border rounded-xl p-6 text-center text-gray-500">
          No collections created yet.
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {collections.map((c) => {
                const img = resolveImageUrl(c.imageUrl);

                return (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    {/* IMAGE */}
                    <td className="px-4 py-3">
                      {img ? (
                        <img
                          src={img}
                          alt={c.name}
                          className="w-14 h-14 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-14 h-14 flex items-center justify-center text-xs text-gray-400 border rounded-lg">
                          No image
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500">{c.slug}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          c.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="px-3 py-1.5 text-xs rounded border hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="px-3 py-1.5 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold mb-5">
              {editing ? "Edit Collection" : "Create Collection"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <input
                placeholder="Collection name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-xl"
              />

              <input
                placeholder="Slug (auto-generated if empty)"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "")
                  )
                }
                className="w-full px-4 py-2 border rounded-xl text-sm"
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-xl"
              />

              {/* IMAGE */}
              <div>
                <label className="text-xs text-gray-500">
                  Collection Image
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    id="collection-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setImageFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                  <label
                    htmlFor="collection-image"
                    className="cursor-pointer px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 text-sm font-medium"
                  >
                    Choose Image
                  </label>
                  <span className="text-sm text-gray-500 truncate">
                    {imageFile ? imageFile.name : "No file selected"}
                  </span>
                </div>
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setOpenForm(false)}
                  className="px-5 py-2 rounded-lg border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-black text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
