---
date: 2025-12-25T23:23:19+01:00
researcher: Claude Code
git_commit: e872f5c915c184e828fac95ba43b89df5f60d862
branch: main
repository: maximilianpw/rbi-inventory
topic: "MkDocs Material Documentation Planning"
tags: [research, codebase, documentation, mkdocs, user-docs, developer-docs]
status: complete
last_updated: 2025-12-25
last_updated_by: Claude Code
---

# Research: MkDocs Material Documentation Planning

**Date**: 2025-12-25T23:23:19+01:00
**Researcher**: Claude Code
**Git Commit**: e872f5c915c184e828fac95ba43b89df5f60d862
**Branch**: main
**Repository**: maximilianpw/rbi-inventory

## Research Question

The user wants to create documentation for the RBI Inventory project using MkDocs Material with two main audiences:
1. **User Documentation** - Help for product usage
2. **Developer Documentation** - Testing, code practices, development workflow

API endpoints should NOT be documented as this is already covered by OpenAPI/Swagger.

## Summary

The RBI Inventory System is a yacht provisioning inventory management application built with NestJS (backend) and Next.js (frontend). The codebase has scattered documentation across CLAUDE.md files and READMEs but lacks a unified, user-facing documentation site. The project has:

- Comprehensive testing infrastructure for the API module (Jest)
- Well-defined code practices via ESLint/Prettier/TypeScript configs
- A Nix-based development environment (devenv.sh)
- Rich domain entities for inventory, orders, suppliers, and audit trails
- OpenAPI-first workflow with generated TypeScript hooks

MkDocs Material is an excellent choice that can consolidate this information into a searchable, navigable documentation site.

---

## Detailed Findings

### 1. Existing Documentation State

#### Current Documentation Files

| File | Content Summary |
|------|-----------------|
| `/README.md` | Business context, vision, tech stack overview |
| `/CLAUDE.md` | Architecture diagram, commands, module patterns |
| `/modules/api/README.md` | NestJS features, Clerk auth, decorators |
| `/modules/api/CLAUDE.md` | Directory structure, entities, DTOs, HATEOAS |
| `/modules/web/README.md` | Basic Next.js getting started |
| `/modules/web/CLAUDE.md` | Provider hierarchy, API integration, forms, i18n |
| `/.github/README.md` | CI/CD workflows, secrets, troubleshooting |
| `/docs/architecture/diagram.md` | Mermaid system diagram (outdated Go references) |
| `/docs/reports/2025-11-26.md` | Status report with security/quality assessment |

#### What's Missing

- No unified documentation generator (no mkdocs.yml, docusaurus, vitepress)
- No `.env.example` files for environment reference
- No CONTRIBUTING.md or CHANGELOG.md
- No testing guide or documentation
- No deployment documentation
- No user-facing product documentation

### 2. Testing Infrastructure

#### API Module Testing

**Framework**: Jest 30.2.0 with ts-jest

**Test Types**:
- Unit tests: `*.spec.ts` colocated with source files
- E2E tests: `test/*.e2e-spec.ts` in dedicated folder

**Commands**:
```bash
pnpm test          # Run unit tests
pnpm test:watch    # Watch mode
pnpm test:cov      # Coverage report
pnpm test:e2e      # End-to-end tests
```

**Existing Test Coverage**:
- `products.service.spec.ts` - Product CRUD, bulk ops, validation
- `categories.service.spec.ts` - Tree structure, circular refs
- `audit-log.service.spec.ts` - Change tracking
- `audit-logs.controller.spec.ts` - HTTP endpoints
- `audit.interceptor.spec.ts` - Audit middleware
- `products.e2e-spec.ts` - Full HTTP lifecycle
- `categories.e2e-spec.ts` - Tree operations

**Testing Patterns**:
- Repository mocking with `jest.fn()` for all methods
- Guard overriding to bypass Clerk auth in tests
- Database cleanup in `beforeEach` for E2E
- RxJS observable testing with `subscribe()` and `done()`

#### Web Module Testing

**Status**: No testing framework configured. No test files exist.

### 3. Code Practices and Conventions

#### ESLint Configuration

**Base Rules** (all modules):
- Import ordering and cycle detection
- TypeScript strict mode rules
- Promise handling enforcement
- No unused variables (except `_` prefix)

**Web Module Additions**:
- React hooks rules (exhaustive-deps)
- Next.js best practices
- Accessibility (jsx-a11y)
- Complexity limits (max 500 lines, 100 per function)
- Naming conventions (camelCase, PascalCase, UPPER_CASE)

#### TypeScript Configuration

- Strict mode enabled across all modules
- Path aliases: `@/` for web, `src/` for API
- NestJS: decorator metadata enabled
- Next.js: JSX preserve, bundler resolution

#### File Naming Conventions

**API Module**:
```
routes/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── <entity>.repository.ts (singular)
├── entities/<entity>.entity.ts
└── dto/
    ├── create-<entity>.dto.ts
    └── <entity>-response.dto.ts
```

**Web Module**:
```
components/
├── ui/button.tsx (kebab-case)
├── products/ProductForm.tsx (PascalCase)
└── common/Header.tsx
```

#### Prettier Settings
- Single quotes, trailing commas
- 120 print width, 2-space tabs
- Single attribute per line

### 4. Product Features (for User Documentation)

#### Domain Entities

| Entity | Purpose |
|--------|---------|
| **Product** | Inventory items with SKU, pricing, physical specs |
| **Category** | Hierarchical product organization |
| **Supplier** | Vendor contact database |
| **Inventory** | Stock quantities at locations |
| **Location** | Warehouses, suppliers, transit points |
| **Stock Movement** | Transaction records (purchase, sale, waste, transfer) |
| **Order** | Customer yacht provisioning requests |
| **Order Item** | Line items within orders |
| **Client** | Yacht owners/companies |
| **Photo** | Product images |
| **Audit Log** | Complete change history |

#### Key User Workflows

1. **Product Management**: Create/edit products with QR scanning, category assignment, pricing
2. **Category Navigation**: Browse hierarchical tree structure
3. **Inventory Tracking**: Monitor stock levels, set reorder points
4. **Stock Movements**: Record purchases, sales, transfers, adjustments
5. **Order Processing**: Draft → Confirmed → Shipped → Delivered workflow
6. **Audit Trail**: View complete change history with before/after diffs

#### Frontend Features

- Multi-language support (EN, DE, FR)
- Dark/light theme toggle
- Grid/list view switching
- QR code barcode scanning
- Category tree navigation
- Search and filtering

### 5. Development Environment

#### Prerequisites

- Node.js >= 20
- pnpm >= 10
- Nix with flakes enabled
- devenv.sh installed

#### Quick Start

```bash
# Enter development shell
devenv shell

# Install dependencies
pnpm install

# Configure environment
cp modules/api/.env.template modules/api/.env
# Edit .env with CLERK_SECRET_KEY

# Start all services
devenv up   # or: pnpm dev
```

#### Services Started

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Database (rbi_inventory) |
| NestJS API | 8080 | Backend + Swagger at /api/docs |
| Next.js Web | 3000 | Frontend application |

#### OpenAPI Workflow

```bash
# 1. Generate spec from NestJS decorators
pnpm --filter @rbi/api openapi:generate

# 2. Generate TypeScript hooks for frontend
pnpm --filter @rbi/web api:gen
```

---

## Proposed MkDocs Structure

Based on the research, here's a recommended documentation structure:

```
docs/
├── index.md                     # Welcome, project overview
├── getting-started/
│   ├── installation.md          # Prerequisites, setup
│   ├── quick-start.md           # First steps, basic usage
│   └── configuration.md         # Environment variables, settings
│
├── user-guide/
│   ├── overview.md              # What the product does
│   ├── products/
│   │   ├── creating-products.md
│   │   ├── managing-inventory.md
│   │   └── qr-scanning.md
│   ├── categories/
│   │   └── organizing-products.md
│   ├── orders/
│   │   └── processing-orders.md
│   ├── suppliers/
│   │   └── managing-suppliers.md
│   └── audit-logs/
│       └── tracking-changes.md
│
├── development/
│   ├── architecture.md          # System design, tech stack
│   ├── setup.md                 # Dev environment, devenv.sh
│   ├── code-style.md            # ESLint, Prettier, conventions
│   ├── testing.md               # Jest, test patterns, running tests
│   ├── api-development.md       # NestJS patterns, entities, DTOs
│   ├── frontend-development.md  # Next.js, React Query, forms
│   └── ci-cd.md                 # GitHub workflows, secrets
│
├── contributing/
│   ├── guidelines.md            # How to contribute
│   ├── pull-requests.md         # PR process, templates
│   └── code-review.md           # Review standards
│
└── reference/
    ├── environment-variables.md # All env vars documented
    ├── cli-commands.md          # pnpm scripts, just commands
    └── troubleshooting.md       # Common issues, solutions
```

---

## MkDocs Material Configuration Recommendations

```yaml
site_name: RBI Inventory Documentation
site_description: Yacht provisioning inventory management system
repo_url: https://github.com/maximilianpw/rbi-inventory
repo_name: maximilianpw/rbi-inventory

theme:
  name: material
  palette:
    - scheme: default
      primary: indigo
      toggle:
        icon: material/brightness-7
        name: Switch to dark mode
    - scheme: slate
      primary: indigo
      toggle:
        icon: material/brightness-4
        name: Switch to light mode
  features:
    - navigation.instant
    - navigation.sections
    - navigation.tabs
    - navigation.top
    - search.suggest
    - search.highlight
    - content.code.copy
    - content.tabs.link

plugins:
  - search
  - git-revision-date-localized

markdown_extensions:
  - admonition
  - pymdownx.details
  - pymdownx.superfences
  - pymdownx.highlight
  - pymdownx.tabbed
  - attr_list
  - md_in_html
  - toc:
      permalink: true

nav:
  - Home: index.md
  - Getting Started:
    - Installation: getting-started/installation.md
    - Quick Start: getting-started/quick-start.md
    - Configuration: getting-started/configuration.md
  - User Guide:
    - Overview: user-guide/overview.md
    - Products: user-guide/products/
    - Categories: user-guide/categories/
    - Orders: user-guide/orders/
    - Audit Logs: user-guide/audit-logs/
  - Development:
    - Architecture: development/architecture.md
    - Setup: development/setup.md
    - Code Style: development/code-style.md
    - Testing: development/testing.md
    - API Development: development/api-development.md
    - Frontend Development: development/frontend-development.md
    - CI/CD: development/ci-cd.md
  - Contributing:
    - Guidelines: contributing/guidelines.md
    - Pull Requests: contributing/pull-requests.md
  - Reference:
    - Environment Variables: reference/environment-variables.md
    - CLI Commands: reference/cli-commands.md
    - Troubleshooting: reference/troubleshooting.md
```

---

## Code References

- Root README: `/README.md`
- Root CLAUDE.md: `/CLAUDE.md`
- API README: `/modules/api/README.md`
- Web CLAUDE.md: `/modules/web/CLAUDE.md`
- CI/CD docs: `/.github/README.md`
- ESLint config: `/packages/eslint-config/base.js`
- TypeScript config: `/packages/tsconfig/base.json`
- Jest config: `/modules/api/package.json:72-91`
- devenv config: `/devenv.nix`
- OpenAPI spec: `/openapi.yaml`

---

## Architecture Documentation

The system follows these patterns:

1. **OpenAPI-First**: Backend generates spec, frontend consumes typed hooks
2. **Repository Pattern**: TypeORM repositories abstract data access
3. **HATEOAS**: REST responses include hypermedia links
4. **Audit Trail**: Interceptor-based change tracking
5. **Provider Hierarchy**: React context providers wrap app in specific order
6. **Monorepo**: pnpm workspaces with shared packages

---

## Open Questions

1. Should user docs include screenshots/videos of the UI?
2. Should we include API examples in addition to OpenAPI reference?
3. Is there a preferred versioning strategy for docs (match release versions)?
4. Should documentation be translated for multi-language support?
5. Where should docs be hosted? (GitHub Pages, Netlify, Vercel?)

---

## Next Steps

1. Add MkDocs Material to project dependencies
2. Create `mkdocs.yml` at repository root
3. Create `docs/` directory structure
4. Migrate content from existing CLAUDE.md and README files
5. Add new content for user guide sections
6. Configure deployment (GitHub Pages recommended)
7. Add documentation build to CI pipeline
