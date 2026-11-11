# ADR 0010: Development workflow

**Status:** Accepted, 2026-11-11

## Decision
- **Language:** plain Apps Script JavaScript (V8 runtime) with JSDoc type comments.
  No TypeScript and no build step.
- **Source of truth:** this git repo. Code is pushed to Apps Script with `clasp`.
- **Projects:** one standalone **library** project (all logic) and one **shell**
  (the bound script in each Site Sheet; ADR 0005).
- **Release flow:** develop against a **test copy** of the Site Sheet that uses the
  library in development mode. Once it passes there, create a numbered library
  version, then bump the version in real sites.
- **Tests:** logic that doesn't call Google services (calendar and deadline maths,
  overlap detection, status transitions, permission checks) lives in plain modules
  with **local Node unit tests**. Code that calls Google services is kept thin and
  tested by hand on the test copy.

## Consequences
- + Easy to learn as you go. Fast tests for the logic most likely to be wrong.
- − Apps Script doesn't support ES modules the way Node does. Shared pure modules
  must be written so they work in both (to settle in the first implementation
  step).
