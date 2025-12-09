import { Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent } from '../ui/card'
import { ImagePlaceholder } from '@/components/items/ImagePlaceholder'
import { DisplayType } from '@/lib/enums/display-type.enum'

import type { ProductResponseDto } from '@/lib/data/generated'

export function ItemCard({
  item,
  displayType,
}: {
  item: ProductResponseDto
  displayType: DisplayType
}): React.JSX.Element {
  const { t } = useTranslation()
  const price = item.standard_price ?? 0

  if (displayType === DisplayType.LIST) {
    return (
      <Card className="flex gap-4 p-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
          <ImagePlaceholder icon={Package} iconSize={'sm'} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-gray-900">{item.name}</h3>
          <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
            <span>SKU: {item.sku}</span>
            <span>
              {t('items.price')}: ${price.toLocaleString()}
            </span>
          </div>
          {!!item.description && (
            <p className="mt-2 truncate text-xs text-gray-500">
              {item.description}
            </p>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="aspect-square w-full overflow-hidden bg-gray-100">
        <ImagePlaceholder icon={Package} iconSize={'lg'} />
      </div>
      <CardContent className="pt-4">
        <h3 className="mb-1 truncate font-medium text-gray-900">{item.name}</h3>
        <p className="mb-2 text-xs text-gray-500">{item.sku}</p>
        <div className="space-y-1 text-sm text-gray-600">
          <p className="font-medium text-gray-900">${price.toLocaleString()}</p>
          {item.description !== null && item.description.length > 0 && (
            <p className="line-clamp-2 text-xs text-gray-500">
              {item.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
