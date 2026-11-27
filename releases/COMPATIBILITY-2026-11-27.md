# One Team plugin for Buzz and Workrooms — 27 November 2026

Luke reported `Plugin activation timed out` when testing the pilot in ordinary
Buzz and required the plugin to work in both ordinary Buzz and Workrooms. This
release supersedes the pending compatibility decision in HIRING-2026-11-27.md.

## Cause and fix

The pilot declares `bravebrandAgentControls` as a required injected service.
Only the custom self-hosted Workrooms build provides it, so ordinary Buzz waits
until activation times out. The public plugin requires only the four shared
services: react, pages, agents and host.

The public plugin now owns one hiring-review form for both apps, embedding the
provider's public `CreateConfiguration` or `CreateModel` controls. It does not
import the private Workrooms AgentCreateDialog. The provider supplies available
models and readiness; the plugin does not invent model names. Older providers
without creation controls retain their configured defaults and explain that
models can be changed in the agent settings after hiring.

A hire requires explicit confirmation. Cancel and page disposal create nothing.
Selection preserves provider defaults and the hosted training instructions;
access/provider availability and duplicate status are rechecked before import.
The review blocks while a provider configuration is not ready. Fred full naming
and the responsive layout remain. No computer/server chooser, floating VPS help,
server provisioning, new network origins or new plugin permissions are included.

## Executed verification

- `python3 tools/build.py https://cdn.jsdelivr.net/gh/lukesbrave/bravebrand-buzz-team@b75b28950e18c347460c213bf5ef2bbac05bcf35/assets`
- `npm test`: 41/41 passed (generated artifact; real Cordis 4.0.2 activation;
  real React with simulated Buzz/provider/network services; normal and narrow
  hiring, model changes, configured defaults, exact training, cancel/retry,
  readiness, provider removal, unmount, duplicate and membership protections).
- `DESKTOP_SOURCE=<Workrooms desktop checkout> node --test tools/runtime-compat.test.mjs`:
  4/4 passed. Executes the real upstream Buzz v1.0.6 and Workrooms plugin-runtime
  source. The private dependency reproduces the exact activation-timeout error
  on ordinary Buzz; the public artifact activates in both runtimes.
- `node tools/review-browser.test.mjs` with PLAYWRIGHT_MODULE and browser
  executable paths: 12/12 passed in Chromium and WebKit, 320/400/900px, light
  and dark. Real React and generated plugin; simulated model picker. Selection,
  cancel/reopen, confirmation, viewport bounds and exact training verified.
- Native app inspection found the owner actively using Buzz, so no restart,
  native plugin replacement or real member hire was performed in that session.

Generated plugin SHA-256:
`3c5c5f9b5dedb793c41dcd2ac49dad512734854e6152f370c4e8f5bc9525a94c`.

## Client route

Use https://github.com/lukesbrave/bravebrand-buzz-team with Branch or tag blank
(or `main`), and select `dist` in either app. Existing main installs use Check
for updates → Update. A test install pinned to `codex/client-vps-hiring` must
switch its source to main; checking for updates on that pilot branch will not
select the public release. Preserve the existing plugin identity, access and
employees. The server pilot remains an engineering branch, not the client route.
