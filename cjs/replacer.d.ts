import { TSAliasMap } from './ts-config';
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
export declare class Replacer {
    config: ReplacerConfig;
    private running;
    private replacements;
    private errors;
    constructor({ tsconfig, src, out, dryRun, verbose }: ReplacerArgs);
    run(): Promise<void>;
    runSync(): void;
    private replaceAlias;
    private replaceImportStatement;
    private absoluteToRelative;
    private captureReplacement;
    private captureError;
    private logRun;
}
