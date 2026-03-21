package handlers

import (
	"encoding/json"
	"net/http"

	"backend-service/internal/services"
	"backend-service/internal/db/dbgen"
)

type GetConfigsResponse struct {
	Configs []dbgen.Config `json:"configs"`
}

type UpdateConfigRequest struct {
	Key   string          `json:"key"`
	Value json.RawMessage `json:"value"`
}

type UpdateConfigResponse struct {
	Config *dbgen.Config
}

type ConfigsHandler struct {
	configsService *services.ConfigsService
}

func NewConfigsHandler(configsService *services.ConfigsService) *ConfigsHandler {
	return &ConfigsHandler{
		configsService: configsService,
	}
}

func (handler *ConfigsHandler) GetConfigs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	configs, err := handler.configsService.GetConfigs(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}	
	response := GetConfigsResponse{
		Configs: configs,
	}
	_ = json.NewEncoder(w).Encode(response)
}

func (handler *ConfigsHandler) UpdateConfig(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var request UpdateConfigRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	config, err := handler.configsService.UpdateConfig(ctx, request.Key, request.Value)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := UpdateConfigResponse{
		Config: config,
	}
	_ = json.NewEncoder(w).Encode(response)
}
