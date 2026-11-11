# ADR 0008: Workflow actions run from a custom menu

**Status:** Accepted, 2026-11-11

## Context
The user prefers menu buttons over checkboxes for workflow actions (submit,
approve, deny, encode, issue, return, extend, cancel, no-show, lost). Actions act
on the **selected row**.

## Decision
- One custom menu (e.g. **Access Cards ▸ …**) is added by `onOpen` in the bound
  shell script. Each item calls the library.
- Each action checks the active user's role against Settings, validates the row's
  current status, updates the status and colour, writes an Event Log row, and sends
  notifications.
- **Every action is also available as a checkbox** (handled by an installable
  on-edit trigger), because many users work from phones and tablets. Ticking the box
  and choosing the menu item call the **same validator and handler**, so behaviour
  is identical. A checkbox that fails validation is unticked automatically and the
  reason is shown.
- Optional "button" drawings on the tabs call the same functions (desktop only).

## Verified facts (Apps Script guides/menus, via Context7, 2026-11-11)
- "Only bound scripts can create menus." This fits ADR 0005: the shell creates the
  menu and the library does the work.
- Scripts assigned to images or drawings run only "in a web browser. The script
  doesn't execute if the image or drawing is clicked on mobile."

- `Session.getActiveUser().getEmail()` returns a blank string when security policy
  hides the user's identity (e.g. in simple triggers). "These restrictions generally
  do not apply if the developer runs the script themselves or belongs to the same
  Google Workspace domain as the user." (…/reference/base/session)

## Identity rule
- Role checks rely on the active user's email. If it comes back **blank**, the
  action is **refused** (fail closed) and the reason is shown. Test this on real
  devices before go-live, because "generally" isn't a guarantee.

## Unverified (from training)
- Custom menus are probably also **not shown in the Sheets mobile apps**. If so,
  every menu action is desktop/browser only.

## Consequences
- + Role checks, status checks and an audit entry on every action.
- − Two entry points per action to keep in sync. This is mitigated by both calling
  one shared handler.
- − On mobile, a failed checkbox can't show a dialog. Feedback has to go in a cell
  note or a Status message column (exact mechanism to confirm when building).
