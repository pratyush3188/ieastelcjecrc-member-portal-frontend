export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getAuthToken() {
  return localStorage.getItem('authToken') || '';
}

export function setAuthSession({ token, user }) {
  if (token) localStorage.setItem('authToken', token);
  if (user) localStorage.setItem('authUser', JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

/** Upload offer PDF (multipart). Returns { offer }. */
export async function apiUploadOfferPdf(offerId, file) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const formData = new FormData();
  formData.append('pdf', file);
  const res = await fetch(`${API_BASE_URL}/api/admin/offers/${offerId}/pdf`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(data?.message || `Upload failed (${res.status})`);
  return data;
}

export async function apiDeleteOfferPdf(offerId) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE_URL}/api/admin/offers/${offerId}/pdf`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error(data?.message || `Delete failed (${res.status})`);
  return data;
}

