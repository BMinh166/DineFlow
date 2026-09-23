import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'
import { CustomerCartProvider } from './context/CustomerCartContext'
import { CustomerSessionProvider } from './context/CustomerSessionContext'
import { StaffAuthProvider } from './context/StaffAuthContext'
import { ToastProvider } from './components/ui/ToastProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StaffAuthProvider>
      <CustomerSessionProvider>
        <CustomerCartProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </CustomerCartProvider>
      </CustomerSessionProvider>
    </StaffAuthProvider>
  </StrictMode>,
)
