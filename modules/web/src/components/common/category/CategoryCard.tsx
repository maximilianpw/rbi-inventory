import { Card } from '@/components/ui/card'
import { Category } from '@/lib/data/types'

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  return <Card>{category.name}</Card>
}
