import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SortOption } from '@/components/items/SortSelect'
import FolderSidebar from '@/components/common/FolderSidebar'
import { ActionButtons } from '@/components/items/ActionButtons'
import { DisplayTypeToggle } from '@/components/items/DisplayTypeToggle'
import { ItemCard } from '@/components/items/ItemCard'
import { ItemsGrid } from '@/components/items/ItemsGrid'
import { SearchBar } from '@/components/items/SearchBar'
import { SortSelect } from '@/components/items/SortSelect'
import { fetchItems } from '@/lib/items'
import { sampleFolders } from '@/data/routes/folders'
import { DisplayType } from '@/lib/enums/display-type.enum'
import { SortField } from '@/lib/enums/sort-field.enum'
import { findFolderPath } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const Route = createFileRoute('/_authed/items')({
  component: ItemsPage,
  loader: async () => {
    const response = await fetchItems()
    return response
  },
})

const useSortOptions = (): Array<SortOption> => {
  const { t } = useTranslation()

  return [
    { value: SortField.NAME, label: t('sort.name') },
    { value: SortField.QUANTITY, label: t('sort.quantity') },
    { value: SortField.VALUE, label: t('sort.value') },
  ]
}

function ItemsPage() {
  const { t } = useTranslation()
  const sortOptions = useSortOptions()
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState(SortField.NAME)
  const [displayType, setDisplayType] = useState<DisplayType>(DisplayType.GRID)

  const breadcrumbPath = selectedFolderId
    ? findFolderPath(sampleFolders, selectedFolderId) || []
    : []

  const items = Route.useLoaderData()

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
    <div className="page-container">
      <FolderSidebar
        folders={sampleFolders}
        selectedId={selectedFolderId}
        onSelect={setSelectedFolderId}
      />
      <div className="page-content">
        <div className="page-header">
          <div className="header-actions-row">
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
                  <>
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
                  </>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            <ActionButtons className="action-group" />
          </div>

          <div className="filters-row">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('search.itemsPlaceholder')}
            />
            <SortSelect
              value={sortBy}
              onChange={(value) => setSortBy(value as SortField)}
              options={sortOptions}
            />
            <DisplayTypeToggle value={displayType} onChange={setDisplayType} />
          </div>
        </div>

        <div className="content-section">
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
  )
}
