package handler

import (
	"errors"
	"net/http"

	"api-golang/internal/repository"
	"api-golang/internal/request"
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

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := request.DecodeJSON(w, r, &req); err != nil {
		if request.IsBodyTooLarge(err) {
			response.Error(w, http.StatusRequestEntityTooLarge, "request body too large")
			return
		}
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	user, sessionID, err := h.service.Register(r.Context(), req.Email, req.Password, req.Username)
	if err != nil {
		if errors.Is(err, repository.ErrUserExists) ||
			errors.Is(err, service.ErrUsernameTaken) ||
			errors.Is(err, service.ErrInvalidUsername) ||
			errors.Is(err, service.ErrWeakPassword) ||
			errors.Is(err, service.ErrInvalidEmail) {
			response.Error(w, http.StatusBadRequest, mapRegisterError(err))
			return
		}
		response.Error(w, http.StatusBadRequest, "registration failed")
		return
	}

	setSessionCookie(w, sessionID)

	response.JSON(w, http.StatusOK, map[string]string{
		"id":       user.ID.String(),
		"email":    user.Email,
		"username": user.Username,
	})
}

func mapRegisterError(err error) string {
	switch {
	case errors.Is(err, service.ErrWeakPassword):
		return "password does not meet requirements"
	case errors.Is(err, service.ErrInvalidUsername):
		return "invalid username"
	case errors.Is(err, service.ErrInvalidEmail):
		return "invalid email address"
	default:
		return "registration failed"
	}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := request.DecodeJSON(w, r, &req); err != nil {
		if request.IsBodyTooLarge(err) {
			response.Error(w, http.StatusRequestEntityTooLarge, "request body too large")
			return
		}
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

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(sessionCookieName)
	if err == nil {
		h.service.Logout(r.Context(), cookie.Value)
	}

	clearSessionCookie(w)
	response.JSON(w, http.StatusOK, true)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(sessionCookieName)
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

func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req forgotPasswordRequest
	if err := request.DecodeJSON(w, r, &req); err != nil {
		if request.IsBodyTooLarge(err) {
			response.Error(w, http.StatusRequestEntityTooLarge, "request body too large")
			return
		}
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

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req resetPasswordRequest
	if err := request.DecodeJSON(w, r, &req); err != nil {
		if request.IsBodyTooLarge(err) {
			response.Error(w, http.StatusRequestEntityTooLarge, "request body too large")
			return
		}
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
