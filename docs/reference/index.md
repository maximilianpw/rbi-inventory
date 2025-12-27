# Reference

Technical reference documentation for RBI Inventory.

## Contents

- [Environment Variables](environment-variables.md) - All configuration options
- [CLI Commands](cli-commands.md) - Available command line commands
- [Troubleshooting](troubleshooting.md) - Common issues and solutions

## Quick Links

### API Documentation

The API is documented via OpenAPI/Swagger:

- **Local:** http://localhost:8080/api/docs
- **Spec file:** `openapi.yaml` in repository root

### Generated Types

Frontend TypeScript types are generated from the OpenAPI spec:

```bash
pnpm --filter @rbi/web api:gen
```

Generated files are in `modules/web/src/lib/data/generated.ts`.
