const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DEFAULT_TIMEOUT_MS = 15000;

async function request(path, options = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...fetchOptions,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('The request timed out. Please check your connection and try again.');
    }
    throw new Error('Network error — could not reach the server. Please try again.');
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  listProfiles: () => request('/profiles'),
  createProfile: (payload) => request('/profiles', { method: 'POST', body: JSON.stringify(payload) }),
  updateProfileTimezone: (id, timezone) =>
    request(`/profiles/${id}/timezone`, { method: 'PATCH', body: JSON.stringify({ timezone }) }),

  listEvents: (profileId) => request(`/events${profileId ? `?profileId=${profileId}` : ''}`),
  createEvent: (payload) => request('/events', { method: 'POST', body: JSON.stringify(payload) }),
  updateEvent: (id, payload) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  getEventLogs: (id) => request(`/events/${id}/logs`),
};
