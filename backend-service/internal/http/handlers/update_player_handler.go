package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"backend-service/internal/auth"
	"backend-service/internal/services"
)

type UpdatePlayerHandler struct {
	updatePlayerService *services.UpdatePlayerService
}

func NewUpdatePlayerHandler(updatePlayerService *services.UpdatePlayerService) *UpdatePlayerHandler {
	return &UpdatePlayerHandler{
		updatePlayerService: updatePlayerService,
	}
}

type updatePlayerRequest struct {
	DisplayName string `json:"display_name"`
}

type updatePlayerResponse struct {
	ID          int64  `json:"id"`
	DisplayName string `json:"display_name"`
	RoomID      *int64 `json:"room_id,omitempty"`
}

func (h *UpdatePlayerHandler) UpdatePlayer(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.GetClaims(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var playerID int64
	if claims.PlayerID != nil && *claims.PlayerID != 0 {
		playerID = *claims.PlayerID
	} else {
		http.Error(w, "player id required in token", http.StatusUnauthorized)
		return
	}

	var userID *int64
	if claims.UserID != 0 {
		uid := claims.UserID
		userID = &uid
	}

	var body updatePlayerRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	updated, err := h.updatePlayerService.UpdatePlayer(r.Context(), services.UpdatePlayerParams{
		UserID:      userID,
		PlayerID:    playerID,
		DisplayName: body.DisplayName,
	})
	if err != nil {
		switch {
		case errors.Is(err, services.ErrDisplayNameRequired):
			http.Error(w, err.Error(), http.StatusBadRequest)
		case errors.Is(err, services.ErrPlayerUserMismatch):
			http.Error(w, err.Error(), http.StatusForbidden)
		case errors.Is(err, services.ErrPlayerNotFound):
			http.Error(w, err.Error(), http.StatusNotFound)
		case errors.Is(err, services.ErrPlayernameIsDuplicated):
			http.Error(w, err.Error(), http.StatusConflict)
		default:
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	resp := updatePlayerResponse{ID: updated.ID}
	if updated.DisplayName.Valid {
		resp.DisplayName = updated.DisplayName.String
	}
	if updated.FkRoomID.Valid {
		rid := updated.FkRoomID.Int64
		resp.RoomID = &rid
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}
