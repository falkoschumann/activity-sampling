export NPM_CONFIG_YES=true
SUBDIRS = web-app api-app

all: dist check

clean: $(SUBDIRS)
clean: TARGET=clean

distclean: $(SUBDIRS)
distclean: TARGET=distclean

dist: build

start: dev

doc:
	plantuml doc/*.puml

check: $(SUBDIRS) check-root

check-root:
	npx prettier --check .github/ doc/ README.md

check: TARGET=check

format: $(SUBDIRS) format-root

format-root:
	npx prettier --write .github/ doc/ README.md

format: TARGET=format

dev:
	npx concurrently \
		--kill-others \
		--names "WEB,API" \
		--prefix-colors "bgMagenta.bold,bgGreen.bold" \
		"$(MAKE) -C web-app dev" \
		"$(MAKE) -C api-app dev"

test: $(SUBDIRS)
test: TARGET=test

build: $(SUBDIRS)
build: TARGET=build

$(SUBDIRS): force
	$(MAKE) -C $@ $(TARGET)

force: ;

.PHONY: \
	all clean distclean dist start \
	doc \
	check check-root format format-root \
	dev test \
	build
