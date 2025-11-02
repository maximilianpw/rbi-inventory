import { useAuth } from '@clerk/clerk-react'
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
} from 'axios'
import { useMemo } from 'react'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: unknown
}

/**
 * Custom error class for API errors
 */
export class ApiException extends Error {
  status?: number
  code?: string
  details?: unknown

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: unknown,
  ) {
    super(message)
    this.name = 'ApiException'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * Creates an axios instance configured for the API
 */
export function createAxiosInstance(token?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 second timeout
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor to add authentication token
  instance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ error?: string; message?: string }>) => {
      const status = error.response?.status
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred'

      if (status === 401) {
        throw new ApiException(
          'Authentication required',
          status,
          'UNAUTHORIZED',
        )
      } else if (status === 403) {
        throw new ApiException('Permission denied', status, 'FORBIDDEN')
      } else if (status === 404) {
        throw new ApiException('Resource not found', status, 'NOT_FOUND')
      } else if (status === 422) {
        throw new ApiException(
          'Validation error',
          status,
          'VALIDATION_ERROR',
          error.response?.data,
        )
      } else if (status && status >= 500) {
        throw new ApiException('Server error', status, 'SERVER_ERROR')
      }

      throw new ApiException(message, status, error.code, error.response?.data)
    },
  )

  return instance
}

export function useApiClient() {
  const { getToken } = useAuth()

  // Create axios instance with memoization to avoid recreating on every render
  const client = useMemo(() => {
    return {
      async getAxiosInstance(): Promise<AxiosInstance> {
        const token = await getToken()
        if (!token) {
          throw new ApiException(
            'No authentication token available',
            401,
            'NO_TOKEN',
          )
        }
        return createAxiosInstance(token)
      },

      /**
       * GET request helper
       */
      async get<T = unknown>(
        endpoint: string,
        config?: AxiosRequestConfig,
      ): Promise<T> {
        const instance = await this.getAxiosInstance()
        const response = await instance.get<T>(endpoint, config)
        return response.data
      },

      /**
       * POST request helper
       */
      async post<T = unknown>(
        endpoint: string,
        data?: unknown,
        config?: AxiosRequestConfig,
      ): Promise<T> {
        const instance = await this.getAxiosInstance()
        const response = await instance.post<T>(endpoint, data, config)
        return response.data
      },

      /**
       * PUT request helper
       */
      async put<T = unknown>(
        endpoint: string,
        data?: unknown,
        config?: AxiosRequestConfig,
      ): Promise<T> {
        const instance = await this.getAxiosInstance()
        const response = await instance.put<T>(endpoint, data, config)
        return response.data
      },

      /**
       * PATCH request helper
       */
      async patch<T = unknown>(
        endpoint: string,
        data?: unknown,
        config?: AxiosRequestConfig,
      ): Promise<T> {
        const instance = await this.getAxiosInstance()
        const response = await instance.patch<T>(endpoint, data, config)
        return response.data
      },

      /**
       * DELETE request helper
       */
      async delete<T = unknown>(
        endpoint: string,
        config?: AxiosRequestConfig,
      ): Promise<T> {
        const instance = await this.getAxiosInstance()
        const response = await instance.delete<T>(endpoint, config)
        return response.data
      },
    }
  }, [getToken])

  return client
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
  categories: {
    list: '/categories',
    get: (id: string) => `/categories/${id}`,
    create: '/categories',
    update: (id: string) => `/categories/${id}`,
    delete: (id: string) => `/categories/${id}`,
    tree: '/categories/tree', // Get hierarchical tree structure
    children: (id: string) => `/categories/${id}/children`, // Get immediate children
    products: (id: string) => `/categories/${id}/products`, // Get products in category
    move: (id: string) => `/categories/${id}/move`, // Move to different parent
  },
  products: {
    list: '/products',
    get: (id: string) => `/products/${id}`,
    create: '/products',
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
    search: (query: string) =>
      `/products/search?q=${encodeURIComponent(query)}`,
    bySku: (sku: string) => `/products/sku/${encodeURIComponent(sku)}`,
    byCategory: (categoryId: string) => `/products?category_id=${categoryId}`,
    updateCategory: (id: string) => `/products/${id}/category`, // Move product to different category
  },
} as const
