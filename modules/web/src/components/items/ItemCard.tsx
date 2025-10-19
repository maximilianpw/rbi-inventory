import { Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Item } from '@/data/types/item'
import { Card, CardContent, CardImage } from '@/components/common/Card'
import { ImagePlaceholder } from '@/components/items/ImagePlaceholder'
import { DisplayType } from '@/lib/enums/display-type.enum'

export function ItemCard({
  item,
  displayType,
}: {
  item: Item
  displayType: DisplayType
}) {
  const { t } = useTranslation()
  if (displayType === DisplayType.LIST) {
    return (
      <Card hoverable className="p-4 flex items-center gap-4">
        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImagePlaceholder icon={Package} iconSize={'sm'} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <span>
              {t('items.quantity')}: {item.quantity}
            </span>
            <span>
              {t('items.totalValue')}: $
              {(item.value * item.quantity).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card hoverable className="overflow-hidden">
      <CardImage
        src={item.image}
        alt={item.name}
        aspectRatio={'square'}
        placeholder={<ImagePlaceholder icon={Package} iconSize={'lg'} />}
      />
      <CardContent>
        <h3 className="font-medium text-gray-900 truncate mb-2">{item.name}</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            {t('items.quantity')}: {item.quantity}
          </p>
          <p className="font-medium text-gray-900">
            {t('items.totalValue')}: $
            {(item.value * item.quantity).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
