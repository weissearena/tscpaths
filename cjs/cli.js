#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const replacer_1 = require("./replacer");
function main() {
    program
        .version('0.0.1')
        .option('-t, --tsconfig <file>', 'path to tsconfig.json')
        .option('-s, --src <path>', 'source root path')
        .option('-o, --out [path]', 'output root path')
        .option('-d, --dry-run', 'only prints replacements to console')
        .option('-v, --verbose', 'verbose mode');
    program.parse(process.argv);
    const { tsconfig, src, out, dryRun, verbose } = program;
    if (!tsconfig)
        throw new Error('--tsconfig must be specified');
    if (!src)
        throw new Error('--src must be specified');
    const replacer = new replacer_1.Replacer({ tsconfig, src, out, dryRun, verbose });
    replacer.runSync();
}
try {
    main();
}
catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
//# sourceMappingURL=cli.js.map