package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"backend-service/internal/db"
	"backend-service/internal/db/dbgen"
	"backend-service/internal/services"

	"backend-service/internal/http/handlers"
	"backend-service/internal/http/routes"
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
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(5 * time.Second))

	// DB connection
	queries := dbgen.New(pool)

	// Services
	playerAssignmentService := services.NewPlayerAssignmentService(queries)
	configsService := services.NewConfigsService(queries)
	authenticationService := services.NewAuthenticationService(queries)

	// Handlers
	playerAssignmentHandler := handlers.NewPlayerAssignmentHandler(playerAssignmentService)
	configsHandler := handlers.NewConfigsHandler(configsService)
	authenticationHandler := handlers.NewAuthenticationHandler(authenticationService)

	handlers := routes.Handlers{
		PlayerAssignment: playerAssignmentHandler,
		Configs: configsHandler,
		Authentication: authenticationHandler,
	}

	// Routes
	routes.RegisterRoutes(r, &handlers)

	log.Printf("listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))

	_ = pool // remove once you use it
}
