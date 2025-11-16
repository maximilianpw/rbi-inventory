# RBI Inventory NestJS API

REST API for RBI Inventory Management System built with NestJS.

## Features

- 🔐 **Clerk Authentication** - JWT-based auth with Clerk SDK
- 📝 **OpenAPI/Swagger** - Auto-generated API documentation
- ✅ **Validation** - Request validation with class-validator
- 🏷️ **TypeScript** - Full type safety
- 📊 **Logging** - Structured logging with request IDs
- 🎯 **Guards & Decorators** - Custom auth guards and user decorators

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Configuration

Copy the environment template:

```bash
cp .env.template .env
```

Set the following environment variables in `.env`:

```env
PORT=8080
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=postgresql://postgres@/rbi_inventory
```

### Running the Application

```bash
# Development mode with hot reload
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

The API will be available at `http://localhost:8080`

### API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8080/api`

## Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── dto/               # Auth DTOs
│   ├── auth.controller.ts # Auth endpoints
│   └── auth.module.ts
├── users/                  # Users module
│   ├── dto/               # User DTOs
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── categories/            # Categories module
│   ├── dto/
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   └── categories.module.ts
├── products/              # Products module
│   ├── dto/
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.module.ts
├── health/                # Health check module
│   ├── health.controller.ts
│   └── health.module.ts
├── common/                # Shared utilities
│   ├── decorators/        # Custom decorators
│   │   ├── current-user.decorator.ts
│   │   └── clerk-claims.decorator.ts
│   ├── guards/            # Auth guards
│   │   └── clerk-auth.guard.ts
│   ├── middleware/        # Middleware
│   │   └── request-id.middleware.ts
│   ├── interceptors/      # Interceptors
│   │   └── logging.interceptor.ts
│   └── dto/               # Common DTOs
│       ├── error-response.dto.ts
│       └── message-response.dto.ts
├── app.module.ts          # Root module
└── main.ts                # Application entry point
```

## Authentication

All `/api/v1/*` endpoints (except `/health-check`) require Clerk JWT authentication.

### Using the API with Authentication

Include the Clerk JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN" \
  http://localhost:8080/api/v1/users
```

### Custom Decorators

#### `@CurrentUser()`

Extract the authenticated user from the request:

```typescript
@Get('me')
getMe(@CurrentUser() user: any) {
  return user; // { userId, sessionId, sessionClaims }
}

// Extract specific field
@Get('id')
getUserId(@CurrentUser('userId') userId: string) {
  return userId;
}
```

#### `@ClerkClaims()`

Extract Clerk session claims:

```typescript
@Get('claims')
getClaims(@ClerkClaims() claims: any) {
  return claims; // Full JWT claims
}
```

## API Endpoints

### Health

- `GET /health-check` - Health status (no auth required)

### Authentication

- `GET /api/v1/auth/profile` - Get current user profile from Clerk
- `GET /api/v1/auth/session-claims` - Get JWT session claims

### Users

- `GET /api/v1/users` - List all users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/search?q=query` - Search users by name

### Categories

- `GET /api/v1/categories` - List all categories (with tree structure)
- `POST /api/v1/categories` - Create category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Products

- `GET /api/v1/products` - List all products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/:id` - Get product by ID
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `GET /api/v1/products/category/:categoryId` - Get products by category
- `GET /api/v1/products/category/:categoryId/tree` - Get products by category tree

## Development

### Build

```bash
pnpm run build
```

### Linting

```bash
pnpm run lint
```

### Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## Ported from Go API

This implementation is ported from the Go/Gin API and includes:

- ✅ Clerk authentication guard (equivalent to Go middleware)
- ✅ Request ID middleware
- ✅ Structured logging with request IDs
- ✅ Current user extraction decorators
- ✅ All API endpoints from OpenAPI spec
- ✅ Input validation
- ✅ Error handling

## License

MIT
