import type { QueryClient } from '@tanstack/react-query'
import {
  getListLocationsQueryOptions,
  getListAllLocationsQueryOptions,
  getAreasControllerFindAllQueryOptions,
  getListInventoryQueryOptions,
  type ListLocationsParams,
  type ListInventoryParams,
} from '@/lib/data/generated'

/**
 * Loader helper for locations page
 * Prefetches location data based on search params
 */
export async function prefetchLocationsData(
  queryClient: QueryClient,
  search: {
    q?: string
    type?: ListLocationsParams['type']
    page?: number
  },
  pageSize: number,
): Promise<void> {
  const params: ListLocationsParams = {
    page: search.page ?? 1,
    limit: pageSize,
  }

  if (search.q) {
    params.search = search.q
  }

  if (search.type) {
    params.type = search.type
  }

  await queryClient.ensureQueryData(getListLocationsQueryOptions(params))
}

/**
 * Loader helper for inventory page
 * Prefetches locations, areas (if location selected), and inventory data
 */
export async function prefetchInventoryData(
  queryClient: QueryClient,
  search: {
    location?: string
    area?: string
    q?: string
    low?: boolean
    expiring?: boolean
    page?: number
  },
  pageSize: number,
): Promise<void> {
  // Always fetch all locations for the sidebar
  await queryClient.ensureQueryData(getListAllLocationsQueryOptions())

  // If a location is selected, prefetch its areas
  if (search.location) {
    await queryClient.ensureQueryData(
      getAreasControllerFindAllQueryOptions({
        location_id: search.location,
      }),
    )
  }

  // Build inventory query params
  const params: ListInventoryParams = {
    page: search.page ?? 1,
    limit: pageSize,
  }

  if (search.area) {
    params.area_id = search.area
  } else if (search.location) {
    params.location_id = search.location
  }

  if (search.q) {
    params.search = search.q
  }

  if (search.low) {
    params.low_stock = true
  }

  if (search.expiring) {
    params.expiring_soon = true
  }

  // Prefetch inventory data
  await queryClient.ensureQueryData(getListInventoryQueryOptions(params))
}
