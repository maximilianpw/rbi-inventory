package logger

import (
	"log/slog"
	"strings"
)

// LogLevel represents the logging level
type LogLevel slog.Level

const (
	LevelDebug   LogLevel = LogLevel(slog.LevelDebug)
	LevelInfo    LogLevel = LogLevel(slog.LevelInfo)
	LevelWarn    LogLevel = LogLevel(slog.LevelWarn)
	LevelError   LogLevel = LogLevel(slog.LevelError)
)

// ParseLevel parses a string into a LogLevel
func ParseLevel(level string) LogLevel {
	switch strings.ToLower(level) {
	case "debug":
		return LevelDebug
	case "info":
		return LevelInfo
	case "warn", "warning":
		return LevelWarn
	case "error":
		return LevelError
	default:
		return LevelInfo
	}
}
