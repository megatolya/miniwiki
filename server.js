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

app.enable('trust proxy');
app.engine('ejs', engine);
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
}));
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});
app.use(express.cookieParser('121'));
app.use(express.cookieSession('121'));
app.use(express.bodyParser());
app.use('/static', express.directory('static'));
app.use('/static', express.static('static'));

app.get('/', handlers.index);
app.get('/log', handlers.log);
app.get('/logout', handlers.logout);
app.get('/login', handlers.login);
app.get('/wiki', handlers.index);
app.get('/tree', handlers.tree);
app.post('/', handlers.auth);
app.post('/upload', handlers.upload);
app.get('/favicon.ico', handlers.ololo);
app.get('*', handlers.wiki);

io.set('log level', 1);
io.sockets.on('connection', ioHandlers.handlers);

server.listen(config.port);
console.log('Приложение работает по адресу http://localhost:' + config.port);
