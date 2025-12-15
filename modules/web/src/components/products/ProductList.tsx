'use client'
import { useTranslation } from 'react-i18next'
import { Spinner } from '../ui/spinner'
import { useListProducts, useGetProductsByCategory } from '@/lib/data/generated'

interface ProductListProps {
  categoryId?: string | null
}

export function ProductList({
  categoryId,
}: ProductListProps): React.JSX.Element {
  const { t } = useTranslation()
  const {
    data: allProducts,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useListProducts({})

  const {
    data: categoryProducts,
    isLoading: isLoadingCategory,
    error: errorCategory,
  } = useGetProductsByCategory(categoryId ?? '', {
    query: { enabled: !!categoryId },
  })

  const products =
    categoryId !== null && categoryId !== undefined
      ? categoryProducts
      : allProducts?.data
  const isLoading =
    categoryId !== null && categoryId !== undefined
      ? isLoadingCategory
      : isLoadingAll
  const error =
    categoryId !== null && categoryId !== undefined ? errorCategory : errorAll

  if (isLoading === true) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-destructive">
        {t('products.errorLoading')} {error.error}
      </p>
    )
  }

  if (products?.length === 0) {
    return <p className="text-muted-foreground">{t('products.noProducts')}</p>
  }

  return (
    <div className="grid gap-4">
      {products?.map((product) => (
        <div key={product.id} className="rounded-lg border p-4">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-muted-foreground text-sm">{product.sku}</p>
        </div>
      ))}
    </div>
  )
}
