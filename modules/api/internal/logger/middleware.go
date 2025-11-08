package logger

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GinMiddleware returns a Gin middleware for structured logging of HTTP requests
func GinMiddleware(logger *Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Generate request ID for tracing
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}
		c.Set("request_id", requestID)

		startTime := time.Now()

		// Add logger with request ID to context
		c.Request = c.Request.WithContext(
			logger.WithFields("request_id", requestID).WithContext(c.Request.Context()),
		)

		c.Next()

		// Log request details after response
		duration := time.Since(startTime)
		logger.Info("HTTP request",
			"request_id", requestID,
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
			"status", c.Writer.Status(),
			"duration_ms", duration.Milliseconds(),
			"client_ip", c.ClientIP(),
			"user_agent", c.Request.UserAgent(),
		)
	}
}

// RequestIDMiddleware adds a request ID to the gin context and request context
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}
