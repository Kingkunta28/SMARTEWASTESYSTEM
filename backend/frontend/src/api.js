const browserHost =
  typeof window !== "undefined" && window.location?.hostname
    ? window.location.hostname
    : "127.0.0.1";
const API_BASE = `http://${browserHost}:8000/api`;

async function call(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    credentials: "include",
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message = data?.error || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  register: (payload) => call("/auth/register/", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => call("/auth/login/", { method: "POST", body: JSON.stringify(payload) }),
  forgotPassword: (payload) => call("/auth/forgot-password/", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => call("/auth/logout/", { method: "POST", body: JSON.stringify({}) }),
  me: () => call("/me/"),
  getProfile: () => call("/profile/"),
  updateProfile: (payload) => call("/profile/", { method: "PATCH", body: JSON.stringify(payload) }),
  listRequests: () => call("/requests/"),
  createRequest: (payload) => call("/requests/", { method: "POST", body: JSON.stringify(payload) }),
  updateRequest: (id, payload) => call(`/requests/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  listCollectors: () => call("/collectors/"),
  registerCollector: (payload) => call("/collectors/register/", { method: "POST", body: JSON.stringify(payload) }),
  assignCollector: (requestId, collectorId) =>
    call(`/requests/${requestId}/assign/`, {
      method: "POST",
      body: JSON.stringify({ collector_id: collectorId })
    }),
  updateStatus: (requestId, status) =>
    call(`/requests/${requestId}/status/`, {
      method: "POST",
      body: JSON.stringify({ status })
    }),
  dashboardStats: () => call("/dashboard/stats/"),
  exportMonthlyReportPdf: async (month) => {
    const response = await fetch(`${API_BASE}/reports/monthly-pdf/?month=${encodeURIComponent(month)}`, {
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) {
      let message = "Failed to export report";
      try {
        const data = await response.json();
        message = data?.error || message;
      } catch {
        // ignore parse failure
      }
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return response.blob();
  }
};
