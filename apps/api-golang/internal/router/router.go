package router

import (
	"database/sql"
	"net/http"

	"api-golang/internal/handler"
	"api-golang/internal/middleware"
	"api-golang/internal/repository"
	"api-golang/internal/service"
)

func New(db *sql.DB) http.Handler {
	mux := http.NewServeMux()

	repo := repository.NewPostgresAuthRepository(db)
	authService := service.NewAuthService(repo)
	authHandler := handler.NewAuthHandler(authService)

	// health
	mux.HandleFunc("GET /health", handler.Health)

	// public
	mux.HandleFunc("POST /auth/register", authHandler.Register)
	mux.HandleFunc("POST /auth/login", authHandler.Login)

	// protected
	mux.Handle("GET /auth/me", middleware.AuthMiddleware(authService)(http.HandlerFunc(authHandler.Me)))
	mux.Handle("POST /auth/logout", middleware.AuthMiddleware(authService)(http.HandlerFunc(authHandler.Logout)))

	// wrap middleware
	return middleware.Chain(
		mux,
		middleware.Logging,
		middleware.Recover,
	)
}
