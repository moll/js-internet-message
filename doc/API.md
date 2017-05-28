InternetMessage.js API Documentation
====================================
### [InternetMessage](#InternetMessage)
- [_header_](#internetMessage._header_)
- [body](#internetMessage.body)
- [.prototype.toJSON](#InternetMessage.prototype.toJSON)()
- [.prototype.toString](#InternetMessage.prototype.toString)([options])
- [.parse](#InternetMessage.parse)(message, [options])
- [.stringify](#InternetMessage.stringify)(message, [body], [options])


InternetMessage(headers, [body]) <a name="InternetMessage"></a>
--------------------------------
Create an instance of `InternetMessage`.

The only enumerable properties of an internet message will be the headers
you give to it and an optional `body`. Feel free to use a `for-in` loop.

For a message with no body, don't pass one or set it to `null` or
`undefined` as the `body` argument.

[rfc733]: https://tools.ietf.org/html/rfc733
[rfc822]: https://tools.ietf.org/html/rfc822
[rfc2822]: https://tools.ietf.org/html/rfc2822
[`InternetMessage`]: #InternetMessage
[`InternetMessage.stringify`]: #InternetMessage.stringify

### internetMessage._header_ <a name="internetMessage._header_"></a>
Set to the header value.  
Headers are always lower-cased, but their original capitalization is
retained internally for later stringifying.

### internetMessage.body <a name="internetMessage.body"></a>
Set to the body of the message.

If the message had no body (didn't contain any start-of-body character),
it'll be left out entirely. Accessing it will return the default
JavaScript's `undefined`.

If there was an empty body, e.g for the message below, `body` will be set to
`""`.
```
Content-Type: text/plain

```

### InternetMessage.prototype.toJSON() <a name="InternetMessage.prototype.toJSON"></a>
Returns a plain object of headers and `body`.  
Headers will be in their original capitalization.

### InternetMessage.prototype.toString([options]) <a name="InternetMessage.prototype.toString"></a>
Calls [`InternetMessage.stringify`][] with itself, forwarding any options
given to it.

**Examples**:
```javascript
var msg = new InternetMessage({"Content-Type": "text/plain"}, "Hello")
msg.toString({eol: "\n")
```

### InternetMessage.parse(message, [options]) <a name="InternetMessage.parse"></a>
Parse a string following [RFC 733][rfc733], [RFC 822][rfc822] or
[RFC 2822][rfc2822] to an instance of [`InternetMessage`][].  
One exception though: It doesn't yet support wrapped or folded header
lines.  
Throws `SyntaxError` if there's an invalid header line.

An empty message (`""`) is valid and means it had no headers nor a body.
Both are optional.  
A message consiting of whitespace (`" "`) however isn't valid and results in
a `SyntaxError`.

**Options**:

Name | Value
-----|------
eol  | String at the end of header lines.<br>Defaults to `\n` with an optional preceding `\r`.
sob  | String at the end of all headers to signal the start of body.<br>If not given, same as `eol`.

### InternetMessage.stringify(message, [body], [options]) <a name="InternetMessage.stringify"></a>
Returns a string following [RFC 733][rfc733], [RFC 822][rfc822] and
[RFC 2822][rfc2822].  
One exception though: It doesn't wrap long header lines as suggested by
those RFCs.

Pass it an instance of [`InternetMessage`][] or a plain object of headers
and a body.

**Options**:

Name | Value
-----|------
eol  | String to use at the end of header lines.<br>Defaults to `\r\n`.
sob  | String to use at the end of all headers to signal the start of body.<br>If not given, same as `eol`.

**Examples**:
```javascript
var msg = new InternetMessage({"Content-Type": "text/plain"}, "Hello")
var opts = {eol: "\n"}

InternetMessage.stringify(msg, opts)
InternetMessage.stringify({"Content-Type": "text/plain"}, "Hello", opts)
```
