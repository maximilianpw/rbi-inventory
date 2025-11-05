import CategorySidebar from '@/components/common/FolderSidebar'
import { ProductList } from '@/components/products/ProductList'

export default function ProductPage() {
  return (
    <div className="p-4">
      <CategorySidebar />
      <ProductList />
    </div>
  )
}
