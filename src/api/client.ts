// API client configuration
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:8085',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth headers, logging, etc.
    return config
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  },
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle global errors
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  },
)
