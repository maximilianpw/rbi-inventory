package logger

import (
	"context"
	"io"
	"log/slog"
	"os"
)

// Logger wraps slog.Logger for easier usage throughout the application
type Logger struct {
	*slog.Logger
}

// New creates a new structured logger instance
func New(level LogLevel, output io.Writer) *Logger {
	if output == nil {
		output = os.Stdout
	}

	opts := &slog.HandlerOptions{
		Level: slog.Level(level),
	}

	handler := slog.NewJSONHandler(output, opts)
	return &Logger{
		Logger: slog.New(handler),
	}
}

// NewProduction creates a production logger with INFO level and JSON output
func NewProduction() *Logger {
	return New(LevelInfo, os.Stdout)
}

// NewDevelopment creates a development logger with DEBUG level and text output
func NewDevelopment() *Logger {
	handler := slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.Level(LevelDebug),
	})
	return &Logger{
		Logger: slog.New(handler),
	}
}

// WithContext adds a logger to the context
func (l *Logger) WithContext(ctx context.Context) context.Context {
	return context.WithValue(ctx, loggerContextKey, l)
}

// FromContext retrieves a logger from context, or returns default logger if not found
func FromContext(ctx context.Context) *Logger {
	if logger, ok := ctx.Value(loggerContextKey).(*Logger); ok {
		return logger
	}
	return defaultLogger
}

// SetDefault sets the default logger instance
func SetDefault(logger *Logger) {
	defaultLogger = logger
}

// WithFields creates a new logger with additional fields
func (l *Logger) WithFields(fields ...interface{}) *Logger {
	return &Logger{
		Logger: l.Logger.With(fields...),
	}
}

// WithError creates a new logger with error field
func (l *Logger) WithError(err error) *Logger {
	return l.WithFields("error", err.Error())
}

// Debug logs a debug message
func (l *Logger) Debug(msg string, args ...interface{}) {
	l.Logger.Debug(msg, args...)
}

// Info logs an info message
func (l *Logger) Info(msg string, args ...interface{}) {
	l.Logger.Info(msg, args...)
}

// Warn logs a warning message
func (l *Logger) Warn(msg string, args ...interface{}) {
	l.Logger.Warn(msg, args...)
}

// Error logs an error message
func (l *Logger) Error(msg string, args ...interface{}) {
	l.Logger.Error(msg, args...)
}

// Fatal logs a fatal message and exits
func (l *Logger) Fatal(msg string, args ...interface{}) {
	l.Logger.Error(msg, args...)
	os.Exit(1)
}


// ContextKey is a type for context keys
type contextKey string

const loggerContextKey contextKey = "logger"

var defaultLogger *Logger
