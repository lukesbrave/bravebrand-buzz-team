#!/usr/bin/env python3
"""Package only the verified plugin files; never include repository/private files."""
from pathlib import Path
import hashlib, json, subprocess, zipfile

root = Path(__file__).resolve().parent.parent
revision = "dcbf8bd"
names = ("manifest.json", "plugin.js")
payload = {}
for name in names:
    data = (root / "dist" / name).read_bytes()
    expected = subprocess.check_output(["git", "show", f"{revision}:dist/{name}"], cwd=root)
    if data != expected:
        raise SystemExit(f"{name} differs from the approved recording candidate")
    payload[f"BraveBrand Team/{name}"] = data
payload["START HERE.txt"] = (root / "releases" / "START-HERE.txt").read_bytes()
out = root / "releases" / "BraveBrand-Team-2026-11-02.zip"
with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for name, data in payload.items():
        info = zipfile.ZipInfo(name, date_time=(2026, 11, 2, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, data)
with zipfile.ZipFile(out) as archive:
    assert archive.testzip() is None
    assert set(archive.namelist()) == set(payload)
    for name, data in payload.items():
        assert archive.read(name) == data
receipt = {
    "source_revision": revision,
    "status": "prepared, not published",
    "archive": out.name,
    "sha256": hashlib.sha256(out.read_bytes()).hexdigest(),
    "files": {name: hashlib.sha256(data).hexdigest() for name, data in payload.items()},
    "contains_access_links": False,
    "training_changes": False,
    "format": "unzip, then import BraveBrand Team folder into Buzz",
}
(root / "releases" / "DOWNLOAD-RECEIPT.json").write_text(json.dumps(receipt, indent=2) + "\n")
print(f"Verified {out.name}: {len(payload)} files, {out.stat().st_size} bytes")
