import type { CategoryResponse } from '@/lib/data/generated'

interface CategoryCardProps {
  category: CategoryResponse
}

export function CategoryCard({
  category,
}: CategoryCardProps): React.JSX.Element {
  return (
    <div className="group mb-1 cursor-pointer rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-gray-300 hover:shadow-sm">
      <h4 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
        {category.name}
      </h4>
      {category.description !== null &&
        category.description !== undefined &&
        category.description.length > 0 && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
            {category.description}
          </p>
        )}
    </div>
  )
}
