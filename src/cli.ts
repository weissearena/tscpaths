#! /usr/bin/env node

import * as program from 'commander';
import { Replacer } from './replacer';

function main(): void {
    program
        .version('0.0.1')
        .option('-p, --project <file>', 'path to tsconfig.json')
        .option('-s, --src <path>', 'source root path')
        .option('-o, --out [path]', 'output root path')
        .option('-d, --dry-run', 'only prints replacements to console')
        .option('-v, --verbose', 'verbose mode');

    program.parse(process.argv);

    const { project, src, out, dryRun, verbose } = program as {
        project?: string;
        src?: string;
        out?: string;
        dryRun?: boolean;
        verbose?: boolean;
    };

    if (!project) throw new Error('--project must be specified');
    if (!src) throw new Error('--src must be specified');

    Replacer.fromTSConfig(project, src, out, dryRun, verbose || dryRun).run();
}

try {
    main();
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
