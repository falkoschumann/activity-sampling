export NPM_CONFIG_YES=true
SUBDIRS = web-app api-app
ROOT_FILES = .github/ doc/ README.md

all: $(SUBDIRS) root

clean: $(SUBDIRS)
clean: TARGET=clean

distclean: $(SUBDIRS) distclean-root
distclean: TARGET=distclean

distclean-root:
	docker compose down --volumes --remove-orphans --rmi local

dist: $(SUBDIRS)
dist: TARGET=dist

start:
	docker compose up --build --detach

stop:
	docker compose down

root: check-root

doc:
	plantuml doc/*.puml

check: $(SUBDIRS) check-root
check: TARGET=check

check-root:
	npx prettier --check $(ROOT_FILES)

format: $(SUBDIRS) format-root
format: TARGET=format

format-root:
	npx prettier --write $(ROOT_FILES)

dev: build dev-root
	npx concurrently \
		--kill-others \
		--names "WEB,API" \
		--prefix-colors "bgMagenta.bold,bgGreen.bold" \
		$(foreach dir,$(SUBDIRS),"$(MAKE) -C $(dir) dev")

dev-root:
	docker compose up --detach database

test: $(SUBDIRS)
test: TARGET=test

build: $(SUBDIRS)
build: TARGET=build

version: $(SUBDIRS)
version: TARGET=version

$(SUBDIRS): force
	@$(MAKE) -C $@ $(TARGET)

force: ;

.PHONY: \
	all clean distclean distclean-root dist start stop \
	root doc \
	check check-root format format-root \
	dev test \
	build version
