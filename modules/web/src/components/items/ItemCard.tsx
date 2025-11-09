import { Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../ui/card'
import { ImagePlaceholder } from '@/components/items/ImagePlaceholder'
import { DisplayType } from '@/lib/enums/display-type.enum'
import type { ProductResponse } from '@/lib/data/generated'

export function ItemCard({
  item,
  displayType,
}: {
  item: ProductResponse
  displayType: DisplayType
}) {
  const { t } = useTranslation()
  const price = item.standard_price ?? 0

  if (displayType === DisplayType.LIST) {
    return (
      <Card className="flex gap-4 p-4">
        <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-md overflow-hidden">
          <ImagePlaceholder icon={Package} iconSize={'sm'} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <span>SKU: {item.sku}</span>
            <span>
              {t('items.price')}: ${price.toLocaleString()}
            </span>
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 mt-2 truncate">
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
        <h3 className="font-medium text-gray-900 truncate mb-1">{item.name}</h3>
        <p className="text-xs text-gray-500 mb-2">{item.sku}</p>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-900">${price.toLocaleString()}</p>
          {item.description && (
            <p className="text-xs text-gray-500 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
