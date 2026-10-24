"""
ElevenLabs Accessible Narration Adapter
Provides server-side audio narration for short, human-reviewed findings and executive summaries.
Strict Safety Invariant: Narration is ONLY permitted for findings that have already received an explicit
human engineering decision (APPROVED or WAIVED_WITH_NOTE). Rejects unreviewed findings.
The API key is strictly server-side and never exposed to clients.
Audio is a presentation convenience; the written text and cited dossier remain authoritative.
"""

from __future__ import annotations
import os
import hashlib
from datetime import datetime, timezone
from typing import Optional, Literal
from pydantic import BaseModel, Field

ELEVENLABS_TIMEOUT_SECONDS = 12.0
MAX_NARRATION_CHARS = 2000
AUDIO_DISCLAIMER = "AI-generated narration; not certification or operational safety advice."

class ElevenLabsNarrateRequest(BaseModel):
    finding_id: str
    mission_id: str
    reviewed_text: str = Field(..., max_length=MAX_NARRATION_CHARS)
    voice_id: str = "21m00Tcm4TlvDq8ikWAM"  # Default clean neutral voice
    opt_in: bool = True

class ElevenLabsNarrateResponse(BaseModel):
    status: Literal["SUCCESS", "REJECTED_UNREVIEWED", "DISABLED_FALLBACK", "ERROR"]
    finding_id: str
    mission_id: str
    audio_format: str = "audio/mpeg"
    audio_base64: Optional[str] = None
    audio_url: Optional[str] = None
    character_count: int
    transcript: str
    disclaimer: str = AUDIO_DISCLAIMER
    generated_at: str
    message: Optional[str] = None

def is_elevenlabs_enabled() -> bool:
    """Return True only if explicitly enabled and API key is present."""
    flag = os.getenv("ELEVENLABS_ENABLED", "0").lower() in ("1", "true", "yes")
    has_key = bool(os.getenv("XI_API_KEY", "").strip() or os.getenv("ELEVENLABS_API_KEY", "").strip())
    return flag and has_key

def narrate_reviewed_finding(
    request: ElevenLabsNarrateRequest,
    is_finding_reviewed: bool,
    review_status: Optional[str] = None
) -> ElevenLabsNarrateResponse:
    """
    Generate audio narration for a reviewed finding.
    Strictly gates on human review decision: unreviewed findings return REJECTED_UNREVIEWED.
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    # User Consent Gate: Explicit opt-in required
    if not request.opt_in:
        return ElevenLabsNarrateResponse(
            status="ERROR",
            finding_id=request.finding_id,
            mission_id=request.mission_id,
            character_count=len(request.reviewed_text),
            transcript=request.reviewed_text,
            generated_at=now_iso,
            message="Narration rejected: Explicit user opt-in is required before generating audio."
        )

    # Security & Integrity Gate: Finding must be human reviewed
    if not is_finding_reviewed or review_status not in ("APPROVED", "WAIVED_WITH_NOTE", "ACCEPTED"):
        return ElevenLabsNarrateResponse(
            status="REJECTED_UNREVIEWED",
            finding_id=request.finding_id,
            mission_id=request.mission_id,
            character_count=len(request.reviewed_text),
            transcript=request.reviewed_text,
            generated_at=now_iso,
            message="Narration rejected: Finding has not been confirmed/reviewed by a human engineer."
        )

    clean_text = request.reviewed_text.strip()
    if len(clean_text) > MAX_NARRATION_CHARS:
        clean_text = clean_text[:MAX_NARRATION_CHARS]

    if not is_elevenlabs_enabled():
        # Deterministic mock narration metadata for testing without credit consumption
        mock_hash = hashlib.sha256(clean_text.encode("utf-8")).hexdigest()[:12]
        return ElevenLabsNarrateResponse(
            status="DISABLED_FALLBACK",
            finding_id=request.finding_id,
            mission_id=request.mission_id,
            audio_format="audio/mpeg",
            audio_url=f"/mock_audio/{request.mission_id}_{request.finding_id}_{mock_hash}.mp3",
            character_count=len(clean_text),
            transcript=clean_text,
            generated_at=now_iso,
            message="ElevenLabs disabled/unconfigured; returned mock narration metadata without incurring provider credits."
        )

    # When remote ElevenLabs is enabled
    import urllib.request
    import json
    import base64

    xi_key = os.getenv("XI_API_KEY") or os.getenv("ELEVENLABS_API_KEY", "")
    tts_url = f"https://api.elevenlabs.io/v1/text-to-speech/{request.voice_id}"

    payload = {
        "text": clean_text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8
        }
    }

    req = urllib.request.Request(
        tts_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "xi-api-key": xi_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=ELEVENLABS_TIMEOUT_SECONDS) as resp:
            audio_bytes = resp.read()
            b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
            return ElevenLabsNarrateResponse(
                status="SUCCESS",
                finding_id=request.finding_id,
                mission_id=request.mission_id,
                audio_format="audio/mpeg",
                audio_base64=b64_audio,
                character_count=len(clean_text),
                transcript=clean_text,
                generated_at=now_iso,
                message="Successfully generated audio narration via ElevenLabs."
            )
    except Exception as exc:
        return ElevenLabsNarrateResponse(
            status="ERROR",
            finding_id=request.finding_id,
            mission_id=request.mission_id,
            character_count=len(clean_text),
            transcript=clean_text,
            generated_at=now_iso,
            message=f"ElevenLabs TTS call failed ({type(exc).__name__}: {exc})."
        )
