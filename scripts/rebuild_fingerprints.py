#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))


def _hash_bytes(*chunks: bytes) -> str:
    digest = hashlib.sha256()
    for chunk in chunks:
        digest.update(chunk)
    return digest.hexdigest()


def _hash_text(text: str) -> bytes:
    return text.encode("utf-8")


def _sql_quote(identifier: str) -> str:
    return '"' + identifier.replace('"', '""') + '"'


def _iter_files(
    paths: list[Path],
    *,
    include_names: set[str] | None = None,
    exclude_names: set[str] | None = None,
    include_suffixes: set[str] | None = None,
):
    for path in paths:
        resolved = path.resolve()
        if resolved.is_file():
            if include_names is not None and resolved.name not in include_names:
                continue
            if exclude_names is not None and resolved.name in exclude_names:
                continue
            if include_suffixes is not None and resolved.suffix not in include_suffixes:
                continue
            yield resolved
            continue

        if not resolved.is_dir():
            continue

        for child in sorted((candidate for candidate in resolved.rglob("*") if candidate.is_file()), key=lambda candidate: candidate.as_posix()):
            if include_names is not None and child.name not in include_names:
                continue
            if exclude_names is not None and child.name in exclude_names:
                continue
            if include_suffixes is not None and child.suffix not in include_suffixes:
                continue
            yield child.resolve()


def hash_file_tree(
    relative_paths: list[str],
    *,
    include_names: set[str] | None = None,
    exclude_names: set[str] | None = None,
    include_suffixes: set[str] | None = None,
) -> str:
    digest = hashlib.sha256()
    roots = [PROJECT_ROOT / relative_path for relative_path in relative_paths]
    for file_path in _iter_files(
        roots,
        include_names=include_names,
        exclude_names=exclude_names,
        include_suffixes=include_suffixes,
    ):
        digest.update(file_path.relative_to(PROJECT_ROOT).as_posix().encode("utf-8"))
        digest.update(b"\0")
        digest.update(file_path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def hash_database_state() -> str:
    try:
        from sqlalchemy import inspect, text
        from backend import models
        from backend.database import engine
    except ModuleNotFoundError as exc:
        missing = exc.name or "an import required for database fingerprinting"
        raise SystemExit(
            f"Cannot compute the generated-assets fingerprint because {missing} is not installed. "
            "Install backend dependencies with `python3 -m pip install -r backend/requirements.txt`."
        ) from exc

    model_classes = [
        models.AppSettings,
        models.ProductType,
        models.ProductTypeParameterGroupPreset,
        models.ProductTypeParameterPreset,
        models.ProductTypeRpmLinePreset,
        models.ProductTypeRpmPointPreset,
        models.ProductTypeEfficiencyPointPreset,
        models.Series,
        models.Product,
        models.ProductParameterGroup,
        models.ProductParameter,
        models.RpmLine,
        models.RpmPoint,
        models.EfficiencyPoint,
        models.ProductImage,
        models.SeriesImage,
    ]

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    payload: dict[str, list[dict[str, object]]] = {}
    with engine.connect() as connection:
        for model_class in model_classes:
            mapper = inspect(model_class)
            table_name = mapper.local_table.name
            if table_name not in existing_tables:
                payload[table_name] = []
                continue

            existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
            columns = [column.name for column in mapper.columns if column.name in existing_columns]
            if not columns:
                payload[table_name] = []
                continue

            primary_key_columns = [column.name for column in mapper.primary_key if column.name in existing_columns]
            order_clause = f" ORDER BY {', '.join(_sql_quote(column) for column in primary_key_columns)}" if primary_key_columns else ""
            select_clause = ", ".join(_sql_quote(column) for column in columns)
            rows = connection.execute(text(f"SELECT {select_clause} FROM {_sql_quote(table_name)}{order_clause}")).mappings().all()
            payload[table_name] = [dict(row) for row in rows]

    serialized = json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def compute_public_graph_bundle_fingerprint() -> str:
    return _hash_bytes(
        _hash_text(hash_file_tree([
            "frontend/src/lib",
        ], include_suffixes={".js"})),
        _hash_text(hash_file_tree([
            "frontend/scripts/build_public_product_graph_renderer.mjs",
            "frontend/package.json",
            "frontend/package-lock.json",
        ], include_suffixes={".js", ".mjs", ".json"})),
    )


def compute_setup_frontend_bundle_fingerprint() -> str:
    return _hash_bytes(
        _hash_text(hash_file_tree([
            "frontend/src",
        ], include_suffixes={".css", ".js", ".svelte", ".ts"})),
        _hash_text(hash_file_tree([
            "frontend/static",
        ])),
        _hash_text(hash_file_tree([
            "frontend/package.json",
            "frontend/package-lock.json",
            "frontend/svelte.config.js",
            "frontend/vite.config.js",
        ], include_suffixes={".js", ".json"})),
    )


def compute_generated_assets_fingerprint() -> str:
    return _hash_bytes(
        _hash_text(hash_file_tree([
            "backend",
        ], include_suffixes={".py"})),
        _hash_text(hash_database_state()),
        _hash_text(hash_file_tree([
            "templates/product",
            "templates/series",
            "templates/product_type",
        ], exclude_names={"registry.json"})),
    )


def compute_template_files_fingerprint() -> str:
    return hash_file_tree([
        "templates/product",
        "templates/series",
        "templates/product_type",
    ], exclude_names={"registry.json"})


TARGETS = {
    "public_graph_bundle": compute_public_graph_bundle_fingerprint,
    "setup_frontend_bundle": compute_setup_frontend_bundle_fingerprint,
    "generated_assets": compute_generated_assets_fingerprint,
    "template_files": compute_template_files_fingerprint,
}


def main() -> int:
    parser = argparse.ArgumentParser(description="Compute rebuild fingerprints for generated assets.")
    parser.add_argument("target", choices=sorted(TARGETS))
    args = parser.parse_args()

    print(TARGETS[args.target]())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
