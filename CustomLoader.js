const fs = require('fs')

const mdxSuffix = /\.mdx/

const getAllDoc = (rootPath, callback) => {
  let rs = []
  const files = fs.readdirSync(rootPath);
  if (!files || !files.length) {
    return callback(rs)
  }

  let count = 0
  const checkEnd = () => {
    ++count === files.length && callback(rs)
  }
  files.forEach( function (file) {
    const filePath = rootPath + '/' + file //path.resolve(__dirname, 'src/components/' + file)
    const stats = fs.statSync(filePath)
    if (stats.isFile()) {
      if (file && file.match(mdxSuffix)) {
        rs.push({
          importPath: filePath,
          infoName: file.replace(mdxSuffix, '')
        })
      }

      checkEnd()
    } else if (stats.isDirectory()) {
      getAllDoc(filePath, arr => {
        rs = [...rs, ...arr]
        checkEnd()
      })
    }
  });
}

module.exports = function(source) {
  var callback = this.async();
  const resourcePath = this.resourcePath || ''
  // 获取alias
  // console.log(this._compilation.options.resolve.alias)
  
  // 带有js代码的文档文件
  if (resourcePath.match(mdxSuffix) && source && source.includes('tempCode')) {
    let _code = ''
    const rs = source
      .replace(/export const tempCode = `([\W\w]*)`;([^;]+const layoutProps)/g, function (str, code, $2) {
        _code = code
        return $2
      })
      .replace('tempCode', '')
      .replace('return <MDXLayout', `\r\n${_code}\r\nreturn <MDXLayout`)
    callback(
      null,
      rs
    )
  }
  // 组件库文档模板文件
  else if (resourcePath.includes('doc') && resourcePath.includes('index.tsx') && source && source.includes('// todo import docs')) {
    // 获取所有组件描述文件（.doc.tsx）
    getAllDoc('./src/components', rs => {
      callback(
        null,
        // 插入对组件描述文件的引入
        source.replace('// todo import docs', rs.map((info, index) =>
          `import Doc${index}, { docInfo as DocInfo${index} } from '${info.importPath.replace('./src/components/', '')}'\r\n`
        ).join(''))
        // 插入对组件应用代码
        .replace('// todo components def', `
          components = [
            ${rs.map((info, index) => 'DocInfo' + index).join(', ')}
          ]
          componentsMap = new Map()
          ${
            rs.map((info, index) => `componentsMap.set(DocInfo${index}, <${'Doc' + index} />)\r\n`).join('')
          }
        `)
      )
    })
  } else {
    callback(null, source)
  }
}