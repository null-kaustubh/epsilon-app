package response

import (
	"encoding/json"
	"net/http"
)

type APIResponse struct {
	Data  interface{} `json:"data"`
	Error interface{} `json:"error"`
}

func JSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	res := APIResponse{
		Data:  data,
		Error: nil,
	}

	_ = json.NewEncoder(w).Encode(res)
}

func Error(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	res := APIResponse{
		Data:  nil,
		Error: message,
	}

	_ = json.NewEncoder(w).Encode(res)
}
