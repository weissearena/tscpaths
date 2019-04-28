/// <reference types="node" />
import { readFile as readFileAsync, writeFile as writeFileAsync } from 'fs';
export declare function toRelative(from: string, x: string): string;
export declare const readFile: typeof readFileAsync.__promisify__;
export declare const writeFile: typeof writeFileAsync.__promisify__;
