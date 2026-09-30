import axios from 'axios'

import { clearCustomerSessionToken, getCustomerSessionToken } from './customer-session-token-storage'

const defaultApiBaseUrl = 'http://localhost:3000/api'
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

function getProductionApiBaseUrl(): string {
  if (!configuredApiBaseUrl) {
    throw new Error('VITE_API_BASE_URL must be configured for production.')
  }

  return configuredApiBaseUrl
}

const apiBaseUrl = import.meta.env.PROD
  ? getProductionApiBaseUrl()
  : configuredApiBaseUrl || defaultApiBaseUrl

export const customerApi = axios.create({
  baseURL: apiBaseUrl,
})

type CustomerUnauthorizedListener = () => void

const customerUnauthorizedListeners = new Set<CustomerUnauthorizedListener>()

export function subscribeToCustomerUnauthorized(listener: CustomerUnauthorizedListener): () => void {
  customerUnauthorizedListeners.add(listener)
  return () => customerUnauthorizedListeners.delete(listener)
}

function notifyCustomerUnauthorized(): void {
  customerUnauthorizedListeners.forEach(listener => listener())
}

customerApi.interceptors.request.use(config => {
  const token = getCustomerSessionToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

customerApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearCustomerSessionToken()
      notifyCustomerUnauthorized()
    }

    return Promise.reject(error)
  },
)

export function isCustomerUnauthorizedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}
