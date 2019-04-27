import { relative } from 'path';

export function toRelative(from: string, x: string): string {
    const rel = relative(from, x);
    return (rel.startsWith('.') ? rel : `./${rel}`).replace(/\\/g, '/');
}
