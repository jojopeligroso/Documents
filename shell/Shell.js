/**
 * Shell: the only code inside each Site Sheet. It contains NO business logic.
 * It owns the things a library cannot own for it: the menu, the triggers, the lock,
 * and this site's Script Properties. Library identifier: ACM.
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Access Cards')
    .addItem('Go to next empty request row', 'acmGoToNewRow')
    .addItem('How to use this sheet', 'acmHelp')
    .addSeparator()
    .addSubMenu(ui.createMenu('Admin')
      .addItem('Build / repair sheet', 'acmRepair')
      .addItem('Install triggers', 'acmInstallTriggers')
      .addItem('Set Chat webhook URL', 'acmSetWebhook'))
    .addToUi();
}

function acmCfg_() {
  return { webhookUrl: PropertiesService.getScriptProperties().getProperty('CHAT_WEBHOOK_URL') };
}

/** Runs `fn` while holding this site's lock, so two actions can never interleave. */
function acmWithLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000); // throws after 25 s; the edit is then reported in the execution log
  try { return fn(); } finally { lock.releaseLock(); }
}

/** Installable on-edit trigger target. Runs as the Admin who installed the trigger. */
function acmOnEdit(e) {
  if (!ACM.isRelevantEdit(e)) return;
  acmWithLock_(function () { ACM.handleEdit(e, acmCfg_()); });
}

/** Time-driven trigger target, every 15 minutes. Runs as the Admin. */
function acmPoll() {
  acmWithLock_(function () { ACM.poll(acmCfg_()); });
}

// ------------------------------------------------------------------ menu items

function acmGoToNewRow() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Requests');
  sh.activate();
  sh.setActiveRange(sh.getRange(sh.getLastRow() + 1, 8)); // column H: Cardholder name
}

function acmHelp() {
  SpreadsheetApp.getUi().alert('Access Cards',
    'New request: fill in a blank row on the Requests tab, then choose "Submit" in its Action column.\n' +
    'Everything else: choose from the Action column on the row. The Message column tells you the result.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

function acmRequireAdmin_() {
  if (ACM.isAdmin()) return true;
  SpreadsheetApp.getUi().alert('Only the Admin named in Settings can use this menu.');
  return false;
}

function acmRepair() {
  if (!acmRequireAdmin_()) return;
  acmWithLock_(function () { ACM.repair(); });
  SpreadsheetApp.getUi().alert('Sheet structure and protections are up to date.');
}

function acmInstallTriggers() {
  if (!acmRequireAdmin_()) return;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (['acmOnEdit', 'acmPoll'].indexOf(t.getHandlerFunction()) !== -1) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('acmOnEdit').forSpreadsheet(SpreadsheetApp.getActive()).onEdit().create();
  ScriptApp.newTrigger('acmPoll').timeBased().everyMinutes(15).create();
  SpreadsheetApp.getUi().alert('Triggers installed. Emails will be sent from your account.');
}

function acmSetWebhook() {
  if (!acmRequireAdmin_()) return;
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt('Chat webhook URL', 'Paste the incoming-webhook URL of the Admin Space:', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return;
  const url = res.getResponseText().trim();
  if (url.indexOf('https://chat.googleapis.com/') !== 0) { ui.alert('That does not look like a Google Chat webhook URL.'); return; }
  PropertiesService.getScriptProperties().setProperty('CHAT_WEBHOOK_URL', url);
  ui.alert('Saved.');
}
