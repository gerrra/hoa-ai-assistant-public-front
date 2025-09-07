import React, { useState } from 'react'
import { askQuestion } from '../lib/api'
import { useChatHistory } from '../hooks/useChatHistory'

export default function PublicWidget(){
  const [question, setQ] = useState('')
  const [role, setRole] = useState<'resident'|'board'|'staff'>('resident')
  const [communityId, setCid] = useState(1)
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { messages, addMessage, refreshMessages, conversationId } = useChatHistory()

  const onAsk = async () => {
    if(!question.trim()) { setStatus('Введите вопрос'); return }
    
    const currentQuestion = question.trim()
    setQ('') // Clear input immediately
    setIsLoading(true)
    setStatus('Думаю…')
    
    // Add user message to history
    addMessage({
      id: Date.now(),
      role: 'user',
      content: currentQuestion,
      created_at: new Date().toISOString(),
      meta: { community_id: communityId, role }
    })
    
    try{
      const data = await askQuestion(currentQuestion, { community_id: communityId, role })
      
      // Add AI response to history
      addMessage({
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer || '',
        created_at: new Date().toISOString(),
        meta: { sources: data.sources, confidence: data.confidence }
      })
      
      setStatus(`Готово • confidence ${(Number(data.confidence)||0).toFixed(3)}`)
      
      // Refresh messages to get latest from server
      if (conversationId) {
        await refreshMessages(conversationId)
      }
    }catch(e:any){ 
      setStatus('Ошибка запроса')
      console.error('Ask error:', e)
    }
    finally {
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
            <input 
              type="number" 
              value={communityId} 
              min={1} 
              onChange={e=>setCid(Number(e.target.value))} 
              className="community-input"
              placeholder="ID сообщества"
            />
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
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
            {msg.meta?.sources && msg.meta.sources.length > 0 && (
              <div className="sources">
                <strong>Источники:</strong> {msg.meta.sources.map((s:any,i:number)=>`${s.title}${s.section? ' — ' + s.section : ''}`).join('; ')}
              </div>
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
        {status && <div className="status-message">{status}</div>}
      </div>
    </div>
  )
}
