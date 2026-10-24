"""Shared timestamp and append-only report-file helpers.

Timestamps use the host system clock, expressed in UTC and Asia/Kolkata (IST).
The explicit offsets avoid ambiguity; accuracy depends on host clock synchronization.
"""
from __future__ import annotations
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

LOCAL_ZONE = ZoneInfo("Asia/Kolkata")
LOCAL_ZONE_NAME = "Asia/Kolkata"


def now_pair() -> dict[str, str]:
    utc = datetime.now(timezone.utc)
    local = utc.astimezone(LOCAL_ZONE)
    return {
        "utc": utc.isoformat(timespec="microseconds").replace("+00:00", "Z"),
        "local": local.isoformat(timespec="microseconds"),
        "timezone": LOCAL_ZONE_NAME,
        "timestamp_source": "host system clock",
    }


def filename_stamp(local_iso: str) -> str:
    local = datetime.fromisoformat(local_iso)
    return local.strftime("%Y%m%dT%H%M%S.%f%z")


def write_unique(path: Path, content: str) -> Path:
    """Create a report without replacing any previous report."""
    path.parent.mkdir(parents=True, exist_ok=True)
    candidate = path
    counter = 1
    while True:
        try:
            with candidate.open("x", encoding="utf-8", newline="\n") as handle:
                handle.write(content)
            return candidate
        except FileExistsError:
            candidate = path.with_name(f"{path.stem}_{counter:02d}{path.suffix}")
            counter += 1
