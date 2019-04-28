"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const glob = require("globby");
const path_1 = require("path");
const ts_config_1 = require("./ts-config");
const util_1 = require("./util");
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx', '.d.ts', '.json'];
const requireRegex = /(?:import|require)\(['"]([^'"]*)['"]\)/g;
const importRegex = /(?:import|from) ['"]([^'"]*)['"]/g;
class Replacer {
    constructor({ tsconfig, src, out, dryRun = false, verbose = false }) {
        this.running = false;
        this.replacements = {};
        this.errors = {};
        const projectFile = path_1.resolve(process.cwd(), tsconfig);
        const { projectRoot, outRoot, aliases } = ts_config_1.loadTSConfig(projectFile);
        this.config = {
            projectRoot,
            srcRoot: path_1.resolve(src),
            outRoot: out ? path_1.resolve(out) : outRoot,
            aliases,
            dryRun,
            verbose,
        };
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.running)
                throw Error('Replacer already running!');
            this.running = true;
            const { outRoot, dryRun } = this.config;
            try {
                const files = yield glob(`${outRoot}/**/*.{js,jsx,ts,tsx}`, {
                    dot: true,
                    noDir: true,
                });
                const resolved = files.map((path) => path_1.resolve(path));
                yield Promise.all(resolved.map((file) => __awaiter(this, void 0, void 0, function* () {
                    const text = yield util_1.readFile(file, 'utf8');
                    const newText = this.replaceAlias(text, file);
                    if (!dryRun && text !== newText)
                        yield util_1.writeFile(file, newText, 'utf8');
                })));
            }
            finally {
                this.logRun();
                this.running = false;
            }
        });
    }
    runSync() {
        const { outRoot, dryRun } = this.config;
        const files = glob.sync(`${outRoot}/**/*.{js,jsx,ts,tsx}`, {
            dot: true,
            noDir: true,
        });
        const resolved = files.map((path) => path_1.resolve(path));
        for (const file of resolved) {
            const text = fs_1.readFileSync(file, 'utf8');
            const newText = this.replaceAlias(text, file);
            if (!dryRun && text !== newText)
                fs_1.writeFileSync(file, newText, 'utf8');
        }
        this.logRun();
    }
    replaceAlias(text, outFile) {
        return text
            .replace(requireRegex, (orig, matched) => this.replaceImportStatement(orig, matched, outFile))
            .replace(importRegex, (orig, matched) => this.replaceImportStatement(orig, matched, outFile));
    }
    replaceImportStatement(orig, matched, outFile) {
        const index = orig.indexOf(matched);
        return (orig.substring(0, index) +
            this.absoluteToRelative(matched, outFile) +
            orig.substring(index + matched.length));
    }
    absoluteToRelative(modulePath, outFile) {
        const { aliases, outRoot } = this.config;
        const outRelative = path_1.relative(outRoot, outFile);
        for (const [prefix, aliasPaths] of Object.entries(aliases)) {
            if (modulePath.startsWith(prefix)) {
                const modulePathRel = modulePath.substring(prefix.length);
                for (const aliasPath of aliasPaths) {
                    const moduleOut = path_1.resolve(outRoot, aliasPath, modulePathRel);
                    if (fs_1.existsSync(moduleOut) ||
                        fileExtensions.some((ext) => fs_1.existsSync(moduleOut + ext))) {
                        const moduleRelative = util_1.toRelative(path_1.dirname(outFile), moduleOut);
                        this.captureReplacement(outRelative, modulePath, moduleRelative);
                        return moduleRelative;
                    }
                }
                this.captureError(outRelative, modulePath);
            }
        }
        return modulePath;
    }
    captureReplacement(outPath, modulePath, replacementPath) {
        if (!this.replacements[outPath])
            this.replacements[outPath] = [];
        this.replacements[outPath].push([modulePath, replacementPath]);
    }
    captureError(outPath, modulePath) {
        if (!this.errors[outPath])
            this.errors[outPath] = [];
        this.errors[outPath].push(modulePath);
    }
    logRun() {
        const { dryRun, verbose } = this.config;
        if (dryRun || verbose) {
            console.log(JSON.stringify(Object.assign({}, this.config, { replacements: this.replacements, errors: this.errors }), null, 4));
        }
        this.replacements = {};
        this.errors = {};
    }
}
exports.Replacer = Replacer;
//# sourceMappingURL=replacer.js.map