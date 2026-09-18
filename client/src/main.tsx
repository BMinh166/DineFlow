import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'
import { StaffAuthProvider } from './context/StaffAuthContext'
import { ToastProvider } from './components/ui/ToastProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StaffAuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </StaffAuthProvider>
  </StrictMode>,
)
