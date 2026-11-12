/**
 * Notify: Gmail and Google Chat. A failed notification must never undo a completed action,
 * so every send is wrapped: failures are returned as text and written to the Event Log.
 */
var Notify = (function () {
  /** to: string or array of emails. lines: array of strings. Returns '' or an error message. */
  function email(to, subject, lines) {
    const list = [].concat(to).filter(Boolean);
    const unique = list.filter(function (a, i) { return list.indexOf(a) === i; });
    if (!unique.length) return '';
    try {
      MailApp.sendEmail({ to: unique.join(','), subject: subject, body: lines.join('\n') });
      return '';
    } catch (err) {
      return 'Email to ' + unique.join(', ') + ' failed: ' + err.message;
    }
  }

  /** Posts one line to the Admin Space. Returns '' or an error message. */
  function chat(webhookUrl, text) {
    if (!webhookUrl) return 'Chat webhook is not set (Access Cards > Admin > Set Chat webhook URL).';
    try {
      const res = UrlFetchApp.fetch(webhookUrl, {
        method: 'post', contentType: 'application/json; charset=UTF-8',
        payload: JSON.stringify({ text: text }), muteHttpExceptions: true
      });
      const code = res.getResponseCode();
      return code >= 200 && code < 300 ? '' : 'Chat post failed: HTTP ' + code;
    } catch (err) {
      return 'Chat post failed: ' + err.message;
    }
  }

  /** Direct link to a row, for role holders only (Hosts cannot open the sheet). */
  function rowLink(ss, sheet, rowNum) {
    return ss.getUrl() + '#gid=' + sheet.getSheetId() + '&range=A' + rowNum;
  }

  /** Standard body lines for any email about a request. */
  function summary(row) {
    return [
      'Request: ' + row.id + (row.kind && row.kind !== 'New' ? ' (' + row.kind + ' of ' + row.linksTo + ')' : ''),
      'Cardholder: ' + row.name + ' (' + row.type + ')',
      'Host: ' + row.host,
      'Requested: ' + row.start + ' to ' + row.end,
      row.serial ? 'Card: ' + row.serial + ', valid ' + row.validFrom + ' to ' + row.validTo : 'Card: not yet encoded',
      'Status: ' + Workflow.statusOf(row.status)
    ];
  }

  return { email: email, chat: chat, rowLink: rowLink, summary: summary };
})();
