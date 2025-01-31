export NPM_CONFIG_YES=true

all: dist check

clean:
	rm -rf coverage

distclean: clean
	rm -rf dist
	rm -rf node_modules

dist: build

start:
	npm start

check: test
	npx eslint .
	npx prettier . --check

format:
	npx eslint --fix .
	npx prettier . --write

dev:
	npx vite

test:
	npm test

watch:
	npm run test:watch

unit-tests:
	npm test -- --testPathPattern=/.*unit.*/

integration-tests:
	npm test -- --testPathPattern=/.*integration.*/

e2e-tests:
	npm test -- --testPathPattern=/.*e2e.*/

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
	all clean distclean dist start \
	check format \
	dev test unit-tests integration-tests e2e-tests \
	build prepare version
