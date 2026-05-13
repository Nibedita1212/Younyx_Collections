"use client";

import React, { useEffect, useState } from "react";

/* ---------- helpers ---------- */
function resolveImageUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `http://localhost:8080${url}`;
}

/* ---------- types ---------- */
type Category = {
  id: number;
  name: string;
  slug: string;
  products?: number;
  imageUrl?: string | null;
};

type CategoryFromApi = {
  id: number;
  name: string;
  slug: string;
  products?: number;
  productCount?: number;
  imageUrl?: string | null;
  image?: string | null;
};

type CategoryPayload = {
  id?: number;
  name: string;
  slug: string;
  file?: File;
};

/* ---------- Modal for create/edit ---------- */
function CategoryModal({
  open,
  initial,
  onClose,
  onSave,
  saving,
}: {
  open: boolean;
  initial?: Partial<Category>;
  onClose: () => void;
  onSave: (payload: CategoryPayload) => Promise<void>;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [file, setFile] = useState<File | undefined>(undefined);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setName(initial?.name ?? "");
    setSlug(initial?.slug ?? "");
    setFile(undefined);
    setPreview(initial?.imageUrl ? resolveImageUrl(initial.imageUrl) : null);
  }, [initial, open]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim() || !slug.trim()) {
      alert("Please fill name and slug");
      return;
    }
    await onSave({
      id: initial?.id,
      name: name.trim(),
      slug: slug.trim(),
      file,
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-black mb-4">
          {initial?.id ? "Edit" : "Add"} Category
        </h3>

        <label className="block text-black mb-1 text-sm">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg mb-3 text-black focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)] focus:border-[var(--brand-gold)]"
        />

        <label className="block text-black mb-1 text-sm">Slug</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg mb-3 text-black focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)] focus:border-[var(--brand-gold)]"
          placeholder="example: earrings, necklace-sets"
        />

        <label className="block text-black mb-2 text-sm">Category Image</label>

        {/* Pretty upload control */}
        <div className="border border-dashed border-gray-300 rounded-xl p-4 mb-3 bg-gray-50/50">
          <input
            id="cat-file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setFile(f || undefined);
              if (f) {
                setPreview(URL.createObjectURL(f));
              } else if (initial?.imageUrl) {
                setPreview(resolveImageUrl(initial.imageUrl));
              } else {
                setPreview(null);
              }
            }}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-600">
                Upload a clear image for this category.
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                JPG, PNG, WEBP — recommended 800×600 or higher.
              </p>
            </div>

            <label
              htmlFor="cat-file-input"
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)] text-black text-sm font-semibold cursor-pointer shadow hover:shadow-md transition-shadow"
            >
              {file ? "Change Image" : "Upload Image"}
            </label>
          </div>

          {file && (
            <p className="mt-2 text-xs text-gray-700 truncate">
              Selected: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>

        {/* Live preview */}
        {preview && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">Preview</div>
            <div className="w-full h-32 rounded-xl overflow-hidden border bg-gray-100">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 mb-4">
          If you don&apos;t choose a new image while editing, the existing image
          will be kept.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-black hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)] text-black font-semibold shadow hover:shadow-md disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Card ---------- */
function CategoryCard({
  c,
  onEdit,
  onDelete,
}: {
  c: Category;
  onEdit: (c: Category) => void;
  onDelete: (id: number) => void;
}) {
  const fullUrl = resolveImageUrl(c.imageUrl);
  const hasImage = !!fullUrl;

  return (
    <div className="bg-white border rounded-xl shadow p-4 flex flex-col">
      <div className="w-full h-36 rounded-md overflow-hidden mb-3 bg-gray-50 flex items-center justify-center">
        {hasImage ? (
          <img
            src={fullUrl!}
            alt={c.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-gray-500">No image</span>
        )}
      </div>

      <div className="flex-1">
        <div className="text-lg font-semibold text-black">{c.name}</div>
        <div className="text-sm text-black/80 mt-1">/{c.slug}</div>
        <div className="text-sm text-black mt-3">
          {c.products ?? 0} products
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => onEdit(c)}
          className="px-3 py-1 rounded border bg-white text-black text-sm hover:bg-gray-50"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(c.id)}
          className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch categories from backend
  async function fetchCategories(p = page, q = search) {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        page: String(p),
        pageSize: String(pageSize),
      });
      if (q) qs.set("search", q);

      const res = await fetch(`/api/admin/categories?${qs.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const body = await res.json();

      const raw: CategoryFromApi[] = body.data ?? body;
      const normalised: Category[] = raw.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        products: c.products ?? c.productCount ?? 0,
        imageUrl: c.imageUrl ?? c.image ?? null,
      }));

      setCategories(normalised);
      setTotal(body.total ?? normalised.length);
      setPage(body.page ?? p);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories(1, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    await fetchCategories(1, search);
  }

  // CREATE
  async function createCategory(payload: CategoryPayload) {
    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", payload.name);
      form.append("slug", payload.slug);
      if (payload.file) form.append("image", payload.file); // <-- IMPORTANT

      const res = await fetch(`/api/admin/categories`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) throw new Error("Create failed");

      const created = await res.json();
      const newCat: Category = {
        id: created.id,
        name: created.name,
        slug: created.slug,
        products: created.products ?? created.productCount ?? 0,
        imageUrl: created.imageUrl ?? created.image ?? null,
      };

      setCategories((prev) => [newCat, ...prev]);
      setTotal((t) => t + 1);
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert("Create failed");
    } finally {
      setSaving(false);
    }
  }

  // UPDATE
  async function updateCategory(payload: CategoryPayload) {
    if (!payload.id) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", payload.name);
      form.append("slug", payload.slug);
      if (payload.file) form.append("image", payload.file); // <-- IMPORTANT

      const res = await fetch(`/api/admin/categories/${payload.id}`, {
        method: "PUT",
        credentials: "include",
        body: form,
      });
      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      const updatedCat: Category = {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        products: updated.products ?? updated.productCount ?? 0,
        imageUrl: updated.imageUrl ?? updated.image ?? null,
      };

      setCategories((prev) =>
        prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
      );
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  }

  // DELETE
  async function deleteCategory(id: number) {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  async function gotoPage(p: number) {
    setPage(p);
    await fetchCategories(p, search);
  }

  return (
    <div>
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Categories</h1>
          <p className="text-sm text-black/80 mt-1">
            Manage categories stored in database
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="border px-3 py-2 rounded text-black flex-1"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded bg-white border text-black whitespace-nowrap"
            >
              Search
            </button>
          </form>

          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 rounded bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)] text-black font-semibold"
          >
            + Add Category
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {loading ? (
        <div className="py-16 text-center text-black">Loading categories…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {categories.map((c) => (
              <CategoryCard
                key={c.id}
                c={c}
                onEdit={(cc) => {
                  setEditing(cc);
                  setModalOpen(true);
                }}
                onDelete={deleteCategory}
              />
            ))}
            {categories.length === 0 && (
              <div className="col-span-full text-black">
                No categories found.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-black">
              Showing {categories.length} of {total} categories
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => gotoPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded border bg-white text-black disabled:opacity-50"
              >
                Prev
              </button>
              <div className="px-3 py-1 rounded text-black">
                Page {page} / {totalPages}
              </div>
              <button
                onClick={() => gotoPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded border bg-white text-black disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <CategoryModal
        key={editing?.id ?? "new"}
        open={modalOpen}
        initial={editing ?? undefined}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={async (payload) => {
          if (payload.id) await updateCategory(payload);
          else await createCategory(payload);
        }}
        saving={saving}
      />
    </div>
  );
}
