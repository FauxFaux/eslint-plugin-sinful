import * as path from 'path';
import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util/from-eslint-typescript';
import type { ReportDescriptor } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

type Regex = string;
type ImportPath = string;
type TypeName = string;

type Options = [
  {
    required: Regex[];
    excluded?: Regex[];
    fixes?: { [paramRegex: string]: [ImportPath, TypeName] };
  },
];
type MessageIds = 'mustBeTyped';

function regexp(input: string): RegExp {
  return new RegExp(`^(?:${input})$`);
}

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
      mustBeTyped:
        'Explicitly specifying a type is required for this parameter.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          required: { type: 'array' },
          excluded: { type: 'array' },
        },
      },
    ],
  },
  defaultOptions: [{ required: ['.*'] }],

  create(context, [options]) {
    const required: RegExp[] = options.required.map(regexp);
    const excluded = options.excluded?.map(regexp) ?? [];
    const dir = path.resolve(path.dirname(context.getFilename()));

    const fixes = Object.entries(options.fixes ?? {}).map(
      ([paramName, [wantedImport, type]]) => {
        const resolvedImport = path.relative(dir, path.resolve(wantedImport));
        return [regexp(paramName), [resolvedImport, type]] as const;
      },
    );

    return {
      FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
        for (const param of node.params) {
          if (param.type !== 'Identifier') continue;

          if ('typeAnnotation' in param) {
            continue;
          }

          if (!required.some((r) => param.name.match(r))) continue;
          if (excluded.some((r) => param.name.match(r))) continue;

          const fixObj = fixes.find(([r]) => param.name.match(r));

          let fix: ReportDescriptor<MessageIds>['fix'];
          if (fixObj) {
            const [, [importFrom, type]] = fixObj;
            const importText = `import type { ${type} } from '${importFrom}';\n`;
            fix = (fixer) => [
              fixer.insertTextBefore(topLevel(node), importText),
              fixer.insertTextAfter(param, `: ${type}`),
            ];
          }

          context.report({
            node,
            messageId: 'mustBeTyped',
            fix,
          });
        }
      },
    };
  },
});

function topLevel(node: TSESTree.Node): TSESTree.Node {
  let p = node;
  while (p.parent) p = p.parent;
  return p;
}
