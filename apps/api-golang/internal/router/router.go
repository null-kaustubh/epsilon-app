package router

import (
	"database/sql"
	"net/http"
	"time"

	_ "api-golang/docs"

	"api-golang/internal/config"
	"api-golang/internal/email"
	"api-golang/internal/handler"
	"api-golang/internal/middleware"
	"api-golang/internal/repository"
	"api-golang/internal/service"

	httpSwagger "github.com/swaggo/http-swagger"
)

func New(db *sql.DB, emailSvc *email.EmailService, cfg *config.Config) http.Handler {
	mux := http.NewServeMux()

	// --- auth ---
	authRepo := repository.NewPostgresAuthRepository(db)
	authService := service.NewAuthService(authRepo, emailSvc, cfg.FrontendURL)
	authHandler := handler.NewAuthHandler(authService)

	// --- spaces ---
	spaceRepo := repository.NewPostgresSpaceRepository(db)
	spaceService := service.NewSpaceService(spaceRepo)
	spaceHandler := handler.NewSpaceHandler(spaceService)

	// --- endpoint limiters ---
	loginLimiter := middleware.NewEndpointLimiter(time.Minute/5, 3) // 5/min burst 3
	signupLimiter := middleware.NewEndpointLimiter(time.Hour/10, 3) // 10/hr burst 3
	forgotLimiter := middleware.NewEndpointLimiter(time.Hour/5, 2)  // 5/hr burst 2

	// --- oauth ---
	oauthHandler := handler.NewOAuthHandler(
		authService,
		cfg.GoogleClientID,
		cfg.GoogleClientSecret,
		cfg.GitHubClientID,
		cfg.GitHubClientSecret,
		cfg.BackendURL,
		cfg.FrontendURL,
	)

	// oauth routes — no rate limiter, providers throttle themselves
	mux.HandleFunc("GET /auth/oauth/google", oauthHandler.GoogleLogin)
	mux.HandleFunc("GET /auth/oauth/google/callback", oauthHandler.GoogleCallback)
	mux.HandleFunc("GET /auth/oauth/github", oauthHandler.GitHubLogin)
	mux.HandleFunc("GET /auth/oauth/github/callback", oauthHandler.GitHubCallback)

	auth := middleware.AuthMiddleware(authService)

	// health
	mux.HandleFunc("GET /health", handler.Health)

	// public
	mux.HandleFunc("POST /auth/register", signupLimiter.Middleware(
		http.HandlerFunc(authHandler.Register)).ServeHTTP)
	mux.HandleFunc("POST /auth/login", loginLimiter.Middleware(
		http.HandlerFunc(authHandler.Login)).ServeHTTP)
	mux.HandleFunc("POST /auth/forgot-password", forgotLimiter.Middleware(
		http.HandlerFunc(authHandler.ForgotPassword)).ServeHTTP)
	mux.HandleFunc("POST /auth/reset-password", authHandler.ResetPassword)

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
		middleware.RateLimit,
		middleware.Logging,
		middleware.Recover,
		middleware.CORS,
	)
}
