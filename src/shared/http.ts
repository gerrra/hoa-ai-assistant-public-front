import axios from "axios";

const envBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/,"");
const fallbackBase = window.location.origin.replace(/^https?:\/\/app\./, (m)=>m.replace("app.","api."));
// For local development, use localhost:8000 as fallback
const localFallback = window.location.hostname === 'localhost' ? 'http://localhost:8000' : fallbackBase;
const baseURL = envBase || localFallback;

console.log('API Configuration:', {
  envBase,
  fallbackBase,
  finalBaseURL: baseURL,
  currentOrigin: window.location.origin
});

export function joinPath(...parts: string[]) {
  return parts
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p.replace(/\/+$/,"") : p.replace(/^\/+|\/+$/g,"")))
    .join("/")
    .replace(/^([^:]+:\/\/)\/+/, "$1");
}

export const api = axios.create({
  baseURL,
  withCredentials: true,              // we need cookie 'sid'
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

export const http = {
  post: (p: string, d?: any, cfg?: any) => api.post(joinPath(p), d, cfg),
  get:  (p: string, cfg?: any) => api.get(joinPath(p), cfg),
};
