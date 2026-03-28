package middleware

import (
	"net/http"
	"strings"

	"backend-service/internal/auth"
)

func OptionalJWT(jwtManager *auth.JWTManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				next.ServeHTTP(w, r)
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, "invalid authorization header", http.StatusUnauthorized)
				return
			}

			claims, err := jwtManager.Verify(parts[1])
			if err != nil {
				http.Error(w, "invalid token", http.StatusUnauthorized)
				return
			}

			principal := &auth.Principal{
				IsAuthenticated: true,
				Username:        claims.Username,
			}
			if claims.UserID != 0 {
				uid := claims.UserID
				principal.UserID = &uid
			}
			if claims.PlayerID != nil && *claims.PlayerID != 0 {
				pid := *claims.PlayerID
				principal.PlayerID = &pid
			}

			ctx := auth.WithPrincipal(r.Context(), principal)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
