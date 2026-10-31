# Hiring corrections — 2026-10-31 (unpublished)

Based on GitHub main 25a6ee9. No working Buzz plugin installation or training-host
publication. Simon's card, prompt and training archive are unchanged.

Changes in `tools/plugin.template.js`, rebuilt through `tools/build.py`:

- Require an available local Claude type; do not silently recruit into Codex or a
  remote runtime when Claude is absent.
- Forward the card's model through `agents.port({config: {...type.defaults().config, model}})`. The old direct
  JSON card already specifies Opus. Preserve the Claude type’s workspace/session defaults: Buzz replaces the config
  object rather than merging it. Instructions still pass byte-for-byte.
- Open the existing spotlight for a failed hire on narrow screens, displaying the
  error and a working retry button. Wide-screen behaviour is preserved.
- Retain main's existing network retry/saved-link protection and inline unlock.
  These were already fixed on GitHub but absent from Luke's installed artifact.

Verified the `config` import and Claude adoption contract against the exact Beta
preview.185.1 source commit 63eeeea786716b564a83e431a5e61a7cb3d97988, not only the
newer source checkout. Native persistence still needs the isolated desktop test.

## Executed checks

`npm install --ignore-scripts --no-audit --no-fund` then `npm test` runs 15 focused tests using the generated
plugin, real React mounting and Happy DOM. Agent creation and network responses
are test doubles; these are not native integration claims.

- Original 25a6ee9 artifact: 6 pass, 9 fail against the corrected expectations.
- Corrected generated artifact: 15 pass, 0 fail (2026-10-31).
- Matrix: standard/premium and narrow/wide imports; exact prompt and Opus config;
  duplicate suppression; absent Claude, Codex-only and remote-only refusal;
  visible import failure/retry; offline retries/link retention; refused-link reset.
- Build: `python3.14 tools/build.py` with the unchanged assets URL from the prior
  generated artifact. No new asset publication needed.

The isolated Docker desktop and current-starter build rehearsal is maintained in
Auto Agency's `codex/fresh-hire-rehearsal-2026-10-31`, `tools/fresh-hire-lab/`.
Its report must distinguish Linux native proof from macOS acceptance and a
verified read-only training mirror from a new live membership integration.

Before member rollout: complete the desktop rehearsal, review its findings and
get Luke's explicit publication instruction. This branch does not update any
member's existing employee or the plugin already installed on Luke's Mac.
