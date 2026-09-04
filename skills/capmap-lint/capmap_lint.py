#!/usr/bin/env python3
"""文档能力体系轻量校验（capmap-lint）。

用法（仓库根）：
  python .agents/skills/capmap-lint/capmap_lint.py
  python .agents/skills/capmap-lint/capmap_lint.py --json

读取 capmap-system/capmap.yaml 的 docs_root；检查断链、底图 §1↔状态 Tag、
活跃方案变更记录、README 底图、活跃/归档同名冲突、**落地态跳过验证门（status_skip）**等。有 error 时退出码 1。
本脚本归属 skill：.agents/skills/capmap-lint/
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path

import yaml

SKILL_DIR = Path(__file__).resolve().parent


def _find_repo_root(start: Path) -> Path:
    """Locate repo root that contains .agents/skills/capmap-system/capmap.yaml."""
    for p in [start, *start.parents]:
        if (p / ".agents" / "skills" / "capmap-system" / "capmap.yaml").is_file():
            return p
    # Fallback: skills/capmap-lint → parents[1] == repo when published under skills/
    if start.name == "capmap-lint" and start.parent.name == "skills":
        return start.parent.parent
    return start.parents[2]


ROOT = _find_repo_root(SKILL_DIR)
CONFIG = (
    ROOT / ".agents" / "skills" / "capmap-system" / "capmap.yaml"
)

WIKILINK_RE = re.compile(r"\[\[([^\]]+?)\]\]")
MD_LINK_RE = re.compile(r"\[([^\]]*)\]\(([^)]+)\)")
FRONT_MATTER_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*\n", re.DOTALL)
STATUS_CELL_RE = re.compile(
    r"^\|\s*([^|]+?)\s*\|\s*"
    r"(方案中|已确认|规格中|已拆分|开发中|已开发|验证中|已验证|落地中|已落地)\s*\|",
    re.MULTILINE,
)
SCHEME_STATUS_ACTIVE = {
    "状态/方案中",
    "状态/已确认",
    "状态/规格中",
    "状态/已拆分",
    "状态/开发中",
    "状态/已开发",
    "状态/验证中",
    "状态/已验证",
    "状态/落地中",
    "状态/已落地",
}
SCHEME_STATUS = SCHEME_STATUS_ACTIVE | {"状态/已归档"}
TEST_STATUS = {
    "状态/测试中",
    "状态/已验证",
}
SLICE_STATUS = {
    "状态/待开发",
    "状态/开发中",
    "状态/待验收",
    "状态/已验收",
}
VOLUME_TAGS = {"体量/小", "体量/大"}
SCHEME_NEEDS_VOLUME = SCHEME_STATUS_ACTIVE - {"状态/方案中"}
ALLOWED_STATUS = SCHEME_STATUS | TEST_STATUS | SLICE_STATUS

SKIP_MD_PREFIXES = ("http://", "https://", "mailto:", "#")
# 说明性占位，不当作真实笔记
PLACEHOLDER_WIKILINKS = {
    "wikilink",
    "名",
    "别名",
    "方案文件名",
    "方案文件名A",
    "方案文件名B",
    "能力底图-xxx",
    "能力底图-其他主题",
    "path/name",
    "方案stem-01-xxx",
    "方案stem-02-yyy",
    "00-规格-短名",
    "01-短名",
}
FENCE_RE = re.compile(r"```.*?```", re.DOTALL)
INLINE_CODE_RE = re.compile(r"`[^`]+`")


@dataclass
class Finding:
    level: str  # error | warn
    code: str
    path: str
    message: str


@dataclass
class Report:
    findings: list[Finding] = field(default_factory=list)

    def add(self, level: str, code: str, path: Path | str, message: str) -> None:
        rel = path if isinstance(path, str) else _rel(path)
        self.findings.append(Finding(level, code, rel, message))

    @property
    def errors(self) -> list[Finding]:
        return [f for f in self.findings if f.level == "error"]

    @property
    def warns(self) -> list[Finding]:
        return [f for f in self.findings if f.level == "warn"]


def _rel(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def load_config() -> dict:
    if not CONFIG.is_file():
        raise SystemExit(f"missing config: {_rel(CONFIG)}")
    data = yaml.safe_load(CONFIG.read_text(encoding="utf-8")) or {}
    if not data.get("docs_root"):
        raise SystemExit(f"docs_root missing in {_rel(CONFIG)}")
    return data


def parse_front_matter(text: str) -> tuple[dict, str]:
    m = FRONT_MATTER_RE.match(text)
    if not m:
        return {}, text
    meta = yaml.safe_load(m.group(1)) or {}
    if not isinstance(meta, dict):
        meta = {}
    return meta, text[m.end() :]


def collect_md_files(docs_root: Path) -> list[Path]:
    return sorted(p for p in docs_root.rglob("*.md") if p.is_file())


def build_stem_index(files: list[Path]) -> dict[str, list[Path]]:
    index: dict[str, list[Path]] = {}
    for p in files:
        index.setdefault(p.stem, []).append(p)
    return index


def wikilink_target(raw: str) -> str:
    """[[path/name|alias]] or [[name]] → stem/name for resolution."""
    inner = raw.strip()
    if "|" in inner:
        inner = inner.split("|", 1)[0].strip()
    # Obsidian may use path; we resolve by final path segment / stem
    inner = inner.replace("\\", "/").rstrip("/")
    name = inner.split("/")[-1]
    if name.endswith(".md"):
        name = name[:-3]
    return name


def section1_statuses(body: str) -> set[str]:
    """Parse ## 1. ... table status cells until next ##."""
    m = re.search(r"^##\s*1\.\s*.+$", body, re.MULTILINE)
    if not m:
        return set()
    rest = body[m.end() :]
    nxt = re.search(r"^##\s+\d+", rest, re.MULTILINE)
    block = rest[: nxt.start()] if nxt else rest
    found: set[str] = set()
    for row in STATUS_CELL_RE.finditer(block):
        found.add(f"状态/{row.group(2).strip()}")
    return found


def is_capability_map(path: Path) -> bool:
    return path.name.startswith("能力底图-") and path.name.endswith(".md")


def is_index_file(path: Path) -> bool:
    return path.name.endswith("索引.md") or path.name in {
        "文档首页.md",
        "能力总览.md",
        "Obsidian使用说明.md",
        "交付说明.md",
        "运维说明.md",
    }


def is_active_scheme(path: Path, docs_root: Path) -> bool:
    try:
        rel = path.resolve().relative_to(docs_root.resolve())
    except ValueError:
        return False
    parts = rel.parts
    if not parts or parts[0] != "方案":
        return False
    if "_archive" in parts:
        return False
    if "切片" in parts:
        return False
    if is_capability_map(path) or is_index_file(path):
        return False
    return True


def is_slice_doc(path: Path, meta: dict) -> bool:
    tags = meta.get("tags") or []
    if isinstance(tags, list) and "切片" in tags:
        return True
    return "切片" in path.parts and path.name.endswith(".md") and "-00-规格" not in path.name


def is_spec_doc(path: Path, meta: dict) -> bool:
    tags = meta.get("tags") or []
    if isinstance(tags, list) and "规格" in tags:
        return True
    return "切片" in path.parts and "-00-规格" in path.name


def check_config_and_themes(cfg: dict, docs_root: Path, report: Report) -> None:
    if not docs_root.is_dir():
        report.add("error", "docs_root", docs_root, "docs_root directory missing")
        return
    for theme in cfg.get("themes") or []:
        if not isinstance(theme, dict):
            continue
        tid = theme.get("id", "?")
        map_name = theme.get("map")
        if not map_name:
            report.add("error", "theme_map", CONFIG, f"theme {tid!r} missing map")
            continue
        # maps live under 方案/<theme_id>/
        candidates = list(docs_root.joinpath("方案").rglob(map_name))
        if not candidates:
            report.add(
                "error",
                "theme_map",
                docs_root / "方案",
                f"theme {tid!r} map not found: {map_name}",
            )


def check_readme_as_map(docs_root: Path, report: Report) -> None:
    for p in (docs_root / "方案").rglob("README.md"):
        if "_archive" in p.parts:
            continue
        report.add("error", "readme_map", p, "capability map must not be named README.md")


def check_active_archive_dupes(docs_root: Path, report: Report) -> None:
    active = docs_root / "方案"
    archived = docs_root / "_archive" / "方案"
    if not active.is_dir() or not archived.is_dir():
        return
    for ap in active.rglob("*.md"):
        if is_capability_map(ap) or is_index_file(ap):
            continue
        try:
            rel = ap.relative_to(active)
        except ValueError:
            continue
        twin = archived / rel
        if twin.is_file():
            report.add(
                "error",
                "active_archive_dupe",
                ap,
                f"same path also in archive: {_rel(twin)} (no_stub)",
            )


def strip_code(text: str) -> str:
    """去掉围栏与行内代码，避免示例链误报。"""
    return INLINE_CODE_RE.sub(" ", FENCE_RE.sub("\n", text))


def in_archive(path: Path, docs_root: Path) -> bool:
    try:
        return "_archive" in path.resolve().relative_to(docs_root.resolve()).parts
    except ValueError:
        return "_archive" in path.parts


def resolve_md_target(path: Path, file_part: str) -> Path | None:
    """相对当前文件，再相对仓库根；文件或目录均算命中。"""
    candidates = [
        (path.parent / file_part).resolve(),
        (ROOT / file_part).resolve(),
    ]
    root = ROOT.resolve()
    for cand in candidates:
        try:
            cand.relative_to(root)
        except ValueError:
            continue
        if cand.exists():
            return cand
    return None


def check_links(
    path: Path,
    text: str,
    stem_index: dict[str, list[Path]],
    docs_root: Path,
    report: Report,
) -> None:
    scan = strip_code(text)
    link_level = "warn" if in_archive(path, docs_root) else "error"

    for m in WIKILINK_RE.finditer(scan):
        raw = m.group(1)
        if r"\|" in raw:
            report.add("warn", "escaped_pipe", path, f"wikilink contains \\|: [[{raw}]]")
            continue
        target = wikilink_target(raw)
        if not target or target in PLACEHOLDER_WIKILINKS:
            continue
        hits = stem_index.get(target, [])
        if not hits:
            report.add(
                link_level,
                "wikilink",
                path,
                f"unresolved wikilink [[{raw}]] → {target}",
            )
        elif len(hits) > 1:
            locs = ", ".join(_rel(h) for h in hits)
            report.add(
                "warn",
                "wikilink_ambiguous",
                path,
                f"ambiguous stem {target!r}: {locs}",
            )

    for m in MD_LINK_RE.finditer(scan):
        href = m.group(2).strip()
        if not href or href.startswith(SKIP_MD_PREFIXES):
            continue
        if href.startswith("<") and href.endswith(">"):
            href = href[1:-1]
        file_part = href.split("#", 1)[0]
        if not file_part or file_part.startswith("/"):
            continue
        hit = resolve_md_target(path, file_part)
        if hit is None:
            report.add(link_level, "md_link", path, f"broken markdown link ({href})")


def check_capability_map_tags(path: Path, meta: dict, body: str, report: Report) -> None:
    tags = meta.get("tags") or []
    if not isinstance(tags, list):
        tags = []
    tag_status = [t for t in tags if isinstance(t, str) and t.startswith("状态/")]
    if tag_status:
        report.add(
            "error",
            "map_status_tag",
            path,
            f"能力底图禁止状态 Tag，请删掉: {tag_status}",
        )
    # §1 字面仍校验枚举（策展表），但不要求 YAML 同步
    section_status = section1_statuses(body)
    allowed_cells = {
        "状态/方案中",
        "状态/已确认",
        "状态/规格中",
        "状态/已拆分",
        "状态/开发中",
        "状态/已开发",
        "状态/验证中",
        "状态/已验证",
        "状态/落地中",
        "状态/已落地",
    }
    bad_cells = section_status - allowed_cells
    for t in sorted(bad_cells):
        report.add("error", "status_tag", path, f"§1 非法状态字面: {t}")


def check_active_scheme(path: Path, meta: dict, body: str, report: Report) -> None:
    if not re.search(r"^##\s*变更记录\s*$", body, re.MULTILINE):
        report.add("error", "change_log", path, "active scheme missing ## 变更记录")
    tags = meta.get("tags") or []
    if not isinstance(tags, list):
        tags = []
    str_tags = [t for t in tags if isinstance(t, str)]
    if "方案" not in str_tags:
        report.add("warn", "scheme_tag", path, "front matter missing tag 方案")
    status = [t for t in str_tags if t.startswith("状态/")]
    if len(status) != 1:
        report.add(
            "warn",
            "scheme_status",
            path,
            f"active scheme should have exactly one 状态/* tag, got {status}",
        )
    elif status[0] not in SCHEME_STATUS_ACTIVE:
        report.add(
            "error",
            "status_tag",
            path,
            f"active scheme status invalid: {status[0]}",
        )
    volumes = [t for t in str_tags if t in VOLUME_TAGS]
    if status and status[0] in SCHEME_NEEDS_VOLUME:
        if len(volumes) != 1:
            report.add(
                "error",
                "volume_tag",
                path,
                f"已确认及之后须有且仅有一个 体量/小|大, got {volumes}",
            )
        elif volumes[0] == "体量/小" and status[0] in ("状态/规格中", "状态/已拆分"):
            report.add(
                "error",
                "status_skip",
                path,
                "体量/小 禁止进入 规格中/已拆分",
            )
        elif volumes[0] == "体量/大" and status[0] == "状态/已开发":
            check_large_scheme_slices_done(path, report)
    if status and status[0] in ("状态/落地中", "状态/已落地"):
        check_scheme_landed_gate(path, body, report)


def scheme_slice_dir(scheme_path: Path) -> Path:
    return scheme_path.parent / "切片" / scheme_path.stem


def check_large_scheme_slices_done(path: Path, report: Report) -> None:
    sdir = scheme_slice_dir(path)
    if not sdir.is_dir():
        report.add(
            "error",
            "status_skip",
            path,
            f"体量/大 已开发但缺少切片目录: {_rel(sdir)}",
        )
        return
    pending: list[str] = []
    found = False
    for sp in sorted(sdir.glob("*.md")):
        try:
            meta, _ = parse_front_matter(sp.read_text(encoding="utf-8"))
        except OSError:
            continue
        if is_spec_doc(sp, meta):
            continue
        if not is_slice_doc(sp, meta):
            continue
        found = True
        tags = meta.get("tags") or []
        st = [t for t in tags if isinstance(t, str) and t.startswith("状态/")]
        if st != ["状态/已验收"]:
            pending.append(f"{sp.name}:{st}")
    if not found:
        report.add(
            "error",
            "status_skip",
            path,
            "体量/大 已开发但切片目录无切片文",
        )
    elif pending:
        report.add(
            "error",
            "status_skip",
            path,
            "体量/大 已开发但尚有未已验收切片: " + ", ".join(pending),
        )


def parse_blocked_by(body: str) -> list[str]:
    stems: list[str] = []
    for line in body.splitlines():
        if "Blocked by" not in line and "blocked by" not in line.lower():
            continue
        for m in WIKILINK_RE.finditer(line):
            stems.append(wikilink_target(m.group(1)))
        break
    return [s for s in stems if s and s not in PLACEHOLDER_WIKILINKS]


def check_slice_doc(path: Path, meta: dict, body: str, report: Report) -> None:
    tags = meta.get("tags") or []
    if not isinstance(tags, list):
        tags = []
    str_tags = [t for t in tags if isinstance(t, str)]
    status = [t for t in str_tags if t.startswith("状态/")]
    if len(status) != 1 or status[0] not in SLICE_STATUS:
        report.add(
            "error",
            "status_tag",
            path,
            f"切片须有且仅有一个状态 待开发|开发中|待验收|已验收, got {status}",
        )
    if status and status[0] == "状态/待验收":
        has_demo = bool(re.search(r"Demo\s*步骤|###\s*Demo", body, re.I))
        has_self = bool(re.search(r"自测摘要", body))
        if not has_demo or not has_self:
            report.add(
                "error",
                "slice_handoff",
                path,
                "待验收须含 Demo 步骤与自测摘要",
            )


def check_slice_dags(docs_root: Path, report: Report) -> None:
    """按切片/<方案stem>/ 目录检测 Blocked by 成环与断链。"""
    scheme_root = docs_root / "方案"
    if not scheme_root.is_dir():
        return
    for slice_root in scheme_root.rglob("切片"):
        if not slice_root.is_dir() or "_archive" in slice_root.parts:
            continue
        for stem_dir in sorted(p for p in slice_root.iterdir() if p.is_dir()):
            nodes: dict[str, Path] = {}
            edges: dict[str, list[str]] = {}
            for sp in sorted(stem_dir.glob("*.md")):
                try:
                    meta, body = parse_front_matter(sp.read_text(encoding="utf-8"))
                except OSError:
                    continue
                if is_spec_doc(sp, meta) or not is_slice_doc(sp, meta):
                    continue
                nodes[sp.stem] = sp
                edges[sp.stem] = parse_blocked_by(body)
            for src, deps in edges.items():
                for dep in deps:
                    if dep not in nodes:
                        report.add(
                            "error",
                            "slice_blocker",
                            nodes[src],
                            f"Blocked by 引用不存在的切片: {dep}",
                        )
            # cycle detect
            WHITE, GRAY, BLACK = 0, 1, 2
            color = {n: WHITE for n in nodes}

            def dfs(u: str, stack: list[str]) -> bool:
                color[u] = GRAY
                stack.append(u)
                for v in edges.get(u, []):
                    if v not in nodes:
                        continue
                    if color[v] == GRAY:
                        report.add(
                            "error",
                            "slice_cycle",
                            nodes[u],
                            f"Blocked by 成环: {' → '.join(stack + [v])}",
                        )
                        return True
                    if color[v] == WHITE and dfs(v, stack):
                        return True
                stack.pop()
                color[u] = BLACK
                return False

            for n in nodes:
                if color[n] == WHITE:
                    dfs(n, [])


def check_scheme_landed_gate(path: Path, body: str, report: Report) -> None:
    """落地中/已落地 须过验证门：关联测试不得仍为测试中；须有已验证或明示免测。"""
    stems: list[str] = []
    for m in WIKILINK_RE.finditer(strip_code(body)):
        raw = m.group(1).split("|", 1)[0].strip()
        name = Path(raw).name if "/" in raw else raw
        if name.startswith("测试-"):
            stems.append(name)

    docs_root = path.parent
    for parent in path.parents:
        if (parent / "测试").is_dir() and (parent / "方案").is_dir():
            docs_root = parent
            break
    test_root = docs_root / "测试"
    test_files: list[Path] = []
    if test_root.is_dir():
        by_stem = {p.stem: p for p in test_root.rglob("*.md")}
        for stem in stems:
            if stem in by_stem:
                test_files.append(by_stem[stem])

    has_verified = False
    has_testing = False
    for tf in test_files:
        try:
            tmeta, tbody = parse_front_matter(tf.read_text(encoding="utf-8"))
        except OSError:
            continue
        ttags = tmeta.get("tags") or []
        if not isinstance(ttags, list):
            ttags = []
        st = [t for t in ttags if isinstance(t, str) and t.startswith("状态/")]
        if "状态/已验证" in st:
            has_verified = True
        if "状态/测试中" in st:
            has_testing = True

    if has_testing and not has_verified:
        report.add(
            "error",
            "status_skip",
            path,
            "方案为落地中/已落地，但关联测试文仍为测试中（禁止跳过验证门）",
        )
    elif test_files and not has_verified:
        report.add(
            "error",
            "status_skip",
            path,
            "方案为落地中/已落地，但关联测试文均未已验证（禁止跳过验证门）",
        )
    elif not test_files and not re.search(r"免测", body):
        report.add(
            "error",
            "status_skip",
            path,
            "方案为落地中/已落地但未链到已验证测试文，且正文未写免测（禁止跳过验证门）",
        )


def check_archived_scheme(path: Path, meta: dict, report: Report) -> None:
    tags = meta.get("tags") or []
    if not isinstance(tags, list):
        return
    str_tags = [t for t in tags if isinstance(t, str)]
    if "方案" not in str_tags:
        return
    status = [t for t in str_tags if t.startswith("状态/")]
    if status and status != ["状态/已归档"]:
        report.add(
            "error",
            "status_tag",
            path,
            f"archived scheme must use 状态/已归档, got {status}",
        )


def check_test_doc(path: Path, meta: dict, report: Report) -> None:
    tags = meta.get("tags") or []
    if not isinstance(tags, list):
        tags = []
    str_tags = [t for t in tags if isinstance(t, str)]
    if "测试" not in str_tags and not path.name.startswith("测试-"):
        return
    status = [t for t in str_tags if t.startswith("状态/")]
    if not status:
        report.add("warn", "test_status", path, "test doc missing 状态/测试中|已验证")
    elif len(status) != 1 or status[0] not in TEST_STATUS:
        report.add(
            "error",
            "status_tag",
            path,
            f"test doc status must be 测试中|已验证, got {status}",
        )


def check_escaped_pipes(path: Path, text: str, report: Report) -> None:
    if r"\|" in strip_code(text):
        report.add("warn", "escaped_pipe", path, r"file contains literal \| (may break wikilinks)")


def run(docs_root: Path, cfg: dict) -> Report:
    report = Report()
    check_config_and_themes(cfg, docs_root, report)
    if not docs_root.is_dir():
        return report

    check_readme_as_map(docs_root, report)
    check_active_archive_dupes(docs_root, report)

    files = collect_md_files(docs_root)
    stem_index = build_stem_index(files)

    for path in files:
        text = path.read_text(encoding="utf-8")
        meta, body = parse_front_matter(text)
        check_links(path, text, stem_index, docs_root, report)
        check_escaped_pipes(path, text, report)
        if is_capability_map(path):
            check_capability_map_tags(path, meta, body, report)
        if is_active_scheme(path, docs_root):
            check_active_scheme(path, meta, body, report)
        if is_slice_doc(path, meta):
            check_slice_doc(path, meta, body, report)
        if in_archive(path, docs_root) and path.name.endswith(".md"):
            try:
                rel = path.resolve().relative_to((docs_root / "_archive" / "方案").resolve())
                if rel.parts:
                    check_archived_scheme(path, meta, report)
            except ValueError:
                pass
        if path.name.startswith("测试-") or (
            isinstance(meta.get("tags"), list) and "测试" in meta.get("tags", [])
        ):
            check_test_doc(path, meta, report)

    check_slice_dags(docs_root, report)

    return report


def print_human(report: Report) -> None:
    if not report.findings:
        print("capmap-lint: OK (0 findings)")
        return
    for f in report.findings:
        print(f"[{f.level.upper()}] {f.code}: {f.path}: {f.message}")
    print(
        f"\ncapmap-lint: {len(report.errors)} error(s), {len(report.warns)} warn(s)"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Lint docs_root capability vault")
    parser.add_argument("--json", action="store_true", help="machine-readable output")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="treat warnings as failures (exit 1)",
    )
    args = parser.parse_args()

    cfg = load_config()
    docs_root = ROOT / str(cfg["docs_root"])
    report = run(docs_root, cfg)

    if args.json:
        print(
            json.dumps(
                {
                    "docs_root": _rel(docs_root),
                    "errors": len(report.errors),
                    "warns": len(report.warns),
                    "findings": [asdict(f) for f in report.findings],
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    else:
        print_human(report)

    if report.errors:
        return 1
    if args.strict and report.warns:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
