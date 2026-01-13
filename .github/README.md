# GitHub Actions CI/CD

This directory contains GitHub Actions workflows for the LibreStock Inventory monorepo.

## Workflows

### 🔄 CI Pipeline (`ci.yml`)

**Triggers:** Push to `main`, Pull Requests

**Smart Path Filtering:** Only runs jobs for changed modules

**Jobs:**
- **Detect Changes:** Determines which modules were modified
- **Lint:** Runs ESLint only on changed modules (API, Web, or both)
- **Type Check API:** TypeScript check for API (only if API or shared packages changed)
- **Type Check Web:** TypeScript check for Web (only if Web or shared packages changed)
- **Test API:** Runs Jest tests with PostgreSQL (only if API or shared packages changed)
- **Build API:** Builds API module (only if API or shared packages changed)
- **Build Web:** Builds Web module (only if Web or shared packages changed)

**Path-based Execution:**
- Changes to `modules/api/**` → Runs API jobs only
- Changes to `modules/web/**` → Runs Web jobs only
- Changes to `packages/**`, `package.json`, `pnpm-lock.yaml` → Runs ALL jobs (affects both modules)

**Environment Variables Required:**
- `CLERK_SECRET_KEY_TEST` (optional, falls back to dummy key for CI)

---

### 📄 OpenAPI Validation (`openapi.yml`)

**Triggers:** PRs modifying `openapi.yaml` or API source files

**Jobs:**
- **Validate:** Ensures `openapi.yaml` is up to date with API code
- **Check Frontend Sync:** Verifies frontend generated client matches OpenAPI spec

**How to Fix Issues:**
```bash
pnpm --filter @librestock/api openapi:generate
pnpm --filter @librestock/web api:gen
git add openapi.yaml modules/web/src/lib/data/generated.ts
git commit -m "chore: regenerate OpenAPI spec and client"
```

---

### 🏷️ PR Labeler (`pr-labeler.yml`)

**Triggers:** PR opened/updated

Automatically labels PRs based on changed files:
- `api` - Changes in `modules/api/`
- `web` - Changes in `modules/web/`
- `types` - Changes in `packages/types/`
- `config` - Changes in shared configs
- `dependencies` - Changes to package.json files
- `documentation` - Changes to markdown files
- `ci/cd` - Changes to GitHub Actions or devenv
- `openapi` - Changes to OpenAPI spec

Configuration: `.github/labeler.yml`

---

### 📏 PR Size Label (`pr-size.yml`)

**Triggers:** PR opened/updated

Automatically labels PRs by size:
- `size/xs` - 0-10 lines
- `size/s` - 11-100 lines
- `size/m` - 101-500 lines
- `size/l` - 501-1000 lines
- `size/xl` - 1000+ lines (with warning comment)

**Ignored Files:** `pnpm-lock.yaml`, `openapi.yaml`, generated API client

---

### 🔒 Dependency Review (`dependency-review.yml`)

**Triggers:** Pull Requests to `main`

Reviews dependency changes for:
- Security vulnerabilities (fails on moderate+)
- License compliance
- Supply chain risks

---

### 🛡️ CodeQL Security Scan (`codeql.yml`)

**Triggers:**
- Push to `main`
- Pull Requests
- Schedule: Mondays at 2:00 AM UTC

Performs automated security scanning for:
- SQL injection
- XSS vulnerabilities
- Authentication issues
- Sensitive data exposure
- Other OWASP Top 10 vulnerabilities

Results viewable in: **Security → Code scanning alerts**

---

## Required Secrets

Configure these in repository settings (Settings → Secrets and variables → Actions):

### Optional Secrets
- `CLERK_SECRET_KEY_TEST` - Clerk API key for testing (falls back to dummy if not set)

### For Production Deployment (if needed)
- `CLERK_SECRET_KEY` - Production Clerk API key
- `DATABASE_URL` - Production database connection string

---

## Status Badges

Add these to your main README.md:

```markdown
![CI Status](https://github.com/maximilianpw/librestock-inventory/workflows/CI/badge.svg)
![CodeQL](https://github.com/maximilianpw/librestock-inventory/workflows/CodeQL%20Security%20Scan/badge.svg)
```

---

## Local Development

To run checks locally before pushing:

```bash
# Full CI suite
pnpm lint          # Lint all packages
pnpm test          # Run all tests
pnpm build         # Build all packages

# Module-specific
pnpm --filter @librestock/api test
pnpm --filter @librestock/web type-check

# OpenAPI workflow
pnpm --filter @librestock/api openapi:generate
pnpm --filter @librestock/web api:gen
```

---

## Troubleshooting

### CI Failing on Lint
```bash
pnpm lint:fix  # Auto-fix issues where possible
```

### TypeScript Errors
```bash
cd modules/api && pnpm exec tsc --noEmit
cd modules/web && pnpm type-check
```

### Tests Failing Locally
Ensure PostgreSQL is running:
```bash
devenv up  # Starts all services
```

### OpenAPI Out of Sync
```bash
pnpm --filter @librestock/api openapi:generate
pnpm --filter @librestock/web api:gen
```

---

## Performance

- **Concurrency:** Jobs run in parallel where possible
- **Caching:** pnpm dependencies cached via `actions/setup-node`
- **Artifacts:** Build outputs retained for 7 days
- **Cancel in Progress:** Concurrent runs on same branch are cancelled

---

## Contributing

When adding new workflows:
1. Test locally with [act](https://github.com/nektos/act) if possible
2. Use concurrency groups to prevent parallel runs
3. Cache dependencies with `actions/setup-node`
4. Document required secrets and environment variables
5. Update this README
