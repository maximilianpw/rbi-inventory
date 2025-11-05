'use client'
import { CategoriesList } from '@/lib/data/components/categories'
import { CategoryCard } from '../common/category/CategoryCard'

export function ProductList() {
  return (
    <CategoriesList
      renderItem={(cat) => <CategoryCard key={cat.id} category={cat} />}
    />
  )
}
