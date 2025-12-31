export ASAR?=true
export SIGN?=true

RUNTIME=node
PACKAGE_MANAGER=npm
COMMAND_RUNNER=npx

all: dist check

clean:
	rm -rf build coverage testdata

distclean: clean
	rm -rf dist
	rm -rf node_modules

dist: build
	$(PACKAGE_MANAGER) run build:electron
#	$(PACKAGE_MANAGER) run build:mac
#	$(PACKAGE_MANAGER) run build:win

start:
	$(PACKAGE_MANAGER) start

check: test
	$(COMMAND_RUNNER) eslint .
	$(COMMAND_RUNNER) prettier --check .
	$(COMMAND_RUNNER) sheriff verify

format:
	$(COMMAND_RUNNER) eslint --fix .
	$(COMMAND_RUNNER) prettier --write .

dev: prepare
	$(PACKAGE_MANAGER) run dev

test: prepare
	$(COMMAND_RUNNER) vitest run

watch: prepare
	$(PACKAGE_MANAGER) test

coverage: prepare
	$(COMMAND_RUNNER) vitest run --coverage

unit-tests: prepare
	$(COMMAND_RUNNER) vitest run unit

integration-tests: prepare
	$(COMMAND_RUNNER) vitest run integration

e2e-tests: prepare
	$(COMMAND_RUNNER) vitest run e2e

build: prepare
	$(PACKAGE_MANAGER) run build

prepare: version
	@if [ -n "$(CI)" ] ; then \
		echo "CI detected, run $(PACKAGE_MANAGER) ci"; \
		$(PACKAGE_MANAGER) ci; \
	else \
		$(PACKAGE_MANAGER) install; \
	fi

version:
	@echo "Using $(RUNTIME) $(shell $(RUNTIME) --version)"
	@echo "Using $(PACKAGE_MANAGER) $(shell $(PACKAGE_MANAGER) --version)"

.PHONY: \
	all clean distclean dist start \
	check format \
	dev test watch coverage unit-tests integration-tests e2e-tests \
	build prepare version
