'use client'
import { CategoriesList } from '@/lib/data/components/categories'
import { CategoryCard } from '../common/category/CategoryCard'
import { Spinner } from '../ui/spinner'

export function ProductList() {
  return (
    <CategoriesList
      renderItem={(cat) => <CategoryCard key={cat.id} category={cat} />}
      fallback={<Spinner className="size-8" />}
    />
  )
}
