package middleware

import (
	"net/http"
	"sync"
	"time"

	"api-golang/internal/response"

	"golang.org/x/time/rate"
)

type ipLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var (
	globalLimiters sync.Map
)

func getGlobalLimiter(ip string) *rate.Limiter {
	val, ok := globalLimiters.Load(ip)
	if !ok {
		l := &ipLimiter{
			limiter:  rate.NewLimiter(rate.Every(time.Minute/60), 20),
			lastSeen: time.Now(),
		}
		globalLimiters.Store(ip, l)
		return l.limiter
	}
	l := val.(*ipLimiter)
	l.lastSeen = time.Now()
	return l.limiter
}

func RateLimit(next http.Handler) http.Handler {
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			globalLimiters.Range(func(key, val any) bool {
				if time.Since(val.(*ipLimiter).lastSeen) > 5*time.Minute {
					globalLimiters.Delete(key)
				}
				return true
			})
		}
	}()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := realIP(r)
		if !getGlobalLimiter(ip).Allow() {
			response.Error(w, http.StatusTooManyRequests, "too many requests")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func realIP(r *http.Request) string {
	if ip := r.Header.Get("CF-Connecting-IP"); ip != "" {
		return ip
	}
	if ip := r.Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
		for i := 0; i < len(ip); i++ {
			if ip[i] == ',' {
				return ip[:i]
			}
		}
		return ip
	}
	host := r.RemoteAddr
	for i := len(host) - 1; i >= 0; i-- {
		if host[i] == ':' {
			return host[:i]
		}
	}
	return host
}
