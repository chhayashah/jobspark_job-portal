import axios from "axios";
import toast from "react-hot-toast";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err),
);

// Handle responses & errors globally
API.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || "Something went wrong";
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else if (err.response?.status !== 404) {
      toast.error(message);
    }
    return Promise.reject(err);
  },
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/profile", data),
  changePassword: (data) => API.put("/auth/password", data),
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const jobsAPI = {
  getAll: (params) => API.get("/jobs", { params }),
  getOne: (id) => API.get(`/jobs/${id}`),
  create: (data) => API.post("/jobs", data),
  update: (id, data) => API.put(`/jobs/${id}`, data),
  remove: (id) => API.delete(`/jobs/${id}`),
  getMyJobs: () => API.get("/jobs/my"),
  getRecommended: () => API.get("/jobs/recommended"),
};

// ─── Applications ─────────────────────────────────────────────────────────────
export const applicationsAPI = {
  apply: (formData) =>
    API.post("/applications", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMyApplications: (params) => API.get("/applications/my", { params }),
  getJobApplications: (jobId, params) =>
    API.get(`/applications/job/${jobId}`, { params }),
  getRankedCandidates: (jobId) => API.get(`/applications/job/${jobId}/ranked`),
  updateStatus: (id, data) => API.put(`/applications/${id}/status`, data),
  withdraw: (id) => API.put(`/applications/${id}/withdraw`),
};

// ─── Resume ───────────────────────────────────────────────────────────────────
export const resumeAPI = {
  upload: (formData) =>
    API.post("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getSkillGap: (jobId) => API.get(`/resume/skill-gap/${jobId}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getPlatformStats: () => API.get("/analytics/platform"),
  getMostApplied: (params) => API.get("/analytics/most-applied", { params }),
  getSkillGaps: () => API.get("/analytics/skill-gaps"),
  getRecruiterAnalytics: () => API.get("/analytics/recruiter"),
  getCandidateAnalytics: () => API.get("/analytics/candidate"),
};

export default API;

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: (params) => API.get("/notifications", { params }),
  markAllRead: () => API.put("/notifications/read-all"),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  clearAll: () => API.delete("/notifications/clear"),
};

// ─── Resume Versions ──────────────────────────────────────────────────────────
export const resumeVersionsAPI = {
  getAll: () => API.get("/resume-versions"),
  upload: (formData) =>
    API.post("/resume-versions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  activate: (id) => API.put(`/resume-versions/${id}/activate`),
  compare: (v1, v2) =>
    API.get("/resume-versions/compare", { params: { v1, v2 } }),
  remove: (id) => API.delete(`/resume-versions/${id}`),
};

// ─── Company ──────────────────────────────────────────────────────────────────
export const companyAPI = {
  getMyCompany: () => API.get("/company/my/profile"),
  create: (data) => API.post("/company", data),
  update: (id, d) => API.put(`/company/${id}`, d),
  invite: (id, email) => API.post(`/company/${id}/invite`, { email }),
  getBySlug: (slug) => API.get(`/company/${slug}`),
};

// ─── Advanced Job endpoints ───────────────────────────────────────────────────
export const advancedJobsAPI = {
  trending: (params) => API.get("/jobs/trending", { params }),
  autocomplete: (q) => API.get("/jobs/autocomplete", { params: { q } }),
  booleanSearch: (params) => API.get("/jobs/boolean-search", { params }),
};

// ─── Advanced Applications ────────────────────────────────────────────────────
export const advancedAppsAPI = {
  autoShortlist: (jobId, threshold) =>
    API.post(`/applications/job/${jobId}/auto-shortlist`, { threshold }),
  compare: (applicationIds) =>
    API.post("/applications/compare", { applicationIds }),
};

// ─── Resume Score ─────────────────────────────────────────────────────────────
export const resumeScoreAPI = {
  getScore: () => API.get("/resume/score"),
};
