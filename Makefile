export ASAR?=true
export MAC_SIGN?=false

PLANTUML_FILES=$(wildcard doc/*.puml)
DIAGRAM_FILES=$(subst .puml,.png,$(PLANTUML_FILES))
JS?=bun
PM?=bun
#PM_OPTIONS?=--ignore-scripts
RUN?=bunx
DEPENDABOT=dependabot[bot]
SHELL:=/bin/bash

all: dist check

clean:
	rm -rf coverage out testdata
	rm -rf node_modules/.tmp

distclean: clean
	rm -rf dist
	rm -rf node_modules

dist: build
	$(PM) run build:electron
#	$(PM) run build:mac
#	$(PM) run build:win

start: prepare
	$(PM) run start

doc: $(DIAGRAM_FILES)

check: test
	$(RUN) eslint .
	$(RUN) stylelint "**/*.scss" --ignore-path .gitignore
	$(RUN) prettier --check .
	$(RUN) sheriff verify

format:
	$(RUN) eslint --fix .
	$(RUN) stylelint "**/*.scss" --fix --ignore-path .gitignore
	$(RUN) prettier --write .

dev: prepare
	$(PM) run dev

test: prepare
	$(PM) run test

watch: prepare
	$(PM) run watch

unit-tests: prepare
	$(RUN) vitest run unit

integration-tests: prepare
	$(RUN) vitest run integration

e2e-tests: prepare
	$(RUN) vitest run e2e

build: prepare
	$(PM) run build

prepare: version
ifdef CI
ifeq ($(findstring $(DEPENDABOT), $(GITHUB_ACTOR)), $(DEPENDABOT))
	@echo "dependabot detected, run $(PM) install"
	$(PM) install $(PM_OPTIONS)
else
	@echo "CI detected, run $(PM) ci"
	$(PM) ci $(PM_OPTIONS)
endif
else
	$(PM) install $(PM_OPTIONS)
endif

version:
	@echo "Using runtime $(JS) version $(shell $(JS) --version)"
	@echo "Using package manager $(PM) version $(shell $(PM) --version)"

$(DIAGRAM_FILES): %.png: %.puml
	plantuml $^

.PHONY: \
	all clean distclean dist \
	start doc \
	check format \
	dev test watch unit-tests integration-tests e2e-tests \
	build prepare version
