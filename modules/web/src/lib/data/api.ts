import { useAuth } from '@clerk/clerk-react'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export function useApiClient() {
  const { getToken } = useAuth()

  return {
    /**
     * Make an authenticated API request to the backend
     * @param endpoint - API endpoint path (e.g., '/auth/profile', '/users')
     * @param options - Fetch options (method, body, headers, etc.)
     * @returns Parsed JSON response
     */
    async fetch<T = unknown>(
      endpoint: string,
      options: RequestInit = {},
    ): Promise<T> {
      const token = await getToken()

      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: 'Request failed' }))
        throw new Error(
          error.error || `HTTP ${response.status}: ${response.statusText}`,
        )
      }

      return response.json()
    },

    /**
     * GET request helper
     */
    async get<T = unknown>(endpoint: string): Promise<T> {
      return this.fetch<T>(endpoint, { method: 'GET' })
    },

    /**
     * POST request helper
     */
    async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
      return this.fetch<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      })
    },

    /**
     * PUT request helper
     */
    async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
      return this.fetch<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      })
    },

    /**
     * DELETE request helper
     */
    async delete<T = unknown>(endpoint: string): Promise<T> {
      return this.fetch<T>(endpoint, { method: 'DELETE' })
    },
  }
}

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  auth: {
    profile: '/auth/profile',
    session: '/auth/session',
  },
  users: {
    list: '/users',
    get: (id: string) => `/users/${id}`,
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
    search: (query: string) => `/users/search?q=${query}`,
    activate: (id: string) => `/users/${id}/activate`,
    deactivate: (id: string) => `/users/${id}/deactivate`,
  },
} as const
