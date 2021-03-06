module.exports = {
  'parserOptions': {
    'parser': 'babel-eslint',
  },
  'env': {
    'browser': true,
    'commonjs': true,
    'node': true
  },
  'extends': ['eslint:recommended', 'airbnb-base'],
  'rules': {
    'quote-props': [2, 'consistent'],
    'import/prefer-default-export': [0],
    'linebreak-style': 'off',
    'global-require': 'off',
    'object-shorthand': [2, 'always', { 'avoidQuotes': false }],
    'object-curly-newline': 'off',
    'camelcase': 'off',
    'no-mixed-operators': 'off',
    'semi': 'off'
  },
}
