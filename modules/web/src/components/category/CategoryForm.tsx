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
import { Button } from '../ui/button'
import { CategorySelector } from './CategorySelector'
import {
  getListCategoriesQueryKey,
  useCreateCategory,
  type CategoryResponseDto,
} from '@/lib/data/generated'

interface CategoryFormProps {
  categories?: CategoryResponseDto[]
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be longer than 1 character')
    .max(100, 'Name must be shorter than 100 characters'),
  parent_id: z.string().optional(),
  description: z
    .string()
    .max(500, 'Description must be shorter than 500 characters'),
})

function useCategoryForm(queryClient: ReturnType<typeof useQueryClient>) {
  const { t } = useTranslation()
  const mutation = useCreateCategory({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getListCategoriesQueryKey(),
        })
        toast.success(t('form.categoryCreated'))
      },
      onError: () => {
        toast.error(t('form.categoryCreateError'))
      },
    },
  })

  return useForm({
    defaultValues: {
      name: '',
      parent_id: '',
      description: '',
    },
    validators: {
      onSubmit: ({ value }) => formSchema.safeParse(value),
    },
    onSubmit: ({ value }) => {
      mutation.mutate({
        data: {
          ...value,
          parent_id: value.parent_id || undefined,
        },
      })
    },
  })
}

export function CategoryForm({
  categories,
}: CategoryFormProps): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const form = useCategoryForm(queryClient)

  return (
    <form
      id="create-category-form"
      onSubmit={async (e) => {
        e.preventDefault()
        await form.handleSubmit()
      }}
    >
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
                      ...categories.map((cat) => ({
                        value: cat.id.toString(),
                        label: cat.name,
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

        <Field>
          <Button form="create-category-form" type="submit">
            {t('form.create')}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
