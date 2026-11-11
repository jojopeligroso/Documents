# Open Questions

Resolved items move into `CONTEXT.md` or an ADR.

## Salvo 7: data model, extensions, messages, setup, dev workflow

1. **Card type: physical or per request?** Are cards physically dedicated to Visitor
   or Contractor (separate pools and low-stock counts), or can any card be encoded
   for either?
2. **Mobile action control.** Ten checkbox columns, or a single **Action** dropdown
   per row (pick an action and the script runs it, then resets the dropdown)?
3. **Requests tab columns.** Confirm the proposed list (see chat / below).
4. **Extensions.** A new linked row (like an Amendment), with the original row
   showing "Extension pending"?
5. **Chasing pending extensions.** Default: post in the Admin Space at 09:30 on the
   Final Day if an extension is still unapproved or unencoded.
6. **Contractor duties.** Check-out by the Provisioner, check-in by the Collector?
7. **Pre-provisioning.** When the card goes to the Requester, is the Requester's
   later handover to the visitor recorded, or is the Requester responsible from
   then on?
8. **Email content.** Which details go in each email? Include a link to the row
   (role holders only; Hosts have no access)?
9. **Request ID format.** e.g. `REQ-0042`, and per site or with a site prefix?
10. **Setup.** An Admin-only "Setup / Repair" menu that installs triggers, applies
    protections, validates Settings, and stores the Chat webhook in Script
    Properties?
11. **Dev workflow.** Plain Apps Script JavaScript (V8) with JSDoc, `clasp` from
    this repo, a **test copy** of the Site Sheet on the dev library version before
    each release, and local Node unit tests for pure logic (dates, overlaps)?

### Proposed Requests tab columns
Request ID (auto) · Kind (New / Amendment / Extension) · Links to (Request ID) ·
Cardholder name · Cardholder type (Visitor / Contractor) · Host email · Contact
(optional) · Requested start (default 09:30) · Requested end (default 18:00) ·
Notes · Requester (auto) · Submitted at (auto) · **Status** · Decision by / at ·
Denial reason (optional) · Card serial · Valid from · Valid to · Encoded by / at ·
Issued to (Cardholder / Requester) · Issued by / at · Returned by / at · **Message** ·
Action control(s)
