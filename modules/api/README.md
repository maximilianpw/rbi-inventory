# RBI Inventory API Module

This is the backend API for the RBI Inventory Management System, built with Go and PostgreSQL.

## Prerequisites

- Go 1.24 or higher
- PostgreSQL 14 or higher
- A `.env` file with database connection details

## Environment Setup

Create a `.env` file in the `modules/api` directory:

```bash
DATABASE_URL=postgres://username:password@localhost:5432/rbi_inventory?sslmode=disable
PORT=8080
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Database Setup

### Running Migrations

The project includes a migration tool to initialize and manage the database schema.

#### Initialize the Database

Run all pending migrations:

```bash
cd modules/api
go run cmd/migrate/main.go -action=up
```

#### Check Migration Status

View which migrations have been applied:

```bash
go run cmd/migrate/main.go -action=status
```

#### Rollback Last Migration

Rollback the most recent migration:

```bash
go run cmd/migrate/main.go -action=down
```

### Database Schema

The migration creates the following tables:

- **users** - System users with authentication
- **clients** - Customer/client information
- **categories** - Product categories (hierarchical)
- **brands** - Product brands
- **suppliers** - Supplier information
- **product_catalog** - Main product catalog
- **photos** - Product photos
- **supplier_products** - Supplier-product relationships
- **locations** - Warehouse/storage locations
- **inventory** - Current inventory levels by location
- **orders** - Customer orders
- **order_items** - Order line items
- **stock_movements** - Inventory movement history
- **audit_logs** - Audit trail for all changes

## Running the API

Start the development server:

```bash
cd modules/api
go run cmd/api/main.go
```

The API will be available at `http://localhost:8080`

## Project Structure

```
.
├── cmd/
│   ├── api/           # API server entrypoint
│   └── migrate/       # Database migration tool
├── internal/
│   ├── config/        # Configuration management
│   ├── database/      # Database connection
│   ├── handlers/      # HTTP handlers
│   ├── middleware/    # HTTP middleware
│   ├── models/        # Domain models
│   ├── repository/    # Data access layer
│   └── http/          # HTTP routing
├── migrations/        # SQL migration files
├── go.mod
└── README.md
```
