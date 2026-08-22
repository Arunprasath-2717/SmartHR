package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"dayflow/ai-service/internal/anomaly"
)

// HealthResponse defines the JSON structure for GET /health.
type HealthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
}

// ErrorResponse defines the standard error envelope.
type ErrorResponse struct {
	Error struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

// Handler coordinates HTTP requests for the AI service.
type Handler struct {
	scorer *anomaly.Scorer
}

// NewHandler initializes a new Handler.
func NewHandler(scorer *anomaly.Scorer) *Handler {
	return &Handler{
		scorer: scorer,
	}
}

// Health handles GET /health.
func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Method Not Allowed"})
		return
	}

	response := HealthResponse{
		Status:  "healthy",
		Service: "dayflow-ai-service",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

// ScoreAnomaly handles POST /anomaly/score.
func (h *Handler) ScoreAnomaly(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Method Not Allowed"})
		return
	}

	var req anomaly.AnomalyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		var errResp ErrorResponse
		errResp.Error.Code = "bad_request"
		errResp.Error.Message = "Invalid JSON payload"
		_ = json.NewEncoder(w).Encode(errResp)
		return
	}

	if req.EmployeeID <= 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		var errResp ErrorResponse
		errResp.Error.Code = "validation_error"
		errResp.Error.Message = "employee_id is required"
		_ = json.NewEncoder(w).Encode(errResp)
		return
	}

	if req.LeaveType == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		var errResp ErrorResponse
		errResp.Error.Code = "validation_error"
		errResp.Error.Message = "leave_type is required"
		_ = json.NewEncoder(w).Encode(errResp)
		return
	}

	result := h.scorer.Evaluate(req)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(result); err != nil {
		log.Printf("Error encoding anomaly score response: %v", err)
	}
}
