import * as React from 'react'

import { CategoryCard } from './CategoryCard'
import type { CategoryWithChildrenResponse } from '@/lib/data/generated'

interface NestedCategoryProps {
  category: CategoryWithChildrenResponse
  depth?: number
}

export function NestedCategory({
  category,
  depth = 0,
}: NestedCategoryProps): React.JSX.Element {
  const paddingClass = {
    0: 'pl-0',
    1: 'pl-4',
    2: 'pl-8',
    3: 'pl-12',
    4: 'pl-16',
  }[depth] ?? 'pl-20'

  return (
    <div>
      <div className={paddingClass}>
        <CategoryCard category={category} />
      </div>
      {category.children?.length > 0 && (
        <div>
          {category.children.map((child) => (
            <NestedCategory key={child.id} category={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
