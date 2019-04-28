import { relative } from 'path';
import { readFile as readFileAsync, writeFile as writeFileAsync } from 'fs';
import { promisify } from 'util';

export function toRelative(from: string, x: string): string {
    const rel = relative(from, x);
    return (rel.startsWith('.') ? rel : `./${rel}`).replace(/\\/g, '/');
}

export const readFile  = promisify(readFileAsync);
export const writeFile = promisify(writeFileAsync);
