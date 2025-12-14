# RBI Web Module - Agent Context

> Next.js 16 frontend for yacht provisioning inventory management.

## Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Radix UI · TanStack
Query + Form · Clerk Auth · i18next · Orval

## Directory Structure

```
modules/web/src/
├── app/[lang]/              # App Router (language-prefixed routes)
│   ├── layout.tsx           # Root layout + providers
│   ├── page.tsx             # Home
│   ├── products/page.tsx
│   ├── stock/page.tsx
│   └── settings/page.tsx
├── components/
│   ├── ui/                  # Base components (Radix/shadcn)
│   ├── category/            # Category features
│   ├── products/            # Product features
│   ├── items/               # Shared item display
│   └── common/              # Header, LanguageSwitcher
├── hooks/providers/         # React context providers
├── lib/
│   ├── data/
│   │   ├── axios-client.ts  # Axios instance + auth
│   │   └── generated.ts     # Orval-generated hooks
│   ├── utils.ts             # cn() utility
│   └── env.ts               # Environment validation
└── locales/                 # i18n (en, de, fr)
```

## Provider Hierarchy

Order matters in `[lang]/layout.tsx`:

```
ClerkProvider → AuthProvider → ReactQueryProvider → I18nProvider → SidebarProvider
```

- **AuthProvider**: Registers Clerk token getter with axios-client
- **ReactQueryProvider**: Server state management
- **I18nProvider**: Translations

## API Integration

### Generated Client

```bash
pnpm api:gen  # Regenerates src/lib/data/generated.ts from openapi.yaml
```

**Generated artifacts:**

- Interfaces: `ProductResponseDto`, `CreateProductDto`, etc.
- Query hooks: `useListProducts`, `useListCategories`
- Mutation hooks: `useCreateProduct`, `useUpdateCategory`
- Query keys: `getListProductsQueryKey()`

### Usage Patterns

```typescript
// Query
const { data, isLoading, error } = useListProducts({ category_id: id })

// Mutation with cache invalidation
const queryClient = useQueryClient()
const mutation = useCreateProduct({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() })
    toast.success('Created')
  },
})
await mutation.mutateAsync(formData)
```

### Auth Token Flow

1. `AuthProvider` registers `getToken` with axios-client on mount
2. `getAxiosInstance` calls `getToken()` before each request
3. Token added as `Authorization: Bearer {token}` header

## State Management

| Type         | Technology          | Example                                         |
| ------------ | ------------------- | ----------------------------------------------- |
| Server state | React Query         | `useListProducts()`                             |
| Form state   | TanStack Form + Zod | `useForm({ validators: { onSubmit: schema } })` |
| UI state     | useState            | `selectedCategoryId`, `expandedIds`             |
| Global UI    | Context             | Sidebar state                                   |
| Auth         | Clerk               | `useAuth()`, `<SignedIn>`                       |

## Forms (TanStack Form + Zod)

```typescript
const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const form = useForm({
  defaultValues: { name: '', description: '' },
  validators: { onSubmit: schema },
  onSubmit: async ({ value }) => {
    await mutation.mutateAsync(value);
  },
});

// Field binding
<form.Field name="name">
  {(field) => (
    <Field>
      <FieldLabel>Name</FieldLabel>
      <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )}
</form.Field>
```

## i18n

**Files:** `src/locales/{en,de,fr}/common.json`

```typescript
const { t, i18n } = useTranslation();
<span>{t('navigation.products')}</span>
<button onClick={() => i18n.changeLanguage('de')}>Deutsch</button>
```

## Styling

- **CSS variables** in `globals.css` for theming (light/dark via `.dark` class)
- **CVA** for component variants
- **cn()** utility for class merging: `cn('p-4', isActive && 'bg-primary')`
- **Custom utilities:** `.page-container`, `.page-header`, `.items-grid`,
  `.items-list`, `.empty-state`

## Adding a New Page

1. Create `src/app/[lang]/<route>/page.tsx` with `'use client'` directive
2. Add route to `Header.tsx` navigation
3. Add translations to `locales/{lang}/common.json`

## Adding a Feature Component

1. Create component in `src/components/<feature>/`
2. Use generated hooks from `@/lib/data/generated`
3. Handle loading/error/empty states
4. Add translations for user-facing text

## Component Checklist

- [ ] `'use client'` if using hooks/state
- [ ] `cn()` for class merging
- [ ] TypeScript props interface
- [ ] Loading, error, empty states
- [ ] Translations via `useTranslation()`

## Common Patterns

```typescript
// Conditional rendering
if (isLoading) return <Spinner />;
if (error) return <ErrorState error={error} />;
if (!data?.length) return <EmptyState />;

// Query invalidation
queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

// Conditional fetching
const query = useListProducts(params, { enabled: !!categoryId });
```

## Next.js Best Practices

### Server vs Client Components

**Default to Server Components.** Only add `'use client'` when you need:

- Hooks (`useState`, `useEffect`, `useQuery`, etc.)
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)

**Pattern: Push client boundaries down.** Keep pages as server components,
extract interactive parts:

```typescript
// app/[lang]/products/page.tsx (SERVER - no 'use client')
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductGrid } from '@/components/products/ProductGrid';

export default function ProductsPage() {
  return (
    <div className="page-container">
      <h1>Products</h1>           {/* Static - rendered on server */}
      <ProductFilters />          {/* Client component - interactive */}
      <ProductGrid />             {/* Client component - uses useQuery */}
    </div>
  );
}
```

**Don't wrap entire pages in `'use client'`** — only the components that need
interactivity.

### Data Fetching

- **Server components**: Use `async/await` directly, fetch in the component
- **Client components**: Use React Query hooks (`useListProducts`)
- **Shared data**: Fetch in server component, pass as props to client components

### Component Organization

```
components/
├── ui/           # Reusable primitives (Button, Input) - mostly client
├── <feature>/    # Feature-specific (ProductCard, CategoryForm) - mixed
└── common/       # Layout components (Header) - prefer server where possible
```

### Performance Tips

- **Avoid large client bundles**: Don't import heavy libraries in client
  components unnecessarily
- **Colocate data fetching**: Fetch where data is used, not at page level and
  prop-drill
- **Use `loading.tsx`**: Add loading UI at route level for suspense boundaries
- **Lazy load**: Use `dynamic()` for heavy client components not needed on
  initial render

### Common Mistakes to Avoid

- ❌ Adding `'use client'` to a file just because a child needs it
- ❌ Fetching data in a client component when it could be server-fetched
- ❌ Putting all state at page level and prop-drilling everywhere
- ❌ Importing server-only code (db, fs) in client components

## Environment Variables

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080   # Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...    # Required
CLERK_SECRET_KEY=sk_test_...                     # Server-side
NEXT_PUBLIC_SENTRY_DSN=https://...               # Optional
```

## Commands

```bash
pnpm dev        # Dev server (port 3000)
pnpm build      # Production build
pnpm api:gen    # Regenerate API client
pnpm lint       # ESLint
```

## Key Files

| File                       | Purpose                         |
| -------------------------- | ------------------------------- |
| `app/[lang]/layout.tsx`    | Root layout, provider hierarchy |
| `lib/data/axios-client.ts` | API client, auth injection      |
| `lib/data/generated.ts`    | Auto-generated API hooks        |
| `locales/i18n.ts`          | i18next config                  |
| `app/globals.css`          | Tailwind + CSS variables        |
| `orval.config.ts`          | API generation config           |
