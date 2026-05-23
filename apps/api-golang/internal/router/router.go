package router

import (
	"database/sql"
	"log"
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

	handler.InitCookies(cfg.CookieSecure)
	middleware.InitRateLimit(cfg.TrustedProxy)

	authRepo := repository.NewPostgresAuthRepository(db)
	authService := service.NewAuthService(authRepo, emailSvc, cfg.FrontendURL)
	authHandler := handler.NewAuthHandler(authService)

	spaceRepo := repository.NewPostgresSpaceRepository(db)
	spaceService := service.NewSpaceService(spaceRepo, cfg.Production)
	spaceHandler := handler.NewSpaceHandler(spaceService)

	loginLimiter := middleware.NewEndpointLimiter(time.Minute/5, 3)
	signupLimiter := middleware.NewEndpointLimiter(time.Hour/10, 3)
	forgotLimiter := middleware.NewEndpointLimiter(time.Hour/5, 2)
	resetLimiter := middleware.NewEndpointLimiter(time.Hour/10, 5)
	oauthLimiter := middleware.NewEndpointLimiter(time.Minute/2, 5)

	oauthHandler := handler.NewOAuthHandler(
		authService,
		cfg.GoogleClientID,
		cfg.GoogleClientSecret,
		cfg.GitHubClientID,
		cfg.GitHubClientSecret,
		cfg.BackendURL,
		cfg.FrontendURL,
	)

	mux.HandleFunc("GET /auth/oauth/google", oauthLimiter.Middleware(
		http.HandlerFunc(oauthHandler.GoogleLogin)).ServeHTTP)
	mux.HandleFunc("GET /auth/oauth/google/callback", oauthLimiter.Middleware(
		http.HandlerFunc(oauthHandler.GoogleCallback)).ServeHTTP)
	mux.HandleFunc("GET /auth/oauth/github", oauthLimiter.Middleware(
		http.HandlerFunc(oauthHandler.GitHubLogin)).ServeHTTP)
	mux.HandleFunc("GET /auth/oauth/github/callback", oauthLimiter.Middleware(
		http.HandlerFunc(oauthHandler.GitHubCallback)).ServeHTTP)

	auth := middleware.AuthMiddleware(authService)

	mux.HandleFunc("GET /health", handler.Health)

	mux.HandleFunc("POST /auth/register", signupLimiter.Middleware(
		http.HandlerFunc(authHandler.Register)).ServeHTTP)
	mux.HandleFunc("POST /auth/login", loginLimiter.Middleware(
		http.HandlerFunc(authHandler.Login)).ServeHTTP)
	mux.HandleFunc("POST /auth/forgot-password", forgotLimiter.Middleware(
		http.HandlerFunc(authHandler.ForgotPassword)).ServeHTTP)
	mux.HandleFunc("POST /auth/reset-password", resetLimiter.Middleware(
		http.HandlerFunc(authHandler.ResetPassword)).ServeHTTP)

	mux.Handle("GET /auth/me", middleware.AuthMiddleware(authService)(http.HandlerFunc(authHandler.Me)))
	mux.HandleFunc("POST /auth/logout", authHandler.Logout)

	mux.Handle("POST /spaces", auth(http.HandlerFunc(spaceHandler.CreateSpace)))
	mux.Handle("GET /spaces", auth(http.HandlerFunc(spaceHandler.ListSpaces)))
	mux.Handle("GET /spaces/{slug}", auth(http.HandlerFunc(spaceHandler.GetSpace)))
	mux.Handle("PUT /spaces/{slug}", auth(http.HandlerFunc(spaceHandler.UpdateSpaceName)))
	mux.Handle("DELETE /spaces/{slug}", auth(http.HandlerFunc(spaceHandler.DeleteSpace)))
	mux.Handle("PATCH /spaces/{slug}/blocks", auth(http.HandlerFunc(spaceHandler.SaveBlocks)))
	mux.Handle("DELETE /spaces/{slug}/blocks/{blockId}", auth(http.HandlerFunc(spaceHandler.DeleteBlock)))

	uploadSvc, err := service.NewUploadService(cfg.S3Bucket, cfg.AWSRegion)
	if err != nil {
		if cfg.Production {
			log.Fatal("s3 init failed:", err)
		} else {
			log.Println("s3 init skipped (no creds):", err)
		}
	}
	if uploadSvc != nil {
		uploadHandler := handler.NewUploadHandler(uploadSvc)
		mux.Handle("GET /upload-url", auth(http.HandlerFunc(uploadHandler.GetUploadURL)))
	}

	if !cfg.Production {
		mux.Handle("GET /swagger/", httpSwagger.WrapHandler)
	}

	return middleware.Chain(
		mux,
		middleware.RateLimit,
		middleware.Logging,
		middleware.Recover,
		middleware.SecurityHeaders(cfg.Production),
		middleware.CORS(cfg.FrontendURL),
	)
}
