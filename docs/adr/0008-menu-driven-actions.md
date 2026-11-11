# ADR 0008: Actions via custom menu (desktop) and a per-row Action dropdown (everywhere)

**Status:** Accepted, 2026-11-11 (revised: the Action dropdown replaces per-action checkboxes)

## Context
Workflow actions (submit, approve, deny, record encoding, issue, hand over, return,
check-out/in, extend, amend, cancel, no-show, lost) act on one row. Many users work
from phones and tablets.

## Decision
- **Desktop:** a custom menu (**Access Cards ▸ …**) added by `onOpen` in the bound
  shell script. It acts on the selected row.
- **Everywhere, including mobile:** a single **Action** dropdown column per row on the
  Requests and Contractor Log tabs. Choosing an action fires the installable on-edit
  trigger. The script runs the action and then clears the dropdown.
- The script rebuilds each row's dropdown so it **offers only the actions valid for
  that row's current status**.
- The menu and the dropdown call the **same validator and handler**. Each run checks
  the actor's role, checks the status transition, updates status and colour, writes
  an Event Log row, and sends notifications.
- Feedback goes to the row's **Message** column, plus a toast or dialog on desktop.

## Verified facts (Apps Script docs, via Context7, 2026-11-11)
- "Only bound scripts can create menus." (guides/menus)
- Scripts assigned to images or drawings don't run on mobile. (guides/menus)
- `Session.getActiveUser().getEmail()` may be blank under some security policies.
  It "generally" works when the user is in the same Workspace domain.
  (reference/base/session)

## Identity rule
Settings says who **should** act. The script checks who **is** acting using
`Session.getActiveUser()`. A blank email means the action is refused and the reason
goes to the Message column. Test on real phones before go-live.

## Unverified (from training; test on a phone)
- Custom menus are probably not shown in the Sheets mobile apps.
- Data-validation dropdowns probably work in the Sheets mobile apps, and editing one
  fires installable on-edit triggers.

## Consequences
- + One column instead of about ten checkboxes. Only valid actions are offered.
- + Identical behaviour on desktop and mobile.
- − The per-row dropdown validation must be rewritten whenever the status changes.
  That's cheap, but it's code to get right.
