const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

function buildApiUrl(path, params) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${cleanPath}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item === undefined || item === null) return;
          url.searchParams.append(key, item.toString());
        });
        return;
      }
      url.searchParams.append(key, value.toString());
    });
  }
  return url.toString();
}

export async function fetchApi(path, options = {}) {
  const url = path.startsWith('http') ? path : buildApiUrl(path);
  const finalOptions = { ...options };
  const headers = new Headers(finalOptions.headers || {});
  const token = window.localStorage.getItem('accessToken');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (
    finalOptions.body &&
    typeof finalOptions.body === 'object' &&
    !(finalOptions.body instanceof FormData)
  ) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    finalOptions.body = JSON.stringify(finalOptions.body);
  }

  finalOptions.headers = headers;
  const response = await fetch(url, finalOptions);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || 'Request failed';
    throw new Error(message);
  }
  return payload;
}

export default fetchApi;
export { API_BASE_URL, buildApiUrl };
