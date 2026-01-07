import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Search, AlertTriangle, Clock } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { CreateInventory } from '@/components/inventory/CreateInventory'
import { LocationAreaSidebar } from '@/components/inventory/LocationAreaSidebar'
import { InventoryTable } from '@/components/inventory/InventoryTable'
import type { ListInventoryParams } from '@/lib/data/generated'

export const Route = createFileRoute('/inventory')({
  component: InventoryPage,
})

function InventoryPage(): React.JSX.Element {
  const { t } = useTranslation()
  const [selectedLocationId, setSelectedLocationId] = React.useState<string | null>(null)
  const [selectedAreaId, setSelectedAreaId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showLowStock, setShowLowStock] = React.useState(false)
  const [showExpiringSoon, setShowExpiringSoon] = React.useState(false)

  const handleSelect = (locationId: string | null, areaId: string | null): void => {
    setSelectedLocationId(locationId)
    setSelectedAreaId(areaId)
  }

  const filters = React.useMemo(() => {
    const f: Partial<ListInventoryParams> = {}
    if (selectedAreaId) {
      f.area_id = selectedAreaId
    } else if (selectedLocationId) {
      f.location_id = selectedLocationId
    }
    if (searchQuery) {
      f.search = searchQuery
    }
    if (showLowStock) {
      f.low_stock = true
    }
    if (showExpiringSoon) {
      f.expiring_soon = true
    }
    return f
  }, [selectedLocationId, selectedAreaId, searchQuery, showLowStock, showExpiringSoon])

  const currentTitle = React.useMemo(() => {
    if (selectedAreaId) {
      return t('inventory.areaInventory') || 'Area Inventory'
    }
    if (selectedLocationId) {
      return t('inventory.locationInventory') || 'Location Inventory'
    }
    return t('inventory.allInventory') || 'All Inventory'
  }, [selectedLocationId, selectedAreaId, t])

  return (
    <div className="flex h-full w-full">
      <LocationAreaSidebar
        selectedAreaId={selectedAreaId}
        selectedLocationId={selectedLocationId}
        onSelect={handleSelect}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">{currentTitle}</h1>
            <p className="text-muted-foreground text-sm">
              {t('inventory.subtitle') || 'Track product quantities across locations'}
            </p>
          </div>
          <CreateInventory
            defaultAreaId={selectedAreaId ?? undefined}
            defaultLocationId={selectedLocationId ?? undefined}
          />
        </div>

        <div className="flex items-center gap-4 border-b px-6 py-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t('inventory.searchPlaceholder') || 'Search batch...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Toggle
            aria-label="Show low stock"
            pressed={showLowStock}
            size="sm"
            onPressedChange={setShowLowStock}
          >
            <AlertTriangle className="mr-1.5 size-4" />
            {t('inventory.lowStock') || 'Low Stock'}
          </Toggle>
          <Toggle
            aria-label="Show expiring soon"
            pressed={showExpiringSoon}
            size="sm"
            onPressedChange={setShowExpiringSoon}
          >
            <Clock className="mr-1.5 size-4" />
            {t('inventory.expiringSoon') || 'Expiring Soon'}
          </Toggle>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <InventoryTable filters={filters} />
        </div>
      </div>
    </div>
  )
}
