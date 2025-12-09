'use client'
import * as React from 'react'
import CategorySidebar from '@/components/category/CategorySidebar'
import { ProductList } from '@/components/products/ProductList'

export default function ProductPage(): React.JSX.Element {
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<
    string | null
  >(null)

  return (
    <div className="flex h-full w-full">
      <CategorySidebar
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />
      <div className="flex-1 overflow-auto p-4">
        <ProductList categoryId={selectedCategoryId} />
      </div>
    </div>
  )
}
