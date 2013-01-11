.PHONY: all build gitsubmodules clean
all: build

NODE_MODULES = ./node_modules
$(NODE_MODULES)::
	$(info ===> Устанавливаем npm-пакеты)
	@npm prune
	@npm cache clean
	@npm update

gitsubmodules:
	$(info ===> init git submodules)
	@git submodule init
	@git submodule update

JS_FOLDER = static/js
FRONTEND_LIBS_LIST = bootstrap.min.js jquery.min.js socket.io.js purl.js mustache.js
FRONTEND_LIBS = $(foreach f,$(FRONTEND_LIBS_LIST),$(JS_FOLDER)/$f)

build:$(NODE_MODULES) $(FRONTEND_LIBS)
	$(info Builed $(^))
	$(info Build complete)

$(JS_FOLDER)/mustashe.js: gitsubmodules
	$(info ===> link mustashe to $(JS_FOLDER))
	-ln -s ./submodules/mustache/mustache.js $@

$(JS_FOLDER)/purl.js: gitsubmodules
	$(info ===> link purl to $(JS_FOLDER))
	-ln -s ./submodules/purl/purl.js $@

$(JS_FOLDER)/socket.io.js: $(NODE_MODULES)
	$(info ===> link socket.io to $(JS_FOLDER))
	-ln -s ./node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.min.js $@

$(JS_FOLDER)/jquery.min.js: gitsubmodules
	cd submodules/jquery; npm install;\
	 ./node_modules/grunt/bin/grunt && ./node_modules/grunt/bin/grunt dist:../../static/js/
	rm static/js/jquery.js

static/js/bootstrap.min.js:
	$(info ===> Install bootstrap)
	@curl -o ./bootstrap.zip  http://twitter.github.com/bootstrap/assets/bootstrap.zip
	@unzip bootstrap.zip
	rm bootstrap.zip
	mv bootstrap static/bootstrap
	mv static/bootstrap/js/bootstrap.min.js $@
	rm -rf bootstrap

clean:
	$(info Removing node modules)
	-rm -rf $(NODE_MODULES)
	$(info Removing fronted third part libs)
	-rm $(FRONTEND_LIBS)
	-rm -rf static/boostrap
