import path from 'path';

export function importTarget(dir: string, source: string): string {
  if (!source.startsWith('./')) return source;
  return path.relative(dir, path.resolve(dir, source));
}
