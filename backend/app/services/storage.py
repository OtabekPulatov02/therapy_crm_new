from pathlib import Path
from typing import BinaryIO

from app.core.config import get_settings

settings = get_settings()
STORAGE_ROOT = Path(settings.analytics_bucket_prefix)


def save_file(file_obj: BinaryIO, destination: str) -> str:
    STORAGE_ROOT.mkdir(parents=True, exist_ok=True)
    target = STORAGE_ROOT / destination
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("wb") as f:
        f.write(file_obj.read())
    return str(target)

