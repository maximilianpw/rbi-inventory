import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SortOption } from '@/components/items/SortSelect'
import Breadcrumbs from '@/components/common/Breadcrumbs'
import FolderSidebar from '@/components/common/FolderSidebar'
import { ActionButtons } from '@/components/items/ActionButtons'
import { DisplayTypeToggle } from '@/components/items/DisplayTypeToggle'
import { ItemCard } from '@/components/items/ItemCard'
import { ItemsGrid } from '@/components/items/ItemsGrid'
import { SearchBar } from '@/components/items/SearchBar'
import { SortSelect } from '@/components/items/SortSelect'
import { sampleFolders } from '@/data/routes/folders'
import { sampleItems } from '@/data/routes/item'
import { DisplayType } from '@/lib/enums/display-type.enum'
import { SortField } from '@/lib/enums/sort-field.enum'
import { findFolderPath } from '@/lib/utils'

export const Route = createFileRoute('/_authed/items')({
  component: ItemsPage,
})

const fetchItems = createServerFn({
  method: 'GET',
}).handler(() => sampleItems)

const useSortOptions = (): Array<SortOption> => {
  const { t } = useTranslation()

  return [
    { value: SortField.NAME, label: t('sort.name') },
    { value: SortField.QUANTITY, label: t('sort.quantity') },
    { value: SortField.VALUE, label: t('sort.value') },
  ]
}

async function ItemsPage() {
  const { t } = useTranslation()
  const sortOptions = useSortOptions()
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState(SortField.NAME)
  const [displayType, setDisplayType] = useState<DisplayType>(DisplayType.GRID)

  const breadcrumbPath = selectedFolderId
    ? findFolderPath(sampleFolders, selectedFolderId) || []
    : []

  const items = await fetchItems()

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
            <Breadcrumbs
              path={breadcrumbPath}
              setSelectedFolderId={setSelectedFolderId}
            />
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
