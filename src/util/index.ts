import { TSESTree } from '@typescript-eslint/experimental-utils';

export * as eslintTs from './from-eslint-typescript';

export function topLevel(node: TSESTree.Node): TSESTree.Node {
  let p = node;
  while (p.parent) p = p.parent;
  return p;
}
