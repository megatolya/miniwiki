var fs = require('fs'),
    stuff = require('./stuff'),
    md = require('node-markdown').Markdown,
    exec = require('child_process').exec,
    i18n = require('./i18n');

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

function notFound (req, res) {
    res
        .status(404)
        .render('404.jade', {
            referer: req.headers['referer'],
            i18n: i18n[getLang(req)]
        });
}
exports.upload = function (req, res) {
    fs.readFile(req.files.file.path, function (err, data) {
        var newPath = config.wikiRoot + req.body.referer + '/' + req.files.file.name;
        fs.writeFile(newPath, data, function (err) {
            res.redirect('/wiki/' + req.body.referer);
        });
    });
};
exports.checkMobile = function (req, res, next) {
    var ua = req.headers['user-agent'];

    res.locals.$ = res.locals.$ ? res.locals.$ : {};

    if (/mobile/i.test(ua))
        res.locals.$.Mobile = true;

    if (/like Mac OS X/.test(ua)) {
        res.locals.$.iOS = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua)[2].replace(/_/g, '.');
        res.locals.$.iPhone = /iPhone/.test(ua);
        res.locals.$.iPad = /iPad/.test(ua);
    }

    if (/Android/.test(ua))
        res.locals.$.Android = /Android ([0-9\.]+)[\);]/.exec(ua)[1];

    if (/webOS\//.test(ua))
        res.locals.$.webOS = /webOS\/([0-9\.]+)[\);]/.exec(ua)[1];

    if (/(Intel|PPC) Mac OS X/.test(ua))
        res.locals.$.Mac = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(ua)[2].replace(/_/g, '.') || true;

    if (/Windows NT/.test(ua))
        res.locals.$.Windows = /Windows NT ([0-9\._]+)[\);]/.exec(ua)[1];

    next();
};
exports.log = function (req, res) {
    res.render('log', {
        session: req.session,
        login:req.session.login,
        config: config,
        i18n: i18n[getLang(req)],
        navbar: 'default'
    });
};
exports.terminal = function (req, res) {
    res.render('terminal', {
        session: req.session,
        login:req.session.login,
        config: config,
        i18n: i18n[getLang(req)],
        navbar: 'fixed'
    });
};
exports.index = function (req, res) {
        //stuff.log('index', req.socket);
        fs.readdir(config.wikiRoot, function(err, folders) {
            var pages = [],
                i = 0;

            if (folders) {
                folders.forEach(function(folder) {
                    if(folder!='index.wiki')
                        pages[i++] = { path: folder, name: folder};
                });
                fs.readFile(config.wikiRoot + 'index.wiki', config.encoding, function (err, indexText) {
                    indexText = md(indexText);
                    res.render('index', {
                        session: req.session,
                        login:req.session.login,
                        pages: pages,
                        text: indexText,
                        config: config,
                        i18n: i18n[getLang(req)],
                        navbar: 'default'
                    });
                });
            } else {
                notFound(req, res); return;
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
        req.session.nightMode = config.nightMode;
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
exports.removeFile = function (req, res) {
    var url = req.params[0] + '.' + req.params[1];

    fs.unlink(config.wikiRoot + url ,function (err) {
        if (err) throw err;
        res.redirect('/wiki');
    });
};
exports.sendFile = function (req, res) {
    var url = req.params[0] + '.' + req.params[1];

    res.sendfile(config.wikiRoot + url);
};
exports.getWikiPage = function (req, res) {
    var url = req.params[0],
        fileName = stuff.getLastDirOfPath(url),
        path = config.wikiRoot + url + '/' + fileName + config.wikiFormat;

    fs.readFile(path, config.encoding, function (err, content) {
        if (err) {
            notFound(req, res); return;
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
                if (!res.locals.$.iOS) {
                    res.render('wiki', {
                        session: req.session,
                        page: page,
                        login: req.session.login,
                        config: config,
                        navbar: 'default',
                        i18n: i18n[getLang(req)]
                    });
                } else {
                    res.render('ios-wiki', {
                        session: req.session,
                        page: page,
                        login: req.session.login,
                        config: config,
                        navbar: 'default',
                        i18n: i18n[getLang(req)]
                    });
                }
            });
        });
    });
};
exports.getWikiHistory = function (req, res) {
    var path,
        url = req.params[0];
    if (!req.query.file) {
        path = config.wikiRoot + url + '/.wiki/';
        fs.readdir(path, function (err, files) {
            var fileNameArr = [],
                filesContent = {};

            //no history
            if(!files) {
                notFound(req, res);
                return;
            }
            files.forEach(function(filename, index) {
                var timestamp = filename.replace('.wiki', ''),
                    date = new Date(+timestamp),
                    time = date.getDate() + '.' + (date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0'+(date.getMonth() + 1)) + '.' + date.getFullYear() +
                        ' ' + date.getHours() + ':' + date.getMinutes();

                fileNameArr.push(timestamp);
                fs.readFile(path + filename, config.encoding, function(err, content) {
                    filesContent[timestamp] = content;
                    if (index == files.length - 1) {
                        res.render('history', {
                            session: req.session,
                            fileNameArr: fileNameArr,
                            filesContent: filesContent,
                            login: req.session.login,
                            config: config,
                            navbar: 'default',
                            time: time,
                            i18n: i18n[getLang(req)]
                        });
                    }
                });
            });
        });
    } else {
        path = config.wikiRoot + url + '/.wiki/' + req.query.file + '.wiki';
        fs.readFile(path, config.encoding, function (err, content) {
            res.render('file-history', {
                session: req.session,
                login: req.session.login,
                config: config,
                navbar: 'default',
                text: md(content),
                i18n: i18n[getLang(req)],
                filename: url.split('/')[url.split('/').length - 1]
            });
        });
    }
};
exports.wiki = function (req, res) {
    if (req.query.z == 'history') {
        exports.getWikiHistory(req, res);
    } else {
        exports.getWikiPage(req, res);
    }
};
exports.nightMode = function (req, res) {
    req.session.nightMode = !req.session.nightMode;
    res.send(req.session.nightMode);
};
exports.favicon = function (req, res) {
    //res.redirect('/static/favicon.ico');
};
