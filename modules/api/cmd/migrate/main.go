package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"

	"github.com/maximilianpw/rbi-inventory/internal/config"

	_ "github.com/lib/pq"
)

type Migration struct {
	Version  string
	Name     string
	UpPath   string
	DownPath string
}

func main() {
	// Parse command-line flags
	action := flag.String("action", "up", "Migration action: up, down, status")
	flag.Parse()

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	cfg := config.Load()

	// Connect to database
	db, err := sqlx.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	// Create migrations table if it doesn't exist
	if err := createMigrationsTable(db); err != nil {
		log.Fatalf("Failed to create migrations table: %v", err)
	}

	// Get migrations directory
	migrationsDir := "migrations"

	// Execute action
	switch *action {
	case "up":
		if err := migrateUp(db, migrationsDir); err != nil {
			log.Fatalf("Migration up failed: %v", err)
		}
		fmt.Println("Migrations applied successfully!")
	case "down":
		if err := migrateDown(db, migrationsDir); err != nil {
			log.Fatalf("Migration down failed: %v", err)
		}
		fmt.Println("Migration rolled back successfully!")
	case "status":
		if err := showStatus(db, migrationsDir); err != nil {
			log.Fatalf("Failed to show status: %v", err)
		}
	default:
		log.Fatalf("Unknown action: %s. Use 'up', 'down', or 'status'", *action)
	}
}

func createMigrationsTable(db *sqlx.DB) error {
	query := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`
	_, err := db.Exec(query)
	return err
}

func getMigrations(migrationsDir string) ([]Migration, error) {
	files, err := os.ReadDir(migrationsDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read migrations directory: %w", err)
	}

	migrationsMap := make(map[string]*Migration)

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		name := file.Name()
		if !strings.HasSuffix(name, ".sql") {
			continue
		}

		// Parse migration filename: 000001_init_schema.up.sql
		parts := strings.Split(name, "_")
		if len(parts) < 2 {
			continue
		}

		version := parts[0]
		migrationName := strings.TrimSuffix(strings.Join(parts[1:], "_"), ".up.sql")
		migrationName = strings.TrimSuffix(migrationName, ".down.sql")

		if _, exists := migrationsMap[version]; !exists {
			migrationsMap[version] = &Migration{
				Version: version,
				Name:    migrationName,
			}
		}

		fullPath := filepath.Join(migrationsDir, name)
		if strings.Contains(name, ".up.sql") {
			migrationsMap[version].UpPath = fullPath
		} else if strings.Contains(name, ".down.sql") {
			migrationsMap[version].DownPath = fullPath
		}
	}

	// Convert map to slice and sort
	migrations := make([]Migration, 0, len(migrationsMap))
	for _, m := range migrationsMap {
		migrations = append(migrations, *m)
	}

	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	return migrations, nil
}

func getAppliedMigrations(db *sqlx.DB) (map[string]bool, error) {
	rows, err := db.Query("SELECT version FROM schema_migrations")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	applied := make(map[string]bool)
	for rows.Next() {
		var version string
		if err := rows.Scan(&version); err != nil {
			return nil, err
		}
		applied[version] = true
	}

	return applied, rows.Err()
}

func migrateUp(db *sqlx.DB, migrationsDir string) error {
	migrations, err := getMigrations(migrationsDir)
	if err != nil {
		return err
	}

	applied, err := getAppliedMigrations(db)
	if err != nil {
		return err
	}

	for _, migration := range migrations {
		if applied[migration.Version] {
			fmt.Printf("Migration %s (%s) already applied, skipping\n", migration.Version, migration.Name)
			continue
		}

		if migration.UpPath == "" {
			return fmt.Errorf("missing up migration file for version %s", migration.Version)
		}

		fmt.Printf("Applying migration %s (%s)...\n", migration.Version, migration.Name)

		// Read migration file
		content, err := os.ReadFile(migration.UpPath)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", migration.UpPath, err)
		}

		// Execute migration in a transaction
		tx, err := db.Begin()
		if err != nil {
			return fmt.Errorf("failed to begin transaction: %w", err)
		}

		if _, err := tx.Exec(string(content)); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to execute migration %s: %w", migration.Version, err)
		}

		// Record migration
		if _, err := tx.Exec("INSERT INTO schema_migrations (version) VALUES ($1)", migration.Version); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to record migration %s: %w", migration.Version, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit migration %s: %w", migration.Version, err)
		}

		fmt.Printf("Migration %s applied successfully\n", migration.Version)
	}

	return nil
}

func migrateDown(db *sqlx.DB, migrationsDir string) error {
	migrations, err := getMigrations(migrationsDir)
	if err != nil {
		return err
	}

	applied, err := getAppliedMigrations(db)
	if err != nil {
		return err
	}

	// Find the last applied migration
	var lastMigration *Migration
	for i := len(migrations) - 1; i >= 0; i-- {
		if applied[migrations[i].Version] {
			lastMigration = &migrations[i]
			break
		}
	}

	if lastMigration == nil {
		fmt.Println("No migrations to roll back")
		return nil
	}

	if lastMigration.DownPath == "" {
		return fmt.Errorf("missing down migration file for version %s", lastMigration.Version)
	}

	fmt.Printf("Rolling back migration %s (%s)...\n", lastMigration.Version, lastMigration.Name)

	// Read migration file
	content, err := os.ReadFile(lastMigration.DownPath)
	if err != nil {
		return fmt.Errorf("failed to read migration file %s: %w", lastMigration.DownPath, err)
	}

	// Execute migration in a transaction
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	if _, err := tx.Exec(string(content)); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to execute migration %s: %w", lastMigration.Version, err)
	}

	// Remove migration record
	if _, err := tx.Exec("DELETE FROM schema_migrations WHERE version = $1", lastMigration.Version); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to remove migration record %s: %w", lastMigration.Version, err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit rollback %s: %w", lastMigration.Version, err)
	}

	fmt.Printf("Migration %s rolled back successfully\n", lastMigration.Version)
	return nil
}

func showStatus(db *sqlx.DB, migrationsDir string) error {
	migrations, err := getMigrations(migrationsDir)
	if err != nil {
		return err
	}

	applied, err := getAppliedMigrations(db)
	if err != nil {
		return err
	}

	fmt.Println("\nMigration Status:")
	fmt.Println("=================")

	for _, migration := range migrations {
		status := "[ ]"
		if applied[migration.Version] {
			status = "[✓]"
		}
		fmt.Printf("%s %s - %s\n", status, migration.Version, migration.Name)
	}

	fmt.Println()
	return nil
}
