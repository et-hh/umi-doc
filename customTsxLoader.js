const fs = require('fs')
const docgen = require("./lib")

const options = {
  savePropValueAsString: true,
  shouldRemoveUndefinedFromOptional: false,
}

/** 
 * 1. 导出tsx文件的props对象
 */
module.exports = async function (source) {
  const callback = this.async()

  const resourcePath = this.resourcePath || ''

  // 排除不必要的文件，用于优化性能
  if (this.query.exclude && resourcePath.match(this.query.exclude)) {
    return callback(null, source)
  }

  if (resourcePath.includes('.tsx') && resourcePath.includes('components')) {
    const tsInfo = docgen.parse(resourcePath, options)
    const code = `${source}
      \r\n${`export const _ts_type_info_ = ` + JSON.stringify(tsInfo)}
    `

    return callback(null, code)
  } else if (resourcePath.includes('.jsx') && resourcePath.includes('components')) {
    return callback(null, `${source}
      \r\n${`export const _ts_type_info_ = []\r\n`}
    `)
  }
  
  callback(null, source)
}