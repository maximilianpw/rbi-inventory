'use client'
import { Spinner } from '../ui/spinner'
import { useListProducts } from '@/lib/data/generated'

export function ProductList(): React.JSX.Element {
  const { data: products, isLoading, error } = useListProducts()

  if (isLoading === true) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-destructive">Error loading products: {error.error}</p>
    )
  }

  if (products?.length === 0) {
    return <p className="text-muted-foreground">No products found</p>
  }

  return (
    <div className="grid gap-4">
      {products?.map((product) => (
        <div key={product.id} className="rounded-lg border p-4">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-muted-foreground text-sm">{product.sku}</p>
          {product.description !== null &&
            product.description !== undefined &&
            product.description.length > 0 && (
              <p className="mt-2 text-sm">{product.description}</p>
            )}
        </div>
      ))}
    </div>
  )
}
