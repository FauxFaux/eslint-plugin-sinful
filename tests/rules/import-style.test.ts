import { join } from 'path';
import rule from '../../src/rules/import-style';
import { RuleTester } from '@typescript-eslint/experimental-utils/dist/eslint-utils';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: join(__dirname, '..'),
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('import-style', rule, {
  valid: [
  ],
  invalid: [
    {
      code: `import foo = require('./foo/bar');`,
      output: `import { foo } from './foo/bar';`,
      options: [{
        requireToNamed: [{local: 'foo', path: './foo/bar'}],
      }],
      errors: [
        {
          line: 1,
          messageId: 'useRegularImport',
        },
      ],
    },
    {
      code: `import foo = require('././foo/bar');`,
      output: `import { foo } from '././foo/bar';`,
      options: [{
        requireToNamed: [{local: 'foo', path: './foo/bar'}],
      }],
      errors: [
        {
          line: 1,
          messageId: 'useRegularImport',
        },
      ],
    },
    {
      code: `import * as foo from 'potato';`,
      output: `import foo = require('potato');`,
      options: [{
        wildNsToRequire: [{path: 'potato'}],
      }],
      errors: [
        {
          line: 1,
          messageId: 'useRegularImport',
        },
      ],
    },
  ]
});
