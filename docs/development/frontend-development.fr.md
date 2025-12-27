# Développement Frontend

Ce guide couvre les patterns de développement Next.js pour le frontend RBI Inventory.

## Stack technique

- Next.js 16 avec App Router
- React 19
- TanStack Query (état serveur)
- TanStack Form (gestion des formulaires)
- Tailwind CSS 4
- Radix UI / composants shadcn
- Authentification Clerk
- i18next (traductions)

## Structure du projet

```
modules/web/src/
├── app/[lang]/              # App Router (préfixe langue)
│   ├── layout.tsx           # Layout racine + providers
│   ├── page.tsx             # Accueil
│   └── products/page.tsx    # Page produits
├── components/
│   ├── ui/                  # Composants de base (Radix/shadcn)
│   ├── products/            # Fonctionnalités produits
│   ├── category/            # Fonctionnalités catégories
│   └── common/              # Header, etc.
├── hooks/providers/         # Contextes React
├── lib/
│   ├── data/
│   │   ├── axios-client.ts  # Client API
│   │   └── generated.ts     # Hooks générés par Orval
│   └── utils.ts             # Utilitaires
└── locales/                 # i18n (en, de, fr)
```

## Intégration API

### Client généré

Régénérer après les changements d'API :

```bash
pnpm --filter @rbi/web api:gen
```

Cela génère :

- Interfaces : `ProductResponseDto`, `CreateProductDto`
- Hooks de requête : `useListProducts`, `useListCategories`
- Hooks de mutation : `useCreateProduct`, `useUpdateProduct`
- Clés de requête : `getListProductsQueryKey()`

### Utilisation des requêtes

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

### Utilisation des mutations

```typescript
import { useCreateProduct, getListProductsQueryKey } from '@/lib/data/generated';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function CreateProductForm() {
  const queryClient = useQueryClient();

  const mutation = useCreateProduct({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      toast.success('Produit créé');
    },
    onError: () => {
      toast.error('Échec de la création du produit');
    },
  });

  const handleSubmit = async (data: CreateProductDto) => {
    await mutation.mutateAsync(data);
  };
}
```

## Formulaires

### TanStack Form + Zod

```typescript
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Requis').max(100),
  sku: z.string().min(1, 'Requis').max(50),
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
            <FieldLabel>Nom</FieldLabel>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <Button type="submit" disabled={form.state.isSubmitting}>
        Enregistrer
      </Button>
    </form>
  );
}
```

## Composants

### Composants Serveur vs Client

**Par défaut, utiliser les composants serveur.** N'ajouter `'use client'` que si vous avez besoin de :

- Hooks (`useState`, `useEffect`, `useQuery`)
- Gestionnaires d'événements (`onClick`, `onChange`)
- APIs navigateur (`localStorage`, `window`)

**Repousser les limites client vers le bas :**

```typescript
// app/[lang]/products/page.tsx (SERVEUR - pas de 'use client')
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductGrid } from '@/components/products/ProductGrid';

export default function ProductsPage() {
  return (
    <div className="page-container">
      <h1>Produits</h1>           {/* Statique - rendu serveur */}
      <ProductFilters />          {/* Composant client */}
      <ProductGrid />             {/* Composant client */}
    </div>
  );
}
```

## Styles

### Tailwind CSS

Utiliser l'utilitaire `cn()` pour les classes conditionnelles :

```typescript
import { cn } from '@/lib/utils';

<div className={cn('p-4', isActive && 'bg-primary', className)} />
```

## Internationalisation

### Ajouter des traductions

```json
// locales/fr/common.json
{
  "navigation": {
    "products": "Produits",
    "categories": "Catégories"
  }
}
```

### Utiliser les traductions

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

## Bonnes pratiques

1. **Colocaliser la récupération de données** - Récupérer où les données sont utilisées
2. **Utiliser loading.tsx** - Ajouter des limites de suspense au niveau des routes
3. **Lazy load les composants lourds** - Utiliser `dynamic()` pour le code splitting
4. **Garder les bundles client petits** - Ne pas importer de bibliothèques lourdes inutilement

### Erreurs courantes à éviter

- Ajouter `'use client'` à un fichier juste parce qu'un enfant en a besoin
- Récupérer des données côté client quand elles pourraient être récupérées côté serveur
- Mettre tout l'état au niveau de la page et faire du prop-drilling
- Importer du code server-only dans des composants client
