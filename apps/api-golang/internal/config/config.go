package config

import (
	"os"
)

type Config struct {
	Port               string
	DBURL              string
	ResendAPIKey       string
	FrontendURL        string
	GoogleClientID     string
	GoogleClientSecret string
	GitHubClientID     string
	GitHubClientSecret string
	BackendURL         string
}

func Load() (*Config, error) {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_NEON")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/epsilon?sslmode=disable"
	}

	return &Config{
		Port:               port,
		DBURL:              dbURL,
		ResendAPIKey:       os.Getenv("RESEND_API_KEY"),
		FrontendURL:        os.Getenv("FRONTEND_URL"),
		BackendURL:         os.Getenv("BACKEND_URL"),
		GoogleClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		GitHubClientID:     os.Getenv("GITHUB_CLIENT_ID"),
		GitHubClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
	}, nil
}
