package main

import (
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"fmt"
	"log"
	"os"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/argon2"
)

func hashPassword(password string) string {
	salt := make([]byte, 16)
	rand.Read(salt)
	hash := argon2.IDKey([]byte(password), salt, 1, 64*1024, 4, 32)
	return base64.RawStdEncoding.EncodeToString(append(salt, hash...))
}

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/epsilon?sslmode=disable"
	}

	conn, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("failed to connect to database:", err)
	}
	defer conn.Close()

	if err := conn.Ping(); err != nil {
		log.Fatal("database is not reachable:", err)
	}

	// Fixed UUIDs so seeding is idempotent
	test_user1 := uuid.MustParse("00000000-0000-0000-0000-000000000001")
	test_user2 := uuid.MustParse("00000000-0000-0000-0000-000000000002")
	spaceID := uuid.MustParse("00000000-0000-0000-0000-000000000010")
	block1ID := uuid.MustParse("00000000-0000-0000-0000-000000000101")
	block2ID := uuid.MustParse("00000000-0000-0000-0000-000000000102")
	block3ID := uuid.MustParse("00000000-0000-0000-0000-000000000103")

	// Check if already seeded
	var exists bool
	conn.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)", test_user1).Scan(&exists)
	if exists {
		fmt.Println("✓ Seed data already exists, skipping.")
		return
	}

	tx, err := conn.Begin()
	if err != nil {
		log.Fatal("failed to begin transaction:", err)
	}

	// --- Users ---
	_, err = tx.Exec(
		`INSERT INTO users (id, email, password_hash, username) VALUES ($1, $2, $3, $4)`,
		test_user1, "test@epsilon.app", hashPassword("Demo1234!"), "test",
	)
	if err != nil {
		tx.Rollback()
		log.Fatal("failed to create user 1:", err)
	}

	_, err = tx.Exec(
		`INSERT INTO users (id, email, password_hash, username) VALUES ($1, $2, $3, $4)`,
		test_user2, "contributor@epsilon.app", hashPassword("Contrib1234!"), "contributor",
	)
	if err != nil {
		tx.Rollback()
		log.Fatal("failed to create user 2:", err)
	}

	// --- Space (owned by user 1) ---
	_, err = tx.Exec(
		`INSERT INTO spaces (id, user_id, name, slug) VALUES ($1, $2, $3, $4)`,
		spaceID, test_user1, "Welcome Space", "welcome-space",
	)
	if err != nil {
		tx.Rollback()
		log.Fatal("failed to create space:", err)
	}

	// --- Blocks ---
	// TODO: Adjust content, positions, and sizes to your liking
	blocks := []struct {
		id           uuid.UUID
		typ, content string
		x, y, w, h   int
	}{
		{block1ID, "markdown", `**Welcome to Epsilon ✦**
This is a demo space for contributors.

Break things freely, that's what this space is for.`, 9, 5, 10, 5},
		{block2ID, "note", "Try dragging and resizing blocks on the canvas.", 9, 10, 4, 3},
		{block3ID, "code", "console.log('Hello, Epsilon!');", 13, 10, 6, 3},
	}

	for _, b := range blocks {
		_, err = tx.Exec(
			`INSERT INTO blocks (id, space_id, type, content, x, y, w, h) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
			b.id, spaceID, b.typ, b.content, b.x, b.y, b.w, b.h,
		)
		if err != nil {
			tx.Rollback()
			log.Fatal("failed to create block:", err)
		}
	}

	if err := tx.Commit(); err != nil {
		log.Fatal("failed to commit transaction:", err)
	}

	fmt.Println("✓ Seed data loaded successfully!")
	fmt.Println()
	fmt.Println("  Demo accounts:")
	fmt.Println("  ┌─────────────────────────────────────────────────┐")
	fmt.Println("  │  test@epsilon.app          / Demo1234!          │")
	fmt.Println("  │  contributor@epsilon.app   / Contrib1234!       │")
	fmt.Println("  └─────────────────────────────────────────────────┘")
}
