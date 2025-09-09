import React, { useState, useEffect, useRef } from 'react'
import { askQuestion, getCommunities, Community } from '../lib/api'
import { chatManager } from '../utils/chatManager'
import { useChatHistory } from '../hooks/useChatHistory'
import SourcesList from '../components/SourcesList'

export default function PublicWidget(){
  const [question, setQ] = useState('')
  const [role, setRole] = useState<'resident'|'board'|'staff'>('resident')
  const [communityId, setCid] = useState<number | ''>('')
  const [isLoading, setIsLoading] = useState(false)
  const [communities, setCommunities] = useState<Community[]>([])
  const [communitiesLoading, setCommunitiesLoading] = useState(true)
  
  
  const { messages, addMessage, refreshMessages, conversationId, createNewConversation, updateConversationId } = useChatHistory()
  const chatAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Load communities on component mount
  useEffect(() => {
    const loadCommunities = async () => {
      try {
        console.log('Loading communities...');
        console.log('Current API base URL:', import.meta.env.VITE_API_BASE_URL);
        
        const communitiesData = await getCommunities()
        console.log('Loaded communities:', communitiesData);
        console.log('Communities count:', communitiesData.length);
        
        if (communitiesData.length === 0) {
          console.warn('No communities found in API response');
        }
        
        setCommunities(communitiesData)
        // Set first community as default if available
        if (communitiesData.length > 0) {
          setCid(communitiesData[0].id)
          console.log('Set default community:', communitiesData[0].id);
        } else {
          console.warn('No communities available, communityId will remain empty');
        }
      } catch (error) {
        console.error('Failed to load communities:', error)
        console.error('Error type:', typeof error);
        console.error('Error message:', error.message);
        
        // Fallback data for testing
        const fallbackCommunities = [
          { id: 1, name: 'Тестовое сообщество 1', description: 'Описание сообщества 1' },
          { id: 2, name: 'Тестовое сообщество 2', description: 'Описание сообщества 2' }
        ];
        console.log('Using fallback communities:', fallbackCommunities);
        setCommunities(fallbackCommunities);
        setCid(fallbackCommunities[0].id);
      } finally {
        setCommunitiesLoading(false)
      }
    }

    loadCommunities()
  }, [])


  const onAsk = async () => {
    if(!question.trim() || !communityId) return
    
    const currentQuestion = question.trim()
    setQ('') // Clear input immediately
    setIsLoading(true)
    
    try {
      console.log('🔍 Отправляем вопрос:', {
        question: currentQuestion,
        community_id: communityId,
        role: role,
        conversation_id: conversationId,
        timestamp: new Date().toISOString()
      });
      console.log('🔍 ID в localStorage перед отправкой:', localStorage.getItem('conversationId'));
      
      // Сначала сохраняем сообщение пользователя в conversation
      let currentConversationId = conversationId;
      if (currentConversationId) {
        try {
          const result = await chatManager.sendMessage(currentConversationId, currentQuestion, { 
            community_id: communityId, 
            role: role 
          }, 'user');
          currentConversationId = result.conversationId;
          console.log('✅ Сообщение пользователя сохранено в conversation:', currentConversationId);
          
          // Обновляем conversation ID в состоянии, если он изменился
          if (currentConversationId !== conversationId) {
            console.log('🔄 Обновляем conversation ID в состоянии с', conversationId, 'на', currentConversationId);
            updateConversationId(currentConversationId);
            console.log('✅ ID в localStorage после обновления:', localStorage.getItem('conversationId'));
          }
        } catch (error) {
          console.warn('⚠️ Не удалось сохранить сообщение пользователя:', error);
        }
      }
      
      // Add user message to history
      addMessage({
        id: Date.now(),
        role: 'user',
        content: currentQuestion,
        created_at: new Date().toISOString(),
        meta: { community_id: communityId, role }
      })
      
      // Scroll to bottom after adding user message
      setTimeout(scrollToBottom, 100)
      
      // Отправляем запрос к нейросети
      const data = await askQuestion(currentQuestion, { 
        community_id: communityId, 
        role,
        conversation_id: currentConversationId 
      })
      
      console.log('📋 Ответ нейросети получен:', {
        answer: data.answer,
        sources: data.sources,
        confidence: data.confidence,
        conversation_id: data.conversation_id
      });
      
      // Сохраняем ответ нейросети в conversation
      const finalConversationId = data.conversation_id || currentConversationId;
      if (finalConversationId) {
        try {
          await chatManager.sendMessage(finalConversationId, data.answer || '', { 
            sources: data.sources,
            confidence: data.confidence
          }, 'assistant');
          console.log('✅ Ответ нейросети сохранен в conversation:', finalConversationId);
          
          // Обновляем conversation ID если он изменился
          if (finalConversationId !== conversationId) {
            console.log('🔄 Обновляем conversation ID после сохранения ответа с', conversationId, 'на', finalConversationId);
            updateConversationId(finalConversationId);
          }
        } catch (error) {
          console.warn('⚠️ Не удалось сохранить ответ нейросети:', error);
        }
      }
      
      // Add AI response to history
      addMessage({
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer || '',
        created_at: new Date().toISOString(),
        meta: { sources: data.sources, confidence: data.confidence }
      })
      
      // Scroll to bottom after adding AI response
      setTimeout(scrollToBottom, 100)
      
      // Refresh messages to get latest from server
      if (finalConversationId) {
        console.log('🔄 Обновляем сообщения с актуальным conversation ID:', finalConversationId)
        console.log('🔄 Текущий conversation ID в состоянии:', conversationId)
        console.log('🔄 ID в localStorage перед refresh:', localStorage.getItem('conversationId'))
        await refreshMessages(finalConversationId)
        console.log('✅ ID в localStorage после refresh:', localStorage.getItem('conversationId'))
      } else {
        console.warn('⚠️ Нет finalConversationId для обновления сообщений')
      }
      
    } catch(e: any) { 
      console.error('❌ Ошибка отправки вопроса:', e)
      
      // Detailed error handling
      let errorMessage = 'Неизвестная ошибка'
      
      if (e.code === 'NETWORK_ERROR' || e.message?.includes('Network Error')) {
        errorMessage = 'Ошибка сети: нет соединения с сервером'
      } else if (e.response?.status === 404) {
        errorMessage = 'Ошибка 404: endpoint не найден'
      } else if (e.response?.status === 500) {
        errorMessage = 'Ошибка 500: внутренняя ошибка сервера'
      } else if (e.response?.status === 400) {
        errorMessage = 'Ошибка 400: неверный запрос'
      } else if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
        errorMessage = 'Таймаут: сервер не отвечает'
      } else if (e.response?.data?.detail) {
        errorMessage = `Ошибка сервера: ${e.response.data.detail}`
      } else if (e.message) {
        errorMessage = e.message
      }
      
      // Add error message to chat
      addMessage({
        id: Date.now() + 1,
        role: 'assistant',
        content: `Извините, произошла ошибка: ${errorMessage}`,
        created_at: new Date().toISOString(),
        meta: { error: true }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onAsk()
    }
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-content">
          <h1>HOA ИИ-ассистент</h1>
          <div className="header-controls">
            <select value={role} onChange={e=>setRole(e.target.value as any)} className="role-select">
              <option value="resident">Житель</option>
              <option value="board">Правление</option>
              <option value="staff">Персонал</option>
            </select>
            <select 
              value={communityId} 
              onChange={e=>setCid(e.target.value ? Number(e.target.value) : '')} 
              className="community-select"
              disabled={communitiesLoading}
            >
              <option value="">
                {communitiesLoading ? 'Загрузка...' : 
                 communities.length === 0 ? 'Нет сообществ' : 'Выберите сообщество'}
              </option>
              {communities.map(community => (
                <option key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))}
            </select>
            <button 
              onClick={createNewConversation}
              className="new-conversation-button"
              title="Начать новый диалог"
            >
              🆕 Новый диалог
            </button>
            <button 
              onClick={() => {
                console.log('🧹 Очищаем localStorage...');
                localStorage.clear();
                console.log('🔄 Перезагружаем страницу...');
                window.location.reload();
              }}
              className="clear-conversation-button"
              title="Очистить все данные и перезагрузить"
            >
              🧹 Очистить
            </button>
          </div>
        </div>
        
      </div>

      {/* Chat Area */}
      <div className="chat-area" ref={chatAreaRef}>
        {messages.length === 0 && !isLoading && (
          <div className="welcome-message">
            <h2>Что у тебя сегодня на уме?</h2>
            <p>Задайте вопрос по документам сообщества</p>
          </div>
        )}

        {/* Chat History */}
        {messages.map((msg, index) => (
          <div key={msg.id} className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
            <div className="message-content">
              {msg.content}
            </div>
            {msg.role === 'assistant' && msg.meta?.sources && msg.meta.sources.length > 0 && (
              <SourcesList items={msg.meta.sources} />
            )}
          </div>
        ))}

        {isLoading && (
          <div className="message ai-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Input Area */}
      <div className="input-area">
        <div className="input-container">
          <div className="input-wrapper">
            <textarea 
              value={question} 
              onChange={e=>setQ(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Спросите что-нибудь..."
              className="message-input"
              rows={1}
            />
            <button 
              onClick={onAsk} 
              disabled={isLoading || !question.trim()}
              className="send-button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
