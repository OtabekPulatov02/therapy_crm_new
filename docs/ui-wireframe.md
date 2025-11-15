# UI Blueprint

## Global Layout
- **Top bar**: logo, search, language switch (RU/UZ/EN), user menu, quick actions.
- **Primary nav tabs**: `Данные | Анализ | Графики | Отчёты`.
- **Context filters**: sticky bar with date, diagnosis, project, patient group.

## Dashboard
- KPI cards (projects, patients, biomarkers, analyses).
- Upload CTA with file types.
- Recent analyses timeline.
- Saved charts carousel.
- Quick links to latest reports.

## Data Module
1. **Upload Wizard**
   - Step 1: Source selection (file / DB / API).
   - Step 2: Schema detection preview, column role assignment.
   - Step 3: Data quality summary (missing values, duplicates).
   - Step 4: Confirmation + version notes.
2. **Dataset View**
   - Interactive table (ag-Grid) with search, column filtering.
   - Sidebar for metadata (owner, source, versions).
   - Transform builder (fillna, normalize, encode).
   - Version timeline with diff viewer.

## Analytics Module
- **Panels**:
  - Descriptive stats card with auto-generated summary.
  - Hypothesis Testing (t-test, ANOVA) forms.
  - Regression workspace (logistic).
  - Survival analysis block (Kaplan-Meier inputs, stratification options).
  - ML Studio with template chooser + script runner upload.
- **Console**: job queue status with progress bars, logs, retry buttons.

## Charts Module
- Gallery of saved charts (thumbnails, metadata).
- Chart builder:
  - Dataset selector + filter panel.
  - Chart type picker (KM, ROC, line, bar, boxplot, scatter).
  - Series configuration (group overlays, log axes, annotations).
  - Export toolbar (SVG/PNG/PDF).
  - Sharing toggles (project/team).

## Reports Module
- Template gallery (conference, clinical, publication).
- Editor canvas with drag-drop sections (title, summary, charts, tables, AI insights).
- Collaboration sidebar (comments, tasks, version history, presence).
- Export queue showing file format, status, download links.

## Accessibility & Theme
- Minimalist, white background, blue/green accent palette.
- WCAG AA contrast, large tap targets, keyboard navigation.
- Responsive layouts for 1280px+ monitors and laptops.

