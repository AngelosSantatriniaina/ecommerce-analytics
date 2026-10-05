const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");

export function dateRangeForDays(days) {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - Math.max(1, Number(days)) + 1);
  const toIsoDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

export function dateRangeQuery(from, to) {
  return `from=${from}&to=${to}`;
}

export function last30DaysQuery(days = 30) {
  const range = dateRangeForDays(days);
  return dateRangeQuery(range.from, range.to);
}

function getCsrfCookie() {
  if (typeof document === "undefined") return null;
  const token = document.cookie.split("; ").find((entry) => entry.startsWith("XSRF-TOKEN="))?.slice("XSRF-TOKEN=".length);
  return token ? decodeURIComponent(token) : null;
}

export async function apiRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    let csrfToken = getCsrfCookie();
    if (!csrfToken) {
      const csrfResponse = await fetch(`${API_BASE_URL}/auth/csrf`, { credentials: "include" });
      const csrfData = await csrfResponse.json().catch(() => null);
      csrfToken = getCsrfCookie() || csrfData?.token;
    }
    if (csrfToken) headers["X-XSRF-TOKEN"] = csrfToken;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    credentials: "include",
    headers,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || `La requête a échoué (${response.status}).`);
  }
  return data;
}