import babel from 'rollup-plugin-babel'

const baseConf = require('./rollup.config.base')

const conf = entry => ({
  ...baseConf,
  input: entry.filename,
  output: entry.formats.map(format => ({
    file: `./test-lib/${entry.name}.js`,
    format,
    name: 'ErrorMonitor',
  })),
  plugins: [
    ...baseConf.plugins,
    babel({
      babelrc: false,
      runtimeHelpers: true,
      externalHelpers: false,
      presets: [
        [
          'env',
          {
            modules: false,
            targets: {
              browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
            },
          },
        ],
        'stage-2',
      ],
      plugins: [
        'external-helpers',
      ],
      env: {
        test: {
          plugins: ['istanbul'],
        },
      },
    }),
  ],
})

export default conf({
  name: 'index',
  filename: './src/index.js',
  formats: ['umd'],
})
