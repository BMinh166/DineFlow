import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'
import { StaffAuthProvider } from './context/StaffAuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StaffAuthProvider>
      <App />
    </StaffAuthProvider>
  </StrictMode>,
)
