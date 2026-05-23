package handler

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"
)

const (
	sessionCookieName    = "session_id"
	oauthStateCookieName = "oauth_state"
	sessionMaxAge        = 7 * 24 * 60 * 60
	oauthStateMaxAge     = 600
)

var (
	cookieSecure bool
	cookieDomain string
)

func InitCookies(secure bool, domain string) {
	cookieSecure = secure
	cookieDomain = domain
}

func applyCookieDomain(c *http.Cookie) {
	if cookieDomain != "" {
		c.Domain = cookieDomain
	}
}

func setSessionCookie(w http.ResponseWriter, sessionID string) {
	c := &http.Cookie{
		Name:     sessionCookieName,
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
		Secure:   cookieSecure,
		MaxAge:   sessionMaxAge,
	}
	applyCookieDomain(c)
	http.SetCookie(w, c)
}

func clearSessionCookie(w http.ResponseWriter) {
	c := &http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
		Secure:   cookieSecure,
		MaxAge:   -1,
	}
	applyCookieDomain(c)
	http.SetCookie(w, c)
}

func generateOAuthState() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func setOAuthStateCookie(w http.ResponseWriter, state string) {
	c := &http.Cookie{
		Name:     oauthStateCookieName,
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
		Secure:   cookieSecure,
		MaxAge:   oauthStateMaxAge,
	}
	applyCookieDomain(c)
	http.SetCookie(w, c)
}

func clearOAuthStateCookie(w http.ResponseWriter) {
	c := &http.Cookie{
		Name:     oauthStateCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
		Secure:   cookieSecure,
		MaxAge:   -1,
	}
	applyCookieDomain(c)
	http.SetCookie(w, c)
}

func validateOAuthState(r *http.Request) error {
	queryState := r.URL.Query().Get("state")
	if queryState == "" {
		return errInvalidOAuthState
	}

	cookie, err := r.Cookie(oauthStateCookieName)
	if err != nil || cookie.Value == "" {
		return errInvalidOAuthState
	}

	if cookie.Value != queryState {
		return errInvalidOAuthState
	}

	return nil
}
