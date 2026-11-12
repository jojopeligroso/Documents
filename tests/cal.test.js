const test = require('node:test');
const assert = require('node:assert/strict');
const { Cal } = require('./loadGas');

const H = { '2026-12-25': true, '2027-03-17': true };

test('weekends and holidays are not working days', () => {
  assert.equal(Cal.isWorkingDay('2026-11-13', H), true);   // Friday
  assert.equal(Cal.isWorkingDay('2026-11-14', H), false);  // Saturday
  assert.equal(Cal.isWorkingDay('2026-11-15', H), false);  // Sunday
  assert.equal(Cal.isWorkingDay('2026-12-25', H), false);  // Christmas Day (a Friday)
});

test('prevWorkingDay skips weekends and holidays', () => {
  assert.equal(Cal.prevWorkingDay('2026-11-16', H), '2026-11-13'); // Mon -> Fri
  assert.equal(Cal.prevWorkingDay('2026-12-28', H), '2026-12-24'); // Mon -> Thu (Fri is a holiday)
});

test('onOrBeforeWorkingDay keeps working days and moves others back', () => {
  assert.equal(Cal.onOrBeforeWorkingDay('2026-11-13', H), '2026-11-13');
  assert.equal(Cal.onOrBeforeWorkingDay('2026-11-14', H), '2026-11-13');
});

test('date-time arithmetic crosses midnight, month and year ends', () => {
  assert.equal(Cal.addMinutes('2026-11-13 18:00', -180), '2026-11-13 15:00');
  assert.equal(Cal.addMinutes('2026-12-31 23:30', 60), '2027-01-01 00:30');
  assert.equal(Cal.addDays('2027-02-28', 1), '2027-03-01');
});

test('validators', () => {
  assert.equal(Cal.isValidTime('09:30'), true);
  assert.equal(Cal.isValidTime('9:30'), false);
  assert.equal(Cal.isValidTime('24:00'), false);
  assert.equal(Cal.isValidDate('2027-02-30'), false);
  assert.equal(Cal.isValidDateTime('2026-11-13 18:00'), true);
  assert.equal(Cal.isValidDateTime('2026-11-13T18:00'), false);
});
