# ADR 0011: Every workflow action runs inside the Admin's installable trigger

**Status:** Accepted, 2026-11-12

## Context
Apps Script runs code under different identities depending on how it starts:
- An **installable trigger** "runs with the authorization of the user who created
  the trigger" (guides/triggers/installable). Here, that is the Admin.
- A **menu item** runs as the person who clicked it (standard Apps Script behaviour,
  from training; not re-verified).

Submitted rows, the Event Log and the Cards tab are locked to everyone but the Admin.

## Decision
All workflow actions go through the Action dropdown, which is handled by the
installable on-edit trigger. No workflow action is offered in the menu.

## Why
If an action ran from the menu, it would run as the clicker. It could not write to
the locked row or the Event Log, and its emails would come from the clicker's account
instead of one consistent sender. Running everything in the Admin's trigger gives one
identity that can write everywhere, and one "from" address.

## Consequences
- + One code path. Locks can stay strict.
- − The system depends on the Admin's account. If it is disabled, nothing runs until
  a new Admin runs "Install triggers".
- − The script must learn who acted from the edit event (`e.user`), because the
  running identity is always the Admin. If that is blank, the action is refused.
- − Admin tools in the menu (Build / repair) work only because the Admin, as file
  owner, can edit locked cells when running them personally.
