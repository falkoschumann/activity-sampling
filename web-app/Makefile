export NPM_CONFIG_YES=true

all: dist check

clean:
	rm -rf coverage

distclean: clean
	rm -rf dist
	rm -rf node_modules

dist: build

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
	npx vitest run --testPathPattern=".*\/unit\/.*"

integration-tests: prepare
	npx vitest run --testPathPattern=".*\/integration\/.*"

e2e-tests: prepare
	npx vitest run --testPathPattern=".*\/e2e\/.*"

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
	@echo "Use Node.js $(shell node --version)"
	@echo "Use NPM $(shell npm --version)"

.PHONY: \
	all clean distclean dist \
	check format \
	dev test watch unit-tests integration-tests e2e-tests \
	build prepare version
