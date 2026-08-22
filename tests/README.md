# Dayflow Cross-Service Testing

This directory contains integration and end-to-end testing suites for Dayflow:

## Test Suites

1. **`integration/`**:
   - Cross-service API contracts and communication tests between Odoo backend and the Go AI service.
   - Database persistence and transaction rollback testing.

2. **`e2e/`**:
   - End-to-end workflow validation simulating complete user scenarios (e.g. employee check-in -> anomaly evaluation -> manager notification).

> [!NOTE]
> Unit tests specific to the Odoo module reside in `backend/addons/dayflow_core/tests/`.
> Test suites will be populated alongside feature development starting in Phase 2.
