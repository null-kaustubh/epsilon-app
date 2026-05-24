package middleware

import (
	"log"
	"net/http"
	"time"

	"api-golang/internal/response"

	sentry "github.com/getsentry/sentry-go"
)

func Recover(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				sentry.CurrentHub().Recover(err)
				sentry.Flush(2 * time.Second)
				log.Printf("panic: %v", err)
				response.Error(w, http.StatusInternalServerError, "internal server error")
			}
		}()

		next.ServeHTTP(w, r)
	})
}
