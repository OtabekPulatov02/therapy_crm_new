# Therapy CRM Platform Architecture

## System Overview
- **Purpose**: Unified CRM for therapy.uz that centralizes research datasets, supports clinical analytics/ML, and powers conference-ready reporting.
- **Users**: Clinicians, biostatisticians, ML engineers, conference managers, administrators.
- **Key Domains**: Data ingestion, curation, analytics & ML, visualization, reporting, collaboration, integrations, governance.

## High-Level Architecture
```
┌───────────────┐     ┌───────────────┐      ┌───────────────────┐
│ React Frontend│<--->│ FastAPI Backend│<---> │ PostgreSQL / MinIO │
└───────────────┘  WS │  + Celery      │ REST │ Redis / Elastic    │
        ▲              └──────┬─────────┘      └────────┬──────────┘
        │ GraphQL(Optional)   │                        ETL Pipelines
        │                     ▼
        │              ML Runtime Cluster
        ▼
External Integrations (ORCID, CrossRef, Zoom/Webex, Medical DBs)
```

### Frontend (React + Plotly)
- Next.js or Vite-based React app.
- Styling via Chakra UI or Tailwind, custom theme (white base, blue/green accents).
- State: React Query (+ Zustand for filters), i18next for RU/UZ/EN.
- Modules:
  - `Dashboard`: KPIs (projects, patients, biomarkers), quick actions, filters.
  - `Data Room`: upload wizard, schema editor, version history.
  - `Analytics`: Stats & ML workspace, job console.
  - `Charts`: Builder with Plotly templates (Kaplan-Meier, ROC, line, bar, boxplot, scatter, log axes).
  - `Reports`: Template selector, WYSIWYG, export manager.

### Backend (FastAPI Ecosystem)
- FastAPI for REST & WebSocket; Pydantic v2 for validation.
- Celery + Redis for async/long analyses.
- Python ML stack (pandas, numpy, sciPy, statsmodels, lifelines, scikit-learn, TensorFlow).
- Task orchestration (Airflow optional) for scheduled ETL/backups.
- Observability: Prometheus metrics, OpenTelemetry traces, ELK logging, Sentry alerts.
- Security: OAuth2 + SSO, JWT access tokens, row-level security, rate limiting, GDPR tooling.

### Data & Storage
- PostgreSQL (primary transactional DB) with logical replication for analytics.
- MinIO/S3 for raw files, model artifacts, Plotly exports.
- Redis: cache, session store, Celery broker.
- Optional Spark/Snowflake connectors for Big Data workloads.
- Backups to cold storage; audit logs streamed to Elasticsearch.

### Integrations
- **ORCID/CrossRef**: sync researcher profiles & citations.
- **Zoom/Webex**: schedule meetings/webinars for project updates.
- **Medical DBs**: secure REST/ODBC connectors, data virtualization layer.
- **Internal Python scripts**: sandboxed execution via Kubernetes Jobs.

## Data Flow
1. **Ingestion**: User uploads CSV/XLS(X)/SQL dump/API endpoint. Backend stores raw file in MinIO, preprocesses via pandas/Great Expectations, persists parquet + schema metadata.
2. **Processing**: Data quality pipeline normalizes types, fills gaps, logs transformations. Versioning stored in `dataset_versions`.
3. **Analytics Jobs**: Frontend submits job → FastAPI enqueues Celery task → Worker executes analysis/ML → Results saved (metrics JSON + Plotly spec + exports) → WebSocket notifies client.
4. **Visualization**: Frontend fetches saved chart configs or builds ad-hoc graphs using Plotly. Exports triggered server-side for accuracy.
5. **Reporting**: Report builder merges text, charts, stats; exports via WeasyPrint (PDF), python-docx (Word), LaTeX pipeline, python-pptx (slides).
6. **Collaboration & Audit**: Comments, sharing permissions, ORCID linking recorded; audit logs tracked per entity/action.

## Security & Compliance
- TLS/SSL enforced (Azure Key Vault certs).
- Role-based access (PI, Analyst, Researcher, Viewer, Admin) + dataset/project level ACLs.
- Audit logging with tamper-proof storage.
- GDPR: data subject tagging, erasure requests, access reports.
- Backups + disaster recovery (daily snapshots, cross-region replication).

## Deployment Topology
- CI/CD (GitHub Actions) builds Docker images (frontend, backend, workers).
- Kubernetes (AKS/EKS/Hetzner) with Helm: ingress (NGINX), cert-manager, HPA.
- Secrets via HashiCorp Vault; config via ConfigMaps.
- Scheduled jobs for backups, data sync, report generation.

## Interface Navigation
- **Top nav**: Data | Analysis | Charts | Reports + global filters (date, diagnosis, project, patient group).
- **Dashboard cards**: Projects count, Active patients, Biomarkers tracked, Running analyses.
- **Upload CTA**: Drag-drop, DB connection modal, API import form.
- **Data table**: ag-Grid style, column typing, missing value inspector, version diff.
- **Analytics tabs**: Descriptive, Hypothesis (t-test, ANOVA), Regression (logistic), Survival (Kaplan-Meier), ML (train/predict, script runner).
- **Charts**: Saved chart gallery, overlay controls, export buttons (PNG/SVG/PDF).
- **Reports**: Template chooser (conference, publication, clinical report), collaborative editor, review workflow.

## Next Steps
1. Define detailed DB schema & ERD.
2. Flesh out API contracts (OpenAPI spec).
3. Scaffold backend/ frontend repos with base modules.
4. Implement ingestion pipeline + analysis jobs.
5. Hook up visualizations, reporting, integrations.

