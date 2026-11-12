/** Rows: read and write Requests rows as plain objects keyed by the RC field names. */
var Rows = (function () {
  function toObject_(values, display, rowNum, tz) {
    const o = { rowNum: rowNum };
    Object.keys(RC).forEach(function (key) {
      const i = RC[key] - 1;
      if (RC_DATE_COLS.indexOf(RC[key]) !== -1) {
        o[key] = values[i] instanceof Date ? Utilities.formatDate(values[i], tz, D_FORMAT) : '';
      } else {
        o[key] = String(display[i]).trim(); // display text: what the user sees ('09:30', not a Date)
      }
    });
    o.start = o.startDate && o.startTime ? Cal.at(o.startDate, o.startTime) : '';
    o.end = o.endDate && o.endTime ? Cal.at(o.endDate, o.endTime) : '';
    return o;
  }

  function read(sheet, rowNum, tz) {
    const r = sheet.getRange(rowNum, 1, 1, RC_LAST);
    return toObject_(r.getValues()[0], r.getDisplayValues()[0], rowNum, tz);
  }

  /** Every row that has a Request ID. */
  function readAll(sheet, tz) {
    const n = sheet.getLastRow() - 1;
    if (n < 1) return [];
    const r = sheet.getRange(2, 1, n, RC_LAST);
    const v = r.getValues(), d = r.getDisplayValues(), out = [];
    for (let i = 0; i < n; i++) if (d[i][RC.id - 1]) out.push(toObject_(v[i], d[i], i + 2, tz));
    return out;
  }

  function findById(all, id) {
    return all.filter(function (r) { return r.id === id; })[0] || null;
  }

  /**
   * Writes `patch` (field -> value) to one row, then refreshes colour and the Action dropdown.
   * Text columns are pre-formatted as plain text by Template.build, so '09:30' stays text.
   */
  function write(sheet, rowNum, patch, tz) {
    Object.keys(patch).forEach(function (key) {
      if (!RC[key]) throw new Error('Rows.write: unknown field "' + key + '"');
      sheet.getRange(rowNum, RC[key]).setValue(patch[key]);
    });
    const row = read(sheet, rowNum, tz);
    const status = Workflow.statusOf(row.status);
    sheet.getRange(rowNum, 1, 1, RC_LAST).setBackground(STATUS_COLOUR[status] || '#ffffff');
    setActionList(sheet.getRange(rowNum, RC.action), Workflow.availableActions(row));
    return row;
  }

  /** Replaces a cell's dropdown options and clears the current choice. */
  function setActionList(cell, actions) {
    cell.clearContent();
    if (!actions.length) { cell.clearDataValidations(); return; }
    cell.setDataValidation(SpreadsheetApp.newDataValidation()
      .requireValueInList(actions, true).setAllowInvalid(false).build());
  }

  return { read: read, readAll: readAll, findById: findById, write: write, setActionList: setActionList };
})();
