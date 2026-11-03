# Corrective default-branch release — 3 November 2026

Owner explicitly authorised promotion after clients received the repository URL.
Before correction, remote HEAD was main at 25a6ee94; blank-branch installation
therefore acquired the older plugin. That build had the character sidebar icon,
generic listing, old Premium CTA, exact-name-only Blaze recognition and omitted
the card model configuration when hiring. It could also fall back to another
local provider. Existing clients' installed version/provider/model cannot be
inferred from the URL alone and has not been modified by this release.

The reviewed dist is the tested prepared build: BB sidebar, BRAVE listing,
description and getting-started guide, Premium disclosure, recognised legacy Blaze
name, visible hiring errors and Claude/model-preserving recruitment.
No training host, agent card, agent instructions or membership links changed.
Manifest ID, page ID, local storage key and declared host access stay unchanged.

Validation: 24 generated-plugin lifecycle tests pass, including replacement of the
actual 25a6ee94 plugin by this build with customised existing Simon and Blaze
records and saved access. No import call occurs during replacement; records remain
identical. This uses simulated Buzz services, not a new end-to-end native client
update. Earlier native Mac update/access checks stand for this runtime.

Buzz's documented update-in-place operation preserves enabled state and rollback
history; agent/chat data are separate from the recruiting plugin artifact. Git
installs use explicit Check for updates / Update from the remembered source.
Do not instruct clients to delete/reinstall or rehire. This release does not
automatically alter models/instructions of employees created by the older build.

The repository default is the member route; leave Branch or tag blank.
Prepared branch remains compatible for users who entered it.
