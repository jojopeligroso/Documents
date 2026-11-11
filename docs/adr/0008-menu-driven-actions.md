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
- Settings says who **should** act (one email per role). The script still has to
  find out who **is** acting, using `Session.getActiveUser()`, and compare the two.
  All users are on the same Workspace domain, so the email should be available.
  As a safeguard, a blank email means the action is refused and the reason is
  written to the row's **Message** column. Test on real phones before go-live.
- Feedback for both menu and checkbox actions goes to a per-row **Message** column,
  plus a toast or dialog on desktop.

## Unverified (from training)
- Custom menus are probably also **not shown in the Sheets mobile apps**. If so,
  every menu action is desktop/browser only.

## Consequences
- + Role checks, status checks and an audit entry on every action.
- − Two entry points per action to keep in sync. This is mitigated by both calling
  one shared handler.
- − On mobile, dialogs can't be shown, so the Message column is the feedback channel.
