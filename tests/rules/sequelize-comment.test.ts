import { join } from 'path';
import rule from '../../src/rules/sequelize-comment';
import { RuleTester } from '@typescript-eslint/experimental-utils/dist/eslint-utils';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: join(__dirname, '..'),
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('export-inline', rule, {
  valid: [
    `findAll({})`,
    `foo.findAll(2)`,
    `foo.findAll({ comment: 'hello' })`,
  ],
  invalid: [
    {
      code: `foo.findAll({ where: {} })`,
      output: `foo.findAll({ comment: 'eslint-plugin-sinful/tests/file.ts:unknown', where: {} })`,
      errors: [
        {
          line: 1,
          messageId: 'requiresComment',
        },
      ],
    }
  ]
});
