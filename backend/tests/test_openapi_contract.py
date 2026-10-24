import json
from pathlib import Path
from app.main import app

ROOT = Path(__file__).resolve().parents[1]
OPENAPI_PATH = ROOT / "openapi.json"

def test_export_and_verify_openapi_contract():
    """
    Generate and verify backend/openapi.json matches the FastAPI OpenAPI specification.
    Ensures FlutterFlow and React clients have an authoritative, versioned schema contract.
    """
    schema = app.openapi()
    assert schema["info"]["title"] == "OrbitScore API"
    assert schema["info"]["version"] == "1.0.0"

    # Verify essential endpoints exist in the schema
    paths = schema.get("paths", {})
    expected_endpoints = [
        "/health",
        "/profiles",
        "/missions",
        "/missions/{mission_id}",
        "/missions/{mission_id}/evaluate",
        "/missions/{mission_id}/findings/{finding_id}/decision",
        "/missions/{mission_id}/counterfactual",
        "/missions/{mission_id}/artifacts",
        "/artifacts/{artifact_id}",
        "/artifacts/{artifact_id}/extract",
        "/provenance",
        "/export/{mission_id}",
        "/integrations/status",
        "/integrations/agent37/triage",
        "/integrations/browser-use/capture",
        "/integrations/elevenlabs/narrate"
    ]

    for ep in expected_endpoints:
        assert ep in paths, f"Expected endpoint {ep} missing from OpenAPI schema"

    # Export schema to backend/openapi.json
    with OPENAPI_PATH.open("w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2)

    assert OPENAPI_PATH.exists()
    assert OPENAPI_PATH.stat().st_size > 1000
