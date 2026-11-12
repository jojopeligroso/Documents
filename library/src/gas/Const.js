/** Const: tab names, column numbers (1-based), colours. Change layout HERE and nowhere else. */
var SHEET = {
  REQUESTS: 'Requests', LOG: 'Contractor Log', CARDS: 'Cards',
  SETTINGS: 'Settings', EVENTS: 'Event Log', SENT: 'Sent Log'
};

/** Requests tab columns. Key = field name used in code. Value = column number. */
var RC = {
  id: 1, status: 2, action: 3, note: 4, message: 5,                       // A-E  (frozen)
  kind: 6, linksTo: 7, name: 8, type: 9, host: 10, contact: 11,           // F-K  entry
  startDate: 12, startTime: 13, endDate: 14, endTime: 15, notes: 16,      // L-P  entry
  requester: 17, submittedAt: 18, decisionBy: 19, decisionAt: 20, denialReason: 21, // Q-U
  serial: 22, validFrom: 23, validTo: 24,                                 // V-X  encoding
  encodedBy: 25, encodedAt: 26, issuedTo: 27, issuedBy: 28, issuedAt: 29, // Y-AC
  returnedBy: 30, returnedAt: 31, deadline: 32, prevStatus: 33, deactivatedAt: 34 // AD-AH
};
var RC_LAST = 34;
var RC_ENTRY = { first: RC.kind, last: RC.notes };      // open while Draft
var RC_ENCODE = { first: RC.serial, last: RC.validTo }; // open while Approved or Lost
var RC_DATE_COLS = [RC.startDate, RC.endDate];          // true date cells; all others are text

/** Contractor Log tab columns. */
var LC = {
  date: 1, requestId: 2, contractor: 3, serial: 4, status: 5, action: 6, note: 7, message: 8,
  outBy: 9, outAt: 10, inBy: 11, inAt: 12
};
var LC_LAST = 12;

var CARD = { serial: 1, state: 2, inUseBy: 3, notes: 4 }; // state: Active | Lost | Retired
var EV = { at: 1, actor: 2, action: 3, requestId: 4, serial: 5, from: 6, to: 7, details: 8 };

var STATUS_COLOUR = {
  'Draft': '#ffffff', 'Submitted': '#ccff66', 'Approved': '#93c47d', 'Denied': '#e06666',
  'Encoded': '#9fc5e8', 'Issued': '#76a5af', 'Extension pending': '#ffd966',
  'Closed': '#d9d9d9', 'Cancelled': '#999999', 'No-show': '#f6b26b', 'Lost': '#b4a7d6'
};
var DT_FORMAT = 'yyyy-MM-dd HH:mm'; // for Utilities.formatDate
var D_FORMAT = 'yyyy-MM-dd';
