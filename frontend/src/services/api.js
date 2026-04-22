import axios from "axios";

const API_BASE = "/api";

// Auth
export const loginAPI = (credentials) =>
  axios.post(`${API_BASE}/auth/login`, credentials);

// Cameras
export const getCameras = () =>
  axios.get(`${API_BASE}/cameras`);

export const addCamera = (data) =>
  axios.post(`${API_BASE}/cameras`, data);

export const updateCamera = (id, data) =>
  axios.put(`${API_BASE}/cameras/${id}`, data);

export const deleteCamera = (id) =>
  axios.delete(`${API_BASE}/cameras/${id}`);

// Detections
export const saveDetection = (data) =>
  axios.post(`${API_BASE}/detections`, data);

export const getDetections = (params) =>
  axios.get(`${API_BASE}/detections`, { params });

// Violations
export const getViolations = (params) =>
  axios.get(`${API_BASE}/violations`, { params });

export const getViolationStats = () =>
  axios.get(`${API_BASE}/violations/stats`);

// Analytics
export const getDashboardStats = () =>
  axios.get(`${API_BASE}/analytics/stats`);

export const getComplianceTrend = (days = 7) =>
  axios.get(`${API_BASE}/analytics/compliance-trend`, { params: { days } });

export const getPPERules = () =>
  axios.get(`${API_BASE}/analytics/ppe-rules`);

export const updatePPERules = (rules) =>
  axios.put(`${API_BASE}/analytics/ppe-rules`, { rules });