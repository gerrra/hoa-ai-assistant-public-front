import React, { useState } from 'react'
import { ask } from '../lib/api'

export default function PublicWidget(){
  const [question, setQ] = useState('')
  const [role, setRole] = useState<'resident'|'board'|'staff'>('resident')
  const [communityId, setCid] = useState(1)
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<any[]>([])
  const [status, setStatus] = useState('')

  const onAsk = async () => {
    if(!question.trim()) { setStatus('Введите вопрос'); return }
    setStatus('Думаю…'); setAnswer(''); setSources([])
    try{
      const data = await ask({ community_id: communityId, role, question })
      setAnswer(data.answer || '')
      setSources(Array.isArray(data.sources)? data.sources : [])
      setStatus(`Готово • confidence ${(Number(data.confidence)||0).toFixed(3)}`)
    }catch(e:any){ setStatus('Ошибка запроса'); }
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>HOA ИИ-ассистент</h1>
        <p className="muted">Задайте вопрос по документам сообщества</p>
        <div className="row">
          <textarea style={{flex:1,minHeight:90}} value={question} onChange={e=>setQ(e.target.value)} placeholder="Например: Можно ли оставить лодку на улице на 2 дня?" />
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <select value={role} onChange={e=>setRole(e.target.value as any)}>
              <option value="resident">resident</option>
              <option value="board">board</option>
              <option value="staff">staff</option>
            </select>
            <input type="number" value={communityId} min={1} onChange={e=>setCid(Number(e.target.value))} />
            <button onClick={onAsk}>Спросить</button>
          </div>
        </div>
        {status && <p className="muted" style={{marginTop:8}}>{status}</p>}
        {answer && <div className="answer">{answer}</div>}
        {!!sources.length && (
          <p className="muted" style={{marginTop:8}}>
            <b>Источники:</b> {sources.map((s,i)=>`${s.title}${s.section? ' — ' + s.section : ''}`).join('; ')}
          </p>
        )}
      </div>
    </div>
  )
}
