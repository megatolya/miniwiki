var fs = require('fs'),
    config = require('./config').config,
    root = config.wikiRoot,
    encoding = config.encoding,
    wikiFormat = config.wikiFormat,
    port = config.port,
    count = 0,
    handlers = require('./handlers'),
    stuff = require('./stuff'),
    exec = require('child_process').exec,
    i18n = require('./i18n').json[config.lang];

exports.handlers = function (socket) {
    stuff.log('connection', socket);
    socket.on('newSection', function (name) {
        fs.mkdir(root + name, '0777', function (err) {
            if (err) throw err;
            fs.writeFile(root + name + '/' + name + wikiFormat, '###:-)', function (err) {
                if (err) throw err;
                socket.emit('redirect', '/wiki/' + name);
            });
        });
    });

    socket.on('saveWikiPage', function (page) {
        stuff.log(page, socket);
        if (page.header != stuff.getLastDirOfPath(page.path)) {
            var oldPath = root + page.path,
                    newPath = root + stuff.removeLastDirOfPath(page.path) + '/' + page.header;
            fs.rename(oldPath, newPath, function (err) {
                if (err) throw err;

                var oldFile = newPath + '/' + stuff.getLastDirOfPath(page.path) + wikiFormat,
                        newFile = newPath + '/' + page.header + wikiFormat;
                 fs.rename(oldFile, newFile, function (err) {
                    if (err) throw err;

                    fs.writeFile(newFile, page.text, encoding, function (err) {
                        if (err) throw err;

                        socket.emit('redirect', '/wiki/' + stuff.removeLastDirOfPath(page.path) + '/' +page.header);
                    });
                 });
            });
        } else {
            var filePath = root + page.path + '/' + page.header + wikiFormat;
            fs.writeFile(filePath, page.text, encoding, function (err) {
                if (err) throw err;

                socket.emit('redirect', '/wiki/' + page.path);
            });
        }
    });

    socket.on('newWikiPage', function (data) {
        var oldPath = data.path;
        data.path = data.path.replace('wiki/', '');
        var newPath = root + data.path + '/' + data.header;
        fs.mkdir( newPath, '0777', function(err) {
            if (err) throw err;

            fs.writeFile(newPath + '/' + data.header + wikiFormat, data.text, function (err) {
                if (err) throw err;

                socket.emit('redirect', '/' + oldPath + '/' + data.header );
            });
        });
    });

    socket.on('removeFile', function (data) {
        fs.unlink(root + data.url.replace('/remove/', '') ,function (err) {
            if (err) throw err;
            socket.emit('clearTimeout', data.timeout);
            socket.emit('redirect');
        });
    })

    socket.on('removePage', function(data) {
        exec('rm -rf ' + root + data.path, function() {
            socket.emit('alert', i18n.pageRemoved);
            socket.emit('clearTimeout', data.timeout);
        });
    });

    socket.on('sayToAll', function (msg) {
        socket.broadcast.emit('alert', msg);
    });
};