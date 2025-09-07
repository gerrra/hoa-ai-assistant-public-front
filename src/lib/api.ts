import { api } from '../shared/http'
import { getOrCreateConversationId } from '../shared/chat'

export type AskBody = { community_id:number; role:'resident'|'board'|'staff'; question:string }

export async function askQuestion(question: string, opts?: { community_id?: number; role?: 'resident'|'board'|'staff' }) {
  const cid = await getOrCreateConversationId();
  const body: any = { question, conversation_id: cid, ...opts };
  const r = await api.post("/ask", body);
  return { answer: r.data.answer, conversation_id: cid, sources: r.data.sources, confidence: r.data.confidence };
}

// Legacy function for backward compatibility
export async function ask(body: AskBody){
  const r = await api.post('/ask', body)
  return r.data
}

// Health check endpoint
export async function healthCheck(){
  const r = await api.get('/health')
  return r.data
}
