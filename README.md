# LibreStock - Open Source Inventory Management

**Self-hostable inventory management for businesses of all sizes.**

LibreStock is a modern, full-stack inventory management system designed to be deployed anywhere - from a single server in your office to cloud infrastructure. Whether you're managing yacht provisioning, warehouse stock, retail inventory, or any other business that needs to track products and supplies, LibreStock provides the tools you need.

## Deployment Models

- **Self-Hosted**: Install the server on one machine, connect clients from multiple PCs on your network
- **Cloud-Hosted**: Deploy to your cloud provider of choice (planned hosted service coming soon)
- **Hybrid**: Run your server locally with remote access for distributed teams

## Project Vision

LibreStock is being developed to provide a modern, user-friendly alternative to complex enterprise inventory systems. The system will evolve in phases:

### Phase 1: Inventory Management (In Development)

A comprehensive internal inventory management system that helps track stock, organize items, monitor supplier details, and prevent shortages.

### Phase 2: Task Management (Planned)

A user-friendly task management system integrated with inventory. Unlike generic project management tools, this will be:

- Designed with non-technical users in mind
- Integrated directly with inventory data
- Focused on order fulfillment and procurement workflows
- Connected to active orders and delivery schedules

### Phase 3: Client Portal (Future)

A dedicated portal for your customers to:

- Track delivery status in real-time
- View order history
- Place quick reorders of previously purchased items
- Streamline communication between clients and your team

---

## Planned Features (Phase 1)

The inventory management system will provide:

- **Categories** to organize items by product type (e.g., "Bathroom Amenities", "Linens", "Cosmetics")
- **Brands** to track and filter items by manufacturer/brand
- **Items** with comprehensive tracking:
  - Quantity, weight, volume
  - Purchase price tracking
  - Expiry dates and shelf life
  - Minimum stock levels with automated alerts
  - Custom notes and specifications
  - Storage location tracking
- **Suppliers** database with:
  - Full contact information for quick reordering
  - Supplier details (address, email, phone, contact person)
  - Contract type (e.g., fixed-term, recurring, ad-hoc)
  - Supplier-specific pricing and terms
- **Editing History** with complete audit trail:
  - Track all changes to items, suppliers, and inventory records
  - User ID logging to identify who made each change
  - Timestamp tracking for accountability
- **Reports** providing business insights:
  - Inventory level reports (current stock across all items)
  - Inventory value reports (total asset value based on purchase prices)
  - Low stock notifications (items below minimum threshold)
  - Upcoming expiry warnings
  - Usage trends and shortage history
  - Most frequently ordered items
- **Photos** for visual documentation and identification
- **Usages** tracking to record stock changes (sales, usage, returns)

---

## Tech Stack

### Frontend

- **TanStack Start** (TanStack Router + Vite) with **React 19** for the user interface
- **TanStack Query/Form** for data fetching and form handling
- **Tailwind CSS** with **Radix UI** for styling
- **Clerk** for authentication
- **Orval** for generating typed API hooks from OpenAPI spec

### Backend

- **NestJS 11** with **TypeScript** for API server
- **TypeORM** for database ORM
- **PostgreSQL 16** for data persistence
- **Clerk** for JWT authentication
- **OpenAPI/Swagger** for API documentation

### Tooling

- **pnpm workspaces** for monorepo management
- **devenv.sh** for development environment

---

## Getting Started

### Prerequisites

- Node.js 18+ for development
- pnpm for package management
- PostgreSQL 16+ for database

### Development Setup

```bash
# Install dependencies
pnpm install

# Start development environment (PostgreSQL + API + Web)
devenv up

# Or manually:
pnpm --filter @librestock/api start:dev    # API on :8080
pnpm --filter @librestock/web dev          # Web on :3000
```

### API Documentation

- Swagger UI: http://localhost:8080/api/docs
- OpenAPI spec: `openapi.yaml` (repo root)

---

## Core Concepts

### Domain Model

```
Product   ← catalog item (SKU, name, category, reorder point)
Location  ← physical place (warehouse, supplier, client, in-transit)
Area      ← zone within a location (shelf, bin, cold storage)
Inventory ← quantity of a product at a location/area
```

### Inventory Management

- **Products**: Catalog items with SKU, category, pricing, and reorder points
- **Categories**: Hierarchical organization by product type (e.g., "Bathroom Amenities", "Linens")
- **Locations**: Physical places where inventory is stored (warehouses, suppliers, clients)
- **Areas**: Optional granular placement within locations (zones, shelves, bins)
- **Inventory**: Tracks quantities of products at specific locations/areas
- **Suppliers**: Contact database for procurement with contract type tracking
- **Minimum Level**: Automated low-stock alerts when quantity drops below threshold
- **Audit History**: Complete accountability trail with user ID tracking for all changes

### Example Workflow

1. Customer places order
2. Staff checks inventory availability
3. Items below minimum level trigger supplier reorder
4. Usage records track fulfillment
5. Statistics inform purchasing decisions

### Planned Features (Phase 2 & 3)

- Order management integrated with task tracking
- Delivery scheduling and status updates
- Client portal for order tracking and reordering
- Automated notification system for clients
- Enhanced reporting for business analytics

---

## Development Roadmap

### 🔄 Phase 1: Inventory Management (In Development)

- Core inventory tracking
- Supplier management
- Low stock alerts
- Usage history
- Basic statistics

### 📋 Phase 2: Task Management (Planned)

- Custom task board (simplified Jira alternative)
- Order-to-task linking
- Team collaboration features
- Delivery scheduling
- Integrated with inventory system

### 🚀 Phase 3: Client Portal (Future)

- Client authentication and profiles
- Real-time delivery tracking
- Order history viewing
- Quick reorder functionality
- Client-staff messaging

---

## Use Cases

LibreStock can be adapted for various industries:

- **Provisioning & Catering**: Manage supplies for yacht provisioning, event catering, or hospitality
- **Retail**: Track store inventory across multiple locations
- **Warehouse Management**: Monitor stock levels, areas, and supplier relationships
- **Manufacturing**: Track raw materials and finished goods
- **Healthcare**: Manage medical supplies with expiry tracking
- **Any business** that needs to track products, locations, and suppliers

## Project Goals

LibreStock is being developed as an open source Master's degree project with the following design principles:

- **User-friendly**: Intuitive interfaces for non-technical users
- **Flexible**: Adaptable to different industries and workflows
- **Self-hostable**: Full control over your data and infrastructure
- **Modern stack**: Built with current best practices and technologies
- **Multi-stakeholder**: Support for internal staff and external clients
- **Scalable**: Designed to grow with your business

---

## License

**GNU Affero General Public License v3.0 (AGPL-3.0)**

This project is free and open source software licensed under the AGPL-3.0 license. This ensures that:

- Anyone can use, modify, and distribute LibreStock
- If you host LibreStock as a service (cloud or on-premise), you must share your modifications
- The software and all derivatives remain free and open source

See the [LICENSE](LICENSE) file for full details.

This project is developed as part of a Master's degree program and is committed to remaining free and open source software.
