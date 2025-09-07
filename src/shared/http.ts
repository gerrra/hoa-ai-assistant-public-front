import axios from "axios";

const envBase = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "");
const fallbackBase = window.location.origin.replace("app.", "api.");
export const api = axios.create({
  baseURL: (envBase || fallbackBase),
  withCredentials: false, // public doesn't need cookies
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});
