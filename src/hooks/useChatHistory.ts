import { useState, useEffect } from 'react'
import { chatManager } from '../utils/chatManager'
import { storageManager } from '../utils/storageManager'

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
        console.log('🚀 Инициализируем чат...')
        
        // Получаем сохраненный conversation ID
        const savedId = chatManager.getCurrentConversationId()
        console.log('📖 Сохраненный ID из localStorage:', savedId)
        
        if (savedId) {
          // Пытаемся загрузить существующую conversation
          try {
            console.log('🔍 Проверяем существующую conversation:', savedId)
            const { messages: msgs, conversationId: validId } = await chatManager.getMessages(savedId)
            
            // Если ID изменился, обновляем его
            if (validId !== savedId) {
              console.log('🔄 Conversation ID изменился с', savedId, 'на', validId)
              chatManager.forceUpdateConversationId(validId)
            }
            
            setConversationId(validId)
            setMessages(msgs)
            console.log('✅ Загружена существующая conversation:', validId, 'сообщений:', msgs.length)
          } catch (error) {
            console.warn('⚠️ Не удалось загрузить существующую conversation, создаем новую')
            console.warn('⚠️ Ошибка:', error)
            const newData = await chatManager.createNewConversation('Новый диалог')
            setConversationId(newData.conversation_id)
            setMessages([])
          }
        } else {
          // Создаем новую conversation
          console.log('🆕 Нет сохраненного ID, создаем новую conversation')
          const newData = await chatManager.createNewConversation('Новый диалог')
          setConversationId(newData.conversation_id)
          setMessages([])
          console.log('🆕 Создана новая conversation:', newData.conversation_id)
        }
        
        // Загружаем все conversations
        const convos = await chatManager.getConversations()
        setConversations(convos)
        console.log('📋 Загружено conversations:', convos.length)
        
      } catch (err) {
        console.error('❌ Ошибка инициализации чата:', err)
        setError(err instanceof Error ? err.message : 'Failed to load chat history')
        
        // При ошибке создаем новую conversation
        try {
          const newData = await chatManager.createNewConversation('Новый диалог')
          setConversationId(newData.conversation_id)
          setMessages([])
        } catch (newErr) {
          console.error('❌ Критическая ошибка создания conversation:', newErr)
        }
      } finally {
        setLoading(false)
      }
    }

    initConversation()
  }, [])

  const refreshMessages = async (cid?: string) => {
    const targetCid = cid || conversationId
    if (!targetCid) {
      console.warn('⚠️ Нет conversation ID для обновления сообщений')
      return
    }

    try {
      console.log('🔄 Обновляем сообщения для conversation:', targetCid)
      const { messages: msgs, conversationId: validId } = await chatManager.getMessages(targetCid)
      
      console.log('📨 Получены сообщения:', msgs.map(m => ({ id: m.id, role: m.role, content: m.content?.substring(0, 50) + '...' })))
      setMessages(msgs)
      
      // Если conversation ID изменился, обновляем его
      if (validId !== targetCid) {
        console.log('🔄 Conversation ID изменился с', targetCid, 'на', validId)
        setConversationId(validId)
        storageManager.saveConversationId(validId)
      } else {
        console.log('✅ Conversation ID остался тем же:', validId)
      }
      
      console.log('✅ Сообщения обновлены:', msgs.length)
    } catch (err) {
      console.error('❌ Ошибка обновления сообщений:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh messages')
    }
  }

  const switchConversation = async (cid: string) => {
    try {
      setLoading(true)
      console.log('🔄 Переключаемся на conversation:', cid)
      
      const { messages: msgs, conversationId: validId } = await chatManager.getMessages(cid)
      
      setConversationId(validId)
      setMessages(msgs)
      storageManager.saveConversationId(validId)
      
      console.log('✅ Переключение завершено, сообщений:', msgs.length)
    } catch (err) {
      console.error('❌ Ошибка переключения conversation:', err)
      setError(err instanceof Error ? err.message : 'Failed to switch conversation')
    } finally {
      setLoading(false)
    }
  }

  const addMessage = (message: ChatMessage) => {
    console.log('➕ Добавляем сообщение:', { id: message.id, role: message.role, content: message.content?.substring(0, 50) + '...' })
    setMessages(prev => [...prev, message])
  }

  const updateConversationId = (newId: string) => {
    console.log('🔄 Обновляем conversation ID в хуке с', conversationId, 'на', newId)
    setConversationId(newId)
    chatManager.forceUpdateConversationId(newId)
  }

  const createNewConversation = async () => {
    try {
      setLoading(true)
      console.log('🆕 Создаем новую conversation...')
      console.log('🔄 Текущий ID перед созданием:', conversationId)
      
      // Принудительно очищаем старый ID
      chatManager.clearConversation()
      
      const newData = await chatManager.createNewConversation('Новый диалог')
      setConversationId(newData.conversation_id)
      setMessages([])
      
      // Обновляем список conversations
      const convos = await chatManager.getConversations()
      setConversations(convos)
      
      console.log('✅ Новая conversation создана:', newData.conversation_id)
      console.log('✅ ID в localStorage после создания:', localStorage.getItem('conversationId'))
    } catch (err) {
      console.error('❌ Ошибка создания новой conversation:', err)
      setError(err instanceof Error ? err.message : 'Failed to create new conversation')
    } finally {
      setLoading(false)
    }
  }

  return {
    conversationId,
    messages,
    conversations,
    loading,
    error,
    refreshMessages,
    switchConversation,
    addMessage,
    createNewConversation,
    updateConversationId
  }
}
