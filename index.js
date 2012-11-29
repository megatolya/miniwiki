var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	engine = require('ejs-locals'),
	ejs = require('ejs'),
	port = 3000,
	count = 0,
	io = require('socket.io').listen(server);
	db = require('./db');
	sys = require('sys');

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



app.get('/', function (req, res) {


	if (req.session.user) {
		db.articles.find({parent:0}, function (articles) {
			res.render('index', {login:req.session.login, articles: articles});
		});
	}
	else{
		res.redirect('/login');
	}

});

app.get('/logout', function (req, res) {
	req.session = null;
	res.redirect('/');
});

app.get('/login', function (req, res) {
	res.render('login');
});

app.get('/wiki/:id', function(req, res) {
	res.json({resp: req.params.id});
})

app.post('/', function (req, res){
	console.log('Запрос на авторизацию пользователя ' + req.body.login);
	db.users.find({
		login: req.body.login,
		password: req.body.pass
	}, function (users) {
		if(!users){
			res.redirect('/login');
			console.log('Неверные данные');
			return false;
		}
		req.session = { user: users[0].id, login:users[0].login };
		console.log('Залогинился ' + req.body.login);
		res.redirect('/');
	});

});

io.sockets.on('connection', function (socket) {
  console.log('Новый транспорт #', socket.id);
  socket.on('getWikiPage', function(data) {
	console.log('запрос wiki страницы #' , data.id);
  	db.articles.find({ id : data.id}, function (article) {
  		article = article[0];
  		db.articles.find({parent: article.id}, function(children) {
  			db.articles.getTree(article, [], function(breadCrumbs) {
  				article.breadCrumbs = breadCrumbs;
  				if (children) {
	  				article.children = [];
		  			for (var i = 0; i <= children.length - 1; i++) {
		  				article.children[i] = {}
		  				article.children[i].header = children[i].header;
		  				article.children[i].id = children[i].id;
		  			};
	  			}
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

