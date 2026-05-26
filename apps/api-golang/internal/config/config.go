package config

import (
	"fmt"
	"net"
	"net/url"
	"os"
	"strings"
)

type Config struct {
	Port               string
	DBURL              string
	ResendAPIKey       string
	FrontendURL        string
	GoogleClientID     string
	GoogleClientSecret string
	GitHubClientID     string
	GitHubClientSecret string
	BackendURL         string
	Production         bool
	CookieSecure       bool
	CookieDomain       string
	TrustedProxy       bool
	S3Bucket           string
	AWSRegion          string
}

func Load() (*Config, error) {
	env := strings.ToLower(strings.TrimSpace(os.Getenv("ENV")))
	production := env == "production"

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	cookieSecure := production
	if v := os.Getenv("COOKIE_SECURE"); v != "" {
		cookieSecure = v == "true" || v == "1"
	}

	trustedProxy := os.Getenv("TRUST_PROXY") == "true" || os.Getenv("TRUST_PROXY") == "1"

	dbURL := os.Getenv("DATABASE_URL")
	if production && dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required when ENV=production")
	}
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/epsilon?sslmode=disable"
	}
	if production && strings.Contains(dbURL, "sslmode=disable") {
		return nil, fmt.Errorf("DATABASE_URL must not use sslmode=disable in production")
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if production && frontendURL == "" {
		return nil, fmt.Errorf("FRONTEND_URL is required when ENV=production")
	}
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	backendURL := os.Getenv("BACKEND_URL")
	if production && backendURL == "" {
		return nil, fmt.Errorf("BACKEND_URL is required when ENV=production")
	}

	cookieDomain := strings.TrimSpace(os.Getenv("COOKIE_DOMAIN"))
	if cookieDomain == "" {
		cookieDomain = cookieDomainFromURL(frontendURL)
	}

	return &Config{
		Port:               port,
		DBURL:              dbURL,
		ResendAPIKey:       os.Getenv("RESEND_API_KEY"),
		FrontendURL:        frontendURL,
		BackendURL:         backendURL,
		GoogleClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		GitHubClientID:     os.Getenv("GITHUB_CLIENT_ID"),
		GitHubClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
		Production:         production,
		CookieSecure:       cookieSecure,
		CookieDomain:       cookieDomain,
		TrustedProxy:       trustedProxy,
		S3Bucket:           os.Getenv("S3_BUCKET"),
		AWSRegion:          os.Getenv("AWS_REGION"),
	}, nil
}

// cookieDomainFromURL returns a registrable domain with leading dot (e.g. ".epsilonapp.site")
// for cross-subdomain cookies, or empty for localhost / IP (host-only cookies).
func cookieDomainFromURL(frontendURL string) string {
	u, err := url.Parse(frontendURL)
	if err != nil {
		return ""
	}
	host := u.Hostname()
	if host == "" || host == "localhost" || net.ParseIP(host) != nil {
		return ""
	}
	host = strings.TrimPrefix(host, "www.")
	parts := strings.Split(host, ".")
	if len(parts) < 2 {
		return ""
	}
	return "." + strings.Join(parts[len(parts)-2:], ".")
}
