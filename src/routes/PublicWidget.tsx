import React, { useState } from 'react'
import { ask } from '../lib/api'

export default function PublicWidget(){
  const [question, setQ] = useState('')
  const [role, setRole] = useState<'resident'|'board'|'staff'>('resident')
  const [communityId, setCid] = useState(1)
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<any[]>([])
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const onAsk = async () => {
    if(!question.trim()) { setStatus('Введите вопрос'); return }
    setIsLoading(true)
    setStatus('Думаю…'); setAnswer(''); setSources([])
    try{
      const data = await ask({ community_id: communityId, role, question })
      setAnswer(data.answer || '')
      setSources(Array.isArray(data.sources)? data.sources : [])
      setStatus(`Готово • confidence ${(Number(data.confidence)||0).toFixed(3)}`)
    }catch(e:any){ setStatus('Ошибка запроса'); }
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
        {!answer && !isLoading && (
          <div className="welcome-message">
            <h2>Что у тебя сегодня на уме?</h2>
            <p>Задайте вопрос по документам сообщества</p>
          </div>
        )}

        {/* Messages */}
        {answer && (
          <div className="message ai-message">
            <div className="message-content">
              {answer}
            </div>
            {!!sources.length && (
              <div className="sources">
                <strong>Источники:</strong> {sources.map((s,i)=>`${s.title}${s.section? ' — ' + s.section : ''}`).join('; ')}
              </div>
            )}
          </div>
        )}

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
