import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { env } from '@/lib/env'

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL

export function createAxiosInstance(
  getToken?: () => Promise<string | null>,
): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor to add authentication token from Clerk
  instance.interceptors.request.use(
    async (config) => {
      // Get the token from Clerk if available
      try {
        const token = getToken ? await getToken() : null
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        // Token retrieval failed, continue without it
        console.error('Failed to get Clerk token:', error)
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  return instance
}

let cachedInstance: AxiosInstance | null = null
let tokenGetter: (() => Promise<string | null>) | null = null

export function setTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter
}

function getInstance(): AxiosInstance {
  if (!cachedInstance) {
    cachedInstance = createAxiosInstance(async () => {
      return tokenGetter ? await tokenGetter() : null
    })
  }
  return cachedInstance
}

export async function getAxiosInstance<T>(
  config: AxiosRequestConfig,
): Promise<T> {
  const instance = getInstance()
  const response = await instance.request<T>(config)
  return response.data
}
