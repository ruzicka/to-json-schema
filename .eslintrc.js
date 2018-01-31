module.exports = {
  extends: 'airbnb-base',
  env: {
    node: true,
    es6: true,
    mocha: true
  },
  parserOptions: {
    sourceType: 'script'
  },
  rules: {
    indent: ['error', 2, { 'SwitchCase': 1 }],
    semi: [2, 'never'],
    strict: [2, 'global'],
    'one-var-declaration-per-line': [2, 'initializations'],
    'one-var': [2, {'uninitialized': 'always', 'initialized': 'never' }],
    'no-multiple-empty-lines': ['error', {'max': 2}],
    'no-unused-expressions': ['error', {'allowShortCircuit': true}],
    'max-len': ['error', {
      code: 130,
      tabWidth: 2,
      ignoreUrls: true,
      ignoreComments: true,
      ignoreRegExpLiterals: true,
    }],
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'ignore',
    }],
    'object-curly-newline': ['error', {
      // multiline: true,
      consistent: true,
    }],
    'object-curly-spacing': ['error', 'never'],
    'no-plusplus': 'off',
    'no-confusing-arrow': 'off',
    'arrow-parens': ['error', 'as-needed']
  }
}
