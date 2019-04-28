"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const util_1 = require("util");
function toRelative(from, x) {
    const rel = path_1.relative(from, x);
    return (rel.startsWith('.') ? rel : `./${rel}`).replace(/\\/g, '/');
}
exports.toRelative = toRelative;
exports.readFile = util_1.promisify(fs_1.readFile);
exports.writeFile = util_1.promisify(fs_1.writeFile);
//# sourceMappingURL=util.js.map