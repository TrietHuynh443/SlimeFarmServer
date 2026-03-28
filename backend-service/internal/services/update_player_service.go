package services

import (
	"context"
	"errors"
	"strings"

	"backend-service/internal/db/dbgen"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
)

var (
	ErrPlayernameIsDuplicated = errors.New("player name is duplicated")
	ErrDisplayNameRequired    = errors.New("display_name is required")
)

type UpdatePlayerService struct {
	queries *dbgen.Queries
}

type UpdatePlayerParams struct {
	UserID      *int64
	PlayerID    int64
	DisplayName string
}

func NewUpdatePlayerService(queries *dbgen.Queries) *UpdatePlayerService {
	return &UpdatePlayerService{
		queries: queries,
	}
}

func (s *UpdatePlayerService) UpdatePlayer(ctx context.Context, params UpdatePlayerParams) (*dbgen.GetPlayerByIDRow, error) {
	name := strings.TrimSpace(params.DisplayName)
	if name == "" {
		return nil, ErrDisplayNameRequired
	}

	if params.UserID != nil && *params.UserID == 0 {
		params.UserID = nil
	}
	if params.PlayerID == 0 {
		return nil, ErrPlayerNotFound
	}

	p, err := s.queries.GetPlayerByID(ctx, params.PlayerID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPlayerNotFound
		}
		return nil, err
	}

	if p.FkUserID.Valid {
		if params.UserID == nil || *params.UserID != p.FkUserID.Int64 {
			return nil, ErrPlayerUserMismatch
		}
	} else if params.UserID != nil {
		return nil, ErrPlayerUserMismatch
	}

	_, err = s.queries.UpdatePlayer(ctx, dbgen.UpdatePlayerParams{
		FkRoomID:    pgtype.Int8{},
		DisplayName: pgtype.Text{Valid: true, String: name},
		ID:          p.ID,
	})
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrPlayernameIsDuplicated
		}
		return nil, err
	}

	updated, err := s.queries.GetPlayerByID(ctx, p.ID)
	if err != nil {
		return nil, err
	}

	return &updated, nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
