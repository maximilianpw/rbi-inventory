# Structured Logger

A production-ready structured logger built on Go's standard `log/slog` library with JSON output formatting. This logger is designed to integrate seamlessly with Datadog and other observability platforms.

## Features

- **Structured Logging**: JSON output format compatible with Datadog and other log aggregation services
- **Log Levels**: Debug, Info, Warn, Error with configurable severity
- **Request Tracing**: Automatic request ID generation and tracking
- **Context Integration**: Logger can be passed through context for consistent logging across layers
- **Gin Middleware**: Automatic HTTP request/response logging
- **Field Enrichment**: Easy addition of contextual fields for better debugging

## Log Level Configuration

Set the `LOG_LEVEL` environment variable to control logging verbosity:

```bash
# Development
LOG_LEVEL=debug

# Production
LOG_LEVEL=info
```

Supported levels: `debug`, `info`, `warn`, `error`

## Usage

### Basic Logging

```go
log := logger.NewProduction()

log.Info("User created", "user_id", "123", "email", "user@example.com")
log.Error("Database error", "error", err.Error(), "operation", "insert_user")
log.Warn("Slow query detected", "duration_ms", 5000, "query", "SELECT ...")
```

### With Context

```go
ctx := log.WithContext(context.Background())
// Logger can be retrieved from context
logger := logger.FromContext(ctx)
```

### With Request ID

```go
log := logger.NewProduction()
requestLogger := log.WithRequestID("req-12345")
requestLogger.Info("Processing request")
```

### With User ID

```go
userLogger := log.WithUserID("user-456")
userLogger.Info("User action performed", "action", "update_profile")
```

### With Operation Name

```go
operationLogger := log.WithOperation("create_product")
operationLogger.Info("Operation started")
```

### Chaining Fields

Fields can be chained together:

```go
log.WithRequestID("req-123").
   WithUserID("user-456").
   WithOperation("update_product").
   Info("Product updated", "product_id", "prod-789")
```

## Gin Middleware Integration

The logger includes middleware for automatic HTTP request logging:

```go
r := gin.Default()
log := logger.NewProduction()

// Add logging middleware
r.Use(logger.GinMiddleware(log))

// Generates JSON logs like:
// {
//   "time": "2025-01-15T10:30:45.123Z",
//   "level": "INFO",
//   "msg": "HTTP request",
//   "request_id": "550e8400-e29b-41d4-a716-446655440000",
//   "method": "POST",
//   "path": "/api/products",
//   "status": 201,
//   "duration_ms": 125,
//   "client_ip": "192.168.1.1",
//   "user_agent": "Mozilla/5.0..."
// }
```

## Request ID Propagation

Request IDs are automatically generated and can be passed via the `X-Request-ID` header:

```bash
curl -X GET http://localhost:8080/api/users \
  -H "X-Request-ID: my-custom-request-id"
```

The response will contain the same request ID:

```
X-Request-ID: my-custom-request-id
```

## Datadog Integration

### Datadog Agent Configuration

The JSON logs are automatically formatted for Datadog ingestion. To integrate:

1. Ensure your Datadog agent is configured to collect logs from stdout/files
2. Set the appropriate service name and environment in your deployment

Example `datadog.yaml`:

```yaml
logs:
  - type: file
    path: /var/log/app.log
    service: inventory-api
    source: go
```

### Datadog JSON Attributes

The logger produces JSON output compatible with Datadog's JSON parsing:

```json
{
  "time": "2025-01-15T10:30:45.123Z",
  "level": "INFO",
  "msg": "User created",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123",
  "email": "user@example.com",
  "service": "inventory-api",
  "version": "1.0.0"
}
```

### Custom Attributes for Datadog

Add custom attributes that Datadog can index and search:

```go
log.Info("User action",
  "request_id", requestID,
  "user_id", userID,
  "action", "update_profile",
  "status", "success",
  "duration_ms", 250,
)
```

## Standard Fields

When logging, always include these standard fields for better observability:

| Field | Description | Example |
|-------|-------------|---------|
| `request_id` | Unique request identifier | `"550e8400-e29b-41d4-a716-446655440000"` |
| `user_id` | User performing the action | `"user-123"` |
| `operation` | Operation being performed | `"create_product"` |
| `duration_ms` | Operation duration in milliseconds | `250` |
| `error` | Error message (if error occurred) | `"connection timeout"` |
| `status` | Operation status | `"success"`, `"failed"`, `"pending"` |

## Layer-Specific Logging

### Handlers Layer

```go
// handlers/products/handler.go
func (h *ProductHandler) CreateProduct(c *gin.Context) {
    log := logger.FromContext(c.Request.Context()).
        WithOperation("create_product")
    
    log.Info("Creating product", "request_id", c.GetString("request_id"))
    
    product, err := h.svc.CreateProduct(c.Request.Context(), req)
    if err != nil {
        log.Error("Failed to create product", "error", err.Error())
        return
    }
    
    log.Info("Product created", "product_id", product.ID)
}
```

### Business/Service Layer

```go
// biz/products.go
func (s *ProductService) CreateProduct(ctx context.Context, req *CreateProductReq) (*Product, error) {
    log := logger.FromContext(ctx).WithOperation("create_product")
    
    // Validate
    if err := s.validateSKU(ctx, req.SKU); err != nil {
        log.Warn("SKU validation failed", "sku", req.SKU, "error", err.Error())
        return nil, err
    }
    
    log.Info("SKU validation passed")
    
    // Create
    product, err := s.repo.Create(ctx, req)
    if err != nil {
        log.Error("Failed to persist product", "error", err.Error())
        return nil, err
    }
    
    log.Info("Product persisted", "product_id", product.ID)
    return product, nil
}
```

### Repository Layer

```go
// repository/products/repository.go
func (r *productRepository) Create(ctx context.Context, req *CreateProductReq) (*Product, error) {
    log := logger.FromContext(ctx).WithOperation("insert_product")
    
    query := `INSERT INTO products (name, sku, price) VALUES ($1, $2, $3) RETURNING id`
    
    var id string
    err := r.db.QueryRowContext(ctx, query, req.Name, req.SKU, req.Price).Scan(&id)
    if err != nil {
        log.Error("Failed to insert product", "error", err.Error())
        return nil, err
    }
    
    log.Info("Product inserted", "product_id", id)
    return &Product{ID: id, Name: req.Name, SKU: req.SKU, Price: req.Price}, nil
}
```

## Testing with Logs

```go
func TestCreateProduct(t *testing.T) {
    log := logger.NewDevelopment()
    
    svc := NewProductService(repo, log)
    product, err := svc.CreateProduct(context.Background(), &CreateProductReq{
        Name:  "Test Product",
        SKU:   "TEST-001",
        Price: 99.99,
    })
    
    assert.NoError(t, err)
    assert.NotNil(t, product)
}
```

## Migration from log/fmt

Replace `log.Printf`, `log.Fatal`, etc. with structured logging:

### Before

```go
log.Printf("User created with ID: %s", userID)
log.Fatal("Database connection failed: %v", err)
```

### After

```go
log.Info("User created", "user_id", userID)
log.Fatal("Database connection failed", "error", err.Error())
```

## Best Practices

1. **Use structured fields**: Always pass key-value pairs instead of formatted strings
2. **Include context**: Add relevant fields like request_id, user_id, operation
3. **Use appropriate levels**: Debug for development, Info for normal operations, Warn for unusual situations, Error for failures
4. **Avoid sensitive data**: Don't log passwords, API keys, or PII
5. **Consistent field names**: Use the same field names across the application
6. **Trace requests**: Always include request_id for request tracing
7. **Chain operations**: Use WithRequestID, WithUserID, WithOperation for better context
