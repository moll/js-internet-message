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
      msg.toString().must.equal("Content-Type: text/plain\n\nHello")
    })

    it("must stringify header in given capitalization", function() {
      var headers = {"CoNTenT-TyPe": "text/plain"}
      var msg = new InternetMessage(headers, "Hello")
      msg.toString().must.equal("CoNTenT-TyPe: text/plain\n\nHello")
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
      var msg = InternetMessage.parse("Content-Type: text/plain\n\nHello")
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}, "Hello"))
    })

    it("must parse headers and body", function() {
      var str = "Content-Type: text/plain\nRange: 100-200\n\nHello"
      var msg = InternetMessage.parse(str)
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      msg.must.eql(new InternetMessage(headers, "Hello"))
    })

    it("must parse header without leading space", function() {
      var msg = InternetMessage.parse("Content-Type:text/plain\n\n")
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}, ""))
    })

    it("must parse headers with no body", function() {
      var msg = InternetMessage.parse("Content-Type: text/plain\n")
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}))
    })

    it("must parse headers with empty body", function() {
      var msg = InternetMessage.parse("Content-Type: text/plain\n\n")
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}, ""))
    })

    it("must parse headers with blank lined body", function() {
      var msg = InternetMessage.parse("Content-Type: text/plain\n\n\n")
      msg.must.eql(new InternetMessage({"Content-Type": "text/plain"}, "\n"))
    })

    it("must parse given empty string", function() {
      var msg = InternetMessage.parse("")
      msg.must.eql(new InternetMessage)
    })

    it("must parse body given empty headers", function() {
      var msg = InternetMessage.parse("\nHello")
      msg.must.eql(new InternetMessage(null, "Hello"))
    })
  })

  describe(".stringify", function() {
    it("must stringify InternetMessage", function() {
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      var msg = new InternetMessage(headers, "Hello")
      var str = InternetMessage.stringify(msg, "Hello")
      str.must.equal("Content-Type: text/plain\nRange: 100-200\n\nHello")
    })

    it("must stringify header and body", function() {
      var headers = {"Content-Type": "text/plain"}
      var str = InternetMessage.stringify(headers, "Hello")
      str.must.equal("Content-Type: text/plain\n\nHello")
    })

    it("must stringify headers and body", function() {
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      var str = InternetMessage.stringify(headers, "Hello")
      str.must.equal("Content-Type: text/plain\nRange: 100-200\n\nHello")
    })

    it("must stringify body given empty headers", function() {
      InternetMessage.stringify({}, "Hello").must.equal("\nHello")
    })

    it("must stringify headers and empty body if given undefined", function() {
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      var str = InternetMessage.stringify(headers, undefined)
      str.must.equal("Content-Type: text/plain\nRange: 100-200\n")
    })

    it("must stringify headers and empty body if given null", function() {
      var headers = {"Content-Type": "text/plain", "Range": "100-200"}
      var str = InternetMessage.stringify(headers, null)
      str.must.equal("Content-Type: text/plain\nRange: 100-200\n")
    })

    it("must stringify body given undefined headers", function() {
      InternetMessage.stringify(undefined, "Hello").must.equal("\nHello")
    })

    it("must stringify body given null headers", function() {
      InternetMessage.stringify(null, "Hello").must.equal("\nHello")
    })

    it("must stringify empty if both undefined", function() {
      InternetMessage.stringify(null, undefined).must.equal("")
    })

    it("must stringify empty if both null", function() {
      InternetMessage.stringify(null, null).must.equal("")
    })
  })
})
