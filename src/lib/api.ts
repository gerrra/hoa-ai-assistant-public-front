import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? ''
// В prod это обязано быть задано .env.production:
if (import.meta.env.PROD && !API_BASE) {
  console.error('VITE_API_BASE_URL is missing in production build');
}

export const http = axios.create({ 
  baseURL: API_BASE, 
  withCredentials: true 
})

export type AskBody = { community_id:number; role:'resident'|'board'|'staff'; question:string }

export async function ask(body: AskBody){
  const r = await http.post('/ask', body)
  return r.data
}

// Health check endpoint
export async function healthCheck(){
  const r = await http.get('/health')
  return r.data
}
