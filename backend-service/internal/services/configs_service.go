package services

import (
	"context"
	"encoding/json"

	"backend-service/internal/db/dbgen"
)

type ConfigsService struct {
	queries *dbgen.Queries
}

func NewConfigsService(queries *dbgen.Queries) *ConfigsService {
	return &ConfigsService{
		queries: queries,
	}
}

func (s *ConfigsService) GetConfigs(ctx context.Context) ([]dbgen.Config, error) {
	configs, err := s.queries.ListConfigs(ctx)
	if err != nil {
		return nil, err
	}
	return configs, nil
}

func (s *ConfigsService) UpdateConfig(ctx context.Context, key string, value json.RawMessage) (*dbgen.Config, error) {
	config, err := s.queries.UpdateConfig(ctx, dbgen.UpdateConfigParams{
		Key: key,
		Value: []byte(value),
	})
	
	if err != nil {
		return nil, err
	}
	
	return &config, nil
}
