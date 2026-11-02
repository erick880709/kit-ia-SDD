#!/usr/bin/env python3
"""Compare an Iris design system with the code that implements it (read-only).

Reports component IDs referenced in code but missing from the component catalog,
catalog components marked Implemented without any code reference, and style
literals (hex/rgb/hsl colors, px font sizes) outside the declared style zones.
"""

from __future__ import annotations

import argparse
import fnmatch
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

CATALOG_FILES = (
    "03-design-system/components.md",
    "03-design-system/ai-components.md",
)
CODE_SUFFIXES = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".vue",
    ".svelte",
    ".html",
    ".css",
    ".scss",
    ".sass",
    ".less",
}
IGNORED_DIRS = {".git", "node_modules", "dist", "build", "coverage", ".next", ".turbo", ".venv", "__pycache__"}
CMP_RE = re.compile(r"\bCMP-\d{3}\b")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
CMP_HEADING_RE = re.compile(r"^`?(CMP-\d{3})\b")
STATUS_ROW_RE = re.compile(r"^\s*\|\s*Status\s*\|\s*`?([A-Za-z]+)", re.IGNORECASE)
COLOR_LITERAL_RE = re.compile(
    r"(?<![&\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])"
    r"|\b(?:rgba?|hsla?)\("
)
PX_FONT_SIZE_RE = re.compile(r"font-?size\s*[:=]\s*[\"'`]?\s*\d+(?:\.\d+)?px", re.IGNORECASE)


@dataclass
class CatalogEntry:
    path: Path
    line: int
    retired: bool
    status: str | None = None


@dataclass
class DriftResult:
    catalog: dict[str, CatalogEntry]
    mentioned: set[str]
    code_refs: dict[str, list[str]]
    literals: dict[str, dict[str, int]] = field(default_factory=dict)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("ux_root", type=Path, help="UX architecture root, e.g. resources/design/ux/<project>")
    parser.add_argument("--code-root", type=Path, action="append", required=True, help="Repeatable code root to scan")
    parser.add_argument("--style-zone", action="append", default=[], help="Repeatable glob (relative to its code root) where style literals are allowed")
    parser.add_argument("--exempt", action="append", default=[], help="Repeatable glob excluded from the literal scan (tests, mocks)")
    parser.add_argument("--max-literals", type=int, help="Fail when style literals outside zones exceed this count")
    parser.add_argument("--report", type=Path, help="Write a Markdown drift report")
    return parser.parse_args(argv)


def iter_code_files(root: Path):
    for current, dirs, files in os.walk(root):
        dirs[:] = sorted(name for name in dirs if name not in IGNORED_DIRS)
        for name in sorted(files):
            path = Path(current) / name
            if path.suffix.lower() in CODE_SUFFIXES:
                yield path


def read_catalog(ux_root: Path) -> dict[str, CatalogEntry]:
    catalog: dict[str, CatalogEntry] = {}
    for name in CATALOG_FILES:
        path = ux_root / name
        if not path.is_file():
            continue
        current: str | None = None
        in_implementation = False
        for number, line in enumerate(path.read_text(encoding="utf-8-sig").splitlines(), 1):
            heading = HEADING_RE.match(line)
            if heading:
                level = len(heading.group(1))
                title = re.sub(r"[*_]", "", heading.group(2)).strip()
                cmp_match = CMP_HEADING_RE.match(title)
                if level == 2 and cmp_match:
                    current = cmp_match.group(1)
                    lowered = title.lower()
                    catalog.setdefault(
                        current,
                        CatalogEntry(path, number, "retirado" in lowered or "retired" in lowered),
                    )
                    in_implementation = False
                elif level <= 2:
                    current, in_implementation = None, False
                else:
                    in_implementation = title.strip("`").lower() == "implementation"
                continue
            if current and in_implementation and catalog[current].status is None:
                status = STATUS_ROW_RE.match(line)
                if status:
                    catalog[current].status = status.group(1).lower()
    return catalog


def mentioned_ids(ux_root: Path) -> set[str]:
    ids: set[str] = set()
    for path in ux_root.rglob("*.md"):
        ids.update(CMP_RE.findall(path.read_text(encoding="utf-8-sig")))
    return ids


def matches_any(relative: str, patterns: list[str]) -> bool:
    return any(fnmatch.fnmatch(relative, pattern) for pattern in patterns)


def scan_code(code_roots: list[Path], zones: list[str], exemptions: list[str]) -> tuple[dict[str, list[str]], dict[str, dict[str, int]]]:
    refs: dict[str, list[str]] = {}
    literals: dict[str, dict[str, int]] = {}
    for code_root in code_roots:
        root = code_root.resolve()
        for path in iter_code_files(root):
            try:
                text = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            relative = path.relative_to(root).as_posix()
            label = f"{code_root.as_posix()}/{relative}"
            for artifact_id in sorted(set(CMP_RE.findall(text))):
                refs.setdefault(artifact_id, []).append(label)
            if matches_any(relative, zones) or matches_any(relative, exemptions):
                continue
            colors = len(COLOR_LITERAL_RE.findall(text))
            sizes = len(PX_FONT_SIZE_RE.findall(text))
            if colors or sizes:
                literals[label] = {"colors": colors, "px_font_sizes": sizes}
    return refs, literals


def analyze(args: argparse.Namespace) -> DriftResult:
    ux_root = args.ux_root.resolve()
    catalog = read_catalog(ux_root)
    refs, literals = scan_code(args.code_root, args.style_zone, args.exempt)
    return DriftResult(catalog, mentioned_ids(ux_root), refs, literals)


def write_report(path: Path, result: DriftResult, uncataloged: list[str], unused_implemented: list[str], total_literals: int) -> None:
    lines = [
        "# Design Drift Report",
        "",
        "## Contenido",
        "",
        "- [Summary](#summary)",
        "- [Components Used in Code but Not Cataloged](#components-used-in-code-but-not-cataloged)",
        "- [Cataloged Components Marked Implemented Without Code References](#cataloged-components-marked-implemented-without-code-references)",
        "- [Style Literals Outside Style Zones](#style-literals-outside-style-zones)",
        "",
        "Generated by `check_design_drift.py` (read-only). Regenerate after changing the catalog or the code.",
        "",
        "## Summary",
        "",
        "| Metric | Value |",
        "|---|---:|",
        f"| Catalog components | {len(result.catalog)} |",
        f"| Component IDs referenced in code | {len(result.code_refs)} |",
        f"| Referenced in code but not cataloged | {len(uncataloged)} |",
        f"| Marked Implemented without code references | {len(unused_implemented)} |",
        f"| Files with style literals outside zones | {len(result.literals)} |",
        f"| Style literals outside zones | {total_literals} |",
        "",
        "## Components Used in Code but Not Cataloged",
        "",
    ]
    if uncataloged:
        lines += ["| # | Component | Mentioned in UX docs | Code references |", "|---:|---|---|---|"]
        for index, artifact_id in enumerate(uncataloged, 1):
            mentioned = "Yes" if artifact_id in result.mentioned else "No"
            lines.append(f"| {index} | {artifact_id} | {mentioned} | {', '.join(f'`{p}`' for p in result.code_refs[artifact_id])} |")
    else:
        lines.append("None.")
    lines += ["", "## Cataloged Components Marked Implemented Without Code References", ""]
    if unused_implemented:
        lines += ["| # | Component |", "|---:|---|"]
        lines += [f"| {index} | {artifact_id} |" for index, artifact_id in enumerate(unused_implemented, 1)]
    else:
        lines.append("None.")
    lines += ["", "## Style Literals Outside Style Zones", ""]
    if result.literals:
        lines += ["| # | File | Color literals | px font sizes |", "|---:|---|---:|---:|"]
        ranked = sorted(result.literals.items(), key=lambda item: (-(item[1]["colors"] + item[1]["px_font_sizes"]), item[0]))
        for index, (label, counts) in enumerate(ranked, 1):
            lines.append(f"| {index} | `{label}` | {counts['colors']} | {counts['px_font_sizes']} |")
    else:
        lines.append("None.")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    if not args.ux_root.is_dir():
        print(f"[Error] UX root does not exist: {args.ux_root}")
        return 2
    result = analyze(args)
    uncataloged = sorted(item for item in result.code_refs if item not in result.catalog)
    unused_implemented = sorted(
        item
        for item, entry in result.catalog.items()
        if entry.status == "implemented" and item not in result.code_refs
    )
    total_literals = sum(counts["colors"] + counts["px_font_sizes"] for counts in result.literals.values())

    for artifact_id in uncataloged:
        kind = "not cataloged" if artifact_id in result.mentioned else "unknown to the UX docs"
        print(f"[Error] CODE_REFERENCES_UNCATALOGED_COMPONENT {artifact_id}: {kind}; used in {', '.join(result.code_refs[artifact_id])}")
    for artifact_id in unused_implemented:
        print(f"[Warning] CATALOG_IMPLEMENTED_NOT_IN_CODE {artifact_id}: marked Implemented but no code reference was found")
    print(
        f"Design drift: {len(uncataloged)} uncataloged component(s), {len(unused_implemented)} implemented-without-code, "
        f"{total_literals} style literal(s) outside zones in {len(result.literals)} file(s)."
    )
    if args.report:
        write_report(args.report.resolve(), result, uncataloged, unused_implemented, total_literals)
        print(f"Drift report written to {args.report.resolve()}")

    failed = bool(uncataloged) or (args.max_literals is not None and total_literals > args.max_literals)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
