module.exports = InternetMessage

function InternetMessage(msg, body) {
  if (msg instanceof InternetMessage) msg = msg.toJSON()

  var name, names = {}
  for (name in msg) names[name.toLowerCase()] = name
  define(this, "_headers", names)

  for (name in names) this[name] = msg[names[name]]
  if (body !== undefined) this.body = body
}

define(InternetMessage.prototype, "toString", function() {
  return this.constructor.stringify(this)
})

define(InternetMessage.prototype, "toJSON", function() {
  var obj = {}

  for (var name in this) {
    var value = this[name]
    if (name in this._headers) name = this._headers[name]
    obj[name] = value
  }

  return obj
})

InternetMessage.parse = function(msg) {
  if (msg[0] == "\n") return new InternetMessage(null, msg.slice(1))
  var pos = msg.indexOf("\n\n")
  if (pos == -1) return new InternetMessage(parseHeaders(msg.slice(0, pos)))
  return new InternetMessage(parseHeaders(msg.slice(0, pos)), msg.slice(pos+2))
}

InternetMessage.stringify = function(msg, body) {
  if (msg instanceof InternetMessage) msg = msg.toJSON()
  if (msg && body === undefined) body = msg.body

  var str = ""
  for (var name in msg) if (name != "body") str += name + ": " + msg[name] +"\n"
  if (body != null) str += "\n" + body

  return str
}

function define(obj, name, value) {
  Object.defineProperty(obj, name, {
    value: value, configurable: true, writable: true
  })
}

function parseHeaders(str) {
  var headers = {}

  for (var i = 0, rawHeaders = str.split("\n"); i < rawHeaders.length; ++i) {
    var header = rawHeaders[i]
    var pos = header.indexOf(":")
    var name = header.slice(0, pos)
    if (name != "") headers[name] = trimLeftSpace(header.slice(pos + 1))
  }

  return headers
}

function trimLeftSpace(str) { return str[0] == " " ? str.slice(1) : str }
