const test = require('node:test');
const assert = require('node:assert/strict');
const { Workflow } = require('./loadGas');

const settings = {
  admin: 'admin@example.ie', approver: 'rom@example.ie', encoder: 'rom@example.ie',
  provisioner: 'om@example.ie', collector: '', requesters: ['pm@example.ie', 'om@example.ie']
};
const list = (a) => [...a];

test('roles: one person can hold several; blank collector = provisioner; approver can request', () => {
  assert.deepEqual(list(Workflow.rolesOf('ROM@example.ie', settings)), ['ANY', 'APPROVER', 'REQUESTER', 'ENCODER']);
  assert.deepEqual(list(Workflow.rolesOf('om@example.ie', settings)), ['ANY', 'PROVISIONER', 'COLLECTOR', 'REQUESTER']);
  assert.deepEqual(list(Workflow.rolesOf('', settings)), []);
});

test('dropdown offers only actions valid for the status', () => {
  assert.deepEqual(list(Workflow.availableActions({ status: '' })), ['Submit']);
  assert.deepEqual(list(Workflow.availableActions({ status: 'Submitted' })), ['Approve', 'Deny', 'Cancel']);
  assert.deepEqual(list(Workflow.availableActions({ status: 'Encoded', kind: 'New', type: 'Visitor' })),
    ['Issue to cardholder', 'Issue to requester', 'No-show', 'Cancel', 'Report lost']);
  assert.deepEqual(list(Workflow.availableActions({ status: 'Closed' })), []);
});

test('contractors are never "issued" from the Requests tab', () => {
  assert.deepEqual(list(Workflow.availableActions({ status: 'Encoded', kind: 'New', type: 'Contractor' })),
    ['No-show', 'Cancel', 'Report lost']);
});

test('a lost card offers Encoder actions until the task is closed', () => {
  assert.deepEqual(list(Workflow.availableActions({ status: 'Lost' })), ['Record deactivation', 'Record replacement']);
  assert.deepEqual(list(Workflow.availableActions({ status: 'Lost', deactivatedAt: '2026-11-12 10:00' })), []);
});

test('permission checks', () => {
  const pm = Workflow.rolesOf('pm@example.ie', settings);
  const rom = Workflow.rolesOf('rom@example.ie', settings);
  assert.equal(Workflow.check('Approve', { status: 'Submitted' }, pm).ok, false);
  assert.equal(Workflow.check('Approve', { status: 'Submitted' }, rom).ok, true);
  assert.equal(Workflow.check('Approve', { status: 'Approved' }, rom).ok, false);
  assert.equal(Workflow.check('Report lost', { status: 'Issued' }, pm).ok, true);
  assert.equal(Workflow.check('Submit', { status: '' }, []).ok, false); // unidentified user
});

test('auto-approval and post-encoding status', () => {
  assert.equal(Workflow.submitTarget(Workflow.rolesOf('rom@example.ie', settings)), 'Approved');
  assert.equal(Workflow.submitTarget(Workflow.rolesOf('pm@example.ie', settings)), 'Submitted');
  assert.equal(Workflow.encodeTarget({ kind: 'New' }), 'Encoded');
  assert.equal(Workflow.encodeTarget({ kind: 'Amendment', issuedAt: '2026-11-10 09:40' }), 'Issued');
  assert.equal(Workflow.encodeTarget({ kind: 'Extension' }), 'Closed');
});

test('contractor log actions', () => {
  const om = Workflow.rolesOf('om@example.ie', settings);
  assert.deepEqual(list(Workflow.availableLogActions('Pending')), ['Check out']);
  assert.deepEqual(list(Workflow.availableLogActions('Overdue')), ['Check in']);
  assert.equal(Workflow.checkLog('Check out', 'Pending', om).ok, true);
  assert.equal(Workflow.checkLog('Check in', 'Pending', om).ok, false);
});
