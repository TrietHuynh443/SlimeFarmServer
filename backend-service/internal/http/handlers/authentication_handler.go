package handlers

import (
	"encoding/json"
	"net/http"

	"backend-service/internal/services"
	"backend-service/internal/db/dbgen"
)

type AuthenticationHandler struct {
	authenticationService *services.AuthenticationService
}

func NewAuthenticationHandler(authenticationService *services.AuthenticationService) *AuthenticationHandler {
	return &AuthenticationHandler{
		authenticationService: authenticationService,
	}
}

type RegisterUserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type RegisterUserResponse struct {
	User *dbgen.User `json:"user"`
}

type LoginUserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginUserResponse struct {
	User *dbgen.User `json:"user"`
}

func (handler *AuthenticationHandler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var request RegisterUserRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	user, err := handler.authenticationService.RegisterUser(ctx, request.Username, request.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}	
	response := RegisterUserResponse{
		User: user,
	}
	_ = json.NewEncoder(w).Encode(response)
}

func (handler *AuthenticationHandler) LoginUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var request LoginUserRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	user, err := handler.authenticationService.LoginUser(ctx, request.Username, request.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := LoginUserResponse{
		User: user,
	}
	_ = json.NewEncoder(w).Encode(response)
}
