# Restore default hiring — 27 November 2026

Luke requested removing the extra model-selection step while retaining Fred's
full name, the smaller-screen layout, and ordinary Buzz/Workrooms compatibility.
This supersedes the review-form behaviour in COMPATIBILITY-2026-11-27.md.

The detail card's hire action again imports directly. Claude uses the model
specified by the hosted agent card, preserving its other provider defaults;
Goose/Codex retain their configured defaults. No additional review/model dialog
opens. Existing choice between configured agent tools is unchanged. Fred hires
as Fred (Graphic Designer); existing identities remain recognised. No server
choice, private Workrooms injection or new permission was added.

The generated module is byte-identical to the previous Fred/layout release
at 2fe1cb3, with no changes to the responsive CSS, build script, manifest or icon.
The cross-app activation/runtime checks added since then remain in the suite.

Executed checks on final files:
- Build with tools/build.py and the unchanged pinned b75b289 assets URL.
- npm test: 36/36 passed; exact instructions/model/defaults, memberships,
  Fred recognition, duplicate suppression, failures/retry and real Cordis
  activation with/without the Workrooms-only service. Explicit regression:
  available provider model controls are not rendered during hiring.
- DESKTOP_SOURCE=<Workrooms desktop checkout> node --test tools/runtime-compat.test.mjs:
  4/4 passed against upstream Buzz v1.0.6 and Workrooms runtime source; public
  module activates in both, private pilot dependency reproduces the old timeout.
- tools/default-hiring-browser.test.mjs: 12/12 Chromium/WebKit cases passed,
  320/400/900px, light/dark. Direct hire, no extra dialog/model picker, exact
  instructions/default model, and no duplicate import.
- Tests use simulated membership/provider services; no native member hire.

Generated plugin SHA-256:
7b57a4cc42514fb4d73eb1b381bf1a3f826269177fd4adecf5f58510f8dd3ee0

Client route remains the same repository, default/main branch, dist folder.
Existing main installs: Check for updates → Update.
