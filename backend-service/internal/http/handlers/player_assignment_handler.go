package handlers

import (
	"encoding/json"
	"net/http"

	"backend-service/internal/services"
)

type PlayerAssignmentRequest struct {
	PlayerDisplayName string `json:"player_display_name"`
}

type PlayerAssignmentResponse struct {
	PlayerID int64 `json:"player_id"`
	RoomID int64 `json:"room_id"`
}

type PlayerAssignmentHandler struct {
	playerAssignmentService *services.PlayerAssignmentService
}

func NewPlayerAssignmentHandler(playerAssignmentService *services.PlayerAssignmentService) *PlayerAssignmentHandler {
	return &PlayerAssignmentHandler{
		playerAssignmentService: playerAssignmentService,
	}
}

func (handler *PlayerAssignmentHandler) HandlePlayerAssignment(w http.ResponseWriter, r *http.Request) {
	var request PlayerAssignmentRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	ctx := r.Context()
	player, err := handler.playerAssignmentService.AssignPlayer(ctx, request.PlayerDisplayName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	response := PlayerAssignmentResponse{
		PlayerID: player.ID,
		RoomID: player.FkRoomID.Int64,
	}
	
	_ = json.NewEncoder(w).Encode(response)
}
