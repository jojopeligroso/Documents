/**
 * Cal: calendar maths on wall-clock strings. No Google services, no time zones.
 *   Date      = 'YYYY-MM-DD'
 *   DateTime  = 'YYYY-MM-DD HH:mm'   (compare with < and >: string order = time order)
 *   Time      = 'HH:mm'
 *   holidays  = object used as a set, e.g. { '2026-12-25': true }
 */
var Cal = (function () {
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function dateToMs(date) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!m) throw new Error('Bad date: "' + date + '" (expected YYYY-MM-DD)');
    return Date.UTC(+m[1], +m[2] - 1, +m[3]);
  }
  function msToDate(ms) {
    var d = new Date(ms);
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
  }
  function dtToMs(dt) {
    var m = /^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2})$/.exec(dt);
    if (!m) throw new Error('Bad date-time: "' + dt + '" (expected YYYY-MM-DD HH:mm)');
    return dateToMs(m[1]) + (+m[2] * 60 + +m[3]) * 60000;
  }
  function msToDt(ms) {
    var d = new Date(ms);
    return msToDate(ms) + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes());
  }

  function isValidDate(s) {
    try { return msToDate(dateToMs(s)) === s; } catch (e) { return false; }
  }
  function isValidTime(s) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(s)); }
  function isValidDateTime(s) {
    var p = String(s).split(' ');
    return p.length === 2 && isValidDate(p[0]) && isValidTime(p[1]);
  }

  function at(date, time) { return date + ' ' + time; }
  function dateOf(dt) { return dt.slice(0, 10); }
  function addDays(date, n) { return msToDate(dateToMs(date) + n * 86400000); }
  function addMinutes(dt, n) { return msToDt(dtToMs(dt) + n * 60000); }

  function isWeekend(date) {
    var wd = new Date(dateToMs(date)).getUTCDay(); // 0 = Sunday, 6 = Saturday
    return wd === 0 || wd === 6;
  }
  function isWorkingDay(date, holidays) {
    return !isWeekend(date) && !(holidays && holidays[date]);
  }
  /** Latest Working Day strictly before `date`. */
  function prevWorkingDay(date, holidays) {
    var d = addDays(date, -1);
    while (!isWorkingDay(d, holidays)) d = addDays(d, -1);
    return d;
  }
  /** `date` itself if it is a Working Day, otherwise the latest Working Day before it. */
  function onOrBeforeWorkingDay(date, holidays) {
    return isWorkingDay(date, holidays) ? date : prevWorkingDay(date, holidays);
  }

  return {
    isValidDate: isValidDate, isValidTime: isValidTime, isValidDateTime: isValidDateTime,
    at: at, dateOf: dateOf, addDays: addDays, addMinutes: addMinutes,
    isWeekend: isWeekend, isWorkingDay: isWorkingDay,
    prevWorkingDay: prevWorkingDay, onOrBeforeWorkingDay: onOrBeforeWorkingDay
  };
})();
