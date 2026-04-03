package config

import (
	"os"
)

type Config struct {
	Port  string
	DBURL string
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
		Port:  port,
		DBURL: dbURL,
	}, nil
}
