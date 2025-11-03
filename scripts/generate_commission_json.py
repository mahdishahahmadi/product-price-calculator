#!/usr/bin/env python3
import csv
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "commission.csv"
OUT_DIR = ROOT / "src" / "data"
OUT_PATH = OUT_DIR / "commission_data.json"
OUT_JS_PATH = OUT_DIR / "commission_data.js"

def normalize_header(h: str) -> str:
    return (h or "").replace("\n", " ").replace("\r", " ").strip()

def parse_percent(p: str) -> float:
    if p is None:
        return 0.0
    s = str(p).strip().replace('%', '').replace('\u200f', '').replace('\u200e', '')
    if not s:
        return 0.0
    try:
        return float(s) / 100.0
    except ValueError:
        # Try with comma decimal (just in case)
        try:
            return float(s.replace(',', '.')) / 100.0
        except Exception:
            return 0.0

def main():
    if not CSV_PATH.exists():
        raise SystemExit(f"CSV not found: {CSV_PATH}")

    with open(CSV_PATH, 'r', encoding='utf-8', newline='') as f:
        reader = csv.reader(f)
        try:
            header = next(reader)
        except StopIteration:
            raise SystemExit("CSV is empty")

        header = [normalize_header(h) for h in header]

        # Expected columns (flexible on whitespace/newlines in Persian headers)
        # We'll map by position to be robust: [lvl1, lvl2, lvl3, retail, wholesale]
        if len(header) < 5:
            # Attempt to recover by reading additional rows until we have at least 5 columns in header
            # In case the header spanned multiple physical lines (quoted newlines), csv should have handled it,
            # but as a fallback we concatenate subsequent rows until >=5
            while len(header) < 5:
                try:
                    nxt = next(reader)
                except StopIteration:
                    break
                header += [normalize_header(x) for x in nxt]

        data = {}
        for row in reader:
            if not row:
                continue
            # Some CSVs may have stray CR characters; strip each cell
            row = [ (c or '').strip() for c in row ]
            if len(row) < 5:
                # Skip malformed rows
                continue
            lvl3 = row[2]
            retail = row[3]
            wholesale = row[4] if len(row) > 4 else None
            # Use third-level category as key
            if not lvl3:
                continue
            rate_retail = parse_percent(retail)
            rate_wholesale = parse_percent(wholesale)
            data[lvl3] = {
                "retail": rate_retail,
                "wholesale": rate_wholesale,
            }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8') as out:
        json.dump(data, out, ensure_ascii=False, indent=2)
    # Also emit an ES module for direct import in browser (no fetch needed)
    with open(OUT_JS_PATH, 'w', encoding='utf-8') as jsout:
        jsout.write("export default ")
        json.dump(data, jsout, ensure_ascii=False, indent=2)
        jsout.write(";\n")

    print(f"Wrote {len(data)} categories to {OUT_PATH} and {OUT_JS_PATH}")

if __name__ == '__main__':
    main()
