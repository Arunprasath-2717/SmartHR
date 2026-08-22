package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"dayflow/ai-service/internal/anomaly"
)

func TestHealthHandler(t *testing.T) {
	scorer := anomaly.NewScorer()
	h := NewHandler(scorer)
	req, err := http.NewRequest("GET", "/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	h.Health(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Health returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	var res map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &res); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if res["status"] != "healthy" {
		t.Errorf("Expected status 'healthy', got '%s'", res["status"])
	}
}

func TestScoreAnomalyHandler_Valid(t *testing.T) {
	scorer := anomaly.NewScorer()
	h := NewHandler(scorer)
	payload := map[string]interface{}{
		"employee_id":   501,
		"leave_type":    "paid",
		"start_date":    "2026-09-01",
		"end_date":      "2026-09-05",
		"duration_days": 5,
		"remarks":       "Vacation",
	}
	body, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", "/anomaly/score", bytes.NewBuffer(body))
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	h.ScoreAnomaly(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("ScoreAnomaly returned wrong status code: got %v want %v", status, http.StatusOK)
	}
}

func TestScoreAnomalyHandler_InvalidMethod(t *testing.T) {
	scorer := anomaly.NewScorer()
	h := NewHandler(scorer)
	req, err := http.NewRequest("GET", "/anomaly/score", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	h.ScoreAnomaly(rr, req)

	if status := rr.Code; status != http.StatusMethodNotAllowed {
		t.Errorf("Expected 405 Method Not Allowed, got %v", status)
	}
}
