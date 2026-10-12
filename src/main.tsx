import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './theme/ThemeProvider'
import { ClaimWatchProvider } from './claimwatch/ClaimWatchProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider><ClaimWatchProvider><App /></ClaimWatchProvider></ThemeProvider>
  </StrictMode>,
)
