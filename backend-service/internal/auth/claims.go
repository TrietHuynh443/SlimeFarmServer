package auth

import "github.com/golang-jwt/jwt/v5"

type Claims struct {
	UserID   int64   `json:"user_id"`
	Username string  `json:"username,omitempty"`
	PlayerID *int64  `json:"player_id,omitempty"`
	jwt.RegisteredClaims
}
