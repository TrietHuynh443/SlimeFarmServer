APP_NAME := backend-service
CMD := ./cmd/api
PORT ?= 8080
DATABASE_URL ?= postgres://app:app@localhost:5439/backend_service?sslmode=disable

.PHONY: help tidy fmt test run up down logs db-wait goose-create goose-up goose-down sqlc

help:
	@echo "Targets:"
	@echo "  up          Start postgres (docker compose)"
	@echo "  down        Stop postgres"
	@echo "  db-wait     Wait for postgres healthcheck"
	@echo "  goose-up    Apply migrations"
	@echo "  run         Run API"
	@echo "  sqlc        Generate sqlc code"
	@echo "  tidy/fmt/test"

tidy:
	go mod tidy

fmt:
	go fmt ./...

test:
	go test ./...

run:
	PORT=$(PORT) DATABASE_URL="$(DATABASE_URL)" go run $(CMD)

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f postgres

db-wait:
	@echo "Waiting for postgres to be ready..."
	@until docker inspect --format='{{json .State.Health.Status}}' backend-service-postgres 2>/dev/null | grep -q healthy; do \
		sleep 1; \
	done
	@echo "Postgres is healthy."

goose-create:
	@read -p "Migration name: " name; \
	goose -dir ./migrations create $$name sql

goose-up:
	goose -dir ./migrations postgres "$(DATABASE_URL)" up

goose-down:
	goose -dir ./migrations postgres "$(DATABASE_URL)" down

sqlc:
	sqlc generate
