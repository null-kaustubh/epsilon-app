package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"api-golang/internal/middleware"
	"api-golang/internal/service"
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
		http.Error(w, "unsupported content type", http.StatusBadRequest)
		return
	}

	if folder != "spaces" && folder != "blocks" {
		http.Error(w, "invalid folder", http.StatusBadRequest)
		return
	}

	userID := fmt.Sprintf("%v", r.Context().Value(middleware.UserIDKey))
	key := fmt.Sprintf("%s/%s/%d.%s", folder, userID, time.Now().UnixNano(), ext)

	result, err := h.service.GeneratePresignedURL(r.Context(), key, contentType)
	if err != nil {
		http.Error(w, "failed to generate upload url", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
