package dtos

import (
	"time"

	"github.com/google/uuid"

	"github.com/maximilianpw/rbi-inventory/internal/models"
)

// UserResponse represents the user data returned to clients
type UserResponse struct {
	ID        uuid.UUID  `json:"id"`
	Name      string     `json:"name"`
	Email     string     `json:"email"`
	Role      string     `json:"role"`
	IsActive  bool       `json:"is_active"`
	LastLogin *time.Time `json:"last_login,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

// CreateUserRequest represents the request body for creating a user
type CreateUserRequest struct {
	Name  string `json:"name" binding:"required,min=2,max=100"`
	Email string `json:"email" binding:"required,email"`
	Role  string `json:"role" binding:"required,oneof=ADMIN WAREHOUSE_MANAGER PICKER SALES"`
}

// ToModel converts CreateUserRequest to models.User
func (r *CreateUserRequest) ToModel() *models.User {
	return &models.User{
		ID:       uuid.New(),
		Name:     r.Name,
		Email:    r.Email,
		Role:     r.Role,
		IsActive: true,
	}
}

// UpdateUserRequest represents the request body for updating a user
// All fields are pointers so we can distinguish between "not provided" and "set to zero value"
type UpdateUserRequest struct {
	Name     *string `json:"name,omitempty" binding:"omitempty,min=2,max=100"`
	Email    *string `json:"email,omitempty" binding:"omitempty,email"`
	Role     *string `json:"role,omitempty" binding:"omitempty,oneof=ADMIN WAREHOUSE_MANAGER PICKER SALES"`
	IsActive *bool   `json:"is_active,omitempty"`
}

// UserListResponse is a wrapper for paginated user lists
type UserListResponse struct {
	Users []UserResponse `json:"users"`
	Total int            `json:"total"`
}

// Example validation tags explained:
// - required: field must be present
// - min=2: minimum length of 2 characters
// - max=100: maximum length of 100 characters
// - email: must be valid email format
// - oneof: value must be one of the specified options
// - omitempty: field is optional
