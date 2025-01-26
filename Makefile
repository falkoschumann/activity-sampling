SUBDIRS = web-app api-app

all: dist check

clean:
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir clean; \
	done

distclean:
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir distclean; \
	done

dist: build

start:

check: check-root
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir check; \
	done

check-root:
	npx prettier --check .github/ doc/ README.md

format: format-root
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir format; \
	done

format-root:
	npx prettier --write .github/ doc/ README.md

test:
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir test; \
	done

build:
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir build; \
	done

.PHONY: all clean distclean dist start \
	check check-root format format-root \
	test \
	build
