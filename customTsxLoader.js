const fs = require('fs')
const path = require('path')
const docgen = require("./lib")
const crypto = require('crypto')

const options = {
  savePropValueAsString: true,
  shouldRemoveUndefinedFromOptional: false,
}

const getHash = (str) => {
  const secret = 'abcdefg'
  return crypto.createHmac('sha256', secret)
  .update(str)
  .digest('hex')
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
    // 根据文件路径生成缓存文件路径
    const info_json_path = path.resolve(__dirname, `./propsCache/${resourcePath.replace(/[^a-zA-Z]/g, '_')}.json`)
    
    // 读取缓存的属性列表
    let data = {}
    try {
      data = fs.readFileSync(info_json_path)
      if (data.toString()) {
        data = JSON.parse(data.toString())
      } else {
        data = {}
      }
    } catch(e) {
      // 一般是该文件还未创建
      data = {}
    }
    
    const resourceHash = getHash(source)
    let tsInfo
    if (data.hash === resourceHash) {
      // 如果文件没变，直接从缓存结果取属性值就行了
      tsInfo = data.tsInfo
    } else {
      // 读取当前文件属性
      tsInfo = docgen.parse(resourcePath, options)

      // 每次读取属性后将该信息缓存
      data.tsInfo = tsInfo
      data.hash = resourceHash
      fs.writeFile(info_json_path, JSON.stringify(data), function(err) {
        if (err) {
          console.error(err)
        }
      })
    }

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