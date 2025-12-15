'use client'

import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { ActionButtons } from '@/components/items/ActionButtons'
import { DisplayTypeToggle } from '@/components/items/DisplayTypeToggle'
import { ItemCard } from '@/components/items/ItemCard'
import { ItemsGrid } from '@/components/items/ItemsGrid'
import { SearchBar } from '@/components/items/SearchBar'
import { SortSelect } from '@/components/items/SortSelect'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { useListProducts } from '@/lib/data/generated'
import { DisplayType } from '@/lib/enums/display-type.enum'
import { SortField } from '@/lib/enums/sort-field.enum'

import type { SortOption } from '@/components/items/SortSelect'

function useSortOptions(): SortOption[] {
  const { t } = useTranslation()

  return [
    { value: SortField.NAME, label: t('sort.name') },
    { value: SortField.QUANTITY, label: t('sort.quantity') },
    { value: SortField.VALUE, label: t('sort.value') },
  ]
}

export default function ItemsPage(): React.JSX.Element {
  const { t } = useTranslation()
  const sortOptions = useSortOptions()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState(SortField.NAME)
  const [displayType, setDisplayType] = useState<DisplayType>(DisplayType.GRID)

  const { data: productsResponse } = useListProducts()
  const items = productsResponse?.data ?? []

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === SortField.NAME) return a.name.localeCompare(b.name)
    // Sorting by quantity and value would need additional fields from API
    return 0
  })

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Products</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <ActionButtons />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center gap-2">
            <SearchBar
              className="flex-1"
              placeholder={t('search.itemsPlaceholder')}
              value={searchQuery}
              onChange={setSearchQuery}
            />
            <SortSelect
              options={sortOptions}
              value={sortBy}
              onChange={(value) => setSortBy(value as SortField)}
            />
            <DisplayTypeToggle value={displayType} onChange={setDisplayType} />
          </div>
          <div className="flex-1 overflow-auto">
            <ItemsGrid
              displayType={displayType}
              emptyMessage={t('items.noItemsFolder')}
              items={sortedItems}
              searchQuery={searchQuery}
              renderItem={(item) => (
                <ItemCard key={item.id} displayType={displayType} item={item} />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
