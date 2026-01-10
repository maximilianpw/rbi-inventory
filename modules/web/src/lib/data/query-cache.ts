import type { QueryClient, QueryKey } from '@tanstack/react-query'

import type { PaginationMetaDto } from '@/lib/data/generated'

export type QuerySnapshot<T> = Array<[QueryKey, T | undefined]>

export function snapshotQueryData<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
): QuerySnapshot<T> {
  return queryClient.getQueriesData<T>({ queryKey })
}

export function restoreQueryData<T>(
  queryClient: QueryClient,
  snapshot: QuerySnapshot<T>,
): void {
  for (const [key, data] of snapshot) {
    queryClient.setQueryData(key, data)
  }
}

export function removeItemFromPaginated<T extends { id: string }>(
  data: { data: T[]; meta?: PaginationMetaDto } | undefined,
  id: string,
): { data: T[]; meta?: PaginationMetaDto } | undefined {
  if (!data) {
    return data
  }
  const next = data.data.filter((item) => item.id !== id)
  if (next.length === data.data.length) {
    return data
  }
  return {
    ...data,
    data: next,
    meta: data.meta
      ? {
          ...data.meta,
          total: Math.max(0, data.meta.total - 1),
        }
      : data.meta,
  }
}

export function removeItemFromArray<T extends { id: string }>(
  data: T[] | undefined,
  id: string,
): T[] | undefined {
  if (!data) {
    return data
  }
  const next = data.filter((item) => item.id !== id)
  return next.length === data.length ? data : next
}
