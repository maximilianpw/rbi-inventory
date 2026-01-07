import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Search, Filter } from 'lucide-react'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreateLocation } from '@/components/locations/CreateLocation'
import { LocationList } from '@/components/locations/LocationList'
import { LocationType } from '@/lib/enums/location-type.enum'

export const Route = createFileRoute('/locations')({
  component: LocationsPage,
})

const LOCATION_TYPES = [
  { value: 'ALL', label: 'All Types' },
  { value: LocationType.WAREHOUSE, label: 'Warehouse' },
  { value: LocationType.SUPPLIER, label: 'Supplier' },
  { value: LocationType.IN_TRANSIT, label: 'In Transit' },
  { value: LocationType.CLIENT, label: 'Client' },
]

function LocationsPage(): React.JSX.Element {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<string>('ALL')

  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {t('navigation.locations') || 'Locations'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('locations.subtitle') || 'Manage your storage locations and areas'}
            </p>
          </div>
          <CreateLocation />
        </div>
      </div>

      <div className="border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              className="pl-9"
              placeholder={t('locations.searchPlaceholder') || 'Search locations...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder={t('locations.filterByType') || 'Filter by type'} />
            </SelectTrigger>
            <SelectContent>
              {LOCATION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.value === 'ALL' && (t('locations.allTypes') || type.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <LocationList
          searchQuery={searchQuery}
          typeFilter={typeFilter === 'ALL' ? null : typeFilter}
        />
      </div>
    </div>
  )
}
