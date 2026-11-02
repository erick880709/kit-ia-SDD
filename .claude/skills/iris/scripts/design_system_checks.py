#!/usr/bin/env python3
"""Design-system handoff checks for Iris: component catalog, tokens and brand assets.

Imported by validate_ux_docs.py. Token values live in W3C Design Tokens JSON files
(data consumed by code); every design decision and its rationale stays in Markdown.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Callable, Iterable

CATALOG_FILES = (
    "03-design-system/components.md",
    "03-design-system/ai-components.md",
)
TOKENS_DIR = "03-design-system/tokens"
BRAND_MANIFEST = "03-design-system/brand/assets.md"
IMPLEMENTATION_STATUSES = frozenset(
    {"planned", "implemented", "referenced", "retired", "deprecated"}
)
DTCG_TYPES = frozenset(
    {
        "color",
        "dimension",
        "fontFamily",
        "fontWeight",
        "duration",
        "cubicBezier",
        "number",
        "strokeStyle",
        "border",
        "transition",
        "shadow",
        "gradient",
        "typography",
    }
)
ASSET_COLUMNS = ("Asset", "Path", "Source", "License", "Status")
HEX_COLOR_RE = re.compile(r"^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")
ALIAS_RE = re.compile(r"^\{([^{}]+)\}$")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
STATUS_ROW_RE = re.compile(r"^\s*\|\s*Status\s*\|\s*([^|]+?)\s*\|", re.IGNORECASE)
EMPTY_CELLS = frozenset({"", "n/a", "—", "-", "none"})

FindingFactory = Callable[..., Any]


def _same_file(left: Path, right: Path) -> bool:
    return left.resolve().as_posix().lower() == right.resolve().as_posix().lower()


def _is_catalog(path: Path, root: Path) -> bool:
    return any(_same_file(path, root / name) for name in CATALOG_FILES)


def _implementation_block(section: str) -> list[str] | None:
    lines = section.splitlines()
    start = None
    start_level = 0
    for index, line in enumerate(lines):
        match = HEADING_RE.match(line)
        if not match:
            continue
        title = re.sub(r"[`*_]", "", match.group(2)).strip().lower()
        if start is None and title == "implementation":
            start, start_level = index, len(match.group(1))
        elif start is not None and len(match.group(1)) <= start_level:
            return lines[start + 1 : index]
    return lines[start + 1 :] if start is not None else None


def check_component_catalog(
    root: Path,
    mode: str,
    definitions: dict[str, set[Path]],
    sections: dict[str, tuple[Any, int, str]],
    finding: FindingFactory,
) -> list[Any]:
    findings: list[Any] = []
    build = mode == "build"
    for artifact_id in sorted(item for item in definitions if item.startswith("CMP-")):
        doc, line, section = sections[artifact_id]
        if not _is_catalog(doc.path, root):
            findings.append(
                finding(
                    "Error" if build else "Warning",
                    "COMPONENT_OUTSIDE_CATALOG",
                    f"{artifact_id} is only defined outside the component catalog.",
                    doc.path,
                    line,
                    "Define the component once in 03-design-system/components.md or "
                    "ai-components.md; screens only reference it.",
                )
            )
            continue
        block = _implementation_block(section)
        if block is None:
            if build:
                findings.append(
                    finding(
                        "Error",
                        "COMPONENT_IMPLEMENTATION_MISSING",
                        f"{artifact_id} has no Implementation section.",
                        doc.path,
                        line,
                        "Add '### Implementation' with Status, Code Evidence, Base, Layer, "
                        "Tokens and Props API.",
                    )
                )
            continue
        status = ""
        for block_line in block:
            match = STATUS_ROW_RE.match(block_line)
            if match:
                status = match.group(1).strip().strip("`*").split()[0].lower() if match.group(1).strip() else ""
                break
        if status not in IMPLEMENTATION_STATUSES:
            findings.append(
                finding(
                    "Error" if build else "Warning",
                    "COMPONENT_IMPLEMENTATION_STATUS_INVALID",
                    f"{artifact_id} Implementation Status must be one of "
                    f"{sorted(IMPLEMENTATION_STATUSES)}.",
                    doc.path,
                    line,
                )
            )
    return findings


def _walk_tokens(
    node: Any,
    path: list[str],
    inherited_type: str | None,
    tokens: dict[str, tuple[str | None, Any]],
    problems: list[tuple[str, str]],
) -> None:
    label = ".".join(path) or "<root>"
    if not isinstance(node, dict):
        problems.append(("DESIGN_TOKEN_MALFORMED", f"{label} must be a token or group object"))
        return
    current_type = node.get("$type", inherited_type)
    if "$value" in node:
        tokens[label] = (current_type, node["$value"])
        return
    for key, child in node.items():
        if key.startswith("$"):
            continue
        _walk_tokens(child, [*path, key], current_type, tokens, problems)


def _token_problems(
    tokens: dict[str, tuple[str | None, Any]], known: Iterable[str]
) -> list[tuple[str, str]]:
    known_names = set(known)
    problems: list[tuple[str, str]] = []
    for name, (token_type, value) in sorted(tokens.items()):
        if not token_type:
            problems.append(("DESIGN_TOKEN_TYPE_MISSING", f"{name} has no $type (own or inherited)"))
            continue
        if token_type not in DTCG_TYPES:
            problems.append(("DESIGN_TOKEN_TYPE_UNKNOWN", f"{name} uses unknown $type '{token_type}'"))
            continue
        if isinstance(value, str) and (alias := ALIAS_RE.match(value)):
            if alias.group(1) not in known_names:
                problems.append(("DESIGN_TOKEN_ALIAS_UNRESOLVED", f"{name} references unknown token {value}"))
            continue
        if token_type == "color":
            is_hex = isinstance(value, str) and HEX_COLOR_RE.match(value)
            is_object = isinstance(value, dict) and "colorSpace" in value and "components" in value
            if not (is_hex or is_object):
                problems.append(("DESIGN_TOKEN_COLOR_INVALID", f"{name} color value is not a hex string or color object"))
    return problems


def check_tokens(root: Path, mode: str, finding: FindingFactory) -> list[Any]:
    directory = root / TOKENS_DIR
    files = sorted(directory.glob("*.tokens.json")) if directory.is_dir() else []
    if not files:
        if mode == "build":
            return [
                finding(
                    "Error",
                    "DESIGN_TOKENS_MISSING",
                    "No 03-design-system/tokens/*.tokens.json file was found.",
                    directory,
                    None,
                    "Export the approved foundations as W3C Design Tokens before the build handoff.",
                )
            ]
        return []

    findings: list[Any] = []
    per_file: dict[Path, dict[str, tuple[str | None, Any]]] = {}
    for path in files:
        try:
            document = json.loads(path.read_text(encoding="utf-8-sig"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            findings.append(
                finding("Error", "DESIGN_TOKENS_INVALID_JSON", f"{path.name} is not valid JSON: {exc}", path, None)
            )
            continue
        tokens: dict[str, tuple[str | None, Any]] = {}
        problems: list[tuple[str, str]] = []
        _walk_tokens(document, [], None, tokens, problems)
        if not tokens:
            problems.append(("DESIGN_TOKENS_EMPTY", f"{path.name} declares no tokens"))
        per_file[path] = tokens
        for code, message in problems:
            findings.append(finding("Error", code, message, path, None))

    known = {name for tokens in per_file.values() for name in tokens}
    for path, tokens in per_file.items():
        for code, message in _token_problems(tokens, known):
            findings.append(finding("Error", code, message, path, None))
    return findings


def _repository_root(start: Path) -> Path | None:
    for candidate in (start, *start.parents):
        if (candidate / ".git").exists():
            return candidate
    return None


def _cells(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def check_brand_assets(root: Path, mode: str, finding: FindingFactory) -> list[Any]:
    manifest = root / BRAND_MANIFEST
    if not manifest.is_file():
        return []
    lines = manifest.read_text(encoding="utf-8-sig").splitlines()
    header_index = None
    columns: list[str] = []
    for index, line in enumerate(lines):
        if line.strip().startswith("|"):
            cells = _cells(line)
            if all(column in cells for column in ASSET_COLUMNS):
                header_index, columns = index, cells
                break
    if header_index is None:
        return [
            finding(
                "Error",
                "BRAND_ASSETS_MANIFEST_COLUMNS",
                f"Brand assets manifest needs a table with columns {list(ASSET_COLUMNS)}.",
                manifest,
                1,
            )
        ]

    findings: list[Any] = []
    path_column = columns.index("Path")
    repository = _repository_root(manifest.parent)
    for number, line in enumerate(lines[header_index + 2 :], header_index + 3):
        if not line.strip().startswith("|"):
            break
        cells = _cells(line)
        if len(cells) <= path_column:
            continue
        raw = cells[path_column].strip("` ")
        if raw.lower() in EMPTY_CELLS:
            continue
        candidates = [(manifest.parent / raw).resolve()]
        if repository is not None:
            candidates.append((repository / raw).resolve())
        if not any(candidate.exists() for candidate in candidates):
            findings.append(
                finding(
                    "Error",
                    "BRAND_ASSET_MISSING",
                    f"Brand asset path does not exist: {raw}",
                    manifest,
                    number,
                    "Add the official file, or set Path to N/A and Status to Missing.",
                )
            )
    return findings


def run_design_system_checks(
    root: Path,
    mode: str,
    definitions: dict[str, set[Path]],
    sections: dict[str, tuple[Any, int, str]],
    finding: FindingFactory,
) -> list[Any]:
    findings = check_component_catalog(root, mode, definitions, sections, finding)
    findings.extend(check_tokens(root, mode, finding))
    findings.extend(check_brand_assets(root, mode, finding))
    return findings
