package dtos

import (
	"time"

	"github.com/google/uuid"
	"github.com/maximilianpw/rbi-inventory/internal/models"
)

type CategoryResponse struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	ParentID    *uuid.UUID `json:"parent_id,omitempty"`
	Description *string    `json:"description,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type CategoryWithChildrenResponse struct {
	ID          uuid.UUID           `json:"id"`
	Name        string              `json:"name"`
	ParentID    *uuid.UUID          `json:"parent_id,omitempty"`
	Description *string             `json:"description,omitempty"`
	Children    []CategoryResponse  `json:"children"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
}

type CreateCategoryRequest struct {
	Name        string     `json:"name" binding:"required,min=1,max=100"`
	ParentID    *uuid.UUID `json:"parent_id,omitempty"`
	Description *string    `json:"description,omitempty" binding:"omitempty,max=500"`
}

func (r *CreateCategoryRequest) ToModel() *models.Category {
	return &models.Category{
		ID:          uuid.New(),
		Name:        r.Name,
		ParentID:    r.ParentID,
		Description: r.Description,
	}
}

type UpdateCategoryRequest struct {
	Name        *string     `json:"name,omitempty" binding:"omitempty,min=1,max=100"`
	ParentID    *uuid.UUID  `json:"parent_id,omitempty"`
	Description *string     `json:"description,omitempty" binding:"omitempty,max=500"`
}
