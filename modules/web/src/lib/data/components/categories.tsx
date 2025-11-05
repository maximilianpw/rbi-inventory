'use client'
import { useQuery } from '@tanstack/react-query'
import { API_ENDPOINTS } from '../routes'
import { useApiClient } from '../api'
import { Category } from '../types'

export function useCategoryQuery() {
  const router = useApiClient()
  const route = API_ENDPOINTS.categories.list

  return useQuery({
    queryKey: ['categories'],
    queryFn: () => router.get<Array<Category>>(route),
  })
}

export function CategoriesData({
  children,
}: {
  children: (data: Array<Category>) => React.ReactNode
}) {
  const { data, isLoading, error } = useCategoryQuery()

  if (isLoading) return null
  if (error) return null
  if (!data) return null

  return <>{children(data)}</>
}

export function CategoriesList({
  renderItem,
  fallback,
}: {
  renderItem: (category: Category, index: number) => React.ReactNode
  fallback?: React.ReactNode
}) {
  const { data, isLoading, error } = useCategoryQuery()

  if (isLoading) return fallback ?? null
  if (error) return fallback ?? null
  if (!data) return fallback ?? null

  return <>{data.map(renderItem)}</>
}
