NODE_OPTS =
TEST_OPTS =
GITHUB_URL = https://github.com/moll/js-internet-message

love:
	@echo "Feel like makin' love."

test:
	@node $(NODE_OPTS) ./node_modules/.bin/_mocha -R dot $(TEST_OPTS)

spec:
	@node $(NODE_OPTS) ./node_modules/.bin/_mocha -R spec $(TEST_OPTS)

autotest:
	@node $(NODE_OPTS) ./node_modules/.bin/_mocha -R dot --watch $(TEST_OPTS)

autospec:
	@node $(NODE_OPTS) ./node_modules/.bin/_mocha -R spec --watch $(TEST_OPTS)

pack:
	@file=$$(npm pack); echo "$$file"; tar tf "$$file"

publish:
	npm publish

tag:
	git tag "v$$(node -e 'console.log(require("./package").version)')"

# NOTE: Sorry, mocumentation is not yet published.
doc: doc.json
	@mkdir -p doc
	@~/Documents/Mocumentation/bin/mocument \
		--type yui \
		--title InternetMessage.js \
		tmp/doc/data.json > doc/API.md

toc: doc.json
	@~/Documents/Mocumentation/bin/mocument \
		--type yui \
		--template toc \
		--include InternetMessage \
		--var api_url=$(GITHUB_URL)/blob/master/doc/API.md \
		tmp/doc/data.json > tmp/TOC.md

	echo "/^### \[InternetMessage\]/,/^\$$/{/^#/r tmp/TOC.md\n/^\$$/!d;}" |\
		sed -i "" -f /dev/stdin README.md

doc.json:
	@mkdir -p tmp
	@yuidoc --exclude test,node_modules --parse-only --outdir tmp/doc .

clean:
	rm -f *.tgz tmp
	npm prune --production

.PHONY: love
.PHONY: test spec autotest autospec
.PHONY: pack publish tag
.PHONY: doc toc doc.json
.PHONY: clean
