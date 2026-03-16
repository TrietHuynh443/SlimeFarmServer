package services

import (
	"context"
	"errors"
	"strings"

	"backend-service/internal/db/dbgen"

	"github.com/jackc/pgx/v5/pgtype"
)

var ErrDisplayNameUnavailable = errors.New("please change your display name to join a room")

type PlayerAssignmentService struct {
	queries *dbgen.Queries
}

func NewPlayerAssignmentService(queries *dbgen.Queries) *PlayerAssignmentService {
	return &PlayerAssignmentService{
		queries: queries,
	}
}

func (s *PlayerAssignmentService) AssignPlayer(ctx context.Context, displayName string) (*dbgen.Player, error) {
	displayName = strings.TrimSpace(displayName)
	if displayName == "" {
		return nil, errors.New("display name is required")
	}

	roomID, err := s.resolveRoomID(ctx, displayName)
	if err != nil {
		return nil, err
	}

	player, err := s.queries.CreatePlayer(ctx, dbgen.CreatePlayerParams{
		FkRoomID: pgtype.Int8{
			Int64: roomID,
			Valid: true,
		},
		DisplayName: displayName,
	})
	if err != nil {
		return nil, err
	}

	return &player, nil
}

func (s *PlayerAssignmentService) resolveRoomID(ctx context.Context, displayName string) (int64, error) {
	count, err := s.queries.CountRooms(ctx)
	if err != nil {
		return 0, err
	}

	if count == 0 {
		room, err := s.queries.CreateRoom(ctx, "active")
		if err != nil {
			return 0, err
		}
		return room.ID, nil	
	}

	room, err := s.queries.GetAvailableRoomWithoutPlayerName(ctx, displayName)
	if err != nil {
		return 0, ErrDisplayNameUnavailable
	}

	return room.ID, nil
}
