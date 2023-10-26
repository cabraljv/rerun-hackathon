const fs = require('fs');

const { generateAst } = require('./utils/parser');
const { compile } = require('./utils/class-generator');
const { Command } = require('commander');

const program = new Command();

program
  .name('odl-parser')
  .description('ODL Parser developed in JS for the RERUN Hackathon 2023')
  .version('0.0.1');

program.command('generate')
  .description('Generate JS classes from ODL file')
  .option('-i, --input <path>', 'ODL file path')
  .option('-o, --output <path>', 'Output dir')
  .action(async (str, options) => {
    const input = fs.readFileSync(str.input, 'utf8');
    const outputDir = str.output;
    fs.mkdirSync(outputDir, { recursive: true });
    const ast = generateAst(input);

    await compile(ast, outputDir);
    process.exit(0);
  });

program.parse();