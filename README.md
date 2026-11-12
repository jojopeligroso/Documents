# Access Card Management

A Google Sheets + Apps Script template for managing a site's pool of reusable
access cards: request → approval → encoding → issue → (daily check-out/in for
contractors) → return, with extensions, reminders, and notifications via Gmail
and a Google Chat admin space.

One copy of the Sheet per site/office. Not an org-wide system.

**Status:** specification v1.0 and implementation plan complete. Core rules exist as
tested example code. Nothing has been built on Google yet.

- [`SPEC.md`](SPEC.md): full specification, with the sponsor report and roadmap
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md): how to build it, step by step
- [`CONTEXT.md`](CONTEXT.md): glossary
- [`docs/adr/`](docs/adr/): decision records 0001–0012
- `library/`, `shell/`, `tests/`: example code at its final location (`npm test`)
- [`data/holidays-ie.csv`](data/holidays-ie.csv): Irish public holidays (unverified)
