# Implementation Plan

This plan turns [`SPEC.md`](../SPEC.md) v1.0 into a working system. It is written so
that a developer, or an AI coding model, can follow it without making design
decisions. If a step seems to need a decision, stop and ask.

**Read first, in this order:** `SPEC.md` §4–§11, then `CONTEXT.md`, then this plan,
then the example code under `library/` and `shell/`.

---

## 1. What already exists

Example code is already in the repo **at its final location**. Build on it. Do not
restructure it.

| File | State | What it is |
|---|---|---|
| `library/src/pure/Cal.js` | **Tested** | Working days, date arithmetic, validators |
| `library/src/pure/Schedule.js` | **Tested** | Collection deadline, reminder targets, send/wait/skip |
| `library/src/pure/Alloc.js` | **Tested** | Double-booking and free-card count |
| `library/src/pure/Workflow.js` | **Tested** | Statuses, actions, roles, permission checks |
| `tests/*.test.js`, `tests/loadGas.js` | **Passing** (19 tests) | Run with `npm test` |
| `library/src/gas/Const.js` | Reference | Tab names, column numbers, colours |
| `library/src/gas/Settings.js` | Reference | Reads the Settings tab |
| `library/src/gas/Rows.js` | Reference | Reads and writes Requests rows |
| `library/src/gas/Audit.js` | Reference | Event Log and Sent Log |
| `library/src/gas/Notify.js` | Reference | Gmail and Chat |
| `library/src/gas/Protect.js` | Reference | Locks |
| `library/src/gas/Cards.js` | Reference | Card pool |
| `library/src/gas/Actions.js` | Reference, **partial** | Action runner, plus `Submit` and `Record encoding` |
| `library/src/gas/Poller.js` | Reference, **partial** | Reminders and visitor overdue |
| `library/src/gas/Api.js` | Reference | The functions the shell calls |
| `shell/Shell.js` | Reference | Complete shell |
| `library/appsscript.json`, `shell/appsscript.json` | Reference | Manifests |

**"Tested"** means it runs under Node with passing tests. **"Reference"** means it
passes a syntax check but has **never run on Google**. Treat reference code as a
careful first draft: expect small fixes when it first runs.

**Still to write:** `Linked.js`, `ContractorLog.js`, `Digest.js`, `SettingsWatch.js`,
`Template.js`, the ten remaining handlers in `Actions.js`, and more tests. Each is
specified in §6.

---

## 2. Repository layout

```
/
├── SPEC.md                      what to build
├── CONTEXT.md                   glossary
├── README.md
├── package.json                 "npm test" only. No dependencies
├── .gitignore                   ignores node_modules and .clasp.json
├── data/
│   └── holidays-ie.csv          seed for Settings holidays
├── docs/
│   ├── IMPLEMENTATION_PLAN.md   this file
│   ├── holidays-ie.md
│   ├── open-questions.md
│   └── adr/                     0001 … 0012
├── library/                     Apps Script project 1: the shared library "ACM"
│   ├── appsscript.json
│   ├── .clasp.json.example      copy to .clasp.json and paste the script ID
│   └── src/
│       ├── pure/                NO Google calls. Tested in Node
│       │   ├── Cal.js
│       │   ├── Schedule.js
│       │   ├── Alloc.js
│       │   └── Workflow.js
│       └── gas/                 Google-facing code
│           ├── Const.js
│           ├── Settings.js
│           ├── Rows.js
│           ├── Cards.js
│           ├── Audit.js
│           ├── Notify.js
│           ├── Protect.js
│           ├── Actions.js
│           ├── Linked.js          TO WRITE
│           ├── ContractorLog.js   TO WRITE
│           ├── Poller.js
│           ├── Digest.js          TO WRITE
│           ├── SettingsWatch.js   TO WRITE
│           ├── Template.js        TO WRITE
│           └── Api.js
├── shell/                       Apps Script project 2: bound to each Site Sheet
│   ├── appsscript.json
│   ├── .clasp.json.example
│   └── Shell.js
└── tests/
    ├── loadGas.js               loads library/src/pure into one scope
    ├── cal.test.js
    ├── schedule.test.js
    ├── alloc.test.js
    └── workflow.test.js
```

Do not add folders, build tools, bundlers, TypeScript or npm dependencies.

---

## 3. Rules for all code

These are not style preferences. Breaking them causes real faults.

1. **One file, one namespace.** Each file declares exactly one top-level
   `var Name = (function () { … return { … }; })();`. Use `var`, not `const` or
   `let`, for that top-level name: the Node test loader relies on it. Inside
   functions, use `const` and `let` freely.
2. **No code runs at load time** except building the namespace. Never read a sheet or
   call another namespace outside a function. Apps Script loads files in an order you
   do not control.
3. **`pure/` never touches Google.** No `SpreadsheetApp`, `Utilities`, `Session`,
   `new Date()` for "now", or anything else from Apps Script. Pass values in.
4. **Dates and times are strings** (ADR 0012): `YYYY-MM-DD`, `HH:mm`,
   `YYYY-MM-DD HH:mm`. Compare them with `<` and `>`. Do arithmetic only through
   `Cal`. The only place a JavaScript `Date` is allowed is in `gas/` code that
   converts a true date cell with `Utilities.formatDate(value, tz, D_FORMAT)`, or gets
   "now" with `Audit.now(tz)`.
5. **Read text cells with `getDisplayValues()`**, never `getValues()`. A time typed as
   `09:30` comes back from `getValues()` as a `Date` in 1899, whose minutes are wrong
   in the Dublin time zone. `Rows.read` already does this correctly.
6. **Column numbers come from `Const.js` only.** Never write a literal column number
   or letter anywhere else.
7. **Only `Api.js` has top-level functions.** They are the library's public surface.
   Everything else is reached through a namespace.
8. **The shell has no business rules.** If you are adding an `if` about statuses or
   roles to `Shell.js`, it belongs in the library.
9. **A failed notification never undoes an action.** Use `Notify.email` and
   `Notify.chat`, which return an error string instead of throwing, and log failures
   with `Audit.log(…, 'NOTIFY_FAILED', …)`.
10. **Every message to a user is a full sentence saying what to do.** "Fill in:
    name, host." not "Validation error".
11. **Never write to the Event Log or Sent Log except through `Audit`.**
12. **Add a test with every change to `pure/`.**

---

## 4. One-time set-up

Commands are from the developer's own machine. `clasp` is Google's command-line tool
for Apps Script. Its command names have changed between major versions, so check
`npx @google/clasp --help` if one below is rejected.

1. **Run the tests.** `npm test`. Expect 19 passing. Requires Node 20 or later.
2. **Log in.** `npx @google/clasp login`, signed in as the **Admin** account. Turn on
   the Apps Script API at <https://script.google.com/home/usersettings>.
3. **Create the library project.** At <https://script.google.com>, create a new
   standalone project named `ACM Library`. Copy its Script ID from Project Settings.
   Copy `library/.clasp.json.example` to `library/.clasp.json` and paste the ID.
   From `library/`, run `npx @google/clasp push`.
4. **Create the test Site Sheet.** Create a Google Sheet named
   `Access Cards – TEST`. Open Extensions ▸ Apps Script. Copy that script's ID into
   `shell/.clasp.json`.
5. **Point the test shell at the library in development mode.** In
   `shell/appsscript.json`, set `libraryId` to the library's Script ID and, **for the
   test copy only**, `"developmentMode": true`. From `shell/`, run
   `npx @google/clasp push`. Do not commit `developmentMode: true`.
6. **Give every tester view access** to the `ACM Library` project (Share button in
   the script editor). Without it, their edits will fail.
7. **Share the test sheet** with two or three named test accounts as editors. Not a
   group. Not the domain.
8. Reload the sheet. The **Access Cards** menu appears. Then, as the Admin:
   Admin ▸ Build / repair sheet, fill in `Settings`, Admin ▸ Install triggers,
   Admin ▸ Set Chat webhook URL.

---

## 5. Phase 0: platform tests (do this before anything else)

The design rests on seven assumptions about Google Sheets (SPEC §16.2). Test them in
a scratch sheet, **not** the test Site Sheet. This takes about half a day.

Create a sheet with two tabs, `Spike` and `Log`. Put a dropdown in `Spike!A2`
(Data ▸ Data validation ▸ Dropdown: `One`, `Two`). Format `Spike!B:B` as plain text
and `Spike!C:C` as date. Paste this into its bound script and run `spikeInstall`
once as the owner:

```js
function spikeInstall() {
  ScriptApp.newTrigger('spikeOnEdit').forSpreadsheet(SpreadsheetApp.getActive()).onEdit().create();
  const ss = SpreadsheetApp.getActive();
  // Lock both tabs. Leave Spike!A:C open.
  const spike = ss.getSheetByName('Spike').protect();
  spike.removeEditors(spike.getEditors());
  spike.setUnprotectedRanges([ss.getSheetByName('Spike').getRange('A2:C100')]);
  const log = ss.getSheetByName('Log').protect();
  log.removeEditors(log.getEditors());
}

function spikeOnEdit(e) {
  const ss = e.source;
  ss.getSheetByName('Spike').getRange('E2').setValue('written by script ' + new Date().toISOString());
  ss.getSheetByName('Log').appendRow([
    new Date(),
    e.user ? e.user.getEmail() : '(no e.user)',   // who edited
    Session.getActiveUser().getEmail(),           // compare
    Session.getEffectiveUser().getEmail(),        // should be the owner
    e.range.getA1Notation(), String(e.value)
  ]);
}

function spikeWebhook() {
  const res = UrlFetchApp.fetch('PASTE_WEBHOOK_URL', {
    method: 'post', contentType: 'application/json; charset=UTF-8',
    payload: JSON.stringify({ text: 'Spike test' }), muteHttpExceptions: true
  });
  Logger.log(res.getResponseCode());
}
```

Share the sheet with a **second account** as editor. Then record the result of each
test in `docs/phase0-results.md`:

| # | Do this as the second account | Pass when |
|---|---|---|
| 1 | In the Sheets app on a phone, pick `One` in `A2` | A new `Log` row appears |
| 2 | Same edit | `Log` column B shows the second account's email |
| 3 | Same edit | `Spike!E2` and the `Log` row were written, though both are locked to the second account. Column D shows the owner |
| 4 | Try to type in `Spike!E2` and in `Log!A1` | Both are refused. Typing in `B2` works |
| 5 | Same edit as test 1 | Exactly **one** `Log` row per edit (the script's own write to `E2` did not fire the trigger again) |
| 6 | On the phone, type `09:30` in `B2` and pick a date in `C2` | `B2` still shows `09:30`. `C2` offers a date picker |
| 7 | As the owner, run `spikeWebhook` with the real webhook | The Chat space shows "Spike test". The log shows 200 |

**If any test fails, stop.** Report which one. SPEC §16.2 lists the fallback for each,
and the fallback needs the user's agreement before it is built.

---

## 6. Module specifications

### 6.1 The action runner (exists: `Actions.run`)

Every Requests action is one entry in `Actions.HANDLERS`. A handler is a function of
one argument, the context `c`:

| Field | Meaning |
|---|---|
| `c.ss`, `c.sheet` | Spreadsheet and the `Requests` sheet |
| `c.row` | The row as an object (field names from `RC` in `Const.js`, plus `rowNum`, `start`, `end`) |
| `c.all` | Every row that has a Request ID, same shape |
| `c.actor`, `c.roles` | Lower-case email and its roles |
| `c.settings`, `c.tz`, `c.now` | Settings object, time zone, now as `YYYY-MM-DD HH:mm` |
| `c.note` | The Action note text |

A handler returns `{ error }` or a result object. The runner applies it. The fields
of the result object are documented at the top of `Actions.js`. **A handler never
writes to the Requests sheet itself.** It may call `Cards.*` directly.

The role and status check has already passed before a handler is called. Handlers
check data only.

### 6.2 The ten remaining handlers

Write each in `Actions.js` in the same style as `Submit`. "Collector" below means
`Settings.collectorEmail(s)`. Each row of this table is the complete behaviour.

| Handler | `patch` | Other effects | Emails `{to, subject, extra}` | Chat line |
|---|---|---|---|---|
| `Approve` | `status: Approved`, `decisionBy`, `decisionAt`, `validFrom: r.start`, `validTo: r.end`. `reprotect: true` | If `r.kind` is Extension: instead set `serial` and `validFrom` from the original, `validTo: r.end`. If Amendment and the original is not Cancelled: call `Linked.applyAmendment(c)` and merge its result. Add the low-stock note (as in `Submit`) | Encoder: "Card to encode", "Action needed: encode a card, then choose \"Record encoding\"." Requester: "Approved" | `✅ <id> approved by <actor>.` + stock note |
| `Deny` | `status: Denied`, `decisionBy`, `decisionAt`, `denialReason: c.note` | If Extension: `others` = original gets `status: <its prevStatus>`, `prevStatus: ''` | Requester: "Denied", reason line if given | `⛔ <id> denied by <actor>.` |
| `Issue to cardholder` | `status: Issued`, `issuedTo: 'Cardholder'`, `issuedBy`, `issuedAt` | — | — | `🤝 <id> issued to cardholder by <actor>.` |
| `Issue to requester` | same with `issuedTo: 'Requester'` | — | — | `🤝 <id> issued to requester (<r.requester>) by <actor>.` |
| `Return` | `status: Closed`, `returnedBy`, `returnedAt` | `Cards.setInUseBy(ss, r.serial, '')`. Any Extension row with `linksTo == r.id` and status Submitted or Approved: `others` sets it to `Cancelled`, message "Original was returned." If contractor: `ContractorLog.closeToday(c)` | If `Cal.dateOf(c.now) < Cal.dateOf(r.validTo)`: Encoder: "Card returned early", "Card <serial> came back before its validity ends. Shorten its validity or reuse it." | `↩️ <id> returned to <actor>. Card <serial> is free.` |
| `No-show` | `status: No-show` | — | Requester and Encoder: "No-show", "The card was not collected. Choose \"Cancel\" on the row to release it." | `🚫 <id> no-show recorded by <actor>.` |
| `Cancel` | `status: Cancelled` | If `r.serial`: `Cards.setInUseBy(ss, r.serial, '')`. If Extension: restore the original as in `Deny`. Put `c.note` in an extra event | Requester, if `c.actor != r.requester`: "Cancelled". Encoder, if `r.serial`: "Encoded card no longer needed", "Deactivate or reuse card <serial>." | `🗑️ <id> cancelled by <actor>.` |
| `Report lost` | `status: Lost`. `reprotect: true` | `Cards.setState(ss, r.serial, 'Lost')`, `Cards.setInUseBy(ss, r.serial, '')`. Pending Extension rows: cancel as in `Return`, message "Original card was lost." | Encoder: "Card lost – deactivate now", "Deactivate card <serial>. Then choose \"Record deactivation\", or pick a new serial and choose \"Record replacement\"." Collector: "Card lost" | `🚨 <id>: card <serial> reported lost by <actor>.` |
| `Record deactivation` | `deactivatedAt: c.now`. `reprotect: true`. Status stays Lost | — | Requester: "Lost card deactivated" | `🔒 <id>: lost card deactivated by <actor>. No replacement.` |
| `Record replacement` | `status: Encoded`, `encodedBy`, `encodedAt`, `issuedTo: ''`, `issuedBy: ''`, `issuedAt: ''`, `deadline` recalculated. `reprotect: true` | Run the same four checks as `Record encoding` (the old serial fails the Active check, which is how "you must pick a new card" is enforced). `Cards.setInUseBy(ss, r.serial, r.id)` | Provisioner and Requester: "Replacement card ready", "Card <serial> replaces the lost card." | `💳 <id>: replacement card <serial> encoded by <actor>.` |

Factor the four encoding checks out of `Record encoding` into a private function
`checkEncoding_(c)` that returns an error string or `''`, and call it from both.

### 6.3 `Linked.js` (to write)

```js
var Linked = (function () {
  /** Submit for a row whose Kind is Extension or Amendment. Called from HANDLERS['Submit']. */
  function submit(c, kind) { … }
  /** Record encoding on an Extension row. Called from HANDLERS['Record encoding'] after its checks. */
  function encodeExtension(c) { … }
  /** Called from HANDLERS['Approve'] (and from submit, on auto-approval) for an Amendment
   *  whose original is still live. Returns { patch, others, emails } to merge. */
  function applyAmendment(c) { … }
  return { submit: submit, encodeExtension: encodeExtension, applyAmendment: applyAmendment };
})();
```

All three return the same result shape as a handler.

**`submit(c, 'Extension')`** in this exact order:

1. `orig = Rows.findById(c.all, r.linksTo)`. If missing:
   error "Links to must be the Request ID being extended."
2. If `orig.kind` is Extension: error "An extension cannot be extended. Extend the
   original request."
3. If `orig.status` is not Encoded or Issued: error "Only a request whose card is
   encoded or issued can be extended. <orig.id> is <status>."
4. If `r.endDate` is blank: error "Fill in the new End date."
5. `endTime = r.endTime || s.defaultEndTime`. `end = Cal.at(r.endDate, endTime)`.
   If `end <= orig.validTo`: error "The new end must be after <orig.validTo>."
6. Take an ID. `status = Workflow.submitTarget(c.roles)`.
7. `patch`: `id`, `kind: 'Extension'`, `status`, `requester`, `submittedAt`,
   `endTime`, and copied from the original: `name`, `type`, `host`, `contact`,
   `startDate`, `startTime`.
8. `others`: original gets `prevStatus: orig.status`, `status: 'Extension pending'`.
9. If `status` is Approved: also set `decisionBy`, `decisionAt`,
   `serial: orig.serial`, `validFrom: orig.validFrom`, `validTo: end`. Email the
   Encoder ("Extension to encode"). Otherwise email the Approver ("Extension approval
   needed").
10. `reprotect: true`. Chat: `⏩ <id>: extension of <orig.id> to <end> requested by <actor>.`

**`encodeExtension(c)`**:

1. `orig = Rows.findById(c.all, r.linksTo)`. If `r.serial !== orig.serial`: error
   "An extension keeps the same card (<orig.serial>)."
2. `clash = Alloc.serialConflicts(r.serial, orig.validFrom, r.validTo, c.all, orig.id)`.
   Passing `orig.id` as the last argument ignores the original's own booking. If any:
   error naming them.
3. `patch`: `status: 'Closed'`, `encodedBy`, `encodedAt`.
4. `others`: original gets `validTo: r.validTo`,
   `deadline: Schedule.collectionDeadline(r.validTo, s.cal)`,
   `status: orig.prevStatus`, `prevStatus: ''`.
5. Emails: Collector, `orig.requester`, `orig.host`: "Extension confirmed", "Card
   <serial> is now valid to <validTo>. New return deadline: <deadline>." Set
   `link: false` on the Host's email (send it as a separate email entry).
6. `reprotect: true`. Chat: `⏩ <orig.id> extended to <validTo> (card <serial>) by <actor>.`

**`submit(c, 'Amendment')`**:

1. `orig` as above. Missing: error "Links to must be the Request ID being amended."
2. `orig.kind` is Extension: error "An extension cannot be amended. Cancel it and
   raise a new one."
3. `orig.status` is Extension pending: error "Finish or cancel the extension on
   <orig.id> first."
4. `orig.status` not in Submitted, Approved, Encoded, Issued: error "<orig.id> is
   <status> and can no longer be amended."
5. For each of `name`, `type`, `host`, `contact`, `startDate`, `startTime`, `endDate`,
   `endTime`, `notes`: if blank on this row, use the original's value.
6. Run the same checks as a new request (SPEC §7.1). **Skip** the working-day check
   on the start if `orig.status` is Issued. To avoid duplicating code, move the checks
   in `HANDLERS['Submit']` into a shared private function
   `validateRequest_(fields, settings, opts)` that returns an error string or `''`.
7. Take an ID. `status = Workflow.submitTarget(c.roles)`. `patch` has all nine merged
   fields plus `id`, `kind`, `status`, `requester`, `submittedAt`.
8. If `orig.status` is Submitted: `others` = original gets `status: 'Cancelled'`,
   `message: 'Superseded by <id>.'`.
9. If `status` is Approved (auto-approval) and the original was not Submitted: merge
   `applyAmendment(c)` with `id` passed in.
10. Emails and Chat as for a new request, with "Amendment of <orig.id>" in the Chat line.

**`applyAmendment(c)`** (the amendment has just been approved; the original is
Approved, Encoded or Issued):

1. `others`: original gets `status: 'Cancelled'`, `message: 'Superseded by <id>.'`.
2. `patch`: copy from the original `serial`, `encodedBy`, `encodedAt`, `issuedTo`,
   `issuedBy`, `issuedAt` (blank values copy as blank). Set `validFrom: r.start`,
   `validTo: r.end`.
3. If the original had a serial: `Cards.setInUseBy(ss, orig.serial, <amendment id>)`.
4. Email the Encoder: "Amended request to re-encode".

Because `Workflow.encodeTarget` returns Issued when `issuedAt` is set, the later
`Record encoding` puts an already-issued amendment straight back to Issued.

**Note on `Rows.write` and `message`:** the runner sets `message` on the acted row
itself. For `others`, include `message` in the patch when this plan says so.

### 6.4 `ContractorLog.js` (to write)

```js
var ContractorLog = (function () {
  function ensureRows(ss, s, now, all) { … }     // called by Poller on working days
  function flagOverdue(ss, s, cfg, now, once) { … } // called by Poller on working days
  function run(ss, sheet, rowNum, action, actor, cfg) { … } // called by Api.handleEdit
  function closeToday(c) { … }                   // called by HANDLERS['Return']
  return { ensureRows: ensureRows, flagOverdue: flagOverdue, run: run, closeToday: closeToday };
})();
```

- **`ensureRows`**: `today = Cal.dateOf(now)`. For every request in `all` with
  `type === 'Contractor'`, status Encoded, Issued or Extension pending, and
  `Cal.dateOf(validFrom) <= today <= Cal.dateOf(deadline)`: if no log row has that
  date and Request ID, append
  `[today, id, name, serial, 'Pending', '', '', '', '', '', '', '']` and set the
  Action cell's dropdown with
  `Rows.setActionList(cell, Workflow.availableLogActions('Pending'))`.
- **`run`**: read the log row with `getDisplayValues()`. Load settings.
  `Workflow.checkLog(action, status, roles)`. On failure write `✗ …` to Message and
  clear the Action cell.
  - `Check out`: set Status `Out`, Checked out by/at. Rebuild the dropdown. Find the
    request row on `Requests`; if its status is Encoded, `Rows.write` it with
    `status: 'Issued'`, `issuedTo: 'Cardholder'`, `issuedBy`, `issuedAt`.
    Chat: `🤝 <id>: contractor card <serial> checked out to <name> by <actor>.`
  - `Check in`: set Status `In`, Checked in by/at. Clear the dropdown.
    Chat: `↩️ <id>: contractor card <serial> checked in by <actor>.`
    If `today === Cal.dateOf(request.deadline)`: `Rows.write` the request with
    `status: 'Closed'`, `returnedBy`, `returnedAt`; `Cards.setInUseBy(ss, serial, '')`;
    log it; add " Engagement finished; card is free." to the Chat line.
  - Write `✓ …` to Message, clear Action note, `Audit.log` every change.
- **`flagOverdue`**: only when `now >= Cal.at(today, s.cal.shiftEnd)`. For today's
  rows: `Out` becomes `Overdue` (keep the dropdown at `Check in`) and, through
  `once('CLOG_OVERDUE|' + id + '|' + today, …)`, post
  `⚠️ <id>: contractor card <serial> (<name>) was not checked in by <shiftEnd>.`
  `Pending` becomes `Absent` with the dropdown cleared.
- **`closeToday(c)`**: if today's log row for `c.row.id` is `Out` or `Overdue`, set it
  to `In` with Checked in by/at.

### 6.5 `Digest.js` (to write)

`Digest.send(ss, s, cfg, now, all, once)`:

1. `today = Cal.dateOf(now)`. Return unless
   `now >= Cal.addMinutes(Cal.at(today, s.cal.shiftStart), -s.leadMinutes)`.
2. Inside `once('DIGEST|' + today, function () { … })`, build `lines`:
   - For each Extension row with status Submitted or Approved whose original's
     `Cal.dateOf(deadline) <= today`:
     `⏳ <ext id>: extension of <orig id> is still <status>. Card <serial> stops working at <orig.validTo>.`
   - For each row with status No-show:
     `🚫 <id>: no-show not yet cancelled. Card <serial> is still reserved.`
   - For each visitor row Issued or Extension pending with `deadline < now`:
     `⚠️ <id>: card <serial> (<name>) overdue since <deadline>.`
   - If `today.slice(5) >= '11-01'` and no key in `s.cal.holidays` starts with next
     year: `📅 Add next year's public holidays to the Settings tab.`
3. If `lines` is empty, return `'EMPTY'` without posting. Otherwise post
   `'Daily summary ' + today + '\n' + lines.join('\n')` and return `'SENT'`.

### 6.6 `SettingsWatch.js` (to write)

`SettingsWatch.onEdit(ss, e, actor, cfg)`:

1. Act only on single-cell edits.
2. **Column B**, where column A on the same row is one of `ADMIN_EMAIL`,
   `APPROVER_EMAIL`, `ENCODER_EMAIL`, `PROVISIONER_EMAIL`, `COLLECTOR_EMAIL`:
   - If the new value is non-blank and does not end in `@<ORG_DOMAIN>`: put back
     `e.oldValue` (or blank) and stop.
   - `Audit.log(ss, tz, actor, 'ROLE_CHANGE', '', '', '', '', key + ': ' + old + ' → ' + new)`.
   - If the key is `APPROVER_EMAIL`: `Protect.syncSettings(ss, newValue)`.
   - Post `👤 <key> changed from <old> to <new> by <actor>.` to Chat with
     `Notify.chat(cfg.webhookUrl, …)`.
3. **Column D** (Requesters): log `REQUESTERS_CHANGE` with old and new values.
4. Any other cell: log `SETTINGS_CHANGE` with the A1 reference, old and new values.

### 6.7 `Template.js` (to write)

`Template.build(ss)` creates anything missing and never deletes or overwrites data.
It must be safe to run on a live sheet at any time.

1. **Tabs.** For each name in `SHEET`, in the order Requests, Contractor Log, Cards,
   Settings, Event Log, Sent Log: create it if missing. Hide `Sent Log`.
2. **Headers.** Write row 1 of each tab from the header lists in SPEC §5, only if
   `A1` is blank. Bold, frozen row 1. On `Requests`, also freeze 5 columns.
3. **Formats on `Requests`** (rows 2 to `getMaxRows()`): set every column to plain
   text with `setNumberFormat('@')`, **except** `RC.startDate` and `RC.endDate`, which
   get `setNumberFormat('yyyy-mm-dd')`. Plain text on `Contractor Log`, `Event Log`,
   `Sent Log`, `Cards`, and `Settings` columns A–D. `Settings!F:F` is `yyyy-mm-dd`.
4. **Dropdowns and checks on `Requests`:**

   ```js
   const dv = SpreadsheetApp.newDataValidation;
   const rows = sh.getMaxRows() - 1;
   const col = function (c) { return sh.getRange(2, c, rows, 1); };
   col(RC.kind).setDataValidation(dv().requireValueInList(['New', 'Amendment', 'Extension'], true).setAllowInvalid(false).build());
   col(RC.type).setDataValidation(dv().requireValueInList(['Visitor', 'Contractor'], true).setAllowInvalid(false).build());
   col(RC.startDate).setDataValidation(dv().requireDate().setAllowInvalid(false).build());
   col(RC.endDate).setDataValidation(dv().requireDate().setAllowInvalid(false).build());
   col(RC.serial).setDataValidation(dv()
     .requireValueInRange(ss.getSheetByName(SHEET.CARDS).getRange('A2:A'), true).setAllowInvalid(false).build());
   ```

   Do not add validation to the time columns or to Host email: the script checks those
   on Submit and explains the problem in Message, which is clearer on a phone.
5. **Action dropdowns.** For each `Requests` row from 2 to `getMaxRows()`: if the row
   has a Request ID, set the list to `Workflow.availableActions(row)`; otherwise set
   it to `['Submit']`. Do the blank rows in one `setDataValidation` call on the whole
   block below the last used row. Recolour rows that have an ID from `STATUS_COLOUR`.
6. **`Settings` seed.** If `A2` is blank, write the fourteen keys from SPEC §5.4 into
   column A with these defaults in column B: times `09:30` / `18:00`,
   `REMINDER_LEAD_MINUTES` `30`, `LOW_STOCK_THRESHOLD` `5`, `NEXT_REQUEST_NUMBER` `1`.
   Leave the emails, `SITE_CODE` and `ORG_DOMAIN` blank. Write the headers
   `Requesters` in `D1`, `Holiday date` in `F1`, `Holiday name` in `G1`.
7. **Hide** columns `RC.prevStatus` and `RC.deactivatedAt`.
8. **`Cards`:** dropdown on column B: `Active`, `Lost`, `Retired`.

`Api.repair()` calls `Template.build` and then `Protect.syncAll`. If Settings is not
yet filled in, `Settings.load` throws; catch that in `repair()`, skip `syncAll`, and
tell the Admin to fill in Settings and run it again.

### 6.8 `Poller.js` (exists, partial)

`reminders_` and `visitorOverdue_` are written. `run` already calls
`ContractorLog.ensureRows`, `ContractorLog.flagOverdue` and `Digest.send`. Nothing
else to add once those exist.

---

## 7. Build phases

Do them in order. Do not start a phase until the one before it meets its "done when".
Commit at the end of each phase.

### Phase 0: platform tests
§5. **Done when** `docs/phase0-results.md` records a pass for all seven, or the user
has agreed a fallback.

### Phase 1: core rules
Already passing. Add these tests before moving on:
- `Cal`: a leap day (`2028-02-29` valid; `addDays('2028-02-28', 1)`).
- `Schedule`: a deadline on the first working day after a holiday weekend.
- `Alloc`: `freeCount` going to zero and below.
- `Workflow`: every action in `ACTIONS` is refused for a role not in its `roles`.

**Done when** `npm test` passes with the new tests.

### Phase 2: sheet and settings
1. Complete set-up §4 steps 1–7.
2. Write `Template.js` (§6.7).
3. Run Admin ▸ Build / repair sheet on the empty test sheet.
4. Fill in `Settings`. Add ten test serials to `Cards`, all Active.
5. Run Build / repair again (now applies protections). Install triggers.

**Done when:** the six tabs match SPEC §5 exactly; a second account can type in
`Requests!F2:P2` and `C2:D2` but not in `A2`, `Q2`, `Settings`, `Cards` or
`Event Log`; running Build / repair twice changes nothing the second time.

### Phase 3: main flow
1. Fix anything in the reference `Actions.run`, `Submit` and `Record encoding` that
   fails on first real use. Record each fix in the commit message.
2. Write `Approve`, `Deny`, `Issue to cardholder`, `Issue to requester`, `Return`,
   `No-show`, `Cancel` (§6.2). Skip their Extension and Amendment branches for now,
   leaving a `// Phase 4` comment at each.
3. In `Submit`, make Kind `Amendment` or `Extension` return the error "Amendments and
   extensions are not available yet." until Phase 4.

**Done when** scenarios A1–A6 and E1 in SPEC §15 pass with three accounts
(Requester, Approver/Encoder, Provisioner/Collector).

### Phase 4: linked requests and lost cards
1. Write `Linked.js` (§6.3). Extract `validateRequest_` and `checkEncoding_`.
2. Fill in the `// Phase 4` branches.
3. Write `Report lost`, `Record deactivation`, `Record replacement`.
4. Write `SettingsWatch.js` (§6.6).

**Done when** scenarios B1–B5 and E2 pass.

### Phase 5: contractors
Write `ContractorLog.js` (§6.4). To test without waiting for the timer, run `acmPoll`
by hand from the shell's script editor.

**Done when** scenarios C1–C3 pass.

### Phase 6: reminders and digest
Write `Digest.js` (§6.5). Test by issuing a visitor request whose Valid to is today
and temporarily setting `COLLECTOR_SHIFT_END` so the targets fall in the next hour.
Restore the setting afterwards and clear the test rows from `Sent Log`.

**Done when** scenarios D1–D5 pass, and running `acmPoll` twice in a row sends
nothing the second time.

### Phase 7: pilot
1. Run every scenario in SPEC §15 from a phone (E3).
2. Verify the holiday dates (SPEC §16.3) and load them into `Settings`.
3. Release library version 1 (§9).
4. Create the real Site Sheet, with `developmentMode: false` and `version: "1"`.
   Repeat set-up §4 steps 6–8 for the real users.
5. Run for two weeks. Log every problem in `docs/pilot-log.md`.

**Done when** the measures in SPEC §1.8 are met.

---

## 8. Testing

**Automated (`npm test`).** Covers `pure/` only. `tests/loadGas.js` loads every file
in `library/src/pure` into one shared scope, as Apps Script does, and hands back the
namespaces:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { Cal, Schedule } = require('./loadGas');

test('deadline moves back from a Saturday', () => {
  const cal = { shiftStart: '09:30', shiftEnd: '18:00', holidays: {} };
  assert.equal(Schedule.collectionDeadline('2026-11-14 18:00', cal), '2026-11-13 18:00');
});
```

One gotcha: arrays and objects returned from the loaded code belong to a different
JavaScript realm, so `assert.deepEqual` on them can fail even when they look equal.
Copy them first with `[...array]` or `JSON.parse(JSON.stringify(value))`, as the
existing tests do.

**By hand.** Everything in `gas/` is tested on the test copy using SPEC §15. Use at
least two real accounts: role checks cannot be tested with one.

**Reading failures.** In the shell's script editor, open **Executions**. Each trigger
run is listed with its error. The `Event Log` tab shows `ERROR` and `NOTIFY_FAILED`
rows.

---

## 9. Releasing

1. `npm test` passes. All scenarios for the changed area pass on the test copy.
2. From `library/`: `npx @google/clasp push`, then create a numbered version of the
   library with `npx @google/clasp version "<short note>"` (newer clasp releases may
   call this `create-version`). Note the number it prints.
3. In each real Site Sheet's shell, set `"version": "<number>"` in `appsscript.json`
   and push the shell. The test copy stays on `developmentMode: true`.
4. Tag the git commit `library-v<number>`.

Google allows 200 versions per script (quota page, read 12 Nov 2026).

---

## 10. Known traps

| Trap | What happens | Avoid it by |
|---|---|---|
| Running an action from the menu | It runs as the clicker, cannot write to locked cells, and emails come from them | Never add workflow actions to the menu (ADR 0011) |
| `getValues()` on a time cell | Minutes come back wrong in the Dublin zone | Rule 5 in §3 |
| `PropertiesService` or `LockService` inside the library | All sites share one webhook and one lock | Keep both in `Shell.js`, as now |
| Sharing the sheet with a group | Locks stop working for those people | Named people only |
| Forgetting view access to the library | A user's edits silently fail | Set-up step 6 |
| A handler writing to `Requests` directly | Colour, dropdown and audit get out of step | Return a `patch`; let the runner write |
| Triggers installed twice | Every action runs twice | `acmInstallTriggers` deletes the old ones first. Always use it |
| The Admin leaves | Triggers stop | New Admin: take ownership, update `ADMIN_EMAIL`, run Install triggers and Build / repair |
| Committing `developmentMode: true` | Real sites run unreleased code | Check `shell/appsscript.json` before each commit |
| Editing the header row or moving columns | Every column number is wrong | Layout changes go through `Const.js` and `Template.js` together |
