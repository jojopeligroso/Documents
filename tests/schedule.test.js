const test = require('node:test');
const assert = require('node:assert/strict');
const { Schedule } = require('./loadGas');

const cal = { shiftStart: '09:30', shiftEnd: '18:00', holidays: { '2026-12-25': true } };

test('deadline is the end of the Collector shift on the Final Day', () => {
  assert.equal(Schedule.collectionDeadline('2026-11-13 16:00', cal), '2026-11-13 18:00');
});

test('deadline moves back when the Final Day is a weekend or holiday', () => {
  assert.equal(Schedule.collectionDeadline('2026-11-14 18:00', cal), '2026-11-13 18:00'); // Sat -> Fri
  assert.equal(Schedule.collectionDeadline('2026-12-26 18:00', cal), '2026-12-24 18:00'); // Sat, Fri holiday -> Thu
});

test('reminder targets are 17:30 previous working day, 09:30 and 15:00', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(Schedule.reminderTargets('2026-11-16 18:00', cal))), [
    { type: 'R24', target: '2026-11-13 17:30' }, // deadline Monday -> previous Friday
    { type: 'R12', target: '2026-11-16 09:30' },
    { type: 'R3', target: '2026-11-16 15:00' }
  ]);
});

test('decide: wait, send inside the window, skip when stale', () => {
  const t = '2026-11-16 09:30';
  assert.equal(Schedule.decide('2026-11-16 08:59', t, 30, 60), 'WAIT');
  assert.equal(Schedule.decide('2026-11-16 09:00', t, 30, 60), 'SEND');
  assert.equal(Schedule.decide('2026-11-16 10:30', t, 30, 60), 'SEND');
  assert.equal(Schedule.decide('2026-11-16 10:31', t, 30, 60), 'SKIP');
});
