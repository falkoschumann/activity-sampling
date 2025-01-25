all: dist check

clean:

distclean: clean

dist: build

start: build

check: test
	npx prettier . --check

format:
	npx prettier . --write

doc:
	plantuml doc/*.puml

dev: build

test: build

unit-tests: build

integration-tests: build

e2e-tests: build

build: prepare

prepare: version

version:
	@echo "Use Java $(shell java --version)"
	@echo "Use Node.js $(shell node --version)"
	@echo "Use NPM $(shell npm --version)"

.PHONY: \
	all clean distclean dist start \
	check format \
	doc \
	dev test unit-tests integration-tests e2e-tests \
	build prepare version
