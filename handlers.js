exports.index = function (req, res) {
	if (req.session.user) {
		db.articles.find({parent:0}, function (articles) {
			res.render('index', {login:req.session.login, articles: articles});
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

};

