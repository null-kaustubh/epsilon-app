package middleware

import (
	"context"
	"net/http"

	db "api-golang/internal/db/sqlc"
	"api-golang/internal/service"
)

type contextKey string

const UserIDKey contextKey = "user_id"

func AuthMiddleware(authService *service.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			var user db.User
			var found bool

			for _, cookie := range r.Cookies() {
				if cookie.Name != "session_id" {
					continue
				}
				u, err := authService.GetUserFromSession(r.Context(), cookie.Value)
				if err == nil {
					user = u
					found = true
					break
				}
			}

			if !found {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserIDKey, user.ID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
