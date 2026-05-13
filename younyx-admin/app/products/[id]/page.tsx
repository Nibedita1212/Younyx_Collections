"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

type Collection = {
  id: number;
  name: string;
};

type ImageSlot = {
  existingUrl: string | null;
  file: File | null;
  remove: boolean;
};

function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  return url.startsWith("http") ? url : `http://localhost:8080${url}`;
}

function generateSKU() {
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `YOUNYX-${rand}`;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number((params as any)?.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  // ---------- form states ----------
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [active, setActive] = useState<boolean>(false);

  // ---------- image states ----------
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([
    { existingUrl: null, file: null, remove: false },
    { existingUrl: null, file: null, remove: false },
    { existingUrl: null, file: null, remove: false },
    { existingUrl: null, file: null, remove: false },
  ]);

  // ---------- LOAD DATA ----------
  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, cRes, colRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`, { credentials: "include" }),
          fetch("/api/admin/categories", { credentials: "include" }),
          fetch("/api/admin/collections", { credentials: "include" }),
        ]);

        const p = await pRes.json();
        const c = await cRes.json();
        const col = await colRes.json();

        setName(p.name);
        setSku(p.sku || generateSKU());
        setPrice(String(p.price));
        setStock(String(p.stockQuantity ?? 0));
        setDescription(p.description ?? "");
        setCategoryId(String(p.categoryId));
        setCollectionId(String(p.collectionId ?? ""));
        setActive(Boolean(p.active));
        setCategories(c);
        setCollections(col);

        setImageSlots([
          { existingUrl: resolveImageUrl(p.mainImageUrl), file: null, remove: false },
          { existingUrl: resolveImageUrl(p.image2Url), file: null, remove: false },
          { existingUrl: resolveImageUrl(p.image3Url), file: null, remove: false },
          { existingUrl: resolveImageUrl(p.image4Url), file: null, remove: false },
        ]);
      } catch {
        alert("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // ---------- image handlers ----------
  function handleFileChange(i: number, file: File | null) {
    setImageSlots((prev) =>
      prev.map((s, idx) =>
        idx === i ? { ...s, file, remove: false } : s
      )
    );
  }

  function toggleRemove(i: number) {
    setImageSlots((prev) =>
      prev.map((s, idx) =>
        idx === i ? { ...s, remove: !s.remove, file: null } : s
      )
    );
  }

  // ---------- SAVE ----------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    const fd = new FormData();
    fd.append("name", name);
    fd.append("sku", sku);
    fd.append("price", price);
    fd.append("stock", stock);
    fd.append("description", description);
    fd.append("categoryId", categoryId);
    fd.append("collectionId", collectionId);
    fd.append("active", String(active));

    imageSlots.forEach((slot, i) => {
      const n = i + 1;
      if (slot.file instanceof File) {
        fd.append(`image${n}`, slot.file);
      }
      if (slot.remove === true) {
        fd.append(`deleteImage${n}`, "true");
      }
    });

    setSaving(true);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      credentials: "include",
      body: fd,
    });
    setSaving(false);

    if (!res.ok) {
      alert("Update failed");
      return;
    }

    alert("Product updated successfully");
    router.push("/products");
  }

  if (loading) {
    return <div className="p-10 text-sm text-gray-500">Loading product…</div>;
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-2xl shadow-sm p-8 space-y-8"
      >
        {/* ================= PRODUCT INFO ================= */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Product Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input className="w-full border rounded-lg px-4 py-2"
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <div className="flex gap-2">
                <input
                  className="w-full border rounded-lg px-4 py-2"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setSku(generateSKU())}
                  className="px-4 rounded-lg border hover:bg-gray-100 transition text-sm"
                >
                  Regenerate
                </button>
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input type="number" className="w-full border rounded-lg px-4 py-2"
                value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input type="number" className="w-full border rounded-lg px-4 py-2"
                value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ================= CLASSIFICATION ================= */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Classification</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full border rounded-lg px-4 py-2"
                value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Collection</label>
              <select className="w-full border rounded-lg px-4 py-2"
                value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
                <option value="">Select collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="w-full border rounded-lg px-4 py-2"
                value={active ? "ACTIVE" : "INACTIVE"}
                onChange={(e) => setActive(e.target.value === "ACTIVE")}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= DESCRIPTION ================= */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Description</h2>
          <textarea rows={5}
            className="w-full border rounded-lg px-4 py-3"
            value={description}
            onChange={(e) => setDescription(e.target.value)} />
        </div>

        {/* ================= IMAGES ================= */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Product Images</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {imageSlots.map((slot, i) => (
              <div key={i} className="border rounded-xl p-4 text-sm bg-white shadow-sm">
                <div className="mb-2 font-medium">
                  {i === 0 ? "Main Image" : `Image ${i + 1}`}
                </div>

                {slot.existingUrl && !slot.remove && !slot.file && (
                  <img src={slot.existingUrl}
                    className="w-full h-32 object-cover rounded-lg mb-3 border" />
                )}

                {slot.file && (
                  <img src={URL.createObjectURL(slot.file)}
                    className="w-full h-32 object-cover rounded-lg mb-3 border" />
                )}

                {!slot.existingUrl && !slot.file && (
                  <div className="h-32 flex items-center justify-center text-gray-400 border rounded-lg mb-3 bg-gray-50">
                    No image
                  </div>
                )}

                <input type="file" id={`image-${i}`} className="hidden"
                  onChange={(e) => handleFileChange(i, e.target.files?.[0] || null)} />

                <label htmlFor={`image-${i}`}
                  className="block text-center cursor-pointer border border-[var(--brand-gold)]
                  text-black text-xs font-medium rounded-lg py-2 mb-2 hover:bg-[var(--brand-gold)] transition">
                  Choose Image
                </label>

                <label className="flex items-center gap-2 text-red-600 text-xs">
                  <input type="checkbox"
                    checked={slot.remove}
                    onChange={() => toggleRemove(i)} />
                  Remove image
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex justify-end gap-4 pt-6">
          {/* Cancel */}
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="
      px-6 py-2.5 rounded-lg border border-gray-300
      text-gray-700 font-medium
      bg-white
      hover:bg-gray-100 hover:border-gray-400
      transition-all duration-200 ease-in-out
    "
          >
            Cancel
          </button>

          {/* Save */}
          <button
            type="submit"
            disabled={saving}
            className="
      px-7 py-2.5 rounded-lg
      font-semibold text-black
      bg-[var(--brand-gold)]
      shadow-md
      hover:shadow-lg hover:brightness-110
      active:scale-[0.98]
      transition-all duration-200 ease-in-out
      disabled:opacity-60 disabled:cursor-not-allowed
    "
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}
