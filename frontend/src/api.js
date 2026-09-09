export const API_BASE = import.meta.env.VITE_API_URL || '';

export const apiUrl = (path) => `${API_BASE}${path}`;

export const authHeaders = (token) => token ? { Authorization: `Bearer ${token}` } : {};
