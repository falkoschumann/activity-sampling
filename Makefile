export ASAR?=true
export MAC_SIGN?=false

PLANTUML_FILES = $(wildcard doc/*.puml)
DIAGRAM_FILES = $(subst .puml,.png,$(PLANTUML_FILES))

all: dist check

clean:
	rm -rf coverage out testdata

distclean: clean
	rm -rf dist
	rm -rf node_modules

dist: build
	bun run build:electron
#	bun run build:mac
#	bun run build:win

start: prepare
	bun start

doc: $(DIAGRAM_FILES)

check: test
	bunx eslint .
	bunx stylelint "**/*.scss" --ignore-path .gitignore
	bunx prettier --check .
	bunx sheriff verify

format:
	bunx eslint --fix .
	bunx stylelint "**/*.scss" --fix --ignore-path .gitignore
	bunx prettier --write .

dev: prepare
	bun run dev

test: prepare
	bunx vitest run

watch: prepare
	bun test

unit-tests: prepare
	bunx vitest run unit

integration-tests: prepare
	bunx vitest run integration

e2e-tests: prepare
	bunx vitest run e2e

build: prepare
	bun run build

prepare: version
ifdef CI
ifeq ($(findstring $(DEPENDABOT), $(GITHUB_ACTOR)), $(DEPENDABOT))
	@echo "dependabot detected, run bun install"
	bun install
else
	@echo "CI detected, run bun ci"
	bun ci
endif
else
	bun install
endif

version:
	@echo "Using bun $(shell bun --version)"

$(DIAGRAM_FILES): %.png: %.puml
	plantuml $^

.PHONY: \
	all clean distclean dist \
	start doc \
	check format \
	dev test watch unit-tests integration-tests e2e-tests \
	build prepare version
