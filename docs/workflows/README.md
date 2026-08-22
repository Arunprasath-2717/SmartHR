# Business Workflows Documentation

This directory will document core HRMS lifecycles, state machine diagrams, and interaction flows:

## Planned Workflows:

1. **Attendance Lifecycle**:
   - Clock-in/out, automated hours calculation, anomaly flags, manager overrides.

2. **Leave Request & Approval Flow**:
   - Submission, multi-stage approval (Team Lead -> HR Manager), calendar deduction, balance recalculation.

3. **Payroll Visibility Lifecycle**:
   - Payslip generation in standard HR, approval, employee view permission verification.

4. **AI Anomaly Detection Pipeline**:
   - Data payload extraction from Odoo, HTTP transmission to Go service, scoring, alert triggering.
