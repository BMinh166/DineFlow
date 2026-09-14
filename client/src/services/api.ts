import axios from 'axios'

const defaultApiBaseUrl = 'http://localhost:3000/api'
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || defaultApiBaseUrl

export const api = axios.create({
  baseURL: apiBaseUrl,
})
