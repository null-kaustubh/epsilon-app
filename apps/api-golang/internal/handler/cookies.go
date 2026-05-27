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
	sameSite := http.SameSiteNoneMode
	// Local dev (http://localhost) cannot set SameSite=None without Secure.
	// Browsers will drop such cookies, causing auth to fail.
	if !cookieSecure {
		sameSite = http.SameSiteLaxMode
	}
	c := &http.Cookie{
		Name:     sessionCookieName,
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		SameSite: sameSite,
		Secure:   cookieSecure,
		MaxAge:   sessionMaxAge,
	}
	// CHIPS: required for credentialed cross-origin fetch in Brave and Safari
	// when the API is on a different origin than the web app.
	if cookieSecure && cookieDomain != "" {
		c.Partitioned = true
	}
	applyCookieDomain(c)
	http.SetCookie(w, c)
}

func clearSessionCookie(w http.ResponseWriter) {
	sameSite := http.SameSiteNoneMode
	if !cookieSecure {
		sameSite = http.SameSiteLaxMode
	}
	c := &http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: sameSite,
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
	sameSite := http.SameSiteNoneMode
	if !cookieSecure {
		sameSite = http.SameSiteLaxMode
	}
	c := &http.Cookie{
		Name:     oauthStateCookieName,
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		SameSite: sameSite,
		Secure:   cookieSecure,
		MaxAge:   oauthStateMaxAge,
	}
	applyCookieDomain(c)
	http.SetCookie(w, c)
}

func clearOAuthStateCookie(w http.ResponseWriter) {
	sameSite := http.SameSiteNoneMode
	if !cookieSecure {
		sameSite = http.SameSiteLaxMode
	}
	c := &http.Cookie{
		Name:     oauthStateCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: sameSite,
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
