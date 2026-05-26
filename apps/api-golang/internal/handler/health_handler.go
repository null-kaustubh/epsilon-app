package handler

import (
	"api-golang/internal/response"
	"database/sql"
	"net/http"
)

var dbConn *sql.DB

func InitHealth(database *sql.DB) {
	dbConn = database
}

func Health(w http.ResponseWriter, r *http.Request) {
	if err := dbConn.Ping(); err != nil {
		response.JSON(w, http.StatusServiceUnavailable, map[string]string{
			"status": "db unreachable",
		})
		return
	}
	response.JSON(w, http.StatusOK, map[string]string{
		"status": "ok",
	})
}
