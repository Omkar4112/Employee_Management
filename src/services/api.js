// ============================================================
// services/api.js
// Axios base instance — single source of truth for all HTTP calls
//
// WHY: When the backend is integrated, you only need to update
// this ONE file instead of hunting down URLs across all components.
// ============================================================

import axios from 'axios';
import { API_BASE_URL } from '../constants';

/**
 * Create a pre-configured Axios instance.
 * All API service files import THIS instance, not raw axios.
 */
const api = axios.create({
  baseURL: API_BASE_URL,       // http://localhost:8080/api
  timeout: 10000,              // 10 seconds before timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────
// Runs before EVERY request is sent.
// Use this to attach auth tokens, add logging, etc.
api.interceptors.request.use(
  (config) => {
    // Future: attach JWT token from localStorage
    // const token = localStorage.getItem('auth_token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────
// Runs after EVERY response is received.
// Use this for global error handling (e.g., redirect on 401).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.error('[API] Unauthorized — redirect to login');
      // Future: dispatch logout action, redirect to /login
    }

    if (status === 403) {
      console.error('[API] Forbidden — insufficient permissions');
    }

    if (status >= 500) {
      console.error('[API] Server error:', error.response?.data?.message);
    }

    return Promise.reject(error);
  }
);

export default api;
