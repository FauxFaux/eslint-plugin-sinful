import exportInline from './rules/export-inline';
import paramTypes from './rules/param-types';
import returnAwait from './rules/return-await';
import sequelizeComment from './rules/sequelize-comment';
import unboundedConcurrency from './rules/unbounded-concurrency';
import requireItlyConstant from './rules/require-itly-constant';
import requireItlyEventSource from './rules/require-itly-event-source';

export const rules = {
  'export-inline': exportInline,
  'param-types': paramTypes,
  'return-await': returnAwait,
  'sequelize-comment': sequelizeComment,
  'unbounded-concurrency': unboundedConcurrency,
  'require-itly-constant': requireItlyConstant,
  'require-itly-event-source': requireItlyEventSource,
};

export * as util from './util';
