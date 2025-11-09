import { useAuth } from '@clerk/nextjs'
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
} from 'axios'
import { useMemo } from 'react'
import { env } from '@/lib/env'
import {
  ConflictException,
  NotFoundException,
  ValidationException,
  UnauthorizedException,
  ForbiddenException,
  InternalException,
  BadRequestException,
  TimeoutException,
} from '@/lib/data/types'

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL

// Legacy interface kept for backward compatibility if needed
export interface ApiResponse<T> {
  data?: T
  error?: string
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
    (
      error: AxiosError<{
        error?: string
        message?: string
        field?: string
        current?: string
        desired?: string
        retryIn?: number
        service?: string
        retryable?: boolean
        operation?: string
        duration?: number
      }>,
    ) => {
      const status = error.response?.status
      const data = error.response?.data
      const message =
        data?.error ||
        data?.message ||
        error.message ||
        'An unexpected error occurred'

      if (status === 400) {
        throw new BadRequestException(message)
      } else if (status === 401) {
        throw new UnauthorizedException(message)
      } else if (status === 403) {
        throw new ForbiddenException(message)
      } else if (status === 404) {
        throw new NotFoundException(message)
      } else if (status === 409) {
        throw new ConflictException(message)
      } else if (status === 422) {
        throw new ValidationException(message, data?.field)
      } else if (status === 500) {
        throw new InternalException(message)
      } else if (status && status >= 500) {
        throw new InternalException(message)
      }

      // For network errors or other axios errors
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new TimeoutException(message, data?.operation, data?.duration)
      }

      // Default fallback
      throw new InternalException(message)
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
          throw new UnauthorizedException('No authentication token available')
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
