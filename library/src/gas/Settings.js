/**
 * Settings: reads the Settings tab into one plain object.
 * Layout (SPEC §5.4): A = Key, B = Value | D = Requester emails | F = Holiday date, G = Holiday name.
 * Row 1 is headers. Keys are found by name, so their row order does not matter.
 */
var Settings = (function () {
  var REQUIRED = ['SITE_CODE', 'ORG_DOMAIN', 'ADMIN_EMAIL', 'APPROVER_EMAIL', 'ENCODER_EMAIL',
    'PROVISIONER_EMAIL', 'COLLECTOR_SHIFT_START', 'COLLECTOR_SHIFT_END', 'DEFAULT_START_TIME',
    'DEFAULT_END_TIME', 'REMINDER_LEAD_MINUTES', 'LOW_STOCK_THRESHOLD', 'NEXT_REQUEST_NUMBER'];

  function load(ss) {
    const sh = ss.getSheetByName(SHEET.SETTINGS);
    const n = Math.max(sh.getLastRow() - 1, 1);
    const tz = ss.getSpreadsheetTimeZone();

    const kv = {};
    sh.getRange(2, 1, n, 2).getDisplayValues().forEach(function (r) {
      if (r[0]) kv[r[0].trim()] = r[1].trim();
    });
    REQUIRED.forEach(function (k) {
      if (!kv[k]) throw new Error('Settings: "' + k + '" is missing or blank.');
    });
    ['COLLECTOR_SHIFT_START', 'COLLECTOR_SHIFT_END', 'DEFAULT_START_TIME', 'DEFAULT_END_TIME'].forEach(function (k) {
      if (!Cal.isValidTime(kv[k])) throw new Error('Settings: "' + k + '" must be HH:mm, e.g. 09:30.');
    });

    const requesters = sh.getRange(2, 4, n, 1).getDisplayValues()
      .map(function (r) { return r[0].trim().toLowerCase(); }).filter(Boolean);

    const holidays = {};
    sh.getRange(2, 6, n, 1).getValues().forEach(function (r) {
      if (r[0] instanceof Date) holidays[Utilities.formatDate(r[0], tz, D_FORMAT)] = true;
    });

    const lower = function (k) { return (kv[k] || '').toLowerCase(); };
    return {
      siteCode: kv.SITE_CODE,
      orgDomain: lower('ORG_DOMAIN'),
      admin: lower('ADMIN_EMAIL'), approver: lower('APPROVER_EMAIL'), encoder: lower('ENCODER_EMAIL'),
      provisioner: lower('PROVISIONER_EMAIL'), collector: lower('COLLECTOR_EMAIL'), // may be ''
      requesters: requesters,
      defaultStartTime: kv.DEFAULT_START_TIME, defaultEndTime: kv.DEFAULT_END_TIME,
      leadMinutes: Number(kv.REMINDER_LEAD_MINUTES),
      lowStock: Number(kv.LOW_STOCK_THRESHOLD),
      cal: { shiftStart: kv.COLLECTOR_SHIFT_START, shiftEnd: kv.COLLECTOR_SHIFT_END, holidays: holidays },
      tz: tz
    };
  }

  /** The Collector's email, falling back to the Provisioner. */
  function collectorEmail(s) { return s.collector || s.provisioner; }

  /** Returns the next Request ID (e.g. 'DUB-0042') and advances the counter. Call under the lock. */
  function takeNextId(ss, siteCode) {
    const sh = ss.getSheetByName(SHEET.SETTINGS);
    const keys = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getDisplayValues();
    for (let i = 0; i < keys.length; i++) {
      if (keys[i][0].trim() === 'NEXT_REQUEST_NUMBER') {
        const cell = sh.getRange(i + 2, 2);
        const n = Number(cell.getValue());
        cell.setValue(n + 1);
        return siteCode + '-' + ('0000' + n).slice(-4);
      }
    }
    throw new Error('Settings: "NEXT_REQUEST_NUMBER" is missing.');
  }

  return { load: load, collectorEmail: collectorEmail, takeNextId: takeNextId };
})();
