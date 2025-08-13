export NPM_CONFIG_YES=true
SUBDIRS = desktop-app web-app api-app
ROOT_FILES = .github/ doc/ README.md
PLANTUML_FILES = $(wildcard doc/*.puml)
DIAGRAM_FILES = $(subst .puml,.png,$(PLANTUML_FILES))

all: $(SUBDIRS) root

clean: $(SUBDIRS)
clean: TARGET=clean

distclean: $(SUBDIRS)
distclean: TARGET=distclean

dist: $(SUBDIRS)
dist: TARGET=dist

up:
	docker compose up --build --detach

down:
	docker compose down --volumes --remove-orphans --rmi local

prune:
	docker container prune
	docker image prune --all
	docker volume prune --all

root: check-root

doc: $(DIAGRAM_FILES)

check: $(SUBDIRS) check-root
check: TARGET=check

check-root:
	npx prettier --check $(ROOT_FILES)

format: $(SUBDIRS) format-root
format: TARGET=format

format-root:
	npx prettier --write $(ROOT_FILES)

dev: build
	npx concurrently \
		--kill-others \
		--names "WEB,API" \
		--prefix-colors "bgMagenta.bold,bgGreen.bold" \
		$(foreach dir,$(SUBDIRS),"$(MAKE) -C $(dir) dev")

test: $(SUBDIRS)
test: TARGET=test

build: $(SUBDIRS)
build: TARGET=build

version: $(SUBDIRS)
version: TARGET=version

$(SUBDIRS): force
	@$(MAKE) -C $@ $(TARGET)

$(DIAGRAM_FILES): %.png: %.puml
	plantuml $^

force: ;

.PHONY: \
	all clean distclean distclean-root dist \
	up down prune \
	root doc \
	check check-root format format-root \
	dev test \
	build version
