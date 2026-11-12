/** Cards: the card pool (Cards tab). State is Active | Lost | Retired. */
var Cards = (function () {
  function find_(ss, serial) {
    const sh = ss.getSheetByName(SHEET.CARDS), n = sh.getLastRow() - 1;
    if (n < 1 || !serial) return null;
    const rows = sh.getRange(2, 1, n, 2).getDisplayValues();
    for (let i = 0; i < n; i++) {
      if (rows[i][0].trim() === serial) return { sheet: sh, rowNum: i + 2, state: rows[i][1].trim() };
    }
    return null;
  }

  /** Number of cards whose state is Active. */
  function activeCount(ss) {
    const sh = ss.getSheetByName(SHEET.CARDS), n = sh.getLastRow() - 1;
    if (n < 1) return 0;
    return sh.getRange(2, 1, n, 2).getDisplayValues()
      .filter(function (r) { return r[0].trim() && r[1].trim() === 'Active'; }).length;
  }

  /** 'Active', 'Lost', 'Retired', or '' if the serial is not in the pool. */
  function stateOf(ss, serial) {
    const hit = find_(ss, serial);
    return hit ? hit.state : '';
  }

  /** Records which request holds the card. Pass '' to free it. Unknown serials are ignored. */
  function setInUseBy(ss, serial, requestId) {
    const hit = find_(ss, serial);
    if (hit) hit.sheet.getRange(hit.rowNum, CARD.inUseBy).setValue(requestId || '');
  }

  function setState(ss, serial, state) {
    const hit = find_(ss, serial);
    if (hit) hit.sheet.getRange(hit.rowNum, CARD.state).setValue(state);
  }

  return { activeCount: activeCount, stateOf: stateOf, setInUseBy: setInUseBy, setState: setState };
})();
