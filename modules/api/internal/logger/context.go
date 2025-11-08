package logger

import (
	"context"
)

// WithRequestID adds a request ID to the logger context
func (l *Logger) WithRequestID(requestID string) *Logger {
	return l.WithFields("request_id", requestID)
}

// WithUserID adds a user ID to the logger context
func (l *Logger) WithUserID(userID string) *Logger {
	return l.WithFields("user_id", userID)
}

// WithOperation adds an operation name to the logger context
func (l *Logger) WithOperation(operation string) *Logger {
	return l.WithFields("operation", operation)
}

// WithDuration adds a duration to the logger context
func (l *Logger) WithDuration(duration interface{}) *Logger {
	return l.WithFields("duration", duration)
}

// GetRequestIDFromContext retrieves the request ID from context
func GetRequestIDFromContext(ctx context.Context) string {
	if id, ok := ctx.Value("request_id").(string); ok {
		return id
	}
	return ""
}
