package request

import (
	"encoding/json"
	"errors"
	"net/http"
)

const MaxBodyBytes = 2 << 20

func DecodeJSON(w http.ResponseWriter, r *http.Request, dst any) error {
	r.Body = http.MaxBytesReader(w, r.Body, MaxBodyBytes)
	if err := json.NewDecoder(r.Body).Decode(dst); err != nil {
		var maxErr *http.MaxBytesError
		if errors.As(err, &maxErr) {
			return errBodyTooLarge
		}
		return err
	}
	return nil
}

var errBodyTooLarge = errors.New("request body too large")

func IsBodyTooLarge(err error) bool {
	return errors.Is(err, errBodyTooLarge)
}
