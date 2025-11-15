# API Contracts (Draft)

Base URL: `/api/v1`

## Auth
### POST `/auth/login`
- Body: `{ email, password }`
- Response: `{ access_token, refresh_token, user }`

### POST `/auth/refresh`
- Body: `{ refresh_token }`
- Response: new access token.

### POST `/auth/logout`
- Invalidates refresh token.

## Projects
### GET `/projects`
- Query: pagination, filters (status, diagnosis, owner).
- Response: list of projects with KPI counters.

### POST `/projects`
- Body: `{ title, description, diagnosis, tags }`
- Creates project; current user owner.

### GET `/projects/{id}`
- Includes members, dataset counts, activity feed.

### PATCH `/projects/{id}`
- Update metadata, status.

### POST `/projects/{id}/members`
- Invite user (email) + role.

## Datasets
### POST `/datasets/upload`
- Multipart: file + JSON config `{ project_id, description, column_types?, transformations? }`
- Response: dataset + initial version metadata + job id for validation.

### POST `/datasets/db-connect`
- Body: `{ project_id, db_type, host, port, db_name, credentials, query }`
- Runs ingestion job to pull data from MySQL/PostgreSQL.

### POST `/datasets/api-import`
- Body: `{ project_id, api_url, auth, schedule? }`

### GET `/datasets`
- Query by project, text search.

### GET `/datasets/{id}`
- Returns dataset info, versions, schema.

### POST `/datasets/{id}/transform`
- Body: transformation pipeline (fillna, normalize, filter). Returns new version id.

### GET `/datasets/{id}/versions/{version_id}/preview`
- Paginated data sample.

## Analytics
Common request schema:
```
{
  "project_id": "...",
  "dataset_version_id": "...",
  "filters": {...},
  "parameters": {...}
}
```

### POST `/analysis/descriptive`
- Params: columns, group_by.
- Response: summary stats, hist bins.

### POST `/analysis/ttest`
- Params: `group_column`, `value_column`, `paired?`.

### POST `/analysis/anova`
- Params: `value_column`, `factor_columns`.

### POST `/analysis/logistic`
- Params: `target_column`, `feature_columns`.
- Response: coefficients, odds ratios, confusion matrix.

### POST `/analysis/kaplan-meier`
- Params: `time_column`, `event_column`, `group_column?`.
- Response: survival curve data, median survival, log-rank p-value.

### POST `/analysis/roc`
- Params: `score_column`, `label_column`, `group_column?`.
- Response: ROC points, AUC, thresholds.

### POST `/analysis/ml/train`
- Params: `target`, `features`, `algorithm`, hyperparameters.
- Response: job id; results include metrics + model id.

### POST `/analysis/ml/predict`
- Params: `model_id`, `dataset_version_id`.
- Response: predictions URI.

### GET `/analysis/jobs`
- Query: status, project.
- Response: paginated job summaries.

### GET `/analysis/jobs/{id}`
- Detailed status, logs, result links.

## Charts
### POST `/charts`
- Body: `{ project_id, dataset_version_id, chart_type, config, filters }`
- Response: chart id + generated plot asset.

### GET `/charts`
- Query: project, type.

### GET `/charts/{id}`
- Returns config + signed URLs for assets.

### POST `/charts/{id}/export`
- Body: `{ format: png|svg|pdf }`
- Kicks off export job if not cached.

## Reports
### GET `/report-templates`
- Built-in + custom templates.

### POST `/reports`
- Body: `{ project_id, template_id, title, sections }`
- Creates collaborative draft.

### POST `/reports/{id}/generate`
- Body: `{ format: pdf|docx|latex|pptx }`
- Enqueues render job.

### GET `/reports/{id}/download?format=pdf`
- Returns signed download URL.

## Integrations
### POST `/integrations/orcid/sync`
- Body: `{ user_id }`
- Fetch ORCID profile/publications.

### POST `/integrations/crossref/search`
- Body: `{ doi | query }`

### POST `/integrations/zoom/schedule`
- Body: `{ project_id, topic, start_time, duration }`

### POST `/integrations/medical-db/import`
- Body: connector config; schedules data pull.

## Audit & Logs
### GET `/audit`
- Query by entity, actor, action, date range.

### GET `/logs/activity`
- Project feed (uploads, analyses, comments).

## WebSocket Channels
- `/ws/jobs/{user_id}`: real-time job status updates.
- `/ws/collab/{project_id}`: presence, comments, report editing events.

