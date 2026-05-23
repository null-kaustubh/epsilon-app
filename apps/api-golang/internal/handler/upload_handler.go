package handler

import (
	"fmt"
	"net/http"
	"time"

	"api-golang/internal/middleware"
	"api-golang/internal/response"
	"api-golang/internal/service"

	"github.com/google/uuid"
)

type UploadHandler struct {
	service *service.UploadService
}

func NewUploadHandler(svc *service.UploadService) *UploadHandler {
	return &UploadHandler{service: svc}
}

var allowedTypes = map[string]string{
	"image/jpeg": "jpg",
	"image/png":  "png",
	"image/webp": "webp",
}

func (h *UploadHandler) GetUploadURL(w http.ResponseWriter, r *http.Request) {
	contentType := r.URL.Query().Get("content_type")
	folder := r.URL.Query().Get("folder")

	ext, ok := allowedTypes[contentType]
	if !ok {
		response.Error(w, http.StatusBadRequest, "unsupported content type")
		return
	}

	if folder != "spaces" && folder != "blocks" {
		response.Error(w, http.StatusBadRequest, "invalid folder")
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	key := fmt.Sprintf("%s/%s/%d.%s", folder, userID.String(), time.Now().UnixNano(), ext)

	result, err := h.service.GeneratePresignedURL(r.Context(), key, contentType)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to generate upload url")
		return
	}

	response.JSON(w, http.StatusOK, result)
}
