package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"backend-service/internal/auth"
	"backend-service/internal/services"
)

type GetPlayerRoomHandler struct {
	getPlayerRoomService *services.GetPlayerRoomService
}

func NewGetPlayerRoomHandler(getPlayerRoomService *services.GetPlayerRoomService) *GetPlayerRoomHandler {
	return &GetPlayerRoomHandler{
		getPlayerRoomService: getPlayerRoomService,
	}
}

type getPlayerRoomResponse struct {
	RoomID int64   `json:"room_id"`
	JWT    *string `json:"jwt,omitempty"`
}

func (h *GetPlayerRoomHandler) GetPlayerRoom(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	params := services.GetPlayerRoomParams{}
	if p, ok := auth.GetPrincipal(ctx); ok && p.IsAuthenticated {
		params.Username = p.Username
		if p.UserID != nil && *p.UserID != 0 {
			params.UserID = p.UserID
		}
		if p.PlayerID != nil && *p.PlayerID != 0 {
			params.PlayerID = p.PlayerID
		}
	}

	room, jwt, err := h.getPlayerRoomService.GetPlayerRoom(ctx, params)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrPlayerUserMismatch):
			http.Error(w, err.Error(), http.StatusBadRequest)
		case errors.Is(err, services.ErrPlayerNotFound):
			http.Error(w, err.Error(), http.StatusNotFound)
		default:
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(getPlayerRoomResponse{
		RoomID: room.ID,
		JWT:    jwt,
	})
}
