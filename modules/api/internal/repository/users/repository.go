package users

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"

	"github.com/maximilianpw/rbi-inventory/internal/models"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	List(ctx context.Context, filters map[string]interface{}) ([]*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id uuid.UUID) error
	UpdateLastLogin(ctx context.Context, id uuid.UUID) error
	SearchByName(ctx context.Context, searchTerm string) ([]*models.User, error)
}

type userRepository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) UserRepository {
	return &userRepository{db: db}
}

// Create implements UserRepository
func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	// Generate UUID if not provided
	if user.ID == uuid.Nil {
		user.ID = uuid.New()
	}

	query := `
		INSERT INTO users (
			id, name, email, role, is_active, created_at, updated_at
		) VALUES (
			:id, :name, :email, :role, :is_active, NOW(), NOW()
		) RETURNING id, created_at, updated_at
	`

	rows, err := r.db.NamedQueryContext(ctx, query, user)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	defer rows.Close()

	if rows.Next() {
		err = rows.Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return fmt.Errorf("failed to scan created user: %w", err)
		}
	}

	return nil
}

// GetByID implements UserRepository
func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User

	query := `SELECT * FROM users WHERE id = $1`

	err := r.db.GetContext(ctx, &user, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// GetByEmail implements UserRepository
func (r *userRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User

	query := `SELECT * FROM users WHERE email = $1`

	err := r.db.GetContext(ctx, &user, query, email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// List implements UserRepository
func (r *userRepository) List(ctx context.Context, filters map[string]interface{}) ([]*models.User, error) {
	users := []*models.User{}

	// Build query with optional filters
	query := `SELECT * FROM users WHERE 1=1`
	args := []interface{}{}
	argCount := 1

	// Apply filters if provided
	if role, ok := filters["role"].(string); ok && role != "" {
		query += fmt.Sprintf(" AND role = $%d", argCount)
		args = append(args, role)
		argCount++
	}

	if isActive, ok := filters["is_active"].(bool); ok {
		query += fmt.Sprintf(" AND is_active = $%d", argCount)
		args = append(args, isActive)
		argCount++
	}

	query += " ORDER BY name ASC"

	// Execute query
	err := r.db.SelectContext(ctx, &users, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}

	return users, nil
}

// ListAll is a convenience method to get all users
func (r *userRepository) ListAll(ctx context.Context) ([]*models.User, error) {
	return r.List(ctx, nil)
}

// ListActive returns only active users
func (r *userRepository) ListActive(ctx context.Context) ([]*models.User, error) {
	return r.List(ctx, map[string]interface{}{
		"is_active": true,
	})
}

// Update implements UserRepository
func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	query := `
		UPDATE users SET
			name = :name,
			email = :email,
			role = :role,
			is_active = :is_active,
			updated_at = NOW()
		WHERE id = :id
	`

	result, err := r.db.NamedExecContext(ctx, query, user)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// Delete implements UserRepository
func (r *userRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// UpdateLastLogin implements UserRepository
func (r *userRepository) UpdateLastLogin(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE users 
		SET last_login = NOW(), updated_at = NOW()
		WHERE id = $1
	`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// SearchByName searches users by name (case-insensitive)
func (r *userRepository) SearchByName(ctx context.Context, searchTerm string) ([]*models.User, error) {
	users := []*models.User{}

	query := `
		SELECT * FROM users 
		WHERE name ILIKE $1 
		ORDER BY name ASC
		LIMIT 50
	`

	err := r.db.SelectContext(ctx, &users, query, "%"+searchTerm+"%")
	if err != nil {
		return nil, fmt.Errorf("failed to search users: %w", err)
	}

	return users, nil
}

// CountByRole returns the count of users for a specific role
func (r *userRepository) CountByRole(ctx context.Context, role string) (int, error) {
	var count int

	query := `SELECT COUNT(*) FROM users WHERE role = $1`

	err := r.db.GetContext(ctx, &count, query, role)
	if err != nil {
		return 0, fmt.Errorf("failed to count users by role: %w", err)
	}

	return count, nil
}
