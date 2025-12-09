# Bootstrap all modules
bootstrap:
  just modules/web/bootstrap
  cd modules/nest && pnpm install
  just modules/nest/bootstrap

# Decrypt environment variables for all apps
decrypt:
  just modules/web/decrypt
  just modules/nest/decrypt

# Start all services (PostgreSQL, NestJS, Next.js)
dev:
  devenv up

# Frontend commands
web:
  just modules/web/dev

# NestJS API commands
nest:
  cd modules/nest && pnpm start:dev

nest-build:
  cd modules/nest && pnpm build

nest-test:
  cd modules/nest && pnpm test

# Legacy Go API commands
api:
  just modules/api/run

# Linting
lint:
  just modules/web/lint

lint-all:
  just modules/web/lint
  cd modules/nest && pnpm lint

# Testing
wtest:
  just modules/web/test

test-all:
  just modules/web/test
  cd modules/nest && pnpm test

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
  just modules/nest/dev

build-api:
  just modules/nest/build

start-api:
  just modules/nest/start

api-lint:
  just modules/nest/lint

api-test:
  just modules/nest/test
