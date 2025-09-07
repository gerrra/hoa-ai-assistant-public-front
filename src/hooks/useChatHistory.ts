import { useState, useEffect } from 'react'
import { getOrCreateConversationId, fetchMessages, listConversations } from '../shared/chat'

export interface ChatMessage {
  id: number
  role: string
  content: string
  created_at: string
  meta?: any
}

export interface ChatConversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export function useChatHistory() {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize conversation ID on mount
  useEffect(() => {
    const initConversation = async () => {
      try {
        setLoading(true)
        const cid = await getOrCreateConversationId()
        setConversationId(cid)
        
        // Load messages for this conversation
        const msgs = await fetchMessages(cid)
        setMessages(msgs)
        
        // Load all conversations
        const convos = await listConversations()
        setConversations(convos)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat history')
      } finally {
        setLoading(false)
      }
    }

    initConversation()
  }, [])

  const refreshMessages = async (cid?: string) => {
    const targetCid = cid || conversationId
    if (!targetCid) return

    try {
      const msgs = await fetchMessages(targetCid)
      setMessages(msgs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh messages')
    }
  }

  const switchConversation = async (cid: string) => {
    try {
      setLoading(true)
      setConversationId(cid)
      const msgs = await fetchMessages(cid)
      setMessages(msgs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch conversation')
    } finally {
      setLoading(false)
    }
  }

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message])
  }

  return {
    conversationId,
    messages,
    conversations,
    loading,
    error,
    refreshMessages,
    switchConversation,
    addMessage
  }
}
