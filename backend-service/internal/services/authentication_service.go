package services

import (
	"context"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"golang.org/x/crypto/bcrypt"

	"backend-service/internal/auth"
	"backend-service/internal/db/dbgen"
)

type AuthenticationService struct {
	queries *dbgen.Queries
	jwtManager *auth.JWTManager
}

func NewAuthenticationService(queries *dbgen.Queries, jwtManager *auth.JWTManager) *AuthenticationService {
	return &AuthenticationService{
		queries: queries,
		jwtManager: jwtManager,
	}
}

func (s *AuthenticationService) RegisterUser(ctx context.Context, username string, password string) (*dbgen.User, error) {
	username = strings.TrimSpace(username)
	if username == "" {
		return nil, errors.New("username is required")
	}

	password = strings.TrimSpace(password)
	if password == "" {
		return nil, errors.New("password is required")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user, err := s.queries.CreateUser(ctx, dbgen.CreateUserParams{
		Username: username,
		HashedPassword: string(hashedPassword[:]),
	})
	
	if err != nil {
		return nil, err
	}
	
	return &user, nil
}

func (s *AuthenticationService) LoginUser(ctx context.Context, username string, password string) (*string, error) {
	user, err := s.queries.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, errors.New("invalid username or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(password)); err != nil {
		return nil, errors.New("invalid username or password")
	}

	// optional, if no player is found, the player ID will be nil
	player, err := s.queries.GetPlayerByUserID(ctx, pgtype.Int8{Int64: user.ID, Valid: true})
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}

	token, err := s.jwtManager.Generate(user.ID, user.Username, &player.ID)
	if err != nil {
		return nil, err
	}

	return &token, nil
}
