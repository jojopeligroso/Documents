/**
 * Protect: ONE sheet-level protection per tab, with "holes" (unprotected ranges) for the
 * cells people may type in. Recomputed from the Status column, so it can always be repaired
 * by running it again. Must run as the Admin (file owner): the edit trigger and the Admin
 * menu both do.
 */
var Protect = (function () {
  function sheetProtection_(sheet, description) {
    const existing = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    const p = existing.length ? existing[0] : sheet.protect();
    p.setDescription(description).setWarningOnly(false);
    p.removeEditors(p.getEditors()); // the owner and the current user always remain
    if (p.canDomainEdit()) p.setDomainEdit(false);
    return p;
  }

  /** Which block of columns is open for a row in this status? */
  function openBlock_(statusCell) {
    const s = Workflow.statusOf(statusCell);
    if (s === Workflow.S.DRAFT) return RC_ENTRY;
    if (s === Workflow.S.APPROVED || s === Workflow.S.LOST) return RC_ENCODE;
    return null;
  }

  function syncRequests(ss) {
    const sh = ss.getSheetByName(SHEET.REQUESTS);
    const maxRows = sh.getMaxRows(), lastRow = Math.max(sh.getLastRow(), 1);
    const statuses = lastRow > 1 ? sh.getRange(2, RC.status, lastRow - 1, 1).getDisplayValues() : [];

    // Action + Action note are open on every row, always.
    const holes = [sh.getRange(2, RC.action, maxRows - 1, 2)];

    // Merge neighbouring rows that open the same block into one range.
    let runStart = 0, runBlock = null;
    const flush = function (endRow) {
      if (runBlock) {
        holes.push(sh.getRange(runStart, runBlock.first, endRow - runStart + 1, runBlock.last - runBlock.first + 1));
      }
    };
    for (let row = 2; row <= maxRows; row++) {
      const block = row <= lastRow ? openBlock_(statuses[row - 2][0]) : RC_ENTRY; // empty tail = Draft
      if (block !== runBlock) { flush(row - 1); runStart = row; runBlock = block; }
    }
    flush(maxRows);

    sheetProtection_(sh, 'ACM: Requests (managed by script)').setUnprotectedRanges(holes);
  }

  function syncLog(ss) {
    const sh = ss.getSheetByName(SHEET.LOG);
    sheetProtection_(sh, 'ACM: Contractor Log (managed by script)')
      .setUnprotectedRanges([sh.getRange(2, LC.action, sh.getMaxRows() - 1, 2)]);
  }

  /** Fully locked tabs: only the Admin (and the script running as the Admin) can write. */
  function syncLocked(ss) {
    [SHEET.EVENTS, SHEET.SENT, SHEET.CARDS].forEach(function (name) {
      sheetProtection_(ss.getSheetByName(name), 'ACM: ' + name + ' (managed by script)');
    });
  }

  /** Settings: Admin + current Approver only. Call whenever APPROVER_EMAIL changes. */
  function syncSettings(ss, approverEmail) {
    const p = sheetProtection_(ss.getSheetByName(SHEET.SETTINGS), 'ACM: Settings (managed by script)');
    if (approverEmail) p.addEditor(approverEmail);
  }

  function syncAll(ss, settings) {
    syncRequests(ss); syncLog(ss); syncLocked(ss); syncSettings(ss, settings.approver);
  }

  return { syncRequests: syncRequests, syncLog: syncLog, syncSettings: syncSettings, syncAll: syncAll };
})();
