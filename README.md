# DAYFLOW

> **AI-Assisted Human Resource Management System built on Odoo Community**

---

## Current Status

> [!IMPORTANT]
> **CURRENT STATUS: Phase 1A — Repository Skeleton and Project Foundation**
>
> This repository is currently in its initial skeleton phase. The structural foundations, module boundaries, directory trees, configuration templates, and minimal services have been established.
>
> The following features and systems are **NOT implemented yet** and are scheduled for subsequent phases:
> - HRMS business workflows
> - Employee management & profile logic
> - Attendance tracking & validation workflows
> - Leave management & approval lifecycles
> - Payroll visibility & calculation logic
> - Employee & HR dashboards
> - AI anomaly detection algorithms & machine learning models
> - Security rules, group definitions, and ACLs
> - Production Odoo OWL frontend components & views
> - Docker container runtime environment (Phase 1B)
> - GitHub Actions CI/CD automation pipelines

---

## Project Overview

**Dayflow** is a modern, modular, AI-assisted Human Resource Management System (HRMS) built on top of **Odoo Community 17**. Dayflow combines the robust enterprise transactional capabilities, relational modeling, and extensible ORM of Odoo with an independent, high-performance Go-based microservice designed for analytical anomaly detection.

By leveraging native Odoo OWL (Odoo Web Library) for reactive user interfaces and keeping business rules within the Odoo backend, Dayflow delivers a unified experience for administrators, HR managers, team leaders, and employees without the operational overhead of fragmented single-page application stacks.

---

## Project Vision

Modern organizations require HR platforms that are transactional, secure, auditable, and intelligent. Dayflow's vision is to provide:

1. **Native Modularity**: Built directly upon standard Odoo Community models (`hr`, `hr_attendance`, `hr_holidays`) to preserve full ecosystem compatibility.
2. **AI-Assisted Insights**: Offloading compute-heavy analytics and anomaly scoring to a dedicated Go service, keeping the transactional core fast and responsive.
3. **Role-Centric Experience**: Clean, intuitive interfaces tailored specifically to employee self-service and HR administrative oversight.
4. **Transparent Governance**: Robust role-based access control (RBAC), security groups, and audit-ready data tracking.

---

## Planned Core Features

- **Employee Management**: Comprehensive records, organizational hierarchy, department structuring, and contract tracking.
- **Employee Profiles**: Self-service profile updates, emergency contacts, role assignments, and personal records.
- **Role-Based Access Control (RBAC)**: Fine-grained security groups, record rules, and access control lists (ACLs) distinguishing Employees, Team Leads, and HR Admins.
- **Attendance Management**: Check-in/check-out tracking, geo/IP validation, shift tracking, and automated work duration calculation.
- **Leave Management**: Leave balance allocation, multi-stage approval workflows, holiday calendars, and department-level visibility.
- **Payroll Visibility**: Secure employee pay slip access, compensation breakdown, and salary structuring aligned with standard HR practices.
- **Employee Dashboard**: Self-service portal for quick actions (clocking in/out, leave requests, upcoming holidays, team status).
- **HR Administrative Dashboard**: Real-time overview of workforce presence, pending approvals, department allocations, and compliance alerts.
- **AI-Assisted Anomaly Detection**: Proactive identification of attendance discrepancies, irregular leave patterns, and workforce anomalies powered by the Dayflow AI service.

---

## High-Level System Overview

The target architecture decouples transactional business logic and data governance in Odoo from analytical anomaly computation in the dedicated Go service:

```
                ┌──────────────────────┐
                │      Odoo + OWL      │
                │     Dayflow UI       │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │  Dayflow Odoo Module │
                │      Python          │
                └─────────┬────────────┘
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
    ┌────────────────┐        ┌────────────────┐
    │   PostgreSQL   │        │   AI Service   │
    │                │        │      Go        │
    └────────────────┘        └────────────────┘
```

- **Odoo + OWL Frontend**: Reactive client components rendered natively within the Odoo Web Client using OWL, JavaScript, and SCSS.
- **Dayflow Odoo Module (Python)**: Core business models, controllers, services, security definitions, and ORM workflows.
- **PostgreSQL Database**: Primary relational data store managed strictly via the Odoo ORM.
- **AI Service (Go)**: Standalone HTTP microservice communicating over JSON REST for anomaly evaluation and pattern detection.

---

## Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Core Platform** | Odoo Community 17 | Enterprise base framework and ecosystem |
| **Backend** | Python 3.11+ | Odoo ORM, Controllers, Services, Native Auth, Groups & Record Rules |
| **Database** | PostgreSQL 15+ | Relational persistence managed via Odoo ORM |
| **Frontend** | Odoo OWL, JS, SCSS | Native Odoo Web Library components and styles |
| **AI Service** | Go (1.21+) | Standard library `net/http` microservice for anomaly detection |
| **Infrastructure** | Docker, Docker Compose | Multi-container local orchestration (Phase 1B) |
| **CI/CD** | GitHub Actions | Automated linting, test suites, and build validation |
| **Version Control**| Git / Monorepo | Monorepo layout with clean service boundaries |

---

## Repository Structure

```text
dayflow/
│
├── frontend/                       # Frontend planning, component design, & organizational structure
│   ├── src/
│   │   ├── components/             # Reusable UI component definitions
│   │   │   ├── common/             # Shared UI widgets
│   │   │   ├── dashboard/          # Dashboard widgets
│   │   │   ├── leave/              # Leave-related components
│   │   │   ├── payroll/            # Payroll-related components
│   │   │   └── analytics/          # Analytics visualizations
│   │   ├── pages/                  # Page-level view structures
│   │   │   ├── employee/           # Employee self-service views
│   │   │   ├── admin/              # HR admin views
│   │   │   ├── leave/              # Leave management views
│   │   │   ├── payroll/            # Payroll visibility views
│   │   │   └── analytics/          # Anomaly & analytics views
│   │   ├── services/               # Frontend API service abstractions
│   │   ├── hooks/                  # Component lifecycle helpers
│   │   ├── store/                  # Client-side reactive state definitions
│   │   ├── utils/                  # UI utility functions
│   │   └── styles/                 # Styling architecture
│   │       └── components/         # Component-specific SCSS rules
│   ├── tests/                      # Frontend testing layout
│   └── README.md                   # Frontend architecture documentation
│
├── backend/                        # Odoo 17 backend and custom modules
│   ├── addons/
│   │   └── dayflow_core/           # Primary Dayflow Core custom Odoo module
│   │       ├── __init__.py         # Package root
│   │       ├── __manifest__.py     # Odoo module manifest
│   │       ├── models/             # Business models & ORM extensions
│   │       ├── controllers/        # HTTP routing & API endpoints (e.g. /api/v1/health)
│   │       ├── services/           # Backend service layer & AI client
│   │       ├── security/           # Access rights (ir.model.access.csv) & record rules
│   │       ├── data/               # Data files, sequences, and seed records
│   │       └── tests/              # Odoo unit tests (TransactionCase, HttpCase)
│   └── config/
│       └── odoo.conf               # Development Odoo server configuration
│
├── ai-service/                     # Go AI Anomaly Detection Service
│   ├── cmd/
│   │   └── server/
│   │       └── main.go             # Application entrypoint & HTTP server
│   ├── internal/
│   │   ├── anomaly/                # Anomaly detection logic & algorithms
│   │   ├── handler/                # HTTP request handlers & routing
│   │   ├── service/                # Business logic & computation services
│   │   └── config/                 # Service configuration loader
│   ├── go.mod                      # Go module definition
│   ├── go.sum                      # Go dependency checksums
│   └── Dockerfile                  # Multi-stage container build definition
│
├── database/                       # Database resources and seed records
│   ├── seeds/                      # Fixtures, demo datasets, and development seeds
│   └── README.md                   # Schema management notes (Odoo ORM is source of truth)
│
├── infrastructure/                 # Infrastructure and container definitions
│   ├── docker/
│   │   ├── odoo/                   # Custom Odoo Dockerfile & configurations
│   │   └── postgres/               # PostgreSQL initialization scripts
│   └── scripts/                    # Development, migration, and automation scripts
│
├── tests/                          # Cross-service testing suites
│   ├── integration/                # Service-to-service integration tests
│   └── e2e/                        # End-to-end testing scenarios
│
├── docs/                           # Project technical documentation
│   ├── api/                        # API specifications & contract definitions
│   ├── development/                # Developer setup & contribution guidelines
│   ├── decisions/                  # Architecture Decision Records (ADRs)
│   └── workflows/                  # HRMS process diagrams & lifecycles
│
├── .github/                        # GitHub automation
│   └── workflows/                  # CI/CD workflow definitions
│
├── docker-compose.yml              # Local multi-container orchestration skeleton
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules for Python, Go, Odoo, IDEs, and OS
├── README.md                       # Project root documentation
└── CHANGELOG.md                    # Project version history
```

---

## Directory Overview

- **`frontend/`**: Contains the organizational skeleton for component architecture, design system planning, and frontend state management.
- **`backend/`**: Contains the Odoo custom addon `dayflow_core` along with the development server configuration `backend/config/odoo.conf`.
- **`ai-service/`**: Contains the independent Go service for AI anomaly detection, structured according to standard Go project layout standards (`cmd/`, `internal/`).
- **`database/`**: Dedicated to demo data, seed fixtures, and development data dumps. Odoo ORM remains the sole schema authority.
- **`infrastructure/`**: Houses Docker container recipes, postgres initialization scripts, and operational maintenance scripts.
- **`tests/`**: Contains end-to-end and cross-service integration test suites validating interactions between Odoo, PostgreSQL, and the AI Service.
- **`docs/`**: Central knowledge base covering API contracts, local development guides, architecture decision records (ADRs), and business workflows.
- **`.github/`**: Houses GitHub Actions CI/CD automation workflows.

---

## Local Development Prerequisites

To run Dayflow locally across all components:

- **Python**: Version 3.11 or higher
- **Go**: Version 1.21 or higher
- **PostgreSQL**: Version 15 or higher
- **Odoo Community**: Version 17.0
- **Docker & Docker Compose**: (Recommended for containerized development in Phase 1B)
- **Git**: Version 2.30 or higher

---

## Initial Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url> dayflow
cd dayflow
```

### 2. Configure Environment Variables
Copy the template environment file and inspect default settings:
```bash
cp .env.example .env
```

### 3. Run the Go AI Service Locally
From the project root:
```bash
cd ai-service
go run ./cmd/server/main.go
```
The service will start on port `8080` (or the port specified by `AI_SERVICE_PORT`).

Verify service health:
```bash
curl http://localhost:8080/health
```
Expected output:
```json
{
  "status": "healthy",
  "service": "dayflow-ai-service"
}
```

### 4. Inspect Odoo Configuration
The development configuration file is located at `backend/config/odoo.conf`. Ensure the database credentials match your local PostgreSQL configuration.

---

## Planned Development Roadmap

| Phase | Milestone | Scope |
| :---: | :--- | :--- |
| **1A** | **Repository Skeleton & Foundations** *(Current)* | Directory layout, Odoo module skeleton, Go service skeleton, docs |
| **1B** | **Development & Container Environment** | Docker Compose orchestration, PostgreSQL config, dev tools |
| **2**  | **Core HR & RBAC** | Custom employee fields, departments, security groups, ACLs |
| **3**  | **Attendance & Leave Management** | Check-in/out logic, leave requests, validation, approval workflows |
| **4**  | **Payroll Visibility** | Salary slip visibility, compensation breakdown, employee access |
| **5**  | **Dashboards & OWL UI** | Employee self-service & HR management dashboards in Odoo OWL |
| **6**  | **AI Anomaly Detection Service** | Statistical & anomaly scoring engine in Go, Odoo HTTP integration |
| **7**  | **Integration, Testing & CI/CD** | Full integration test coverage, GitHub Actions pipelines, security audit |

---

## Engineering Principles

1. **KISS & Pragmatism**: Keep architectural complexity minimal. Avoid unnecessary third-party services, unneeded message brokers, or heavy frameworks.
2. **Odoo Native Conventions**: Follow standard Odoo module naming, model inheritance, XML view structuring, and security patterns.
3. **Defensive Security & RBAC**: Enforce access control at the data layer using Odoo record rules and security groups; never rely solely on UI-level hiding.
4. **Stateless AI Computation**: The Go AI service operates statelessly, processing input data payloads provided by Odoo and returning anomaly metrics over HTTP.
5. **Clean Monorepo Boundaries**: Maintain strict separation between backend modules, AI microservice logic, and documentation.

---

## Contribution Workflow

1. Create a feature branch from `main` (`feature/dayflow-<ticket-number>-<short-description>`).
2. Adhere to code conventions (PEP 8 for Python, standard formatting for Go, Odoo OWL guidelines for JS/SCSS).
3. Ensure no secrets, sensitive configuration, or temporary build files are committed.
4. Open a pull request with a descriptive summary referencing the target phase and milestone.

---

## License

This project is licensed under the terms of the [LGPL-3.0 License](https://www.gnu.org/licenses/lgpl-3.0.html) to align with Odoo Community edition standards.
