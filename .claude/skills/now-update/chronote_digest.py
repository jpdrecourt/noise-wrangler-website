#!/usr/bin/env python
"""Chronote digest: dump every dated chronological-note entry since a cutoff.

Coverage guarantee for the Now-page update: nothing recent stays hidden.
Deterministic — no semantic search, just a date-header scan over the vault.

    python chronote_digest.py --since 2026-03-01
"""
import argparse
import re
import sys
from datetime import date
from pathlib import Path

# Vault notes hold em-dashes and Japanese (疎密); force UTF-8 so redirects on
# Windows (cp1252 default) don't crash mid-print.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except AttributeError:  # pragma: no cover  (Python < 3.7)
    pass

DEFAULT_VAULT = r"C:\Users\jpdre\Documents\Obsidian\Notes"
# Matches "## 2026/07/08" and "## 2026/07/08 - Some Title"
ENTRY_RE = re.compile(r"^##\s+(\d{4})/(\d{2})/(\d{2})\b(.*)$")
CHRONO_RE = re.compile(r"^#\s+Chronological notes\s*$", re.IGNORECASE)
HEADING_RE = re.compile(r"^#{1,2}\s")  # any H1 or H2 ends an entry


def parse_since(s: str) -> date:
    y, m, d = re.split(r"[-/]", s.strip())
    return date(int(y), int(m), int(d))


def entries_in_file(path: Path, since: date):
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    # Find the "# Chronological notes" section; skip files without one.
    start = next((i for i, ln in enumerate(lines) if CHRONO_RE.match(ln)), None)
    if start is None:
        return []
    out, i, n = [], start + 1, len(lines)
    while i < n:
        m = ENTRY_RE.match(lines[i])
        if not m:
            i += 1
            continue
        y, mo, d, tail = m.groups()
        try:
            dt = date(int(y), int(mo), int(d))
        except ValueError:
            i += 1
            continue
        body, j = [lines[i]], i + 1
        while j < n and not HEADING_RE.match(lines[j]):
            body.append(lines[j])
            j += 1
        if dt >= since:
            out.append((dt, "\n".join(body).rstrip()))
        i = j
    return out


def main():
    ap = argparse.ArgumentParser(description="Dump chronote entries since a cutoff, newest first.")
    ap.add_argument("--since", required=True, help="cutoff date YYYY-MM-DD or YYYY/MM/DD (inclusive)")
    ap.add_argument("--vault", default=DEFAULT_VAULT, help="vault root")
    ap.add_argument("--scope", default="Projects", help="subdir under vault to scan")
    args = ap.parse_args()

    since = parse_since(args.since)
    root = Path(args.vault) / args.scope
    by_note = {}  # note_rel_path -> list[(dt, body)]
    total = 0
    for md in sorted(root.rglob("*.md")):
        found = entries_in_file(md, since)
        if found:
            note = md.relative_to(Path(args.vault)).as_posix()
            by_note[note] = sorted(found, key=lambda t: t[0], reverse=True)
            total += len(found)

    # Notes ordered by their most-recent entry, newest first.
    notes = sorted(by_note, key=lambda n: by_note[n][0][0], reverse=True)

    print(f"# Chronote digest — {total} entries across {len(notes)} notes "
          f"since {since.isoformat()} ({args.scope}/)\n")
    for note in notes:
        newest = by_note[note][0][0].isoformat()
        print(f"\n{'=' * 78}\n## SOURCE: {note}  (latest {newest})\n{'=' * 78}")
        for _dt, body in by_note[note]:
            print(f"\n{body}\n")


if __name__ == "__main__":
    main()
