# Dayflow Frontend Architecture & Organization

## Architecture Overview

Dayflow is built directly on **Odoo Community 17**. User interface components in Dayflow are implemented using **Odoo OWL (Odoo Web Library)**, JavaScript, and SCSS.

### Important Architectural Principles:

1. **No Standalone SPA Frameworks**:
   - We do **NOT** use React, Next.js, Vite, Angular, or Vue.
   - The application does not run as an independent Single-Page Application (SPA).

2. **Logical Organization & Planning**:
   - The `frontend/` directory serves as an organizational and architectural workspace for planning component trees, state boundaries, styling hierarchies, and design systems.

3. **Production Asset Location**:
   - All production OWL components, JavaScript controllers, and SCSS stylesheets must reside within the Odoo module:
     ```
     backend/addons/dayflow_core/static/src/
     ├── components/
     ├── js/
     └── scss/
     ```

## Directory Structure

```
frontend/
├── src/
│   ├── components/          # Planned UI component hierarchy
│   │   ├── common/          # Common reusable UI elements
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── leave/           # Leave management UI elements
│   │   ├── payroll/         # Payroll UI elements
│   │   └── analytics/       # Analytics & anomaly visualization
│   ├── pages/               # Page-level view structures
│   │   ├── employee/        # Employee self-service views
│   │   ├── admin/           # Admin / HR management views
│   │   ├── leave/           # Leave workflow views
│   │   ├── payroll/         # Payroll visibility views
│   │   └── analytics/       # Anomaly & insights views
│   ├── services/            # Client-side API abstraction planning
│   ├── hooks/               # Component lifecycle helper planning
│   ├── store/               # Reactive client state planning
│   ├── utils/               # Formatting, date, and math utilities
│   └── styles/              # SCSS architecture planning
│       └── components/      # Component-level styling tokens
└── tests/                   # Frontend unit/component test planning
```
