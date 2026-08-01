#!/usr/bin/env python3
"""Parse spec JSON into a clean readable markdown file for analysis."""
import json
import os

INPUT = "/home/z/my-project/scripts/spec_text.json"
OUTPUT = "/home/z/my-project/scripts/spec_full.md"

with open(INPUT, "r", encoding="utf-8") as f:
    data = json.load(f)

pages = data["data"]["pages"]
out_lines = []
for p in pages:
    out_lines.append(f"\n\n=== PAGE {p['page']} ===\n")
    out_lines.append(p["text"])

os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write("".join(out_lines))

print(f"Wrote {OUTPUT} ({sum(p['chars'] for p in pages)} chars, {len(pages)} pages)")
