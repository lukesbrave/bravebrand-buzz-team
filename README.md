# BraveBrand Team (Buzz plugin)

Hires BraveBrand employees into the selected Buzz community. The member pastes
their BraveBrand access link once (home.bravebrand.com/<tier>/); the plugin reads
membership.json, each pack manifest and card live from that tier, and creates the
agent with `agents.port({source: "shared"})`: name, public avatar from /art, and the
card's full instructions. Packs outside the tier show as "Included with Premium".

Install (desktop): Settings → Plugins → Manage plugins → choose folder → `dist/`, then enable.
No build step: `dist/plugin.js` is a hand-written API v1 module.
