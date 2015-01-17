var LF = "\n"
var CR = "\r"
var CRLF = CR + LF
module.exports = InternetMessage

/**
 * Create an instance of `InternetMessage`.
 *
 * The only enumerable properties of an internet message will be the headers
 * you give to it and an optional `body`. Feel free to use a `for-in` loop.
 *
 * For a message with no body, don't pass one or set it to `null` or
 * `undefined` as the `body` argument.
 *
 * [rfc733]: https://tools.ietf.org/html/rfc733
 * [rfc822]: https://tools.ietf.org/html/rfc822
 * [rfc2822]: https://tools.ietf.org/html/rfc2822
 * [`InternetMessage`]: #InternetMessage
 * [`InternetMessage.stringify`]: #InternetMessage.stringify
 *
 * @class InternetMessage
 * @constructor
 * @param {Object} headers
 * @param {String} [body]
 */
function InternetMessage(msg, body) {
  if (msg instanceof InternetMessage) msg = msg.toJSON()

  var name, names = {}
  for (name in msg) names[name.toLowerCase()] = name
  define(this, "_headers", names)

  for (name in names) this[name] = msg[names[name]]
  if (body !== undefined) this.body = body
}

/**
 * Set to the header value.  
 * Headers are always lower-cased, but their original capitalization is
 * retained internally for later stringifying.
 *
 * @property {String} _header_
 */

/**
 * Set to the body of the message.
 *
 * If the message had no body (didn't contain any start-of-body character),
 * it'll be left out entirely. Accessing it will return the default
 * JavaScript's `undefined`.
 *
 * If there was an empty body, e.g for the message below, `body` will be set to
 * `""`.
 * ```
 * Content-Type: text/plain
 *
 * ```
 *
 * @property {String} body
 */

/**
 * Calls [`InternetMessage.stringify`][] with itself, forwarding any options
 * given to it.
 *
 * @example
 * var msg = new InternetMessage({"Content-Type": "text/plain"}, "Hello")
 * msg.toString({eol: "\n")
 *
 * @method toString
 * @param {Object} [options]
 */
define(InternetMessage.prototype, "toString", function(opts) {
  return this.constructor.stringify(this, opts)
})

/**
 * Returns a plain object of headers and `body`.  
 * Headers will be in their original capitalization.
 *
 * @method toJSON
 */
define(InternetMessage.prototype, "toJSON", function() {
  var obj = {}

  for (var name in this) {
    var value = this[name]
    if (name in this._headers) name = this._headers[name]
    obj[name] = value
  }

  return obj
})

/**
 * Parse a string following [RFC 733][rfc733], [RFC 822][rfc822] or
 * [RFC 2822][rfc2822] to an instance of [`InternetMessage`][].  
 * One exception though: It doesn't yet support wrapped or folded header
 * lines.  
 * Throws `SyntaxError` if there's an invalid header line.
 *
 * An empty message (`""`) is valid and means it had no headers nor a body.
 * Both are optional.  
 * A message consiting of whitespace (`" "`) however isn't valid and results in
 * a `SyntaxError`.
 *
 * **Options**:
 *
 * Name | Value
 * -----|------
 * eol  | String at the end of header lines.<br>Defaults to `\n` with an optional preceding `\r`.
 * sob  | String at the end of all headers to signal the start of body.<br>If not given, same as `eol`.
 *
 * @static
 * @method parse
 * @param {String} message
 * @param {Object} [options]
 */
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

/**
 * Returns a string following [RFC 733][rfc733], [RFC 822][rfc822] and
 * [RFC 2822][rfc2822].  
 * One exception though: It doesn't wrap long header lines as suggested by
 * those RFCs.
 *
 * Pass it an instance of [`InternetMessage`][] or a plain object of headers
 * and a body.
 *
 * **Options**:
 *
 * Name | Value
 * -----|------
 * eol  | String to use at the end of header lines.<br>Defaults to `\r\n`.
 * sob  | String to use at the end of all headers to signal the start of body.<br>If not given, same as `eol`.
 *
 * @example
 * var msg = new InternetMessage({"Content-Type": "text/plain"}, "Hello")
 * var opts = {eol: "\n"}
 *
 * InternetMessage.stringify(msg, opts)
 * InternetMessage.stringify({"Content-Type": "text/plain"}, "Hello", opts)
 *
 * @static
 * @method stringify
 * @param {Object} message
 * @param {String} [body]
 * @param {Object} [options]
 */
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
