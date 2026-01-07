import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { LocationCard } from './LocationCard'
import { LocationCardSkeleton } from './LocationCardSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import {
  useListAllLocations,
  type LocationResponseDto,
} from '@/lib/data/generated'

interface LocationListProps {
  typeFilter?: string | null
  searchQuery?: string
  onSelectLocation?: (location: LocationResponseDto) => void
}

export function LocationList({
  typeFilter,
  searchQuery,
  onSelectLocation,
}: LocationListProps): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: locations, isLoading, error } = useListAllLocations()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <LocationCardSkeleton key={`skeleton-${String(i)}`} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState message={t('locations.errorLoading') || 'Error loading locations'} />
    )
  }

  let filteredLocations = locations ?? []

  if (typeFilter) {
    filteredLocations = filteredLocations.filter(
      (loc) => loc.type === typeFilter
    )
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    const toStr = (value: unknown): string =>
      typeof value === 'string' ? value : ''
    filteredLocations = filteredLocations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        toStr(loc.address).toLowerCase().includes(query) ||
        toStr(loc.contact_person).toLowerCase().includes(query)
    )
  }

  if (filteredLocations.length === 0) {
    return (
      <EmptyState message={t('locations.noLocations') || 'No locations found'} />
    )
  }

  const handleClick = (location: LocationResponseDto): void => {
    onSelectLocation?.(location)
    void navigate({ to: '/locations/$id', params: { id: location.id } })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredLocations.map((location) => (
        <LocationCard
          key={location.id}
          location={location}
          onClick={() => handleClick(location)}
        />
      ))}
    </div>
  )
}
