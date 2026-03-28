package services

import (
	"context"
	"errors"

	"backend-service/internal/auth"
	"backend-service/internal/db/dbgen"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

var (
	ErrPlayerUserMismatch = errors.New("player does not belong to the user")
	ErrPlayerNotFound     = errors.New("player not found")
)

type GetPlayerRoomService struct {
	queries    *dbgen.Queries
	jwtManager *auth.JWTManager
}

type GetPlayerRoomParams struct {
	UserID   *int64
	PlayerID *int64
	Username string
}

func NewGetPlayerRoomService(queries *dbgen.Queries, jwtManager *auth.JWTManager) *GetPlayerRoomService {
	return &GetPlayerRoomService{
		queries:    queries,
		jwtManager: jwtManager,
	}
}

func userPlayerRowToByIDRow(u dbgen.GetPlayerByUserIDRow) dbgen.GetPlayerByIDRow {
	return dbgen.GetPlayerByIDRow{
		ID:          u.ID,
		FkUserID:    u.FkUserID,
		FkRoomID:    u.FkRoomID,
		DisplayName: u.DisplayName,
		CreatedAt:   u.CreatedAt,
		UpdatedAt:   u.UpdatedAt,
	}
}

func (s *GetPlayerRoomService) GetPlayerRoom(ctx context.Context, params GetPlayerRoomParams) (*dbgen.Room, *string, error) {
	if params.UserID != nil && *params.UserID == 0 {
		params.UserID = nil
	}
	if params.PlayerID != nil && *params.PlayerID == 0 {
		params.PlayerID = nil
	}

	var player *dbgen.GetPlayerByIDRow

	if params.PlayerID != nil {
		p, err := s.queries.GetPlayerByID(ctx, *params.PlayerID)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return nil, nil, ErrPlayerNotFound
			}
			return nil, nil, err
		}
		if params.UserID != nil {
			if !p.FkUserID.Valid || p.FkUserID.Int64 != *params.UserID {
				return nil, nil, ErrPlayerUserMismatch
			}
		}
		player = &p
	} else if params.UserID != nil {
		pu, err := s.queries.GetPlayerByUserID(ctx, pgtype.Int8{Int64: *params.UserID, Valid: true})
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				player = nil
			} else {
				return nil, nil, err
			}
		} else {
			row := userPlayerRowToByIDRow(pu)
			player = &row
		}
	}

	if player != nil && player.FkRoomID.Valid {
		room, err := s.queries.GetRoomByID(ctx, player.FkRoomID.Int64)
		if err != nil {
			return nil, nil, err
		}
		return &room, nil, nil
	}

	room, err := s.pickRoom(ctx)
	if err != nil {
		return nil, nil, err
	}

	var createdNew bool
	var playerID int64

	if player == nil {
		cp, err := s.queries.CreatePlayer(ctx, dbgen.CreatePlayerParams{
			FkUserID:    optionalUserID(params.UserID),
			FkRoomID:    pgtype.Int8{Int64: room.ID, Valid: true},
			DisplayName: pgtype.Text{Valid: false},
		})
		if err != nil {
			return nil, nil, err
		}
		createdNew = true
		playerID = cp.ID
	} else {
		up, err := s.queries.UpdatePlayer(ctx, dbgen.UpdatePlayerParams{
			FkRoomID:    pgtype.Int8{Int64: room.ID, Valid: true},
			DisplayName: pgtype.Text{Valid: false},
			ID:          player.ID,
		})
		if err != nil {
			return nil, nil, err
		}
		playerID = up.ID
	}

	var jwtOut *string
	if createdNew {
		tokenUserID := int64(0)
		if params.UserID != nil {
			tokenUserID = *params.UserID
		}
		pid := playerID
		token, err := s.jwtManager.Generate(tokenUserID, params.Username, &pid)
		if err != nil {
			return nil, nil, err
		}
		jwtOut = &token
	}

	return &room, jwtOut, nil
}

func optionalUserID(userID *int64) pgtype.Int8 {
	if userID == nil {
		return pgtype.Int8{}
	}
	return pgtype.Int8{Int64: *userID, Valid: true}
}

func (s *GetPlayerRoomService) pickRoom(ctx context.Context) (dbgen.Room, error) {
	count, err := s.queries.CountRooms(ctx)
	if err != nil {
		return dbgen.Room{}, err
	}
	if count == 0 {
		return s.queries.CreateRoom(ctx, "active")
	}
	room, err := s.queries.GetAvailableRoom(ctx)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return s.queries.CreateRoom(ctx, "active")
		}
		return dbgen.Room{}, err
	}
	return room, nil
}
