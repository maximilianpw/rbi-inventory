# Logger Usage Examples

Quick reference for using the logger throughout your application.

## 1. In Handlers (HTTP Layer)

```go
package users

import (
	"github.com/gin-gonic/gin"
	"github.com/maximilianpw/rbi-inventory/internal/logger"
)

type userHandler struct {
	service bizusers.UserService
}

// HandleCreateUser creates a new user
func (h *userHandler) HandleCreateUser(c *gin.Context) {
	// Get logger from context (automatically populated by middleware)
	log := logger.FromContext(c.Request.Context()).
		WithOperation("create_user").
		WithUserID(c.GetString("user_id")) // if authenticated

	var req dtos.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Warn("Invalid request body", "error", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Info("Creating user", "email", req.Email)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	user, err := h.service.Create(ctx, req)
	if err != nil {
		if _, ok := err.(*bizusers.ConflictError); ok {
			log.Warn("User already exists", "email", req.Email)
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		log.Error("Failed to create user", "error", err.Error(), "email", req.Email)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	log.Info("User created successfully", "user_id", user.ID, "email", user.Email)
	c.JSON(http.StatusCreated, user)
}

// HandleGetUser retrieves a user by ID
func (h *userHandler) HandleGetUser(c *gin.Context) {
	log := logger.FromContext(c.Request.Context()).
		WithOperation("get_user")

	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		log.Warn("Invalid UUID format", "id", id)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	log = log.WithFields("user_id", userID.String())
	log.Info("Fetching user")

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	user, err := h.service.GetByID(ctx, userID)
	if err != nil {
		if _, ok := err.(*bizusers.NotFoundError); ok {
			log.Info("User not found")
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		log.Error("Failed to fetch user", "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	log.Info("User retrieved", "email", user.Email)
	c.JSON(http.StatusOK, user)
}
```

## 2. In Business Logic Layer (Service)

```go
package users

import (
	"github.com/maximilianpw/rbi-inventory/internal/logger"
	"github.com/maximilianpw/rbi-inventory/internal/models"
	"github.com/maximilianpw/rbi-inventory/internal/repository/users"
)

type UserService interface {
	Create(ctx context.Context, req *CreateUserRequest) (*models.User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	Update(ctx context.Context, id uuid.UUID, req *UpdateUserRequest) (*models.User, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type userService struct {
	repo users.UserRepository
}

// Create creates a new user with validation
func (s *userService) Create(ctx context.Context, req *CreateUserRequest) (*models.User, error) {
	log := logger.FromContext(ctx).
		WithOperation("create_user").
		WithFields("email", req.Email)

	// Validate email uniqueness
	log.Debug("Checking email uniqueness")
	existing, err := s.repo.GetByEmail(ctx, req.Email)
	if err != nil && !errors.Is(err, users.ErrNotFound) {
		log.Error("Database error checking email", "error", err.Error())
		return nil, err
	}

	if existing != nil {
		log.Warn("Email already exists in database")
		return nil, &ConflictError{Message: "Email already in use"}
	}

	log.Debug("Email is unique")

	// Create user
	log.Info("Inserting user into database")
	user, err := s.repo.Create(ctx, &users.CreateUserRequest{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
		Role:     req.Role,
	})

	if err != nil {
		log.Error("Failed to insert user", "error", err.Error())
		return nil, err
	}

	log.Info("User created successfully", "user_id", user.ID)
	return user, nil
}

// GetByID retrieves a user by ID
func (s *userService) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	log := logger.FromContext(ctx).
		WithOperation("get_user_by_id").
		WithFields("user_id", id.String())

	log.Debug("Looking up user in database")
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, users.ErrNotFound) {
			log.Debug("User not found")
			return nil, &NotFoundError{Message: "User not found"}
		}
		log.Error("Database error", "error", err.Error())
		return nil, err
	}

	log.Debug("User retrieved", "email", user.Email)
	return user, nil
}

// Update updates an existing user
func (s *userService) Update(ctx context.Context, id uuid.UUID, req *UpdateUserRequest) (*models.User, error) {
	log := logger.FromContext(ctx).
		WithOperation("update_user").
		WithFields("user_id", id.String())

	log.Info("Starting user update")

	// Check if user exists
	log.Debug("Verifying user exists")
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		log.Error("Failed to fetch user", "error", err.Error())
		return nil, err
	}

	if user == nil {
		log.Warn("User not found")
		return nil, &NotFoundError{Message: "User not found"}
	}

	// If email is being changed, check uniqueness
	if req.Email != nil && *req.Email != user.Email {
		log.Debug("Email is changing", "old_email", user.Email, "new_email", *req.Email)
		existing, err := s.repo.GetByEmail(ctx, *req.Email)
		if err != nil && !errors.Is(err, users.ErrNotFound) {
			log.Error("Database error checking email uniqueness", "error", err.Error())
			return nil, err
		}
		if existing != nil {
			log.Warn("New email already exists", "email", *req.Email)
			return nil, &ConflictError{Message: "Email already in use"}
		}
	}

	// Update user
	log.Info("Updating user in database")
	updated, err := s.repo.Update(ctx, id, &users.UpdateUserRequest{
		Name:     req.Name,
		Email:    req.Email,
		Role:     req.Role,
		IsActive: req.IsActive,
	})

	if err != nil {
		log.Error("Failed to update user", "error", err.Error())
		return nil, err
	}

	log.Info("User updated successfully")
	return updated, nil
}

// Delete deletes a user
func (s *userService) Delete(ctx context.Context, id uuid.UUID) error {
	log := logger.FromContext(ctx).
		WithOperation("delete_user").
		WithFields("user_id", id.String())

	log.Info("Deleting user")
	err := s.repo.Delete(ctx, id)
	if err != nil {
		log.Error("Failed to delete user", "error", err.Error())
		return err
	}

	log.Info("User deleted successfully")
	return nil
}
```

## 3. In Repository Layer (Data Access)

```go
package users

import (
	"github.com/maximilianpw/rbi-inventory/internal/logger"
	"github.com/maximilianpw/rbi-inventory/internal/models"
)

type userRepository struct {
	db *sqlx.DB
}

// GetByID retrieves a user from database
func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	log := logger.FromContext(ctx).
		WithOperation("db_get_user_by_id").
		WithFields("user_id", id.String())

	log.Debug("Executing SELECT query")

	query := `
		SELECT id, name, email, role, is_active, last_login, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	var user models.User
	err := r.db.GetContext(ctx, &user, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			log.Debug("No rows found")
			return nil, ErrNotFound
		}
		log.Error("Database query error", "error", err.Error(), "query", "SELECT users")
		return nil, err
	}

	log.Debug("User retrieved from database", "email", user.Email)
	return &user, nil
}

// Create inserts a new user into database
func (r *userRepository) Create(ctx context.Context, req *CreateUserRequest) (*models.User, error) {
	log := logger.FromContext(ctx).
		WithOperation("db_create_user").
		WithFields("email", req.Email)

	log.Debug("Executing INSERT query")

	query := `
		INSERT INTO users (id, name, email, password_hash, role, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
		RETURNING id, name, email, role, is_active, created_at, updated_at
	`

	var user models.User
	err := r.db.GetContext(ctx, &user, query,
		req.ID, req.Name, req.Email, req.PasswordHash, req.Role)

	if err != nil {
		if pgErr, ok := err.(*pq.Error); ok {
			if pgErr.Code == "23505" { // Unique violation
				log.Warn("Email unique constraint violation", "email", req.Email)
				return nil, ErrEmailExists
			}
		}
		log.Error("Failed to insert user", "error", err.Error())
		return nil, err
	}

	log.Info("User inserted successfully", "user_id", user.ID)
	return &user, nil
}

// Update updates a user in database
func (r *userRepository) Update(ctx context.Context, id uuid.UUID, req *UpdateUserRequest) (*models.User, error) {
	log := logger.FromContext(ctx).
		WithOperation("db_update_user").
		WithFields("user_id", id.String())

	log.Debug("Executing UPDATE query")

	// Build dynamic query based on provided fields
	updateFields := []string{"updated_at = NOW()"}
	args := []interface{}{id}
	argIndex := 2

	if req.Name != nil {
		updateFields = append(updateFields, fmt.Sprintf("name = $%d", argIndex))
		args = append(args, *req.Name)
		argIndex++
	}

	if req.Email != nil {
		updateFields = append(updateFields, fmt.Sprintf("email = $%d", argIndex))
		args = append(args, *req.Email)
		argIndex++
	}

	if req.Role != nil {
		updateFields = append(updateFields, fmt.Sprintf("role = $%d", argIndex))
		args = append(args, *req.Role)
		argIndex++
	}

	if req.IsActive != nil {
		updateFields = append(updateFields, fmt.Sprintf("is_active = $%d", argIndex))
		args = append(args, *req.IsActive)
		argIndex++
	}

	query := fmt.Sprintf(
		"UPDATE users SET %s WHERE id = $1 RETURNING id, name, email, role, is_active, created_at, updated_at",
		strings.Join(updateFields, ", "),
	)

	var user models.User
	err := r.db.GetContext(ctx, &user, query, args...)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			log.Debug("User not found for update")
			return nil, ErrNotFound
		}
		if pgErr, ok := err.(*pq.Error); ok && pgErr.Code == "23505" {
			log.Warn("Email unique constraint violation during update", "email", req.Email)
			return nil, ErrEmailExists
		}
		log.Error("Failed to update user", "error", err.Error())
		return nil, err
	}

	log.Info("User updated successfully")
	return &user, nil
}

// Delete deletes a user from database
func (r *userRepository) Delete(ctx context.Context, id uuid.UUID) error {
	log := logger.FromContext(ctx).
		WithOperation("db_delete_user").
		WithFields("user_id", id.String())

	log.Debug("Executing DELETE query")

	query := "DELETE FROM users WHERE id = $1"
	result, err := r.db.ExecContext(ctx, query, id)

	if err != nil {
		log.Error("Failed to delete user", "error", err.Error())
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		log.Error("Failed to get rows affected", "error", err.Error())
		return err
	}

	if rows == 0 {
		log.Debug("No rows deleted - user may not exist")
		return ErrNotFound
	}

	log.Info("User deleted successfully", "rows_affected", rows)
	return nil
}
```

## 4. Quick Reference Table

| Level | Use Case | Example |
|-------|----------|---------|
| `Debug` | Development tracing, variable values | `log.Debug("Checking condition", "value", x)` |
| `Info` | Normal operations, user actions | `log.Info("User created", "user_id", id)` |
| `Warn` | Unusual but recoverable conditions | `log.Warn("User not found", "user_id", id)` |
| `Error` | Errors that need attention | `log.Error("Database error", "error", err.Error())` |

## 5. Common Patterns

### Getting logger in handler:
```go
log := logger.FromContext(c.Request.Context()).WithOperation("operation_name")
```

### Getting logger in service:
```go
log := logger.FromContext(ctx).WithOperation("service_operation")
```

### Getting logger in repository:
```go
log := logger.FromContext(ctx).WithOperation("db_operation_name")
```

### Logging with error:
```go
log.Error("Failed to create user", "error", err.Error(), "email", req.Email)
```

### Logging with multiple fields:
```go
log.WithFields("key1", val1, "key2", val2).Info("Message")
```

### Chaining operations:
```go
log.WithRequestID(reqID).
   WithUserID(userID).
   WithOperation("complex_operation").
   Info("Starting operation")
```
