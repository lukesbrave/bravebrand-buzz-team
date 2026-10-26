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

## Status and handoff (2026-10-26)

Owner: Simon (Digital Home Manager), Luke's DM. Plan: `~/.buzz/PLANS/AGENT_DELIVERY_NEW_BUZZ.md`.

- Access: two shared tier links (premium `fc09684346e76ccf6348910f`, standard
  `c0c633138056fefc3a115d9b`), same model as the home.bravebrand.com team sheet.
  Unlock happens in the header or inside the spotlight; network failures retry and
  never clear a saved link; only a refused link is cleared.
- Hired = an agent with the employee's exact name in the selected community.
- Verified in Playwright WebKit under Buzz's CSP (fonts, loops, tiers, hire). Luke is
  testing in Buzz 2 preview from the Desktop copy `~/Desktop/BraveBrand Team plugin`.
- Next: per-member entitlement (Skool/Stripe via Digital Home backend), update flow
  for already-hired employees, retire the team sheet page.
- Separate work in flight elsewhere: `bravebrand.digital-home-hub` plugin at
  `~/Projects/Auto Agency/.worktrees/digital-home-hub-2026-10-23/plugins/digital-home-hub`.
