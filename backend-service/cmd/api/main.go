package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"backend-service/internal/db"
	"backend-service/internal/db/dbgen"
	"backend-service/internal/services"
	"backend-service/internal/auth"

	"backend-service/internal/http/handlers"
	"backend-service/internal/http/routes"
	"backend-service/internal/http/middleware"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	ctx := context.Background()
	pool, err := db.NewPool(ctx, databaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	r := chi.NewRouter()

	// DB connection
	queries := dbgen.New(pool)

	// JWT Manager
	jwtExpiration, err := strconv.Atoi(os.Getenv("JWT_EXPIRATION_IN_MINUTES"))
	if err != nil {
		log.Fatal("JWT_EXPIRATION_IN_MINUTES is required")
		jwtExpiration = 15
	}
	jwtManager := &auth.JWTManager{
		Secret:     os.Getenv("JWT_SECRET"),
		Expiration: time.Duration(jwtExpiration) * time.Minute,
	}

	// Services
	playerAssignmentService := services.NewPlayerAssignmentService(queries)
	configsService := services.NewConfigsService(queries)
	authenticationService := services.NewAuthenticationService(queries, jwtManager)

	// Handlers
	playerAssignmentHandler := handlers.NewPlayerAssignmentHandler(playerAssignmentService)
	configsHandler := handlers.NewConfigsHandler(configsService)
	authenticationHandler := handlers.NewAuthenticationHandler(authenticationService)

	deps := routes.Dependencies{
		PlayerAssignment: playerAssignmentHandler,
		Configs: configsHandler,
		Authentication: authenticationHandler,
		JWTMiddleware: middleware.JWTAuth(jwtManager),
	}

	// Routes
	routes.RegisterRoutes(r, &deps)

	log.Printf("listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))

	_ = pool // remove once you use it
}
