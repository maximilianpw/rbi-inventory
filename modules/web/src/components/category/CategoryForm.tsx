import z from 'zod'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '../ui/field'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { CategorySelector } from './CategorySelector'
import {
  useCreateCategory,
  getListCategoriesQueryKey,
  type CategoryResponseDto,
  type CategoryWithChildrenResponseDto,
} from '@/lib/data/generated'

interface CategoryFormProps {
  categories?: CategoryWithChildrenResponseDto[]
  onSuccess?: () => void
}

interface CategoryWithPath extends CategoryResponseDto {
  path: string
}

function flattenCategoriesWithPath(
  categories: CategoryWithChildrenResponseDto[],
  separator: string = ' > ',
): CategoryWithPath[] {
  const result: CategoryWithPath[] = []

  function traverse(
    categories: CategoryWithChildrenResponseDto[],
    parentPath: string = '',
  ) {
    for (const cat of categories) {
      const currentPath = parentPath ? `${parentPath}${separator}${cat.name}` : cat.name
      result.push({ ...cat, path: currentPath })
      if (cat.children.length > 0) {
        traverse(cat.children, currentPath)
      }
    }
  }

  traverse(categories)
  return result
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be longer than 1 character')
    .max(100, 'Name must be shorter than 100 characters'),
  parent_id: z.string().optional(),
  description: z
    .string()
    .max(500, 'Description must be shorter than 500 characters')
    .optional(),
})

function useCategoryForm(
  categories: CategoryWithChildrenResponseDto[] | undefined,
  onSuccess?: () => void,
) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const mutation = useCreateCategory({
    mutation: {
      onSuccess: async () => {
        toast.success(
          t('form.categoryCreated') || 'Category created successfully',
        )
        await queryClient.invalidateQueries({
          queryKey: getListCategoriesQueryKey(),
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('form.categoryError') || 'Failed to create category')
        console.error('Category creation error:', error)
      },
    },
  })

  // Helper to check if category name + parent combination exists
  const isDuplicateCategory = (name: string, parentId: string): boolean => {
    if (!categories) return false

    const normalizedName = name.trim().toLowerCase()
    const normalizedParentId = parentId === '' ? null : parentId

    const allCategories = flattenCategoriesWithPath(categories)
    return allCategories.some(
      (cat) =>
        cat.name.toLowerCase() === normalizedName &&
        (cat.parent_id === null ? null : cat.parent_id.toString()) ===
          normalizedParentId,
    )
  }

  return useForm({
    defaultValues: {
      name: '',
      parent_id: '',
      description: '',
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = formSchema.safeParse(value)
        if (!result.success) {
          return result.error.format()
        }

        // Check for duplicate category
        if (isDuplicateCategory(value.name, value.parent_id || '')) {
          return {
            form:
              t('form.categoryDuplicateError') ||
              'A category with this name already exists under the selected parent',
          }
        }

        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        parent_id:
          value.parent_id && value.parent_id !== '' ? value.parent_id : null,
        description:
          value.description && value.description !== ''
            ? value.description
            : null,
      }

      await mutation.mutateAsync({
        data: payload,
      })
    },
  })
}

export function CategoryForm({
  categories,
  onSuccess,
}: CategoryFormProps): React.JSX.Element {
  const { t } = useTranslation()
  const form = useCategoryForm(categories, onSuccess)

  return (
    <form
      id="create-category-form"
      onSubmit={async (e) => {
        e.preventDefault()
        await form.handleSubmit()
      }}
    >
      {form.state.errors.length > 0 && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
          {form.state.errors.join(', ')}
        </div>
      )}
      <FieldGroup>
        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('form.categoryName')}
              </FieldLabel>
              <FieldContent>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="parent_id">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('form.parentCategory')}
              </FieldLabel>
              <FieldContent>
                {!!categories && (
                  <CategorySelector
                    value={field.state.value}
                    categories={[
                      { value: '', label: t('form.noParent') },
                      ...flattenCategoriesWithPath(categories).map((cat) => ({
                        value: cat.id.toString(),
                        label: cat.path,
                      })),
                    ]}
                    onValueChange={field.handleChange}
                  />
                )}
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('form.description')}
              </FieldLabel>
              <FieldContent>
                <Textarea
                  aria-invalid={field.state.meta.errors.length > 0}
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>
      </FieldGroup>
    </form>
  )
}
