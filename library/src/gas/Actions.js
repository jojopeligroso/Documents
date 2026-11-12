/**
 * Actions: runs one Requests-tab action end to end.
 *
 * Every handler receives a context `c` and returns either
 *   { error: 'text shown in the Message column' }            -> nothing is changed
 * or
 *   { patch: {field: value},        changes to this row (must include `status` if it changes)
 *     message: 'text for Message',  optional
 *     others: [{rowNum, patch}],    optional changes to other Requests rows
 *     events: [[action, details]],  optional extra Event Log lines
 *     emails: [{to, subject, extra: [lines]}],  optional
 *     chat: 'one line for the Admin Space',     optional
 *     reprotect: true }             set when the row's open cells change (see Protect)
 */
var Actions = (function () {

  function run(ss, sheet, rowNum, action, actor, cfg) {
    const settings = Settings.load(ss);
    const tz = settings.tz;
    const row = Rows.read(sheet, rowNum, tz);
    const actionCell = sheet.getRange(rowNum, RC.action);
    const fail = function (text) {
      sheet.getRange(rowNum, RC.message).setValue('✗ ' + text);
      actionCell.clearContent(); // the dropdown list stays; only the choice is cleared
    };

    const roles = Workflow.rolesOf(actor, settings);
    const verdict = Workflow.check(action, row, roles);
    if (!verdict.ok) return fail(verdict.error);

    const c = {
      ss: ss, sheet: sheet, row: row, actor: actor, roles: roles, settings: settings, tz: tz,
      now: Audit.now(tz), note: row.note, all: Rows.readAll(sheet, tz)
    };
    const result = HANDLERS[action](c);
    if (result.error) return fail(result.error);

    // 1. Apply changes. This row first, then any linked rows.
    const patch = result.patch || {};
    patch.note = '';
    patch.message = '✓ ' + (result.message || action + ' recorded.');
    const after = Rows.write(sheet, rowNum, patch, tz);
    (result.others || []).forEach(function (o) { Rows.write(sheet, o.rowNum, o.patch, tz); });
    if (result.reprotect) Protect.syncRequests(ss);

    // 2. Audit.
    Audit.log(ss, tz, actor, action, after.id, after.serial,
      Workflow.statusOf(row.status), Workflow.statusOf(after.status), row.note);
    (result.events || []).forEach(function (e) { Audit.log(ss, tz, actor, e[0], after.id, after.serial, '', '', e[1]); });

    // 3. Notify. Failures are logged, never thrown.
    const problems = [];
    (result.emails || []).forEach(function (m) {
      const lines = Notify.summary(after).concat(m.extra || []);
      if (m.link !== false) lines.push('', 'Open: ' + Notify.rowLink(ss, sheet, rowNum));
      problems.push(Notify.email(m.to, '[' + after.id + '] ' + m.subject, lines));
    });
    if (result.chat) problems.push(Notify.chat(cfg.webhookUrl, result.chat));
    problems.filter(Boolean).forEach(function (p) { Audit.log(ss, tz, 'system', 'NOTIFY_FAILED', after.id, '', '', '', p); });
  }

  // ---------------------------------------------------------------- handlers

  var HANDLERS = {};

  /** Submit a New request. (Amendment and Extension rows branch off here: see plan §6.3.) */
  HANDLERS['Submit'] = function (c) {
    const r = c.row, s = c.settings;
    const kind = r.kind || Workflow.KIND.NEW;
    if (kind !== Workflow.KIND.NEW) return Linked.submit(c, kind);

    const missing = ['name', 'type', 'host', 'startDate', 'endDate'].filter(function (f) { return !r[f]; });
    if (missing.length) return { error: 'Fill in: ' + missing.join(', ') + '.' };
    if (!new RegExp('^[^@\\s]+@' + s.orgDomain.replace(/\./g, '\\.') + '$', 'i').test(r.host)) {
      return { error: 'Host must be an @' + s.orgDomain + ' email address.' };
    }
    const startTime = r.startTime || s.defaultStartTime, endTime = r.endTime || s.defaultEndTime;
    if (!Cal.isValidTime(startTime) || !Cal.isValidTime(endTime)) return { error: 'Times must look like 09:30.' };
    const start = Cal.at(r.startDate, startTime), end = Cal.at(r.endDate, endTime);
    if (start >= end) return { error: 'The end must be after the start.' };
    if (!Cal.isWorkingDay(r.startDate, s.cal.holidays)) return { error: 'The visit must start on a working day.' };

    const id = Settings.takeNextId(c.ss, s.siteCode);
    const status = Workflow.submitTarget(c.roles);
    const patch = {
      id: id, kind: kind, startTime: startTime, endTime: endTime,
      requester: c.actor, submittedAt: c.now, status: status
    };
    const out = { patch: patch, reprotect: true, emails: [], events: [] };

    const free = Alloc.freeCount(Cards.activeCount(c.ss), start, end, c.all, id);
    const stockNote = free < s.lowStock ? ' Low stock: ' + Math.max(free, 0) + ' card(s) free for these dates.' : '';

    if (status === Workflow.S.APPROVED) { // the Approver's own request
      patch.decisionBy = c.actor; patch.decisionAt = c.now;
      patch.validFrom = start; patch.validTo = end; // defaults the Encoder may change
      out.events.push(['Approve', 'Auto-approved: requester is the Approver']);
      out.emails.push({ to: s.encoder, subject: 'Card to encode', extra: ['Action needed: encode a card, then choose "Record encoding".'] });
      out.chat = '✅ ' + id + ' submitted and auto-approved by ' + c.actor + ': ' + r.name + ' (' + r.type + '), ' + start + ' → ' + end + '.' + stockNote;
    } else {
      out.emails.push({ to: s.approver, subject: 'Approval needed', extra: ['Action needed: choose "Approve" or "Deny".'] });
      out.chat = '📝 ' + id + ' submitted by ' + c.actor + ': ' + r.name + ' (' + r.type + '), ' + start + ' → ' + end + '.' + stockNote;
    }
    out.message = 'Submitted as ' + id + '.' + stockNote;
    return out;
  };

  /** Encoder confirms the card is encoded in the access-control system. */
  HANDLERS['Record encoding'] = function (c) {
    const r = c.row, s = c.settings;
    if (!r.serial) return { error: 'Choose the card serial first.' };
    if (!Cal.isValidDateTime(r.validFrom) || !Cal.isValidDateTime(r.validTo)) {
      return { error: 'Valid from / Valid to must look like 2026-11-12 09:30.' };
    }
    if (r.validFrom >= r.validTo) return { error: 'Valid to must be after Valid from.' };
    if (Cards.stateOf(c.ss, r.serial) !== 'Active') return { error: 'Card ' + r.serial + ' is not an Active card in the Cards tab.' };

    if (r.kind === Workflow.KIND.EXTENSION) return Linked.encodeExtension(c);

    const clash = Alloc.serialConflicts(r.serial, r.validFrom, r.validTo, c.all, r.id);
    if (clash.length) return { error: 'Card ' + r.serial + ' is already booked for those dates by ' + clash.join(', ') + '.' };

    const status = Workflow.encodeTarget(r);
    Cards.setInUseBy(c.ss, r.serial, r.id);
    return {
      patch: {
        status: status, encodedBy: c.actor, encodedAt: c.now,
        deadline: Schedule.collectionDeadline(r.validTo, s.cal)
      },
      reprotect: true,
      emails: [{
        to: [s.provisioner, Settings.collectorEmail(s), r.requester], subject: 'Card encoded',
        extra: ['Card ' + r.serial + ' is ready, valid ' + r.validFrom + ' to ' + r.validTo + '.']
      }],
      chat: '💳 ' + r.id + ' encoded by ' + c.actor + ': card ' + r.serial + ', valid ' + r.validFrom + ' → ' + r.validTo + '.'
    };
  };

  // The remaining handlers follow the same shape. Their exact effects are in plan §6.2:
  // 'Approve', 'Deny', 'Issue to cardholder', 'Issue to requester', 'Return', 'No-show',
  // 'Cancel', 'Report lost', 'Record deactivation', 'Record replacement'.

  return { run: run, HANDLERS: HANDLERS };
})();
