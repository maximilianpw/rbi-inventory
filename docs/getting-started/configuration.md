# Configuration

This guide covers all configuration options for RBI Inventory.

## Environment Variables

### Backend API

Located in `modules/api/.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key for authentication |
| `PORT` | No | API port (default: 8080) |
| `NODE_ENV` | No | Environment mode (development/production) |

**Example:**

```bash
DATABASE_URL=postgresql://user@localhost:5432/rbi_inventory
CLERK_SECRET_KEY=sk_test_...
PORT=8080
NODE_ENV=development
```

### Frontend Web

Located in `modules/web/.env.local`:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |

**Example:**

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Clerk Authentication

1. Create a Clerk application at https://clerk.com
2. Copy your API keys from the Clerk dashboard
3. Add them to your environment files

## Database Configuration

### Using devenv (Recommended)

The database is automatically configured when using devenv:

- Database name: `rbi_inventory`
- Host: `127.0.0.1`
- Port: `5432`

### Manual Configuration

Create the database:

```bash
createdb rbi_inventory
```

Set the connection string:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/rbi_inventory
```

## OpenAPI Configuration

The API generates OpenAPI documentation automatically:

1. Generate the spec: `pnpm --filter @rbi/api openapi:generate`
2. View at: http://localhost:8080/api/docs
3. Generate frontend hooks: `pnpm --filter @rbi/web api:gen`

## Next Steps

- [Architecture](../development/architecture.md) - Understand the system design
- [Development Setup](../development/setup.md) - Set up for development
