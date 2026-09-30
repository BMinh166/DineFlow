import axios from 'axios'

import { clearStaffToken, getStaffToken } from './staff-token-storage'

const defaultApiBaseUrl = 'http://localhost:3000/api'
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

if (!configuredApiBaseUrl && import.meta.env.PROD) {
  throw new Error('VITE_API_BASE_URL must be configured for production.')
}

const apiBaseUrl = configuredApiBaseUrl || defaultApiBaseUrl

export const api = axios.create({
  baseURL: apiBaseUrl,
})

type UnauthorizedListener = () => void

const unauthorizedListeners = new Set<UnauthorizedListener>()

export function subscribeToUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener)

  return () => unauthorizedListeners.delete(listener)
}

function notifyUnauthorized(): void {
  unauthorizedListeners.forEach(listener => listener())
}

api.interceptors.request.use(config => {
  const token = getStaffToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !error.config?.skipAuthInvalidation) {
      clearStaffToken()
      notifyUnauthorized()
    }

    return Promise.reject(error)
  },
)

export function isUnauthorizedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}
