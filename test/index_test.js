var InternetMessage = require("..")

describe("InternetMessage", function() {
  describe("new", function() {
    it("must be an instance of InternetMessage", function() {
      new InternetMessage().must.be.an.instanceof(InternetMessage)
    })

    it("must set headers and body if given separately", function() {
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      var msg = new InternetMessage(headers, "Hello")
      msg.must.have.property("content-type", "text/plain")
      msg.must.have.property("range", "100-200")
      msg.must.have.property("body", "Hello")
    })

    it("must set headers and body if given in one object", function() {
      var obj = {"Content-Type": "text/plain", "Range": "100-200", body: "Hi"}
      var msg = new InternetMessage(obj)
      msg.must.have.property("content-type", "text/plain")
      msg.must.have.property("range", "100-200")
      msg.must.have.property("body", "Hi")
    })

    it("must not set body if given undefined", function() {
      new InternetMessage(null, undefined).must.not.have.property("body")
    })

    it("must set body if given null", function() {
      new InternetMessage(null, null).must.have.property("body", null)
    })

    it("must convert header names to lower case", function() {
      var msg = new InternetMessage({"CoNTenT-TyPe": "text/plain"})
      msg.must.have.property("content-type", "text/plain")
    })

    it("must not have other keys besides header and body", function() {
      var msg = new InternetMessage({"Content-Type": "text/plain"}, "Hello")
      msg.must.have.keys(["content-type", "body"])
    })

    it("must set headers and body given InternetMessage", function() {
      var other = new InternetMessage({"Content-Type": "text/plain"}, "Hello")
      var msg = new InternetMessage(other)
      msg.must.eql(other)
    })

    it("must not lose header casing if given InternetMessage", function() {
      var other = new InternetMessage({"Content-Type": "text/plain"}, "Hello")
      var msg = new InternetMessage(other)
      msg.toJSON().must.eql({"Content-Type": "text/plain", body: "Hello"})
    })
  })

  describe(".prototype.toString", function() {
    it("must stringify header and body", function() {
      var headers = {"Content-Type": "text/plain"}
      var msg = new InternetMessage(headers, "Hello")
      msg.toString().must.equal("Content-Type: text/plain\r\n\r\nHello")
    })

    it("must stringify header and body given options", function() {
      var headers = {"Content-Type": "text/plain"}
      var msg = new InternetMessage(headers, "Hello")
      var str = msg.toString({eol: "\x1e", sob: "\x02"})
      str.must.equal("Content-Type: text/plain\x1e\x02Hello")
    })

    it("must stringify header in given capitalization", function() {
      var headers = {"CoNTenT-TyPe": "text/plain"}
      var msg = new InternetMessage(headers, "Hello")
      msg.toString().must.equal("CoNTenT-TyPe: text/plain\r\n\r\nHello")
    })
  })

  describe(".prototype.toJSON", function() {
    it("must return an object with header and body", function() {
      var msg = new InternetMessage({"Content-Type": "text/plain"}, "Hello")
      msg.toJSON().must.eql({"Content-Type": "text/plain", body: "Hello"})
    })
  })

  describe(".parse", function() {
    it("must parse header and body", function() {
      var msg = InternetMessage.parse("Content-Type: text/plain\r\n\r\nHello")
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}, "Hello"))
    })

    it("must parse header and body given only line feed", function() {
      var msg = InternetMessage.parse("Content-Type: text/plain\n\nHello")
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}, "Hello"))
    })

    it("must parse header and body given end of line", function() {
      var text = "Content-Type: text/plain\x1e\x1eHello"
      var msg = InternetMessage.parse(text, {eol: "\x1e"})
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}, "Hello"))
    })

    it("must parse header and body given longer end of line", function() {
      var text = "Content-Type: text/plain######Hello"
      var msg = InternetMessage.parse(text, {eol: "###"})
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}, "Hello"))
    })

    it("must parse header and body given start of body", function() {
      var text = "Content-Type: text/plain\r\n\x02Hello"
      var msg = InternetMessage.parse(text, {sob: "\x02"})
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}, "Hello"))
    })

    it("must parse header and body given longer start of body", function() {
      var text = "Content-Type: text/plain\r\n###Hello"
      var msg = InternetMessage.parse(text, {sob: "###"})
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}, "Hello"))
    })

    it("must parse headers and body", function() {
      var str = "Content-Type: text/plain\r\nRange: 100-200\r\n\r\nHello"
      var msg = InternetMessage.parse(str)
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      msg.must.eql(new InternetMessage(headers, "Hello"))
    })

    it("must parse headers and body given end of line", function() {
      var str = "Content-Type: text/plain\x1eRange: 100-200\x1e\x1eHello"
      var msg = InternetMessage.parse(str, {eol: "\x1e"})
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      msg.must.eql(new InternetMessage(headers, "Hello"))
    })

    it("must parse headers and body given start of body", function() {
      var str = "Content-Type: text/plain\r\nRange: 100-200\r\n\x02Hello"
      var msg = InternetMessage.parse(str, {sob: "\x02"})
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      msg.must.eql(new InternetMessage(headers, "Hello"))
    })

    it("must parse header without leading space", function() {
      var msg = InternetMessage.parse("Content-Type:text/plain\r\n")
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}))
    })

    it("must parse header with multiple colons", function() {
      var msg = InternetMessage.parse("Ratio: 1:2\r\n")
      msg.must.eql(new InternetMessage({"Ratio": "1:2"}))
    })

    it("must parse headers with no body", function() {
      var msg = InternetMessage.parse("Content-Type: text/plain\r\n")
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}))
    })

    it("must parse headers with empty body", function() {
      var msg = InternetMessage.parse("Content-Type: text/plain\r\n\r\n")
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}, ""))
    })

    it("must parse headers with blank lined body", function() {
      var msg = InternetMessage.parse("Content-Type: text/plain\r\n\r\n\r\n")
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}, "\r\n"))
    })

    // An empty string has to be valid as the body is optional and there's no
    // requirement to have any headers either.
    it("must parse given empty string", function() {
      var msg = InternetMessage.parse("")
      msg.must.eql(new InternetMessage)
    })

    it("must parse body given just body", function() {
      var msg = InternetMessage.parse("\r\nHello")
      msg.must.eql(new InternetMessage(null, "Hello"))
    })

    it("must parse body given just body and line feed", function() {
      var msg = InternetMessage.parse("\nHello")
      msg.must.eql(new InternetMessage(null, "Hello"))
    })

    it("must parse body given just blank body", function() {
      var msg = InternetMessage.parse("\r\n")
      msg.must.eql(new InternetMessage(null, ""))
    })

    it("must parse body given just blank body and line feed", function() {
      var msg = InternetMessage.parse("\n")
      msg.must.eql(new InternetMessage(null, ""))
    })

    it("must throw SyntaxError given a line with no end of line", function() {
      var err
      try { InternetMessage.parse("Content-Type: text/plain") }
      catch (ex) { err = ex }
      err.must.be.an.instanceof(SyntaxError)
    })

    it("must throw SyntaxError given a blank line", function() {
      var err
      try { InternetMessage.parse(" ") } catch (ex) { err = ex }
      err.must.be.an.instanceof(SyntaxError)
    })
  })

  describe(".stringify", function() {
    it("must stringify InternetMessage", function() {
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      var msg = new InternetMessage(headers, "Hello")
      var str = InternetMessage.stringify(msg)
      str.must.equal("Content-Type: text/plain\r\nRange: 100-200\r\n\r\nHello")
    })

    it("must stringify InternetMessage given options", function() {
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      var msg = new InternetMessage(headers, "Hello")
      var str = InternetMessage.stringify(msg, {eol: "\x1e", sob: "\x02"})
      str.must.equal("Content-Type: text/plain\x1eRange: 100-200\x1e\x02Hello")
    })

    it("must stringify header and body", function() {
      var headers = {"Content-Type": "text/plain"}
      var str = InternetMessage.stringify(headers, "Hello")
      str.must.equal("Content-Type: text/plain\r\n\r\nHello")
    })

    it("must stringify header and body given end of line", function() {
      var headers = {"Content-Type": "text/plain"}
      var str = InternetMessage.stringify(headers, "Hello", {eol: "\x1e"})
      str.must.equal("Content-Type: text/plain\x1e\x1eHello")
    })

    it("must stringify header and body given start of body", function() {
      var headers = {"Content-Type": "text/plain"}
      var str = InternetMessage.stringify(headers, "Hello", {sob: "\x02"})
      str.must.equal("Content-Type: text/plain\r\n\x02Hello")
    })

    it("must stringify headers and body", function() {
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      var str = InternetMessage.stringify(headers, "Hello")
      str.must.equal("Content-Type: text/plain\r\nRange: 100-200\r\n\r\nHello")
    })

    it("must stringify headers and body given end of line", function() {
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      var str = InternetMessage.stringify(headers, "Hello", {eol: "\x1e"})
      str.must.equal("Content-Type: text/plain\x1eRange: 100-200\x1e\x1eHello")
    })

    it("must stringify headers and body given start of body", function() {
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      var str = InternetMessage.stringify(headers, "Hello", {sob: "\x02"})
      str.must.equal("Content-Type: text/plain\r\nRange: 100-200\r\n\x02Hello")
    })

    it("must stringify body given empty headers", function() {
      InternetMessage.stringify({}, "Hello").must.equal("\r\nHello")
    })

    it("must stringify headers and empty body if given undefined", function() {
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      var str = InternetMessage.stringify(headers, undefined)
      str.must.equal("Content-Type: text/plain\r\nRange: 100-200\r\n")
    })

    it("must stringify headers and empty body if given null", function() {
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      var str = InternetMessage.stringify(headers, null)
      str.must.equal("Content-Type: text/plain\r\nRange: 100-200\r\n")
    })

    it("must stringify body given undefined headers", function() {
      InternetMessage.stringify(undefined, "Hello").must.equal("\r\nHello")
    })

    it("must stringify body given null headers", function() {
      InternetMessage.stringify(null, "Hello").must.equal("\r\nHello")
    })

    it("must stringify empty if both undefined", function() {
      InternetMessage.stringify(undefined, undefined).must.equal("")
    })

    it("must stringify empty if both null", function() {
      InternetMessage.stringify(null, null).must.equal("")
    })
  })
})
