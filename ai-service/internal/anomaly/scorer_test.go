package anomaly

import (
	"testing"
)

func TestScorer_EvaluateNormalLeave(t *testing.T) {
	scorer := NewScorer()
	req := AnomalyRequest{
		EmployeeID:   501,
		LeaveType:    "paid",
		StartDate:    "2026-09-01",
		EndDate:      "2026-09-05",
		DurationDays: 5,
		Remarks:      "Annual family vacation",
	}

	result := scorer.Evaluate(req)
	if result.IsAnomaly {
		t.Errorf("Expected IsAnomaly to be false, got true")
	}
	if result.RiskLevel != "low" {
		t.Errorf("Expected RiskLevel 'low', got '%s'", result.RiskLevel)
	}
	if result.Score != 0.0 {
		t.Errorf("Expected Score 0.0, got %f", result.Score)
	}
}

func TestScorer_EvaluateDurationAnomaly(t *testing.T) {
	scorer := NewScorer()
	req := AnomalyRequest{
		EmployeeID:   501,
		LeaveType:    "paid",
		StartDate:    "2026-10-01",
		EndDate:      "2026-10-25",
		DurationDays: 25,
		Remarks:      "Trip",
	}

	result := scorer.Evaluate(req)
	if !result.IsAnomaly {
		t.Errorf("Expected IsAnomaly to be true, got false")
	}
	if result.RiskLevel != "medium" {
		t.Errorf("Expected RiskLevel 'medium', got '%s'", result.RiskLevel)
	}
	if len(result.Reasons) == 0 {
		t.Errorf("Expected non-empty reasons for anomaly")
	}
}

func TestScorer_EvaluateHighRiskAnomaly(t *testing.T) {
	scorer := NewScorer()
	req := AnomalyRequest{
		EmployeeID:   501,
		LeaveType:    "unpaid",
		StartDate:    "2026-10-01",
		EndDate:      "2026-10-25",
		DurationDays: 25,
		Remarks:      "",
	}

	result := scorer.Evaluate(req)
	if !result.IsAnomaly {
		t.Errorf("Expected IsAnomaly to be true, got false")
	}
	if result.RiskLevel != "high" {
		t.Errorf("Expected RiskLevel 'high', got '%s'", result.RiskLevel)
	}
	if result.Score < 0.70 {
		t.Errorf("Expected Score >= 0.70, got %f", result.Score)
	}
}

func TestScorer_EvaluateSickLeaveWithoutRemarks(t *testing.T) {
	scorer := NewScorer()
	req := AnomalyRequest{
		EmployeeID:   501,
		LeaveType:    "sick",
		StartDate:    "2026-11-01",
		EndDate:      "2026-11-05",
		DurationDays: 5,
		Remarks:      "",
	}

	result := scorer.Evaluate(req)
	if result.RiskLevel != "medium" {
		t.Errorf("Expected RiskLevel 'medium', got '%s'", result.RiskLevel)
	}
}
