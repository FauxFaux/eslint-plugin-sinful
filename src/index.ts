import paramTypes from './rules/param-types';
import returnAwait from './rules/return-await';
import unboundedConcurrency from './rules/unbounded-concurrency';

export const rules = {
  'param-types': paramTypes,
  'return-await': returnAwait,
  'unbounded-concurrency': unboundedConcurrency,
};

export * as util from './util';
