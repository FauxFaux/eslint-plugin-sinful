import path from 'path';

import { DirResult, dirSync } from 'tmp';
import mkdirp from 'mkdirp';

import { importTarget } from '../../src/util/node-imports';

describe('import target', () => {
  let tmpDir: DirResult;
  let dir: string;

  beforeEach(async () => {
    tmpDir = dirSync({ unsafeCleanup: true });
    dir = (await mkdirp(path.join(tmpDir.name, 'foo', 'bar')))!;
  });

  afterEach(() => {
    tmpDir?.removeCallback();
  });

  it('resolves built-in modules', () => {
    expect(importTarget(dir, 'http')).toBe('http');
    expect(importTarget(dir, 'internal/foo')).toBe('internal/foo');
  });

  it.each([['./a', './a']])('resolves relatives', (from, to) => {
    expect(importTarget(dir, from)).toBe(path.resolve(dir, to));
  });
});
