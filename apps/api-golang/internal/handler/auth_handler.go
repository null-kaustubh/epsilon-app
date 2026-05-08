package handler

import (
	"encoding/json"
	"errors"
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

type forgotPasswordRequest struct {
	Email string `json:"email"`
}

type resetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
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

// --- FORGOT PASSWORD ---
// @Summary      Forgot password
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body forgotPasswordRequest true "Email"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Router       /auth/forgot-password [post]
func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req forgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.service.ForgotPassword(r.Context(), req.Email); err != nil {
		if errors.Is(err, service.ErrInvalidEmail) {
			response.Error(w, http.StatusBadRequest, "invalid email address")
			return
		}
		response.Error(w, http.StatusInternalServerError, "something went wrong")
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "if this email exists, a reset link has been sent",
	})
}

// --- RESET PASSWORD ---
// @Summary      Reset password
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body resetPasswordRequest true "Token + new password"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Router       /auth/reset-password [post]
func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req resetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.service.ResetPassword(r.Context(), req.Token, req.NewPassword); err != nil {
		if errors.Is(err, service.ErrInvalidOrExpiredToken) {
			response.Error(w, http.StatusBadRequest, "invalid or expired reset token")
			return
		}
		if errors.Is(err, service.ErrWeakPassword) {
			response.Error(w, http.StatusBadRequest, "password does not meet requirements")
			return
		}
		response.Error(w, http.StatusInternalServerError, "something went wrong")
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "password updated successfully",
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
