export TZ="Europe/Berlin"

all: dist check

clean:
	./gradlew clean

distclean: clean
	rm -rf .gradle

dist: build

start: dev

check:
	./gradlew check

format:
	./gradlew spotlessApply

dev:
	./gradlew bootRun

test:
	./gradlew test

coverage:
	./gradlew test jacocoTestReport

unit-tests:

integration-tests:

e2e-tests:

build: prepare
	./gradlew build -x test -x check

prepare: version

version:
	@echo "Use Java $(shell java --version | head -n 1)"

.PHONY: \
	all clean distclean dist start \
	check format \
	dev test unit-tests integration-tests e2e-tests \
	build prepare version
