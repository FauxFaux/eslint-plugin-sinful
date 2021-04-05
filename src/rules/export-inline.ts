import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util/from-eslint-typescript';

type Options = [{}];
type MessageIds = 'mustBeInline' | 'unnecessaryEmptyExport';

export default util.createRule<Options, MessageIds>({
  name: 'param-types',
  meta: {
    docs: {
      description: '',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: false,
    },
    fixable: 'code',
    type: 'problem',
    messages: {
      mustBeInline: 'Prefer `export function func(` over `export { func }`',
      unnecessaryEmptyExport:
        '`export {}` is not necessary if there are other imports/exports',
    },
    schema: [{}],
  },
  defaultOptions: [{}],

  create(context, []) {
    return {
      Program(node: TSESTree.Program) {
        const exports: { [name: string]: TSESTree.ExportSpecifier } = {};

        const decls = node.body.filter(isExportNamedDecl);
        for (const decl of decls) {
          for (const spec of decl.specifiers) {
            if (
              isIdent(spec.local) &&
              isIdent(spec.exported) &&
              spec.local.name === spec.exported.name
            ) {
              exports[spec.local.name] = spec;
            }
          }
        }

        const funcs = node.body.filter(isFuncDecl);
        for (const func of funcs) {
          if (!func.id) continue;
          const spec = exports[func.id.name];
          if (!spec) continue;
          context.report({
            node: spec,
            messageId: 'mustBeInline',
            fix: (fixer) => {
              const fixes = [
                fixer.remove(spec),
                fixer.insertTextBefore(func, 'export '),
              ];

              const follower = context.getSourceCode().getTokenAfter(spec);
              if (isComma(follower)) {
                fixes.unshift(fixer.remove(follower));
              }
                return fixes;
            },
          });
        }

        const anyRegulars = node.body.some(
          (node) =>
            (isExportNamedDecl(node) && node.declaration) ||
            node.type === 'ImportDeclaration' ||
            node.type === 'TSImportEqualsDeclaration',
        );
        if (!anyRegulars) return;

        for (const decl of decls) {
          if (decl.declaration) continue;
          if (decl.source) continue;
          if (decl.specifiers.length) continue;

          context.report({
            node: decl,
            messageId: 'unnecessaryEmptyExport',
            fix: (fixer) => fixer.remove(decl),
          });
        }
      },
    };
  },
});

function isExportNamedDecl(
  node: TSESTree.Statement,
): node is TSESTree.ExportNamedDeclaration {
  return node.type === 'ExportNamedDeclaration';
}

function isFuncDecl(
  node: TSESTree.Statement,
): node is TSESTree.FunctionDeclaration {
  return node.type === 'FunctionDeclaration';
}

function isIdent(node: TSESTree.Node): node is TSESTree.Identifier {
  return node.type === 'Identifier';
}

function isPunctuator(token: TSESTree.Token): token is TSESTree.PunctuatorToken {
  return token.type === 'Punctuator';
}

function isComma(
  token: TSESTree.Token | null,
): token is TSESTree.PunctuatorToken {
  return token !== null && isPunctuator(token) && token.value === ',';
}
