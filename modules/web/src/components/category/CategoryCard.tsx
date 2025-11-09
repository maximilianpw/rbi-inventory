import { Card, CardContent } from '@/components/ui/card'
import type { CategoryResponse } from '@/lib/data/generated'

interface CategoryCardProps {
  category: CategoryResponse
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-0">
        <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
        {category.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {category.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
