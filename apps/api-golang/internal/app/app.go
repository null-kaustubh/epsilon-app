package app

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"api-golang/internal/config"
	"api-golang/internal/db"
	sqlcdb "api-golang/internal/db/sqlc"
	"api-golang/internal/email"
	"api-golang/internal/router"
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
	emailSvc := email.New(cfg.ResendAPIKey)

	dbConn, err := db.NewPostgresDB(cfg.DBURL)
	if err != nil {
		return nil, err
	}

	r := router.New(dbConn, emailSvc, cfg.AppURL)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
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
				queries.DeleteExpiredSessions(ctx)
			case <-ctx.Done():
				return
			}
		}
	}()
}
