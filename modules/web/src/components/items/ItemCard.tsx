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
        <div className="bg-muted h-16 w-16 shrink-0 overflow-hidden rounded-md">
          <ImagePlaceholder icon={Package} iconSize={'sm'} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-foreground truncate font-medium">{item.name}</h3>
          <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
            <span>SKU: {item.sku}</span>
            <span>
              {t('items.price')}: ${price.toLocaleString()}
            </span>
          </div>
          {!!item.description && (
            <p className="text-muted-foreground mt-2 truncate text-xs">
              {String(item.description)}
            </p>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="bg-muted aspect-square w-full overflow-hidden">
        <ImagePlaceholder icon={Package} iconSize={'lg'} />
      </div>
      <CardContent className="pt-4">
        <h3 className="text-foreground mb-1 truncate font-medium">
          {item.name}
        </h3>
        <p className="text-muted-foreground mb-2 text-xs">{item.sku}</p>
        <div className="text-muted-foreground space-y-1 text-sm">
          <p className="text-foreground font-medium">
            ${price.toLocaleString()}
          </p>
          {!!item.description && String(item.description).length > 0 && (
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {String(item.description)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
