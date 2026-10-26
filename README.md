# BraveBrand Team (Buzz plugin)

The home.bravebrand.com team sheet, rebuilt as a Buzz page: the house with lit
rooms, hover loops, spotlight, hiring track and confetti. **Employ Me** creates the
employee in the selected Buzz community from the card in the member's tier.

Install in Buzz desktop: Settings → Plugins → Manage plugins → add from repository
`https://github.com/lukesbrave/bravebrand-buzz-team`, choose `dist`, then switch it on.
Members paste their BraveBrand access link once.

- `dist/` is the built plugin (manifest.json + plugin.js). Do not edit by hand.
- `tools/plugin.template.js` + `tools/sheet.source.css` are the sources; rebuild with
  `python3 tools/build.py https://cdn.jsdelivr.net/gh/lukesbrave/bravebrand-buzz-team@<commit>/assets`.
- `assets/loops/*.webp` are the character loops as animated WebP with alpha (Buzz
  plays no website video). Fonts are embedded because Buzz loads no web fonts.
