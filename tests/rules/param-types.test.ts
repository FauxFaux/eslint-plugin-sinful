import { join } from 'path';
import rule from '../../src/rules/param-types';
import { RuleTester } from '@typescript-eslint/experimental-utils/dist/eslint-utils';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: join(__dirname, '..'),
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('param-types', rule, {
  valid: [
    `function test() {}`,
    `function test(foo: Foo) {}`,
    `function test(foo: Foo, bar: Bar) {}`,
    `function test(foo: Foo, bar: Bar): Baz { return {}; }`,
    `async function test() {}`,
    `async function test(foo: Foo) {}`,
    'const test = () => 1;',
    'const test = (foo: Foo) => 1;',
    'const test = async (foo: Foo) => 1;',
  ],
  invalid: [
    {
      options: [{required: [".*"], fixes: {"foo": ["./lib/types", "Foo"]}}],
      code: `function test(foo) {}`,
      output: `import type { Foo } from '../lib/types';
function test(foo: Foo) {}`,
      errors: [
        {
          line: 1,
          messageId: 'mustBeTyped',
        },
      ],
    },
  ]
});
