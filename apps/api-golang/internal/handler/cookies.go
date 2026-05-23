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

var cookieSecure bool

func InitCookies(secure bool) {
	cookieSecure = secure
}

func setSessionCookie(w http.ResponseWriter, sessionID string) {
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    sessionID,
		Path:     "/",
		Domain:   ".epsilonapp.site",
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
		Secure:   cookieSecure,
		MaxAge:   sessionMaxAge,
	})
}

func clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		Path:     "/",
		Domain:   ".epsilonapp.site",
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
		Secure:   cookieSecure,
		MaxAge:   -1,
	})
}

func generateOAuthState() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func setOAuthStateCookie(w http.ResponseWriter, state string) {
	http.SetCookie(w, &http.Cookie{
		Name:     oauthStateCookieName,
		Value:    state,
		Path:     "/",
		Domain:   ".epsilonapp.site",
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
		Secure:   cookieSecure,
		MaxAge:   oauthStateMaxAge,
	})
}

func clearOAuthStateCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     oauthStateCookieName,
		Value:    "",
		Path:     "/",
		Domain:   ".epsilonapp.site",
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
		Secure:   cookieSecure,
		MaxAge:   -1,
	})
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
