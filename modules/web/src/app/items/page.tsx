'use client'

import CategorySidebar from '@/components/common/FolderSidebar'
import { ActionButtons } from '@/components/items/ActionButtons'
import { DisplayTypeToggle } from '@/components/items/DisplayTypeToggle'
import { ItemCard } from '@/components/items/ItemCard'
import { ItemsGrid } from '@/components/items/ItemsGrid'
import { SearchBar } from '@/components/items/SearchBar'
import type { SortOption } from '@/components/items/SortSelect'
import { SortSelect } from '@/components/items/SortSelect'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { sampleFolders } from '@/lib/data/routes/folders'
import { sampleItems } from '@/lib/data/routes/item'
import { DisplayType } from '@/lib/enums/display-type.enum'
import { SortField } from '@/lib/enums/sort-field.enum'
import { findFolderPath } from '@/lib/utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const useSortOptions = (): Array<SortOption> => {
  const { t } = useTranslation()

  return [
    { value: SortField.NAME, label: t('sort.name') },
    { value: SortField.QUANTITY, label: t('sort.quantity') },
    { value: SortField.VALUE, label: t('sort.value') },
  ]
}

export default function ItemsPage() {
  const { t } = useTranslation()
  const sortOptions = useSortOptions()
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState(SortField.NAME)
  const [displayType, setDisplayType] = useState<DisplayType>(DisplayType.GRID)
  const [items, setItems] = useState(sampleItems)

  const breadcrumbPath = selectedFolderId
    ? findFolderPath(sampleFolders, selectedFolderId) || []
    : []

  const filteredItems = items.filter(
    (item) =>
      (!selectedFolderId || item.folderId === selectedFolderId) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === SortField.NAME) return a.name.localeCompare(b.name)
    if (sortBy === SortField.QUANTITY) return b.quantity - a.quantity
    return b.value - a.value
  })

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => setSelectedFolderId(undefined)}
                  className="cursor-pointer"
                >
                  All Items
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbPath.map((folder, index) => (
                <div key={index}>
                  <BreadcrumbSeparator key={`sep-${folder.id}`} />
                  <BreadcrumbItem key={folder.id}>
                    {index === breadcrumbPath.length - 1 ? (
                      <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        onClick={() => setSelectedFolderId(folder.id)}
                        className="cursor-pointer"
                      >
                        {folder.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <ActionButtons />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center gap-2">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('search.itemsPlaceholder')}
              className="flex-1"
            />
            <SortSelect
              value={sortBy}
              onChange={(value) => setSortBy(value as SortField)}
              options={sortOptions}
            />
            <DisplayTypeToggle value={displayType} onChange={setDisplayType} />
          </div>
          <div className="flex-1 overflow-auto">
            <ItemsGrid
              items={sortedItems}
              displayType={displayType}
              renderItem={(item) => (
                <ItemCard key={item.id} item={item} displayType={displayType} />
              )}
              emptyMessage={t('items.noItemsFolder')}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
