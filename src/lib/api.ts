import { api } from '../shared/http'

export type AskBody = { community_id:number; role:'resident'|'board'|'staff'; question:string }

export async function ask(body: AskBody){
  const r = await api.post('/ask', body)
  return r.data
}

// Health check endpoint
export async function healthCheck(){
  const r = await api.get('/health')
  return r.data
}
