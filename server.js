var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    fs = require('fs'),
    config = require('./config').config;
    io = require('socket.io').listen(server),
    handlers = require('./handlers'),
    ioHandlers = require('./handlers.io.js');

global.config = config;
app
    .enable('trust proxy')
    .set('views',__dirname + '/views')
    .set('view engine', 'jade')
    .use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }))
    .use(function(req, res, next){
        console.log('%s %s', req.method, req.url);
        next();
    })
    .use(express.cookieParser('121'))
    .use(express.cookieSession('121'))
    .use(express.bodyParser())
    .use('/static', express.static('static'))

    .get('/', handlers.checkAuth, handlers.index)
    .get('/log', handlers.checkAuth, handlers.log)
    .get('/nightmode', handlers.checkAuth, handlers.nightMode)
    .get('/logout', handlers.logout)
    .get('/login', handlers.login)
    .get(/wiki\/?$/, handlers.checkAuth, handlers.index)
    .get('/terminal', handlers.checkAuth, handlers.terminal)
    .get('/favicon.ico', handlers.favicon)
    //files
    .get(/wiki\/(.+)\.(.*)$/, handlers.checkAuth, handlers.sendFile)
    //rm files
    .get(/remove\/(.+)\.(.*)$/, handlers.checkAuth, handlers.removeFile)
    .get(/wiki\/(.*)/, handlers.checkAuth, handlers.checkMobile, handlers.wiki)
    .post('/', handlers.auth)
    .post('/upload', handlers.checkAuth, handlers.upload);


io
    .set('log level', 1)
    .sockets.on('connection', ioHandlers.handlers);

server.listen(config.port);
console.log('Server works at http://' + config.host + ':' + config.port);
