InternetMessage.js
==================
[![NPM version][npm-badge]](http://badge.fury.io/js/internet-message)
[npm-badge]: https://badge.fury.io/js/internet-message.png

**InternetMessage.js** is a small JavaScript library for parsing messages and
stringifying objects to the syntax of [RFC 733 (ARPA Network Text
Message)][rfc733], [RFC 822 (ARPA Internet Text Messages)][rfc822] and [RFC 2822
(Internet Message Format)][rfc2822]. You've probably seen the format in e-mail
messages or in HTTP. It's basically a **format for headers and a body**. You can
use it to **send both text or binary data**.

InternetMessage.js isn't meant to be an e-mail or HTTP parser, but more of
a useful small library for sending **standard formatted messages** over any
channel that doesn't have built-in structured data. Comes in handy with message
queues (like [ZeroMQ][zeromq]), event sockets ([WebSockets][websockets] and
[Server-Sent Events][sse]) and such. Where the medium just gives you a single
blob without structure, use InternetMessage.js and [RFC 822][rfc822] to not have
to invent a custom format.

#### Example
```
Message-Id: fc00fc02a215412780bf09a7dcd5e33c
Content-Type: application/json

{"type":"created", "uri": "/models/1"}
```

[rfc733]: https://tools.ietf.org/html/rfc733
[rfc822]: https://tools.ietf.org/html/rfc822
[rfc2822]: https://tools.ietf.org/html/rfc2822
[zeromq]: http://zeromq.org/
[websockets]: https://tools.ietf.org/html/rfc6455
[sse]: http://dev.w3.org/html5/eventsource/


Installing
----------
```sh
npm install internet-message
```

InternetMessage.js follows [semantic versioning](http://semver.org/), so feel
free to depend on its major version with something like `>= 1.0.0 < 2`
(a.k.a `^1.0.0`).


Using
-----
Create an instance of `InternetMessage` by giving it an object of headers and
any text for the body.
```javascript
var InternetMessage = require("internet-message")

var msg = new InternetMessage({
  "Content-Type": "application/json",
  "Location": "http://example.com/models/1"
}, JSON.stringify({name: "John"}))
```

Calling `msg.toString()` will then return the message as a string:
```
Content-Type: application/json
Location: http://example.com/models/1

{"name":"John"}
```

As the standard requires, lines will end with CRLF (carriage return and line
feed).

You can also use `InternetMessage.stringify` directly without creating an
intermediate `InternetMessage` instance:
```javascript
InternetMessage.stringify(headers, body)
```

### Parsing
Giving the message below to `InternetMessage.parse` will give you an instance of
`InternetMessage`:
```
Content-Type: application/json
Location: http://example.com/models/1

{"name":"John"}
```

The message will have headers as enumerable properties and a `body` property
with the body, if it has one. All header names are in lower-case for easier
access.

```javascript
var msg = InternetMessage.parse(TEXT)
msg["content-type"] // => "application/json"
msg["location"]     // => "http://example.com/models/1"
msg.body            // => "{\"name\":\"John\"}"
```

### Customizing end-of-line or start-of-body
If you wish to customize the end-of-line and start-of-body characters the header
uses, pass them as strings of any length to `InternetMessage.prototype.toString`
or `InternetMessage.stringify`.
```javascript
msg.toString({eol: "\n"})
msg.toString({eol: "\x1e", sob: "\x02"})
InternetMessage.stringify(msg, {eol: "\n"})
```

Remember to pass the same options later to `InternetMessage.parse`.

If you've just changed the `eol` option to `\n`, then don't bother.
`InternetMessage.parse` supports both `\r\n` and `\n` as the end-of-line out of
the box.


API
---
For extended documentation on all functions, please see the [InternetMessage.js
API Documentation][api].

[api]: https://github.com/moll/js-internet-message/blob/master/doc/API.md

### [InternetMessage](https://github.com/moll/js-internet-message/blob/master/doc/API.md#InternetMessage)
- [_header_](https://github.com/moll/js-internet-message/blob/master/doc/API.md#internetMessage._header_)
- [body](https://github.com/moll/js-internet-message/blob/master/doc/API.md#internetMessage.body)
- [parse](https://github.com/moll/js-internet-message/blob/master/doc/API.md#InternetMessage.parse)(message, [options])
- [stringify](https://github.com/moll/js-internet-message/blob/master/doc/API.md#InternetMessage.stringify)(message, [body], [options])
- [toJSON](https://github.com/moll/js-internet-message/blob/master/doc/API.md#InternetMessage.prototype.toJSON)()
- [toString](https://github.com/moll/js-internet-message/blob/master/doc/API.md#InternetMessage.prototype.toString)([options])


License
-------
InternetMessage.js is released under a *Lesser GNU Affero General Public
License*, which in summary means:

- You **can** use this program for **no cost**.
- You **can** use this program for **both personal and commercial reasons**.
- You **do not have to share your own program's code** which uses this program.
- You **have to share modifications** (e.g. bug-fixes) you've made to this
  program.

For more convoluted language, see the `LICENSE` file.


About
-----
**[Andri Möll][moll]** typed this and the code.  
[Monday Calendar][monday] supported the engineering work.

If you find InternetMessage.js needs improving, please don't hesitate to type to
me now at [andri@dot.ee][email] or [create an issue online][issues].

[email]: mailto:andri@dot.ee
[issues]: https://github.com/moll/js-internet-message/issues
[moll]: http://themoll.com
[monday]: https://mondayapp.com
