import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicWidget from './routes/PublicWidget'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicWidget />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
