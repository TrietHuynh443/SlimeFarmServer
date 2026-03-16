package routes

import (
	"net/http"

	"backend-service/internal/http/handlers"

	"github.com/go-chi/chi/v5"
)

type Handlers struct {
	PlayerAssignment *handlers.PlayerAssignmentHandler
}

func RegisterRoutes(r chi.Router, handlers *Handlers) {
	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	r.Route("/v1", func(r chi.Router) {
		r.Post("/player-assignment", handlers.PlayerAssignment.HandlePlayerAssignment)
	})
}
