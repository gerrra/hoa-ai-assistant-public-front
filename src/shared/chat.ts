import { api } from "./http";

const KEY = "hoa_chat_cid";

export async function getOrCreateConversationId(): Promise<string> {
  const saved = localStorage.getItem(KEY);
  if (saved) return saved;
  const r = await api.post("/chat/start", { title: null });
  const cid = r.data.conversation_id as string;
  localStorage.setItem(KEY, cid);
  return cid;
}

export async function listConversations() {
  const r = await api.get("/chat/list");
  return r.data as Array<{id:string; title:string; created_at:string; updated_at:string; message_count:number;}>;
}

export async function fetchMessages(cid: string, limit=100) {
  const r = await api.get(`/chat/${cid}/messages`, { params: { limit }});
  return r.data as Array<{id:number; role:string; content:string; created_at:string; meta?:any}>;
}

export async function addUserMessage(cid: string, content: string, meta?: any) {
  return api.post(`/chat/${cid}/messages`, { role: "user", content, meta });
}
