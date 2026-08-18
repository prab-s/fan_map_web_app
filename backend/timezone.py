from __future__ import annotations

import datetime
import os
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

DEFAULT_TIMEZONE_NAME = (os.getenv("APP_TIMEZONE") or os.getenv("TZ") or "Pacific/Auckland").strip() or "Pacific/Auckland"

try:
    APP_TIMEZONE = ZoneInfo(DEFAULT_TIMEZONE_NAME)
except ZoneInfoNotFoundError:
    APP_TIMEZONE = datetime.UTC


def backend_now() -> datetime.datetime:
    return datetime.datetime.now(APP_TIMEZONE)


def backend_now_iso() -> str:
    return backend_now().isoformat()


def file_mtime_token(file_path: str | Path) -> str | None:
    try:
        stat = Path(file_path).stat()
    except OSError:
        return None

    modified_at = datetime.datetime.fromtimestamp(stat.st_mtime, tz=APP_TIMEZONE)
    return modified_at.strftime("%Y%m%d_%H%M%S")


def generated_file_timestamp() -> str:
    """Return the application-local timestamp used in generated filenames."""
    return backend_now().strftime("%Y%m%d_%H%M%S")


def file_mtime_milliseconds(file_path: str | Path) -> str | None:
    """Return a cache-busting file modification token in epoch milliseconds."""
    try:
        stat = Path(file_path).stat()
    except OSError:
        return None
    return str(stat.st_mtime_ns // 1_000_000)
