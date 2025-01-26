all: dist check

clean:
	./gradlew clean

distclean: clean
	rm -rf .gradle

dist: build

start:
	./gradlew bootRun

check: test
	./gradlew check

format:
	./gradlew spotlessApply

dev:
	./gradlew bootRun

test:
	./gradlew test

unit-tests:

integration-tests:

e2e-tests:

build: prepare
	./gradlew build -x test

prepare: version

version:
	@echo "Use Java $(shell java --version | head -n 1)"

.PHONY: \
	all clean distclean dist start \
	check format \
	doc \
	dev test unit-tests integration-tests e2e-tests \
	build prepare version
