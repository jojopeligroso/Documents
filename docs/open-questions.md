# Open Questions

Resolved items move into `CONTEXT.md` or an ADR.

## Salvo 2: roles, extensions, timing, notifications, audit

1. **Approver vs Encoder.** Are these always the same person, or can they be split
   (e.g. OM approves, ROM encodes)?
2. **Extensions.** OM, ROM or PM can request one. Does it need the Approver's sign-off,
   or does it go straight to the Encoder? If the Approver requests it, is it
   auto-approved?
3. **Reminder shift rule.** Proposal (Collection Deadline 18:00):
   T-24h → 17:30 on the previous working day; T-12h → 09:30 on the Final Day;
   T-3h → 15:00. Weekends and Irish public holidays: does the OM work them? What
   happens if the Final Day falls on one?
4. **Trigger precision.** Daily Apps Script triggers fire somewhere within an hour
   window, not on the minute. Is a 15-minute polling trigger acceptable instead?
5. **Event → channel matrix.** To be confirmed (see the chat proposal).
6. **Audit / immutability.** Append-only Event Log tab written by the script, with
   protected ranges set to warn rather than block?
7. **Sending identity.** Whose account installs the triggers and sends the email?
   A person, or a shared mailbox/group?
8. **Card states and loss.** Available / Encoded / Issued / Out / In / Lost / Retired?
   Does a lost card create an Encoder deactivation task?
9. **Early end / cancellation.** Is the card re-encoded to deactivate, or just
   collected?
10. **Late return.** Does a visitor card still out after the Collection Deadline
    escalate, and to whom?
11. **Retention.** Purge all records at 18 months (employee records live in HR anyway),
    or treat employees differently?
12. **Repeat cardholders.** Keep a reusable people list, or type the name each time?
13. **Code updates across copies.** Is "copy the template, then update each copy by
    hand" OK, or do we want a shared Apps Script library?
