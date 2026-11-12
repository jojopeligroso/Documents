/**
 * Loads the pure library files into one shared scope, the way Apps Script does
 * (every file shares one global scope; there are no imports).
 * Usage in a test:  const { Cal, Schedule } = require('./loadGas');
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PURE_DIR = path.join(__dirname, '..', 'library', 'src', 'pure');
const context = vm.createContext({});
for (const file of fs.readdirSync(PURE_DIR).filter((f) => f.endsWith('.js')).sort()) {
  vm.runInContext(fs.readFileSync(path.join(PURE_DIR, file), 'utf8'), context, { filename: file });
}
module.exports = context; // top-level `var X` in each file becomes context.X
