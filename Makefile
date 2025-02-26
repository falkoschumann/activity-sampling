export NPM_CONFIG_YES=true
SUBDIRS = web-app api-app

all: $(SUBDIRS) check-root

clean: $(SUBDIRS)
clean: TARGET=clean

distclean: $(SUBDIRS)
distclean: TARGET=distclean

doc:
	plantuml doc/*.puml

check: $(SUBDIRS) check-root
check: TARGET=check

check-root:
	npx prettier --check .github/ doc/ README.md

format: $(SUBDIRS) format-root
format: TARGET=format

format-root:
	npx prettier --write .github/ doc/ README.md

dev:
	npx concurrently \
		--kill-others \
		--names "WEB,API" \
		--prefix-colors "bgMagenta.bold,bgGreen.bold" \
		$(foreach dir,$(SUBDIRS),"$(MAKE) -C $(dir) dev")

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
