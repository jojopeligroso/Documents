# ADR 0001: One Google Sheet per site, built on Apps Script

**Status:** Accepted, 2026-11-10

## Context
Card management is local to each office. Every office has its own card pool and
its own people in each role. All users are on a paid Google Workspace domain.

## Decision
Build a **template** Google Sheet with a bound Apps Script project. Each site
copies the template and configures its own role holders, card pool and shift
times. There is no central database and no cross-site reporting.

## Consequences
- + No servers or extra cost. Everything runs inside Workspace.
- + Sites are isolated, so a mistake at one site can't affect another.
- − Code fixes do not reach existing copies automatically. Addressed by ADR 0005.
- − Apps Script quotas and trigger limits apply per user/script. Check these before
  the design is final.
