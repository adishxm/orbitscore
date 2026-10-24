"""
Inference Package for OrbitScore.
Contains trusted artifact registry and research forecast execution.
"""

from ai_ml.inference.registry import (
    ModelArtifactMetadata,
    register_trusted_artifact,
    get_registered_artifact,
)
from ai_ml.inference.cdm_forecast import (
    CDMMakeForecastResult,
    run_cdm_forecast,
)

__all__ = [
    "ModelArtifactMetadata",
    "register_trusted_artifact",
    "get_registered_artifact",
    "CDMMakeForecastResult",
    "run_cdm_forecast",
]
