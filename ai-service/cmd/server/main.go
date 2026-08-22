package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"dayflow/ai-service/internal/anomaly"
	"dayflow/ai-service/internal/handler"
)

func main() {
	port := strings.TrimSpace(os.Getenv("AI_SERVICE_PORT"))
	if port == "" {
		port = "8080"
	}

	scorer := anomaly.NewScorer()
	h := handler.NewHandler(scorer)

	mux := http.NewServeMux()
	mux.HandleFunc("/health", h.Health)
	mux.HandleFunc("/anomaly/score", h.ScoreAnomaly)

	addr := fmt.Sprintf(":%s", port)
	log.Printf("Starting Dayflow AI Anomaly Service on %s", addr)

	if err := http.ListenAndServe(addr, mux); err != nil && err != http.ErrServerClosed {
		log.Fatalf("HTTP server failed: %v", err)
	}
}
