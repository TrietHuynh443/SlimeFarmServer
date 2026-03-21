package middleware

import (
	"crypto/subtle"
	"net/http"
)

func APIKeyAuth(expectedAPIKey string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			apiKey := r.Header.Get("X-API-Key")
			if apiKey == "" {
				http.Error(w, "missing api key", http.StatusUnauthorized)
				return
			}

			if subtle.ConstantTimeCompare([]byte(apiKey), []byte(expectedAPIKey)) != 1 {
				http.Error(w, "invalid api key", http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
