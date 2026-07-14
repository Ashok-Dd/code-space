import { API_URL } from "./config";

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data.data;
}

export const signupRequest = (username, email, password) =>
  request("/auth/signup", { method: "POST", body: JSON.stringify({ username, email, password }) });

export const loginRequest = (identifier, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) });

export const logoutRequest = () => request("/auth/logout", { method: "POST" });

export const meRequest = () => request("/auth/me", { method: "GET" });

export const mySnippetsRequest = () => request("/mine", { method: "GET" });
