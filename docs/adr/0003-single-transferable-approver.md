# ADR 0003: Functional roles; a single, transferable Approver

**Status:** Accepted, 2026-11-11

## Context
The workflow has four functions: request, approve, encode, collect. Who performs
each one varies by site and over time. One person may perform several.

## Decision
- Model **roles**, not job titles: Requester, Approver, Encoder, Collector. Each
  Site Sheet assigns roles to people in Settings.
- Exactly **one** person holds the Approver role. It can be transferred.
- If the Approver raises a Request or Extension, it is auto-approved and goes
  straight to the Encoder.
- A Requester who is not the Approver cannot approve their own Request.

## Consequences
- + Works for any site's staffing without code changes.
- The document owner **or** the Approver may reassign the Approver role. Temporary
  handover during absence is accepted as the cover for approvals stalling.
- The Approver is the person with the highest authority over facility security.
- Note: everyone is trusted, so role checks guard against mistakes, not malice. The
  script checks the active user's email against Settings, but anyone with edit
  access can change Settings.
