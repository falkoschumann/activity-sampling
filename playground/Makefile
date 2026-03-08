BIN_DIR=.venv/bin
PYTHON_BIN=.venv/bin/python
PIP_BIN=.venv/bin/pip

all: dist check

clean:
	rm -rf __pycache__ *.html

distclean: clean
	rm -rf .venv

dist: build

check:
	$(PYTHON_BIN) -m black --check *.py

format:
	$(PYTHON_BIN) -m black *.py

build: prepare no-estimates.html

prepare: .venv
	$(PIP_BIN) install -r requirements.txt

.venv:
	python3 -m venv .venv

%.html: %.ipynb
	$(BIN_DIR)/jupyter nbconvert --execute --to html --no-input $<

.PHONY: all clean dist build prepare
