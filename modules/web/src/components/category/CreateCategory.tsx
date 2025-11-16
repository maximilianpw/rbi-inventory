import { CategoryForm } from './CategoryForm'
import { Button } from '@/components/ui/button'
import type { CategoryWithChildrenResponse } from '@/lib/data/generated'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface CreateCategoryProps {
  categories?: CategoryWithChildrenResponse[]
}

export function CreateCategory({
  categories,
}: CreateCategoryProps): React.JSX.Element {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Category</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your inventory.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm categories={categories} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
