import z from 'zod'
import { useForm } from '@tanstack/react-form'
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
  useCreateCategory,
  type CategoryResponseDto,
} from '@/lib/data/generated'

interface CategoryFormProps {
  categories?: CategoryResponseDto[]
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be longer that 1 character')
    .max(100, 'Name must be shorter that 100 characters'),
  parent_id: z.string(),
  description: z.string().max(500, 'Name must be shorter that 500 characters'),
})

// eslint-disable-next-line max-lines-per-function
export function CategoryForm({
  categories,
}: CategoryFormProps): React.JSX.Element {
  const { t } = useTranslation()
  const mutation = useCreateCategory()
  const form = useForm({
    defaultValues: {
      name: '',
      parent_id: '',
      description: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      mutation.mutate({ data: value })
      toast(t('form.submit'), {
        description: (
          <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
            <code>{JSON.stringify(value, null, 2)}</code>
          </pre>
        ),
        position: 'bottom-right',
        classNames: {
          content: 'flex flex-col gap-2',
        },
        style: {
          '--border-radius': 'calc(var(--radius)  + 4px)',
        } as React.CSSProperties,
      })
    },
  })

  return (
    <form
      id="create-category-form"
      onSubmit={async (e) => {
        e.preventDefault()
        await form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.Field
          name="name"
          validators={{
            onChange: formSchema.shape.name,
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t('form.categoryName')}</FieldLabel>
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

        <form.Field
          name="parent_id"
          validators={{
            onChange: formSchema.shape.parent_id,
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t('form.parentCategory')}</FieldLabel>
              <FieldContent>
                {!!categories && (
                  <CategorySelector
                    value={field.state.value}
                    categories={categories.map((cat) => ({
                      value: cat.id.toString(),
                      label: cat.name,
                    }))}
                    onValueChange={field.handleChange}
                  />
                )}
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field
          name="description"
          validators={{
            onChange: formSchema.shape.description,
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t('form.description')}</FieldLabel>
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
