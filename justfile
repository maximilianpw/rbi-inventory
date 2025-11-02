# bootstrap both apps
bootstrap:
  cd modules/web && pnpm install

# start infra (db/redis/traefik)
up:
  docker compose -f docker-compose.dev.yml up -d

# stop infra
down:
  docker compose -f docker-compose.dev.yml down

# run both apps (two terminals recommended)
api:
  cd modules/api && go run cmd/api/main.go

web:
  cd modules/web && pnpm dev

# database migrations
migrate-up:
  cd modules/api && go run cmd/migrate/main.go -action=up

migrate-down:
  cd modules/api && go run cmd/migrate/main.go -action=down

migrate-status:
  cd modules/api && go run cmd/migrate/main.go -action=status

# lint & tests
lint:
  cd modules/web && pnpm lint && pnpm typecheck

test:
  cd modules/web && pnpm test
