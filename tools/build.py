#!/usr/bin/env python3
"""Builds dist/plugin.js from tools/plugin.template.js.

The team sheet CSS (tools/sheet.source.css, copied from home.bravebrand.com's
index.html) is adapted to live in a shadow root inside a Buzz page; fonts are
embedded because Buzz loads no web fonts.
Usage: tools/build.py <assets-base-url>
"""
import base64, io, json, pathlib, re, sys
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
FONTS = pathlib.Path.home() / ".buzz/.scratch/fonts"
STILL = pathlib.Path.home() / ".buzz/REPOS/auto-agency-buzz/premium-skills/host/public/art/crew/architect.png"
assets = sys.argv[1].rstrip("/")

css = (HERE / "sheet.source.css").read_text()
css = re.sub(r"@font-face\{[^}]*\}", "", css)
css = css.replace(":root{", ".bb-root{")
css = css.replace("body{margin:0;background:#fff;",
                  "body{margin:0;background:#fff;")  # anchor check below
assert "body{margin:0;background:#fff;" in css
css = css.replace("body{margin:0;background:#fff;",
                  ".bb-root{position:relative;height:100%;overflow:hidden;"
                  "container:bb/inline-size;margin:0;background:#fff;")
css = css.replace("100vh", "var(--bbvh,100vh)")
css = re.sub(r"\bvideo\b", ".anim", css)
css = css.replace("#spotlight{position:fixed", "#spotlight{position:absolute")
css = css.replace("#confetti{position:fixed", "#confetti{position:absolute")
css = css.replace("@media(max-width:1100px)", "@container bb (max-width:1100px)")
css = css.replace("@media(max-width:760px)", "@container bb (max-width:760px)")
css += """
  .bb-scroll{height:100%;overflow:auto}
  .anim:not([src]){visibility:hidden}
  #gate{display:flex;gap:8px;align-items:center}
  #gate[hidden]{display:none}
  #gate input{width:min(380px,42vw);height:34px;padding:0 12px;border-radius:99px;
    border:1.5px solid var(--gray30);font:500 13px "Teachers",sans-serif;color:var(--ink)}
  #gate input:focus{outline:none;border-color:var(--ink)}
  #gate button{height:34px;padding:0 16px;border:0;border-radius:99px;background:var(--green);
    color:#fff;font:600 13px "Teachers",sans-serif;cursor:pointer}
"""
for token in ("100vh)", "position:fixed", "@media(max-width"):
    assert token not in css.replace("var(--bbvh,100vh)", ""), token

fonts = []
for family, weight, name in [
    ("Teachers", "400 600", "Teachers-400.woff2"),
    ("Inter Tight", "600", "InterTight-600.woff2"),
    ("Roboto", "700", "Roboto-700.woff2"),
    ("TXC Pearl", "400", "txc-pearl.woff2"),
]:
    fonts.append([family, weight, base64.b64encode((FONTS / name).read_bytes()).decode()])

icon = Image.open(STILL).convert("RGBA").resize((64, 64), Image.LANCZOS)
buf = io.BytesIO(); icon.save(buf, "PNG")
icon_url = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

out = (HERE / "plugin.template.js").read_text()
for marker, value in [('"/*ASSETS*/"', json.dumps(assets)), ('/*CSS*/""', json.dumps(css)),
                      ("/*FONTS*/[]", json.dumps(fonts)), ('"/*ICON*/"', json.dumps(icon_url))]:
    assert marker in out, marker
    out = out.replace(marker, value)
(ROOT / "dist").mkdir(exist_ok=True)
(ROOT / "dist" / "plugin.js").write_text(out)
print("dist/plugin.js", len(out.encode()), "bytes; assets", assets)
