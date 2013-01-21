.PHONY: all build clean
all: build

PURL = ./static/purl.js
NODE_MODULES = ./node_modules
BOWER_MODULES = ./static/components

build:
	@echo 'installing node modules'
	@npm install
	@ln -s ../../node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.min.js ./static/js/socket.io.js
	@mkdir $(BOWER_MODULES)
	@echo 'installing bower components'
	@node ./node_modules/bower/bin/bower install
	@node ./node_modules/bower/bin/bower install git://github.com/allmarkedup/jQuery-URL-Parser.git
	@mkdir $(BOWER_MODULES)/bootstrap/css
	@node ./node_modules/less/bin/lessc $(BOWER_MODULES)/bootstrap/less/bootstrap.less > $(BOWER_MODULES)/bootstrap/css/bootstrap.css
	@rm $(BOWER_MODULES)/bootstrap/js/bootstrap-popover.js
	@cat $(BOWER_MODULES)/bootstrap/js/*.js > $(BOWER_MODULES)/bootstrap/js/bootstrap.js
	@echo 'building bootstrap'
	@node node_modules/borschik/bin/borschik -i static/components/bootstrap/js/bootstrap.js -t js > static/components/bootstrap/js/bootstrap.min.js
	@node node_modules/borschik/bin/borschik -i static/components/bootstrap/css/bootstrap.css -t css > static/components/bootstrap/css/bootstrap.min.css
	@echo 'making example files'
	@mkdir -p wiki_files
	@echo '#Welcome to the miniwiki!\n\nThis is index page text.\n\nYou can edit like you want.' > wiki_files/index.wiki
	@node i18n-maker.js > i18n.js
	@echo 'building iOS version'
	@cd $(BOWER_MODULES)/ratchet && make build

clean:
	-rm -rf $(NODE_MODULES)
	-rm -rf $(BOWER_MODULES)
	rm ./static/js/socket.io.js
	rm ./i18n.js
start:
	node server.js

