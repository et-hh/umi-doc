var fm = require('front-matter')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const getHash = (str) => {
  const secret = 'abcdefg'
  return crypto.createHmac('sha256', secret)
  .update(str)
  .digest('hex')
}

const firstChartLowCase = str => {
  return str[0].toLowerCase() + str.substring(1)
}

// 获取依赖的组件的详情信息
const getComponentInfo = (source, resourcePath, componentName) => {
  let componentPath = ''
  let importPath = ''
  if (componentName) {
    const xiegang = resourcePath.includes('\/') ? '\/' : '\\'
    const comPathArr = source.match(new RegExp(`import.*?${componentName}.*?from\\s+['"]{1}(.*)['"]{1}`))
    importPath = comPathArr[1]
    componentPath = path.resolve(resourcePath.split(xiegang).slice(0, -1).join(xiegang), importPath)

    if (!componentPath.match(/\.tsx|\.jsx/)) {
      if (fs.existsSync(componentPath + '.tsx')) {
        componentPath += '.tsx'
      } else if (fs.existsSync(componentPath + '.jsx')) {
        componentPath += '.jsx'
      }
    }
  }

  componentPath = (componentPath.split('src')[1] || '').replace(/\\/g, '/')
  
  return {
    componentPath,
    importPath,
    hash: getHash(componentPath)
  }
}

module.exports = async function (source) {
  const callback = this.async()

  var content = fm(source)
  let { attributes, body } = content

  const resourcePath = this.resourcePath || ''
  const components = []

  // 识别jsx属性值
  const propReg = `\\s*[a-zA-Z0-9_]+={?([\`'"])[\\w\\W]*?\\3}?\\s*`
  const rs = body
    // 将<Props of={ AvatarGroup } />替换为<Props data={ getProps(/*组件信息*/, /*组件名*/) } />
    .replace(/of=\{\s*([a-zA-Z_]+)\s*\}/g, function(str, componentName) {
      // 获取依赖的组件的详情信息
      const componentInfo = getComponentInfo(body, resourcePath, componentName)
      if (!components.find(it => it.hash === componentInfo.hash)) {
        components.push(componentInfo)
      }

      return `data={ getProps(_ts_type_info_${componentInfo.hash}, '${componentInfo.componentPath}', '${firstChartLowCase(componentName)}') }`
    })
    // 给UseCase组件加code属性，值为children的文本格式
    .replace(new RegExp(`<UseCase((${propReg})*)>(([\\w\\W](?!UseCase))*?)<\\/UseCase>`, 'g'), function(str, attrs, $2, $3, code) {
      return `<UseCase${attrs} code={\`${code.replace(/\`/g, '\\`')}\`}>${code}</UseCase>`
    })
    // 处理js代码
    .replace(/<\!-- js start -->([\W\w]*?)<\!-- js end -->/g, function (str, code) {
      return `\r\nexport const tempCode = \`${code.replace(/\`/g, '\\`')}\`\r\n`
    })

  // 插入对getProps函数的引用
  let code = `export const docInfo = ${JSON.stringify(attributes)}
    \r\n${`import { getProps } from '@@/doc'\r\n` + rs}
  `

  components.forEach(it => {
    code = `import { _ts_type_info_ as _ts_type_info_${it.hash} } from '${it.importPath}'\r\n${code}`
  })
// if (resourcePath.includes('members')) {
//   fs.writeFileSync('./2.txt', code)
// }

  return callback(null, code)
}