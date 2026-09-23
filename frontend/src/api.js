import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://campus-voice-9trp.onrender.com";

export const api = axios.create({
  baseURL: BASE_URL,
});

export function authHeaders() {
  const token = sessionStorage.getItem("cv_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function submitComplaint(data) {
  const res = await api.post("/api/complaints", data);
  return res.data;
}

export async function trackComplaint(code) {
  const res = await api.get(`/api/complaints/track/${encodeURIComponent(code)}`);
  return res.data;
}

export async function fetchCategories() {
  const res = await api.get("/api/complaints/categories");
  return res.data;
}

export async function adminLogin(password) {
  const res = await api.post("/api/admin/login", { password });
  return res.data;
}

export async function fetchComplaints(params = {}) {
  const res = await api.get("/api/admin/complaints", {
    headers: authHeaders(),
    params,
  });
  return res.data;
}

export async function updateComplaint(id, payload) {
  const res = await api.patch(`/api/admin/complaints/${id}`, payload, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function fetchAnalytics() {
  const res = await api.get("/api/admin/analytics", {
    headers: authHeaders(),
  });
  return res.data;
}
