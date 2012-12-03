var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	engine = require('ejs-locals'),
	ejs = require('ejs'),
	port = 3000,
	count = 0,
	io = require('socket.io').listen(server);
	db = require('./db'),
	handlers = require('./handlers');

//req.params.id
io.set('log level', 1);
server.listen(port);
app.enable('trust proxy');
app.engine('ejs', engine);
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.use(function(a) {
	if (a.url != '/favicon.ico' && a.url.indexOf('/static/')<0 || a.method=='POST') {
		count++;
		console.log('Запрос #'+ count +' на http://localhost:' + port + a.url + ' методом  ' + a.method);
		console.log('');
	}
	a.next();
});

app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
}));
app.use(express.cookieParser('121'));
app.use(express.cookieSession('121'));
app.use(express.bodyParser());
app.use('/static', express.directory('static'));
app.use('/static', express.static('static'));




app.get('/', handlers.index);

app.get('/logout', handlers.logout);

app.get('/login', handlers.login);

app.get('/wiki/:id', handlers.index);

app.post('/', handlers.auth);

io.sockets.on('connection', function (socket) {
  console.log('Новый транспорт #', socket.id);

  socket.on('saveWikiPage', function (page) {
  	db.articles.find({id: page.id}, function(pages) {
  		pages[0].header = page.header;
  		pages[0].text = page.text;
  		pages[0].save(function (error, copy) {
  			if (error)
  				console.log(error);

  			socket.emit('wikiPageSaved', page.timeout);
  		});
  	});
  });

  socket.on('newWikiPage', function (data) {
  	var page = new db.articles(data);
  	page.save(function (err, copy) {
	    if (!err) {
	        console.log('Новая вики страница #' + page.id);
	        socket.emit('newWikiPageSave', { id : page.id, timeout: data.timeout});
	    }
	});
  });

  socket.on('getWikiPage', function(data) {
	console.log('запрос wiki страницы #' , data.id);
  	db.articles.find({ id : data.id}, function (article) {
  		article = article[0];
  		db.articles.find({parent: article.id}, function(children) {
  			db.articles.getTree(article, [], function(breadCrumbs) {
  				article.breadCrumbs = breadCrumbs;
  				if (children) {
	  				article.children = [];
		  			for (var i = children.length - 1; i >=  0; i--) {
		  				article.children[i] = {}
		  				article.children[i].header = children[i].header;
		  				article.children[i].id = children[i].id;
		  			};
	  			}
	  			article.timeout = data.timeout;
	  			socket.emit('buildWikiPage', article);
  			});
  		});
  	});
  });

  socket.on('disconnect', function () {
  	console.log('Отключился транспорт');
   });
});



console.log('Приложение работает по адресу http://localhost:' + port);

