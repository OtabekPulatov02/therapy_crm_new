import io
import json
from typing import Any

import pandas as pd
import plotly.graph_objects as go
from lifelines import KaplanMeierFitter
from plotly.subplots import make_subplots
from scipy import stats
from sklearn.metrics import auc, roc_curve
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

from app.core.celery_app import celery_app


def load_dataset(dataset_version_id: str) -> pd.DataFrame:
    # TODO: load parquet from MinIO
    return pd.DataFrame()


def persist_plotly_figure(fig: go.Figure, name: str) -> dict[str, Any]:
    buffer = io.BytesIO()
    fig.write_image(buffer, format="png")
    return {"plotly_json": fig.to_plotly_json(), "static_png": f"s3://bucket/{name}.png"}


@celery_app.task(name="analysis.kaplan_meier")
def run_kaplan_meier(payload: dict):
    df = load_dataset(payload["dataset_version_id"])
    time_col = payload["parameters"]["time_column"]
    event_col = payload["parameters"]["event_column"]
    group_col = payload["parameters"].get("group_column")

    fig = go.Figure()
    fitter = KaplanMeierFitter()
    if group_col and group_col in df.columns:
        for group, group_df in df.groupby(group_col):
            fitter.fit(group_df[time_col], event_observed=group_df[event_col], label=str(group))
            fig.add_trace(go.Scatter(x=fitter.survival_function_.index, y=fitter.survival_function_["KM_estimate"], mode="lines", name=str(group)))
    else:
        fitter.fit(df[time_col], event_observed=df[event_col])
        fig.add_trace(go.Scatter(x=fitter.survival_function_.index, y=fitter.survival_function_["KM_estimate"], mode="lines", name="All"))

    assets = persist_plotly_figure(fig, f"km-{payload['dataset_version_id']}")
    return {"status": "completed", "assets": assets}


@celery_app.task(name="analysis.roc")
def run_roc_curve(payload: dict):
    df = load_dataset(payload["dataset_version_id"])
    label_col = payload["parameters"]["label_column"]
    score_col = payload["parameters"]["score_column"]

    fpr, tpr, thresholds = roc_curve(df[label_col], df[score_col])
    roc_auc = auc(fpr, tpr)
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=fpr, y=tpr, mode="lines", name=f"AUC={roc_auc:.3f}"))
    fig.add_trace(go.Scatter(x=[0, 1], y=[0, 1], mode="lines", name="Baseline", line=dict(dash="dash")))
    assets = persist_plotly_figure(fig, f"roc-{payload['dataset_version_id']}")
    return {"status": "completed", "auc": roc_auc, "assets": assets, "thresholds": thresholds.tolist()}


@celery_app.task(name="analysis.ttest")
def run_ttest(payload: dict):
    df = load_dataset(payload["dataset_version_id"])
    group_col = payload["parameters"]["group_column"]
    value_col = payload["parameters"]["value_column"]
    groups = df[group_col].dropna().unique()[:2]
    g1 = df[df[group_col] == groups[0]][value_col]
    g2 = df[df[group_col] == groups[1]][value_col]
    stat, pval = stats.ttest_ind(g1, g2, equal_var=False, nan_policy="omit")
    return {"status": "completed", "statistic": stat, "pvalue": pval}


@celery_app.task(name="analysis.anova")
def run_anova(payload: dict):
    df = load_dataset(payload["dataset_version_id"])
    value_col = payload["parameters"]["value_column"]
    factor_col = payload["parameters"]["factor_column"]
    groups = [group[value_col].dropna() for _, group in df.groupby(factor_col)]
    stat, pval = stats.f_oneway(*groups)
    return {"status": "completed", "statistic": stat, "pvalue": pval}


@celery_app.task(name="analysis.logistic")
def run_logistic_regression(payload: dict):
    df = load_dataset(payload["dataset_version_id"])
    target = payload["parameters"]["target_column"]
    features = payload["parameters"]["feature_columns"]
    model = LogisticRegression(max_iter=1000)
    X = df[features].fillna(0)
    y = df[target]
    model.fit(X, y)
    coeffs = dict(zip(features, model.coef_[0].tolist()))
    return {"status": "completed", "coefficients": coeffs, "intercept": model.intercept_[0]}


@celery_app.task(name="analysis.ml_train")
def run_ml_training(payload: dict):
    df = load_dataset(payload["dataset_version_id"])
    target = payload["parameters"]["target"]
    features = payload["parameters"]["features"]
    algorithm = payload["parameters"].get("algorithm", "random_forest")
    X_train, X_test, y_train, y_test = train_test_split(df[features], df[target], test_size=0.2)
    # Placeholder - actual implementation would branch on algorithm
    model = LogisticRegression(max_iter=1000).fit(X_train, y_train)
    score = model.score(X_test, y_test)
    artifact_uri = f"s3://models/{payload['dataset_version_id']}/{algorithm}.joblib"
    return {"status": "completed", "score": score, "model_artifact": artifact_uri}


@celery_app.task(name="analysis.ml_predict")
def run_ml_prediction(payload: dict):
    # load model artifact + dataset
    predictions = []
    return {"status": "completed", "predictions_uri": "s3://predictions/output.csv"}

