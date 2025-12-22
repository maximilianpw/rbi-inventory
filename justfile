# Bootstrap all modules
bootstrap:
  just modules/web/bootstrap
  cd modules/api && pnpm install
  just modules/api/bootstrap

# Decrypt environment variables for all apps
decrypt:
  just modules/web/decrypt
  just modules/api/decrypt

# Start all services (PostgreSQL, NestJS, Next.js)
dev:
  devenv up

# Frontend commands
web:
  just modules/web/dev

# NestJS API commands
nest:
  cd modules/api && pnpm start:dev

nest-build:
  cd modules/api && pnpm build

nest-test:
  cd modules/api && pnpm test

# Linting
lint:
  just modules/web/lint
  cd modules/api && pnpm lint

# Testing
wtest:
  just modules/web/test

test-all:
  just modules/web/test
  cd modules/api && pnpm test

# API client generation from OpenAPI spec
api-gen:
  cd modules/web && pnpm api:gen

# Database migrations (Go API)
migrate-up:
  just modules/api/migrate-up

migrate-down:
  just modules/api/migrate-down

migrate-status:
  just modules/api/migrate-status
# Backend commands
api:
  just modules/api/dev

build-api:
  just modules/api/build

start-api:
  just modules/api/start

api-lint:
  just modules/api/lint

api-test:
  just modules/api/test
