package db

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func NewPostgresDB(dsn string) (*sql.DB, error) {
	dsn = NormalizePostgresDSN(dsn)

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open db: %w", err)
	}

	maxOpen := 10
	maxIdle := 5
	if strings.Contains(strings.ToLower(dsn), "neon.tech") {
		maxOpen = 5
		maxIdle = 2
	}

	db.SetMaxOpenConns(maxOpen)
	db.SetMaxIdleConns(maxIdle)
	db.SetConnMaxLifetime(30 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to connect db: %w", err)
	}

	log.Println("Connected to DB")

	return db, nil
}
