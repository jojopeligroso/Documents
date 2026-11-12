/**
 * Schedule: Collection Deadline and reminder timing (SPEC §8, §9). Pure.
 * cal = { shiftStart: 'HH:mm', shiftEnd: 'HH:mm', holidays: {..} }  (the Collector's shift)
 */
var Schedule = (function () {
  /** End of the Collector's shift on the Final Day, moved back to a Working Day if needed. */
  function collectionDeadline(validTo, cal) {
    var day = Cal.onOrBeforeWorkingDay(Cal.dateOf(validTo), cal.holidays);
    return Cal.at(day, cal.shiftEnd);
  }

  /** The three reminders for one deadline. `target` = latest acceptable arrival time. */
  function reminderTargets(deadline, cal) {
    var day = Cal.dateOf(deadline);
    var prev = Cal.prevWorkingDay(day, cal.holidays);
    return [
      { type: 'R24', target: Cal.addMinutes(Cal.at(prev, cal.shiftEnd), -30) },
      { type: 'R12', target: Cal.at(day, cal.shiftStart) },
      { type: 'R3',  target: Cal.addMinutes(deadline, -180) }
    ];
  }

  /**
   * What the poller should do with one target right now.
   *   'WAIT' = too early; 'SEND' = send now; 'SKIP' = too late to be useful, never send.
   */
  function decide(now, target, leadMinutes, staleMinutes) {
    if (now < Cal.addMinutes(target, -leadMinutes)) return 'WAIT';
    if (now > Cal.addMinutes(target, staleMinutes)) return 'SKIP';
    return 'SEND';
  }

  return { collectionDeadline: collectionDeadline, reminderTargets: reminderTargets, decide: decide };
})();
