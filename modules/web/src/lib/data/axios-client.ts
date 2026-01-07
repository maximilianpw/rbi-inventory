import axios, { type AxiosRequestConfig } from 'axios'

import { env } from '@/lib/env'

const API_BASE_URL = env.VITE_API_BASE_URL

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let getToken: (() => Promise<string | null>) | undefined

export function initializeAuth(
  tokenGetter: () => Promise<string | null>,
): void {
  getToken = tokenGetter
}

export const setTokenGetter = initializeAuth

export async function getAxiosInstance<T>(
  config: AxiosRequestConfig,
): Promise<T> {
  if (getToken) {
    try {
      const token = await getToken()
      if (token !== null && token.length > 0) {
        // eslint-disable-next-line no-param-reassign
        config.headers ??= {
          'Content-Type': 'application/json',
        }
        // eslint-disable-next-line no-param-reassign
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Failed to get auth token:', error)
    }
  }

  const response = await axiosInstance.request<T>(config)
  return response.data
}
