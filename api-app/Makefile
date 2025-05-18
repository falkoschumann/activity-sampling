all: dist check

clean:
	./gradlew clean

distclean: clean
	rm -rf .gradle

dist: build

start:
	./gradlew bootRun

check:
	./gradlew check

format:
	./gradlew spotlessApply

dev: start

test:
	./gradlew test

watch:
	./gradlew test --continuous

coverage:
	./gradlew test jacocoTestReport

unit-tests:

integration-tests:

e2e-tests:

build: prepare
	./gradlew build -x test -x check

prepare: version

version:
	@echo "Java $(shell java --version | head -n 1)"

.PHONY: \
	all clean distclean dist start \
	check format \
	dev test watch coverage unit-tests integration-tests e2e-tests \
	build prepare version
