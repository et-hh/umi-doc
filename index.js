const path = require('path')
const fs = require('fs')

const docIndexContent = fs.readFileSync(path.resolve(__dirname, './doc/index.tsx'))
const cssContext = fs.readFileSync(path.resolve(__dirname, './doc/index.css'))

export default function (api) {
  api.modifyRoutes((routes) => {
    return [{ path: '/componentsPage', component: path.resolve(__dirname, './src/.umi/doc') }, ...routes]
  })
  api.chainWebpack((config) => {
    config.module.rule('js').use('custom').loader('umi-doc/CustomLoader')
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