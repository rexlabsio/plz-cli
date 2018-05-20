#! /usr/bin/env node

/*
|-------------------------------------------------------------------------------
| Generate Ascii Logo
|-------------------------------------------------------------------------------
|
| Prints the packages CLI name to console with an ASCII font. Used to create
| static text for src/utils#logo.
|
| $ ./support/generate-ascii-logo.js | clipcopy
|
*/

const pkg = require('../package.json');
const figlet = require('figlet');

const name = Object.keys(pkg.bin)[0]
  .split('')
  .join(' ');
const logo = figlet
  .textSync(name, { font: 'Larry 3D' })
  .replace(/(^|\n)\s+?$/, '')
  .replace(/^/gm, '   ');

console.log(logo);

process.exit();
