'use client'
import * as React from 'react'

import { useTranslation } from 'react-i18next'

import { NestedCategory } from './NestedCategory'
import { CreateCategory } from './CreateCategory'
import { Spinner } from '@/components/ui/spinner'
import { useListCategories } from '@/lib/data/generated'

export default function CategorySidebar(): React.JSX.Element {
  const { t } = useTranslation()
  const { data, isLoading, error } = useListCategories()

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
            {data.map((category, index) => (
              <NestedCategory key={index} category={category} />
            ))}
          </>
        )}
      </nav>
    </aside>
  )
}
