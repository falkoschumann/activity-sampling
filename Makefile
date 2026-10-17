export ASAR ?= true
export MAC_SIGN ?= false

# JavaScript configuration
JS := bun
PM := bun
RUN := bunx

# PlantUML configuration
PLANTUML_FILES := $(wildcard doc/images/*.puml)
DIAGRAM_FILES := $(subst .puml,.png,$(PLANTUML_FILES))

# Make configuration
SHELL := /bin/bash

DEPENDENCY_UPDATER := dependabot[bot]

all: dist doc check

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
#	$(PM) run build:linux

start: prepare
	$(PM) run start

doc: $(DIAGRAM_FILES)

domain:
	esdm view

domain-detailed:
	esdm view --with-details

check: test check-esdm check-typing check-eslint check-stylelint check-prettier check-sheriff

check-esdm:
	esdm lint

check-typing:
	$(RUN) tsc --build

check-eslint:
	$(RUN) eslint .

check-stylelint:
	$(RUN) stylelint "**/*.scss" --ignore-path .gitignore

check-prettier:
	$(RUN) prettier --check .

check-sheriff:
	$(RUN) sheriff verify

fix: fix-eslint fix-stylelint fix-prettier

fix-eslint:
	$(RUN) eslint --fix .

fix-stylelint:
	$(RUN) stylelint "**/*.scss" --fix --ignore-path .gitignore

fix-prettier:
	$(RUN) prettier --write .

dev: prepare
	$(PM) run dev

test: prepare
	$(PM) run test -- --coverage

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

build-docker:
	docker compose run --rm build

prepare: version
ifdef CI
ifeq ($(findstring $(DEPENDENCY_UPDATER), $(GITHUB_ACTOR)), $(DEPENDENCY_UPDATER))
	@echo "dependency updater detected, run $(PM) install"
	$(PM) install
else
	@echo "CI detected, run $(PM) ci"
	$(PM) ci
endif
else
	$(PM) install
endif

version:
	@echo "Using runtime $(JS) version $(shell $(JS) --version)"
	@echo "Using package manager $(PM) version $(shell $(PM) --version)"
	@echo "Using package runner $(RUN) version $(shell $(RUN) --version)"

# Do not generate diagrams in CI environment, because changes to the diagrams
# would not be committed
$(DIAGRAM_FILES): %.png: %.puml
ifndef CI
	plantuml $^
endif

.PHONY: \
	all clean distclean dist \
	start doc domain domain-detailed \
	check check-esdm check-typing check-eslint check-stylelint check-prettier check-sheriff \
	fix fix-eslint fix-stylelint fix-prettier \
	dev test watch unit-tests integration-tests e2e-tests \
	build-docker \
	build prepare version
