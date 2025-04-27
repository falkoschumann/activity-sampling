export NPM_CONFIG_YES=true

# Needed for compatibility with Node.js 18
export NODE_OPTIONS=--experimental-global-webcrypto

all: dist check

clean:
	rm -rf coverage

distclean: clean
	rm -rf dist
	rm -rf node_modules

dist: build

start:
	npm preview

check: test
	npx eslint .
	npx prettier . --check

format:
	npx eslint --fix .
	npx prettier . --write

dev: prepare
	npx vite

test: prepare
	npx vitest run

watch: prepare
	npm test

coverage: prepare
	npx vitest run --coverage

unit-tests: prepare
	npx vitest run unit

integration-tests: prepare
	npx vitest run integration

e2e-tests: prepare
	npx vitest run e2e

build: prepare
	npm run build

prepare: version
	@if [ -n "$(CI)" ] ; then \
  		echo "CI detected, run npm ci"; \
  		npm ci; \
  	else \
  		npm install; \
  	fi

version:
	@echo "Node.js $(shell node --version)"
	@echo "NPM $(shell npm --version)"

.PHONY: \
	all clean distclean dist start \
	check format \
	dev test watch coverage unit-tests integration-tests e2e-tests \
	build prepare version
