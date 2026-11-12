# ADR 0005: Shared Apps Script library with thin per-site bound scripts

**Status:** Accepted, 2026-11-11

## Context
One site at launch, possibly more later. Each Site Sheet is a copy of the template
(ADR 0001). A fix should not need hand-editing in every copy.

## Decision
- All business logic lives in **one standalone Apps Script library project**.
- Each Site Sheet's bound script is a **thin shell**. It holds the trigger handlers
  and menu entry points (`onOpen`, installable on-edit, the time-driven poller), and
  each one delegates to the library.
- Site Sheets pin a **numbered library version**, not development mode, so a
  half-finished change can't break a live site. Upgrading means bumping the
  version number in each shell.
- The git repo stays the source of truth. Code is pushed to the library project
  (likely with `clasp`, to be confirmed).

## Verified facts (Google Apps Script docs, via Context7, 2026-11-11)
- "A script that uses a library doesn't run as quickly as it would if all the code
  were contained within a single script project." Startup cost is most noticeable
  with HTML-service UIs that make many `google.script.run` calls.
  (developers.google.com/apps-script/guides/libraries; …/support/best-practices)
- "To use a library, you must have at least view permissions for its Apps Script
  project." (…/quickstart/library)
- Head deployment (development mode) is usable only by people with **editor**
  access to the library. (…/guides/libraries)

## Unverified (from training; check before building)
- Installable triggers are probably **not** carried over when a spreadsheet is
  copied, so each new site needs a one-time "Install triggers" step.
- Simple triggers (`onOpen`, `onEdit`) must be defined in the bound script. A
  library can't register them for the container.

## Consequences
- + One place to fix bugs. Upgrades are deliberate, one site at a time.
- − Slower script startup. Fine for menu actions and background triggers, but
  avoid chatty sidebars or dialogs.
- − Everyone who triggers script code needs view access to the library project.
  Easy to forget when onboarding someone new.
- **Alternative considered:** no library. Use `clasp` to push identical code
  straight into each site's bound script. No runtime cost, but each site needs a
  push per release (scriptable). This is arguably simpler at 1–3 sites.
