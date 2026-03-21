package routes

import (
	"net/http"

	"backend-service/internal/http/handlers"

	"github.com/go-chi/chi/v5"
)

type Dependencies struct {
	PlayerAssignment *handlers.PlayerAssignmentHandler
	Configs *handlers.ConfigsHandler
	Authentication *handlers.AuthenticationHandler
	JWTMiddleware func(http.Handler) http.Handler
	APIKeyMiddleware func(http.Handler) http.Handler
}

func RegisterRoutes(r chi.Router, deps *Dependencies) {
	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	r.Route("/v1", func(r chi.Router) {
		r.Post("/register", deps.Authentication.RegisterUser)
		r.Post("/login", deps.Authentication.LoginUser)

		r.Group(func(r chi.Router) {
			r.Use(deps.JWTMiddleware)

			r.Post("/player-assignment", deps.PlayerAssignment.HandlePlayerAssignment)
		})
	})

	r.Route("/internal", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			r.Use(deps.APIKeyMiddleware)

			r.Get("/configs", deps.Configs.GetConfigs)
			r.Put("/configs", deps.Configs.UpdateConfig)
		})
	})
}
