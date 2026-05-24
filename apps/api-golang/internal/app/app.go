package app

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"api-golang/internal/config"
	"api-golang/internal/db"
	sqlcdb "api-golang/internal/db/sqlc"
	"api-golang/internal/email"
	"api-golang/internal/router"

	sentry "github.com/getsentry/sentry-go"
)

type App struct {
	server     *http.Server
	cancelFunc context.CancelFunc
}

func New() (*App, error) {
	cfg, err := config.Load()
	if err != nil {
		return nil, fmt.Errorf("config load failed: %w", err)
	}

	if cfg.Production {
		if err := sentry.Init(sentry.ClientOptions{
			Dsn:              os.Getenv("SENTRY_DSN_BACKEND"),
			TracesSampleRate: 1.0,
			Environment:      "production",
		}); err != nil {
			log.Printf("sentry init failed: %v", err)
		}
	}

	emailSvc := email.New(cfg.ResendAPIKey)

	dbConn, err := db.NewPostgresDB(cfg.DBURL)
	if err != nil {
		return nil, err
	}

	r := router.New(dbConn, emailSvc, cfg)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	ctx, cancel := context.WithCancel(context.Background())

	queries := sqlcdb.New(dbConn)

	app := &App{
		server:     srv,
		cancelFunc: cancel,
	}

	app.startCleanupJob(ctx, queries)

	return app, nil
}

func (a *App) Run() error {
	fmt.Println("Server running on", a.server.Addr)
	return a.server.ListenAndServe()
}

func (a *App) Shutdown(ctx context.Context) error {
	a.cancelFunc()
	return a.server.Shutdown(ctx)
}

func (a *App) startCleanupJob(ctx context.Context, queries *sqlcdb.Queries) {
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if err := queries.DeleteExpiredSessions(ctx); err != nil {
					log.Println("cleanup job failed:", err)
				}
			case <-ctx.Done():
				return
			}
		}
	}()
}
