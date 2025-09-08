import { api } from '../shared/http'
import { getOrCreateConversationId } from '../shared/chat'

export type AskBody = { community_id:number; role:'resident'|'board'|'staff'; question:string }

export type GroupedSource = {
  title: string;
  url: string;       // deep link to the first page
  pages?: number[];  // list of page numbers
  links?: string[];  // per-page links, if provided
};

export async function askQuestion(question: string, opts?: { community_id?: number; role?: 'resident'|'board'|'staff' }) {
  const cid = await getOrCreateConversationId();
  const body: any = { question, conversation_id: cid, ...opts };
  const r = await api.post("/ask", body);
  return { 
    answer: String(r.data.answer || ""), 
    conversation_id: cid, 
    sources: (r.data.sources_grouped || r.data.sources || []) as GroupedSource[], 
    confidence: r.data.confidence 
  };
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
