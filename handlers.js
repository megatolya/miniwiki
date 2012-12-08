var config = require('./config').config,
    fs = require('fs'),
    root = config.wikiRoot,
    encoding = config.encoding,
    wikiFormat = config.wikiFormat,
    stuff = require('./stuff'),
    md = require('node-markdown').Markdown,
    exec = require('child_process').exec;

function checkUser (login, pass) {
    for (var i = config.users.length - 1; i >= 0; i--) {
        if (config.users[i].login == login && config.users[i].password == pass)
            return config.users[i];
    };
    return false;
};

exports.upload = function (req, res) {
    console.log();
    console.log(req.files.file);
    fs.readFile(req.files.file.path, function (err, data) {
        var newPath = root + req.body.referer + '/' + req.files.file.name;
        fs.writeFile(newPath, data, function (err) {
            res.redirect('/wiki/' + req.body.referer);
        });
    });
};

exports.log = function (req, res) {
    console.log(req);
    if (req.session.login) {
        res.render('log', {login:req.session.login});
    } else {
        res.redirect('/login');
    }


};

exports.index = function (req, res) {
    if (req.session.login) {
        //stuff.log('index', req.socket);
        console.log(req);
        fs.readdir(root, function(err, folders) {
            var pages = [];
            var i = 0;
            if (folders) {
                folders.forEach(function(folder) {
                    pages[i++] = { path: folder, name: folder};
                });
                res.render('index', {login:req.session.login, pages: pages});
            } else {
                res.render('404');
            }
        });
    }
    else{
        res.redirect('/login');
    }
};

exports.logout = function (req, res) {
    req.session = null;
    res.redirect('/');
};

exports.login = function (req, res) {
    res.render('login');
};

exports.auth = function (req, res){
    var login = req.body.login,
        pass = req.body.pass;
    if (checkUser(login, pass)) {
        req.session = checkUser(login, pass);
        res.redirect('/');
    } else {
        res.redirect('/login');
        return false;
    }


};

exports.notFound = function (req, res) {
    if (req.session.login) {
        res.render('404');
    } else {
        res.redirect('/login');
    }
};

exports.tree = function (req, res) {
    if (req.session.login) {
        exec('tree ' + root, function(err, data) {
            if (err){
                console.log('brew install tree!');
                return;
            }

            res.render('tree', {tree: data, login: req.session.login});
        });
    } else {
        res.redirect('/login');
    }
};

exports.wiki = function (req, res) {
    if (req.session.login) {
        var url = req.route.params[0];
        if (!stuff.isFileRequested(url)) {
            if (url) {
                url = url[url.length-1] == '/' ? url.slice(0, url.length-1) : url;
                console.log(url);
                url = url.replace('/wiki/', '');
            } else {
                res.render('404');
                return;
            }
            var fileName = stuff.getLastDirOfPath(url);
            var path = root + url + '/' + fileName + wikiFormat;
            fs.readFile(path, encoding, function (err, content) {
                if (err) {
                    res.render('404');
                    return;
                }
                var page = {};
                page.text = md(content, true);
                page.clearText = content;
                page.header = fileName;
                page.breadCrumbs = stuff.getBreadCrumbs(url);
                page.currentUrl = url + '/';
                stuff.getChildrenOfPage(url, function (children) {
                    stuff.getFilesOfPage(url, function (files) {
                        page.children = children;
                        page.files = files;
                        res.render('wiki', {page: page, login: req.session.login});
                    });
                });
            });
        } else {
            res.sendfile(root + url.replace('/wiki/', ''));
        }
    }
    else{
        res.redirect('/login');
    }
};

exports.ololo = function () {
};
