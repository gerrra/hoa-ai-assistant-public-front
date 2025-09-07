import axios from "axios";

const envBase = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "");
const fallbackBase = window.location.origin.replace(/^https?:\/\/app\./, (m) => m.replace("app.","api."));
const baseURL = envBase || fallbackBase;

export function joinPath(...parts: string[]) {
  return parts
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p.replace(/\/+$/,"") : p.replace(/^\/+|\/+$/g,"")))
    .join("/")
    .replace(/^([^:]+:\/\/)\/+/, "$1");
}

export const api = axios.create({
  baseURL,
  withCredentials: false,             // public doesn't use cookies
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

export const http = {
  post: (p: string, d?: any, cfg?: any) => api.post(joinPath(p), d, cfg),
  get:  (p: string, cfg?: any) => api.get(joinPath(p), cfg),
};
