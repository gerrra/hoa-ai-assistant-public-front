import { api } from '../shared/http'
import { getOrCreateConversationId } from '../shared/chat'

export type AskBody = { community_id:number; role:'resident'|'board'|'staff'; question:string }

export type Document = {
  id: number;
  title: string;
  rel_path: string;
  doc_type: string;
};

export type Source = {
  text: string;
  document: Document;
};

export type GroupedSource = {
  title: string;
  url: string | undefined | null;       // deep link to the first page
  pages?: number[];  // list of page numbers
  links?: (string | undefined | null)[];  // per-page links, if provided
  // New structure support
  document?: Document;
  text?: string;
};

export async function askQuestion(question: string, opts?: { community_id?: number; role?: 'resident'|'board'|'staff' }) {
  const cid = await getOrCreateConversationId();
  const body: any = { question, conversation_id: cid, ...opts };
  
  console.log('🚀 Sending ask request:', {
    url: '/ask',
    body,
    timestamp: new Date().toISOString()
  });
  
  try {
    const r = await api.post("/ask", body);
    
    console.log('✅ Ask response received:', {
      status: r.status,
      statusText: r.statusText,
      data: r.data,
      timestamp: new Date().toISOString()
    });
    
    const sources = (r.data.sources_grouped || r.data.sources || []) as GroupedSource[];
    
    return { 
      answer: String(r.data.answer || ""), 
      conversation_id: cid, 
      sources, 
      confidence: r.data.confidence 
    };
  } catch (error: any) {
    console.error('❌ Ask request failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      },
      timestamp: new Date().toISOString()
    });
    throw error;
  }
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

// Community types
export type Community = {
  id: number;
  name: string;
  description: string;
};

// Get list of communities
export async function getCommunities(): Promise<Community[]> {
  try {
    console.log('Fetching communities from /communities endpoint...');
    console.log('API base URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('Full URL:', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/communities`);
    
    const r = await api.get('/communities');
    console.log('Communities response status:', r.status);
    console.log('Communities response data:', r.data);
    console.log('Communities response headers:', r.headers);
    
    if (!r.data || !Array.isArray(r.data)) {
      console.warn('Invalid response format:', r.data);
      return [];
    }
    
    return r.data;
  } catch (error) {
    console.error('Error fetching communities:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
}

// Test API connection
export async function testAPIConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('🧪 Testing API connection...');
    console.log('API base URL:', import.meta.env.VITE_API_BASE_URL);
    
    const r = await api.get('/health');
    
    console.log('✅ API test successful:', {
      status: r.status,
      statusText: r.statusText,
      data: r.data,
      timestamp: new Date().toISOString()
    });
    
    return { 
      success: true, 
      data: r.data 
    };
  } catch (error: any) {
    console.error('❌ API test failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      },
      timestamp: new Date().toISOString()
    });
    
    return { 
      success: false, 
      error: error.message || 'Unknown error' 
    };
  }
}
