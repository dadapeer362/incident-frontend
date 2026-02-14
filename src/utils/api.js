import { API_BASE } from "../constants/config";

export async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.detail || JSON.stringify(data);
    } catch {}
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}
