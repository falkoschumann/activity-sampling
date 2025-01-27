export NPM_CONFIG_YES=true

all: dist check

clean:
	rm -rf out

distclean: clean
	rm -rf .next
	rm -rf coverage
	rm -rf node_modules

dist: build

start:
	npm start

check: test
	npx next lint
	npx prettier . --check

format:
	npx next lint --fix
	npx prettier . --write

dev:
	npx next dev --turbopack

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
	doc \
	dev test unit-tests integration-tests e2e-tests \
	build prepare version
