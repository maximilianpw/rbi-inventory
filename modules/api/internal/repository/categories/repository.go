package categories

import (
	"context"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/maximilianpw/rbi-inventory/internal/models"
)

type CategoryRepository interface {
	Create(ctx context.Context, category *models.Category) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Category, error)
	List(ctx context.Context) ([]*models.Category, error)
	GetChildren(ctx context.Context, parentID uuid.UUID) ([]*models.Category, error)
	Update(ctx context.Context, category *models.Category) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type categoryRepository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) Create(ctx context.Context, category *models.Category) error {
	query := `
		INSERT INTO categories (id, name, parent_id, description, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
	`
	_, err := r.db.ExecContext(ctx, query, category.ID, category.Name, category.ParentID, category.Description)
	return err
}

func (r *categoryRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Category, error) {
	query := `
		SELECT id, name, parent_id, description, created_at, updated_at
		FROM categories
		WHERE id = $1
	`
	var category models.Category
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&category.ID, &category.Name, &category.ParentID,
		&category.Description, &category.CreatedAt, &category.UpdatedAt,
	)
	return &category, err
}

func (r *categoryRepository) List(ctx context.Context) ([]*models.Category, error) {
	query := `
		SELECT id, name, parent_id, description, created_at, updated_at
		FROM categories
		ORDER BY name
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []*models.Category
	for rows.Next() {
		var category models.Category
		err := rows.Scan(
			&category.ID, &category.Name, &category.ParentID,
			&category.Description, &category.CreatedAt, &category.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		categories = append(categories, &category)
	}
	return categories, rows.Err()
}

func (r *categoryRepository) GetChildren(ctx context.Context, parentID uuid.UUID) ([]*models.Category, error) {
	query := `
		WITH RECURSIVE category_tree AS (
			SELECT id, name, parent_id, description, created_at, updated_at
			FROM categories
			WHERE parent_id = $1

			UNION ALL

			SELECT c.id, c.name, c.parent_id, c.description, c.created_at, c.updated_at
			FROM categories c
			JOIN category_tree ct ON c.parent_id = ct.id
		)
		SELECT * FROM category_tree ORDER BY name
	`
	rows, err := r.db.QueryContext(ctx, query, parentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []*models.Category
	for rows.Next() {
		var category models.Category
		err := rows.Scan(
			&category.ID, &category.Name, &category.ParentID,
			&category.Description, &category.CreatedAt, &category.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		categories = append(categories, &category)
	}
	return categories, rows.Err()
}

func (r *categoryRepository) Update(ctx context.Context, category *models.Category) error {
	query := `
		UPDATE categories
		SET name = $1, parent_id = $2, description = $3, updated_at = NOW()
		WHERE id = $4
	`
	_, err := r.db.ExecContext(ctx, query, category.Name, category.ParentID, category.Description, category.ID)
	return err
}

func (r *categoryRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM categories WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
