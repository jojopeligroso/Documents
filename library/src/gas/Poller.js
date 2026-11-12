/**
 * Poller: everything time-based. Runs every 15 minutes. Every job is idempotent:
 * it works out what SHOULD have happened by now and does whatever is missing.
 */
var Poller = (function () {

  function run(ss, cfg) {
    const s = Settings.load(ss), tz = s.tz, now = Audit.now(tz), today = Cal.dateOf(now);
    const reqSheet = ss.getSheetByName(SHEET.REQUESTS);
    const all = Rows.readAll(reqSheet, tz);
    const sent = Audit.sentKeys(ss);
    const once = function (key, fn) { // run fn at most once ever for this key
      if (sent[key]) return;
      const outcome = fn();
      sent[key] = true;
      Audit.markSent(ss, tz, key, outcome || 'SENT');
    };

    reminders_(ss, s, now, all, once);
    visitorOverdue_(ss, s, cfg, now, all, once);
    if (Cal.isWorkingDay(today, s.cal.holidays)) {
      ContractorLog.ensureRows(ss, s, now, all);          // plan §7.3
      ContractorLog.flagOverdue(ss, s, cfg, now, once);   // plan §7.4
      Digest.send(ss, s, cfg, now, all, once);            // plan §7.6
    }
  }

  /** 24h / 12h / 3h reminders to the Collector and the Host, for visitor cards that are out. */
  function reminders_(ss, s, now, all, once) {
    const LABEL = { R24: 'tomorrow', R12: 'today', R3: 'in the next 3 hours' };
    all.filter(function (r) {
      return r.type === 'Visitor' && r.deadline && now <= r.deadline &&
        (r.status === Workflow.S.ISSUED || r.status === Workflow.S.EXT_PENDING);
    }).forEach(function (r) {
      Schedule.reminderTargets(r.deadline, s.cal).forEach(function (t) {
        const verdict = Schedule.decide(now, t.target, s.leadMinutes, 60);
        if (verdict === 'WAIT') return;
        // The deadline is part of the key: after an extension, a fresh set of reminders is due.
        once([t.type, r.id, r.deadline].join('|'), function () {
          if (verdict === 'SKIP') return 'SKIPPED';
          const lines = [
            'Access card ' + r.serial + ' held by ' + r.name + ' is due back ' + LABEL[t.type] + '.',
            'Hand it to the Collector by ' + r.deadline + '.', '', 'Request ' + r.id + ', host ' + r.host + '.'
          ];
          const err = Notify.email([Settings.collectorEmail(s), r.host], '[' + r.id + '] Card due back ' + LABEL[t.type], lines);
          if (err) Audit.log(ss, s.tz, 'system', 'NOTIFY_FAILED', r.id, r.serial, '', '', err);
          return 'SENT';
        });
      });
    });
  }

  /** Visitor card still out after the Collection Deadline: email the Collector, post to the Admin Space. */
  function visitorOverdue_(ss, s, cfg, now, all, once) {
    all.filter(function (r) {
      return r.type === 'Visitor' && r.deadline && now > r.deadline &&
        (r.status === Workflow.S.ISSUED || r.status === Workflow.S.EXT_PENDING);
    }).forEach(function (r) {
      once(['OVERDUE', r.id, r.deadline].join('|'), function () {
        const text = '⚠️ ' + r.id + ': card ' + r.serial + ' (' + r.name + ') was due back by ' + r.deadline + ' and has not been returned.';
        [Notify.email(Settings.collectorEmail(s), '[' + r.id + '] Card overdue', [text]), Notify.chat(cfg.webhookUrl, text)]
          .filter(Boolean).forEach(function (err) { Audit.log(ss, s.tz, 'system', 'NOTIFY_FAILED', r.id, r.serial, '', '', err); });
        return 'SENT';
      });
    });
  }

  return { run: run };
})();
