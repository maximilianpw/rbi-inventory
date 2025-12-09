'use client'
import * as React from 'react'

import { useTranslation } from 'react-i18next'

import { NestedCategory } from './NestedCategory'
import { CreateCategory } from './CreateCategory'
import { Spinner } from '@/components/ui/spinner'
import { useListCategories } from '@/lib/data/generated'

interface CategorySidebarProps {
  selectedCategoryId: string | null
  onSelectCategory: (categoryId: string | null) => void
}

export default function CategorySidebar({
  selectedCategoryId,
  onSelectCategory,
}: CategorySidebarProps): React.JSX.Element {
  const { t } = useTranslation()
  const { data, isLoading, error } = useListCategories()
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())

  const handleToggle = (id: string): void => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelect = (id: string): void => {
    onSelectCategory(id)
  }

  return (
    <aside className="bg-background flex h-full w-64 flex-col border-r">
      {<CreateCategory categories={data} />}
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold">{t('folders.title')}</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {isLoading === true && (
          <div className="flex justify-center py-8">
            <Spinner className="size-6" />
          </div>
        )}
        {error != null && (
          <div className="p-4 text-center text-sm text-red-600">
            {t('folders.error')}
          </div>
        )}
        {data?.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500">
            {t('folders.empty')}
          </div>
        )}
        {!!data && (
          <>
            {data.map((category) => (
              <NestedCategory
                key={category.id}
                category={category}
                expandedIds={expandedIds}
                selectedId={selectedCategoryId}
                onSelect={handleSelect}
                onToggle={handleToggle}
              />
            ))}
          </>
        )}
      </nav>
    </aside>
  )
}
