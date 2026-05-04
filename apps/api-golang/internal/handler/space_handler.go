package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
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

type swaggerBlock struct {
	ID        string      `json:"id"`
	SpaceID   string      `json:"space_id"`
	Type      string      `json:"type"`
	Content   string      `json:"content"`
	X         int32       `json:"x"`
	Y         int32       `json:"y"`
	W         int32       `json:"w"`
	H         int32       `json:"h"`
	CreatedAt string      `json:"created_at"`
	UpdatedAt string      `json:"updated_at"`
	Style     interface{} `json:"style"`
}

type createSpaceRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type updateSpaceRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	IconUrl     string `json:"icon_url"`
}

type getSpaceResponse struct {
	Space  db.Space       `json:"space"`
	Blocks []swaggerBlock `json:"blocks"`
}

func NewSpaceHandler(s *service.SpaceService) *SpaceHandler {
	return &SpaceHandler{service: s}
}

// --- CREATE SPACE ---
// @Summary      Create space
// @Tags         spaces
// @Security     CookieAuth
// @Accept       json
// @Produce      json
// @Param        body body createSpaceRequest true "Space payload"
// @Success      201  {object}  db.Space
// @Failure      400  {object}  map[string]string
// @Router       /spaces [post]
func (h *SpaceHandler) CreateSpace(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)

	var body struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	space, err := h.service.CreateSpace(r.Context(), userID, body.Name, body.Description)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to create space")
		return
	}

	response.JSON(w, http.StatusCreated, space)
}

// --- LIST SPACES ---
// @Summary      List spaces
// @Tags         spaces
// @Security     CookieAuth
// @Produce      json
// @Success      200  {array}   db.Space
// @Router       /spaces [get]
func (h *SpaceHandler) ListSpaces(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)

	spaces, err := h.service.ListSpaces(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch spaces")
		return
	}

	response.JSON(w, http.StatusOK, spaces)
}

// --- GET SPACE ---
// @Summary      Get space by slug
// @Tags         spaces
// @Security     CookieAuth
// @Produce      json
// @Param        slug path string true "Space slug"
// @Success      200  {object}  getSpaceResponse
// @Failure      404  {object}  map[string]string
// @Router       /spaces/{slug} [get]
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

// --- UPDATE SPACE NAME ---
// @Summary      Update space
// @Tags         spaces
// @Security     CookieAuth
// @Accept       json
// @Param        slug path string true "Space slug"
// @Param        body body updateSpaceRequest true "Update payload"
// @Success      200  {object}  map[string]bool
// @Router       /spaces/{slug} [put]
func (h *SpaceHandler) UpdateSpaceName(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	slug := r.PathValue("slug")

	var body struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		IconUrl     string `json:"icon_url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.service.UpdateSpaceName(r.Context(), slug, userID, body.Name, body.Description, body.IconUrl); err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to update space")
		return
	}

	response.JSON(w, http.StatusOK, true)
}

// --- DELETE SPACE ---
// @Summary      Delete space
// @Tags         spaces
// @Security     CookieAuth
// @Param        slug path string true "Space slug"
// @Success      200  {object}  map[string]bool
// @Router       /spaces/{slug} [delete]
func (h *SpaceHandler) DeleteSpace(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	slug := r.PathValue("slug")

	if err := h.service.DeleteSpace(r.Context(), slug, userID); err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to delete space")
		return
	}

	response.JSON(w, http.StatusOK, true)
}

// --- SAVE BLOCKS ---
// @Summary      Save blocks
// @Tags         spaces
// @Security     CookieAuth
// @Accept       json
// @Param        slug path string true "Space slug"
// @Param        body body []db.UpsertBlockParams true "Blocks array"
// @Success      200  {object}  map[string]bool
// @Failure      400  {object}  map[string]string
// @Router       /spaces/{slug}/blocks [patch]
func (h *SpaceHandler) SaveBlocks(w http.ResponseWriter, r *http.Request) {
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

	var blocks []db.UpsertBlockParams
	if err := json.NewDecoder(r.Body).Decode(&blocks); err != nil {
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

// --- DELETE BLOCK ---
// @Summary      Delete block
// @Tags         spaces
// @Security     CookieAuth
// @Param        slug    path string true "Space slug"
// @Param        blockId path string true "Block UUID"
// @Success      200  {object}  map[string]bool
// @Failure      404  {object}  map[string]string
// @Router       /spaces/{slug}/blocks/{blockId} [delete]

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
