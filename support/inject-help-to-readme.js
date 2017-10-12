#! /usr/bin/env node

/*
|-------------------------------------------------------------------------------
| Inject Help to Readme
|-------------------------------------------------------------------------------
|
| Prints the `plz help` message, and inject it into the readme.md.
|
*/

const path = require('path');
const execa = require('execa');
const fse = require('fs-extra');

const CWD = path.resolve(__dirname, '../');
const README_PATH = path.resolve(__dirname, '../readme.md');

async function main () {
  let { stderr: helpMsg } = await execa.shell('plz', {
    cwd: CWD
  });
  helpMsg = helpMsg
    .replace(/^(.|\n)*Toolkit for.*/gm, '')
    .replace(/Use one of(.|\n)*/g, '')
    .replace(/^\n*/, '')
    .replace(/\n*$/, '');

  const readme = await fse.readFile(README_PATH, {
    encoding: 'utf-8'
  });

  await fse.writeFile(
    README_PATH,
    readme.replace(
      /<!-- help-content -->(.|\n)*<!-- \/help-content -->/g,
      `<!-- help-content -->
\`\`\`text
${helpMsg}
\`\`\`
<!-- /help-content -->`
    )
  );
}

main().catch(err => console.error(err));
