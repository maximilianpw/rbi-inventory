package main

import (
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/maximilianpw/rbi-inventory/internal/config"
	"github.com/maximilianpw/rbi-inventory/internal/database"
	"github.com/maximilianpw/rbi-inventory/internal/http"
	"github.com/maximilianpw/rbi-inventory/internal/logger"
)

func main() {
	// Initialize logger first
	logLevel := logger.ParseLevel(os.Getenv("LOG_LEVEL"))
	log := logger.New(logLevel, os.Stdout)
	logger.SetDefault(log)

	err := godotenv.Load()
	if err != nil {
		log.Warn("Error loading .env file", "error", err.Error())
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	cfg := config.Load()

	db, err := database.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database", "error", err.Error())
	}
	defer db.Close()

	log.Info("Database connected successfully")

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Add structured logging middleware
	r.Use(logger.GinMiddleware(log))

	http.BuildRouter(r, db, cfg)

	log.Info("listening on port", "port", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatal("Server error", "error", err.Error())
	}
}
