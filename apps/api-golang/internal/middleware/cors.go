package middleware

import (
	"net/http"
	"net/url"
	"strings"
)

func CORS(allowedOrigin string) func(http.Handler) http.Handler {
	allowed := map[string]bool{
		allowedOrigin: true,
	}
	// always permit local dev origin when it differs from configured frontend
	if allowedOrigin != "http://localhost:3000" {
		allowed["http://localhost:3000"] = true
	}
	addWWWVariants(allowed, allowedOrigin)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if allowed[origin] {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
			}

			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func addWWWVariants(allowed map[string]bool, origin string) {
	u, err := url.Parse(origin)
	if err != nil || u.Scheme == "" || u.Host == "" {
		return
	}
	host := u.Hostname()
	if strings.HasPrefix(host, "www.") {
		alt := *u
		alt.Host = strings.TrimPrefix(u.Host, "www.")
		allowed[alt.String()] = true
		return
	}
	alt := *u
	if u.Port() != "" {
		alt.Host = "www." + u.Host
	} else {
		alt.Host = "www." + host
	}
	allowed[alt.String()] = true
}
