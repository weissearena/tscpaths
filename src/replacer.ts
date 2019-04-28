import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as glob from 'globby';
import { dirname, relative, resolve } from 'path';
import { loadTSConfig, TSAliasMap } from './ts-config';
import { readFile, toRelative, writeFile } from './util';

const fileExtensions = ['.js', '.jsx', '.ts', '.tsx', '.d.ts', '.json'];

const requireRegex = /(?:import|require)\(['"]([^'"]*)['"]\)/g;
const importRegex = /(?:import|from) ['"]([^'"]*)['"]/g;

export interface ReplacerArgs {
    tsconfig: string;
    src: string;
    out?: string;
    dryRun?: boolean;
    verbose?: boolean;
}

export interface ReplacerConfig {
    projectRoot: string;
    srcRoot: string;
    outRoot: string;
    aliases: TSAliasMap;
    dryRun: boolean;
    verbose: boolean;
}

export class Replacer {
    public config: ReplacerConfig;

    private running = false;
    private replacements: { [outFile: string]: Array<[string, string]> } = {};
    private errors: { [outFile: string]: string[] } = {};

    constructor({ tsconfig, src, out, dryRun = false, verbose = false }: ReplacerArgs) {
        const projectFile = resolve(process.cwd(), tsconfig);
        const { projectRoot, outRoot, aliases } = loadTSConfig(projectFile);

        this.config = {
            projectRoot,
            srcRoot: resolve(src),
            outRoot: out ? resolve(out) : outRoot,
            aliases,
            dryRun,
            verbose,
        };
    }

    public async run(): Promise<void> {
        if (this.running) throw Error('Replacer already running!');
        this.running = true;

        const { outRoot, dryRun } = this.config;
        try {
            const files = await glob(`${outRoot}/**/*.{js,jsx,ts,tsx}`, {
                dot: true,
                noDir: true,
            } as any);

            const resolved = files.map((path: string) => resolve(path));

            await Promise.all(
                resolved.map(async (file) => {
                    const text = await readFile(file, 'utf8');
                    const newText = this.replaceAlias(text, file);
                    if (!dryRun && text !== newText) await writeFile(file, newText, 'utf8');
                })
            );
        } finally {
            this.logRun();
            this.running = false;
        }
    }

    public runSync(): void {
        const { outRoot, dryRun } = this.config;

        const files = glob.sync(`${outRoot}/**/*.{js,jsx,ts,tsx}`, {
            dot: true,
            noDir: true,
        } as any);

        const resolved = files.map((path: string) => resolve(path));

        for (const file of resolved) {
            const text = readFileSync(file, 'utf8');
            const newText = this.replaceAlias(text, file);
            if (!dryRun && text !== newText) writeFileSync(file, newText, 'utf8');
        }

        this.logRun();
    }

    private replaceAlias(text: string, outFile: string): string {
        return text
            .replace(requireRegex, (orig, matched) =>
                this.replaceImportStatement(orig, matched, outFile)
            )
            .replace(importRegex, (orig, matched) =>
                this.replaceImportStatement(orig, matched, outFile)
            );
    }

    private replaceImportStatement(orig: string, matched: string, outFile: string): string {
        const index = orig.indexOf(matched);
        return (
            orig.substring(0, index) +
            this.absoluteToRelative(matched, outFile) +
            orig.substring(index + matched.length)
        );
    }

    private absoluteToRelative(modulePath: string, outFile: string): string {
        const { aliases, outRoot } = this.config;
        const outRelative = relative(outRoot, outFile);

        for (const [prefix, aliasPaths] of Object.entries(aliases)) {
            if (modulePath.startsWith(prefix)) {
                const modulePathRel = modulePath.substring(prefix.length);

                for (const aliasPath of aliasPaths) {
                    const moduleOut = resolve(outRoot, aliasPath, modulePathRel);
                    if (
                        existsSync(moduleOut) ||
                        fileExtensions.some((ext) => existsSync(moduleOut + ext))
                    ) {
                        const moduleRelative = toRelative(dirname(outFile), moduleOut);
                        this.captureReplacement(outRelative, modulePath, moduleRelative);
                        return moduleRelative;
                    }
                }
                this.captureError(outRelative, modulePath);
            }
        }
        return modulePath;
    }

    private captureReplacement(outPath: string, modulePath: string, replacementPath: string): void {
        if (!this.replacements[outPath]) this.replacements[outPath] = [];
        this.replacements[outPath].push([modulePath, replacementPath]);
    }

    private captureError(outPath: string, modulePath: string): void {
        if (!this.errors[outPath]) this.errors[outPath] = [];
        this.errors[outPath].push(modulePath);
    }

    private logRun(): void {
        const { dryRun, verbose } = this.config;
        if (dryRun || verbose) {
            console.log(
                JSON.stringify(
                    {
                        ...this.config,
                        replacements: this.replacements,
                        errors: this.errors,
                    },
                    null,
                    4
                )
            );
        }
        this.replacements = {};
        this.errors = {};
    }
}
