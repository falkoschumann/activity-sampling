export ASAR?=true
export MAC_SIGN?=false

PLANTUML_FILES=$(wildcard doc/images/*.puml)
DIAGRAM_FILES=$(subst .puml,.png,$(PLANTUML_FILES))
JS?=bun
PM?=bun
#PM_OPTIONS?=--ignore-scripts
RUN?=bunx
#RUN_OPTIONS?=--bun
SHELL:=/bin/bash
DEPENDENCY_UPDATER=dependabot[bot]

all: dist doc check

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
#	$(PM) run $(RUN_OPTIONS) build:linux

start: prepare
	$(PM) run $(RUN_OPTIONS) start

doc: $(DIAGRAM_FILES)

domain:
	esdm view

domain-detailed:
	esdm view --with-details

check: test check-esdm check-typing check-eslint check-stylelint check-prettier check-sheriff

check-esdm:
	esdm lint

check-typing:
	tsc --build

check-eslint:
	$(RUN) $(RUN_OPTIONS) eslint .

check-stylelint:
	$(RUN) $(RUN_OPTIONS) stylelint "**/*.scss" --ignore-path .gitignore

check-prettier:
	$(RUN) $(RUN_OPTIONS) prettier --check .

check-sheriff:
	$(RUN) $(RUN_OPTIONS) sheriff verify

fix: fix-eslint fix-stylelint fix-prettier

fix-eslint:
	$(RUN) $(RUN_OPTIONS) eslint --fix .

fix-stylelint:
	$(RUN) $(RUN_OPTIONS) stylelint "**/*.scss" --fix --ignore-path .gitignore

fix-prettier:
	$(RUN) $(RUN_OPTIONS) prettier --write .

dev: prepare
	$(PM) run $(RUN_OPTIONS) dev

test: prepare
	$(PM) run $(RUN_OPTIONS) test -- --coverage

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

build-docker:
	docker compose run --rm build

prepare: version
ifdef CI
ifeq ($(findstring $(DEPENDENCY_UPDATER), $(GITHUB_ACTOR)), $(DEPENDENCY_UPDATER))
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
# Skip on CI because changes will not be committed
ifndef CI
	plantuml $^
endif

.PHONY: \
	all clean distclean dist \
	start doc domain domain-detailed \
	check check-esdm check-typing check-eslint check-stylelint check-prettier check-sheriff \
	fix fix-eslint fix-stylelint fix-prettier \
	dev test watch unit-tests integration-tests e2e-tests \
	docker-build \
	build prepare version
