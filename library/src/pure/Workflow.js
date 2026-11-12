/**
 * Workflow: statuses, actions, and who may do what (SPEC §4, §6). Pure.
 * This table is the single source of truth. The Action dropdown and every
 * permission check are derived from it.
 */
var Workflow = (function () {
  var S = {
    DRAFT: 'Draft', SUBMITTED: 'Submitted', APPROVED: 'Approved', DENIED: 'Denied',
    ENCODED: 'Encoded', ISSUED: 'Issued', EXT_PENDING: 'Extension pending',
    CLOSED: 'Closed', CANCELLED: 'Cancelled', NO_SHOW: 'No-show', LOST: 'Lost'
  };
  var KIND = { NEW: 'New', AMENDMENT: 'Amendment', EXTENSION: 'Extension' };
  var NOT_EXT = [KIND.NEW, KIND.AMENDMENT];

  // from: statuses the row must be in.  roles: any one is enough ('ANY' = anyone identified).
  // kinds/types: optional restrictions.  Order here = order shown in the dropdown.
  var ACTIONS = {
    'Submit':              { from: [S.DRAFT], roles: ['REQUESTER'] },
    'Approve':             { from: [S.SUBMITTED], roles: ['APPROVER'] },
    'Deny':                { from: [S.SUBMITTED], roles: ['APPROVER'] },
    'Record encoding':     { from: [S.APPROVED], roles: ['ENCODER'] },
    'Issue to cardholder': { from: [S.ENCODED], roles: ['PROVISIONER'], kinds: NOT_EXT, types: ['Visitor'] },
    'Issue to requester':  { from: [S.ENCODED], roles: ['PROVISIONER'], kinds: NOT_EXT, types: ['Visitor'] },
    'Return':              { from: [S.ISSUED, S.EXT_PENDING], roles: ['COLLECTOR'] },
    'No-show':             { from: [S.ENCODED], roles: ['PROVISIONER'] },
    'Cancel':              { from: [S.SUBMITTED, S.APPROVED, S.ENCODED, S.NO_SHOW], roles: ['REQUESTER', 'COLLECTOR'] },
    'Report lost':         { from: [S.ENCODED, S.ISSUED, S.EXT_PENDING], roles: ['ANY'] },
    'Record deactivation': { from: [S.LOST], roles: ['ENCODER'], open: true },
    'Record replacement':  { from: [S.LOST], roles: ['ENCODER'], open: true }
  };

  var LOG_ACTIONS = {
    'Check out': { from: ['Pending'], roles: ['COLLECTOR'] },
    'Check in':  { from: ['Out', 'Overdue'], roles: ['COLLECTOR'] }
  };

  /** A blank Status cell means Draft. */
  function statusOf(cell) { return cell ? String(cell) : S.DRAFT; }

  function applies(def, row) {
    if (def.from.indexOf(statusOf(row.status)) === -1) return false;
    if (def.kinds && def.kinds.indexOf(row.kind || KIND.NEW) === -1) return false;
    if (def.types && def.types.indexOf(row.type) === -1) return false;
    if (def.open && row.deactivatedAt) return false; // lost-card task already closed
    return true;
  }

  /** Action names valid for this row right now, whoever the user is. Feeds the dropdown. */
  function availableActions(row) {
    return Object.keys(ACTIONS).filter(function (name) { return applies(ACTIONS[name], row); });
  }
  function availableLogActions(logStatus) {
    return Object.keys(LOG_ACTIONS).filter(function (name) {
      return LOG_ACTIONS[name].from.indexOf(logStatus) !== -1;
    });
  }

  /**
   * Roles held by `email`. settings = { admin, approver, encoder, provisioner, collector,
   * requesters: [] } (all lower-case). A blank collector means "same as provisioner".
   * The Approver always counts as a Requester.
   */
  function rolesOf(email, settings) {
    var e = String(email || '').trim().toLowerCase();
    if (!e) return [];
    var roles = ['ANY'];
    if (e === settings.admin) roles.push('ADMIN');
    if (e === settings.approver) roles.push('APPROVER', 'REQUESTER');
    if (e === settings.encoder) roles.push('ENCODER');
    if (e === settings.provisioner) roles.push('PROVISIONER');
    if (e === (settings.collector || settings.provisioner)) roles.push('COLLECTOR');
    if (settings.requesters.indexOf(e) !== -1 && roles.indexOf('REQUESTER') === -1) roles.push('REQUESTER');
    return roles;
  }

  function checkAgainst(table, name, isAllowedNow, roles, statusLabel) {
    var def = table[name];
    if (!def) return { ok: false, error: 'Unknown action "' + name + '".' };
    if (!roles.length) return { ok: false, error: 'Could not identify you, so no action was taken. Tell the Admin.' };
    if (!isAllowedNow(def)) return { ok: false, error: '"' + name + '" is not possible while the status is ' + statusLabel + '.' };
    var allowed = def.roles.some(function (r) { return roles.indexOf(r) !== -1; });
    if (!allowed) return { ok: false, error: 'Only the ' + def.roles.join(' or ').toLowerCase() + ' can do "' + name + '".' };
    return { ok: true };
  }

  /** Is `roles` allowed to run `name` on this Requests row? -> { ok } or { ok:false, error } */
  function check(name, row, roles) {
    return checkAgainst(ACTIONS, name, function (def) { return applies(def, row); }, roles, statusOf(row.status));
  }
  function checkLog(name, logStatus, roles) {
    return checkAgainst(LOG_ACTIONS, name, function (def) { return def.from.indexOf(logStatus) !== -1; }, roles, logStatus);
  }

  /** Status after Submit: the Approver's own requests are approved at once. */
  function submitTarget(roles) { return roles.indexOf('APPROVER') !== -1 ? S.APPROVED : S.SUBMITTED; }

  /** Status after Record encoding / Record replacement. */
  function encodeTarget(row) {
    if (row.kind === KIND.EXTENSION) return S.CLOSED; // the extension row is finished
    return row.issuedAt ? S.ISSUED : S.ENCODED;       // card already with the cardholder?
  }

  return {
    S: S, KIND: KIND, ACTIONS: ACTIONS, LOG_ACTIONS: LOG_ACTIONS,
    statusOf: statusOf, availableActions: availableActions, availableLogActions: availableLogActions,
    rolesOf: rolesOf, check: check, checkLog: checkLog,
    submitTarget: submitTarget, encodeTarget: encodeTarget
  };
})();
