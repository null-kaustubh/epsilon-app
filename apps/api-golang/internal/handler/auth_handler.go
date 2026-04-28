package handler

import (
	"encoding/json"
	"net/http"

	"api-golang/internal/response"
	"api-golang/internal/service"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(s *service.AuthService) *AuthHandler {
	return &AuthHandler{service: s}
}

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Username string `json:"username"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// --- REGISTER ---
// @Summary      Register user
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body registerRequest true "Register payload"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Router       /auth/register [post]
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	user, sessionID, err := h.service.Register(r.Context(), req.Email, req.Password, req.Username)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	setSessionCookie(w, sessionID)

	response.JSON(w, http.StatusOK, map[string]string{
		"id":       user.ID.String(),
		"email":    user.Email,
		"username": user.Username,
	})
}

// --- LOGIN ---
// @Summary      Login
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body loginRequest true "Login payload"
// @Success      200  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Router       /auth/login [post]
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	user, sessionID, err := h.service.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	setSessionCookie(w, sessionID)

	response.JSON(w, http.StatusOK, map[string]string{
		"id":    user.ID.String(),
		"email": user.Email,
	})
}

// --- LOGOUT ---
// @Summary      Logout
// @Tags         auth
// @Security     CookieAuth
// @Success      200  {object}  map[string]bool
// @Router       /auth/logout [post]
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err == nil {
		h.service.Logout(r.Context(), cookie.Value)
	}

	http.SetCookie(w, &http.Cookie{
		Name:   "session_id",
		Value:  "",
		MaxAge: -1,
	})

	response.JSON(w, http.StatusOK, true)
}

// --- ME ---
// @Summary      Get current user
// @Tags         auth
// @Security     CookieAuth
// @Produce      json
// @Success      200  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Router       /auth/me [get]
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	user, err := h.service.GetUserFromSession(r.Context(), cookie.Value)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"id":       user.ID.String(),
		"email":    user.Email,
		"username": user.Username,
	})
}

// --- COOKIE ---

func setSessionCookie(w http.ResponseWriter, sessionID string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   false,
		MaxAge:   7 * 24 * 60 * 60,
	})
}
