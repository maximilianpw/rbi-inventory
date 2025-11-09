'use client'
import { useListProducts } from '@/lib/data/generated'
import { Spinner } from '../ui/spinner'

export function ProductList() {
  const { data: products, isLoading, error } = useListProducts()

  if (isLoading) {
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

  if (!products || products.length === 0) {
    return <p className="text-muted-foreground">No products found</p>
  }

  return (
    <div className="grid gap-4">
      {products.map((product) => (
        <div key={product.id} className="rounded-lg border p-4">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.sku}</p>
          {product.description && (
            <p className="mt-2 text-sm">{product.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}
