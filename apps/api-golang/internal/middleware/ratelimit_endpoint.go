package middleware

import (
	"net/http"
	"sync"
	"time"

	"api-golang/internal/response"

	"golang.org/x/time/rate"
)

type endpointLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type EndpointRateLimiter struct {
	limiters sync.Map
	every    time.Duration
	burst    int
	ttl      time.Duration
}

func NewEndpointLimiter(every time.Duration, burst int) *EndpointRateLimiter {
	el := &EndpointRateLimiter{
		every: every,
		burst: burst,
		ttl:   10 * time.Minute,
	}
	// cleanup
	go func() {
		ticker := time.NewTicker(10 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			el.limiters.Range(func(key, val any) bool {
				if time.Since(val.(*endpointLimiter).lastSeen) > el.ttl {
					el.limiters.Delete(key)
				}
				return true
			})
		}
	}()
	return el
}

func (el *EndpointRateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := realIP(r)
		val, ok := el.limiters.Load(ip)
		if !ok {
			l := &endpointLimiter{
				limiter:  rate.NewLimiter(rate.Every(el.every), el.burst),
				lastSeen: time.Now(),
			}
			el.limiters.Store(ip, l)
			val = l
		}
		l := val.(*endpointLimiter)
		l.lastSeen = time.Now()
		if !l.limiter.Allow() {
			response.Error(w, http.StatusTooManyRequests, "too many requests, slow down")
			return
		}
		next.ServeHTTP(w, r)
	})
}
