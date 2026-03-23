const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://iaeste-lc-jecrc-member-portal-backe.vercel.app';

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
    throw new Error(message);
  }

  return data;
}

