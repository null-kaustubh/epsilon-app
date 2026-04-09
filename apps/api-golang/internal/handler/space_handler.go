package handler

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"

	"api-golang/internal/middleware"
	"api-golang/internal/response"
	"api-golang/internal/service"

	db "api-golang/internal/db/sqlc"

	"github.com/google/uuid"
)

type SpaceHandler struct {
	service *service.SpaceService
}

func NewSpaceHandler(s *service.SpaceService) *SpaceHandler {
	return &SpaceHandler{service: s}
}

func (h *SpaceHandler) CreateSpace(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)

	var body struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	space, err := h.service.CreateSpace(r.Context(), userID, body.Name)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to create space")
		return
	}

	response.JSON(w, http.StatusCreated, space)
}

func (h *SpaceHandler) ListSpaces(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)

	spaces, err := h.service.ListSpaces(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch spaces")
		return
	}

	response.JSON(w, http.StatusOK, spaces)
}

func (h *SpaceHandler) GetSpace(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	slug := r.PathValue("slug")

	space, blocks, err := h.service.GetSpace(r.Context(), slug, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			response.Error(w, http.StatusNotFound, "space not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "failed to fetch space")
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"space":  space,
		"blocks": blocks,
	})
}

func (h *SpaceHandler) UpdateSpaceName(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	slug := r.PathValue("slug")

	var body struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.service.UpdateSpaceName(r.Context(), slug, userID, body.Name); err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to update space")
		return
	}

	response.JSON(w, http.StatusOK, true)
}

func (h *SpaceHandler) DeleteSpace(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	slug := r.PathValue("slug")

	if err := h.service.DeleteSpace(r.Context(), slug, userID); err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to delete space")
		return
	}

	response.JSON(w, http.StatusOK, true)
}

func (h *SpaceHandler) SaveBlocks(w http.ResponseWriter, r *http.Request) {
	log.Printf("SaveBlocks called")
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	slug := r.PathValue("slug")

	space, _, err := h.service.GetSpace(r.Context(), slug, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			response.Error(w, http.StatusNotFound, "space not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "failed to fetch space")
		return
	}

	// debug — remove after
	body, _ := io.ReadAll(r.Body)
	log.Printf("SaveBlocks raw body: %s", string(body))
	r.Body = io.NopCloser(bytes.NewBuffer(body))

	var blocks []db.UpsertBlockParams
	if err := json.NewDecoder(r.Body).Decode(&blocks); err != nil {
		log.Printf("SaveBlocks decode error: %v", err)
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(blocks) == 0 {
		response.JSON(w, http.StatusOK, true)
		return
	}

	if err := h.service.SaveBlocks(r.Context(), space.ID, blocks); err != nil {
		// validation errors from service are user-facing
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, true)
}

func (h *SpaceHandler) DeleteBlock(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	slug := r.PathValue("slug")

	blockID, err := uuid.Parse(r.PathValue("blockId"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid block id")
		return
	}

	space, _, err := h.service.GetSpace(r.Context(), slug, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			response.Error(w, http.StatusNotFound, "space not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "failed to fetch space")
		return
	}

	if err := h.service.DeleteBlock(r.Context(), blockID, space.ID); err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to delete block")
		return
	}

	response.JSON(w, http.StatusOK, true)
}
