import { Card, CardContent } from '@/components/ui/card'

import type { CategoryResponse } from '@/lib/data/generated'

interface CategoryCardProps {
  category: CategoryResponse
}

export function CategoryCard({
  category,
}: CategoryCardProps): React.JSX.Element {
  return (
    <Card className="cursor-pointer p-4 transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <h3 className="mb-2 text-lg font-semibold">{category.name}</h3>
        {category.description !== null &&
          category.description !== undefined &&
          category.description.length > 0 && (
            <p className="line-clamp-2 text-sm text-gray-600">
              {category.description}
            </p>
          )}
      </CardContent>
    </Card>
  )
}
