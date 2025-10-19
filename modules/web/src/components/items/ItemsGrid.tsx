import clsx from 'clsx'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { DisplayType } from '@/lib/enums/display-type.enum'

interface ItemsGridProps {
  items: Array<any>
  displayType: DisplayType
  renderItem: (item: any) => ReactNode
  emptyMessage?: string
  searchQuery?: string
}

export function ItemsGrid({
  items,
  displayType,
  renderItem,
  emptyMessage,
  searchQuery = '',
}: ItemsGridProps) {
  const { t } = useTranslation()

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Search}
        message={
          searchQuery
            ? t('items.noItemsFound')
            : emptyMessage || t('items.noItemsFound')
        }
        description={searchQuery ? t('search.help') : undefined}
      />
    )
  }

  return (
    <div
      className={clsx(
        displayType === DisplayType.GRID
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'flex flex-col gap-3',
      )}
    >
      {items.map((item) => renderItem(item))}
    </div>
  )
}
