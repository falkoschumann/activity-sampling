export ASAR?=true
export MAC_SIGN?=false

PLANTUML_FILES=$(wildcard doc/*.puml)
DIAGRAM_FILES=$(subst .puml,.png,$(PLANTUML_FILES))
JS?=bun
PM?=bun
#PM_OPTIONS?=--ignore-scripts
RUN?=bunx
#RUN_OPTIONS?=--bun
SHELL:=/bin/bash
DEPENDENCY_UPDATER=dependabot[bot]

all: dist check

clean:
	rm -rf coverage out testdata
	rm -rf node_modules/.tmp

distclean: clean
	rm -rf dist
	rm -rf node_modules

dist: build
	$(PM) run $(RUN_OPTIONS) build:electron
#	$(PM) run $(RUN_OPTIONS) build:mac
#	$(PM) run $(RUN_OPTIONS) build:win

start: prepare
	$(PM) run $(RUN_OPTIONS) start

doc: $(DIAGRAM_FILES)

check: test
	$(RUN) $(RUN_OPTIONS) eslint .
	$(RUN) $(RUN_OPTIONS) stylelint "**/*.scss" --ignore-path .gitignore
	$(RUN) $(RUN_OPTIONS) prettier --check .
	$(RUN) $(RUN_OPTIONS) sheriff verify

format:
	$(RUN) $(RUN_OPTIONS) eslint --fix .
	$(RUN) $(RUN_OPTIONS) stylelint "**/*.scss" --fix --ignore-path .gitignore
	$(RUN) $(RUN_OPTIONS) prettier --write .

dev: prepare
	$(PM) run $(RUN_OPTIONS) dev

test: prepare
	$(PM) run $(RUN_OPTIONS) test

watch: prepare
	$(PM) run $(RUN_OPTIONS) watch

unit-tests: prepare
	$(RUN) $(RUN_OPTIONS) vitest run unit

integration-tests: prepare
	$(RUN) $(RUN_OPTIONS) vitest run integration

e2e-tests: prepare
	$(RUN) $(RUN_OPTIONS) vitest run e2e

build: prepare
	$(PM) run $(RUN_OPTIONS) build

prepare: version
ifdef CI
ifeq ($(findstring $(DEPENDENCY_UPDATER), $(GITLAB_USER_LOGIN)), $(DEPENDENCY_UPDATER))
	@echo "dependency updater detected, run $(PM) install"
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
	@echo "Using package runner $(RUN) version $(shell $(RUN) --version)"

$(DIAGRAM_FILES): %.png: %.puml
	plantuml $^

.PHONY: \
	all clean distclean dist \
	start doc \
	check format \
	dev test watch unit-tests integration-tests e2e-tests \
	build prepare version
