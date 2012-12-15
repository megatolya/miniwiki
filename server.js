var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    engine = require('ejs-locals'),
    ejs = require('ejs'),
    fs = require('fs'),
    config = require('./config').config;
    io = require('socket.io').listen(server),
    handlers = require('./handlers'),
    ioHandlers = require('./handlers.io.js');

app
    .enable('trust proxy')
    .engine('ejs', engine)
    .set('views',__dirname + '/views')
    .set('view engine', 'ejs')
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
    .use('/static', express.directory('static'))
    .use('/static', express.static('static'))

    .get('/', handlers.index)
    .get('/log', handlers.log)
    .get('/logout', handlers.logout)
    .get('/login', handlers.login)
    .get('/wiki', handlers.index)
    .get('/tree', handlers.tree)
    .get('/favicon.ico', handlers.ololo)
    .get('*', handlers.wiki)
    .post('/', handlers.auth)
    .post('/upload', handlers.upload);

io.set('log level', 1);
io.sockets.on('connection', ioHandlers.handlers);

server.listen(config.port);
console.log('Приложение работает по адресу http://' + config.host + ':' + config.port);
