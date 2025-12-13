# RBI Web Module - Agent Context & Design Document

> **Purpose:** Detailed technical reference for AI agents and developers working on the Next.js frontend module.

## Table of Contents

- [1. Module Overview](#1-module-overview)
- [2. Application Configuration](#2-application-configuration)
- [3. App Router Structure](#3-app-router-structure)
- [4. API Integration](#4-api-integration)
- [5. Components](#5-components)
- [6. State Management](#6-state-management)
- [7. Authentication](#7-authentication)
- [8. Internationalization](#8-internationalization)
- [9. Styling](#9-styling)
- [10. Development Patterns](#10-development-patterns)
- [11. Quick Reference](#11-quick-reference)

---

## 1. Module Overview

### 1.1 Purpose

The `@rbi/web` module is a Next.js 16 frontend providing:
- Modern React 19 UI for inventory management
- Type-safe API integration via auto-generated client
- Multi-language support (EN, DE, FR)
- Authentication via Clerk
- Responsive design with dark mode support

### 1.2 Directory Structure

```
modules/web/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── [lang]/               # Language-prefixed routes
│   │   │   ├── layout.tsx        # Root layout with providers
│   │   │   ├── page.tsx          # Home page
│   │   │   ├── products/         # Products page
│   │   │   ├── stock/            # Stock management page
│   │   │   └── settings/         # Settings page
│   │   ├── globals.css           # Global styles + Tailwind
│   │   └── global-error.tsx      # Error boundary
│   │
│   ├── components/
│   │   ├── ui/                   # Base UI components (Radix/shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── field.tsx
│   │   │   ├── select.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── ...
│   │   ├── category/             # Category feature components
│   │   │   ├── CategorySidebar.tsx
│   │   │   ├── CategoryForm.tsx
│   │   │   ├── CategorySelector.tsx
│   │   │   ├── CreateCategory.tsx
│   │   │   └── NestedCategory.tsx
│   │   ├── products/             # Product feature components
│   │   │   └── ProductList.tsx
│   │   ├── items/                # Shared item components
│   │   │   ├── ItemCard.tsx
│   │   │   └── ItemsGrid.tsx
│   │   └── common/               # Shared components
│   │       ├── Header.tsx        # Sidebar navigation
│   │       └── LanguageSwitcher.tsx
│   │
│   ├── hooks/
│   │   └── providers/            # React context providers
│   │       ├── ReactQueryProvider.tsx
│   │       ├── I18nProvider.tsx
│   │       └── AuthProvider.tsx
│   │
│   ├── lib/
│   │   ├── data/                 # API client layer
│   │   │   ├── axios-client.ts   # Axios instance + auth
│   │   │   └── generated.ts      # Orval-generated hooks
│   │   ├── utils.ts              # Utility functions (cn)
│   │   └── env.ts                # Environment validation
│   │
│   ├── locales/                  # i18n translations
│   │   ├── i18n.ts              # i18next configuration
│   │   ├── en/common.json
│   │   ├── de/common.json
│   │   └── fr/common.json
│   │
│   └── instrumentation.ts        # Sentry initialization
│
├── orval.config.ts               # API client generator config
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json
```

### 1.3 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.1 | React framework (App Router) |
| React | 19.2.0 | UI library |
| TypeScript | 5.9.3 | Type safety |
| Tailwind CSS | 4.1.17 | Styling |
| Radix UI | Various | Accessible UI primitives |
| @tanstack/react-query | 5.90.7 | Server state management |
| @tanstack/react-form | 1.23.8 | Form handling |
| Axios | 1.13.2 | HTTP client |
| Orval | 7.16.0 | API client generation |
| @clerk/nextjs | 6.35.0 | Authentication |
| i18next | 25.6.2 | Internationalization |
| @sentry/nextjs | 10.24.0 | Error monitoring |

---

## 2. Application Configuration

### 2.1 Next.js Configuration

**File:** `next.config.ts`

```typescript
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  turbopack: {
    root: '../..', // Monorepo root for Turbopack
  },
};

export default withSentryConfig(nextConfig, {
  org: 'rivierabeauty-interiors',
  project: 'inventory',
  tunnelRoute: '/monitoring',
  automaticVercelMonitors: true,
});
```

**Key Settings:**
- Turbopack enabled with monorepo root configuration
- Sentry error monitoring with tunnel route at `/monitoring`
- Automatic Vercel performance monitoring

### 2.2 TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "extends": "/packages/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
}
```

**Path Alias:** `@/` maps to `./src/`

### 2.3 Orval Configuration (API Client Generation)

**File:** `orval.config.ts`

```typescript
export default defineConfig({
  api: {
    input: '../../openapi.yaml',  // From monorepo root
    output: {
      target: './src/lib/data/generated.ts',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/lib/data/axios-client.ts',
          name: 'getAxiosInstance',
        },
      },
    },
  },
});
```

**Generation Command:**
```bash
pnpm api:gen  # Generates src/lib/data/generated.ts
```

### 2.4 Environment Variables

**File:** `src/lib/env.ts`

```typescript
// Server-side (optional)
CLERK_SECRET_KEY
SENTRY_AUTH_TOKEN

// Client-side (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  // Clerk auth
NEXT_PUBLIC_API_BASE_URL           // API endpoint (validated URL)
NEXT_PUBLIC_SENTRY_DSN             // Sentry DSN (optional)
```

**Validation:** Zod schema validates all environment variables at build time.

---

## 3. App Router Structure

### 3.1 Route Organization

```
/app/
├── [lang]/                    # Dynamic language segment
│   ├── layout.tsx            # Root layout (providers)
│   ├── page.tsx              # / (Home)
│   ├── products/
│   │   └── page.tsx          # /products
│   ├── stock/
│   │   └── page.tsx          # /stock
│   └── settings/
│       └── page.tsx          # /settings
├── globals.css               # Global styles
└── global-error.tsx          # Error boundary
```

**URL Structure:** `/{lang}/{page}` (e.g., `/en/products`, `/de/stock`)

### 3.2 Root Layout

**File:** `src/app/[lang]/layout.tsx`

```typescript
// Font Configuration
const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

// Provider Hierarchy (order matters)
<ClerkProvider>           {/* 1. Authentication context */}
  <AuthProvider>          {/* 2. Token getter registration */}
    <ReactQueryProvider>  {/* 3. Server state */}
      <I18nProvider>      {/* 4. Translations */}
        <SidebarProvider> {/* 5. UI state */}
          {children}
        </SidebarProvider>
      </I18nProvider>
    </ReactQueryProvider>
  </AuthProvider>
</ClerkProvider>
```

**Key Features:**
- Language from URL params → `<html lang={lang}>`
- Custom fonts via CSS variables
- Sidebar + main content layout
- Global `<Toaster />` for notifications

### 3.3 Page Components

**Products Page** (`products/page.tsx`)
```typescript
'use client';

export default function ProductsPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  return (
    <div className="flex h-full">
      <CategorySidebar
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />
      <ProductList categoryId={selectedCategoryId} />
    </div>
  );
}
```

**Stock Page** (`stock/page.tsx`)
- Search, sort, and display type state
- `useListProducts` for data fetching
- Client-side filtering and sorting
- Grid/list view toggle

**Settings Page** (`settings/page.tsx`)
- Language switcher component

### 3.4 Error Handling

**File:** `src/app/global-error.tsx`

```typescript
'use client';

export default function GlobalError({ error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html><body>
      <NextError statusCode={0} />
    </body></html>
  );
}
```

---

## 4. API Integration

### 4.1 Axios Client

**File:** `src/lib/data/axios-client.ts`

```typescript
// Axios instance configuration
const axiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Token getter storage (set by AuthProvider)
let getToken: (() => Promise<string | null>) | null = null;

export function initializeAuth(tokenGetter: () => Promise<string | null>) {
  getToken = tokenGetter;
}

// Request wrapper with auth injection
export async function getAxiosInstance<T>(config: AxiosRequestConfig): Promise<T> {
  if (getToken) {
    try {
      const token = await getToken();
      if (token && token.length > 0) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }
  }

  const response = await axiosInstance.request<T>(config);
  return response.data;
}
```

**Token Flow:**
1. `AuthProvider` registers token getter on mount
2. Every API request calls `getToken()` via `getAxiosInstance`
3. Token added as `Authorization: Bearer {token}` header

### 4.2 Generated API Client

**File:** `src/lib/data/generated.ts` (auto-generated by Orval)

**Generated Artifacts:**

| Type | Examples |
|------|----------|
| **Interfaces** | `ProductResponseDto`, `CreateProductDto`, `CategoryResponseDto` |
| **Enums** | `UserResponseDtoRole`, `ProductSortField`, `SortOrder` |
| **Query Hooks** | `useListProducts`, `useListCategories`, `useGetProductsByCategory` |
| **Mutation Hooks** | `useCreateProduct`, `useUpdateCategory`, `useDeleteProduct` |
| **Query Keys** | `getListProductsQueryKey()`, `getListCategoriesQueryKey()` |

**Query Hook Pattern:**

```typescript
// Generated hook
export function useListProducts(
  params?: ListProductsParams,
  options?: UseQueryOptions<ProductResponseDto[]>
) {
  return useQuery({
    queryKey: getListProductsQueryKey(params),
    queryFn: () => listProducts(params),
    ...options,
  });
}

// Usage in component
const { data, isLoading, error } = useListProducts({
  category_id: selectedCategoryId,
  page: 1,
  limit: 20,
});
```

**Mutation Hook Pattern:**

```typescript
// Generated hook
export function useCreateProduct(
  options?: UseMutationOptions<ProductResponseDto, Error, CreateProductDto>
) {
  return useMutation({
    mutationFn: (data) => createProduct(data),
    ...options,
  });
}

// Usage in component
const createMutation = useCreateProduct({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    toast.success('Product created');
  },
});

await createMutation.mutateAsync(formData);
```

### 4.3 React Query Provider

**File:** `src/hooks/providers/ReactQueryProvider.tsx`

```typescript
'use client';

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Cache Behavior:**
- Default React Query settings (5 min stale time, garbage collection)
- Query keys auto-generated by Orval based on endpoint + params
- Automatic refetch on window focus

---

## 5. Components

### 5.1 UI Components (Radix/shadcn)

Located in `src/components/ui/`

**Button** (`button.tsx`)

```typescript
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all...',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'size-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

// Usage
<Button variant="outline" size="sm">Click me</Button>
```

**Dialog** (`dialog.tsx`)

```typescript
// Wraps Radix Dialog with custom styling
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent showCloseButton>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button>Action</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Field Components** (`field.tsx`)

Complete form field system with accessibility:

```typescript
<FieldGroup>
  <Field orientation="vertical">
    <FieldLabel>Name</FieldLabel>
    <FieldContent>
      <Input {...field.getInputProps()} />
    </FieldContent>
    <FieldError errors={field.state.meta.errors} />
    <FieldDescription>Helper text</FieldDescription>
  </Field>
</FieldGroup>
```

**Sidebar** (`sidebar.tsx`)

- Cookie-persistent state (`sidebar_state`)
- Keyboard shortcut: `Cmd/Ctrl+B`
- Responsive: expanded (desktop), collapsed (mobile)
- CSS variables for width control

### 5.2 Feature Components

**CategorySidebar** (`src/components/category/CategorySidebar.tsx`)

```typescript
export function CategorySidebar({ selectedCategoryId, onSelectCategory }) {
  const { data: categories, isLoading, error } = useListCategories();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Renders recursive tree via NestedCategory
  return (
    <aside>
      <CreateCategory />
      {categories?.map(category => (
        <NestedCategory
          key={category.id}
          category={category}
          depth={0}
          expandedIds={expandedIds}
          selectedId={selectedCategoryId}
          onToggleExpand={handleToggle}
          onSelect={onSelectCategory}
        />
      ))}
    </aside>
  );
}
```

**NestedCategory** (`src/components/category/NestedCategory.tsx`)

```typescript
// Recursive component for category trees
export function NestedCategory({ category, depth, expandedIds, ... }) {
  const isExpanded = expandedIds.has(category.id);
  const paddingClass = { 0: 'pl-0', 1: 'pl-4', 2: 'pl-8' }[depth] ?? 'pl-20';

  return (
    <div className={paddingClass}>
      <CategoryCard
        category={category}
        isExpanded={isExpanded}
        isSelected={selectedId === category.id}
        onToggle={() => onToggleExpand(category.id)}
        onSelect={() => onSelect(category.id)}
      />
      {isExpanded && category.children?.map(child => (
        <NestedCategory
          key={child.id}
          category={child}
          depth={depth + 1}
          {...rest}
        />
      ))}
    </div>
  );
}
```

**CategoryForm** (`src/components/category/CategoryForm.tsx`)

```typescript
// TanStack Form + Zod validation
const schema = z.object({
  name: z.string().min(1).max(100),
  parent_id: z.string().optional(),
  description: z.string().max(500).optional(),
});

export function CategoryForm({ onSuccess }) {
  const createMutation = useCreateCategory();

  const form = useForm({
    defaultValues: { name: '', parent_id: undefined, description: '' },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value);
      onSuccess?.();
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
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
      {/* More fields... */}
    </form>
  );
}
```

**ProductList** (`src/components/products/ProductList.tsx`)

```typescript
export function ProductList({ categoryId }) {
  // Conditional data fetching based on category selection
  const allProducts = useListProducts(undefined, { enabled: !categoryId });
  const categoryProducts = useGetProductsByCategory(categoryId!, {
    enabled: !!categoryId,
  });

  const { data, isLoading, error } = categoryId ? categoryProducts : allProducts;

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage />;
  if (!data?.length) return <EmptyState />;

  return (
    <div className="items-grid">
      {data.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**ItemCard** (`src/components/items/ItemCard.tsx`)

```typescript
type DisplayType = 'LIST' | 'GRID';

export function ItemCard({ item, displayType }) {
  if (displayType === 'LIST') {
    return (
      <div className="flex items-center gap-4 p-4 border rounded">
        <Package className="size-16" />
        <div>
          <h3>{item.name}</h3>
          <p>{item.sku} • ${item.price}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-square p-4 border rounded">
      <Package className="w-full h-32" />
      <h3 className="mt-2">{item.name}</h3>
      <p className="line-clamp-2">{item.description}</p>
    </div>
  );
}
```

### 5.3 Common Components

**Header** (`src/components/common/Header.tsx`)

Actually a sidebar navigation component:

```typescript
const routes = [
  { path: '/', label: t('navigation.dashboard'), icon: LayoutDashboard },
  { path: '/stock', label: t('navigation.stock'), icon: Package },
  { path: '/products', label: t('navigation.products'), icon: Package },
];

export function Header() {
  return (
    <Sidebar>
      <SidebarHeader>{/* Logo */}</SidebarHeader>
      <SidebarContent>
        {routes.map(route => (
          <SidebarMenuItem key={route.path}>
            <Link href={route.path}>
              <route.icon />
              {route.label}
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <Link href="/settings">Settings</Link>
      </SidebarFooter>
    </Sidebar>
  );
}
```

**LanguageSwitcher** (`src/components/common/LanguageSwitcher.tsx`)

```typescript
const languages = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <Select
      value={i18n.language}
      onValueChange={(lng) => i18n.changeLanguage(lng)}
    >
      {languages.map(lang => (
        <SelectItem key={lang.code} value={lang.code}>
          {lang.label}
        </SelectItem>
      ))}
    </Select>
  );
}
```

---

## 6. State Management

### 6.1 State Architecture

| State Type | Technology | Scope |
|------------|------------|-------|
| Server state | React Query | API data, caching |
| Form state | TanStack Form | Field values, validation |
| UI state | useState | Component-local |
| Global UI | Context | Sidebar, theme |
| Auth state | Clerk SDK | Session, tokens |

### 6.2 Server State (React Query)

```typescript
// Query - fetching data
const { data, isLoading, error, refetch } = useListProducts({
  category_id: categoryId,
  page: 1,
  limit: 20,
});

// Mutation - modifying data
const mutation = useCreateProduct({
  onSuccess: () => {
    // Invalidate cache to refetch
    queryClient.invalidateQueries({
      queryKey: getListProductsQueryKey(),
    });
  },
});

// Execute mutation
await mutation.mutateAsync(productData);
```

**Cache Keys (auto-generated):**
- `['/api/v1/products', params]`
- `['/api/v1/categories']`
- `['/api/v1/products/category/:id', categoryId]`

### 6.3 Form State (TanStack Form)

```typescript
const form = useForm({
  defaultValues: {
    name: '',
    description: '',
  },
  validators: {
    onSubmit: zodSchema,
  },
  onSubmit: async ({ value }) => {
    await mutation.mutateAsync(value);
  },
});

// Field access
<form.Field name="name">
  {(field) => (
    <>
      <Input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      {field.state.meta.errors && (
        <FieldError errors={field.state.meta.errors} />
      )}
    </>
  )}
</form.Field>
```

### 6.4 Component State

```typescript
// Local UI state
const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [displayType, setDisplayType] = useState<'GRID' | 'LIST'>('GRID');
const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
```

### 6.5 Context-based State

**Sidebar Context:**

```typescript
const SidebarContext = createContext<{
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}>(null);

// Usage
const { state, toggleSidebar, isMobile } = useSidebar();
```

---

## 7. Authentication

### 7.1 Clerk Integration

**Provider Setup** (`[lang]/layout.tsx`)

```typescript
<ClerkProvider>
  <AuthProvider>
    {/* App content */}
  </AuthProvider>
</ClerkProvider>
```

**Auth Provider** (`src/hooks/providers/AuthProvider.tsx`)

```typescript
'use client';

export function AuthProvider({ children }) {
  const { getToken } = useAuth(); // Clerk hook

  useEffect(() => {
    // Register token getter with axios client
    setTokenGetter(async () => {
      try {
        return await getToken();
      } catch (error) {
        console.error('Failed to get token:', error);
        return null;
      }
    });
  }, [getToken]);

  return <>{children}</>;
}
```

### 7.2 Token Flow

```
1. User authenticates via Clerk
   ↓
2. AuthProvider mounts
   ↓
3. Registers getToken with axios-client
   ↓
4. API request triggers getAxiosInstance
   ↓
5. getToken() retrieves current JWT
   ↓
6. Token added to Authorization header
   ↓
7. Request sent to API
```

### 7.3 UI Components

```typescript
// Show when signed out
<SignedOut>
  <SignInButton />
</SignedOut>

// Show when signed in
<SignedIn>
  <UserButton />
</SignedIn>
```

### 7.4 Environment Variables

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...  # Server-side only
```

---

## 8. Internationalization

### 8.1 i18next Configuration

**File:** `src/locales/i18n.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en/common.json';
import de from './de/common.json';
import fr from './fr/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
      de: { common: de },
      fr: { common: fr },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

### 8.2 Translation Files

**Structure:** `src/locales/{lang}/common.json`

```json
{
  "navigation": {
    "dashboard": "Dashboard",
    "products": "Products",
    "stock": "Stock",
    "settings": "Settings"
  },
  "form": {
    "categoryName": "Category Name",
    "parentCategory": "Parent Category",
    "description": "Description",
    "save": "Save",
    "cancel": "Cancel"
  },
  "products": {
    "errorLoading": "Error loading products",
    "noProducts": "No products found"
  }
}
```

### 8.3 Usage

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('navigation.products')}</h1>
      <p>Current language: {i18n.language}</p>
      <button onClick={() => i18n.changeLanguage('de')}>
        Switch to German
      </button>
    </div>
  );
}
```

### 8.4 Route Integration

Language from URL (`/en/products`) is passed to:
- `<html lang={lang}>` for SEO/accessibility
- i18next uses localStorage + browser detection as fallback

---

## 9. Styling

### 9.1 Tailwind CSS Configuration

**File:** `src/app/globals.css`

**CSS Variables (Light Mode):**
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0.085 231.5);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.97 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0.165 254.624);
  --radius: 0.625rem;
}
```

**Dark Mode Variables:**
```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  /* ... */
}
```

**Custom Utilities:**
```css
@layer components {
  .page-container { @apply relative flex h-full flex-col; }
  .page-header { @apply flex flex-col gap-4 p-4; }
  .items-grid { @apply grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4; }
  .items-list { @apply flex flex-col gap-2; }
  .empty-state { @apply flex items-center justify-center p-8 text-muted-foreground; }
}
```

### 9.2 Component Styling Pattern

**Class Variance Authority (CVA):**

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'base-classes-here', // Always applied
  {
    variants: {
      variant: {
        default: 'variant-default-classes',
        outline: 'variant-outline-classes',
      },
      size: {
        default: 'size-default-classes',
        sm: 'size-sm-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Component
interface ButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
}

function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

**CN Utility:**

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage - safely merges Tailwind classes
cn('p-4', 'p-6')  // → 'p-6' (later wins)
cn('text-red-500', isError && 'text-red-700')  // Conditional
```

### 9.3 Data Attributes

```typescript
// For state-based styling
<div data-state={isOpen ? 'open' : 'closed'}>
  {/* Tailwind: data-[state=open]:animate-in */}
</div>

// For component identification
<input data-slot="input" />
```

### 9.4 Responsive Design

```typescript
// Mobile-first breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// Container queries
<div className="@container">
  <div className="@md:flex-row flex-col">
```

---

## 10. Development Patterns

### 10.1 Adding a New Page

**Step 1: Create Page File**
```typescript
// src/app/[lang]/orders/page.tsx
'use client';

import { useListOrders } from '@/lib/data/generated';

export default function OrdersPage() {
  const { data, isLoading, error } = useListOrders();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Orders</h1>
      </div>
      <div className="page-content">
        {/* Content */}
      </div>
    </div>
  );
}
```

**Step 2: Add to Navigation**
```typescript
// src/components/common/Header.tsx
const routes = [
  // ...existing routes
  { path: '/orders', label: t('navigation.orders'), icon: ShoppingCart },
];
```

**Step 3: Add Translations**
```json
// src/locales/en/common.json
{
  "navigation": {
    "orders": "Orders"
  }
}
```

### 10.2 Adding a New Feature Component

**Step 1: Create Component**
```typescript
// src/components/orders/OrderList.tsx
'use client';

import { useListOrders } from '@/lib/data/generated';
import { OrderCard } from './OrderCard';

interface OrderListProps {
  status?: string;
}

export function OrderList({ status }: OrderListProps) {
  const { data, isLoading, error } = useListOrders({ status });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="items-list">
      {data?.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

**Step 2: Create Form (if needed)**
```typescript
// src/components/orders/OrderForm.tsx
'use client';

import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useCreateOrder } from '@/lib/data/generated';

const schema = z.object({
  customer_id: z.string().uuid(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().min(1),
  })),
});

export function OrderForm({ onSuccess }) {
  const mutation = useCreateOrder();

  const form = useForm({
    defaultValues: { customer_id: '', items: [] },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
      onSuccess?.();
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### 10.3 Using Generated API Hooks

**After API changes:**
```bash
# 1. Regenerate API client
pnpm api:gen

# 2. Import and use new hooks
import {
  useListOrders,
  useCreateOrder,
  useUpdateOrder,
  getListOrdersQueryKey,
} from '@/lib/data/generated';
```

**Query with Options:**
```typescript
const { data } = useListOrders(
  { status: 'pending', page: 1 },
  {
    enabled: isReady,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  }
);
```

**Mutation with Cache Invalidation:**
```typescript
const queryClient = useQueryClient();

const mutation = useCreateOrder({
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: getListOrdersQueryKey(),
    });
    toast.success('Order created');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

### 10.4 Adding UI Components

**Wrapper Pattern (for Radix components):**
```typescript
// src/components/ui/tooltip.tsx
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    className={cn(
      'z-50 rounded-md bg-popover px-3 py-1.5 text-sm shadow-md',
      'animate-in fade-in-0 zoom-in-95',
      className
    )}
    {...props}
  />
));

export { Tooltip, TooltipTrigger, TooltipContent };
```

---

## 11. Quick Reference

### 11.1 Commands

```bash
# Development
pnpm dev           # Start dev server (port 3000)

# Production
pnpm build         # Build for production
pnpm start         # Start production server

# Code Generation
pnpm api:gen       # Regenerate API client from OpenAPI

# Linting
pnpm lint          # Run ESLint
pnpm lint:fix      # Fix lint errors
```

### 11.2 Key Files

| File | Purpose |
|------|---------|
| `src/app/[lang]/layout.tsx` | Root layout, providers |
| `src/lib/data/axios-client.ts` | API client config |
| `src/lib/data/generated.ts` | Auto-generated API hooks |
| `src/locales/i18n.ts` | i18next configuration |
| `src/app/globals.css` | Global styles, CSS vars |
| `orval.config.ts` | API generation config |

### 11.3 Import Aliases

```typescript
import { Button } from '@/components/ui/button';
import { useListProducts } from '@/lib/data/generated';
import { cn } from '@/lib/utils';
import { env } from '@/lib/env';
```

### 11.4 Environment Variables

```bash
# Required
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Optional
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...
```

### 11.5 Component Checklist

When creating new components:

- [ ] Add `'use client'` directive if using hooks/state
- [ ] Use `cn()` for class merging
- [ ] Add TypeScript interface for props
- [ ] Use semantic HTML elements
- [ ] Add translations for user-facing text
- [ ] Handle loading, error, and empty states
- [ ] Use CVA for variant-based styling
- [ ] Export from index file (if applicable)

### 11.6 Common Patterns

**Conditional Rendering:**
```typescript
if (isLoading) return <Spinner />;
if (error) return <ErrorState error={error} />;
if (!data?.length) return <EmptyState />;
return <DataList data={data} />;
```

**Form Submit:**
```typescript
const form = useForm({
  defaultValues: {},
  validators: { onSubmit: schema },
  onSubmit: async ({ value }) => {
    await mutation.mutateAsync(value);
  },
});
```

**Query Invalidation:**
```typescript
queryClient.invalidateQueries({
  queryKey: getListProductsQueryKey(),
});
```

**Translation:**
```typescript
const { t } = useTranslation();
<span>{t('namespace.key')}</span>
```

---

## Appendix: File Dependencies

```
layout.tsx
├── ClerkProvider (@clerk/nextjs)
├── AuthProvider → axios-client.ts (token registration)
├── ReactQueryProvider → QueryClient
├── I18nProvider → i18n.ts
├── SidebarProvider → sidebar.tsx
└── Header → routes, SignInButton

page.tsx (products)
├── CategorySidebar
│   ├── useListCategories (generated.ts)
│   ├── NestedCategory (recursive)
│   └── CreateCategory → CategoryForm
└── ProductList
    ├── useListProducts (generated.ts)
    └── useGetProductsByCategory (generated.ts)

generated.ts (auto-generated)
├── axios-client.ts (getAxiosInstance)
├── React Query hooks
└── TypeScript interfaces
```
