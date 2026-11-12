/**
 * Api: the ONLY functions the shell calls. Names without a trailing underscore are
 * visible to scripts that include this library as `ACM`.
 * cfg = { webhookUrl: string|null }   (read by the shell from ITS OWN Script Properties)
 */

/** Cheap test, no lock needed: is this edit a choice in an Action dropdown, or a Settings edit? */
function isRelevantEdit(e) {
  if (!e || !e.range) return false;
  const name = e.range.getSheet().getName();
  if (name === SHEET.SETTINGS) return true;
  const actionCol = name === SHEET.REQUESTS ? RC.action : name === SHEET.LOG ? LC.action : 0;
  return actionCol > 0 && e.range.getNumRows() === 1 && e.range.getNumColumns() === 1 &&
    e.range.getColumn() === actionCol && e.range.getRow() >= 2 && String(e.range.getValue()).trim() !== '';
}

/** Installable on-edit entry point. The shell holds the lock while this runs. */
function handleEdit(e, cfg) {
  const ss = e.source, sheet = e.range.getSheet(), name = sheet.getName();
  const actor = e.user ? String(e.user.getEmail() || '').trim().toLowerCase() : '';
  try {
    if (name === SHEET.SETTINGS) return SettingsWatch.onEdit(ss, e, actor, cfg); // plan §6.6
    const action = String(e.range.getValue()).trim();
    if (name === SHEET.REQUESTS) return Actions.run(ss, sheet, e.range.getRow(), action, actor, cfg);
    if (name === SHEET.LOG) return ContractorLog.run(ss, sheet, e.range.getRow(), action, actor, cfg);
  } catch (err) {
    // Last-resort safety net: tell the user on the row, record it, and re-throw for the execution log.
    const msgCol = name === SHEET.LOG ? LC.message : RC.message;
    if (name !== SHEET.SETTINGS) {
      sheet.getRange(e.range.getRow(), msgCol).setValue('✗ Something went wrong: ' + err.message + ' Tell the Admin.');
      e.range.clearContent();
    }
    Audit.log(ss, ss.getSpreadsheetTimeZone(), actor || 'unknown', 'ERROR', '', '', '', '', String(err.stack || err));
    throw err;
  }
}

/** Time-driven entry point (every 15 minutes). The shell holds the lock while this runs. */
function poll(cfg) {
  Poller.run(SpreadsheetApp.getActiveSpreadsheet(), cfg);
}

/** Admin menu: create missing tabs/headers/validation and re-apply all protections. */
function repair() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Template.build(ss);                      // plan §6.7
  Protect.syncAll(ss, Settings.load(ss));
}

/** True if the person using the menu is the Admin named in Settings. */
function isAdmin() {
  const me = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  return me !== '' && me === Settings.load(SpreadsheetApp.getActiveSpreadsheet()).admin;
}
