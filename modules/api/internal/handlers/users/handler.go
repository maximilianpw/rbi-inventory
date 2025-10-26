package users

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/maximilianpw/rbi-inventory/internal/database"
	"github.com/maximilianpw/rbi-inventory/internal/handlers/users/dtos"
	"github.com/maximilianpw/rbi-inventory/internal/repository/users"
)

type userHandler struct {
	repo users.UserRepository
}

func (handler *userHandler) HandleGetUser(c *gin.Context) {
	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	user, err := handler.repo.GetByID(ctx, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	response := dtos.UserResponse{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		Role:      user.Role,
		IsActive:  user.IsActive,
		LastLogin: user.LastLogin,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}

	c.JSON(http.StatusOK, response)
}

// HandleGetUsers retrieves all users with optional filters
func (handler *userHandler) HandleGetUsers(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// Build filters from query parameters
	filters := make(map[string]interface{})

	if role := c.Query("role"); role != "" {
		filters["role"] = role
	}

	if active := c.Query("active"); active == "true" {
		filters["is_active"] = true
	} else if active == "false" {
		filters["is_active"] = false
	}

	users, err := handler.repo.List(ctx, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	responses := make([]dtos.UserResponse, 0, len(users))
	for _, user := range users {
		responses = append(responses, dtos.UserResponse{
			ID:        user.ID,
			Name:      user.Name,
			Email:     user.Email,
			Role:      user.Role,
			IsActive:  user.IsActive,
			LastLogin: user.LastLogin,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, responses)
}

// HandleCreateUser creates a new user
func (handler *userHandler) HandleCreateUser(c *gin.Context) {
	var req dtos.CreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// Check if email already exists
	existingUser, _ := handler.repo.GetByEmail(ctx, req.Email)
	if existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	// Create user model
	user := req.ToModel()

	// Save to database
	err := handler.repo.Create(ctx, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Return created user
	response := dtos.UserResponse{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		Role:      user.Role,
		IsActive:  user.IsActive,
		LastLogin: user.LastLogin,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}

	c.JSON(http.StatusCreated, response)
}

// HandleUpdateUser updates an existing user
func (handler *userHandler) HandleUpdateUser(c *gin.Context) {
	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	var req dtos.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// Get existing user
	user, err := handler.repo.GetByID(ctx, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	// Update fields if provided
	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.Email != nil {
		// Check if new email already exists (and it's not the same user)
		existingUser, _ := handler.repo.GetByEmail(ctx, *req.Email)
		if existingUser != nil && existingUser.ID != userID {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already in use"})
			return
		}
		user.Email = *req.Email
	}
	if req.Role != nil {
		user.Role = *req.Role
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	// Save changes
	err = handler.repo.Update(ctx, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	// Return updated user
	response := dtos.UserResponse{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		Role:      user.Role,
		IsActive:  user.IsActive,
		LastLogin: user.LastLogin,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}

	c.JSON(http.StatusOK, response)
}

// HandleDeleteUser deletes a user
func (handler *userHandler) HandleDeleteUser(c *gin.Context) {
	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	err = handler.repo.Delete(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// HandleDeactivateUser sets a user's is_active to false
func (handler *userHandler) HandleDeactivateUser(c *gin.Context) {
	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// Get user
	user, err := handler.repo.GetByID(ctx, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	// Deactivate
	user.IsActive = false
	err = handler.repo.Update(ctx, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to deactivate user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deactivated successfully"})
}

// HandleActivateUser sets a user's is_active to true
func (handler *userHandler) HandleActivateUser(c *gin.Context) {
	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// Get user
	user, err := handler.repo.GetByID(ctx, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	// Activate
	user.IsActive = true
	err = handler.repo.Update(ctx, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to activate user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User activated successfully"})
}

// HandleSearchUsers searches users by name
func (handler *userHandler) HandleSearchUsers(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query is required"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	users, err := handler.repo.SearchByName(ctx, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search users"})
		return
	}

	responses := make([]dtos.UserResponse, 0, len(users))
	for _, user := range users {
		responses = append(responses, dtos.UserResponse{
			ID:        user.ID,
			Name:      user.Name,
			Email:     user.Email,
			Role:      user.Role,
			IsActive:  user.IsActive,
			LastLogin: user.LastLogin,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, responses)
}

func NewHandler(db *database.DB) *userHandler {
	userRepo := users.NewRepository(db.DB)
	return &userHandler{repo: userRepo}
}

func BuildRoutes(rg *gin.RouterGroup, db *database.DB) {
	handler := NewHandler(db)

	// GET routes
	rg.GET("", handler.HandleGetUsers)           // GET /users?role=ADMIN&active=true
	rg.GET("/search", handler.HandleSearchUsers) // GET /users/search?q=max
	rg.GET("/:id", handler.HandleGetUser)        // GET /users/:id

	// POST routes
	rg.POST("", handler.HandleCreateUser)                    // POST /users
	rg.POST("/:id/deactivate", handler.HandleDeactivateUser) // POST /users/:id/deactivate
	rg.POST("/:id/activate", handler.HandleActivateUser)     // POST /users/:id/activate

	// PUT routes
	rg.PUT("/:id", handler.HandleUpdateUser) // PUT /users/:id

	// DELETE routes
	rg.DELETE("/:id", handler.HandleDeleteUser) // DELETE /users/:id
}
