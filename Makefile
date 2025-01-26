SUBDIRS = web-app api-app

all: $(SUBDIRS)

clean:
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir clean; \
	done

distclean:
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir distclean; \
	done

check:
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir check; \
	done

format:
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir format; \
	done

test:
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir test; \
	done

$(SUBDIRS):
	$(MAKE) -C $@

.PHONY: all clean distclean \
	check format \
	test \
	$(SUBDIRS)
