package anomaly

import (
	"strings"
)

// AnomalyRequest defines the input payload for scoring a leave request.
type AnomalyRequest struct {
	LeaveID      int    `json:"leave_id,omitempty"`
	EmployeeID   int    `json:"employee_id"`
	LeaveType    string `json:"leave_type"`
	StartDate    string `json:"start_date"`
	EndDate      string `json:"end_date"`
	DurationDays int    `json:"duration_days"`
	Remarks      string `json:"remarks,omitempty"`
}

// AnomalyResult represents the evaluation output from the anomaly engine.
type AnomalyResult struct {
	IsAnomaly bool     `json:"is_anomaly"`
	Score     float64  `json:"score"`
	RiskLevel string   `json:"risk_level"`
	Reasons   []string `json:"reasons"`
	Engine    string   `json:"engine"`
}

// Scorer evaluates leave request data for anomalous patterns using explainable heuristics.
type Scorer struct{}

// NewScorer initializes a new anomaly Scorer.
func NewScorer() *Scorer {
	return &Scorer{}
}

// Evaluate performs rule-based anomaly scoring on the leave request.
func (s *Scorer) Evaluate(req AnomalyRequest) AnomalyResult {
	var reasons []string
	var score float64
	riskLevel := "low"

	leaveType := strings.ToLower(strings.TrimSpace(req.LeaveType))
	remarks := strings.TrimSpace(req.Remarks)
	duration := req.DurationDays

	// Rule 1: Extended Duration Anomaly
	if duration > 14 {
		reasons = append(reasons, "Leave duration exceeds 14 continuous days")
		score += 0.50
	} else if duration > 7 {
		score += 0.20
	}

	// Rule 2: Unexplained Sick Leave
	if leaveType == "sick" && duration >= 3 && remarks == "" {
		reasons = append(reasons, "Sick leave of 3 or more days submitted without remarks or documentation notes")
		score += 0.35
	}

	// Rule 3: Extended Unpaid Leave
	if leaveType == "unpaid" && duration > 10 {
		reasons = append(reasons, "Unpaid leave exceeds 10 continuous days")
		score += 0.40
	}

	// Cap score between 0.0 and 1.0
	if score > 1.0 {
		score = 1.0
	}

	// Determine Risk Level and Anomaly Flag
	if score >= 0.70 {
		riskLevel = "high"
	} else if score >= 0.35 {
		riskLevel = "medium"
	} else {
		riskLevel = "low"
	}

	isAnomaly := score >= 0.50

	if len(reasons) == 0 {
		reasons = append(reasons, "Leave request matches standard operational thresholds")
	}

	return AnomalyResult{
		IsAnomaly: isAnomaly,
		Score:     score,
		RiskLevel: riskLevel,
		Reasons:   reasons,
		Engine:    "rule-based-v1",
	}
}
