# LibreStock Web Module - Agent Context

> TanStack Start frontend for yacht provisioning inventory management.

## Tech Stack

TanStack Start · TanStack Router · React 19 · TypeScript · Tailwind CSS 4 · Radix UI · TanStack
Query + Form · Clerk Auth · i18next · Orval

## Directory Structure

```
modules/web/src/
├── app/                     # TanStack Router file-based routes
│   ├── __root.tsx           # Root layout + providers
│   ├── index.tsx            # Home (/)
│   ├── products.tsx         # Products page (/products)
│   ├── locations.tsx        # Locations list (/locations)
│   ├── locations.$id.tsx    # Location detail (/locations/:id)
│   ├── stock.tsx            # Stock page (/stock)
│   ├── inventory.tsx        # Inventory page (/inventory)
│   ├── settings.tsx         # Settings page (/settings)
│   ├── audit-logs.tsx       # Audit logs (/audit-logs)
│   └── globals.css          # Global styles
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
├── router.tsx               # Router configuration
└── locales/                 # i18n (en, de, fr)
```

## Routing (TanStack Router)

### File-Based Routing

Routes are defined in `src/app/` using TanStack Router conventions:

- `__root.tsx` - Root layout wrapping all routes
- `index.tsx` - Home page (`/`)
- `products.tsx` - `/products`
- `locations.tsx` - `/locations`
- `locations.$id.tsx` - `/locations/:id` (dynamic route)

### Route Definition Pattern

```typescript
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/products')({
  component: ProductPage,
})

function ProductPage(): React.JSX.Element {
  return <div>...</div>
}
```

### Dynamic Routes

```typescript
// locations.$id.tsx
export const Route = createFileRoute('/locations/$id')({
  component: LocationDetailPage,
})

function LocationDetailPage(): React.JSX.Element {
  const { id } = Route.useParams()
  // ...
}
```

### Navigation

```typescript
import { Link, useNavigate } from '@tanstack/react-router'

// Link component
<Link to="/products">Products</Link>
<Link to="/locations/$id" params={{ id: '123' }}>Location</Link>

// Programmatic navigation
const navigate = useNavigate()
navigate({ to: '/locations' })
```

## Provider Hierarchy

Order matters in `__root.tsx`:

```
ClerkProvider → AuthProvider → ReactQueryProvider → I18nProvider → ThemeProvider → SidebarProvider
```

- **ClerkProvider**: Authentication (from `@clerk/tanstack-react-start`)
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

1. Create `src/app/<route>.tsx` with `createFileRoute`
2. Export the `Route` constant
3. Add route to `Header.tsx` navigation
4. Add translations to `locales/{lang}/common.json`

Example:

```typescript
// src/app/reports.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reports')({
  component: ReportsPage,
})

function ReportsPage(): React.JSX.Element {
  return <div>Reports</div>
}
```

## Adding a Feature Component

1. Create component in `src/components/<feature>/`
2. Use generated hooks from `@/lib/data/generated`
3. Handle loading/error/empty states
4. Add translations for user-facing text

## Component Checklist

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

// Get route params
const { id } = Route.useParams();

// Get search params
const { page, filter } = Route.useSearch();
```

## Environment Variables

```bash
VITE_API_BASE_URL=http://localhost:8080          # Required
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...           # Required
CLERK_SECRET_KEY=sk_test_...                     # Server-side
```

## Commands

```bash
pnpm dev        # Dev server (port 3000)
pnpm build      # Production build
pnpm api:gen    # Regenerate API client
pnpm lint       # ESLint
pnpm type-check # TypeScript check
```

## Key Files

| File                       | Purpose                         |
| -------------------------- | ------------------------------- |
| `app/__root.tsx`           | Root layout, provider hierarchy |
| `router.tsx`               | Router configuration            |
| `lib/data/axios-client.ts` | API client, auth injection      |
| `lib/data/generated.ts`    | Auto-generated API hooks        |
| `locales/i18n.ts`          | i18next config                  |
| `app/globals.css`          | Tailwind + CSS variables        |
| `orval.config.ts`          | API generation config           |
| `vite.config.ts`           | Vite + TanStack Start config    |
