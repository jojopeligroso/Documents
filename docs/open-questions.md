# Open Questions

Resolved items move into `CONTEXT.md` or an ADR.

## Salvo 6

1. **More than one Approver?** This conflicts with the earlier "only one person
   should have approval rights". Options:
   (a) several Approvers, any of whom can approve alone;
   (b) one active Approver plus delegated backups, like the Encoder and Collector.
2. **Provisioner = Collector?** (Unanswered from salvo 5.)
3. **Visits starting on a non-Working Day.** These are allowed, but the Collector
   isn't in. Is the card issued on the previous Working Day?
4. **Holidays.** Is the site closed on Mon 28 Dec 2026, and on Mon 27 and Tue 28 Dec
   2027? Any other closures (e.g. 24 Dec)? Who updates the Holiday List each year?
   Can someone confirm the dates against citizensinformation.ie (not reachable from
   this session)?
5. **Pending extensions near expiry.** There's no cut-off, but should the Approver and
   Encoder be chased (e.g. in the Admin Space) if an extension is still pending on
   the Final Day?
6. **Identity fail-closed.** If the script can't read the user's email, it refuses
   the action. OK?
7. **Checkbox feedback on mobile.** Use a "Message" column that explains why a tick
   was rejected?
8. **Trigger installer / owner.** Emails are sent from the installer's account, and
   the owner and installer can bypass row locks. Should these be the same person, and
   who? (Recommend: the Approver, or a role-neutral admin.)
