var fm = require('front-matter')

module.exports = async function (source) {
  const callback = this.async()

  var content = fm(source)
  const { attributes, body } = content

  const code = `export const docInfo = ${JSON.stringify(attributes)}
${body}`

  return callback(null, code)
}