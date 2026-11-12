const test = require('node:test');
const assert = require('node:assert/strict');
const { Alloc } = require('./loadGas');

const reqs = [
  { id: 'DUB-0001', status: 'Issued', serial: 'C-01', validFrom: '2026-11-10 09:30', validTo: '2026-11-12 18:00' },
  { id: 'DUB-0002', status: 'Closed', serial: 'C-02', validFrom: '2026-11-10 09:30', validTo: '2026-11-12 18:00' },
  { id: 'DUB-0003', status: 'Approved', start: '2026-11-11 09:30', end: '2026-11-11 18:00' }
];

test('a card cannot be double-booked', () => {
  assert.deepEqual([...Alloc.serialConflicts('C-01', '2026-11-12 09:30', '2026-11-13 18:00', reqs, 'DUB-0009')], ['DUB-0001']);
});

test('back-to-back bookings, finished requests and the request itself do not conflict', () => {
  assert.equal(Alloc.serialConflicts('C-01', '2026-11-12 18:00', '2026-11-13 18:00', reqs, 'DUB-0009').length, 0);
  assert.equal(Alloc.serialConflicts('C-02', '2026-11-10 09:30', '2026-11-12 18:00', reqs, 'DUB-0009').length, 0);
  assert.equal(Alloc.serialConflicts('C-01', '2026-11-10 09:30', '2026-11-12 18:00', reqs, 'DUB-0001').length, 0);
});

test('free count subtracts approved and card-holding requests that overlap', () => {
  assert.equal(Alloc.freeCount(10, '2026-11-11 09:30', '2026-11-11 18:00', reqs, 'DUB-0009'), 8);
  assert.equal(Alloc.freeCount(10, '2026-11-20 09:30', '2026-11-20 18:00', reqs, 'DUB-0009'), 10);
});
