import clsx from 'clsx'

import type { ReactNode } from 'react'
import { DisplayType } from '@/lib/enums/display-type.enum'

interface ItemsGridProps<T> {
  items: T[]
  displayType: DisplayType
  renderItem: (item: T) => ReactNode
  emptyMessage?: string
  searchQuery?: string
}

export function ItemsGrid<T>({
  items,
  displayType,
  renderItem,
}: ItemsGridProps<T>): React.JSX.Element {
  return (
    <div
      className={clsx(
        displayType === DisplayType.GRID
          ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'flex flex-col gap-3',
      )}
    >
      {items.map(async (item) => renderItem(item))}
    </div>
  )
}
