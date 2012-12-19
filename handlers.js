var config = require('./config').config,
    fs = require('fs'),
    stuff = require('./stuff'),
    md = require('node-markdown').Markdown,
    exec = require('child_process').exec,
    i18n = require('./i18n').json;

function checkUser (login, pass) {
    for (var i = config.users.length - 1; i >= 0; i--) {
        if (config.users[i].login == login && config.users[i].password == pass)
            return config.users[i];
    }
    return false;
}

function getLang (req) {
    return req.session.lang || config.lang;
}

exports.upload = function (req, res) {
    fs.readFile(req.files.file.path, function (err, data) {
        var newPath = config.wikiRoot + req.body.referer + '/' + req.files.file.name;
        fs.writeFile(newPath, data, function (err) {
            res.redirect('/wiki/' + req.body.referer);
        });
    });
};

exports.log = function (req, res) {
        res.render('log', {
            login:req.session.login,
            config: config,
            i18n: i18n[getLang(req)],
            navbar: 'default'
        });
};

exports.terminal = function (req, res) {
    res.render('terminal', {
        login:req.session.login,
        config: config,
        i18n: i18n[getLang(req)],
        navbar: 'fixed'
    });
}

exports.index = function (req, res) {
        //stuff.log('index', req.socket);
        fs.readdir(config.wikiRoot, function(err, folders) {
            var pages = [];
            var i = 0;
            if (folders) {
                folders.forEach(function(folder) {
                    if(folder!='index.wiki')
                        pages[i++] = { path: folder, name: folder};
                });
                fs.readFile(config.wikiRoot + 'index.wiki', config.encoding, function (err, indexText) {
                    indexText = md(indexText);
                    res.render('index', {
                        login:req.session.login,
                        pages: pages,
                        text: indexText,
                        config: config,
                        i18n: i18n[getLang(req)],
                        navbar: 'default'
                    });
                });
            } else {
                res.render('404', {
                    i18n: i18n[getLang(req)]
                });
            }
        });
};

exports.logout = function (req, res) {
    req.session = null;
    res.redirect('/');
};

exports.login = function (req, res) {
    res.render('login', {
        i18n: i18n[getLang(req)]
    });
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

exports.checkAuth = function (req, res, next) {
    if (config.useAuth) {
        if (req.session.login) {
            next();
        } else {
            res.redirect('/login');
        }
    } else {
        next();
    }
};

exports.notFound = function (req, res) {
    res.render('404', {
        i18n: i18n[getLang(req)]
    });
};

exports.wiki = function (req, res) {
        var url = req.route.params[0];
        if (!stuff.isFileRequested(url)) {
            if (url) {
                url = url[url.length-1] == '/' ? url.slice(0, url.length-1) : url;
                url = url.replace('/wiki/', '');
            } else {
                res.render('404', {
                    i18n: i18n[getLang(req)]
                });
                return;
            }
            var fileName = stuff.getLastDirOfPath(url);
            var path = config.wikiRoot + url + '/' + fileName + config.wikiFormat;
            fs.readFile(path, config.encoding, function (err, content) {
                if (err) {
                    res.render('404', {
                        i18n: i18n[getLang(req)]
                    });
                    return;
                }
                var page = {};
                page.text = md(content);
                page.clearText = content;
                page.header = fileName;
                page.breadCrumbs = stuff.getBreadCrumbs(url);
                page.currentUrl = url + '/';
                stuff.getChildrenOfPage(url, function (children) {
                    stuff.getFilesOfPage(url, function (files) {
                        page.children = children;
                        page.files = files;
                        res.render('wiki', {
                            page: page,
                            login: req.session.login,
                            config: config,
                            navbar: 'default',
                            i18n: i18n[getLang(req)]
                        });
                    });
                });
            });
        } else {

            var reg=/\/remove\/.*/;
            if (reg.test(url)) {
                fs.unlink(config.wikiRoot + url.replace('/remove/', '') ,function (err) {
                    if (err) throw err;
                    res.redirect('/wiki');
                });
            } else {
                res.sendfile(config.wikiRoot + url.replace('/wiki/', ''));
            }
        }
};

exports.favicon = function (req, res) {
    //res.redirect('/static/favicon.ico');
};
