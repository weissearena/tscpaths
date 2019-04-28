"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function loadTSConfig(projectFile) {
    const { extends: extendsFile, compilerOptions: { baseUrl, outDir, paths } = {
        baseUrl: undefined,
        outDir: undefined,
        paths: undefined,
    }, } = require(projectFile);
    if (!baseUrl)
        throw new Error('compilerOptions.baseUrl is not set');
    if (!paths)
        throw new Error('compilerOptions.paths is not set');
    if (!outDir)
        throw new Error('compilerOptions.outDir is not set');
    const projectRoot = path_1.dirname(projectFile);
    const config = {
        projectRoot,
        outRoot: path_1.resolve(projectRoot, outDir),
        aliases: getAliases(paths),
    };
    if (extendsFile) {
        const parentConfig = loadTSConfig(path_1.resolve(path_1.dirname(projectFile), extendsFile));
        return Object.assign({}, parentConfig, config);
    }
    return config;
}
exports.loadTSConfig = loadTSConfig;
function getAliases(paths) {
    const aliasMap = {};
    for (const [alias, aliasPaths] of Object.entries(paths)) {
        const prefix = stripGlob(alias);
        if (prefix !== '')
            aliasMap[prefix] = aliasPaths.map(stripGlob);
    }
    return aliasMap;
}
function stripGlob(s) {
    return s.replace(/\*$/, '');
}
//# sourceMappingURL=ts-config.js.map