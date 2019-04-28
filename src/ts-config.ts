import { dirname, resolve } from 'path';

export interface TSAliasMap {
    [alias: string]: string[];
}

interface TSConfig {
    projectRoot: string;
    outRoot: string;
    aliases: TSAliasMap;
}

interface RawTSConfig {
    extends?: string;
    compilerOptions?: {
        baseUrl?: string;
        outDir?: string;
        paths?: TSPaths;
    };
}

interface TSPaths {
    [key: string]: string[];
}

export function loadTSConfig(projectFile: string): TSConfig {
    const {
        extends: extendsFile,
        compilerOptions: { baseUrl, outDir, paths } = {
            baseUrl: undefined,
            outDir: undefined,
            paths: undefined,
        },
    } = require(projectFile) as RawTSConfig;

    if (!baseUrl) throw new Error('compilerOptions.baseUrl is not set');
    if (!paths) throw new Error('compilerOptions.paths is not set');
    if (!outDir) throw new Error('compilerOptions.outDir is not set');

    const projectRoot = dirname(projectFile);
    const config: TSConfig = {
        projectRoot,
        outRoot: resolve(projectRoot, outDir),
        aliases: getAliases(paths),
    };

    if (extendsFile) {
        const parentConfig = loadTSConfig(resolve(dirname(projectFile), extendsFile));
        return {
            ...parentConfig,
            ...config,
        };
    }

    return config;
}

function getAliases(paths: TSPaths): TSAliasMap {
    const aliasMap: TSAliasMap = {};
    for (const [alias, aliasPaths] of Object.entries(paths)) {
        const prefix = stripGlob(alias);
        if (prefix !== '') aliasMap[prefix] = aliasPaths.map(stripGlob);
    }
    return aliasMap;
}

function stripGlob(s: string): string {
    return s.replace(/\*$/, '');
}
