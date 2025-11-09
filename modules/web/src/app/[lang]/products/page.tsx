import CategorySidebar from '@/components/category/CategorySidebar'
import { ProductList } from '@/components/products/ProductList'

export default async function ProductPage() {
  return (
    <div className="flex h-full w-full">
      <CategorySidebar />
      <div className="flex-1 overflow-auto p-4">
        <ProductList />
      </div>
    </div>
  )
}
