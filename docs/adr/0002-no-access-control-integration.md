# ADR 0002: No integration with the access-control system

**Status:** Accepted, 2026-11-10

## Context
Cards are encoded in a separate access-control system. That system enforces the
card's expiry itself.

## Decision
The sheet records **administrative state only**: who encoded, when, and the
Validity Window (A → B). An Extension creates a re-encoding task for the Encoder.
The sheet records that task and its completion. It never talks to the
access-control system.

## Consequences
- + Simple. No vendor API or credentials.
- − The sheet and the real card state can drift (e.g. the sheet says encoded to
  Friday but the card was encoded to Thursday). We rely on people entering data
  accurately, which is acceptable under the trusted-party model.
