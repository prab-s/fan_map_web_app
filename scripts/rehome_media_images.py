#!/usr/bin/env python3
"""
Move legacy flat product and series image files into per-record subfolders.

This keeps the database file_name values unchanged while the on-disk layout
becomes:
  data/product_images/product_<id>/
  data/series_images/series_<id>/
"""
from __future__ import annotations

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.database import SessionLocal
from backend.models import ProductImage, SeriesImage


DATA_DIR = PROJECT_ROOT / "data"
PRODUCT_IMAGES_DIR = DATA_DIR / "product_images"
SERIES_IMAGES_DIR = DATA_DIR / "series_images"


def move_product_images() -> tuple[int, int]:
    moved = 0
    skipped = 0
    with SessionLocal() as db:
        for image in db.query(ProductImage).all():
            source = PRODUCT_IMAGES_DIR / image.file_name
            target_dir = PRODUCT_IMAGES_DIR / f"product_{image.product_id}"
            target = target_dir / image.file_name
            if target.exists():
                skipped += 1
                continue
            if not source.exists():
                skipped += 1
                continue
            target_dir.mkdir(parents=True, exist_ok=True)
            source.rename(target)
            moved += 1
    return moved, skipped


def move_series_images() -> tuple[int, int]:
    moved = 0
    skipped = 0
    with SessionLocal() as db:
        for image in db.query(SeriesImage).all():
            source = SERIES_IMAGES_DIR / image.file_name
            target_dir = SERIES_IMAGES_DIR / f"series_{image.series_id}"
            target = target_dir / image.file_name
            if target.exists():
                skipped += 1
                continue
            if not source.exists():
                skipped += 1
                continue
            target_dir.mkdir(parents=True, exist_ok=True)
            source.rename(target)
            moved += 1
    return moved, skipped


def main() -> int:
    moved_product, skipped_product = move_product_images()
    moved_series, skipped_series = move_series_images()
    print(f"Product images moved: {moved_product}, skipped: {skipped_product}")
    print(f"Series images moved: {moved_series}, skipped: {skipped_series}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
