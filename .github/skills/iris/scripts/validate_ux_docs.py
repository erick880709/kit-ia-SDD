#!/usr/bin/env python3
"""Validate Iris Markdown UX architecture without a parallel JSON model."""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import unquote

sys.path.insert(0, str(Path(__file__).resolve().parent))
from design_system_checks import run_design_system_checks  # noqa: E402


ID_PATTERN = r"(?:REQ|ACT|UC|UF|EC|IS|IR|SCR|UIS|CF|ST|CMD|EVT|CMP|UXF|TST)-\d{3}"
ID_RE = re.compile(rf"\b({ID_PATTERN})\b")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
DEFINITION_RE = re.compile(rf"^(?:{ID_PATTERN})$")
LINK_RE = re.compile(r"(?<!!)\[[^\]]*\]\(([^)]+)\)")
TABLE_ID_RE = re.compile(rf"^\s*\|\s*({ID_PATTERN})\s*\|")

STATE_HEADINGS = (
    "Default",
    "Loading",
    "Empty",
    "Error",
    "Success",
    "Disabled",
    "Unauthorized",
)

SCREEN_HEADINGS = (
    "Status",
    "Purpose and Scope",
    "Priority Actions",
    "Information Requirements",
    "User Flows and Navigation",
    "Interaction Strategy",
    "States",
    "Edge Cases and Recovery",
    "Permissions and Accessibility",
    "Components",
    "Event Storming Mapping",
    "Wireframe",
    "Decisions and Gaps",
    "Related Tests",
    "Problems and Opportunities",
    "Open Questions",
)

FLOW_HEADINGS = (
    "Goal",
    "Actor",
    "Related Use Cases",
    "Entry Point",
    "Happy Path",
    "Alternative Paths",
    "Edge Cases",
    "Failure Paths",
    "Recovery Paths",
    "Exit States",
    "Related Screens",
    "Related Commands",
    "Related Events",
    "Open Questions",
)

REQUIRED_BY_MODE = {
    "architecture": (
        "README.md",
        "01-context/actors.md",
        "01-context/entities.md",
        "01-context/assumptions.md",
        "02-ui-architecture/screen-inventory.md",
        "05-validation/traceability-matrix.md",
        "05-validation/design-coverage.md",
        "05-validation/gaps.md",
        "05-validation/validation-summary.md",
    ),
    "design": (
        "03-design-system/foundations.md",
        "03-design-system/components.md",
        "03-design-system/patterns.md",
        "03-design-system/ai-components.md",
        "04-ux-review/ux-findings.md",
    ),
    "prototype": (
        "06-prototype/prototype-notes.md",
        "04-ux-review/final-review.md",
    ),
    "build": ("03-design-system/brand/assets.md",),
}


@dataclass(frozen=True)
class Finding:
    severity: str
    code: str
    message: str
    path: Path | None = None
    line: int | None = None
    resolution: str = "Complete or correct the referenced Markdown artifact."


@dataclass
class Document:
    path: Path
    text: str
    lines: list[str]
    headings: list[tuple[int, int, str]]

    @classmethod
    def read(cls, path: Path) -> "Document":
        text = path.read_text(encoding="utf-8-sig")
        lines = text.splitlines()
        headings: list[tuple[int, int, str]] = []
        in_fence = False
        fence_marker = ""
        for number, line in enumerate(lines, 1):
            stripped = line.lstrip()
            if stripped.startswith(("```", "~~~")):
                marker = stripped[:3]
                if not in_fence:
                    in_fence, fence_marker = True, marker
                elif marker == fence_marker:
                    in_fence = False
                continue
            if in_fence:
                continue
            match = HEADING_RE.match(line)
            if match:
                headings.append((number, len(match.group(1)), match.group(2).strip()))
        return cls(path, text, lines, headings)

    def has_heading(self, name: str, minimum_level: int = 1) -> bool:
        wanted = normalize_heading(name)
        return any(
            level >= minimum_level and normalize_heading(title) == wanted
            for _, level, title in self.headings
        )

    def definition_sections(self) -> Iterable[tuple[str, int, int, str]]:
        for index, (line, level, title) in enumerate(self.headings):
            artifact_id = leading_id(title)
            if not artifact_id:
                continue
            end = len(self.lines) + 1
            for next_line, next_level, _ in self.headings[index + 1 :]:
                if next_level <= level:
                    end = next_line
                    break
            yield artifact_id, line, end, "\n".join(self.lines[line - 1 : end - 1])


def normalize_heading(value: str) -> str:
    value = re.sub(r"[`*_]", "", value).strip().lower()
    value = re.sub(r"^\d+(?:\.\d+)*[.)]?\s+", "", value)
    return re.sub(r"\s+", " ", value)


def leading_id(title: str) -> str | None:
    cleaned = re.sub(r"[`*_]", "", title).strip()
    match = re.match(rf"^({ID_PATTERN})(?:\s*(?:—|–|-|:)|\s*$)", cleaned)
    return match.group(1) if match else None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate Iris Markdown traceability and design coverage."
    )
    parser.add_argument(
        "ux_root",
        type=Path,
        help=(
            "Path to the UX architecture root to validate, e.g. "
            "resources/design/ux/<project>."
        ),
    )
    parser.add_argument(
        "--mode", choices=("architecture", "design", "prototype", "build"), default="design"
    )
    parser.add_argument("--report", type=Path, help="Write findings as a Markdown gap report.")
    parser.add_argument(
        "--strict-warnings", action="store_true", help="Return failure when warnings exist."
    )
    return parser.parse_args()


def docs_root(ux_root: Path) -> Path:
    return ux_root.resolve()


def relative(path: Path | None, root: Path) -> str:
    if path is None:
        return "project"
    try:
        return path.resolve().relative_to(root.resolve()).as_posix()
    except ValueError:
        return str(path)


def required_paths(mode: str) -> list[str]:
    result = list(REQUIRED_BY_MODE["architecture"])
    if mode in {"design", "prototype", "build"}:
        result.extend(REQUIRED_BY_MODE["design"])
    if mode == "prototype":
        result.extend(REQUIRED_BY_MODE["prototype"])
    if mode == "build":
        result.extend(REQUIRED_BY_MODE["build"])
    return result


TABLE_DEFINABLE_PREFIXES = frozenset(
    {"REQ", "ACT", "UC", "EC", "UIS", "SCR", "CMP", "UXF", "TST", "CMD", "EVT"}
)


def definition_table_prefixes(path: Path) -> set[str]:
    # Table-row definitions are recognized in any Markdown file. The strict
    # ID_PATTERN anchored at the first cell prevents incidental matches.
    prefixes = set(TABLE_DEFINABLE_PREFIXES)
    if "/02-ui-architecture/screens/" in str(path).replace("\\", "/"):
        prefixes.add("IR")
    return prefixes


def collect_definitions(
    documents: list[Document],
) -> tuple[dict[str, set[Path]], dict[str, tuple[Document, int, str]]]:
    definitions: dict[str, set[Path]] = {}
    sections: dict[str, tuple[Document, int, str]] = {}
    for doc in documents:
        for artifact_id, line, _, section in doc.definition_sections():
            definitions.setdefault(artifact_id, set()).add(doc.path)
            sections.setdefault(artifact_id, (doc, line, section))

    for doc in documents:
        prefixes = definition_table_prefixes(doc.path)
        if not prefixes:
            continue
        in_fence = False
        for number, line in enumerate(doc.lines, 1):
            if line.lstrip().startswith(("```", "~~~")):
                in_fence = not in_fence
                continue
            if in_fence:
                continue
            match = TABLE_ID_RE.match(line)
            if not match or match.group(1).split("-", 1)[0] not in prefixes:
                continue
            artifact_id = match.group(1)
            if artifact_id not in definitions:
                definitions.setdefault(artifact_id, set()).add(doc.path)
                sections.setdefault(artifact_id, (doc, number, line))
    return definitions, sections


def all_ids(documents: list[Document]) -> dict[str, list[tuple[Path, int]]]:
    result: dict[str, list[tuple[Path, int]]] = {}
    for doc in documents:
        in_fence = False
        for number, line in enumerate(doc.lines, 1):
            if line.lstrip().startswith(("```", "~~~")):
                in_fence = not in_fence
                continue
            if in_fence:
                continue
            for artifact_id in ID_RE.findall(line):
                result.setdefault(artifact_id, []).append((doc.path, number))
    return result


def check_links(documents: list[Document], root: Path) -> list[Finding]:
    findings: list[Finding] = []
    for doc in documents:
        for number, line in enumerate(doc.lines, 1):
            for raw_target in LINK_RE.findall(line):
                target = raw_target.strip().split(maxsplit=1)[0].strip("<>")
                if not target or target.startswith(("#", "http://", "https://", "mailto:")):
                    continue
                target = unquote(target.split("#", 1)[0].split("?", 1)[0])
                resolved = (doc.path.parent / target).resolve()
                if not resolved.exists():
                    findings.append(
                        Finding(
                            "Error",
                            "BROKEN_LINK",
                            f"Relative link target does not exist: {raw_target}",
                            doc.path,
                            number,
                            "Correct the relative link or create the intended target.",
                        )
                    )
    return findings


def section_has_heading(section: str, name: str) -> bool:
    wanted = normalize_heading(name)
    return any(
        normalize_heading(match.group(2)) == wanted
        for line in section.splitlines()
        if (match := HEADING_RE.match(line))
    )


def section_has_field(section: str, name: str) -> bool:
    """Accept a canonical heading or the first cell/label of a compact table."""
    if section_has_heading(section, name):
        return True
    wanted = normalize_heading(name)
    for line in section.splitlines():
        table = re.match(r"^\s*\|\s*([^|]+?)\s*\|", line)
        if table and normalize_heading(table.group(1)) == wanted:
            return True
        label = re.match(r"^\s*\*\*([^*]+):\*\*", line)
        if label and normalize_heading(label.group(1)) == wanted:
            return True
    return False


def numbered_h2_findings(doc: Document, screen: str, start_line: int, end_line: int) -> list[Finding]:
    headings = [
        (line, title)
        for line, level, title in doc.headings
        if level == 2 and start_line < line < end_line
    ]
    numbers: list[int] = []
    findings: list[Finding] = []
    for line, title in headings:
        match = re.match(r"^(\d+)\.\s+", title)
        if not match:
            findings.append(
                Finding(
                    "Error",
                    "SCREEN_SECTION_UNNUMBERED",
                    f"{screen} has an unnumbered level-2 section: {title}",
                    doc.path,
                    line,
                    "Number screen sections consecutively, starting with '0. Contenido'.",
                )
            )
        else:
            numbers.append(int(match.group(1)))
    if numbers and numbers[0] != 0:
        findings.append(
            Finding(
                "Error",
                "SCREEN_SECTION_START",
                f"{screen} section numbering starts at {numbers[0]} instead of 0.",
                doc.path,
                start_line,
                "Start with '0. Contenido', then number canonical sections from 1.",
            )
        )
    if numbers and numbers != list(range(numbers[0], numbers[0] + len(numbers))):
        findings.append(
            Finding(
                "Error",
                "SCREEN_SECTION_SEQUENCE",
                f"{screen} section numbers are not consecutive: {numbers}",
                doc.path,
                start_line,
                "Renumber level-2 sections consecutively without gaps or duplicates.",
            )
        )
    return findings


def section_ids(section: str, prefix: str) -> set[str]:
    return {artifact_id for artifact_id in ID_RE.findall(section) if artifact_id.startswith(prefix + "-")}


def find_artifact_checks(
    mode: str,
    definitions: dict[str, set[Path]],
    sections: dict[str, tuple[Document, int, str]],
) -> list[Finding]:
    findings: list[Finding] = []
    use_cases = sorted(item for item in definitions if item.startswith("UC-"))
    flows = sorted(item for item in definitions if item.startswith("UF-"))
    screens = sorted(item for item in definitions if item.startswith("SCR-"))
    edges = sorted(item for item in definitions if item.startswith("EC-"))

    if not use_cases:
        findings.append(Finding("Error", "NO_USE_CASES", "No canonical UC-* definitions found."))
    if use_cases and not flows:
        findings.append(Finding("Error", "NO_USER_FLOWS", "Use cases exist but no UF-* definitions were found."))

    for flow in flows:
        doc, line, section = sections[flow]
        for heading in FLOW_HEADINGS:
            if not section_has_field(section, heading):
                findings.append(
                    Finding(
                        "Error",
                        "FLOW_SECTION_MISSING",
                        f"{flow} is missing canonical heading '{heading}'.",
                        doc.path,
                        line,
                    )
                )
        if not section_ids(section, "UC"):
            findings.append(Finding("Error", "FLOW_WITHOUT_USE_CASE", f"{flow} references no UC-*.", doc.path, line))

    for use_case in use_cases:
        doc, line, section = sections[use_case]
        if not section_has_field(section, "Actor"):
            findings.append(Finding("Error", "USE_CASE_ACTOR_MISSING", f"{use_case} has no Actor heading.", doc.path, line))
        if not section_has_field(section, "Interaction Strategy") and not section_ids(section, "IS"):
            findings.append(Finding("Error", "USE_CASE_STRATEGY_MISSING", f"{use_case} has no Interaction Strategy.", doc.path, line))
        if not section_ids(section, "UF"):
            findings.append(Finding("Error", "USE_CASE_FLOW_MISSING", f"{use_case} references no UF-*.", doc.path, line))
        priority = re.search(r"(?ims)^#{2,6}\s+Priority\s*$\s*(?:\*\*)?(Critical|High)(?:\*\*)?", section)
        if priority and not section_ids(section, "TST"):
            findings.append(Finding("Error", "PRIORITY_USE_CASE_UNTESTED", f"{use_case} is {priority.group(1)} priority but references no TST-*.", doc.path, line))

    for edge in edges:
        doc, line, section = sections[edge]
        if re.search(r"(?im)\*\*Severity:\*\*\s*Critical\b", section):
            if not section_has_heading(section, "Recovery"):
                findings.append(Finding("Error", "CRITICAL_EDGE_NO_RECOVERY", f"{edge} is Critical but has no Recovery heading.", doc.path, line))
            if not section_ids(section, "TST"):
                findings.append(Finding("Error", "CRITICAL_EDGE_UNTESTED", f"{edge} is Critical but references no TST-*.", doc.path, line))

    if mode in {"design", "prototype", "build"}:
        if screens and not any(
            "02-ui-architecture" in str(sections[item][0].path).replace("\\", "/")
            and "/screens/" in str(sections[item][0].path).replace("\\", "/")
            for item in screens
        ):
            findings.append(Finding("Error", "NO_SCREEN_SPECIFICATIONS", "Screens exist but no screen specification files were found."))
        for screen in screens:
            doc, line, section = sections[screen]
            normalized_path = str(doc.path).replace("\\", "/")
            if "/02-ui-architecture/screens/" not in normalized_path:
                findings.append(Finding("Error", "SCREEN_OUTSIDE_SOURCE_DIR", f"{screen} must be defined under 02-ui-architecture/screens/.", doc.path, line))
                continue
            is_design_spec = section_has_field(section, "Status")
            if not is_design_spec:
                # Architecture-only screen sources remain valid but do not claim
                # Design Mode completeness. A transitional architecture backlog
                # may group them until each screen is upgraded in place.
                continue
            if not doc.path.stem.startswith(screen):
                findings.append(Finding("Error", "SCREEN_FILE_ID_MISMATCH", f"{screen} must own a file whose name starts with its ID.", doc.path, line))
            end_line = line + len(section.splitlines())
            findings.extend(numbered_h2_findings(doc, screen, line, end_line))
            if len(section.splitlines()) > 450:
                findings.append(Finding("Warning", "SCREEN_TOO_LONG", f"{screen} has {len(section.splitlines())} lines; review duplication and convert comparable prose to tables.", doc.path, line, "Compact the screen toward 250–400 lines before accepting additional content."))
            for heading in SCREEN_HEADINGS:
                if not section_has_field(section, heading):
                    findings.append(Finding("Error", "SCREEN_SECTION_MISSING", f"{screen} is missing canonical heading '{heading}'.", doc.path, line))
            for state in STATE_HEADINGS:
                if not section_has_field(section, state):
                    findings.append(Finding("Error", "SCREEN_STATE_MISSING", f"{screen} does not evaluate state '{state}'.", doc.path, line))
            if not section_ids(section, "ACT"):
                findings.append(Finding("Error", "SCREEN_ACTOR_MISSING", f"{screen} references no ACT-*.", doc.path, line))
            if not section_ids(section, "UC"):
                findings.append(Finding("Error", "SCREEN_USE_CASE_MISSING", f"{screen} references no UC-*.", doc.path, line))
            if not section_ids(section, "UF"):
                findings.append(Finding("Error", "SCREEN_FLOW_MISSING", f"{screen} references no UF-*.", doc.path, line))

    flow_text = "\n".join(sections[item][2] for item in flows)
    use_case_text = "\n".join(sections[item][2] for item in use_cases)
    for screen in screens:
        if screen not in flow_text:
            path = sections[screen][0].path
            findings.append(Finding("Error", "ORPHAN_SCREEN", f"{screen} is not reachable from any UF-* definition.", path))
    for flow in flows:
        if flow not in use_case_text:
            path = sections[flow][0].path
            findings.append(Finding("Error", "ORPHAN_USER_FLOW", f"{flow} is not referenced by any UC-* definition.", path))

    ux_docs = [
        section
        for artifact_id, (_, _, section) in sections.items()
        if artifact_id.startswith(("UF-", "SCR-", "UIS-"))
    ]
    ux_text = "\n".join(ux_docs)
    for prefix, label in (("CMD", "Command"), ("EVT", "Event")):
        for artifact_id in sorted(item for item in definitions if item.startswith(prefix + "-")):
            if artifact_id not in ux_text:
                severity = "Error" if mode in {"design", "prototype", "build"} else "Warning"
                findings.append(Finding(severity, f"UNMAPPED_{prefix}", f"{label} {artifact_id} has no UX representation in a flow, surface, or screen."))

    return findings


def write_report(path: Path, findings: list[Finding], root: Path, mode: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = ["# Design Gaps", "", f"**Validation Mode:** {mode.title()}", ""]
    if not findings:
        lines.extend(["No incomplete items detected by deterministic validation.", ""])
    for index, finding in enumerate(findings, 1):
        severity = "High" if finding.severity == "Error" else "Medium"
        location = relative(finding.path, root)
        if finding.line:
            location += f":{finding.line}"
        lines.extend(
            [
                f"## GAP-{index:03d} — {finding.code}",
                "",
                f"**Severity:** {severity}  ",
                f"**Location:** `{location}`",
                "",
                finding.message,
                "",
                "### Required Resolution",
                "",
                finding.resolution,
                "",
            ]
        )
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    args = parse_args()
    root = docs_root(args.ux_root)
    findings: list[Finding] = []

    if not root.is_dir():
        findings.append(
            Finding(
                "Error",
                "DOCS_ROOT_MISSING",
                f"Documentation root does not exist: {root}",
                root,
                resolution="Create the canonical UX architecture tree for the selected mode.",
            )
        )
        documents: list[Document] = []
    else:
        documents = [Document.read(path) for path in sorted(root.rglob("*.md"))]

    for required in required_paths(args.mode):
        target = root / required
        if not target.is_file():
            findings.append(
                Finding(
                    "Error",
                    "REQUIRED_ARTIFACT_MISSING",
                    f"Required {args.mode} artifact is missing: {required}",
                    target,
                    resolution="Create the canonical Markdown artifact or select the correct operating mode.",
                )
            )

    if root.is_dir():
        screen_files = sorted((root / "02-ui-architecture" / "screens").glob("SCR-*.md"))
        if not screen_files:
            findings.append(
                Finding(
                    "Error",
                    "SCREEN_SOURCE_MISSING",
                    "No canonical screen files were found under 02-ui-architecture/screens/.",
                    root / "02-ui-architecture" / "screens",
                    resolution="Create one SCR-XXX-<slug>.md source file per screen.",
                )
            )
        for legacy in (
            "04-ui-architecture",
            "05-design-system",
            "07-ux-review",
            "08-validation",
        ):
            legacy_path = root / legacy
            if legacy_path.exists():
                findings.append(
                    Finding(
                        "Error",
                        "LEGACY_NUMBERED_DIRECTORY",
                        f"Legacy non-sequential UX directory remains: {legacy}",
                        legacy_path,
                        resolution="Move content to the sequential Iris directory structure.",
                    )
                )
        for legacy_detail in root.rglob("screen-detail.md"):
            findings.append(
                Finding(
                    "Error",
                    "SCREEN_DETAIL_FORBIDDEN",
                    "screen-detail.md duplicates screen-owned documentation.",
                    legacy_detail,
                    resolution="Move each screen definition to its own file under 02-ui-architecture/screens/ and remove screen-detail.md.",
                )
            )

    if root.is_dir():
        for directory in sorted(path for path in root.rglob("*") if path.is_dir()):
            if not any(child.is_file() for child in directory.iterdir()):
                findings.append(Finding("Warning", "EMPTY_DIRECTORY", "Directory contains no files.", directory, resolution="Remove the empty directory or add the mode-required artifact."))

    definitions, sections = collect_definitions(documents)
    references = all_ids(documents)

    for artifact_id, paths in sorted(definitions.items()):
        if len(paths) > 1:
            locations = ", ".join(relative(path, root) for path in sorted(paths))
            findings.append(Finding("Error", "DUPLICATE_ID", f"{artifact_id} is defined in multiple files: {locations}"))

    for artifact_id, uses in sorted(references.items()):
        if artifact_id not in definitions:
            path, line = uses[0]
            findings.append(Finding("Error", "UNKNOWN_ID", f"{artifact_id} is referenced but never defined.", path, line, "Define the ID once in a canonical artifact or correct the reference."))

    findings.extend(check_links(documents, root))
    findings.extend(find_artifact_checks(args.mode, definitions, sections))
    findings.extend(run_design_system_checks(root, args.mode, definitions, sections, Finding))

    # Stable, deduplicated output.
    unique: list[Finding] = []
    seen: set[tuple[str, str, str, str, int | None]] = set()
    for finding in findings:
        key = (finding.severity, finding.code, finding.message, str(finding.path), finding.line)
        if key not in seen:
            seen.add(key)
            unique.append(finding)
    findings = sorted(unique, key=lambda item: (item.severity != "Error", item.code, str(item.path), item.line or 0, item.message))

    for finding in findings:
        location = relative(finding.path, root)
        if finding.line:
            location += f":{finding.line}"
        print(f"[{finding.severity}] {finding.code} {location}: {finding.message}")

    errors = sum(item.severity == "Error" for item in findings)
    warnings = len(findings) - errors
    print(f"Iris validation ({args.mode}): {errors} error(s), {warnings} warning(s).")

    if args.report:
        write_report(args.report.resolve(), findings, root, args.mode)
        print(f"Gap report written to {args.report.resolve()}")

    return 1 if errors or (args.strict_warnings and warnings) else 0


if __name__ == "__main__":
    sys.exit(main())
