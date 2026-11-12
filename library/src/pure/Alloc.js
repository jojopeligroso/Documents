/**
 * Alloc: card double-booking and stock counting (SPEC §7). Pure.
 * A request here is { id, status, serial, start, end, validFrom, validTo } (DateTime strings).
 */
var Alloc = (function () {
  var HOLDS_CARD = ['Encoded', 'Issued', 'Extension pending', 'No-show'];
  var COMMITTED = ['Approved'].concat(HOLDS_CARD);

  /** Half-open intervals [from, to): back-to-back bookings do not overlap. */
  function overlaps(aFrom, aTo, bFrom, bTo) { return aFrom < bTo && bFrom < aTo; }

  /** IDs of other requests that hold `serial` during [from, to). Empty array = free. */
  function serialConflicts(serial, from, to, requests, selfId) {
    return requests.filter(function (r) {
      return r.id !== selfId && r.serial === serial && HOLDS_CARD.indexOf(r.status) !== -1 &&
        r.validFrom && r.validTo && overlaps(from, to, r.validFrom, r.validTo);
    }).map(function (r) { return r.id; });
  }

  /** Cards still free during [from, to): Active cards minus committed overlapping requests. */
  function freeCount(activeCardCount, from, to, requests, selfId) {
    var used = requests.filter(function (r) {
      if (r.id === selfId || COMMITTED.indexOf(r.status) === -1) return false;
      var f = r.validFrom || r.start, t = r.validTo || r.end;
      return f && t && overlaps(from, to, f, t);
    }).length;
    return activeCardCount - used;
  }

  return { overlaps: overlaps, serialConflicts: serialConflicts, freeCount: freeCount };
})();
