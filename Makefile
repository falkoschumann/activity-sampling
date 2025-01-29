export NPM_CONFIG_YES=true
SUBDIRS = web-app api-app

all: dist check

clean:
	@for dir in $(SUBDIRS) ; do \
		$(MAKE) -C $$dir clean ; \
	done

distclean:
	@for dir in $(SUBDIRS) ; do \
		$(MAKE) -C $$dir distclean ; \
	done

dist: build

start:

doc:
	@plantuml doc/*.puml

check: check-root
	@for dir in $(SUBDIRS) ; do \
		$(MAKE) -C $$dir check ; \
	done

check-root:
	@npx prettier --check .github/ doc/ README.md

format: format-root
	@for dir in $(SUBDIRS) ; do \
		$(MAKE) -C $$dir format ; \
	done

format-root:
	@npx prettier --write .github/ doc/ README.md

dev:
	@npx concurrently \
		--kill-others \
		--names "WEB,API" \
		--prefix-colors "bgMagenta.bold,bgGreen.bold" \
		"$(MAKE) -C web-app dev" \
		"$(MAKE) -C api-app dev"

test:
	@for dir in $(SUBDIRS) ; do \
		$(MAKE) -C $$dir test ; \
	done

build:
	@for dir in $(SUBDIRS) ; do \
		$(MAKE) -C $$dir build ; \
	done

.PHONY: all clean distclean dist start doc \
	check check-root format format-root \
	dev test \
	build
