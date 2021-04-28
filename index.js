const path = require('path')
const fs = require('fs')

let docIndexContent = fs.readFileSync(path.resolve(__dirname, './doc/index.tsx'))
const cssContext = fs.readFileSync(path.resolve(__dirname, './doc/index.css'))

module.exports = function (api) {

  api.describe({
    key: 'docConfig',
    config: {
      default: {
        docExclude: '',
        showDocHeader: true,
        docLayout: ''
      },
      schema(joi) {
        return joi.object({
          docExclude: joi.alternatives().try(joi.string(), joi.object().instance(RegExp)),
          showDocHeader: joi.boolean(),
          docLayout: joi.string()
        })
      },
    },
  })

  const { docExclude, showDocHeader, docLayout } = api.userConfig.docConfig
  
  api.modifyRoutes((routes) => {
    if (docLayout) {
      return [
        {
          path: '/componentsPage',
          component: docLayout,
          routes: [
            {
              path: '/',
              component: path.resolve(__dirname, '../../src/.umi/doc')
            }
          ]
        },
        ...routes
      ]
    }
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
    const jsModule = config.module.rule('js').use('tsxProps').loader('umi-doc/customTsxLoader')
    if(docExclude) {
      jsModule.options({
        exclude: docExclude
      })
    }

    return config
  })

  docIndexContent = docIndexContent.toString()
  if (!showDocHeader) {
    docIndexContent = docIndexContent.replace('showDocHeader = true', 'showDocHeader = false')
  }

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