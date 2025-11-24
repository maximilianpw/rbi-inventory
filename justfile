# Bootstrap both frontend and backend
bootstrap:
  just modules/web/bootstrap
  just modules/nest/bootstrap

# Decrypt environment variables for both apps
decrypt:
  just modules/web/decrypt
  just modules/nest/decrypt

# Frontend commands
web:
  just modules/web/dev

lint:
  just modules/web/lint

wtest:
  just modules/web/test

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
