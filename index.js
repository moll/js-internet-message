module.exports = InternetMessage
var START_OF_BODY = "\r\n"
var END_OF_LINE = "\r\n"

function InternetMessage(msg, body) {
  if (msg instanceof InternetMessage) msg = msg.toJSON()

  var name, names = {}
  for (name in msg) names[name.toLowerCase()] = name
  define(this, "_headers", names)

  for (name in names) this[name] = msg[names[name]]
  if (body !== undefined) this.body = body
}

define(InternetMessage.prototype, "toString", function(opts) {
  return this.constructor.stringify(this, opts)
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

InternetMessage.parse = function(msg, opts) {
  var sob = opts != null && "sob" in opts ? opts.sob : START_OF_BODY
  var eol = opts != null && "eol" in opts ? opts.eol : END_OF_LINE

  if (startsWith(msg, sob))
    return new InternetMessage(null, msg.slice(sob.length))

  var pos = msg.indexOf(eol + sob)
  var headers = parseHeaders(pos != -1 ? msg.slice(0, pos) : msg, eol)
  var body = pos != -1 ? msg.slice(pos + eol.length + sob.length) : undefined
  return new InternetMessage(headers, body)
}

InternetMessage.stringify = function(msg, body, opts) {
  if (msg instanceof InternetMessage)
    msg = msg.toJSON(), opts = body, body = msg.body
  else if (msg != null && body === undefined)
    body = msg.body

  var sob = opts != null && "sob" in opts ? opts.sob : START_OF_BODY
  var eol = opts != null && "eol" in opts ? opts.eol : END_OF_LINE

  var str = ""
  for (var name in msg) if (name != "body") str += name + ": " + msg[name] + eol
  if (body != null) str += sob + body

  return str
}

function define(obj, name, value) {
  Object.defineProperty(obj, name, {
    value: value, configurable: true, writable: true
  })
}

function parseHeaders(str, eol) {
  var headers = {}

  for (var i = 0, rawHeaders = str.split(eol); i < rawHeaders.length; ++i) {
    var header = rawHeaders[i]
    var pos = header.indexOf(":")
    var name = header.slice(0, pos)
    if (name != "") headers[name] = trimLeftSpace(header.slice(pos + 1))
  }

  return headers
}

function startsWith(haystack, needle) {
  return haystack.slice(0, needle.length) == needle
}

function trimLeftSpace(str) { return str[0] == " " ? str.slice(1) : str }
