# Sortly CSV Import Script

This script imports inventory data from the Sortly CSV export file into the database.

## What it does

The import script will:

1. **Create/Update Brands** - Extracts brands from the "Folder" column
2. **Create/Update Categories** - Parses category hierarchies from the "Notes" field
3. **Create/Update Products** - Creates products with their details
4. **Create Product Barcodes** - Stores barcode/QR code information
5. **Create/Update Inventory Items** - Tracks current stock levels, locations, and expiry dates
6. **Create Transaction History** - Records all inventory transactions

## Prerequisites

- PostgreSQL database must be running and accessible
- Database configuration must be set in your `.env` file
- The `sortly.csv` file must be in the project root (`/Users/max-vev/Local/rbi/`)

## Database Entities Created

The script uses the following entities:

- `brands` - Product brands (e.g., "Elemis")
- `categories` - Product categories with hierarchical structure
- `products` - Product master data
- `product_barcodes` - Barcode/QR code tracking
- `inventory_items` - Current stock levels and locations
- `inventory_transactions` - Transaction history

## Running the Script

From the `modules/nest` directory:

```bash
pnpm import:sortly
```

Or from the project root:

```bash
pnpm --filter rbi-api import:sortly
```

## CSV Format

The script expects a CSV file with the following columns:

- Entry Name
- Variant Details
- Sortly ID (SID)
- Unit
- Min Level
- Price
- Value
- Notes
- Tags
- Barcode/QR1-Data
- Barcode/QR1-Type
- Barcode/QR2-Data
- Barcode/QR2-Type
- Transaction Date (CEST)
- Transaction Type
- QTY change (Quantity Delta)
- New QTY
- Folder
- Folder SID
- User
- Transaction Note
- Location
- Expiry Date

## Notes

- The script will automatically create an "Uncategorized" category for products without category information
- Duplicate entries (same Sortly ID) will update existing records
- Transaction history is preserved for each inventory item
- The script uses database synchronization, so tables will be created automatically in development
