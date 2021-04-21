var fm = require('front-matter')
const path = require('path')
const fs = require('fs')
const docgen = require("./lib")

const options = {
  savePropValueAsString: true,
  shouldRemoveUndefinedFromOptional: false,
}

// 获取依赖的组件的详情信息
const getComponentInfo = (source, resourcePath, componentName) => {
  // const useComponentArr = source.match(/of=\{\s*([a-zA-Z_]+)\s*\}/)
  // const comName = useComponentArr ? useComponentArr[1] : ''
  let info = []
  let componentPath = ''
  if (componentName) {
    const xiegang = resourcePath.includes('\/') ? '\/' : '\\'
    const comPathArr = source.match(new RegExp(`import.*?${componentName}.*?from\\s+['"]{1}(.*)['"]{1}`))
    componentPath = path.resolve(resourcePath.split(xiegang).slice(0, -1).join(xiegang), comPathArr[1])

    if (!componentPath.match(/\.tsx|\.jsx/)) {
      if (fs.existsSync(componentPath + '.tsx')) {
        componentPath += '.tsx'
      } else if (fs.existsSync(componentPath + '.jsx')) {
        componentPath += '.jsx'
      }
    }
    // console.log(componentPath)
    // Parse a file for docgen info
    info = docgen.parse(componentPath, options)
    // if (componentPath.includes('avatarGroup')) {
    //   console.log(info)
    // }
  }

  return { info, componentPath: componentPath ? (componentPath.split('src')[1] || '').replace(/\\/g, '/') : '' }
}

module.exports = async function (source) {
  const callback = this.async()

  var content = fm(source)
  let { attributes, body } = content

  const resourcePath = this.resourcePath || ''

  const rs = body
    // 将<Props of={ AvatarGroup } />替换为<Props data={ getProps(/*组件信息*/, /*组件名*/) } />
    .replace(/of=\{\s*([a-zA-Z_]+)\s*\}/g, function(str, componentName) {
      // 获取依赖的组件的详情信息
      const componentInfo = getComponentInfo(body, resourcePath, componentName)

      return `data={ getProps(${JSON.stringify(componentInfo.info)}, '${componentInfo.componentPath}', '${componentName.replace(/^(.)(.*)$/, function(str, firstChar, others) {
        return firstChar.toLowerCase() + others
      })}') }`
    })
    // 给UseCase组件加code属性，值为children的文本格式
    .replace(/<UseCase([\W\w]*?)(['"]{1})\s*>([\W\w]*?)<\/UseCase>/g, function(str, attrs, kuohao, code) {
      return `<UseCase${attrs + kuohao}\r\ncode={\`${code.replace(/\`/g, '\\`')}\`}>${code}</UseCase>`
    })
    // 处理js代码
    .replace(/<\!-- js start -->([\W\w]*?)<\!-- js end -->/g, function (str, code) {
      return `\r\nexport const tempCode = \`${code.replace(/\`/g, '\\`')}\`\r\n`
    })

  // 插入对getProps函数的引用
  const code = `export const docInfo = ${JSON.stringify(attributes)}
  \r\n${`import { getProps } from '@@/doc'\r\n` + rs}
`
// if (resourcePath.includes('members')) {
//   fs.writeFileSync('./2.txt', code)
// }
  return callback(null, code)
}