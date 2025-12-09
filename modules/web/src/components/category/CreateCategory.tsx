import { useTranslation } from 'react-i18next'
import { CategoryForm } from './CategoryForm'
import { Button } from '@/components/ui/button'
import type { CategoryWithChildrenResponseDto } from '@/lib/data/generated'
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
  categories?: CategoryWithChildrenResponseDto[]
}

export function CreateCategory({
  categories,
}: CreateCategoryProps): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-t-none" variant="outline">
          {t('form.createCategoryTitle')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('form.createCategoryTitle')}</DialogTitle>
          <DialogDescription>
            {t('form.createCategoryDescription')}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm categories={categories} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('form.cancel')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
