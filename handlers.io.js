var fs = require('fs'),
    config = require('./config').config,
    handlers = require('./handlers'),
    stuff = require('./stuff'),
    exec = require('child_process').exec,
    i18n = require('./i18n')[config.lang];

exports.handlers = function (socket) {
    stuff.log('connection', socket);
    socket.on('newSection', function (name) {
        fs.mkdir(config.wikiRoot + name, '0777', function (err) {
            if (err) throw err;
            fs.writeFile(config.wikiRoot + name + '/' + name + config.wikiFormat, '###:-)', function (err) {
                if (err) throw err;
                socket.emit('redirect', '/wiki/' + name);
            });
        });
    });

    socket.on('saveWikiPage', function (page) {
        stuff.log(page, socket);
        if (page.header != stuff.getLastDirOfPath(page.path)) {
            var oldPath = config.wikiRoot + page.path,
                    newPath = config.wikiRoot + stuff.removeLastDirOfPath(page.path) + '/' + page.header;
            fs.rename(oldPath, newPath, function (err) {
                if (err) throw err;

                var oldFile = newPath + '/' + stuff.getLastDirOfPath(page.path) + config.wikiFormat,
                        newFile = newPath + '/' + page.header + config.wikiFormat;
                 fs.rename(oldFile, newFile, function (err) {
                    if (err) throw err;

                    fs.writeFile(newFile, page.text, config.encoding, function (err) {
                        if (err) throw err;

                        fs.writeFile(newPath + '/.wiki/' + new Date().valueOf() + config.wikiFormat, page.text, config.encoding, function () {
                            if (err) throw err;

                            socket.emit('redirect', '/wiki/' + stuff.removeLastDirOfPath(page.path) + '/' +page.header);
                        });
                    });
                 });
            });
        } else {
            var filePath = config.wikiRoot + page.path + '/' + page.header + config.wikiFormat;
            fs.writeFile(filePath, page.text, config.encoding, function (err) {
                if (err) throw err;

                 fs.writeFile(config.wikiRoot + page.path + '/.wiki/' + new Date().valueOf() + config.wikiFormat, page.text, config.encoding, function () {
                    socket.emit('redirect', '/wiki/' + page.path);
                 });
            });
        }
    });

    socket.on('newWikiPage', function (data) {
        var oldPath = data.path;
        data.path = data.path.replace('wiki/', '');
        var newPath = config.wikiRoot + data.path + '/' + data.header;
        fs.mkdir( newPath, '0777', function(err) {
            if (err) throw err;

            fs.writeFile(newPath + '/' + data.header + config.wikiFormat, data.text, function (err) {
                if (err) throw err;

                    fs.mkdir( newPath + '/.wiki/', '0777', function(err) {
                        fs.writeFile(newPath + '/.wiki/' + new Date().valueOf() + config.wikiFormat, data.text, function (err) {
                            if (err) throw err;

                            socket.emit('redirect', '/' + oldPath + '/' + data.header );
                        });
                    });
            });
        });
    });

    socket.on('removeFile', function (data) {
        fs.unlink(config.wikiRoot + data.url.replace('/remove/', '') ,function (err) {
            if (err) throw err;
            socket.emit('clearTimeout', data.timeout);
            socket.emit('redirect');
        });
    })

    socket.on('removePage', function(data) {
        console.log('msg');
        exec('rm -rf ' + config.wikiRoot + data.path, function() {
            socket.emit('alert', i18n.pageRemoved);
            socket.emit('clearTimeout', data.timeout);
        });
    });

    socket.on('sayToAll', function (msg) {
        socket.broadcast.emit('alert', msg);
    });

    socket.on('exec', function (data) {

        exec(data.command, function(error, out) {
            if (error) {
                socket.emit('clearTimeout', data.timeout);
                socket.emit('execed', {command: data.command, out:'failed'});
                return;
            }

            socket.emit('clearTimeout', data.timeout);
            socket.emit('execed', {command: data.command, out:out});
        });
    });
};
