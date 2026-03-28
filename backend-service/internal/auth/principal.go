package auth

type Principal struct {
	IsAuthenticated bool
	UserID          *int64
	Username        string
	PlayerID        *int64
}
