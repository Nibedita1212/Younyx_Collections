"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

/* ✅ NEW */
type Collection = {
  id: number;
  name: string;
};

type ImageSlot = {
  file: File | null;
};

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]); // ✅ NEW
  const [saving, setSaving] = useState(false);

  // ---------- form states ----------
  const [name, setName] = useState("");
  const [sku, setSku] = useState(() => generateSKU());
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [collectionId, setCollectionId] = useState(""); // ✅ NEW
  const [active, setActive] = useState<boolean>(true);

  // ---------- image states ----------
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([
    { file: null },
    { file: null },
    { file: null },
    { file: null },
  ]);

  // ---------- LOAD CATEGORIES + COLLECTIONS ----------
  useEffect(() => {
    fetch("/api/admin/categories", { credentials: "include" })
      .then((r) => r.json())
      .then(setCategories);

    /* ✅ NEW */
    fetch("/api/admin/collections", { credentials: "include" })
      .then((r) => r.json())
      .then(setCollections);
  }, []);

  function handleFileChange(i: number, file: File | null) {
    setImageSlots((prev) =>
      prev.map((s, idx) => (idx === i ? { file } : s))
    );
  }
  function generateSKU() {
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `YOUNYX-${rand}`;
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
    fd.append("collectionId", collectionId); // ✅ NEW
    fd.append("active", String(active));

    imageSlots.forEach((slot, i) => {
      if (slot.file instanceof File) {
        fd.append(`image${i + 1}`, slot.file);
      }
    });

    setSaving(true);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    setSaving(false);

    if (!res.ok) {
      alert("Create failed");
      return;
    }

    alert("Product created successfully");
    router.push("/products");
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Add Product</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-2xl shadow-sm p-8 space-y-8"
      >
        {/* ================= PRODUCT INFO ================= */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Product Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name
              </label>
              <input
                className="w-full border rounded-lg px-4 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  className="border rounded-lg px-4 py-2"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setSku(generateSKU())}
                  className="
        px-4 rounded-lg border
        text-sm font-medium
        hover:bg-gray-100
        transition
      "
                >
                  Regenerate
                </button>
              </div>
            </div>



            <div>
              <label className="block text-sm font-medium mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                className="w-full border rounded-lg px-4 py-2"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                className="w-full border rounded-lg px-4 py-2"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ================= CATEGORY / STATUS / COLLECTION ================= */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Classification</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* CATEGORY */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Category
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ COLLECTION */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Collection
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
              >
                <option value="">Select collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* STATUS */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full border rounded-lg px-4 py-2"
                value={active ? "ACTIVE" : "INACTIVE"}
                onChange={(e) => setActive(e.target.value === "ACTIVE")}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= DESCRIPTION ================= */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Description</h2>
          <textarea
            rows={5}
            className="w-full border rounded-lg px-4 py-3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* ================= IMAGES ================= */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Product Images</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {imageSlots.map((slot, i) => (
              <div
                key={i}
                className="border rounded-xl p-4 text-sm bg-white shadow-sm"
              >
                <div className="mb-2 font-medium">
                  {i === 0 ? "Main Image" : `Image ${i + 1}`}
                </div>

                {slot.file ? (
                  <img
                    src={URL.createObjectURL(slot.file)}
                    className="w-full h-32 object-cover rounded-lg mb-3 border"
                  />
                ) : (
                  <div className="h-32 flex items-center justify-center text-gray-400 border rounded-lg mb-3 bg-gray-50">
                    No image
                  </div>
                )}

                <input
                  type="file"
                  id={`image-${i}`}
                  className="hidden"
                  onChange={(e) =>
                    handleFileChange(i, e.target.files?.[0] || null)
                  }
                />

                <label
                  htmlFor={`image-${i}`}
                  className="block text-center cursor-pointer border border-[var(--brand-gold)] text-black text-xs font-medium rounded-lg py-2 hover:bg-[var(--brand-gold)] transition"
                >
                  Choose Image
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="px-5 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-[var(--brand-gold)] font-semibold"
          >
            {saving ? "Saving…" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
