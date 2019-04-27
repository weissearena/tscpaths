import { dirname, resolve } from 'path';

export interface TSPaths {
    [key: string]: string[];
}

export interface RawTSConfig {
    extends?: string;
    compilerOptions?: {
        baseUrl?: string;
        outDir?: string;
        paths?: TSPaths;
    };
}

export interface TSAlias {
    prefix: string;
    aliasPaths: string[];
}

export interface TSConfig {
    projectRoot: string;
    outRoot: string;
    aliasRoot: string;
    aliases: TSAlias[];
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
        aliasRoot: resolve(projectRoot, baseUrl),
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

function getAliases(paths: TSPaths): TSAlias[] {
    return Object.keys(paths)
        .map((alias) => ({
            prefix: alias.replace(/\*$/, ''),
            aliasPaths: paths[alias].map((p: string) => p.replace(/\*$/, '')),
        }))
        .filter(({ prefix }) => prefix);
}
