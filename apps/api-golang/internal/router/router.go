package router

import (
	"database/sql"
	"net/http"

	_ "api-golang/docs"

	"api-golang/internal/handler"
	"api-golang/internal/middleware"
	"api-golang/internal/repository"
	"api-golang/internal/service"

	httpSwagger "github.com/swaggo/http-swagger"
)

func New(db *sql.DB) http.Handler {
	mux := http.NewServeMux()

	// --- auth ---
	authRepo := repository.NewPostgresAuthRepository(db)
	authService := service.NewAuthService(authRepo)
	authHandler := handler.NewAuthHandler(authService)

	// --- spaces ---
	spaceRepo := repository.NewPostgresSpaceRepository(db)
	spaceService := service.NewSpaceService(spaceRepo)
	spaceHandler := handler.NewSpaceHandler(spaceService)

	auth := middleware.AuthMiddleware(authService)

	// health
	mux.HandleFunc("GET /health", handler.Health)

	// public
	mux.HandleFunc("POST /auth/register", authHandler.Register)
	mux.HandleFunc("POST /auth/login", authHandler.Login)

	// protected - auth
	mux.Handle("GET /auth/me", middleware.AuthMiddleware(authService)(http.HandlerFunc(authHandler.Me)))
	mux.Handle("POST /auth/logout", middleware.AuthMiddleware(authService)(http.HandlerFunc(authHandler.Logout)))

	// protected — spaces
	mux.Handle("POST /spaces", auth(http.HandlerFunc(spaceHandler.CreateSpace)))
	mux.Handle("GET /spaces", auth(http.HandlerFunc(spaceHandler.ListSpaces)))
	mux.Handle("GET /spaces/{slug}", auth(http.HandlerFunc(spaceHandler.GetSpace)))
	mux.Handle("PUT /spaces/{slug}", auth(http.HandlerFunc(spaceHandler.UpdateSpaceName)))
	mux.Handle("DELETE /spaces/{slug}", auth(http.HandlerFunc(spaceHandler.DeleteSpace)))
	mux.Handle("PATCH /spaces/{slug}/blocks", auth(http.HandlerFunc(spaceHandler.SaveBlocks)))
	mux.Handle("DELETE /spaces/{slug}/blocks/{blockId}", auth(http.HandlerFunc(spaceHandler.DeleteBlock)))

	// swagger
	mux.Handle("GET /swagger/", httpSwagger.WrapHandler)

	// wrap middleware
	return middleware.Chain(
		mux,
		middleware.Logging,
		middleware.Recover,
		middleware.CORS,
	)
}
