import paramTypes from './rules/param-types';
import returnAwait from './rules/return-await';

export const rules = {
  "param-types": paramTypes,
  "return-await": returnAwait,
};

export * as util from './util';
