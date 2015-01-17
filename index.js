var LF = "\n"
var CR = "\r"
var CRLF = CR + LF
module.exports = InternetMessage

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
  var eol = opts != null && "eol" in opts ? opts.eol : LF
  var sob = opts != null && "sob" in opts ? opts.sob : eol
  var body = opts != null && "body" in opts ? !!opts.body : true

  var headers = []
  for (var i = 0; i < msg.length; i = eolIndex + eol.length) {
    if (stringAt(msg, sob, i)) break
    if (sob == LF && stringAt(msg, CRLF, i)) { ++i; break }

    var eolIndex = msg.indexOf(eol, i)
    if (eolIndex == -1) throw new SyntaxError("Invalid Message: No EOL")

    var line = msg.slice(i, eolIndex)
    if (eol == LF && line[line.length - 1] == CR) line = line.slice(0, -1)
    headers.push(line)
  }

  return new InternetMessage(
    parseHeaders(headers),
    body && i < msg.length ? msg.slice(i + sob.length) : undefined
  )
}

InternetMessage.stringify = function(msg, body, opts) {
  if (msg instanceof InternetMessage)
    msg = msg.toJSON(), opts = body, body = msg.body
  else if (msg != null && body === undefined)
    body = msg.body

  var eol = opts != null && "eol" in opts ? opts.eol : CRLF
  var sob = opts != null && "sob" in opts ? opts.sob : eol

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

function parseHeaders(lines) {
  if (lines.length == 0) return null

  return lines.reduce(function(headers, header) {
    var pos = header.indexOf(":")
    var name = header.slice(0, pos)
    if (name != "") headers[name] = trimLeftSpace(header.slice(pos + 1))
    return headers
  }, {})
}

function stringAt(hay, str, i) { return hay.substr(i, str.length) == str }
function trimLeftSpace(str) { return str[0] == " " ? str.slice(1) : str }
