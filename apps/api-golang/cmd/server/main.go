package main

import (
	"log"

	"api-golang/internal/app"

	"github.com/joho/godotenv"
)

// @title           Epsilon-API
// @version         1.0
// @description     Epsilon API — REST API for managing spaces and content blocks. Supports session-based authentication via cookie.
// @host            localhost:8080
// @BasePath        /
// @securityDefinitions.apikey CookieAuth
// @in cookie
// @name session_id
func main() {
	godotenv.Load()

	application, err := app.New()
	if err != nil {
		log.Fatalf("failed to initialize app: %v", err)
	}

	if err := application.Run(); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
