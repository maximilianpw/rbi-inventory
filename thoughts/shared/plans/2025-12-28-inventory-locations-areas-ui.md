# Inventory, Locations & Areas UI Implementation Plan

## Overview

Implement the frontend UI for the newly added Inventory, Locations, and Areas backend features. This enables users to manage storage locations, organize areas within locations (hierarchical), and track inventory quantities across products and locations.

## Current State Analysis

### Backend (Completed)
- **Locations API**: Full CRUD at `/api/v1/locations` with types (WAREHOUSE, SUPPLIER, IN_TRANSIT, CLIENT)
- **Areas API**: Hierarchical CRUD at `/api/v1/areas` with parent-child relationships
- **Inventory API**: Full CRUD at `/api/v1/inventory` with filtering, pagination, and quantity adjustment

### Frontend (Partial)

#### Completed:
- OpenAPI spec regenerated with all new endpoints
- Frontend API hooks generated (`useListLocations`, `useCreateLocation`, `useListInventory`, etc.)
- **Locations UI**:
  - `modules/web/src/hooks/forms/use-location-form.tsx` - Form hook
  - `modules/web/src/components/locations/LocationForm.tsx` - Form component
  - `modules/web/src/components/locations/CreateLocation.tsx` - Create dialog
  - `modules/web/src/components/locations/LocationCard.tsx` - Card with edit/delete
  - `modules/web/src/components/locations/LocationList.tsx` - Grid list
  - `modules/web/src/app/[lang]/locations/page.tsx` - Locations page
- Navigation updated with Locations and Inventory routes
- Translations added for locations, areas, and inventory

#### Missing:
- Areas UI components (hierarchical tree within locations)
- Inventory UI components (list, create, edit, adjust quantity)
- Inventory page
- Location detail view with areas

## Desired End State

After implementation:
1. Users can navigate to `/locations` and see all locations in a filterable grid
2. Users can create, edit, and delete locations
3. Clicking a location shows its detail view with areas displayed as a tree
4. Users can create, edit, delete, and reorganize areas within locations
5. Users can navigate to `/inventory` and see all inventory records
6. Users can add new inventory (product + location + optional area + quantity)
7. Users can adjust inventory quantities inline
8. Users can filter inventory by product, location, low stock, expiring soon

### Verification:
- All CRUD operations work via the UI
- Forms validate correctly
- Loading, error, and empty states display properly
- Navigation between pages works seamlessly

## What We're NOT Doing

- Stock movement history/audit trail UI (future feature)
- Barcode/QR scanning integration
- Bulk import/export functionality
- Real-time inventory updates via WebSocket
- Mobile-specific layouts (responsive is sufficient)

## Implementation Approach

Follow existing patterns from `components/category/` and `components/products/`:
1. Create form hooks with Zod validation
2. Create form components using TanStack Form + Field components
3. Create list/card components with loading/error/empty states
4. Create dialog wrappers for create/edit operations
5. Create page components that compose everything together

---

## Phase 1: Areas Management UI

### Overview
Create components to manage areas within locations. Areas are hierarchical (Zone → Shelf → Bin).

### Changes Required:

#### 1. Area Form Hook
**File**: `modules/web/src/hooks/forms/use-area-form.tsx`

```typescript
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'
import {
  type AreaResponseDto,
  useAreasControllerCreate,
  useAreasControllerUpdate,
  getAreasControllerFindAllQueryKey,
} from '@/lib/data/generated'

const formSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().max(50).optional(),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  is_active: z.boolean(),
})

// Hook for create/edit area form
```

#### 2. Area Form Component
**File**: `modules/web/src/components/areas/AreaForm.tsx`

Form fields: name, code, description, parent_id (select from existing areas), is_active

#### 3. Create Area Dialog
**File**: `modules/web/src/components/areas/CreateArea.tsx`

Dialog wrapper for AreaForm, accepts locationId as required prop.

#### 4. Area Tree Item Component
**File**: `modules/web/src/components/areas/AreaTreeItem.tsx`

Recursive component displaying an area with:
- Expand/collapse for children
- Edit/delete dropdown menu
- Indentation based on depth
- "Add child area" button on hover

#### 5. Area Tree Component
**File**: `modules/web/src/components/areas/AreaTree.tsx`

Container that:
- Fetches areas for a location using `useAreasControllerFindAll({ location_id })`
- Renders root areas as AreaTreeItem
- Shows loading/error/empty states
- "Create Area" button at top

#### 6. Location Detail View
**File**: `modules/web/src/app/[lang]/locations/[id]/page.tsx`

Page showing:
- Location header with name, type, details
- Edit/delete actions
- AreaTree component below
- Back navigation to /locations

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compiles without errors: `pnpm --filter @librestock/web build`
- [x] Linting passes: `pnpm --filter @librestock/web lint` (warnings acceptable)

#### Manual Verification:
- [ ] Navigate to /locations and click a location → location detail page loads
- [ ] Create a new root area → appears in tree
- [ ] Create a child area under existing area → appears nested
- [ ] Edit an area → changes persist
- [ ] Delete an area → removed from tree (with cascade warning)
- [ ] Expand/collapse works correctly
- [ ] Loading states show during data fetching

---

## Phase 2: Inventory Management UI

### Overview
Create components to manage inventory records (product quantities at locations/areas).

### Changes Required:

#### 1. Inventory Form Hook
**File**: `modules/web/src/hooks/forms/use-inventory-form.tsx`

```typescript
const formSchema = z.object({
  product_id: z.string().uuid(),
  location_id: z.string().uuid(),
  area_id: z.string().uuid().optional(),
  quantity: z.number().int().min(0),
  batch_number: z.string().max(100).optional(),
  expiry_date: z.string().optional(), // ISO date
  cost_per_unit: z.number().min(0).optional(),
  received_date: z.string().optional(), // ISO date
})
```

#### 2. Inventory Form Component
**File**: `modules/web/src/components/inventory/InventoryForm.tsx`

Form fields:
- Product selector (searchable dropdown using useListAllProducts)
- Location selector (dropdown using useListAllLocations)
- Area selector (optional, filtered by selected location)
- Quantity (number input)
- Batch number (optional text)
- Expiry date (date picker)
- Cost per unit (number input)
- Received date (date picker)

#### 3. Create Inventory Dialog
**File**: `modules/web/src/components/inventory/CreateInventory.tsx`

Dialog wrapper with "Add Inventory" button.

#### 4. Inventory Card Component
**File**: `modules/web/src/components/inventory/InventoryCard.tsx`

Card showing:
- Product name and SKU
- Location and area
- Quantity (with low stock warning if below reorder point)
- Expiry date (with warning if expiring soon)
- Edit/delete/adjust quantity actions

#### 5. Adjust Quantity Dialog
**File**: `modules/web/src/components/inventory/AdjustQuantity.tsx`

Simple dialog for quick quantity adjustment:
- Current quantity display
- Adjustment input (positive or negative number)
- New quantity preview
- Uses `useAdjustInventoryQuantity` mutation

#### 6. Inventory List Component
**File**: `modules/web/src/components/inventory/InventoryList.tsx`

Grid/list view:
- Fetches with useListInventory (paginated)
- Filters: product, location, low_stock, expiring_soon
- Search by batch number
- Renders InventoryCard for each item
- Pagination controls

#### 7. Inventory Page
**File**: `modules/web/src/app/[lang]/inventory/page.tsx`

Page with:
- Header with "Add Inventory" button
- Filter bar (product, location, low stock toggle, expiring soon toggle)
- Search input
- InventoryList component

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm --filter @librestock/web build`
- [ ] Linting passes: `pnpm --filter @librestock/web lint`

#### Manual Verification:
- [ ] Navigate to /inventory → inventory list loads
- [ ] Create new inventory record → appears in list
- [ ] Edit inventory record → changes persist
- [ ] Delete inventory record → removed from list
- [ ] Adjust quantity inline → quantity updates
- [ ] Filter by location → list filters correctly
- [ ] Filter by low stock → shows only items below reorder point
- [ ] Filter by expiring soon → shows only items expiring within 30 days
- [ ] Pagination works when many records exist

---

## Phase 3: Integration & Polish

### Overview
Connect components, add finishing touches, ensure consistent UX.

### Changes Required:

#### 1. Product Selector Component
**File**: `modules/web/src/components/common/ProductSelector.tsx`

Reusable searchable product dropdown for inventory forms.

#### 2. Location Selector Component
**File**: `modules/web/src/components/common/LocationSelector.tsx`

Reusable location dropdown with type badges.

#### 3. Area Selector Component
**File**: `modules/web/src/components/common/AreaSelector.tsx`

Dropdown showing areas in hierarchical format (indented by depth).
Filtered by location_id prop.

#### 4. Date Picker Integration
Ensure date picker component exists and works for expiry_date and received_date fields.

#### 5. Update Stock Page
**File**: `modules/web/src/app/[lang]/stock/page.tsx`

Consider linking to inventory or showing inventory summary on stock page.

### Success Criteria:

#### Automated Verification:
- [ ] Full build succeeds: `pnpm build`
- [ ] All linting passes: `pnpm lint`

#### Manual Verification:
- [ ] All navigation links work correctly
- [ ] Selectors are searchable and show correct options
- [ ] Date pickers work correctly
- [ ] No console errors during normal usage
- [ ] Forms show validation errors appropriately
- [ ] Toast notifications appear for success/error states

---

## Testing Strategy

### Manual Testing Steps:
1. **Locations Flow**:
   - Create a warehouse location
   - Edit its contact info
   - View location detail page
   - Create root area "Zone A"
   - Create child area "Shelf A1" under Zone A
   - Delete Zone A (verify cascade warning)

2. **Inventory Flow**:
   - Add inventory: select product, select warehouse, select Zone A, quantity 100
   - Verify it appears in inventory list
   - Adjust quantity by -10
   - Verify quantity is now 90
   - Set expiry date to next week
   - Toggle "Expiring Soon" filter → item appears
   - Delete inventory record

3. **Edge Cases**:
   - Create inventory without area (just location)
   - Create area with same name at different levels
   - Try to delete location with inventory (should warn/prevent)

---

## File Summary

### New Files to Create:

**Areas (6 files):**
- `modules/web/src/hooks/forms/use-area-form.tsx`
- `modules/web/src/components/areas/AreaForm.tsx`
- `modules/web/src/components/areas/CreateArea.tsx`
- `modules/web/src/components/areas/AreaTreeItem.tsx`
- `modules/web/src/components/areas/AreaTree.tsx`
- `modules/web/src/app/[lang]/locations/[id]/page.tsx`

**Inventory (7 files):**
- `modules/web/src/hooks/forms/use-inventory-form.tsx`
- `modules/web/src/components/inventory/InventoryForm.tsx`
- `modules/web/src/components/inventory/CreateInventory.tsx`
- `modules/web/src/components/inventory/InventoryCard.tsx`
- `modules/web/src/components/inventory/AdjustQuantity.tsx`
- `modules/web/src/components/inventory/InventoryList.tsx`
- `modules/web/src/app/[lang]/inventory/page.tsx`

**Common (3 files):**
- `modules/web/src/components/common/ProductSelector.tsx`
- `modules/web/src/components/common/LocationSelector.tsx`
- `modules/web/src/components/common/AreaSelector.tsx`

**Total: 16 new files**

---

## References

- Backend Locations: `modules/api/src/routes/locations/`
- Backend Areas: `modules/api/src/routes/areas/`
- Backend Inventory: `modules/api/src/routes/inventory/`
- Generated hooks: `modules/web/src/lib/data/generated.ts`
- Existing patterns: `modules/web/src/components/category/`
- GitHub Issue: https://github.com/maximilianpw/librestock-inventory/issues/72
