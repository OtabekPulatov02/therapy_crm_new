# Data Model Specification

## Core Entities

### users
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| email | varchar(255) | unique, login |
| password_hash | text | Argon2 |
| first_name / last_name | varchar(120) | |
| locale | varchar(5) | `ru`, `uz`, `en` |
| role_id | fk roles.id | RBAC |
| orcid_id | varchar(50) | optional |
| time_zone | varchar(64) | |
| created_at / updated_at | timestamptz | |
| last_login_at | timestamptz | |

### roles / permissions
- `roles`: id, name, description.
- `role_permissions`: role_id, permission_code (`projects.view`, `datasets.manage`, etc.).

### projects
| Field | Type | Notes |
| id | UUID | PK |
| title | varchar(255) | |
| description | text | |
| diagnosis | varchar(255) | searchable |
| owner_id | fk users.id | PI |
| status | enum(`planning`,`active`,`archived`) | |
| tags | jsonb | |
| created_at / updated_at | timestamptz | |

### project_members
| project_id | fk projects.id |
| user_id | fk users.id |
| role | enum(`owner`,`analyst`,`viewer`,`guest`) |

### datasets
| id | UUID | PK |
| project_id | fk projects.id |
| name | varchar(255) |
| description | text |
| source_type | enum(`csv`,`xlsx`,`sql`,`api`,`db`) |
| storage_uri | text | MinIO path |
| schema_meta | jsonb | inferred schema |
| active_version_id | fk dataset_versions.id |
| created_by | fk users.id |
| created_at / updated_at | timestamptz |

### dataset_versions
| id | UUID | PK |
| dataset_id | fk datasets.id |
| version_number | int |
| rows | bigint |
| cols | int |
| checksum | text |
| transformations | jsonb |
| validation_report | jsonb |
| parquet_uri | text |
| created_by | fk users.id |
| created_at | timestamptz |

### data_columns
| id | UUID |
| dataset_version_id | fk dataset_versions.id |
| name | varchar(255) |
| data_type | enum(`string`,`int`,`float`,`date`,`bool`,`category`) |
| role | enum(`id`,`feature`,`label`,`time`,`event`) |
| stats_summary | jsonb | min/max/mean etc. |

### analysis_jobs
| id | UUID |
| project_id | fk |
| dataset_version_id | fk |
| job_type | enum(`descriptive`,`ttest`,`anova`,`logistic`,`kaplan_meier`,`roc`,`ml_train`,`ml_predict`) |
| parameters | jsonb |
| status | enum(`queued`,`running`,`completed`,`failed`,`cancelled`) |
| started_at / finished_at | timestamptz |
| result_uri | text |
| metrics | jsonb |
| created_by | fk users.id |

### charts
| id | UUID |
| project_id | fk |
| dataset_version_id | fk |
| chart_type | enum(`kaplan_meier`,`roc`,`line`,`bar`,`boxplot`,`scatter`) |
| config | jsonb | Plotly spec |
| filters | jsonb |
| thumbnail_uri | text |
| created_by | fk users.id |
| updated_at | timestamptz |

### reports
| id | UUID |
| project_id | fk |
| template_id | fk report_templates.id |
| title | varchar(255) |
| sections | jsonb |
| export_formats | jsonb |
| generated_uri | text |
| status | enum(`draft`,`rendering`,`ready`) |
| created_by | fk users.id |
| updated_at | timestamptz |

### ml_models
| id | UUID |
| project_id | fk |
| name | varchar(255) |
| algorithm | varchar(120) |
| framework | enum(`sklearn`,`tensorflow`,`xgboost`,`custom`) |
| artifact_uri | text |
| metrics | jsonb |
| training_params | jsonb |
| stage | enum(`dev`,`staging`,`production`) |
| created_by | fk users.id |
| created_at | timestamptz |

### integrations
| id | UUID |
| type | enum(`orcid`,`crossref`,`zoom`,`webex`,`medical_db`) |
| config | jsonb (tokens, endpoints) |
| created_at | timestamptz |
| updated_at | timestamptz |

### audit_logs
| id | bigserial |
| actor_id | fk users.id |
| entity_type | varchar(120) |
| entity_id | uuid |
| action | varchar(120) |
| payload | jsonb |
| ip_address | inet |
| created_at | timestamptz |

### activity_feed
| id | UUID |
| project_id | fk |
| actor_id | fk users |
| type | enum(`upload`,`analysis_run`,`report_shared`,`comment`,`integration`) |
| message | text |
| metadata | jsonb |
| created_at | timestamptz |

### comments
| id | UUID |
| entity_type | enum(`dataset`,`analysis`,`chart`,`report`) |
| entity_id | uuid |
| author_id | fk users |
| body | text |
| attachments | jsonb |
| created_at | timestamptz |

## Relationships & Constraints
- Cascade delete prevented for datasets/projects; instead use soft-delete flag.
- Row-Level Security policies on `projects`, `datasets`, `analysis_jobs`, `reports` referencing membership.
- Use `jsonb` indexes for filters/tags (GIN).
- Partition `audit_logs` monthly.

## Versioning & Lineage
- `dataset_versions` store transformation history; join with `analysis_jobs` to reproduce outputs.
- `reports` reference chart/analysis IDs to embed latest values.
- `ml_models` link to `analysis_jobs` via `training_job_id`.

## Warehouse / Lake Extension
- Mirror curated datasets into columnar store (DuckDB/Parquet) for analytics services.
- Optional integration with Spark tables via `dataset_external_refs` table.

