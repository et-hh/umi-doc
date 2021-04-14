const path = require('path')
const fs = require('fs')
const docgen = require("./lib")

const options = {
  savePropValueAsString: true,
  shouldRemoveUndefinedFromOptional: false,
}

const docFileSuffix = '.doc.tsx'

const getAllDoc = (rootPath, callback) => {
  let rs = []
  fs.readdir(rootPath, function(err, files){
    if (!files || !files.length) {
      return callback(rs)
    }

    let count = 0
    const checkEnd = () => {
      ++count === files.length && callback(rs)
    }
    files.forEach( function (file) {
      const filePath = rootPath + '/' + file //path.resolve(__dirname, 'src/components/' + file)
      fs.stat(filePath, function (err, stats) {
        if (stats.isFile()) {
          if (file && file.includes(docFileSuffix)) {
            rs.push({
              importPath: filePath,
              infoName: file.replace(docFileSuffix, '')
            })
          }

          checkEnd()
        } else if (stats.isDirectory()) {
          getAllDoc(filePath, arr => {
            rs = [...rs, ...arr]
            checkEnd()
          })
        }
      })
    });
  });
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

module.exports = function(source) {
  var callback = this.async();
  const resourcePath = this.resourcePath || ''
  
  // 单个组件的文档
  if (resourcePath.includes(docFileSuffix)) {
    const rs = source
      // 将<Props of={ AvatarGroup } />替换为<Props data={ getProps(/*组件信息*/, /*组件名*/) } />
      .replace(/of=\{\s*([a-zA-Z_]+)\s*\}/g, function(str, componentName) {
        // 获取依赖的组件的详情信息
        const componentInfo = getComponentInfo(source, resourcePath, componentName)

        return `data={ getProps(${JSON.stringify(componentInfo.info)}, '${componentInfo.componentPath}', '${componentName.replace(/^(.)(.*)$/, function(str, firstChar, others) {
          return firstChar.toLowerCase() + others
        })}') }`
      })
      // 给UseCase组件加code属性，值为children的文本格式
      .replace(/<UseCase([\W\w]*?)(['"]{1})\s*>([\W\w]*?)<\/UseCase>/g, function(str, attrs, kuohao, code) {
        return `<UseCase${attrs + kuohao}\r\ncode={\`${code}\`}>${code}</UseCase>`
      })

    // 插入对getProps函数的引用
    callback(null, `import { getProps } from '@@/doc'\r\n` + rs)
  }
  // 组件库文档模板文件
  else if (source && source.includes('// todo import docs')) {
    // 获取所有组件描述文件（.doc.tsx）
    getAllDoc('./src/components', rs => {
      callback(
        null,
        // 插入对组件描述文件的引入
        source.replace('// todo import docs', rs.map((info, index) =>
          `import Doc${index}, { ${info.infoName}DocInfo } from '${info.importPath.replace('./src/components/', '')}'\r\n`
        ).join(''))
        // 插入对组件应用代码
        .replace('// todo components def', `
          components = [
            ${rs.map((info, index) => info.infoName + 'DocInfo').join(', ')}
          ]
          componentsMap = new Map()
          ${
            rs.map((info, index) => `componentsMap.set(${info.infoName + 'DocInfo'}, <${'Doc' + index} />)\r\n`).join('')
          }
        `)
      )
    })
  } else {
    callback(null, source)
  }
}