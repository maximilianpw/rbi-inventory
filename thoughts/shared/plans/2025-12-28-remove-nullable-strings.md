# Remove Nullable Strings from Database Schema - Implementation Plan

## Overview

Replace nullable string columns with `NOT NULL DEFAULT ''` to eliminate complex Orval-generated types (`{ [key: string]: unknown } | null`) and simplify TypeScript throughout the codebase.

## Current State Analysis

**6 nullable string fields** across 3 entities need migration:

| Entity | Field | Current Column | Current Type |
|--------|-------|----------------|--------------|
| Location | `address` | `text, nullable: true` | `string \| null` |
| Location | `contact_person` | `varchar, nullable: true` | `string \| null` |
| Location | `phone` | `varchar, nullable: true` | `string \| null` |
| Area | `code` | `varchar(50), nullable: true` | `string \| null` |
| Area | `description` | `text, nullable: true` | `string \| null` |
| Inventory | `batch_number` | `varchar, nullable: true` | `string \| null` |

**Intentionally keeping nullable** (semantic meaning):
- `Area.parent_id` - NULL = root area (foreign key)
- `Inventory.area_id` - NULL = no specific area (foreign key)
- `Inventory.expiry_date` - NULL = no expiry
- `Inventory.received_date` - NULL = unknown
- `Inventory.cost_per_unit` - NULL = unknown cost (vs 0 = free)

**Development mode**: `synchronize: true` auto-applies schema changes.

## Desired End State

After implementation:
1. All 6 string fields are `NOT NULL DEFAULT ''` in the database
2. TypeORM entities use `string` type with `default: ''`
3. Response DTOs use `string` type without `nullable: true`
4. OpenAPI spec generates clean `type: string` (no nullable)
5. Orval generates `string` type (not `{ [key: string]: unknown } | null`)

### Verification Commands
```bash
# TypeScript compiles without errors
pnpm --filter @rbi/api build
pnpm --filter @rbi/web build

# Check generated types contain clean string types
grep -A2 "address" modules/web/src/lib/data/generated.ts
# Should show: address: string (not string | null or complex union)
```

## What We're NOT Doing

- Production migration scripts (no production yet)
- Frontend component changes (components don't exist yet)
- ESLint configuration changes (not needed until components exist)
- Changes to foreign key nullability (`parent_id`, `area_id`)
- Changes to date/numeric nullability (`expiry_date`, `cost_per_unit`, etc.)

## Implementation Approach

Update backend entities and DTOs first, then regenerate the frontend client. TypeORM's `synchronize: true` handles database schema changes automatically in development.

---

## Phase 1: Backend Entity Changes

### Overview
Update TypeORM entities to use non-nullable columns with empty string defaults.

### Changes Required

#### 1. Location Entity
**File**: `modules/api/src/routes/locations/entities/location.entity.ts`

**Change lines 28-38** - Remove `nullable: true`, add `default: ''`, change type to `string`:

```typescript
// BEFORE (lines 28-30)
@ApiProperty({ description: 'Physical address', nullable: true })
@Column({ type: 'text', nullable: true })
address: string | null;

// AFTER
@ApiProperty({ description: 'Physical address' })
@Column({ type: 'text', default: '' })
address: string;
```

```typescript
// BEFORE (lines 32-34)
@ApiProperty({ description: 'Contact person name', nullable: true })
@Column({ type: 'varchar', nullable: true })
contact_person: string | null;

// AFTER
@ApiProperty({ description: 'Contact person name' })
@Column({ type: 'varchar', default: '' })
contact_person: string;
```

```typescript
// BEFORE (lines 36-38)
@ApiProperty({ description: 'Phone number', nullable: true })
@Column({ type: 'varchar', nullable: true })
phone: string | null;

// AFTER
@ApiProperty({ description: 'Phone number' })
@Column({ type: 'varchar', default: '' })
phone: string;
```

#### 2. Area Entity
**File**: `modules/api/src/routes/areas/entities/area.entity.ts`

**Change lines 55-68** - Update `code` and `description` fields:

```typescript
// BEFORE (lines 55-61)
@ApiProperty({
  description: 'Area code (short identifier)',
  example: 'A1',
  nullable: true,
})
@Column({ type: 'varchar', length: 50, nullable: true })
code: string | null;

// AFTER
@ApiProperty({
  description: 'Area code (short identifier)',
  example: 'A1',
})
@Column({ type: 'varchar', length: 50, default: '' })
code: string;
```

```typescript
// BEFORE (lines 63-68)
@ApiProperty({
  description: 'Area description',
  nullable: true,
})
@Column({ type: 'text', nullable: true })
description: string | null;

// AFTER
@ApiProperty({
  description: 'Area description',
})
@Column({ type: 'text', default: '' })
description: string;
```

#### 3. Inventory Entity
**File**: `modules/api/src/routes/inventory/entities/inventory.entity.ts`

**Change lines 66-68** - Update `batch_number` field:

```typescript
// BEFORE (lines 66-68)
@ApiProperty({ description: 'Batch number', nullable: true })
@Column({ type: 'varchar', nullable: true })
batch_number: string | null;

// AFTER
@ApiProperty({ description: 'Batch number' })
@Column({ type: 'varchar', default: '' })
batch_number: string;
```

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles: `pnpm --filter @rbi/api build`
- [x] API starts without errors: `pnpm --filter @rbi/api start:dev` (verify no TypeORM errors)

---

## Phase 2: Backend DTO Changes

### Overview
Update response DTOs to reflect non-nullable string types.

### Changes Required

#### 1. LocationResponseDto
**File**: `modules/api/src/routes/locations/dto/location-response.dto.ts`

**Change lines 26-45** - Remove `nullable: true` and change types:

```typescript
// BEFORE (lines 26-31)
@ApiProperty({
  description: 'Physical address',
  nullable: true,
  example: '123 Harbor Drive, Miami, FL 33101',
})
address: string | null;

// AFTER
@ApiProperty({
  description: 'Physical address',
  example: '123 Harbor Drive, Miami, FL 33101',
})
address: string;
```

```typescript
// BEFORE (lines 33-38)
@ApiProperty({
  description: 'Contact person name',
  nullable: true,
  example: 'John Smith',
})
contact_person: string | null;

// AFTER
@ApiProperty({
  description: 'Contact person name',
  example: 'John Smith',
})
contact_person: string;
```

```typescript
// BEFORE (lines 40-45)
@ApiProperty({
  description: 'Phone number',
  nullable: true,
  example: '+1-555-123-4567',
})
phone: string | null;

// AFTER
@ApiProperty({
  description: 'Phone number',
  example: '+1-555-123-4567',
})
phone: string;
```

#### 2. AreaResponseDto
**File**: `modules/api/src/routes/areas/dto/area-response.dto.ts`

**Change lines 18-22** - Remove `nullable: true` and change types:

```typescript
// BEFORE (lines 18-19)
@ApiProperty({ description: 'Area code', nullable: true })
code: string | null;

// AFTER
@ApiProperty({ description: 'Area code' })
code: string;
```

```typescript
// BEFORE (lines 21-22)
@ApiProperty({ description: 'Area description', nullable: true })
description: string | null;

// AFTER
@ApiProperty({ description: 'Area description' })
description: string;
```

#### 3. InventoryResponseDto
**File**: `modules/api/src/routes/inventory/dto/inventory-response.dto.ts`

**Change lines 94-99** - Update `batch_number`:

```typescript
// BEFORE (lines 94-99)
@ApiProperty({
  description: 'Batch number',
  nullable: true,
  example: 'BATCH-2024-001',
})
batch_number: string | null;

// AFTER
@ApiProperty({
  description: 'Batch number',
  example: 'BATCH-2024-001',
})
batch_number: string;
```

**Change lines 36-37 in AreaSummaryDto** - Update embedded `code` field:

```typescript
// BEFORE (lines 36-37)
@ApiProperty({ description: 'Area code', nullable: true })
code: string | null;

// AFTER
@ApiProperty({ description: 'Area code' })
code: string;
```

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles: `pnpm --filter @rbi/api build`

---

## Phase 3: Regenerate API Client

### Overview
Regenerate OpenAPI spec and frontend client to get clean types.

### Steps

```bash
# 1. Generate OpenAPI spec from backend
pnpm --filter @rbi/api openapi:generate

# 2. Copy to repository root (source of truth for frontend)
cp modules/api/openapi.yaml openapi.yaml

# 3. Regenerate frontend client
pnpm --filter @rbi/web api:gen
```

### Success Criteria

#### Automated Verification:
- [x] OpenAPI generates: `pnpm --filter @rbi/api openapi:generate`
- [x] Frontend client generates: `pnpm --filter @rbi/web api:gen`
- [x] Frontend builds: `pnpm --filter @rbi/web build`

#### Manual Verification:
- [x] Check `modules/web/src/lib/data/generated.ts` contains clean types:
  - `address: string` (not `string | null` or complex union)
  - `contact_person: string`
  - `phone: string`
  - `code: string`
  - `description: string`
  - `batch_number: string`

---

## Phase 4: Final Verification

### Overview
Verify the complete stack works correctly.

### Steps

```bash
# Full build check
pnpm build

# Lint check
pnpm lint

# Start API and verify Swagger docs
pnpm --filter @rbi/api start:dev
# Visit http://localhost:8080/api/docs - verify schemas show non-nullable strings
```

### Success Criteria

#### Automated Verification:
- [x] Full build passes: `pnpm build`
- [x] Lint passes: `pnpm lint`

#### Manual Verification:
- [ ] Swagger UI at `/api/docs` shows fields without `nullable: true`
- [ ] Creating a location/area/inventory with empty optional fields works (saves as empty string)

---

## Summary of File Changes

| File | Changes |
|------|---------|
| `modules/api/src/routes/locations/entities/location.entity.ts` | 3 fields: remove nullable, add default |
| `modules/api/src/routes/areas/entities/area.entity.ts` | 2 fields: remove nullable, add default |
| `modules/api/src/routes/inventory/entities/inventory.entity.ts` | 1 field: remove nullable, add default |
| `modules/api/src/routes/locations/dto/location-response.dto.ts` | 3 fields: remove nullable from type |
| `modules/api/src/routes/areas/dto/area-response.dto.ts` | 2 fields: remove nullable from type |
| `modules/api/src/routes/inventory/dto/inventory-response.dto.ts` | 2 fields: batch_number + AreaSummaryDto.code |
| `openapi.yaml` | Auto-regenerated |
| `modules/web/src/lib/data/generated.ts` | Auto-regenerated |

## References

- Research document: `thoughts/shared/research/2025-12-28-nullable-strings-schema-analysis.md`
