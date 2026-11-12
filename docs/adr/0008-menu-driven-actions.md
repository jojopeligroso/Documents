# ADR 0008: The per-row Action dropdown is the only way to run an action

**Status:** Accepted, 2026-11-12 (revised: the menu no longer runs actions; see ADR 0011)

## Context
The user first preferred menu buttons, then agreed a single Action dropdown per row
for phones. Detailed design showed the menu cannot run actions at all (ADR 0011).

## Decision
- Each row on `Requests` and `Contractor Log` has an **Action** dropdown and an
  **Action note** cell. Picking an action fires the installable on-edit trigger. The
  script runs the action and clears the choice.
- The dropdown lists **only the actions valid for the row's current status**, taken
  from the table in `Workflow.js`. The script rebuilds it after every action.
- Results go to the row's **Message** column, starting ✓ or ✗.
- The **Access Cards** menu (desktop) keeps: "Go to next empty request row", help,
  and the Admin tools (Build / repair sheet, Install triggers, Set Chat webhook URL).

## Verified facts (Apps Script docs, via Context7, Nov 2026)
- "Only bound scripts can create menus."
- Scripts assigned to images or drawings do not run on mobile.
- The edit event's `user` field is available "depending on a complex set of security
  restrictions".

## To be tested in Phase 0
- Picking from a dropdown in the Sheets mobile apps fires the installable trigger.
- The edit event supplies the acting user's email within one Workspace domain.

## Consequences
- + One way to act, identical on desktop and phone.
- + Only valid actions are offered, and role checks happen in one place.
- − No pop-up feedback. The Message column is the only feedback channel.
