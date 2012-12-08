var fs = require('fs'),
    config = require('./config').config,
    root = config.wikiRoot,
    encoding = config.encoding,
    wikiFormat = config.wikiFormat,
    logToConsole = config.logToConsole,
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

    fs.readdir(root+path, function (err, files) {
        if (err) throw err;

        if (files) {
            files.forEach(function(file){
                if (file != currentDir + wikiFormat && getExtension(file)==''){
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

    fs.readdir(root+path, function (err, files) {
        if (err) throw err;

        if (files) {
            files.forEach(function(file){
                if (file != currentDir + wikiFormat && getExtension(file)!=''){
                    children.push(file);
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
        return (i < 0) ? '' : filename.substr(i);
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
    if (logToConsole) {
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
