// frontend/lib/api.ts

/**
 * Lightweight wrapper around fetch.
 * Always sends credentials so backend cookies work.
 */

export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  // return JSON or null
  try {
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: res.ok, status: res.status, data: null };
  }
}
