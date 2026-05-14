package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"api-golang/internal/service"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
)

type OAuthHandler struct {
	service      *service.AuthService
	googleConfig *oauth2.Config
	githubConfig *oauth2.Config
	frontendURL  string
}

func NewOAuthHandler(
	svc *service.AuthService,
	googleClientID, googleClientSecret,
	githubClientID, githubClientSecret,
	backendURL, frontendURL string,
) *OAuthHandler {
	return &OAuthHandler{
		service:     svc,
		frontendURL: frontendURL,
		googleConfig: &oauth2.Config{
			ClientID:     googleClientID,
			ClientSecret: googleClientSecret,
			RedirectURL:  backendURL + "/auth/oauth/google/callback",
			Scopes:       []string{"openid", "email", "profile"},
			Endpoint:     google.Endpoint,
		},
		githubConfig: &oauth2.Config{
			ClientID:     githubClientID,
			ClientSecret: githubClientSecret,
			RedirectURL:  backendURL + "/auth/oauth/github/callback",
			Scopes:       []string{"user:email"},
			Endpoint:     github.Endpoint,
		},
	}
}

// --- GOOGLE ---

func (h *OAuthHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	url := h.googleConfig.AuthCodeURL("state", oauth2.AccessTypeOnline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (h *OAuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	user, err := h.handleCallback(r, h.googleConfig, fetchGoogleUser)
	if err != nil {
		h.redirectWithError(w, r, err)
		return
	}

	_, sessionID, _, err := h.service.OAuthLogin(r.Context(), "google", *user)
	if err != nil {
		h.redirectWithError(w, r, err)
		return
	}

	setSessionCookie(w, sessionID)
	http.Redirect(w, r, h.frontendURL+"/home", http.StatusTemporaryRedirect)
}

// --- GITHUB ---

func (h *OAuthHandler) GitHubLogin(w http.ResponseWriter, r *http.Request) {
	url := h.githubConfig.AuthCodeURL("state", oauth2.AccessTypeOnline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (h *OAuthHandler) GitHubCallback(w http.ResponseWriter, r *http.Request) {
	user, err := h.handleCallback(r, h.githubConfig, fetchGitHubUser)
	if err != nil {
		h.redirectWithError(w, r, err)
		return
	}

	_, sessionID, _, err := h.service.OAuthLogin(r.Context(), "github", *user)
	if err != nil {
		h.redirectWithError(w, r, err)
		return
	}

	setSessionCookie(w, sessionID)
	http.Redirect(w, r, h.frontendURL+"/home", http.StatusTemporaryRedirect)
}

// --- SHARED CALLBACK LOGIC ---

func (h *OAuthHandler) handleCallback(
	r *http.Request,
	cfg *oauth2.Config,
	fetchUser func(ctx context.Context, token *oauth2.Token) (*service.OAuthUserInfo, error),
) (*service.OAuthUserInfo, error) {
	code := r.URL.Query().Get("code")
	if code == "" {
		return nil, errors.New("missing code")
	}

	token, err := cfg.Exchange(r.Context(), code)
	if err != nil {
		return nil, err
	}

	return fetchUser(r.Context(), token)
}

// --- REDIRECT WITH ERROR ---

// Redirects to frontend with ?error=... so the UI can show a message
func (h *OAuthHandler) redirectWithError(w http.ResponseWriter, r *http.Request, err error) {
	msg := "something_went_wrong"
	if errors.Is(err, service.ErrEmailConflict) {
		msg = "email_conflict"
	}
	http.Redirect(w, r, h.frontendURL+"/login?error="+msg, http.StatusTemporaryRedirect)
}

// --- GOOGLE USER FETCH ---

type googleUserResponse struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

func fetchGoogleUser(ctx context.Context, token *oauth2.Token) (*service.OAuthUserInfo, error) {
	client := oauth2.NewClient(ctx, oauth2.StaticTokenSource(token))
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var u googleUserResponse
	if err := json.Unmarshal(body, &u); err != nil {
		return nil, err
	}

	return &service.OAuthUserInfo{
		ProviderID: u.Sub,
		Email:      u.Email,
		Username:   u.Name,
	}, nil
}

// --- GITHUB USER FETCH ---

type githubUserResponse struct {
	ID    int    `json:"id"`
	Login string `json:"login"`
	Email string `json:"email"`
}

type githubEmailResponse struct {
	Email    string `json:"email"`
	Primary  bool   `json:"primary"`
	Verified bool   `json:"verified"`
}

func fetchGitHubUser(ctx context.Context, token *oauth2.Token) (*service.OAuthUserInfo, error) {
	client := oauth2.NewClient(ctx, oauth2.StaticTokenSource(token))

	// fetch profile
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var u githubUserResponse
	if err := json.Unmarshal(body, &u); err != nil {
		return nil, err
	}

	email := u.Email

	// GitHub users can have private emails — email field above will be empty
	// in that case, fetch from the emails endpoint
	if email == "" {
		email, err = fetchGitHubPrimaryEmail(client)
		if err != nil {
			return nil, err
		}
	}

	return &service.OAuthUserInfo{
		ProviderID: fmt.Sprintf("%d", u.ID),
		Email:      email,
		Username:   u.Login,
	}, nil
}

func fetchGitHubPrimaryEmail(client *http.Client) (string, error) {
	resp, err := client.Get("https://api.github.com/user/emails")
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var emails []githubEmailResponse
	if err := json.Unmarshal(body, &emails); err != nil {
		return "", err
	}

	for _, e := range emails {
		if e.Primary && e.Verified {
			return e.Email, nil
		}
	}

	return "", errors.New("no verified primary email on github account")
}
