const path = require('path')
const fs = require('fs')

const docIndexContent = fs.readFileSync(path.resolve(__dirname, './doc/index.tsx'))
const cssContext = fs.readFileSync(path.resolve(__dirname, './doc/index.css'))

module.exports = function (api) {
  api.describe({
    key: 'docExclude',
    config: {
      schema(joi) {
        return joi.alternatives().try(joi.string(), joi.object().instance(RegExp));
      },
    },
  })

  api.modifyRoutes((routes) => {
    return [{ path: '/componentsPage', component: path.resolve(__dirname, '../../src/.umi/doc') }, ...routes]
  })
  api.chainWebpack((config) => {
    config.module
      .rule('doc')
        .test(/\.mdx$/)
        .include
          .add(/components/)
          .end()
        .use('babel')
          .loader('babel-loader')
          .options(config.module.rules.get('js').uses.get('babel-loader').get('options'))
          .end()
        .use('custom')
          .loader('umi-doc/CustomLoader')
          .end()
        .use('mdx')
          .loader('@mdx-js/loader')
          .end()
        .use('front-matter')
          .loader('umi-doc/mdxLoader')
        
    config.module.rule('js').use('custom').loader('umi-doc/CustomLoader')
    config.module.rule('js').use('tsxProps').loader('umi-doc/customTsxLoader').options({
      exclude: api.userConfig.docExclude
    })
    
    return config
  })
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'doc/index.tsx',
      content: docIndexContent,
    })
    api.writeTmpFile({
      path: 'doc/index.css',
      content: cssContext,
    })
  })
}