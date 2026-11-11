# Open Questions

Resolved items move into `CONTEXT.md` or an ADR.

## Carried over / needs confirming

1. **Extensions from non-Approvers.** Do they need the Approver's sign-off before
   reaching the Encoder?
2. **Lost card.** Creates an Encoder task to **de**activate the card (assumed; the
   chat answer said "activated").
3. **Audit / immutability** (Salvo 2, Q6, unanswered): append-only Event Log
   written by the script, plus warning-only protection on working tabs?
4. **Weekends and Irish public holidays.** Does the Collector work them? What if the
   Final Day falls on one? Should Settings hold a holiday list?
5. **Encoder and Collector holders.** One person each, or several?
6. **Library vs clasp-only** (ADR 0005): confirm after reading the trade-offs.

## Salvo 3: sheet structure and day-to-day operation

7. **Raising a request.** Type straight into a row, use a dialog/sidebar from the
   menu, or use a linked Google Form?
8. **Tabs.** Proposed: Settings, Cards (pool), Requests (one row per visit),
   Contractor Log (one row per contractor per day), Event Log.
9. **Recording each action.** Status dropdown, checkboxes, or menu buttons?
10. **Assigning a card serial.** At approval, at encoding, or at issue?
11. **Validity Window vs requested dates.** Can they differ? Date only, or date and
    time?
12. **Contractors outside Collector hours.** Production Manager shift starts 07:30,
    Collector shift 09:30–18:00. Who issues and receives contractor cards outside
    the Collector's hours?
13. **No-shows.** A card is encoded but never issued.
14. **Double-booking.** Should the sheet block a card from being assigned to
    overlapping visits? Warn when the pool runs low?
15. **Host email.** Reminders go to the Host via Gmail, so we need a Host email,
    which could be a Google Group for a team. Is the Host always a Workspace user?
16. **Sheet access.** Who can open or edit the Site Sheet? Do Hosts need access?
