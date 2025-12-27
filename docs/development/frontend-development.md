# Frontend Development

This guide covers Next.js development patterns for the RBI Inventory frontend.

## Tech Stack

- Next.js 16 with App Router
- React 19
- TanStack Query (server state)
- TanStack Form (form management)
- Tailwind CSS 4
- Radix UI / shadcn components
- Clerk Authentication
- i18next (translations)

## Project Structure

```
modules/web/src/
├── app/[lang]/              # App Router (language-prefixed)
│   ├── layout.tsx           # Root layout + providers
│   ├── page.tsx             # Home
│   └── products/page.tsx    # Product page
├── components/
│   ├── ui/                  # Base components (Radix/shadcn)
│   ├── products/            # Product features
│   ├── category/            # Category features
│   └── common/              # Header, etc.
├── hooks/providers/         # React context
├── lib/
│   ├── data/
│   │   ├── axios-client.ts  # API client
│   │   └── generated.ts     # Orval-generated hooks
│   └── utils.ts             # Utilities
└── locales/                 # i18n (en, de, fr)
```

## API Integration

### Generated Client

Regenerate after API changes:

```bash
pnpm --filter @rbi/web api:gen
```

This generates:

- Interfaces: `ProductResponseDto`, `CreateProductDto`
- Query hooks: `useListProducts`, `useListCategories`
- Mutation hooks: `useCreateProduct`, `useUpdateProduct`
- Query keys: `getListProductsQueryKey()`

### Using Queries

```typescript
import { useListProducts } from '@/lib/data/generated';

function ProductList() {
  const { data, isLoading, error } = useListProducts({
    category_id: selectedCategory,
    page: 1,
    limit: 20,
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} />;
  if (!data?.data?.length) return <EmptyState />;

  return (
    <div>
      {data.data.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Using Mutations

```typescript
import { useCreateProduct, getListProductsQueryKey } from '@/lib/data/generated';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function CreateProductForm() {
  const queryClient = useQueryClient();

  const mutation = useCreateProduct({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      toast.success('Product created');
    },
    onError: () => {
      toast.error('Failed to create product');
    },
  });

  const handleSubmit = async (data: CreateProductDto) => {
    await mutation.mutateAsync(data);
  };
}
```

## Forms

### TanStack Form + Zod

```typescript
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Required').max(100),
  sku: z.string().min(1, 'Required').max(50),
  category_id: z.string().uuid().optional(),
});

function ProductForm() {
  const form = useForm({
    defaultValues: { name: '', sku: '', category_id: '' },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field name="name">
        {(field) => (
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <Button type="submit" disabled={form.state.isSubmitting}>
        Save
      </Button>
    </form>
  );
}
```

## Components

### Server vs Client Components

**Default to Server Components.** Only add `'use client'` when you need:

- Hooks (`useState`, `useEffect`, `useQuery`)
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)

**Push client boundaries down:**

```typescript
// app/[lang]/products/page.tsx (SERVER - no 'use client')
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductGrid } from '@/components/products/ProductGrid';

export default function ProductsPage() {
  return (
    <div className="page-container">
      <h1>Products</h1>           {/* Static - server rendered */}
      <ProductFilters />          {/* Client component */}
      <ProductGrid />             {/* Client component */}
    </div>
  );
}
```

### Component Template

```typescript
'use client';

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { type ProductResponseDto } from '@/lib/data/generated';

interface ProductCardProps {
  product: ProductResponseDto;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('p-4 border rounded', className)}>
      <h3>{product.name}</h3>
      <p>{product.sku}</p>
    </div>
  );
}
```

## Styling

### Tailwind CSS

Use the `cn()` utility for conditional classes:

```typescript
import { cn } from '@/lib/utils';

<div className={cn('p-4', isActive && 'bg-primary', className)} />
```

### CSS Variables

Theme colors are defined in `globals.css`:

```css
:root {
  --primary: 220 90% 56%;
  --background: 0 0% 100%;
}

.dark {
  --primary: 220 90% 60%;
  --background: 0 0% 10%;
}
```

## Internationalization

### Adding Translations

```json
// locales/en/common.json
{
  "navigation": {
    "products": "Products",
    "categories": "Categories"
  }
}

// locales/fr/common.json
{
  "navigation": {
    "products": "Produits",
    "categories": "Catégories"
  }
}
```

### Using Translations

```typescript
import { useTranslation } from 'react-i18next';

function Header() {
  const { t, i18n } = useTranslation();

  return (
    <nav>
      <a href="/products">{t('navigation.products')}</a>
      <button onClick={() => i18n.changeLanguage('fr')}>FR</button>
    </nav>
  );
}
```

## Common Patterns

### Loading States

```typescript
if (isLoading) return <Spinner />;
if (error) return <ErrorState error={error} />;
if (!data?.length) return <EmptyState />;
```

### Query Invalidation

```typescript
queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
```

### Conditional Fetching

```typescript
const query = useListProducts(params, { enabled: !!categoryId });
```

## Best Practices

1. **Colocate data fetching** - Fetch where data is used
2. **Use loading.tsx** - Add suspense boundaries at route level
3. **Lazy load heavy components** - Use `dynamic()` for code splitting
4. **Keep client bundles small** - Don't import heavy libraries unnecessarily

### Common Mistakes to Avoid

- Adding `'use client'` to a file just because a child needs it
- Fetching data in client when it could be server-fetched
- Putting all state at page level and prop-drilling
- Importing server-only code in client components
