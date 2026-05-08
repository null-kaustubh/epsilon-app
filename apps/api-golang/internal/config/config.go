package config

import (
	"os"
)

type Config struct {
	Port         string
	DBURL        string
	ResendAPIKey string
	AppURL       string
}

func Load() (*Config, error) {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/epsilon?sslmode=disable"
	}

	return &Config{
		Port:         port,
		DBURL:        dbURL,
		ResendAPIKey: os.Getenv("RESEND_API_KEY"),
		AppURL:       os.Getenv("APP_URL"),
	}, nil
}
