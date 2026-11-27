# Public responsive layout release — 27 November 2026

Luke authorised bringing the smaller-screen layout into the public plugin,
testing it and publishing it. Based on public main 710dd0d; selectively ports
bf5e50b's layout and matching tile interaction, without its separate hire-name
change or the pilot's server/native-desktop dependencies.

## Behaviour

The house and hiring meter remain visible at every width. The house sits beside
the three-column crew above 640px; the house and crew stack at 640px and below;
the crew uses two columns at 420px and below. Every tile opens its detail card
before hiring, including narrow panels. Access-link controls wrap on small panels.
Existing employees, prompts, model defaults, memberships and plugin permissions
are unchanged. Artwork URLs retain the existing pinned CDN source.

## Verification

- Before publication, public raw dist/plugin.js matched main byte for byte:
  SHA-256 492c9403fc4316a2424bc3b7bd8bfd68eb92f955d4df35333038882f35183a2e.
- Build: python3 tools/build.py https://cdn.jsdelivr.net/gh/lukesbrave/bravebrand-buzz-team@b75b28950e18c347460c213bf5ef2bbac05bcf35/assets
- npm test: 32/32 passing against the generated module; simulated Buzz/network
  services cover both widths, Standard/Premium, Claude/Goose/Codex, upgrades,
  failures/retry, duplicate prevention and existing-agent preservation.
- tools/layout.test.mjs: 40/40 passed in Chromium and WebKit, 320–1300px plugin widths inside
  a 1500px window, locked/unlocked. Checks columns, visible house/meter,
  stacking, no horizontal overflow, tile opens details without hiring.
  Playwright can be supplied using PLAYWRIGHT_MODULE, CHROMIUM_EXECUTABLE and
  WEBKIT_EXECUTABLE environment variables.
- Browser checks use simulated membership and agent services, with live artwork.
  This is not a native Buzz installation or a real member hire.

## Pilot changes still outside public main

All other remote branches are ancestors of public main except
codex/client-vps-hiring. Its remaining work is:

- bf5e50b (remaining part): add a role to a first-name-only hire, particularly
  Fred → Fred (Graphic Designer), while recognising both existing names.
  This is a plausible general-public follow-up; not required for layout.
- 934fc81, 010b723, a27da0c, c5929b3: paired VPS Claude hiring, native icon,
  model discovery/settings, and choosing a hosted model before hiring.
- 151727d: native agent-card dialog, model-family menu and shared Save controls.
  Requires the BraveBrand desktop fork's injected bravebrandAgentControls API;
  cannot safely be merged wholesale into the general Buzz plugin.
- a5ccca8: configured Goose on a paired VPS using native hiring controls.
- a3ea560: a local counterpart for a VPS agent, with separate identity.
- 1f8babe, e2a3a30: location-first hiring; recommend This computer and explain
  remote-server file access through floating help.
- 5a69709: member-owned server Codex agent type via SSH/workrooms bridge.
  Its commit explicitly says it has not run against a real server or in the app.

These were prepared for Workrooms/VPS, not proven drop-in updates for ordinary
Buzz clients. The layout and Fred naming are the clear standalone general-client
improvements. Other promotion intent should not be inferred from branch age.

Generated plugin SHA-256: `850d63ed641360a83cc18350c39bc5b8ffb563428539c3ed02a81cda3f50809b`.

## Publication receipt

Published from the clean main checkout on 27 November 2026, commit
`0d89aa6e73889fe4ca776a640a663929453d7b7d`, on Luke’s explicit instruction.
A fresh public Git clone with no branch specified returned this commit and all
four dist files matched the tested release byte for byte. The immutable raw
plugin matched too. The raw main URL briefly retained the previous CDN-cached
copy immediately after pushing; Git installation delivered the correct release.
Existing clients use Check for updates → Update; fresh default installs get it.
