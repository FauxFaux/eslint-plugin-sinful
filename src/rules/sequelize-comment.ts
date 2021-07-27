import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util/from-eslint-typescript';

type Options = [{}];
type MessageIds = 'requiresComment';

export default util.createRule<Options, MessageIds>({
  name: 'sequelize-comment',
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
      requiresComment: 'The `comment` property is required',
    },
    schema: [{}],
  },
  defaultOptions: [{}],

  create(context, [options]) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type !== 'MemberExpression') return;
        if (node.callee.property.type !== 'Identifier') return;
        if (!['findAll'].includes(node.callee.property.name)) return;
        if (1 !== node.arguments.length) return;
        const arg = node.arguments[0];
        if (arg.type !== 'ObjectExpression') return;
        if (hasProperty(arg, 'comment')) return;
        context.report({
          node,
          messageId: 'requiresComment',
          fix(fixer) {
            const pathEnd = context
              .getFilename()
              .split('/')
              .slice(-3)
              .join('/');
            const funcName = getFunc(node) ?? 'unknown';
            return fixer.insertTextBefore(
              arg.properties[0],
              `comment: '${pathEnd}:${funcName}', `,
            );
          },
        });
      },
    };
  },
});

function hasProperty(object: TSESTree.ObjectExpression, name: string): boolean {
  return object.properties.some(
    (e) =>
      e.type === 'Property' &&
      e.key.type === 'Identifier' &&
      e.key.name === name,
  );
}

function getFunc(node: TSESTree.Node | undefined) {
  while (node) {
    if (node.type === 'FunctionDeclaration') return node.id?.name;
    node = node.parent;
  }
  return undefined;
}
