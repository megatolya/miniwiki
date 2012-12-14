#!/bin/bash

npm install

ln -s ../../submodules/mustache/mustache.js ./static/js/mustache.js
ln -s ../../submodules/purl/purl.js ./static/js/purl.js
ln -s ../../node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.min.js ./static/js/socket.io.js

curl -o ./bootstrap.zip  http://twitter.github.com/bootstrap/assets/bootstrap.zip
unzip bootstrap.zip
rm bootstrap.zip
mv bootstrap static/bootstrap
mv static/bootstrap/js/bootstrap.min.js static/js/bootstrap.min.js

cd submodules/jquery
npm install
./node_modules/grunt/bin/grunt && ./node_modules/grunt/bin/grunt dist:../../static/js/
cd ../../
rm static/js/jquery.js
