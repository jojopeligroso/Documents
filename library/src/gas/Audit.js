/** Audit: append-only Event Log, and the Sent Log used to send each notification once. */
var Audit = (function () {
  function now(tz) { return Utilities.formatDate(new Date(), tz, DT_FORMAT); }

  function log(ss, tz, actor, action, requestId, serial, from, to, details) {
    ss.getSheetByName(SHEET.EVENTS)
      .appendRow([now(tz), actor, action, requestId || '', serial || '', from || '', to || '', details || '']);
  }

  /** All keys already handled, as an object used as a set. Load once per poll. */
  function sentKeys(ss) {
    const sh = ss.getSheetByName(SHEET.SENT), n = sh.getLastRow() - 1, set = {};
    if (n > 0) sh.getRange(2, 1, n, 1).getValues().forEach(function (r) { set[r[0]] = true; });
    return set;
  }
  function markSent(ss, tz, key, outcome) {
    ss.getSheetByName(SHEET.SENT).appendRow([key, now(tz), outcome]); // outcome: SENT | SKIPPED
  }

  return { now: now, log: log, sentKeys: sentKeys, markSent: markSent };
})();
