var fs = require('fs'),
    sys = require('sys');

function getLastDirOfPath (path) {
    var arr = path.split('/');
    return arr[arr.length-1];
};
//возвращает массив папок-родителей в порядке от самой старшей
function getBreadCrumbs (path) {
    var arr = path.split('/');
    var tempPath = '';
    var newArr = [];
    for (var i = 0; i <= arr.length - 1; i++) {
        newArr[i] = {};
        tempPath += '/' + arr[i];
        newArr[i].url = tempPath;
        newArr[i].title = arr[i];
    };
    return newArr;
};
function getChildrenOfPage (path, callback) {
    var children = [],
            currentDir = getLastDirOfPath(path);

    fs.readdir(config.wikiRoot + path, function (err, files) {
        if (err) throw err;

        if (files) {
            files.forEach(function(file){
                if (file != currentDir + config.wikiFormat && getExtension(file)=='' && file != '.wiki'){
                    children.push(file);
                }
            });
        } else {
            children = [];
        }
        callback.call(this, children)
    });
};

function getFilesOfPage (path, callback) {
    var children = [],
            currentDir = getLastDirOfPath(path);

    fs.readdir(config.wikiRoot + path, function (err, files) {
        if (err) throw err;

        if (files) {
            files.forEach(function(file){
                if (file != currentDir + config.wikiFormat && getExtension(file)){
                    if (getExtension(file) == 'img') {
                        children.push({name: file, type:'img'});
                    } else {
                        children.push({name: file, type:'file'});
                    }
                }
            });
        } else {
            children = [];
        }
        callback.call(this, children);
    });
};

function removeLastDirOfPath (path) {
    if (path.indexOf('/')) {
        var arr = path.split('/');
        arr.length = arr.length-1;
        arr = arr.join('/');
        return arr;
    } else {
        return '';
    }
};

function getExtension(filename) {
        var i = filename.lastIndexOf('.');
        if (i>0) {
            var ext =filename.substr(i);
            var images = ['.gif', '.tiff', '.jpeg', '.jpg', '.bmp'];
            if (images.indexOf(ext) >= 0) {
                return 'img';
            } else {
                return 'file';
            }
        } else {
            return false;
        }
};

function isFileRequested (path) {
    var arr = path.split('/');
    var file = arr[arr.length-1];
    if (file.indexOf('.')!=-1) {
        return true;
    } else {
        return false;
    }
};
function log (msg, socket) {
    if (config.logToConsole) {
        sys.puts(msg);
    }
    if (socket) {
        socket.broadcast.emit('log', msg);
    }
};


exports.log = log;
exports.getExtension = getExtension;
exports.isFileRequested = isFileRequested;
exports.getLastDirOfPath = getLastDirOfPath;
exports.getBreadCrumbs = getBreadCrumbs;
exports.getChildrenOfPage = getChildrenOfPage;
exports.getFilesOfPage = getFilesOfPage;
exports.removeLastDirOfPath = removeLastDirOfPath;
