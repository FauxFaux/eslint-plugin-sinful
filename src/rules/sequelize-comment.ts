import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util/from-eslint-typescript';
import { ReportDescriptor } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

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
        if (
          !['findAll', 'findOne', 'findOrCreate'].includes(
            node.callee.property.name,
          )
        )
          return;
        if (1 !== node.arguments.length) return;
        const arg = node.arguments[0];
        if (arg.type !== 'ObjectExpression') return;
        if (hasProperty(arg, 'comment')) return;
        const funcName = getFunc(node);

        // can't fix "{ /* comment */ }" because dumb api
        // { where } or { where: {} } or { where, there } all fine
        const hasAnyProperties = 0 !== arg.properties.length;
        // literally just {}
        const trulyEmptyBlock = 2 === arg.range[1] - arg.range[0];

        let fix: ReportDescriptor<MessageIds>['fix'] = undefined;
        if (funcName && (hasAnyProperties || trulyEmptyBlock)) {
          fix = (fixer) => {
            const pathEnd = context
              .getFilename()
              .split('/')
              .slice(-3)
              .join('/');
            const text = `comment: '${pathEnd}:${funcName}', `;

            if (hasAnyProperties) {
              return fixer.insertTextBefore(arg.properties[0], text);
            } else {
              return fixer.replaceText(arg, `{${text}}`);
            }
          };
        }

        context.report({
          node,
          messageId: 'requiresComment',
          fix,
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

function getFunc(node: TSESTree.Node | undefined): string | undefined {
  while (node) {
    if (node.type === 'FunctionDeclaration') return node.id?.name;
    if (node.type === 'ArrowFunctionExpression') {
      const decl = node.parent;
      if (decl?.type === 'VariableDeclarator' && 'name' in decl.id)
        return decl.id.name;
    }
    node = node.parent;
  }
  return undefined;
}
