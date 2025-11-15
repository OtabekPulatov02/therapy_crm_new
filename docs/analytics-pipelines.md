# Analytics & ML Pipelines

## Ingestion & Preparation
1. **Upload Handler**
   - Accepts file/API/db inputs.
   - Stores raw file in MinIO (`raw/{dataset_id}/{version}`).
   - Generates checksum, metadata record.
2. **Validation Stage (Great Expectations)**
   - Auto-schema inference.
   - Detect missing values, dtype mismatch, duplicates.
   - Validation results stored in `dataset_versions.validation_report`.
3. **Transformation Stage**
   - Config-driven pipeline (JSON):
     ```
     [
       {"op":"rename","column":"Patient ID","to":"patient_id"},
       {"op":"fillna","column":"age","method":"median"},
       {"op":"normalize","columns":["biomarker_a"],"method":"zscore"}
     ]
     ```
   - Executed in pandas (or Spark for large sets).
   - Generates parquet + metadata (column stats, dtype, role).
4. **Versioning**
   - New `dataset_versions` record per run.
   - Diff computed vs previous version.
5. **Indexing**
   - Column stats cached.
   - Sample data stored in Postgres for quick previews.

## Analytics Jobs
### Descriptive Statistics
- Tools: pandas profiling, SciPy.
- Output: summary tables (mean, std, quartiles), hist bins per column.
- Visualization: inline boxplots/hist via Plotly.

### Hypothesis Testing
- **t-test**: `scipy.stats.ttest_ind/rel_perms`.
- **ANOVA**: `scipy.stats.f_oneway`.
- Automated assumption checks (normality, variance).
- Deliverables: p-values, effect size, interpretation hints.

### Regression
- Logistic regression via `statsmodels.api.Logit`.
- Provides coefficients, confidence intervals, odds ratios, ROC metrics.
- Supports regularization (L1/L2).

### Survival Analysis
- lifelines `KaplanMeierFitter`, `CoxPHFitter`.
- Supports multiple groups, censoring, log-rank test.
- Output: survival table, median survival, hazard ratios.
- Plotly traces for each group (step functions, confidence bands).

### ROC Analysis
- scikit-learn `roc_curve`, `auc`.
- Multi-model overlay; threshold slider metadata for UI.
- Metrics: AUC, specificity, sensitivity at custom thresholds.

### ML Training
- Supported algorithms: RandomForest, XGBoost, SVM, Logistic regression, TensorFlow Sequential models.
- Steps:
  1. Dataset split (train/val/test).
  2. Feature engineering (scalers, one-hot, imputation).
  3. Training with tracked hyperparameters.
  4. Metric logging (AUC, accuracy, precision/recall, F1).
  5. Artifact packaging (model.pkl/h5 + inference schema) stored in MinIO.
- Optional AutoML template to test multiple models.

### ML Prediction
- Loads selected model artifact.
- Runs inference on dataset/filter subset.
- Outputs predictions table + summary metrics.

## Job Execution Pattern
1. FastAPI endpoint validates request and writes `analysis_jobs`.
2. Celery task pulled by worker pod with GPU/CPU flavors based on job_type.
3. Task loads dataset (parquet from MinIO) into pandas/Spark.
4. Executes computation.
5. Saves results:
   - `result_uri` (JSON metrics, table CSV, Plotly spec).
   - Optional static images via Kaleido (Plotly export).
6. Updates job record status.
7. Emits WebSocket notification.

## Export Pipelines
- **Charts**: Plotly -> Kaleido for PNG/SVG/PDF; CLI wrapper for reproducibility.
- **Reports**:
  - Render context assembled (text + chart URIs + stats).
  - PDF: WeasyPrint (HTML/CSS templates).
  - Word: python-docx templating.
  - LaTeX: compile in container, returns PDF/tex bundle.
  - PPT: python-pptx with placeholders for charts & tables.

## Scheduling & Automation
- Airflow DAGs for:
  - Nightly data sync from medical DBs.
  - Weekly backup verification.
  - Report auto-generation for board meetings.
  - Expired access purge.

## Monitoring & Governance
- Metrics captured per job (duration, RAM, dataset rows).
- Alerting on job failures > threshold.
- Audit log entries for every job submission/completion.
- Data lineage view: dataset version → analysis jobs → charts/reports.

